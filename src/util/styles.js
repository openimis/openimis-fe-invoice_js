export const defaultPageStyles = (theme) => ({
  "& .page": theme.page ?? {},
});

export const defaultFilterStyles = (theme) => ({
  "& .form": {
    padding: theme.spacing(1),
  },
  "& .item": {
    padding: theme.spacing(1),
  },
});

export const defaultHeadPanelStyles = (theme) => ({
  "& .tableTitle": theme.table?.title ?? {},
  "& .form": {
    padding: theme.spacing(1),
  },
  "& .item": {
    padding: theme.spacing(1),
    ...(theme.paper?.item ?? {}),
  },
  "& .fullHeight": {
    height: "100%",
  },
});

export const defaultDialogStyles = (theme) => ({
  "& .item": theme.paper?.item ?? {},
});
