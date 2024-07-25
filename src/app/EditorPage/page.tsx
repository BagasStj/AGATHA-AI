'use client'

import {
    EditorBubble,
    EditorBubbleItem,
    EditorCommand,
    EditorCommandItem,
    EditorContent,
    EditorRoot,
} from "novel";
import { useTheme } from 'next-themes'

export default function EditorPage() {
    const { theme, systemTheme } = useTheme()

    // Fallback to system theme if theme is not set
    const currentTheme = theme === 'system' ? systemTheme : theme

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Novel Editor</h1>
            <EditorRoot>
                <EditorContent>
                    <EditorCommand>
                        <EditorCommandItem onCommand={() => {}} />
                     
                    </EditorCommand>
                    <EditorBubble>
                        <EditorBubbleItem>Bubble Item 1</EditorBubbleItem>
                     
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    )
}