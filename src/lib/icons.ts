/**
 * SVG path map extracted verbatim from the source UI bundle
 * (Blender-Pro-Lab.html). Paths live on a 16×16 grid, stroked with
 * `currentColor` by the `Icon` component.
 */
export const ICONS = {
  save: "M3 3h9l2 2v9H3z M5 3v5h6",
  undo: "M7 3H4a4 4 0 0 0 0 8h3 M4 3l2 2 M4 3l2-2",
  redo: "M9 3h3a4 4 0 0 1 0 8H9 M12 3l-2 2 M12 3l-2-2",
  search: "M10 10l3 3 M7 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  plus: "M8 3v10 M3 8h10",
  import: "M8 3v8 M5 8l3 3 3-3 M3 13h10",
  export: "M8 13V5 M5 8l3-3 3 3 M3 3h10",
  grid: "M3 3h4v4H3z M9 3h4v4H9z M3 9h4v4H3z M9 9h4v4H9z",
  list: "M3 4h10 M3 8h10 M3 12h10",
  board: "M3 3h4v10H3z M9 3h4v6H9z",
  ledger: "M4 2h8v12H4z M6 5h4 M6 8h6 M6 11h5",
  chart: "M2 12l3-5 3 2 6-7",
  wave: "M2 8 Q4 3 6 8 T10 8 T14 8",
  hist: "M3 12V8 M6 12V5 M9 12V7 M12 12V3",
  filter: "M2 3h12l-5 5v4l-2 1v-5z",
  void: "M3 3l10 10 M3 13L13 3",
  archive: "M3 3h10v2H3z M4 5v8h8V5 M6 8h4",
  post: "M3 8l3 3 7-7",
  dupe: "M5 3h6v6H5z M8 5h4v8H5v-2",
  journal: "M5 2h7v12H5z M7 5h3 M7 8h3 M7 11h3",
  aging: "M8 2v2 M8 12v2 M2 8h2 M12 8h2 M8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  recon: "M3 6h10 M5 3v3 M10 3v3 M3 10h10 M5 10v3 M10 10v3",
  invoice: "M4 2h6l4 4v10H4z M8 6v4 M6 8h4",
  bill: "M4 2h8v12H4z M6 5h6 M6 8h6",
  expense: "M4 2h8v12H4z M6 8h6 M8 5v6",
  team: "M5 11a3 3 0 0 1 6 0 M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M10 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  payroll: "M4 2h8v12H4z M6 5h6 M6 8h3 M9 8h2 M6 11h6",
  user: "M8 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z M3 13a5 5 0 0 1 10 0",
  leave: "M8 2v4 M4 6h8 M4 6v8h8V6",
  folder: "M3 4h4l2 2h4v7H3z",
  dot: "M8 8a2 2 0 1 1 0.01 0",
} as const;

export type IconName = keyof typeof ICONS;
