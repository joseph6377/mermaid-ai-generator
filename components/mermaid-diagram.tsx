"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code || !containerRef.current) return

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          securityLevel: "loose",
        })

        const { svg } = await mermaid.render("mermaid-diagram-" + Math.random().toString(36).substring(2, 11), code)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
        setError(null)
      } catch (err) {
        console.error("Failed to render mermaid diagram:", err)
        setError("Failed to render diagram. Please check the mermaid syntax.")
      }
    }

    renderDiagram()
  }, [code])

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return <div ref={containerRef} className="mermaid-container max-w-full" />
}

