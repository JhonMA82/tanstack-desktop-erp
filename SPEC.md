---
id: architecture
type: architecture-design
status: active
title: Arquitectura: capas, contrato de datos y robustez del shell
tags: [architecture, data, resilience]
---

# Arquitectura

Base reutilizable de app de escritorio estilo ERP: SPA con Vite + React montada sobre una shell tipo
Blender. No hay backend, ni auth, ni empaquetado nativo (ver Limitaciones).

## Capas

`routes` compone y espera datos → `components/<módulo>` presenta → `data` define el contrato y los
fetchers → `lib` es lógica pura e infraestructura sin React.

- `routes/*.tsx` no escriben estados de carga ni de error: los pinta el router.
- `components/ui/` no importa de `data/` ni conoce módulos.
- La shell (`components/layout/`) no contiene strings de dominio: marca y empresa salen de
  `config/app.ts`. El contenido de los módulos (labels, contadores, favoritos) vive en
  `lib/modules.ts`, que es la fuente única del menú, el outliner, la paleta y las rutas.
- `lib/` no importa de `components/`, `routes/` ni `data/`, para que la lógica pura siga testeable sin
  React.
- Los primitivos de `ui/` son la única fuente de controles. Un botón nunca anida otro botón: cuando el
  ribbon necesita acción **y** menú, el chevron es un hermano absoluto del botón, no un hijo.
- Presupuesto del ribbon: fila de 96px → **75px útiles** por grupo (96 − 1 borde − 4 `pt` − 16
  rótulo). Caben tres filas de `SmallButton` (3 × 22 + 2 × 2 = 70) y el rótulo queda alineado en
  todos los grupos; una cuarta fila (94) desborda la fila y abre scroll vertical, así que a partir de
  cuatro el grupo pasa a dos columnas (`grid grid-cols-2`), como `Actions` de ACCOUNTING. Histórico:
  con la fila original de 84px solo cabían 59px y los rótulos de los grupos de tres filas se cortaban.
- Los colores de los componentes salen de tokens (`bg-bg`, `text-ink-dim`, `var(--borderL)`…). Hex
  hardcodeado solo en `styles/index.css` y en la galería de tokens: si no, el tema claro se rompe
  selectivamente, que es exactamente lo que pasó con los dos gráficos del dashboard.
- Los menús abiertos desde el ribbon se portalan a `document.body` con posición `fixed` calculada del
  trigger. No es preferencia estética: el `RibbonRow` tiene `overflow-x-auto`, y un panel en flujo
  quedaría recortado o generaría scroll vertical. Se cierran en `scroll`/`resize` para no quedar
  desanclados.
- Opciones seleccionables son `menuitemradio` con `aria-checked`; los comandos, `menuitem`. El rol se
  escribe por rama para no mezclar atributos ARIA incompatibles.

**Invariante:** toda ruta que consuma datos declara
`loader: ({ context }) => context.queryClient.ensureQueryData(...)` y lee con `useSuspenseQuery`.
El motivo es doble: con `defaultPreload: "intent"` el preload solo aporta si hay loader, y esperar los
datos antes de pintar elimina el waterfall del fetch posterior al montaje.

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
  inválido detiene el arranque a propósito (fail fast) en lugar de degradar en silencio.

## Robustez

| Fallo | Boundary | Qué ve el usuario |
|---|---|---|
| Loader de un módulo | `ModuleError` (`defaultErrorComponent`) | shell intacto + panel ERROR + RETRY |
| Render de un módulo | `ModuleError` | ídem |
| El propio shell | `ShellError` (`errorComponent` de `__root__`) | pantalla completa + RESTART |
| Navegación fría y lenta | `ModulePending` (`defaultPendingComponent`) | shell intacto + LOADING |

**Invariante:** los boundaries se declaran una vez en el router, no en cada ruta. Una ruta nueva
hereda los cuatro comportamientos sin escribirlos, y `QueryStatePanel` es el único cuerpo LOADING/ERROR
del repo.

## Calidad

- Gates: `tsc --noEmit`, `biome ci .`, `bun test`, `vite build`. El CI (`.github/workflows/ci.yml`)
  los corre en cada push a `main` y en cada PR; el hook pre-commit solo formatea y lint lo staged.
- Los tests de router usan el árbol real con `createMemoryHistory` + `renderToString`, sin DOM.
  Limitación conocida: el SSR de React no ejecuta `errorComponent`, así que la presencia del panel en
  cliente está cubierta por test de componente y por la ubicación del boundary, no por un E2E.
- `bun test` no tiene DOM: los tests de UI son SSR o de componente. Un test de interacción exige
  añadir un DOM (happy-dom) y es una decisión diferida.

## Limitaciones conocidas

- Sin backend real: el origen `http` solo se ejercita con `fetch` stubbeado.
- Sin empaquetado nativo (Tauri/Electron) ni offline: las tipografías vienen de Google Fonts.
- `zod` entra en el chunk de entrada vía `lib/env.ts` (+27 kB gzip).
- `period` y `view` viven en React context, no en la URL: sin deep-linking.
- Sin virtualización: `DataTable` pinta todas las filas de la página.
- `LICENSE` (MIT) usa como titular el handle del remoto (`JhonMA82`), sin confirmar por el autor.
