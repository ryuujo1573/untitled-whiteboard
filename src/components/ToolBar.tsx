import { AllTools } from "../models/Elements"

interface ToolBarProps {
    id: string,
    tool: AllTools,
    setTool: React.Dispatch<React.SetStateAction<AllTools>>,
}

const ToolBar: React.FC<ToolBarProps> = () => {
    return (<></>)
}

export default ToolBar