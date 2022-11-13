import { TOOLS } from "../consts/constants"
import { AllTools, ToolsInBar } from "../models/types"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { capitalizeString, setCursorForTool } from "../utils"
import { clsx } from "clsx";
import { switchTool } from "../redux/features/canvasSlice";

interface ToolBarProps {
  id: string,
  canvas: HTMLCanvasElement | null
  // icon: Pick<ToolType, 'icon'>
}

/**
 * 工具栏组件
 * @param param0 {tool, setTool, canvas} tool: 当前工具栏工具 setTool: 设定当前工具的状态管理函数 canvas: 当前 canvas 实例
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

  const onImageAction = async () => {
    // TODO 等待具体实现
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
              disabled={type === 'image'}
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