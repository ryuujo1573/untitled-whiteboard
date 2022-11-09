import React, { useState } from "react";
import { AllTools } from "../models/Elements";
import Menu from "./Menu";
import ToolBar from "./ToolBar";

interface OperationUIProps {
    tool: AllTools,
    setTool: React.Dispatch<React.SetStateAction<AllTools>>,
}

const OperationUI: React.FC<OperationUIProps> = ({
    setTool,
    tool,
}) => {
    return (
        <div id="operation-ui">
            <Menu />
            <ToolBar
                id="toolbar"
                tool={tool}
                setTool={setTool}
            />
        </div>
    )
}

export default OperationUI