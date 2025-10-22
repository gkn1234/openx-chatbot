export class SearchDetailDto {
  list!: SearchDetailItem[];

  maxLength?: number;
}

export interface SearchDetailItem {
  title: string

  url: string

  content: string
}
