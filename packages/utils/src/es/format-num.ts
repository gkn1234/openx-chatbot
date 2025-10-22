/**
 * 将数字转换为带有单位的数字字符串
 * @param num 待转换数字
 * @param digits 保留小数的位数
 * @param belowOne 是否允许转换数字小于1，如 300 -> 0.3K
 * @param range 每一个单位之间转换的大小
 * @param units 单位列表
 * @returns 转换后的字符串
 */
export function formatNumWithUnits(
  num: number,
  digits: number = 0,
  belowOne: boolean = false,
  range: number = 1000,
  units: string[] = ['K', 'M', 'G', 'T'],
) {
  const op = num < 0 ? '-' : '';
  const validDigits = Math.floor(Math.abs(digits));
  let curNum = Math.abs(num);
  let index = -1;
  let left = curNum / range;

  // 检查是否应该继续循环
  const shouldContinue = (left: number) => {
    if (left >= 1 && validDigits >= 0)
      return true;
    if (left >= 0.1 && left < 1 && validDigits > 0 && belowOne)
      return true;
    return false;
  };

  while (shouldContinue(left) && index < units.length - 1) {
    index++;
    curNum = left;
    left /= range;
  }
  const pow = 10 ** digits;
  curNum = Math.floor(curNum * pow) / pow;
  const unit = index >= 0 && index < units.length ? units[index] : '';
  return `${op}${curNum}${unit}`;
}
