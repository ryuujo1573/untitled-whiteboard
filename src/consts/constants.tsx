import { AllTools } from "../models/Elements"
import { Cursor, ArrowRight, Square, Fonts, Images, Pen } from 'react-bootstrap-icons'
import { createElement, ReactElement, ReactNode } from "react";

interface ToolType {
    type: AllTools,
    icon: ReactNode,
    shortCut: 't' | 'x' | 'r' | 'v' | null,
}

export const TOOLS: ToolType[] = [
    {
        type: 'selector',
        icon: <Cursor />,
        shortCut: 'v',
    },
    {
        type: 'shape',
        icon: <Square />,
        shortCut: 'r',
    },
    {
        type: 'freedraw',
        icon: <Pen />,
        shortCut: 'x',
    },
    {
        type: 'text',
        icon: <Fonts />,
        shortCut: 't',
    },
    {
        type: 'image',
        icon: <Images />,
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