import { unstable_batchedUpdates } from "react-redux/es/utils/reactBatchedUpdates";
import { CURSOR_TYPE } from "./consts/constants";
import { AllTools } from "./models/types";
import elements from "./testElements";

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
  if (tool === 'selector') canvas && (canvas.style.cursor = CURSOR_TYPE.AUTO);
  else canvas && (canvas.style.cursor = CURSOR_TYPE.CROSSHAIR)
}

/**
 * 首字母大写传入的字符串
 * @param str 要首字母大写的字符串
 * @returns 首字母大写
 */
export const capitalizeString = (str: string | null) => str && `${str.charAt(0).toUpperCase()}${str.slice(1)}`

export const colorize = (str: string, format: 'rgb' | 'hex' | 'hsl' | 'r,g,b' = 'r,g,b') => {
  if (str) {
    const hash = str.split('').reduce((l, r) => l + r.charCodeAt(0) + (l << 5), 0);

    switch (format) {
      case 'rgb': return `rgb(${(hash & 0xff0000) >> 16},${(hash & 0x00ff00) >> 8},${hash & 0x0000ff})`;
      case 'hex': return `#${(hash & 0x00ffffff).toString(16).substring(0, 6).padStart(6, '0')}`;
      case 'hsl': {
        const r = ((hash & 0xff0000) >> 16) / 255;
        const g = ((hash & 0x00ff00) >> 8) / 255;
        const b = (hash & 0x0000ff) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return `hsl(${Math.round(h * 360)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
      }
      case 'r,g,b':
        return [(hash & 0xff0000) >> 16, (hash & 0x00ff00) >> 8, hash & 0x0000ff].join(',');
    }
  };
  return '';
}

export function toMappedList<T extends { id: string }>(list: T[]) {
  return {
    indices: list.map(ele => ele.id),
    elementById: Object.fromEntries(list.map(e => [e.id, e])),
    // elementById: new Map(list.map(e => [e.id, e])),
  }
}

/**
 * 添加一个元素到 Map 化的 list
 * @param mappedList Map 化的 list
 * @param item 要添加到 list 的元素
 */
 export function addOneToMappedList<T extends ReturnType<typeof toMappedList>, P extends Parameters<typeof toMappedList>[number][number]>(mappedList: T, item: P) {
  mappedList.indices.push(item.id)
  mappedList.elementById[item.id] = item
}
