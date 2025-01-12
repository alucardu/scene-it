export type Match = {
  id: string;
  release_date: YearDifferenceCategory;
  title: string;
}

export enum YearDifferenceCategory {
  SameYear = "SAME_YEAR",
  Within1Year = "WITHIN_1_YEAR",
  Within5Years = "WITHIN_5_YEARS",
  MoreThan5Years = "MORE_THAN_5_YEARS",
}
