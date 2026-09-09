import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from 'ag-grid-community'

/**
 * Registered once, here, rather than per-grid — AG-Grid v33+ requires
 * explicit module registration before any <AgGridReact> renders.
 * AllCommunityModule (not a hand-picked subset) trades a slightly larger
 * bundle for "a grid never silently breaks because a module wasn't
 * registered" — worth it until bundle size is a real problem.
 */
ModuleRegistry.registerModules([AllCommunityModule])

/**
 * Hand-kept in sync with the --color-brand-500/ink-* tokens in index.css —
 * AG-Grid's Theming API takes literal values, not CSS custom properties.
 */
export const gridTheme = themeQuartz.withParams({
  accentColor: '#3560f6',
  borderColor: '#dbdfe6',
  headerBackgroundColor: '#f6f7f9',
  headerTextColor: '#515b6c',
  headerFontSize: 12,
  fontSize: 13,
  fontFamily: 'inherit',
  rowHeight: 40,
  headerHeight: 36,
  borderRadius: 8,
  wrapperBorderRadius: 8,
})

/** Server-side sorting only (see gridDatasource.ts) — client filter popovers are off; each grid gets its own explicit filter UI instead. */
export const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: false,
}

/** Must match backend hrms.pagination.GridPagination.default_limit — how many rows AG-Grid requests per block. */
export const GRID_BLOCK_SIZE = 25
