# Despliegue de Nexora · Paso a paso

Esta guía te lleva desde "tengo el código en mi máquina" hasta "mis compañeros pueden abrir la app, registrarse e instalarla en su teléfono".

Hay **3 fases**. Hazlas en orden.

---

## Fase 1 — Crear el proyecto en Supabase (10 min)

Supabase nos da el sistema de autenticación (registro, login, sesión persistente). Sin esto, cada compañero solo podría usar la app en el navegador donde se registró.

1. **Crea una cuenta** en <https://supabase.com> con tu correo o GitHub. Es gratis.
2. En el dashboard pulsa **"New project"**.
3. Rellena:
   - **Name**: `nexora` (lo que quieras)
   - **Database password**: genera una y guárdala en un sitio seguro (no la vas a usar en la app, pero Supabase la pide).
   - **Region**: elige la más cercana a ti / tu equipo (`South America (São Paulo)` si estás en Sudamérica).
   - Plan **Free**.
4. Espera 1-2 minutos a que se aprovisione.
5. Cuando entre al dashboard del proyecto, ve a **Project Settings → API**. Copia:
   - `Project URL` (algo como `https://xxxxx.supabase.co`)
   - `Project API keys → anon / public` (un JWT largo que empieza con `eyJ...`)

   Guárdalos, los vas a usar en las dos siguientes fases.

6. Configura el **registro de correo**. En el menú izquierdo:
   - **Authentication → Providers → Email**: déjalo activado.
   - **Authentication → Sign In / Up → User Signups**: activa "Allow new users to sign up".
   - **(Opcional pero recomendado para pruebas rápidas)** Desactiva la confirmación por correo: ve a **Authentication → Sign In / Up → Email** y desactiva **"Confirm email"**. Así tus compañeros pueden registrarse y entrar al toque sin abrir su correo.
     > Si lo dejas activado, cada nuevo usuario recibirá un mail de Supabase con un enlace de confirmación antes de poder iniciar sesión. La app les muestra el aviso correspondiente.

---

## Fase 2 — Probar en local con Supabase (5 min)

1. En la raíz del proyecto, copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```
   En Windows PowerShell:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```
2. Abre `.env.local` y pega los dos valores de Supabase (Project URL y anon key).
3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre <http://localhost:3000>. Verás la pantalla de login. El subtítulo debería decir **"Tu cuenta se guarda en la nube..."**, eso confirma que detectó Supabase.
5. Pulsa **Crear cuenta**, regístrate con un correo cualquiera y una contraseña de 6+ caracteres.
6. En el dashboard de Supabase, abre **Authentication → Users**. Deberías ver tu usuario recién creado.

✅ Si llegaste aquí, el backend ya está conectado.

> Si el subtítulo sigue diciendo "Modo local", vuelve a revisar el `.env.local` (sin espacios, sin comillas) y reinicia `npm run dev`.

---

## Fase 3 — Subir a Vercel y compartir (10 min)

Vercel hostea Next.js gratis y soporta PWA out-of-the-box.

### 3.1 Sube el código a GitHub

1. Crea un repo nuevo en <https://github.com/new> (privado o público, da igual). Llamémoslo `nexora`.
2. En la raíz del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/nexora.git
   git push -u origin main
   ```
   > El `.gitignore` ya excluye `.env.local`, `node_modules` y `.next` — no se suben tus claves.

### 3.2 Importa en Vercel

1. Crea cuenta en <https://vercel.com> con GitHub.
2. **Add New → Project** → selecciona el repo `nexora` → **Import**.
3. En la pantalla de configuración Vercel detecta Next.js solo. Antes de pulsar Deploy, expande **Environment Variables** y añade:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (tu Project URL) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (tu anon key) |

4. Pulsa **Deploy**. Tarda ~2 min. Te dará una URL como `https://nexora-tres.vercel.app`.

### 3.3 Avisa a Supabase de la URL de producción

Para que el correo de confirmación (si lo activaste) y los redirects funcionen:

1. Vuelve a Supabase → **Authentication → URL Configuration**.
2. **Site URL**: `https://tu-dominio.vercel.app`
3. **Redirect URLs**: añade `https://tu-dominio.vercel.app/**` y `http://localhost:3000/**`.

### 3.4 Comparte con tus compañeros

- Pásales la URL de Vercel.
- Que entren, pulsen **Crear cuenta** y se registren con correo + contraseña.
- En el teléfono Android: Chrome → menú → **Añadir a pantalla de inicio**.
- En iPhone: Safari → botón compartir → **Añadir a pantalla de inicio**.
  Una vez instalada queda como app independiente, sin barras del navegador.

---

## Cómo funciona la PWA

- `app/manifest.ts` define el nombre, colores y íconos.
- `app/icon.tsx` y `app/apple-icon.tsx` generan los íconos al vuelo (no necesitas archivos PNG).
- `public/sw.js` es un service worker que cachea la shell de la app para que abra rápido y soporte modo avión básico.
- `components/pwa/ServiceWorkerRegister.tsx` lo registra solo en producción (no en `npm run dev`, así no estorba al desarrollar).

Para probar el modo PWA en local **necesitas hacer build de producción**:

```bash
npm run build
npm start
```

Luego abre `http://localhost:3000` en Chrome → Lighthouse → marca "Progressive Web App" → Run audit.

---

## Comandos útiles

```bash
npm run dev          # desarrollo (localhost:3000)
npm run build        # build de producción
npm start            # arrancar el build de producción
npm run type-check   # validar tipos sin compilar
npm run lint         # ESLint
```

---

## Limitaciones de esta versión

Lo que **sí** hace esta versión:

- ✅ Cada usuario se registra y entra desde cualquier dispositivo.
- ✅ Cada usuario tiene sus propios proyectos guardados en su navegador (`localStorage`).
- ✅ Funciona offline una vez cargada (service worker).
- ✅ Se instala como app en móvil.

Lo que **no** hace todavía (sería una fase 2):

- ❌ **No** sincroniza proyectos entre compañeros. Si Diego crea un proyecto, Ana no lo ve. Cada uno tiene su propia copia local.
- ❌ El chat es local también (las respuestas son automáticas).

Cuando confirmes que la app funciona y que tus compañeros pueden registrarse, dime y migramos los proyectos a Supabase también para que todos vean lo mismo en tiempo real.

---

## Problemas comunes

**"El login dice 'Correo o contraseña incorrectos' pero estoy seguro de los datos"**
- Si activaste "Confirm email" en Supabase, primero abre el correo y haz clic en el enlace. Hasta entonces no puedes entrar.

**"Vercel falla con 'Failed to compile'"**
- Verifica que las dos variables de entorno estén en la pestaña Environment Variables de Vercel.
- Borra `node_modules` y `.next` localmente, `npm install` y `npm run build`. Si pasa local, debería pasar en Vercel.

**"No puedo instalar la PWA en el teléfono"**
- Solo funciona desde HTTPS. Vercel ya da HTTPS gratis. En `localhost` también funciona porque Chrome lo permite.
- En iPhone solo se instala desde Safari (no Chrome).

**"Cambié algo en Supabase y la app no responde"**
- Las variables `NEXT_PUBLIC_*` se compilan en el build. Si cambias la URL, tienes que rebuildear (Vercel lo hace solo al pushear a `main`).
