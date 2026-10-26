# AGENTS.md

Guía de trabajo para agentes en esta base. Léela antes de tocar código: describe el patrón que ya
existe y las reglas que el CI verifica. El *porqué* de cada decisión está en `SPEC.md`.

## Qué es esta base

Una app de escritorio (shell tipo Blender: top bar, tabs de módulos, ribbon, outliner, inspector,
status bar, command palette) **sin dominio de negocio**. Trae el shell, 21 primitivos en
`src/components/ui/`, un vocabulario de 27 iconos y el contrato de datos, más **un módulo de referencia**
(`Home`) que muestra el patrón completo. Todo lo demás se agrega con `bun run gen`; no hay ejemplos que borrar. En
`docs/example-project.md` hay un walkthrough real (dos módulos, un submenú) con las salidas, los tiempos
y el roce que encontró.

## Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | dev server (Vite) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | `biome ci .` (formato + lints) |
| `bun run format` | aplica fixes seguros de biome |
| `bun test` | tests (bun test, sin DOM) |
| `bun run build` | build de producción |
| `bun run gen module <id>` | scaffold de un módulo completo |
| `bun run gen page <module> <page>` | scaffold de una página anidada (submenú) |
| `bun run gen` | usage |
| `bun run init` | rebrand + historia nueva; crea el repo si la copia no trae `.git` |
| `bun run routes:generate` | regenera `routeTree.gen.ts` sin arrancar Vite |

## Mapa de capas

```
routes/           compone la página y espera sus datos en el loader
components/<mód>/ presenta; no hace fetch
data/             contrato: interfaz + schema zod + fixture + queryOptions + fetcher
lib/              lógica pura e infraestructura sin React
config/           navigation.ts (registro de navegación) y app.ts (marca/empresa)
```

Reglas duras:

- `components/ui/` **no** importa de `data/` ni conoce módulos.
- `components/layout/` (la shell) **no** conoce el dominio: todo lo que varía por módulo son datos de
  `config/navigation.ts`.
- `lib/` no importa de `components/`, `routes/` ni `data/`.
- Una ruta que consume datos declara `loader: ({ context }) => context.queryClient.ensureQueryData(...)`
  y lee con `useSuspenseQuery`. Nunca escribas estados LOADING/ERROR propios: los pinta el router
  (`ModuleError`, `ModulePending`, `QueryStatePanel`).

## Recetas

### Agregar un módulo

```bash
bun run gen module inventory --label "INVENTORY"
```

Escribe `routes/inventory.tsx` (layout con `<Outlet/>`), `routes/inventory.index.tsx` (loader +
`useSuspenseQuery`), `data/inventory.ts` (contrato + fixture + fetcher mock/http + `queryOptions`) y
`components/inventory/InventoryOverview.tsx`. Inserta la entrada en `config/navigation.ts`, formatea y
regenera el árbol de rutas.

Después: reemplazá el fixture de `data/<id>.ts` por los datos reales y las columnas del widget.
**No edites el ribbon a mano**: sale del registro.

### Agregar una página (submenú)

```bash
bun run gen page inventory items --label "ITEMS"
```

Crea `routes/inventory.items.tsx` y registra la página en `PAGES`. Aparece sola en el outliner (árbol
módulo → páginas), en el grupo `Pages` del ribbon y en la paleta como `GO TO INVENTORY / ITEMS`. La
URL es compartible (`/inventory/items`).

### Agregar un grupo o una acción al ribbon

Editá el `ribbon` del módulo en `src/config/navigation.ts`:

```ts
{
  label: "Actions",              // rótulo del grupo
  columns: 2,                    // solo si el grupo pasa de 3 botones pequeños
  actions: [
    { id: "new-item", size: "large", icon: "plus", label: "New\nItem", tone: "accent",
      notify: { kind: "INFO", title: "NEW ITEM", message: "Composer opened" } },
    { id: "open-items", size: "small", icon: "folder", label: "Items", to: "/inventory/items" },
    { id: "more", size: "small", icon: "list", label: "More", menu: [
      { id: "export", label: "Export", notify: { kind: "SUCCESS", title: "EXPORTED", message: "items.csv" } },
    ]},
  ],
}
```

Targets válidos (datos, nunca funciones): `to` (navega), `notify` (toast), `command`
(`toggle-theme` | `toggle-ribbon` | `open-palette`). `menu` agrega el desplegable.

**Presupuesto de altura**: el grupo se ve lleno o se ve un hueco. Con **1 a 3 acciones usá
`size: "large"`** (tiles de 58px, ancho de icono + etiqueta); con **4 o más**, `size: "small"` y
`columns: 2` (tres filas de 22px = 70px). Un botón chico suelto dentro de un grupo alto deja un hueco
visible debajo — es exactamente lo que pasaba en el grupo derivado `Pages` antes de que las páginas se
renderizaran como tiles.

La **etiqueta manda el ancho** del tile (mínimo 48px) y acepta `\n` para dos líneas; el bloque de rótulo
siempre reserva dos, así un botón de una línea no desalinea su icono respecto de los vecinos.

### Agregar un recurso de datos

Copiá la forma que genera `gen` en `src/data/<id>.ts`:

1. interfaz de dominio escrita a mano;
2. schema `zod` anotado **`z.ZodType<T>`** (así el drift entre tipo y schema falla en `tsc`);
3. fixture validado con el mismo schema por el adaptador mock;
4. `fetch<Recurso>()` que respeta `DATA_SOURCE` (`mock` | `http`);
5. `queryOptions` con `queryKey: ["<recurso>"]`.

Todo error de transporte, status o contrato llega como `ApiError` desde `lib/api.ts`.

### Agregar un widget

`src/components/<módulo>/Foo.tsx`, presentacional, con los primitivos de `ui/` (`Panel`, `DataTable`,
`Button`, `Field`, `Modal`, `Tabs`, `Metric`, `Badge`…). Sin `fetch`, sin `useSuspenseQuery`: los datos
llegan por props desde la ruta. Colores siempre por token (`bg-panel`, `text-ink-dim`, `var(--borderL)`…);
hex solo en `styles/index.css`.

### Agregar un icono

Una línea en `src/lib/icons.ts` y queda disponible en todo el app:

```ts
import { Truck } from "lucide-react";

export const ICONS = {
  // …
  truck: Truck,
} as const;
```

Se usa como `<Icon name="truck" />` y en el registro (`icon: "truck"`). Reglas: **solo**
`src/lib/icons.ts` importa `lucide-react` (el lint lo impone), los nombres del vocabulario son
genéricos y en minúscula (`plus`, `folder`, `chart`), nunca el PascalCase de la librería.

### Agregar un comando a la paleta

`src/components/palette/commands.ts`. La navegación a módulos y páginas ya se genera desde el registro;
solo agregá ahí las acciones propias.

## Nunca

- Editar `src/routeTree.gen.ts` o `bun.lock` a mano: los genera una herramienta.
- Crear una ruta sin registrarla: `src/config/navigation.test.ts` falla y el CI queda rojo.
- Registrar un path que no existe: `ModulePath` (= `keyof FileRoutesByTo`) lo rechaza en `tsc`.
- Escribir paneles de carga o error por módulo.
- Importar `data/` desde `ui/` o `layout/`, ni meter CSS/hex en fixtures o componentes.
- Importar `lucide-react` fuera de `src/lib/icons.ts`: `bun run lint` falla con un mensaje que apunta
  al mapa curado. Tampoco uses el nombre PascalCase de la librería en el registro.
- Usar un carácter de texto (`▾`, `▸`, `◂`, `▲`, `◑`…) como control: depende de la fuente del sistema y
  puede verse como una caja vacía. Para chevrons y flechas está el set (`chevron-down|up|left|right`,
  `sun`, `moon`); `AppShell.test.tsx` falla si reaparecen.
- Callar el typecheck con `any`, `@ts-expect-error` o `@ts-ignore` sin justificarlo en el resumen.

## Antes de entregar

```bash
bun run typecheck && bun run lint && bun test
```

Si tocaste navegación, mirá también `/home` y una página anidada en el navegador: el ribbon debe
pintar los grupos del registro y el outliner el árbol módulo → páginas.
