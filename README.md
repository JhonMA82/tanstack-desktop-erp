# tanstack-desktop-erp

Boilerplate reutilizable de aplicación de escritorio ERP construido con **Vite + React + TanStack** (Router, Query, Table), con un design system inspirado en la UI de Blender replicada desde `Blender-Pro-Lab.html`: paneles oscuros, acento naranja, tipografía Inter + JetBrains Mono, **top bar con Quick Access Toolbar e iconos SVG**, menú de módulos, **ribbon tipo Blender colapsable por módulo**, outliner lateral colapsable, inspector derecho, command palette (Ctrl+K) y status bar con progress sweep.

El módulo **Dashboard** está migrado como ejemplo escalable del patrón completo (datos → TanStack Query → componentes → ruta); el resto de módulos son placeholders navegables que documentan cómo migrarlos. La página **UI Kit** (`/ui-kit`) reúne todos los widgets reutilizables del design system: tokens, botones, badges, la galería de iconos, formularios simple y complejo, modales, toasts, progress, tabs, métricas y una tabla de ejemplo. Incluye además tres widgets de dashboard administrativo **inspirados en [arhamkhnz/tanstack-shadcn-admin-dashboard](https://github.com/arhamkhnz/tanstack-shadcn-admin-dashboard/tree/main/src/routes/%28main%29/dashboard/default)** — metric cards, performance overview (chart SVG con selects de periodo/segmento) y subscriber overview (toolbar + tabla paginada con 60 clientes) — reimplementados sin dependencias nuevas en estilo Blender. El módulo **Invoice** (`/invoice`) reproduce el [ejemplo de facturación del mismo repo](https://github.com/arhamkhnz/tanstack-shadcn-admin-dashboard/tree/main/src/routes/%28main%29/dashboard/invoice): pestañas, datos del documento y del cliente, líneas editables con reordenado, impuesto y descuento con totales en vivo, y preview de la hoja imprimible (el diálogo de impresión emite solo el papel). Todo con los primitivos del design system y sin dependencias nuevas.

## Stack

| Paquete | Versión exacta | Papel |
|---|---|---|
| vite | 8.3.0 | dev server y bundler de producción |
| react / react-dom | 19.3.0 | runtime de UI |
| @tanstack/react-router | 1.170.38 | rutas file-based tipadas con code splitting |
| @tanstack/react-query | 5.103.2 | estado de servidor: caché, loading y error |
| @tanstack/react-table | 9.2.4 | tablas headless (features composables, v9) |
| zod | 4.6.7 | contratos de datos: valida respuestas HTTP y fixtures |
| tailwindcss + @tailwindcss/vite | 4.3.3 | utilidades CSS y tokens vía `@theme inline` |
| typescript | 7.0.2 | chequeo de tipos (`tsc --noEmit`) |
| @biomejs/biome | 2.5.14 | linter + formateador |
| bun | 1.4.0 | gestor de paquetes, scripts y tests |

Todas las versiones están **fijadas en exacto** (sin `^`, `~` ni `latest`); el catálogo con licencia verificada vive en `catalog/dependencies.json`. `bun.lock` y `routeTree.gen.ts` se generan con herramientas: **nunca** se editan a mano.

## Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | dev server (Vite, Ctrl+K para la paleta) |
| `bun run build` | build de producción en `dist/` |
| `bun run preview` | sirve el build de producción |
| `bun run lint` | `biome ci .` (formato + lints, falla en CI) |
| `bun run format` | `biome check --write .` (aplica fixes seguros) |
| `bun run hooks:install` | activa el hook pre-commit de `.githooks` (también lo hace `bun install`) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun test` | tests unitarios (bun test) |

## Estructura

```
src/
├── components/
│   ├── ui/             # primitivos sin lógica de negocio
│   │                   #   Button · Badge · StatusBadge · Panel · Input · Metric · DataTable · Icon
│   │                   #   Field · Select · Textarea · Checkbox · Switch · Slider · Modal · Tabs
│   │                   #   ProgressBar · DropZone · Menu (trigger + panel portaled)
│   ├── uikit/          # secciones del showcase /ui-kit (tokens, forms, modals, admin widgets…)
│   │                   #   MetricCards · PerformanceOverview · SubscriberOverview (ref: shadcn-admin)
│   ├── layout/         # TopBar (QAT+search), ModuleMenu (tabs+collapse), Ribbon (grupos por
│   │                   #   módulo), AppShell, Outliner, PropertiesPanel, ViewportHeader,
│   │                   #   StatusBar, shell-context (tema/paleta/ribbon/period/view)
│   ├── palette/        # CommandPalette (Ctrl+K) + registry de comandos
│   ├── feedback/       # ToastProvider + ToastViewport (SUCCESS/INFO/WARN/ERROR)
│   ├── dashboard/      # widgets del módulo Dashboard (MetricsGrid, RevenueWaveform, …)
│   ├── invoice/        # ejemplo /invoice: composer editable + paper imprimible (ref: shadcn-admin)
│   └── ModulePlaceholder.tsx
├── config/app.ts       # marca (APP) y empresa (COMPANY): el shell no conoce el dominio
├── data/               # recursos: fixtures + schema zod + queryOptions (dashboard, invoice,
│   │                   #   admin-dashboard, system) — origen mock o HTTP según entorno
├── lib/                # utilidades puras e infraestructura sin React: cn, format, modules
│   │                   #   (fuente única), ledger, icons, invoice (fechas, líneas, descuento,
│   │                   #   impuesto y totales), api (getJson + ApiError) y env (VITE_DATA_SOURCE)
├── routes/             # rutas file-based; routeTree.gen.ts lo genera el plugin de Vite
├── styles/index.css    # tokens @theme + tema oscuro (.root) y claro (.root.light)
└── main.tsx            # QueryClient en el router (context) + boundaries + render
```

Regla de capas: `routes` compone (y espera sus datos en el `loader`) → `components/<módulo>` presenta → `data` provee el contrato (`zod` + `queryOptions`) → `lib` contiene lógica pura e infraestructura sin React. Los primitivos de `ui/` nunca importan de `data/` ni conocen módulos concretos; el shell lee marca y empresa de `config/`.

Los botones del ribbon aceptan `menu` (`MenuItem[]`): el cuerpo sigue ejecutando la acción y un chevron `▾` en la esquina del icono abre las variantes. `ui/Menu` las pinta en un portal porque el ribbon vive en un `overflow-x-auto` que recortaría un panel en flujo (detalle en `SPEC.md`).

Fuera de `src/`: `.github/workflows/ci.yml` (typecheck · lint · test · build en cada push y PR), `.githooks/pre-commit` (biome solo sobre lo staged), `catalog/dependencies.json` (versión y licencia verificadas), `LICENSE` (MIT) y `SPEC.md` (decisiones de arquitectura).

## Design system

Tokens definidos en `src/styles/index.css` y expuestos a Tailwind v4 mediante `@theme inline` (clases como `bg-panel`, `text-ink-dim`, `border-border`, `text-orange`):

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0E0E0E` | `#D5D5D5` |
| `--panel` / `--panel2` / `--panel3` | `#1E1E1E` / `#252525` / `#2A2A2A` | `#EAEAEA` / `#E0E0E0` / `#D8D8D8` |
| `--panel-out` | `#1A1A1A` | `#DEDEDE` |
| `--border` / `--borderL` | `#323232` / `#3A3A3A` | `#B8B8B8` / `#9A9A9A` |
| `--text` / `--text-dim` / `--text-bright` | `#CCCCCC` / `#7A7A7A` / `#EEEEEE` | `#222222` / `#6A6A6A` / `#111111` |
| `--orange` `--blue` `--red` `--green` | `#FF8C32` `#4C8CFF` `#FF4444` `#3DDC84` | (idem) |

El tema se aplica con la clase `light` en `<html>` (persistida en `localStorage` bajo `erp-theme`) y se alterna desde el menú, el inspector o el comando `TOGGLE DARK MODE` de la paleta. Las tipografías (Inter, JetBrains Mono) se cargan desde Google Fonts en `index.html` con fallbacks de sistema.

## Cómo añadir un módulo

1. **Registrar** el módulo en `src/lib/modules.ts` (`id`, `label`, `count`, `path`, `description`). Aparece solo en el menú superior, el outliner y la paleta.
2. **Crear la ruta** `src/routes/<id>.tsx` con `createFileRoute("/<id>")`; el plugin de TanStack Router regenera `routeTree.gen.ts` en el próximo `dev`/`build`. El redirect de `/` se resuelve en `src/routes/index.tsx`.
3. **Placeholder mientras tanto**: `component: () => <ModulePlaceholder id="<id>" />`.
4. **Al migrar**:
   - recurso en `src/data/<id>.ts`: interfaz + schema `zod` anotado `z.ZodType<T>` + `queryOptions` (`queryKey: ["<id>"]`) + fetcher que respeta `DATA_SOURCE` (mock validado o `getJson`);
   - widgets presentacionales en `src/components/<id>/` (sin efectos de red);
   - la ruta carga con `loader: ({ context }) => context.queryClient.ensureQueryData(...)` y lee con `useSuspenseQuery`: no escribas estados de carga ni de error, los pinta el router.
5. **Comandos extra** de la paleta (si hacen falta) en `src/components/palette/commands.ts`.

## Robustez

- `ModuleError` (`defaultErrorComponent` del router) reemplaza **solo** el contenido de la ruta: el shell sigue navegable y `RETRY` reintenta el loader (`reset()` + `router.invalidate()`).
- `ShellError` es el `errorComponent` de `__root__`: si falla el propio shell no queda navegación, así que pinta chrome propio a pantalla completa con `RESTART`.
- `QueryStatePanel` es el único cuerpo LOADING/ERROR del repo: no dupliques esos bloques por módulo.
- `ModulePending` (`defaultPendingComponent`) cubre la navegación fría y lenta.

## Datos: contrato único, dos orígenes

La capa de datos tiene un contrato (`zod`) y dos orígenes conmutables por entorno:

| `VITE_DATA_SOURCE` | Qué hace |
|---|---|
| `mock` (default) | Sirve los fixtures de `src/data` con 250 ms simulados |
| `http` | `GET {VITE_API_BASE_URL}/<recurso>`, validado con el mismo schema |

- `.env.example` documenta las variables; `.env` y `.env.*` están en `.gitignore`.
- `src/lib/env.ts` valida `VITE_DATA_SOURCE` al arrancar: un valor inválido detiene la app con un mensaje explícito.
- `src/lib/api.ts` centraliza `getJson` (`fetch` + timeout + validación). **Todo** fallo —transporte, status no-2xx o contrato roto— llega como una única `ApiError` con `status` (`0` = transporte, `502` = contrato).
- Los schemas se anotan `z.ZodType<T>` contra las interfaces del recurso: si schema y tipo se desvían, falla el typecheck. El adaptador mock valida sus propios fixtures con el mismo schema, así que un fixture roto falla en `bun test`, no en la UI.
- Las rutas esperan sus datos en el `loader` (`ensureQueryData`) y leen con `useSuspenseQuery`: el preload por intención calienta la caché y la página pinta completa, sin flash de LOADING.

## Convenciones

- Prosa de documentación en **español**; código, comentarios, identificadores y mensajes de commit en **inglés** (Conventional Commits).
- Versiones exactas en `package.json`; dependencias registradas en `catalog/dependencies.json`.
- Contratos de datos: schema `zod` anotado `z.ZodType<T>` junto a la interfaz del recurso, en `src/data`.
- Tests junto al código que prueban. En `src/routes` el plugin excluye `*.test.ts(x)` del route tree vía `routeFileIgnorePattern` (`vite.config.ts`): sin eso, cada test lanzaría un warning "does not export a Route".
- Un archivo = una responsabilidad; los widgets del Dashboard (~60 líneas) son la referencia de escala.

## Limitaciones conocidas

- ACCOUNTING, HRM, PAYROLL, INVENTORY, REPORTS y SETTINGS son placeholders (alcance migrado: Dashboard + Invoice).
- No hay backend, auth ni Tauri: el origen `http` está cubierto por tests con `fetch` stubbeado, no contra un servidor real.
- Las tipografías se cargan de Google Fonts en `index.html`: para uso offline o de escritorio hay que self-hostearlas.
- `zod` entra en el chunk de entrada vía `env.ts` (+27 kB gzip): candidato a `manualChunks` si el arranque importa.
- El FPS/clock del status header son decorativos (lectura fija de `data/system.ts` para los medidores del inspector).

## Licencia

MIT — ver `LICENSE`.
