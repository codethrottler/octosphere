import type { IDatasource, IGetRowsParams } from 'ag-grid-community'

import type { PagedResponse } from '@/lib/api'

interface PageRequest {
  limit: number
  offset: number
  /** DRF-style: "field" or "-field" for descending. Undefined = backend default ordering. */
  ordering?: string
}

/**
 * Bridges AG-Grid's Infinite Row Model (Community-tier — the Server-Side
 * Row Model that would otherwise fit "server pagination" better is
 * Enterprise-only) to a DRF limit/offset endpoint: startRow/endRow become
 * offset/limit, and the grid's single-column sortModel becomes a DRF
 * `ordering` string. Multi-column sort isn't exposed — the backend's
 * `ordering` param only takes one field (see hrms/filters.py) — so only
 * the first sort entry is used.
 *
 * `colId` on each column must equal the API field name for sorting on
 * that column to do anything; unsortable columns just won't reorder.
 */
export function createInfiniteDatasource<T>(fetchPage: (request: PageRequest) => Promise<PagedResponse<T>>): IDatasource {
  return {
    getRows: async (params: IGetRowsParams) => {
      const limit = params.endRow - params.startRow
      const [firstSort] = params.sortModel
      const ordering = firstSort ? `${firstSort.sort === 'desc' ? '-' : ''}${firstSort.colId}` : undefined

      try {
        const page = await fetchPage({ limit, offset: params.startRow, ordering })
        params.successCallback(page.results, page.count)
      } catch {
        params.failCallback()
      }
    },
  }
}
