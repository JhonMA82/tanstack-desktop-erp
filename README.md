# tanstack-desktop-erp

Boilerplate reutilizable de aplicación de escritorio ERP construido con **Vite + React + TanStack** (Router, Query, Table), con un design system inspirado en la UI de Blender replicada desde `Blender-Pro-Lab.html`: paneles oscuros, acento naranja, tipografía Inter + JetBrains Mono, **top bar con Quick Access Toolbar e iconos SVG**, menú de módulos, **ribbon tipo Blender colapsable por módulo**, outliner lateral colapsable, inspector derecho, command palette (Ctrl+K) y status bar con progress sweep.

El módulo **Dashboard** está migrado como ejemplo escalable del patrón completo (datos → TanStack Query → componentes → ruta); el resto de módulos son placeholders navegables que documentan cómo migrarlos. La página **UI Kit** (`/ui-kit`) reúne todos los widgets reutilizables del design system: tokens, botones, badges, la galería de iconos, formularios simple y complejo, modales, toasts, progress, tabs, métricas y una tabla de ejemplo. Incluye además tres widgets de dashboard administrativo **inspirados en [arhamkhnz/tanstack-shadcn-admin-dashboard](https://github.com/arhamkhnz/tanstack-shadcn-admin-dashboard/tree/main/src/routes/%28main%29/dashboard/default)** — metric cards, performance overview (chart SVG con selects de periodo/segmento) y subscriber overview (toolbar + tabla paginada con 60 clientes) — reimplementados sin dependencias nuevas en estilo Blender.

## Stack

| Paquete | Versión exacta | Papel |
|---|---|---|
| vite | 8.3.0 | dev server y bundler de producción |
| react / react-dom | 19.3.0 | runtime de UI |
| @tanstack/react-router | 1.170.38 | rutas file-based tipadas con code splitting |
| @tanstack/react-query | 5.103.2 | estado de servidor: caché, loading y error |
| @tanstack/react-table | 9.2.4 | tablas headless (features composables, v9) |
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
| `bun run typecheck` | `tsc --noEmit` |
| `bun test` | tests unitarios (bun test) |

## Estructura

```
src/
├── components/
│   ├── ui/             # primitivos sin lógica de negocio
│   │                   #   Button · Badge · StatusBadge · Panel · Input · Metric · DataTable · Icon
│   │                   #   Field · Select · Textarea · Checkbox · Switch · Slider · Modal · Tabs
│   │                   #   ProgressBar · DropZone
│   ├── uikit/          # secciones del showcase /ui-kit (tokens, forms, modals, admin widgets…)
│   │                   #   MetricCards · PerformanceOverview · SubscriberOverview (ref: shadcn-admin)
│   ├── layout/         # TopBar (QAT+search), ModuleMenu (tabs+collapse), Ribbon (grupos por
│   │                   #   módulo), AppShell, Outliner, PropertiesPanel, ViewportHeader,
│   │                   #   StatusBar, shell-context (tema/paleta/ribbon/period/view)
│   ├── palette/        # CommandPalette (Ctrl+K) + registry de comandos
│   ├── feedback/       # ToastProvider + ToastViewport (SUCCESS/INFO/WARN/ERROR)
│   ├── dashboard/      # widgets del módulo Dashboard (MetricsGrid, RevenueWaveform, …)
│   └── ModulePlaceholder.tsx
├── data/               # fixtures y fetchers mock (dashboard.ts, system.ts)
├── lib/                # utilidades puras: cn, format, modules (fuente única), ledger, icons
├── routes/             # rutas file-based; routeTree.gen.ts lo genera el plugin de Vite
├── styles/index.css    # tokens @theme + tema oscuro (.root) y claro (.root.light)
└── main.tsx            # QueryClient + Router (Register) + render
```

Regla de capas: `routes` compone → `components/<módulo>` presenta → `data` provee los datos vía `queryOptions` → `lib` contiene lógica pura compartida. Los primitivos de `ui/` nunca importan de `data/` ni conocen módulos concretos.

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
   - fetchers + fixtures en `src/data/<id>.ts`, exportando `queryOptions` (`queryKey: ["<id>"]`);
   - widgets presentacionales en `src/components/<id>/` (sin efectos de red);
   - componer en la ruta con `useQuery(...)`, renderizando los estados `isPending`/`isError` como hace `src/routes/dashboard.tsx`.
5. **Comandos extra** de la paleta (si hacen falta) en `src/components/palette/commands.ts`.

## Datos: de mock a API real

`src/data/dashboard.ts` expone `dashboardQueryOptions` (TanStack Query) con un fetcher simulado (250 ms). Para conectar un backend real basta con reemplazar el cuerpo de `fetchDashboard()` por un `fetch`; la ruta, la caché (`staleTime` global en `main.tsx`) y los estados de carga/error no cambian.

## Convenciones

- Prosa de documentación en **español**; código, comentarios, identificadores y mensajes de commit en **inglés** (Conventional Commits).
- Versiones exactas en `package.json`; dependencias registradas en `catalog/dependencies.json`.
- Un archivo = una responsabilidad; los widgets del Dashboard (~60 líneas) son la referencia de escala.

## Limitaciones conocidas

- ACCOUNTING, HRM, PAYROLL, INVENTORY, REPORTS y SETTINGS son placeholders (alcance: base + 1 módulo).
- Los datos son fixtures locales; no hay backend, auth ni Tauri.
- El FPS/clock del status header son decorativos (lectura fija de `data/system.ts` para los medidores del inspector).
