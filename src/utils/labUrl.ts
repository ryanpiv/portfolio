import {
  defaultViewOptions,
  isLabTheme,
  isNameplateMode,
  type FieldViewOptions,
  type LabTheme,
} from "@data/lab";

export type LabQuery = {
  theme?: LabTheme;
  view: FieldViewOptions;
};

/** No theme preference, default view. */
export const defaultLabQuery: LabQuery = { view: defaultViewOptions };

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse `?theme=&names=&lines=` into typed values, ignoring junk. */
export function parseLabQuery(params: RawParams): LabQuery {
  const theme = first(params.theme);
  const names = first(params.names);
  const lines = first(params.lines);
  return {
    theme: isLabTheme(theme) ? theme : undefined,
    view: {
      nameplates: isNameplateMode(names) ? names : defaultViewOptions.nameplates,
      tetherLines:
        lines === "off" ? false : lines === "on" ? true : defaultViewOptions.tetherLines,
    },
  };
}

/**
 * Build `/lab/[variant]?…`. Only non-default view options are written so
 * links stay short; `theme` is always written when known.
 */
export function buildLabUrl(variantId: string, query: LabQuery): string {
  const search = new URLSearchParams();
  if (query.theme) search.set("theme", query.theme);
  if (query.view.nameplates !== defaultViewOptions.nameplates) {
    search.set("names", query.view.nameplates);
  }
  if (query.view.tetherLines !== defaultViewOptions.tetherLines) {
    search.set("lines", query.view.tetherLines ? "on" : "off");
  }
  const qs = search.toString();
  return `/lab/${variantId}${qs ? `?${qs}` : ""}`;
}
