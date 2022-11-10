import { AllTools } from "../models/Elements"

interface ToolType {
    type: AllTools,
    icon: null,
    shortCut: 't' | 'x' | 'r' | 'v' | null,
}

export const TOOLS: ToolType[] = [
    {
        type: 'selector',
        icon: null,
        shortCut: 'v',
    },
    {
        type: 'shape',
        icon: null,
        shortCut: 'r',
    },
    {
        type: 'freedraw',
        icon: null,
        shortCut: 'x',
    },
    {
        type: 'text',
        icon: null,
        shortCut: 't',
    },
    {
        type: 'image',
        icon: null,
        shortCut: null
    }
]

export const CURSOR_TYPE = {
    TEXT: "text",
    CROSSHAIR: "crosshair",
    GRABBING: "grabbing",
    GRAB: "grab",
    POINTER: "pointer",
    MOVE: "move",
    AUTO: "",
};