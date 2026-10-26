# tanstack-desktop-erp

Plantilla base de aplicación de escritorio construida con **Vite + React + TanStack Router** y una
shell inspirada en Blender: paneles oscuros, acento naranja, tipografía Inter + JetBrains Mono, top bar
con Quick Access Toolbar e iconos SVG, menú de módulos, **ribbon colapsable por módulo**, outliner
lateral con árbol de páginas, inspector derecho, command palette (Ctrl+K) y status bar.

Es una base **sin dominio**: trae el shell, los primitivos del design system, el contrato de datos y
**un módulo de referencia** (`/home`) que muestra el patrón completo. No hay ejemplos de facturación,
contabilidad ni dashboards que borrar: lo que necesites se agrega con un comando.

## Empezar un proyecto

```bash
bun install
bun run init        # pide nombre, organización, iniciales y moneda; crea o reinicia el historial
bun run dev
```

`init` reescribe `src/config/app.ts`, `package.json` y el título del README, borra los specs de tarea
temporales, **crea o reinicia** el historial git y deja `SPEC.md` intacto (documenta la arquitectura que
heredás). Al terminar **se borra a sí mismo** —script, test y entrada de `package.json`— y limpia su
mención en el README y en `AGENTS.md`: en el proyecto derivado no queda una herramienta capaz de
rebrandearlo o borrarle la historia. Después, para cada feature:

```bash
bun run gen module inventory --label "INVENTORY"   # módulo completo
bun run gen page inventory items --label "ITEMS"    # página anidada (submenú)
bun run gen form inventory item                     # alta + edición con validación
```

El generador escribe el patrón canónico (layout con `<Outlet/>`, índice con `loader` +
`useSuspenseQuery`, recurso de datos con `zod` + `queryOptions`, widget de tabla), registra el módulo y
regenera el árbol de rutas. Las recetas completas, las reglas de capas y lo que **no** hay que hacer
están en [`AGENTS.md`](./AGENTS.md).

Un **walkthrough completo y verificado** —dos módulos, un submenú, dos recursos con contrato, capturas y
tiempos medidos— está en [`docs/example-project.md`](./docs/example-project.md).

## Stack

| Paquete | Versión exacta | Papel |
|---|---|---|
| vite | 8.3.0 | dev server y bundler de producción |
| react / react-dom | 19.3.0 | runtime de UI |
| @tanstack/react-router | 1.170.38 | rutas file-based tipadas con code splitting |
| @tanstack/react-query | 5.103.2 | estado de servidor: caché, loading y error |
| @tanstack/react-table | 9.2.4 | tablas headless (features composables, v9) |
| @tanstack/react-form | 1.33.5 | formularios: estado y validación con los mismos schemas `zod` |
| zod | 4.6.7 | contratos de datos: valida respuestas HTTP y fixtures |
| lucide-react | 1.61.0 | iconos, detrás del mapa curado de `src/lib/icons.ts` (ISC) |
| tailwindcss + @tailwindcss/vite | 4.3.3 | utilidades CSS y tokens vía `@theme inline` |
| typescript | 7.0.2 | chequeo de tipos (`tsc --noEmit`) |
| @biomejs/biome | 2.5.14 | linter + formateador |
| @tanstack/router-generator | 1.167.38 | regenera `routeTree.gen.ts` desde `bun run gen` |
| bun | 1.4.0 | gestor de paquetes, scripts y tests |

Versiones **fijadas en exacto** (sin `^`, `~` ni `latest`); el catálogo con licencia verificada vive en
`catalog/dependencies.json`. `bun.lock` y `routeTree.gen.ts` se generan con herramientas: **nunca** se
editan a mano.

## Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | dev server (Vite, Ctrl+K para la paleta) |
| `bun run build` | build de producción en `dist/` |
| `bun run preview` | sirve el build de producción |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | `biome ci .` (formato + lints, falla en CI) |
| `bun run format` | `biome check --write .` (aplica fixes seguros) |
| `bun test` | tests unitarios y de integración (bun test, sin DOM) |
| `bun run gen` | scaffold de módulos y páginas (ver `AGENTS.md`) |
| `bun run init` | rebrand + historial nuevo; se elimina a sí mismo al terminar |
| `bun run routes:generate` | regenera `routeTree.gen.ts` sin arrancar Vite |
| `bun run hooks:install` | activa el hook pre-commit de `.githooks` (también lo hace `bun install`) |

## Estructura

```
src/
├── components/
│   ├── ui/             # 21 primitivos sin lógica de negocio
│   │                   #   Button · Badge · StatusBadge · Panel · Input · Metric · DataTable · Icon
│   │                   #   Field · Select · Textarea · Checkbox · Switch · Slider · Modal · Tabs
│   │                   #   ProgressBar · DropZone · Menu (trigger + panel portaleado)
│   ├── layout/         # TopBar, ModuleMenu, Ribbon, AppShell, Outliner, PropertiesPanel,
│   │                   #   ViewportHeader, StatusBar y shell-context (tema/paleta/ribbon/módulo activo)
│   ├── palette/        # CommandPalette (Ctrl+K) + comandos generados desde el registro
│   ├── feedback/       # ToastProvider + ToastViewport, QueryStatePanel, boundaries de error
│   └── home/           # widgets del módulo de referencia (MetricsRow, ActivityTable)
├── config/
│   ├── navigation.ts   # FUENTE ÚNICA de tabs, ribbon, outliner y paleta (datos + tipos)
│   └── app.ts          # marca (APP) y empresa (COMPANY): la shell no conoce el dominio
├── data/               # recursos: schema zod de salida y de entrada, fixture, store mock,
│                       #   lecturas y escrituras, queryOptions (overview, entries, system)
├── lib/                # cn, format, icons, api (getJson + ApiError) y env (VITE_DATA_SOURCE)
├── routes/             # rutas file-based; routeTree.gen.ts lo genera el plugin
├── styles/index.css    # tokens @theme + tema oscuro (.root) y claro (.root.light)
└── main.tsx            # QueryClient en el router (context) + boundaries + render
```

Regla de capas: `routes` compone (y espera sus datos en el `loader`) → `components/<módulo>` presenta →
`data` provee el contrato (`zod` + `queryOptions`) → `lib` contiene lógica pura e infraestructura sin
React. Los primitivos de `ui/` nunca importan de `data/` ni conocen módulos; la shell lee marca y
empresa de `config/` y la navegación de `config/navigation.ts`.

Fuera de `src/`: `scripts/` (generador, init y regeneración del árbol), `.github/workflows/ci.yml`
(typecheck · lint · test · build en cada push y PR), `.githooks/pre-commit` (biome sobre lo staged),
`catalog/dependencies.json`, `AGENTS.md` (recetas para agentes) y `SPEC.md` (decisiones de arquitectura).

## Navegación declarativa

`src/config/navigation.ts` es la fuente única. Un módulo declara `id`, `label`, `path`, `count`,
`description` y sus grupos de ribbon; las páginas anidadas viven en la lista plana `PAGES` con su
`moduleId`. De ahí salen los tabs del menú, el ribbon, el árbol del outliner y los comandos de la
paleta. `bun run gen` inserta en los marcadores `// gen:modules` y `// gen:pages`.

Dos invariantes la mantienen honesta:

- `ModulePath` es `keyof FileRoutesByTo` (derivado del árbol generado): registrar una ruta que no
  existe falla en `tsc`.
- `src/config/navigation.test.ts` compara el registro contra `router.routesByPath` en las dos
  direcciones: una ruta sin registrar (o un menú que apunta a la nada) rompe el CI.

## Design system

Tokens definidos en `src/styles/index.css` y expuestos a Tailwind v4 mediante `@theme inline` (clases
como `bg-panel`, `text-ink-dim`, `border-border`, `text-orange`):

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0E0E0E` | `#D5D5D5` |
| `--panel` / `--panel2` / `--panel3` | `#1E1E1E` / `#252525` / `#2A2A2A` | `#EAEAEA` / `#E0E0E0` / `#D8D8D8` |
| `--panel-out` | `#1A1A1A` | `#DEDEDE` |
| `--border` / `--borderL` | `#323232` / `#3A3A3A` | `#B8B8B8` / `#9A9A9A` |
| `--text` / `--text-dim` / `--text-bright` | `#CCCCCC` / `#7A7A7A` / `#EEEEEE` | `#222222` / `#6A6A6A` / `#111111` |
| `--orange` `--blue` `--red` `--green` | `#FF8C32` `#4C8CFF` `#FF4444` `#3DDC84` | (idem) |

Los **iconos** salen de un mapa curado en `src/lib/icons.ts` (27 nombres genéricos → componentes de
`lucide-react`); `IconName` se deriva de ahí, así que el registro sigue guardando strings (`icon:
"plus"`) y un nombre inexistente falla en `tsc`. `ui/Icon.tsx` es la única puerta a la librería — el
lint impide importarla en otro archivo — y fija el trazo: `strokeWidth 2` sobre el grid 24, caps
rectos, 14px en botones grandes del ribbon y 10px en chicos y menús. Para sumar un icono alcanza una
línea en el mapa (ver `AGENTS.md`).

El tema se aplica con la clase `light` en `<html>` (persistida en `localStorage` bajo `app-theme`) y se
alterna desde la top bar, el inspector, la página de preferencias o el comando `TOGGLE DARK MODE` de la
paleta. Las tipografías (Inter, JetBrains Mono) se cargan desde Google Fonts en `index.html` con
fallbacks de sistema.

Presupuesto del ribbon: fila de 96px con **75px útiles** por grupo (3 filas de `SmallButton`); a partir
de cuatro botones pequeños el grupo declara `columns: 2`.

## Escrituras y formularios

El camino completo (listar → crear → ver → editar → archivar) vive en el módulo de referencia
`/entries`, y `bun run gen module` + `bun run gen form` lo emiten para cualquier recurso:

- **Dos contratos por recurso**: `<Entity>Row` (lo que devuelve la API) y `<Entity>Input` (lo que manda el
  formulario). `lib/api.ts` gana `sendJson` y el mock escribe en un store de sesión: crear/editar se ven
  al invalidar la caché y se descartan al recargar.
- **Archivar no borra**: la fila cambia a `ARCHIVED` y sigue en la lista.
- **Mutaciones** en `components/<módulo>/use-<entity>-mutations.ts` sobre `useMutation`: invalidan la key
  del recurso, emiten el toast y delegan la navegación. La capa de datos sigue sin React.
- **Formularios** con TanStack Form validando contra el mismo schema `zod` del contrato (`Standard
  Schema`), con los primitivos `Field`/`Input`/`Select` vía `ui/FormField`.
- **Rutas de detalle** (`/entries/$entryId`) con layout + índice: el segmento con parámetro renderiza su
  `<Outlet/>` y las páginas que no son destino se registran con `hidden: true`.
- **Dinero en centavos** (`amountCents`), dividido una sola vez al mostrar con `formatCents`.

## Datos: contrato único, dos orígenes

| `VITE_DATA_SOURCE` | Qué hace |
|---|---|
| `mock` (default) | Sirve los fixtures de `src/data` con 250 ms simulados |
| `http` | `GET {VITE_API_BASE_URL}/<recurso>`, validado con el mismo schema |

- `.env.example` documenta las variables; `.env` y `.env.*` están en `.gitignore`.
- `src/lib/env.ts` valida `VITE_DATA_SOURCE` al arrancar: un valor inválido detiene la app con un
  mensaje explícito.
- `src/lib/api.ts` centraliza `getJson` (`fetch` + timeout + validación). **Todo** fallo —transporte,
  status no-2xx o contrato roto— llega como una única `ApiError` con `status` (`0` = transporte,
  `502` = contrato).
- Los schemas se anotan `z.ZodType<T>` contra las interfaces del recurso: si schema y tipo se desvían,
  falla el typecheck. El adaptador mock valida sus propios fixtures con el mismo schema, así que un
  fixture roto falla en `bun test`, no en la UI.
- Las rutas esperan sus datos en el `loader` (`ensureQueryData`) y leen con `useSuspenseQuery`: el
  preload por intención calienta la caché y la página pinta completa, sin flash de LOADING.

## Robustez

| Fallo | Boundary | Qué ve el usuario |
|---|---|---|
| Loader o render de un módulo | `ModuleError` (`defaultErrorComponent`) | shell intacto + panel ERROR + RETRY |
| El propio shell | `ShellError` (`errorComponent` de `__root__`) | pantalla completa + RESTART |
| Navegación fría y lenta | `ModulePending` (`defaultPendingComponent`) | shell intacto + LOADING |

`QueryStatePanel` es el único cuerpo LOADING/ERROR del repo: no dupliques esos bloques por módulo.

## Convenciones

- Prosa de documentación en **español**; código, comentarios, identificadores y mensajes de commit en
  **inglés** (Conventional Commits).
- Versiones exactas en `package.json`; dependencias registradas en `catalog/dependencies.json`.
- Contratos de datos: schema `zod` anotado `z.ZodType<T>` junto a la interfaz del recurso, en `src/data`.
- Tests junto al código que prueban. En `src/routes` el plugin excluye `*.test.ts(x)` del route tree vía
  `routeFileIgnorePattern` (`vite.config.ts`): sin eso, cada test lanzaría un warning
  "does not export a Route".
- Un archivo = una responsabilidad.

## Limitaciones conocidas

- No hay backend, auth ni empaquetado nativo (Tauri/Electron): el origen `http` está cubierto por tests
  con `fetch` stubbeado, no contra un servidor real.
- `bun test` no tiene DOM: los tests de UI son SSR o de componente. Un test de interacción exige añadir
  un DOM (happy-dom) y es una decisión diferida.
- Las tipografías se cargan de Google Fonts en `index.html`: para uso offline o de escritorio hay que
  self-hostearlas.
- `zod` entra en el chunk de entrada vía `env.ts`: candidato a `manualChunks` si el arranque importa.
- El FPS y el reloj del status header son decorativos (lectura fija de `data/system.ts`).
- `DataTable` no virtualiza y no tiene orden ni selección de filas: pinta todas las filas de la página.
- El store del mock es de sesión: recargar descarta lo escrito.

## Licencia

MIT — ver `LICENSE`.
