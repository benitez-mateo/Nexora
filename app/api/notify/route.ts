import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import webpush from "web-push";

// Forzamos el runtime de Node (web-push usa APIs nativas).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Inicialización perezosa: solo se ejecuta cuando entra la primera request,
 * no durante el `next build`. Así una clave malformada no rompe el deploy.
 */
let vapidConfigured = false;
function ensureVapid(): { ok: boolean; error?: string } {
  if (vapidConfigured) return { ok: true };
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return { ok: false, error: "VAPID keys no configuradas en el servidor." };
  }
  // Sanitizamos: web-push rechaza padding `=` y espacios.
  const pub = VAPID_PUBLIC.trim().replace(/=+$/, "");
  const priv = VAPID_PRIVATE.trim().replace(/=+$/, "");
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, pub, priv);
    vapidConfigured = true;
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `VAPID inválidas: ${err.message}`
          : "VAPID inválidas",
    };
  }
}

interface PushSubRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotifyBody {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** No mandar a este usuario (típicamente el que dispara la notif). */
  excludeUserId?: string;
}

export async function POST(req: Request) {
  const vapidCheck = ensureVapid();
  if (!vapidCheck.ok) {
    return NextResponse.json(
      { ok: false, error: vapidCheck.error },
      { status: 503 },
    );
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE) {
    return NextResponse.json(
      { ok: false, error: "Service role key no configurada." },
      { status: 503 },
    );
  }

  // 1. Validamos el JWT del caller con el anon client.
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Falta autorización." },
      { status: 401 },
    );
  }

  const anonClient = createClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
  const { data: userRes, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return NextResponse.json(
      { ok: false, error: "JWT inválido." },
      { status: 401 },
    );
  }
  const callerId = userRes.user.id;

  // 2. Parseamos el body.
  let body: NotifyBody;
  try {
    body = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body inválido." },
      { status: 400 },
    );
  }
  if (!body.title) {
    return NextResponse.json(
      { ok: false, error: "Falta título." },
      { status: 400 },
    );
  }

  // 3. Leemos las suscripciones con service role (bypass RLS).
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const exclude = body.excludeUserId ?? callerId;
  const { data: subs, error: subsErr } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .neq("user_id", exclude);

  if (subsErr) {
    return NextResponse.json(
      { ok: false, error: subsErr.message },
      { status: 500 },
    );
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, recipients: 0 });
  }

  // 4. Mandamos en paralelo, recolectamos las muertas para purgar.
  const payload = JSON.stringify({
    title: body.title.slice(0, 100),
    body: body.body?.slice(0, 250) ?? "",
    url: body.url ?? "/",
    tag: body.tag ?? "nexora",
  });

  const deadEndpoints: string[] = [];
  let sent = 0;

  await Promise.all(
    (subs as PushSubRow[]).map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          payload,
          { TTL: 60 * 60 },
        );
        sent++;
      } catch (err) {
        const status =
          (err as { statusCode?: number })?.statusCode ?? undefined;
        if (status === 404 || status === 410) {
          // Suscripción muerta — purgar.
          deadEndpoints.push(s.endpoint);
        } else {
          console.error("Push send failed:", status, err);
        }
      }
    }),
  );

  if (deadEndpoints.length > 0) {
    await admin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", deadEndpoints);
  }

  return NextResponse.json({
    ok: true,
    sent,
    recipients: subs.length,
    purged: deadEndpoints.length,
  });
}
