interface PopulateOptions {
  path: string;
  select?: string;
  match?: object;
}

export interface Options {
  page?: number;
  limit?: number;
  sortBy?: string;
  projection?: string;
  populate?: PopulateOptions[];
}
