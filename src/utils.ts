import { unstable_batchedUpdates } from "react-redux/es/utils/reactBatchedUpdates";
import { CURSOR_TYPE, FileExtention, MIME_TYPES } from "./consts/constants";
import { AllTools } from "./models/Elements";
import { fileOpen as _fileOpen } from "browser-fs-access";

export const utils = {
  shouldSkipLogging: false,
  log: (message: any, ...args: any[]) => {
    if (utils.shouldSkipLogging) {
      return;
    }
    console.log(message, ...args);
  }
}

export const throttleByAnimationFrame = <T extends any[]>(
  func: (...arg: T) => void,
  opts?: { trailing?: boolean },
) => {
  let timerId: number | null = null;
  let lastArgs: T | null = null;
  let lastArgsTrailing: T | null = null;

  const scheduleFunc = (args: T) => {
    timerId = window.requestAnimationFrame(() => {
      timerId = null;
      func(...args);
      lastArgs = null;
      if (lastArgsTrailing) {
        lastArgs = lastArgsTrailing;
        lastArgsTrailing = null;
        scheduleFunc(lastArgs);
      }
    });
  };

  const ret = (...args: T) => {
    if (process.env.NODE_ENV === "test") {
      func(...args);
      return;
    }
    lastArgs = args;
    if (timerId === null) {
      scheduleFunc(lastArgs);
    } else if (opts?.trailing) {
      lastArgsTrailing = args;
    }
  };
  ret.flush = () => {
    if (timerId !== null) {
      cancelAnimationFrame(timerId);
      timerId = null;
    }
    if (lastArgs) {
      func(...(lastArgsTrailing || lastArgs));
      lastArgs = lastArgsTrailing = null;
    }
  };
  ret.cancel = () => {
    lastArgs = lastArgsTrailing = null;
    if (timerId !== null) {
      cancelAnimationFrame(timerId);
      timerId = null;
    }
  };
  return ret;
}

type Callback<P> = (event: P) => any;


export const withBatchedUpdates = <P, T extends Callback<P> = Callback<P>>
  (func: T) => (event: P) =>
    unstable_batchedUpdates(func, event);

export const withBatchedUpdatesThrottled = <P, T extends Callback<P> = Callback<P>>
  (func: T) => throttleByAnimationFrame((event: P) =>
    unstable_batchedUpdates(func, event));

export const isTestEnv = () =>
  typeof process !== "undefined" && process.env?.NODE_ENV === "test";

/**
 * 为选中的工具设定特定的鼠标样式
 * @param canvas 画板对象
 * @param tool 当前工具栏选中工具
 */
export const setCursorForTool = (
  canvas: HTMLCanvasElement | null,
  tool: AllTools,
) => {
  utils.log(`🤔 tool: ${tool}`)
  if (tool === 'selector') canvas && (canvas.style.cursor = CURSOR_TYPE.AUTO);
  else canvas && (canvas.style.cursor = CURSOR_TYPE.CROSSHAIR)
}

/**
 * 首字母大写传入的字符串
 * @param str 要首字母大写的字符串
 * @returns 首字母大写
 */
export const capitalizeString = (str: string | null) => str && `${str.charAt(0).toUpperCase()}${str.slice(1)}`

export const fileOpen = <M extends boolean | undefined = false>(opts: {
  extensions?: FileExtention[],
  description: string,
  multiple?: M,
}): Promise<M extends false | undefined ? File : File[]> => {
  type ReturnType = M extends false | undefined ? File : File[];

  const mimeTypes = opts.extensions?.reduce((mimeTypes, type) => {
    mimeTypes.push(MIME_TYPES[type])
    return mimeTypes
  }, [] as string[])

  const extensions = opts.extensions?.reduce((acc, ext) => {
    if (ext === 'jpg') return acc.concat('.jpg', '.jpeg')
    return acc.concat(`.${ext}`)
  }, [] as string[])
  return _fileOpen({
    description: opts.description,
    mimeTypes: mimeTypes,
    extensions: extensions,
    multiple: opts.multiple ?? false,
  }) as Promise<ReturnType>
}