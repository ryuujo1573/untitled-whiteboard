import { CURSOR_TYPE } from "./consts/constants";
import { AllTools } from "./models/Elements";

export const utils = {
  shouldSkipLogging: false,
  log: (message: any, ...args: any[]) => {
    if (utils.shouldSkipLogging) {
      return;
    }
    console.log(message, ...args);
  }
}

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
export const capitalizeString = (str: string | null) => str && `${str.charAt(0).toUpperCase}${str.slice(1)}`