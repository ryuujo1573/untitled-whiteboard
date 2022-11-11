import React, { useState } from "react";
import { AllTools } from "../models/Elements";
import Menu from "./Menu";
import ToolBar from "./ToolBar";

interface OperationUIProps {
    tool: AllTools,
    setTool: (type: AllTools) => void,
    canvas: HTMLCanvasElement | null,
}

/**
 * 与操作相关的 UI
 * @param param0 {tool, setTool, canvas} tool: 当前工具栏工具 setTool: 设定当前工具的状态管理函数 canvas: 当前 canvas 实例
 * @returns 操作 UI 组件
 */
const OperationUI: React.FC<OperationUIProps> = ({
    tool,
    setTool,
    canvas
}) => {
    return (
        <div id="operation-ui">
            {/* TODO Menu 暂时没有实现 */}
            <Menu />
            {/* TODO ToolBar 暂时没有具体实现 */}
            <ToolBar
                id="toolbar"
                tool={tool}
                setTool={setTool}
                canvas={canvas}
            />
        </div>
    )
}

export default OperationUI