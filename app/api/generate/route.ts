import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NextResponse } from "next/server"

interface Message {
  role: "user" | "assistant"
  content: string
  diagram?: string
}

export async function POST(request: Request) {
  try {
    const { description, previousMessages = [] } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Build context from previous messages
    let context = ""
    if (previousMessages.length > 0) {
      context = "Previous conversation and diagrams:\n"
      previousMessages.forEach((message: Message) => {
        context += `${message.role === "user" ? "User" : "Assistant"}: ${message.content}\n`
        if (message.diagram) {
          context += `Previous diagram code: ${message.diagram}\n`
        }
      })
      context += "\n"
    }

    const prompt = `
      ${context}
      Create a mermaid diagram based on the following description:
      "${description}"
      
      Return ONLY the mermaid code without any explanation, markdown formatting, or backticks.
      The code should be valid mermaid syntax and should be as detailed as possible.
      
      Follow these syntax rules precisely:
      1. Always start with a diagram type declaration like 'flowchart TD', 'sequenceDiagram', 'classDiagram', etc.
      2. For flowcharts, always use proper node connections with arrows like '-->'.
      3. Use double quotes around ALL node text, especially when it contains spaces.
      4. Avoid using special characters like quotes within node text; escape them if necessary.
      5. Each node connection should be on a separate line.
      6. Use proper syntax for node shapes and styles.
      7. Test your syntax mentally before returning it to make sure it's valid.
      
      Example of correct syntax:
      flowchart TD
        A["Start"] --> B["Process Data"]
        B --> C["Make Decision"]
        C -->|Yes| D["Approve"]
        C -->|No| E["Reject"]
    `

    const { text } = await generateText({
      model: google("gemini-1.5-pro-latest"),
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    })

    // Clean up the response to ensure it's just the mermaid code
    const cleanedDiagram = text
      .replace(/```mermaid/g, "")
      .replace(/```/g, "")
      .trim()

    return NextResponse.json({ diagram: cleanedDiagram })
  } catch (error) {
    console.error("Error generating diagram:", error)
    return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 })
  }
}

