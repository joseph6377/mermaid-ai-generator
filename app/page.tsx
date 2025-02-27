"use client"

import { useState, useRef } from "react"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, Trash2, Sparkles, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  role: "user" | "assistant"
  content: string
  diagram?: string
  error?: boolean
}

// Message types for API
interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedView, setSelectedView] = useState("preview")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    // Check if the user input already contains a Mermaid diagram
    const isDiagramCode = input.trim().match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/);
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    try {
      // If the input is already valid Mermaid code, use it directly
      if (isDiagramCode) {
        const assistantMessage: Message = {
          role: "assistant",
          content: "I've parsed your diagram code:",
          diagram: input.trim(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Prepare request for the diagram generation API
        const conversationHistory: ChatMessage[] = [
          {
            role: "system",
            content: "You are a helpful assistant that generates Mermaid diagrams based on user requests."
          },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          })),
          { role: "user", content: input }
        ];

        // Make API request to our backend
        const response = await fetch("/api/generate-diagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            messages: conversationHistory 
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate diagram");
        }

        const data = await response.json();
        
        // Extract the Mermaid diagram code from the response
        const diagramCode = data.diagram;

        // Create assistant message with the diagram
        const assistantMessage: Message = {
          role: "assistant",
          content: "I've created a diagram based on your request:",
          diagram: diagramCode,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I couldn't generate a diagram based on your request. Please try again with a different description.",
        error: true
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput("")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="h-screen flex flex-col bg-background">
      <header className="glass border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="gradient-text text-2xl font-bold">Mermaid Diagram Generator</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat} 
            className="flex gap-1 items-center glass hover:shadow-md transition-all duration-300"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Chat</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 py-4 overflow-hidden">
        {/* Full-width Chat Interface */}
        <div className="flex flex-col card glass h-full shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="max-w-sm p-6 animate-fade-in">
                  <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary opacity-80" />
                  <h3 className="text-xl font-semibold mb-2 gradient-text">Welcome to Mermaid AI</h3>
                  <p className="text-muted-foreground mb-4">
                    Describe the diagram you want to create, and I'll generate it for you using Google's Gemini AI.
                    You can also directly paste Mermaid code to visualize it.
                  </p>
                  <div className="glass rounded-lg p-4 text-sm mt-4">
                    <p className="text-foreground font-medium mb-2">Try saying:</p>
                    <p className="text-muted-foreground">&quot;Create a flowchart showing user authentication process&quot;</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] ${
                        message.role === "user"
                          ? "message-bubble message-user"
                          : message.error 
                            ? "message-bubble message-error" 
                            : "message-bubble message-ai"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center mb-2">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">Gemini AI</span>
                        </div>
                      )}
                      <p className="mb-2">{message.content}</p>
                      {message.error && (
                        <div className="flex items-center text-destructive mt-2">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">Error generating diagram</span>
                        </div>
                      )}
                      {message.diagram && (
                        <div className="mt-3 bg-white rounded-md p-3 text-foreground">
                          <Tabs defaultValue="preview" className="w-full" onValueChange={setSelectedView}>
                            <TabsList className="mb-2 w-full glass">
                              <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                              <TabsTrigger value="code" className="flex-1">Code</TabsTrigger>
                            </TabsList>
                            <TabsContent value="preview" className="mt-0">
                              <div className="bg-white rounded-md overflow-hidden diagram-canvas">
                                <MermaidDiagram code={message.diagram} />
                              </div>
                            </TabsContent>
                            <TabsContent value="code" className="mt-0">
                              <div className="bg-muted rounded-md p-3 font-mono text-sm overflow-x-auto">
                                <pre>{message.diagram}</pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chat-footer glass">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="Describe a diagram to create, or paste Mermaid code directly..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px] resize-none input-modern"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                className={`self-end btn-primary h-10 w-10 rounded-full flex items-center justify-center p-0 ${isGenerating ? 'opacity-70' : 'hover:shadow-lg hover:transform hover:translate-y-[-2px]'}`}
                disabled={isGenerating || !input.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

