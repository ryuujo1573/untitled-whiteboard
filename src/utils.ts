import { unstable_batchedUpdates } from "react-redux/es/utils/reactBatchedUpdates";
import { CURSOR_TYPE, FileExtension, ImageMimeTypes, MimeTypes, SVG_NS } from "./consts/constants";
import { AllTools, DataURL, FileId, ImageElement } from "./models/types";
import { fileOpen as _fileOpen } from "browser-fs-access";
import { randomId } from "./random";
import { nanoid } from "@reduxjs/toolkit";
import { files } from "./utils/canvas";

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
  }
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
 * 将对象转换为实时对象（console.log 使用）
 * @param obj 对象
 * @returns 实时对象
 */
export const getRealtimeObj = (obj: object) =>
  JSON.parse(JSON.stringify(obj))

/**
 * 将二进制文件转换成 DataURL
 * @param file 要转成 DataURL 的文件
 * @returns 值为 DataURL 的 Promise
 */
export const getDataURL = async (file: Blob | File): Promise<DataURL> => {
  return new Promise<DataURL>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      resolve(fileReader.result as DataURL)
    }
  })
}

/**
 * 根据传入的参数调用浏览器上传文件 api 并返回读取的文件
 * @returns 值为 File 类型的 Promise
 */
export const fileOpen = <M extends boolean | undefined = false>(opts: {
  extensions?: FileExtension[],
  description: string,
  multiple?: M,
}): Promise<M extends false | undefined ? File : File[]> => {
  type ReturnType = M extends false | undefined ? File : File[];

  // 要读取文件的 MIME 类型
  const mimeTypes = opts.extensions?.reduce((mimeTypes, type) => {
    mimeTypes.push(MimeTypes[type])
    return mimeTypes
  }, [] as string[])

  // 拓展类型数组
  const extensions = opts.extensions?.reduce((acc, ext) => {
    if (ext === 'jpg') return acc.concat('.jpg', '.jpeg')
    return acc.concat(`.${ext}`)
  }, [] as string[])

  // 调用 browser-fs-access 打开文件选框并上传文件
  return _fileOpen({
    description: opts.description,
    mimeTypes: mimeTypes,
    extensions: extensions,
    multiple: opts.multiple ?? false,
  }) as Promise<ReturnType>
}

export const createImageElement = ({
  fileId,
  x,
  y
}: {
  fileId?: FileId,
  x: number,
  y: number,
}): ImageElement => {
  return {
    id: randomId(),
    type: 'image',
    x,
    y,
    fileId: fileId ?? null,
  }
}

/**
 * 将 svg 二进制文件规范化后返回字符串
 * @param SVGBlob svg 二进制文件
 * @returns 规范化的 svg 字符串
 */
export const normalizeSVG = async (SVGBlob: File) => {
  const svgDoc = new DOMParser().parseFromString(await SVGBlob.text(), MimeTypes.svg)
  const svg = svgDoc.querySelector('svg')
  const errorNode = svgDoc.querySelector('parsererror')

  // 如果 errorNode 存在或者 svg 元素的结点名称不为 svg 则报错
  if (errorNode || svg?.nodeName !== 'svg') {
    throw new Error('无效的 SVGString')
  } else {
    // 如果没有 xmlns 属性则加上该属性
    if (!svg.hasAttribute('xmlns')) svg.setAttribute('xmlns', SVG_NS)

    // 如果没有宽高则从 viewBox 中匹配宽高并赋值给宽高属性
    if (!svg.hasAttribute('width') || !svg.hasAttribute('height')) {
      // 获取到 svg 的 viewBox 属性
      const viewBox = svg.getAttribute('viewBox')
      let width = svg.getAttribute('width') || '50'
      let height = svg.getAttribute('height') || '50'
      if (viewBox) {
        // 从 viewBox 中匹配 width height
        const match = viewBox.match(/\d+ +\d+ +(\d+) +(\d+)/)
        if (match) [, width, height] = match
      }
      // 设定宽高属性
      svg.setAttribute('width', width)
      svg.setAttribute('height', height)
    }
    utils.log('🍻 规范化 svg: ', svg.outerHTML)
    return svg.outerHTML
  }
}

/**
 * 通过 dataUrl 计算图片的宽高
 * @param dataUrl 图片的 dataUrl
 * @returns 值为 [width, height] 的　Promise
 */
const getWidthAndHeightFromDataURL = (dataUrl: DataURL): Promise<[width: number, height: number]> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        resolve([img.width, img.height])
      }
    } catch (error: any) {
      console.error(error)
      console.log(dataUrl);
      reject(new Error('无法从 data Url 中解析出宽高'))
    }
  })
}

export const isSupportedImageFile = (
  blob: Blob | null | undefined
): blob is Blob & { type: typeof ImageMimeTypes[number] } => {
  const { type } = blob || {}
  return (
    !!type && (ImageMimeTypes as readonly string[]).includes(type)
  )
}

export const initializeImageElement = async ({
  imageFile,
  imageElement,
  canvas,
}: {
  imageFile: File,
  imageElement: ImageElement,
  canvas: HTMLCanvasElement | null,
}) => {
  if (!isSupportedImageFile(imageFile)) {
    throw new Error('不支持的文件类型')
  }
  // 获取图片文件的 MIME 类型
  const mimeType = imageFile.type
  // 将鼠标样式调整为 wait
  // canvas && (canvas.style.cursor = 'wait')

  // 如果是 svg 则进行相关处理
  if (mimeType === MimeTypes.svg) {
    try {
      imageFile = new File(
        [new TextEncoder().encode(await normalizeSVG(imageFile))],
        imageFile.name,
        { type: MimeTypes.svg }
      ) as File & { type: typeof MimeTypes.svg }
      utils.log('⛏️ imageFile.type', imageFile.type)
    } catch (error: any) {
      console.warn(error)
      throw new Error('初始化图片失败')
    }
  }
  // 生成 fileId
  const fileId: FileId = nanoid()

  const dataURL = files[fileId]?.dataURL || (await getDataURL(imageFile))

  // 将 fileId 赋给 imageElement
  imageElement.fileId = fileId
  utils.log('🤔 imageElement before return Promise', JSON.parse(JSON.stringify(imageElement)))
  // 将生成的文件存到 files 中
  files[fileId] = {
    mimeType,
    id: fileId,
    dataURL,
    createdDate: Date.now()
  };
  // 获取图片的宽高赋给 width height
  [imageElement.width, imageElement.height] = await getWidthAndHeightFromDataURL(dataURL)
  utils.log('🤔 imageElement after get width height', getRealtimeObj(imageElement))
}