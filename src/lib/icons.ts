import {
  Archive,
  CalendarDays,
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  LayoutDashboard,
  LayoutGrid,
  List,
  Moon,
  Pencil,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Sun,
  Undo2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

/**
 * Curated icon vocabulary. The library (`lucide-react`) is an implementation
 * detail: components and the navigation registry only know these names, so the
 * vocabulary stays small, typed and tree-shaken.
 *
 * Add an icon by mapping one more name here (`bun run lint` rejects a direct
 * `lucide-react` import anywhere else).
 */
export const ICONS = {
  // Verbs
  plus: Plus,
  save: Save,
  undo: Undo2,
  redo: Redo2,
  search: Search,
  filter: Filter,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  x: X,
  copy: Copy,
  edit: Pencil,
  archive: Archive,
  more: Ellipsis,
  external: ExternalLink,
  export: Download,
  import: Upload,
  // Objects
  folder: FolderOpen,
  file: FileText,
  list: List,
  grid: LayoutGrid,
  board: LayoutDashboard,
  chart: ChartLine,
  histogram: ChartColumn,
  // Types
  user: User,
  users: Users,
  clock: Clock,
  calendar: CalendarDays,
  settings: Settings,
  sun: Sun,
  moon: Moon,
} as const;

/** Every icon name the app can render; derived, so an unknown key fails `tsc`. */
export type IconName = keyof typeof ICONS;
