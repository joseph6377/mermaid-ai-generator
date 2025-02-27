"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [sanitizedCode, setSanitizedCode] = useState<string>(code)

  useEffect(() => {
    // Simple code sanitization to fix common issues
    let processedCode = code.trim()
    
    // Try to detect and fix common syntax errors
    if (processedCode && !processedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/i)) {
      // If no valid header but has arrow notation, assume it's a flowchart
      if (processedCode.includes('-->') || processedCode.includes('--')) {
        processedCode = 'flowchart TD\n' + processedCode
      }
    }
    
    // Replace "graph" with "flowchart" when possible (for newer Mermaid versions)
    if (processedCode.startsWith('graph ')) {
      processedCode = processedCode.replace(/^graph /, 'flowchart ')
    }
    
    setSanitizedCode(processedCode)
  }, [code])

  useEffect(() => {
    if (!sanitizedCode || !containerRef.current) return

    const renderDiagram = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
        
        // Configure mermaid
        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          securityLevel: "loose",
          maxTextSize: 50000,
          fontFamily: "inherit",
          logLevel: 'error',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        })

        // Unique ID to prevent rendering conflicts
        const id = "mermaid-diagram-" + Math.random().toString(36).substring(2, 11)
        
        // Render the diagram
        const { svg } = await mermaid.render(id, sanitizedCode)
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          
          // Add styles to the SVG to make it responsive
          const svgElement = containerRef.current.querySelector("svg")
          if (svgElement) {
            svgElement.style.maxWidth = "100%"
            svgElement.style.height = "auto"
            svgElement.style.borderRadius = "0.5rem"
          }
        }
        setError(null)
      } catch (err: any) {
        console.error("Failed to render mermaid diagram:", err)
        setError(err.message || "Failed to render diagram. Please check the mermaid syntax.")
      }
    }

    renderDiagram()
  }, [sanitizedCode])

  if (error) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-destructive p-4 text-sm bg-destructive/10 rounded-md">
          <p className="font-medium">Error rendering diagram:</p>
          <p>{error}</p>
        </div>
        <div className="p-4 bg-muted rounded-md">
          <pre className="text-xs overflow-x-auto">{sanitizedCode}</pre>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg p-4" 
    />
  )
}

