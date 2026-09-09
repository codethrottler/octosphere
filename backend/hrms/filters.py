def apply_ordering(queryset, ordering_param: str | None, allowed_fields: set[str]):
    """
    Apply `?ordering=field` / `?ordering=-field` if `field` (sans leading
    `-`) is in `allowed_fields`; silently ignore anything else rather than
    letting AG-Grid's sortModel drive arbitrary queryset.order_by() calls.
    """
    if not ordering_param:
        return queryset
    field = ordering_param[1:] if ordering_param.startswith("-") else ordering_param
    if field not in allowed_fields:
        return queryset
    return queryset.order_by(ordering_param)
