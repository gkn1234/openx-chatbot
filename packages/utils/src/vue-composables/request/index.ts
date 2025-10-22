import type {
  PartialWhenObj,
  UseRequestOptions,
} from './types';
import { UseRequest } from './request';

export function useRequest<
  Data = any,
  Default extends PartialWhenObj<Data> = PartialWhenObj<Data>,
>(options: UseRequestOptions<Data, Default>) {
  return new UseRequest<Data, Default>(options);
}

export { UseRequest };
export type * from './types';
