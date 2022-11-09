import React, { useState } from "react";
import { AllTools } from "../models/Elements";

interface OperationUIProps {
    setTool: React.Dispatch<React.SetStateAction<AllTools>>
}

const OperationUI: React.FC<OperationUIProps> = ({
    setTool
}) => {
    return (
        <div id="operation-ui">

        </div>
    )
}

export default OperationUI