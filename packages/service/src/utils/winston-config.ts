import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { workspace } from './consts';

// 定义日志级别颜色
const levelsColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'cyan',
};

// 自定义格式化器，用于拆分context
const contextSplitter = format((info) => {
  const { context, error, ...rest } = info;
  const isContextObject = context && typeof context === 'object';
  const { context: contextInObj, ...restContext } = isContextObject ? context : {} as any;
  // 自定义错误格式化器，只保留message和stack
  if (error && error instanceof Error) {
    const symbols = Object.getOwnPropertySymbols(info);
    return {
      ...restContext,
      level: info.level,
      timestamp: info.timestamp,
      message: error.message,
      stack: error.stack,
      context: contextInObj,
      hasError: true,
      [symbols[0]]: info[symbols[0]],
    };
  }

  return {
    ...restContext,
    ...rest,
    context: isContextObject ? contextInObj : context,
  };
});

export function createWinstonLogger() {
  return createLogger({
    transports: [
      new DailyRotateFile({
        filename: workspace('logs/%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.errors({ stack: true }),
          contextSplitter(),
          format.json(),
        ),
      }),
      new transports.Console({
        format: format.combine(
          format.colorize({
            colors: levelsColors,
          }),
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.errors({ stack: true }),
          contextSplitter(),
          format.simple(),
          format.printf((info) => {
            // 获取 Info Symbols key
            const symbols = Object.getOwnPropertySymbols(info);
            const color = levelsColors[info[symbols[0]] as any];
            const chalkColor = chalk[color] || ((str: string) => str);

            if (info.hasError) {
              return `${chalkColor(info.timestamp)} ${chalkColor(info.message)} ${chalkColor(info.stack)}`;
            }

            return `${chalkColor(info.timestamp)} ${chalkColor(info[symbols[2]])}`;
          }),
        ),
      }),
    ],
  });
}
