type KeyColor = string;
type LegendColor = string;
type Margin = number;
type Size = number;
type Formatting = {c: KeyColor; t: LegendColor};
type Dimensions = {marginX: Margin; marginY: Margin; size: Size};
export type Result = Formatting & Dimensions & {label: string};
export type ParsedKLE = {
  res: Result[][];
  colorMap: {[k: string]: string};
};
