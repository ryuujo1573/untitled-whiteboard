import { TOOLS } from "../consts/constants"
import { ToolsInBar } from "../models/types"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { capitalizeString, createImageElement, fileOpen, initializeImageElement, setCursorForTool, utils } from "../utils"
import { clsx } from "clsx";
import { ImageAdded, switchTool } from "../redux/features/canvasSlice";
import React from "react";

interface ToolBarProps {
  id: string,
  canvas: HTMLCanvasElement | null
  // icon: Pick<ToolType, 'icon'>
}

/**
 * 工具栏组件
 * @param param0 {canvas} canvas: 当前 canvas 实例
 * @returns 工具栏
 */
const ToolBar: React.FC<ToolBarProps> = ({
  canvas,
}) => {
  const tool = useAppSelector(state => state.canvas.present.tool)
  const dispatch = useAppDispatch()

  const getToolTitleFromType = (type: ToolsInBar): string => {
    const titles: Record<ToolsInBar, string> = {
      selector: '选择 - V',
      freedraw: '自由曲线 - X',
      rect: '矩形 - R',
      circle: '圆形 - O',
      text: '文本 - T',
      image: '图片'
    }
    return titles[type]
  }

  const onImageAction: () => void = async () => {
    // TODO 等待具体实现
    try {
      // TODO 获取到真正的坐标
      const { x, y } = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

      // 打开文件上传框并读取上传的文件
      const imageFile = await fileOpen({
        description: "图像文件",
        extensions: ['jpg', 'png', 'svg', 'gif']
      })
      utils.log('🧩 here is the image')
      utils.log(imageFile)

      // 创建 imageElement
      const imageElement = createImageElement({
        x,
        y,
      })
      utils.log('🎊 create imageElement', imageElement)

      try {
        await initializeImageElement({
          imageFile,
          imageElement,
          canvas,
        })
        dispatch(ImageAdded(imageElement))
      } catch (error: any) {
        console.error(error);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error(error)
      else console.warn(error)
    }
  }

  return (
    <div id="tool-bar">
      {TOOLS.map(({ type, icon, shortCut }) => {
        return (
          <label
            key={type}
            className={clsx("tool", type === tool && 'checked')}
            title={getToolTitleFromType(type)}
          >
            <input
              type='radio'
              className='tool-button'
              name="tool-button"
              onChange={(event) => {
                if (tool !== type && type !== 'image') {
                  dispatch(switchTool(type));
                  setCursorForTool(canvas, type)
                }
                // TODO 打开选择图片操作
                if (type === 'image') onImageAction();
              }}
              checked={type === tool}
            // TODO 写好选择图片后取消
            // disabled={type === 'image'}
            />
            <div className="tool-icon">
              {icon}
              <span className="shortcut">{capitalizeString(shortCut)}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

export default ToolBar