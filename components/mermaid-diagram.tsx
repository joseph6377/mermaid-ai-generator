"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [sanitizedCode, setSanitizedCode] = useState<string>(code)
  const [svgRendered, setSvgRendered] = useState(false)

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
          setSvgRendered(true)
        }
        setError(null)
      } catch (err: any) {
        console.error("Failed to render mermaid diagram:", err)
        setError(err.message || "Failed to render diagram. Please check the mermaid syntax.")
        setSvgRendered(false)
      }
    }

    renderDiagram()
  }, [sanitizedCode])

  const downloadAsPng = () => {
    if (!containerRef.current) return
    
    const svgElement = containerRef.current.querySelector("svg")
    if (!svgElement) return
    
    try {
      // Clone the SVG to avoid modifying the displayed one
      const clonedSvg = svgElement.cloneNode(true) as SVGElement
      
      // Get the dimensions
      const bbox = svgElement.getBBox()
      const width = Math.max(bbox.width, 10)
      const height = Math.max(bbox.height, 10)
      
      // Set a white background for the SVG
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("width", width.toString())
      rect.setAttribute("height", height.toString())
      rect.setAttribute("fill", "white")
      clonedSvg.insertBefore(rect, clonedSvg.firstChild)
      
      // Set explicit dimensions on the cloned SVG
      clonedSvg.setAttribute("width", width.toString())
      clonedSvg.setAttribute("height", height.toString())
      clonedSvg.setAttribute("viewBox", `0 0 ${width} ${height}`)
      
      // Get SVG as a string with XML declaration
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      const svgDataWithDeclaration = '<?xml version="1.0" standalone="no"?>\r\n' + svgData
      
      // Create a Base64 data URI
      const svgBase64 = btoa(unescape(encodeURIComponent(svgDataWithDeclaration)))
      const dataUri = 'data:image/svg+xml;base64,' + svgBase64
      
      // Create a link to download the SVG directly
      const downloadSvg = () => {
        const a = document.createElement('a')
        a.href = dataUri
        a.download = 'mermaid-diagram.svg'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      
      // For browsers that support loading SVG to PNG
      const downloadPng = () => {
        // Create a new image element
        const img = new Image()
        
        // Set up image load handler
        img.onload = function() {
          // Create a canvas element
          const canvas = document.createElement('canvas')
          
          // Set canvas size (with scaling for better quality)
          const scale = 2
          canvas.width = width * scale
          canvas.height = height * scale
          
          // Get context and draw
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            downloadSvg() // Fallback to SVG if canvas context not available
            return
          }
          
          // Fill with white background
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Draw the image with scaling
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)
          
          try {
            // Try to get PNG data URL
            const pngDataUrl = canvas.toDataURL('image/png')
            
            // Create a download link
            const a = document.createElement('a')
            a.href = pngDataUrl
            a.download = 'mermaid-diagram.png'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          } catch (error) {
            console.error('PNG conversion failed, falling back to SVG download', error)
            downloadSvg() // Fallback to SVG download
          }
        }
        
        // Set image source to SVG data URI
        img.src = dataUri
      }
      
      // Try PNG first, it might fall back to SVG
      downloadPng()
      
    } catch (err) {
      console.error("Error saving diagram:", err)
      alert("Failed to save diagram. Please try again.")
    }
  }

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
    <div className="relative group">
      <div 
        ref={containerRef} 
        className="mermaid-container w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg p-4" 
      />
      {svgRendered && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={downloadAsPng}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm hover:bg-white dark:hover:bg-gray-700 opacity-70 group-hover:opacity-100 transition-opacity"
          title="Save as PNG"
          aria-label="Save as PNG"
        >
          <Download className="h-4 w-4 text-gray-700 dark:text-gray-200" />
        </Button>
      )}
    </div>
  )
}

