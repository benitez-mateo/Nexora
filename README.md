# Nexora Workspace

Centro de datos colaborativo para PYME — Next.js 14 (App Router) + Tailwind CSS + GSAP.

Implementación de producción del prototipo de Claude Design (`design-extract/nexora/`).

## Quickstart

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

Scripts:

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servir build
- `npm run lint` — ESLint
- `npm run type-check` — `tsc --noEmit`

## Estructura

```
app/
  layout.tsx          # Tipografías (Bodoni Moda, JetBrains Mono, Inter), providers
  page.tsx            # Ruta raíz → Workspace
  globals.css         # Variables CSS, tokens de tema (light + .dark), utilidades

lib/
  types.ts            # Step, ChatMessage, Project, Theme
  data.ts             # Datos iniciales del proyecto Zenith
  theme-provider.tsx  # Contexto de tema con persistencia en localStorage
  workspace-context.tsx
                      # Estado y lógica de negocio (procesamiento secuencial,
                      # mensajería, alerta de retraso)
  gsap.ts             # Re-export con plugin useGSAP registrado
  utils.ts            # Helpers (cn, iniciales, paleta de avatares)

components/
  primitives/
    Avatar.tsx
    DateMono.tsx
    ProgressRing.tsx
    StepStatusBadge.tsx
    Toast.tsx
  workspace/
    Workspace.tsx       # Composición de la pantalla
    Sidebar.tsx         # Navegación + toggle Modo Claro/Oscuro
    NexoraLogo.tsx
    Header.tsx
    BellMenu.tsx
    TitleBlock.tsx
    DelayAlert.tsx      # Popover azul con difusión al chat
    SequentialSteps.tsx
    StepCard.tsx
    BottomRow.tsx       # Actividad / Métricas / Carga de trabajo
  chat/
    ChatPanel.tsx       # Panel lateral con animación GSAP
    Message.tsx
```

## Lógica de negocio

### Procesamiento secuencial

`lib/workspace-context.tsx` implementa la máquina de estados:

- Estados: `pending → active → completed`. Una fase puede ramificar a `delayed` y volver.
- Solo la fase con foco (`active` o `delayed`) puede completarse.
- Al completar, la siguiente fase `pending` se activa automáticamente con 5% de progreso.
- Las fases `pending` posteriores al foco están bloqueadas en la UI (`StepCard` recibe `locked`).

### CRUD de fases

El plan secuencial es configurable en runtime — el equipo puede ajustar el paso a paso según la estrategia del proyecto:

- `addStep(draft, after?)` — inserta una fase nueva (al final o después de una específica) en estado `pending`.
- `updateStep(id, draft)` — edita título, subtítulo, fecha, etiqueta y entregables.
- `removeStep(id)` — elimina; si era la fase con foco, el foco salta automáticamente a la siguiente.
- `moveStep(id, 'up' | 'down')` — reordena. La numeración (`01`, `02`, …) se recalcula sola.
- UI: botón **+ Añadir fase** en la cabecera de la sección + íconos `↑ ↓ ✎` que aparecen al hacer hover sobre cada tarjeta. El editor (`StepEditor`) es un modal con confirmación de eliminación.

### Sistema de alertas

- `markStepDelayed(id)` cambia el estado y emite un toast.
- `broadcastDelayAlert()` marca la fase con foco como retrasada **y** publica un mensaje destacado al chat solicitando apoyo del equipo, citando la fase y la fecha de entrega. Abre el panel de chat si está cerrado.

### Mensajería

- `sendMessage(text)` añade un mensaje propio y simula respuesta del equipo (typing indicator → respuesta aleatoria).
- Los mensajes con `alert: true` reciben tratamiento visual destacado (gradiente cobalto, sombra).

## Estética y modo oscuro

- Tipografía: **Bodoni Moda** (display serif editorial) + **JetBrains Mono** (datos técnicos) + **Inter** (UI).
- Paleta "Naturaleza Destilada" en claro (azul piedra `#E8EEFB`); OLED + antracita en oscuro (`#050505`/`#111111`).
- Acentos "Dopamina": cobalto `#1B3DFF` (progreso) + rosa neón `#FF3D8A` (retrasos).
- Modo oscuro vía `class` strategy de Tailwind (`darkMode: 'class'`); las variables CSS conmutan en `.dark`. Persistente con `localStorage` y respeta `prefers-color-scheme` en primera visita.
- Contraste AA preservado: ink `#F4F0E5` sobre `#050505` ≈ 17:1; cobalto `#6E8BFF` sobre `#050505` ≈ 8:1.

## Animaciones (GSAP)

`@gsap/react` + `gsap` se cargan vía `lib/gsap.ts`. Animaciones implementadas:

- **Apertura del chat**: slide-in lateral con fade (`ChatPanel.tsx`).
- **Cambio de fase secuencial**: micro-rebote de la tarjeta enfocada (`SequentialSteps.tsx`).
- **Hover de tarjetas**: lift suave (`StepCard.tsx`).
- **Anillos de progreso**: animación de `strokeDashoffset` al actualizar (`ProgressRing.tsx`, `StepCard.tsx`).
- **Botón de avance**: rotación + escala en hover.
- **Toast**: entrada/salida cubic-bezier (`Toast.tsx`).
- **Popover de alerta**: fade + scale (`DelayAlert.tsx`).

## Persistencia y multi-pestaña

`lib/persistence.ts` define una interfaz `PersistenceAdapter` y la implementación `LocalStorageAdapter` que se usa por defecto:

- **Carga**: el estado se hidrata desde `localStorage` al montar el provider; si no hay snapshot válido, se usa `INITIAL_PROJECT`.
- **Guardado**: cada cambio en `steps`, `messages` o `activeStepId` persiste el snapshot completo (con `version` y `updatedAt`).
- **Sync entre pestañas**: el adapter escucha el evento `storage` y reaplica snapshots con `updatedAt` posterior al último guardado local. Abre dos pestañas y verás los cambios reflejarse en tiempo real entre ellas.
- **Reset**: `resetWorkspace()` borra el snapshot y vuelve a los datos iniciales.

Para migrar a un backend real (Supabase, Postgres + Server Actions, etc.) se implementa un nuevo adapter contra la misma interfaz y se reemplaza la export `persistence` — el resto del código no cambia.

## Responsive

- **≥ 1024 px (lg)**: layout completo, sidebar fija a la izquierda, chat panel fijo a la derecha.
- **< 1024 px**: la sidebar se convierte en drawer (botón hamburguesa en `Header`); el chat se vuelve overlay full-screen con backdrop. La cabecera de usuario colapsa a solo avatar.
- **< 768 px (md)**: la sección "Actividad / Métricas / Carga" pasa a 1-2 columnas. El título del proyecto baja a 40 px mínimo.
- Implementado con `useMediaQuery` (`lib/use-media-query.ts`) para JS-driven breakpoints + clases `lg:` `md:` de Tailwind para CSS-driven.

## Accesibilidad

- **`prefers-reduced-motion`**: globalmente desactivamos transiciones y animaciones CSS (`globals.css`); las animaciones GSAP usan los wrappers `safeTo` / `safeFromTo` (`lib/gsap.ts`) que saltan al estado final cuando el usuario lo prefiere.
- Modales con cierre por `Esc`, focus rings cobalto, `aria-label` en botones de íconos, navegación por teclado en step cards (`tabIndex` + `aria-disabled`).

## Escalabilidad

- App Router permite añadir rutas para área privada (`app/(client)/...`), pasarelas de pago (`app/(billing)/...`) y dashboards adicionales sin tocar la pantalla actual.
- El estado vive en contextos por dominio (`theme-provider`, `workspace-context`); añadir un `auth-context` o `billing-context` sigue el mismo patrón.
- Los componentes son puros y receptivos al contexto — listos para conectarse a una API real reemplazando los `useState` iniciales en `workspace-context.tsx` por fetchers (TanStack Query, server actions, etc.).
- Tokens de diseño centralizados en CSS variables → cambiar paleta o tema no requiere tocar componentes.
