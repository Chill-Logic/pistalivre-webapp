export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Bootstrap-style widths: `span` is mobile, the rest apply from the breakpoint up. */
export type ColSpans = {
  span?: ColSpan;
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  xl?: ColSpan;
};

/** `{ span: 12, md: 6 }` → "col-12 col-md-6" (classes from index.css). */
export function colClasses({ span = 12, sm, md, lg, xl }: ColSpans) {
  return [
    `col-${span}`,
    sm && `col-sm-${sm}`,
    md && `col-md-${md}`,
    lg && `col-lg-${lg}`,
    xl && `col-xl-${xl}`,
  ]
    .filter(Boolean)
    .join(" ");
}
