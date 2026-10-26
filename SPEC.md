---
id: architecture
type: architecture-design
status: active
title: Arquitectura: capas, navegación declarativa y contrato de datos
tags: [architecture, navigation, tooling, data]
---

# Arquitectura

Base reutilizable de app de escritorio: SPA con Vite + React montada sobre una shell tipo Blender. No
hay backend, ni auth, ni empaquetado nativo (ver Limitaciones). Un proyecto nuevo nace de
`bun run init` y crece con `bun run gen`; la base no incluye ejemplos de dominio.

## Capas

`routes` compone y espera datos → `components/<módulo>` presenta → `data` define el contrato y los
fetchers → `lib` es lógica pura e infraestructura sin React.

- `routes/*.tsx` no escriben estados de carga ni de error: los pinta el router.
- `components/ui/` no importa de `data/` ni conoce módulos.
- La shell (`components/layout/`) no conoce el dominio: marca y empresa salen de `config/app.ts`, y
  todo lo que varía por módulo es dato de `config/navigation.ts`.
- `lib/` no importa de `components/`, `routes/` ni `data/`.
- Los primitivos de `ui/` son la única fuente de controles. Un botón nunca anida otro botón: cuando el
  ribbon necesita acción **y** menú, el chevron es un hermano absoluto del botón, no un hijo.

**Invariante:** toda ruta que consume datos declara
`loader: ({ context }) => context.queryClient.ensureQueryData(...)` y lee con `useSuspenseQuery`. El
preload por intención solo aporta si hay loader, y esperar los datos antes de pintar elimina el
waterfall del fetch posterior al montaje.

**Invariante:** todo módulo es *layout + índice*: `<id>.tsx` renderiza `<Outlet/>` y `<id>.index.tsx`
es su página raíz. La uniformidad no es estética: `gen page` agrega hijas sin reescribir el padre, y el
fallo silencioso "ruta hija sin `<Outlet/>`" (la URL existe, el menú apunta bien, la página sale en
blanco) deja de ser posible.

## Navegación declarativa

`src/config/navigation.ts` es la fuente única de tabs, ribbon, outliner y paleta. Tipos:
`ModuleDef` (id, label, path, count, description, ribbon), `RibbonGroup`, `RibbonAction`,
`MenuAction`, `PageDef` (id, moduleId, label, path) y `ActionBehavior`.

- **Datos, no closures.** Una acción declara `to` (navegar), `notify` (toast) o `command`
  (`toggle-theme` | `toggle-ribbon` | `open-palette`). Así el registro se puede diffear, validar y
  generar; lo que necesita estado propio del módulo se resuelve en el componente, no en la config.
- **`ModulePath` = `keyof FileRoutesByTo`**, derivado de `routeTree.gen.ts`. Un menú que apunta a una
  ruta inexistente falla en `tsc`; ya no hay una unión mantenida a mano.
- **`PAGES` es una lista plana con `moduleId`**, no un campo de `ModuleDef`. Insertar dentro de un
  objeto anidado obliga a parsear el archivo; dos listas planas con marcadores
  (`// gen:modules`, `// gen:pages`) dan un único punto de inserción determinista por comando.
- **Las superficies son derivadas**: el grupo `Pages` del ribbon, el árbol del outliner y los comandos
  `GO TO MÓDULO / PÁGINA` salen de `pagesOf(moduleId)`. El grupo `Pages` usa tiles hasta tres páginas y
  una grilla de dos columnas de botones chicos de ahí en más, por el presupuesto de altura. Agregar una página no toca el ribbon ni el
  menú. `moduleByPath` resuelve por prefijo, así una hija pertenece a su módulo sin registrarse dos
  veces.
- **Presupuesto del ribbon**: la fila mide lo que mide su contenido — 4px arriba + las acciones del
  grupo más alto + 4px abajo + 16px de rótulo. Con tiles (`size: "large"`, 58px) son 83px; con tres
  filas de `SmallButton` (3 × 22 + 2 × 2 = 70) son 95px. El máximo de acciones por grupo es 75px: una
  cuarta fila de botones chicos (94) abriría scroll vertical, así que a partir de cuatro el grupo
  declara `columns: 2`. La altura fija de 96px dejaba el aire de más abajo del último botón. Por la misma razón, un
  grupo con una a tres acciones las declara `size: "large"` (tiles de 58px): menos de tres filas deja un
  hueco visible en la columna. Ese fue el hueco del grupo `Pages` antes de renderizar las páginas como
  tiles.
- Los menús abiertos desde el ribbon se portalan a `document.body` con posición `fixed` calculada del
  trigger: el row tiene `overflow-x-auto` y un panel en flujo quedaría recortado. Se cierran en
  `scroll`/`resize` para no quedar desanclados.
- Las opciones seleccionables son `menuitemradio` con `aria-checked`; los comandos, `menuitem`. El rol
  se escribe por rama para no mezclar atributos ARIA incompatibles.

**Invariante (guardarraíl):** `src/config/navigation.test.ts` compara el registro contra
`router.routesByPath` en las dos direcciones — toda ruta registrada existe y toda ruta del árbol está
registrada (`/` es la única excepción, porque solo redirige) — y verifica ids únicos, anidamiento de
cada página bajo su módulo y targets de menú. Una ruta nueva sin menú rompe el CI.

**Alternativas rechazadas:** (a) un archivo de config por módulo con `import.meta.glob` como índice —
cero ediciones compartidas, pero `import.meta.glob` es de Vite y no existe bajo `bun test`; (b) módulo
hoja + conversión hoja→layout en `gen page` — ahorra un archivo, pero reescribe la página que el usuario
ya editó; (c) mantener los ejemplos de referencia en el repo tras un flag — es el problema que la base
resuelve, con otro nombre.

## Contrato de datos

Un recurso = interfaz de dominio escrita a mano + schema `zod` anotado `z.ZodType<T>` + fixture +
`queryOptions` + fetcher que respeta `DATA_SOURCE`.

- La anotación `z.ZodType<T>` —en lugar de derivar el tipo con `z.infer`— es deliberada: derivarlo
  movería los tipos de dominio de `lib/` a `data/` e invertiría las capas. La anotación detecta el
  drift entre schema y tipo en compilación.
- El adaptador mock valida sus propios fixtures con el mismo schema: un contrato roto falla en
  `bun test`, no en la UI.
- `ApiError` es el único error que cruza la capa de datos: `status` 0 = transporte, 502 = contrato
  roto, cualquier otro = HTTP.
- `VITE_DATA_SOURCE` (`mock` | `http`) elige el origen y `VITE_API_BASE_URL` el prefijo. Un valor
  inválido detiene el arranque a propósito (fail fast).
- **El dato no lleva CSS.** Los estados son semánticos (`tone: "positive" | "warning" | "neutral"`) y
  el widget los traduce a tokens; `StatusBadge` recibe `tone` + label, no vocabulario de dominio.

## Camino de escritura

Un recurso declara **dos** contratos: el de salida (`<Entity>Row`, lo que devuelve la API) y el de entrada
(`<Entity>Input`, lo que el formulario envía y el body acepta). El de entrada no lleva `id` ni el estado
`ARCHIVED`: el id lo asigna el servidor y archivar es una acción, no un campo editable. `lib/api.ts`
expone `sendJson(method, path, body, schema)` con el mismo `ApiError` único y la misma validación que
`getJson`.

- **El mock escribe en memoria.** `data/<recurso>.ts` guarda el store en una variable de módulo sembrada
  con el fixture: crear, editar y archivar se ven al invalidar la caché y desaparecen al recargar (en
  `http` la API es la dueña del estado). `reset<Entity>Store()` aísla los tests. Es la decisión que hace
  verificable el camino de escritura sin backend.
- **Archivar no borra.** `archive<Entity>` cambia el estado a `ARCHIVED`; la fila sigue en la lista. Un
  contable no pierde una línea.
- **Mutaciones en hooks, no en la capa de datos.** `data/` no importa React: exporta funciones. Los
  `useCreate/useUpdate/useArchive` viven en `components/<módulo>/` y comparten forma — invalidan
  `<recurso>QueryKey`, emiten el toast y delegan la navegación en `onDone`. Las páginas no tocan la caché.
- **Formularios con TanStack Form.** `ui/FormField` envuelve `form.Field` + `Field`/`Input`/`Select`, así
  cada campo declara label, hint y error sin cablear `onChange`. La validación usa el mismo schema `zod`
  del contrato: `validators: { onSubmit: <entity>InputSchema }` (Standard Schema). El schema se anota
  `z.ZodType<Input, Input>`: el segundo genérico fija el tipo de *entrada*, que es el que Standard Schema
  —y por lo tanto TanStack Form— verifica.
- **Dinero en centavos.** Los importes son enteros (`amountCents`) y se dividen una sola vez al mostrar,
  con `formatCents`.
- **Rutas con parámetro.** Todo segmento con hijas es layout + índice (`<recurso>.$id.tsx` con `<Outlet/>`
  y `.$id.index.tsx` con el detalle); el formulario de edición cuelga del mismo segmento. Las rutas
  dinámicas **no** son destinos de navegación: no van a `PAGES` y el guardarraíl las excluye del chequeo
  de huérfanos, pero sí verifica que cuelguen de un módulo registrado. Las páginas que existen sin ser
  destino (un alta) se registran con `hidden: true`, así el guardarraíl las conoce y el outliner no las
  muestra. El breadcrumb del viewport muestra el `pathname` real para no mentir en una ruta dinámica.

## Tooling

- `bun run gen module|page` escribe el patrón canónico, inserta en el registro, **formatea** lo tocado y
  **regenera `routeTree.gen.ts`** con `@tanstack/router-generator` en proceso (mismo resultado que el
  plugin de Vite). Sin ese paso, `gen` dejaría el árbol y `ModulePath` desactualizados y el agente vería
  fallar el typecheck sin causa visible. El generador fija `tmpDir` dentro del root: por defecto lo
  resuelve contra `process.cwd()` y falla al scaffol dear en otro checkout.
- `bun run init` rebrandea (`config/app.ts`, `package.json`, README), borra los task specs temporales y
  crea o reinicia el historial git (también cuando la copia llega sin `.git`) y el commit inicial
  funciona sin identidad de git configurada, como en un runner de CI: si no hay `user.email`, usa una de
  relleno con `-c` en vez de abortar.
- **`init` es de una sola vez y se autodestruye**: borra `scripts/init.ts`, `scripts/init.test.ts` y su
  entrada en `package.json`, y limpia las menciones en README y `AGENTS.md` (la sección de arranque se
  reescribe y la fila de la tabla desaparece). Deja `SPEC.md` intacto: describe cómo se creó el proyecto.
  `gen` y `routes:generate` se quedan porque son herramientas de uso continuo. La razón es de seguridad:
  en un proyecto vivo, `init` reescribiría la marca y borraría la historia. **Deja `SPEC.md` intacto**: documenta la arquitectura que el proyecto
  hereda y sus reglas siguen aplicando. Se niega a correr sobre este repo plantilla sin `--yes`.
- `routeTree.gen.ts` y `bun.lock` los generan herramientas: nunca se editan a mano.

## Robustez

| Fallo | Boundary | Qué ve el usuario |
|---|---|---|
| Loader de un módulo | `ModuleError` (`defaultErrorComponent`) | shell intacto + panel ERROR + RETRY |
| Render de un módulo | `ModuleError` | ídem |
| El propio shell | `ShellError` (`errorComponent` de `__root__`) | pantalla completa + RESTART |
| Navegación fría y lenta | `ModulePending` (`defaultPendingComponent`) | shell intacto + LOADING |

**Invariante:** los boundaries se declaran una vez en el router, no en cada ruta. Una ruta nueva hereda
los cuatro comportamientos sin escribirlos, y `QueryStatePanel` es el único cuerpo LOADING/ERROR del
repo.

## Tema

Tokens en `styles/index.css` expuestos con `@theme inline`. El tema se aplica con la clase `light` en
`<html>` y se persiste en `localStorage` bajo `app-theme`. Los colores de los componentes salen de
tokens (`bg-bg`, `text-ink-dim`, `var(--borderL)`…); hex hardcodeado solo en `styles/index.css`.

## Iconografía

`src/lib/icons.ts` es un **mapa curado** de nombre → componente de `lucide-react`, y `IconName` se deriva
de él. Es la única puerta a la librería: `biome.json` la cierra para el resto del repo con
`style/noRestrictedImports`. Gracias a eso el registro sigue guardando strings (`icon: "plus"`) — datos
válidos y generables — en vez de componentes.

`ui/Icon.tsx` fija el trazo una sola vez: `strokeWidth 2` sobre el grid 24 de Lucide, caps y joins
rectos, `size` 12 por defecto. El peso es proporcional al tamaño (≈0.83/1.00/1.17px a 10/12/14) para
conservar la progresión del set dibujado a mano que reemplazó. Tamaños en uso: **14** en botones grandes
del ribbon, **10** en botones chicos y filas de menú; `RibbonAction.iconSize` permite el override. Los
iconos son decorativos (`aria-hidden`): el nombre accesible está siempre en el texto o el `aria-label`
del control. **Ningún control usa un carácter de texto.** Los chevrons del menú (que era un `▾` de 7px y a tamaño
real se leía como un casillero vacío), del outliner, de los paneles laterales, el toggle del ribbon y el
del tema (`sun`/`moon`) son iconos del set: un glifo de texto depende de la fuente del sistema y puede
renderizarse como una caja vacía. `AppShell.test.tsx` falla si vuelve a aparecer uno de esos caracteres
en la shell. Excepción deliberada: `APP.mark` es contenido de marca, no un control.

Descartado: exponer los nombres crudos de la librería (resolver un string en runtime exige importar el
paquete entero) y guardar componentes en la config (rompe el invariante de datos puros del registro).

## Calidad

- Gates: `tsc --noEmit`, `biome ci .`, `bun test`, `vite build`. El CI
  (`.github/workflows/ci.yml`) los corre en cada push a `main` y en cada PR; el hook pre-commit solo
  formatea y lintea lo staged.
- Los tests de router usan el árbol real con `createMemoryHistory` + `renderToString`, sin DOM.
  Limitación conocida: el SSR de React no ejecuta `errorComponent`, así que la presencia del panel en
  cliente está cubierta por test de componente y por la ubicación del boundary, no por un E2E.
- `scripts/gen.test.ts` y `scripts/init.test.ts` trabajan sobre `mkdtemp`: generan archivos de verdad y
  verifican que parseen y que el registro y el árbol queden consistentes.
- El camino de escritura se verificó en navegador real por CDP (crear, validar, detalle, editar, archivar
  con confirmación e invalidación) durante el desarrollo; sigue sin test de DOM automatizado.

## Limitaciones conocidas

- Sin backend real: el origen `http` solo se ejercita con `fetch` stubbeado.
- Sin empaquetado nativo (Tauri/Electron) ni offline: las tipografías vienen de Google Fonts.
- `zod` entra en el chunk de entrada vía `lib/env.ts`.
- `bun test` no tiene DOM: los tests de UI son SSR o de componente; un test de interacción exige añadir
  un DOM (happy-dom) y es una decisión diferida.
- `DataTable` pinta todas las filas de la página: sin virtualización, sin orden ni selección de filas.
- El store del mock es de sesión: recargar la página descarta lo escrito (el origen `http` no tiene esa
  limitación, pero tampoco hay backend).
- El catálogo curado de iconos se empaqueta completo (~3 kB gzip): sumar un nombre al mapa suma peso
  aunque todavía no se use.
- Un solo spec raíz; el splitting por módulo (`SPEC.md` junto a `src/config/` y `scripts/`) queda
  diferido mientras el proyecto quepa en un documento.
- `LICENSE` (MIT) usa como titular el handle del remoto (`JhonMA82`), sin confirmar por el autor.
