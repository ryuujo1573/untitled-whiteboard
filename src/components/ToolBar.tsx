import { TOOLS } from "../consts/constants"
import { AllTools } from "../models/Elements"
import { capitalizeString, fileOpen, setCursorForTool, utils } from "../utils"
import { clsx } from 'clsx'

interface ToolBarProps {
  id: string,
  tool: AllTools,
  setTool: (type: AllTools) => void,
  canvas: HTMLCanvasElement | null
  // icon: Pick<ToolType, 'icon'>
}

/**
 * 工具栏组件
 * @param param0 {tool, setTool, canvas} tool: 当前工具栏工具 setTool: 设定当前工具的状态管理函数 canvas: 当前 canvas 实例
 * @returns 工具栏
 */
const ToolBar: React.FC<ToolBarProps> = ({
  tool,
  setTool,
  canvas,
  // icon,
}) => {
  const getToolTitleFromType = (type: AllTools): string => {
    const titles: Record<AllTools, string> = {
      selector: '选择 - V',
      freedraw: '自由曲线 - X',
      shape: '形状 - R',
      text: '文本 - T',
      image: '图片'
    }
    return titles[type]
  }

  const onImageAction = async () => {
    try {
      // TODO 获取到真正的坐标
      const { x, y } = { x: 1, y: 2 }
      const imageFile = await fileOpen({
        description:"图像文件"
      })
    } catch (error) {

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
                if (tool !== type) {
                  setTool(type);
                  setCursorForTool(canvas, type)
                }
                // TODO 打开选择图片操作
                if (type === 'image') return;
              }}
              checked={type === tool}
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