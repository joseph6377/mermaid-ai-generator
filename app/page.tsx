"use client"

import { useState, useRef } from "react"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, Code, Image, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  role: "user" | "assistant"
  content: string
  diagram?: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentDiagram, setCurrentDiagram] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          description: input,
          previousMessages: messages 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate diagram")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: "Here's your diagram:",
        diagram: data.diagram,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentDiagram(data.diagram)
    } catch (err) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error while generating the diagram.",
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error(err)
    } finally {
      setIsGenerating(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const downloadSVG = () => {
    if (!svgRef.current) return

    const svgElement = svgRef.current.querySelector("svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "diagram.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    if (!svgRef.current) return

    const svgElement = svgRef.current.querySelector("svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set dimensions based on SVG viewBox or size
    const svgRect = svgElement.getBoundingClientRect()
    canvas.width = svgRect.width * 2 // Higher resolution
    canvas.height = svgRect.height * 2

    // Create an image to draw on canvas
    const img = new window.Image()
    img.width = svgRect.width * 2
    img.height = svgRect.height * 2
    img.crossOrigin = "anonymous"

    img.onload = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert canvas to PNG
      const pngUrl = canvas.toDataURL("image/png")

      // Download PNG
      const link = document.createElement("a")
      link.href = pngUrl
      link.download = "diagram.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Load SVG into image
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const downloadMermaidCode = () => {
    if (!currentDiagram) return

    const blob = new Blob([currentDiagram], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "diagram.mmd"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    setMessages([])
    setCurrentDiagram("")
  }

  return (
    <main className="h-screen flex flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-center flex-grow">Mermaid Diagram Generator</h1>
        <Button variant="outline" size="sm" onClick={clearChat} className="flex gap-1 items-center">
          <Trash2 className="h-4 w-4" />
          <span>Clear Chat</span>
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Chat Interface - Left Side */}
        <div className="flex flex-col border-r h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div className="max-w-sm">
                  <h3 className="text-lg font-medium mb-2">Welcome to Mermaid AI</h3>
                  <p>Describe the diagram you want to create, and I&apos;ll generate it for you.</p>
                  <p className="mt-2 text-sm">Try: &quot;Create a flowchart showing user authentication process&quot;</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      {message.role === "user" ? (
                        <>
                          <AvatarImage src="/placeholder-user.svg" />
                          <AvatarFallback>U</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>AI</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe the diagram you want to create..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey === false && !isGenerating) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button className="self-end" onClick={handleSendMessage} disabled={isGenerating || !input.trim()}>
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Diagram Display - Right Side */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-4">
            {currentDiagram ? (
              <Card className="h-full flex flex-col">
                <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center border-b px-4 py-2">
                    <TabsList>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="code">Mermaid Code</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadSVG}>
                        <Image className="h-4 w-4 mr-2" aria-hidden="true" />
                        SVG
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadPNG}>
                        <Image className="h-4 w-4 mr-2" aria-hidden="true" />
                        PNG
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadMermaidCode}>
                        <Code className="h-4 w-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>
                  <TabsContent value="preview" className="flex-1 p-4 overflow-auto">
                    <div ref={svgRef} className="flex items-center justify-center h-full">
                      <MermaidDiagram code={currentDiagram} />
                    </div>
                  </TabsContent>
                  <TabsContent value="code" className="flex-1 p-4 overflow-auto">
                    <pre className="text-sm overflow-auto p-4 bg-muted rounded">{currentDiagram}</pre>
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <p>Your diagram will appear here</p>
                  <p className="text-sm mt-2">Start by sending a message on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

