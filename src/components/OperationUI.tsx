import React, { useState } from "react";
import { AllTools } from "../models/Elements";
import Menu from "./Menu";
import ToolBar from "./ToolBar";

interface OperationUIProps {
    tool: AllTools,
    setTool: React.Dispatch<React.SetStateAction<AllTools>>,
    canvas: HTMLCanvasElement | null
}

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