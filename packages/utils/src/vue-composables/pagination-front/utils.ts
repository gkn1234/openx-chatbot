import type { NotUndefined } from '../../es';
import type { UsePaginationFrontOptions } from './types';
import { isObjectLike } from '../../es';

type FilterHandler = NotUndefined<UsePaginationFrontOptions['onListFilter']>;
type SortHandler = NotUndefined<UsePaginationFrontOptions['onSort']>;
type SliceHandler = NotUndefined<UsePaginationFrontOptions['onSlice']>;

export const slicePageFrontHandler: SliceHandler = (list, filters) => {
  const start = (filters.current - 1) * filters.size;
  const end = start + filters.size;
  return list.slice(start, end);
};

export const sortPageFrontHandler: SortHandler = (list, fillters) => {
  if (!list.length || !fillters.sortType)
    return list;

  const key = fillters.sortProp;
  const isSortingObject = key && isObjectLike(list[0]) && isObjectLike(list[0]);

  return list.sort((a, b) => {
    const aValue = isSortingObject ? a[key] : a;
    const bValue = isSortingObject ? b[key] : b;
    if (typeof aValue === 'number')
      return fillters.sortType === 'asc' ? aValue - bValue : bValue - aValue;

    return fillters.sortType === 'asc' ?
        aValue.toString().localeCompare(bValue.toString()) :
        bValue.toString().localeCompare(aValue.toString());
  });
};

export const filterPageFrontHandler: FilterHandler = (list, fillters) => {
  if (!fillters.keywords) {
    return list;
  }

  return list.filter((item) => {
    if (typeof item === 'string')
      return item.includes(fillters.keywords);

    if (!isObjectLike(item))
      return false;

    return Object.values(item).some((value) => {
      if (typeof value === 'string')
        return value.includes(fillters.keywords);

      return false;
    });
  });
};
