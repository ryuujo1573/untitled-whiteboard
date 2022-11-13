import React, { useState } from "react";
import { AllTools } from "../models/types";
import Menu from "./Menu";
import ToolBar from "./ToolBar";

import './OperationUI.scss'

interface OperationUIProps {
    canvas: HTMLCanvasElement | null,
}

/**
 * 与操作相关的 UI
 * @param param0 {tool, setTool, canvas} tool: 当前工具栏工具 setTool: 设定当前工具的状态管理函数 canvas: 当前 canvas 实例
 * @returns 操作 UI 组件
 */
const OperationUI: React.FC<OperationUIProps> = ({
    canvas
}) => {
    return (
        <div id="operation-ui">
            {/* TODO Menu 暂时没有实现 */}
            <Menu />
            <ToolBar
                id="toolbar"
                canvas={canvas}
            />
        </div>
    )
}

export default OperationUI