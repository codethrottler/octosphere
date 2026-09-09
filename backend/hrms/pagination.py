from rest_framework.pagination import LimitOffsetPagination


class GridPagination(LimitOffsetPagination):
    """
    limit/offset (not DRF's default page-number pagination) because it
    maps directly onto AG-Grid's Infinite Row Model block requests
    (startRow -> offset, endRow-startRow -> limit) — see
    frontend/src/widgets/gridDefaults.ts. Used by the 3 AG-Grid-backed
    list endpoints (employees, attendance records, leave requests), not
    set as the project-wide default in settings.py since most other list
    endpoints here are small catalog tables that don't need it.
    """

    default_limit = 25
    max_limit = 200
