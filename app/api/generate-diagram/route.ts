import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Google Generative AI client
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

// Use the gemini-2.0-pro-exp-02-05 model as specified
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
  generationConfig: {
    temperature: 0.2, // Lower temperature for more predictable outputs
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Convert the conversation history to Gemini's format
    // Skip the system message for the history but use it in our instructions
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || 
      'You are a helpful assistant that generates Mermaid diagrams based on user requests.';
    
    // Filter out messages that don't need to be in history
    const chatMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    // Format instructions for the model
    const instructions = `
You are a Mermaid diagram generator. You help users create diagrams based on their descriptions.

IMPORTANT CONTEXT:
${systemMessage}

IMPORTANT RULES:
1. Respond ONLY with raw Mermaid code.
2. Include NO explanations, markdown formatting, or code blocks (no \`\`\`).
3. Ensure the diagram has a valid Mermaid declaration at the start (flowchart, sequenceDiagram, etc).
4. Use proper syntax with nodes and connections.
5. For flowcharts, prefer "flowchart" over "graph" syntax.
6. Maintain conversation context - if the user refers to previous requests, update diagrams accordingly.

VALID EXAMPLES:
Example 1 - Flowchart:
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]

Example 2 - Sequence Diagram:
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John->>Alice: Great!

Reply with ONLY the diagram code based on the full conversation context:
`;

    // Start a chat session with history and instructions
    const chat = model.startChat({
      history: chatMessages.length > 0 ? chatMessages.slice(0, -1) : [],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Send the message with instructions + the last user message
    const lastUserMessage = chatMessages.length > 0 ? 
      chatMessages[chatMessages.length - 1].parts[0].text : 
      "Create a simple flowchart";
      
    // Send message with instructions to generate a diagram  
    const result = await chat.sendMessage(
      `${instructions}\n\nUser's request: "${lastUserMessage}"`
    );
    
    const responseText = result.response.text();
    
    // Enhanced cleanup of the response
    let diagramCode = responseText.trim();
    
    // Remove markdown code blocks if present
    if (diagramCode.includes('```mermaid')) {
      diagramCode = diagramCode.split('```mermaid')[1].split('```')[0].trim();
    } else if (diagramCode.includes('```')) {
      diagramCode = diagramCode.split('```')[1].split('```')[0].trim();
    }
    
    // Remove any extra text before or after the diagram
    const mermaidRegex = /(graph\s+|flowchart\s+|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)[\s\S]+/;
    const mermaidMatch = diagramCode.match(mermaidRegex);
    
    if (mermaidMatch) {
      diagramCode = mermaidMatch[0];
    }
    
    // Ensure the diagram code starts with a valid Mermaid declaration
    if (!diagramCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/i)) {
      // If it doesn't have a valid declaration but has diagram content, add flowchart TD
      if (diagramCode.includes('-->') || diagramCode.includes('--')) {
        diagramCode = 'flowchart TD\n' + diagramCode;
      } else {
        // Default to a simple flowchart if we can't determine the type
        diagramCode = 'flowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]';
      }
    }
    
    // Validate the diagram doesn't have common syntax errors
    if (diagramCode.includes('flowchart') && !diagramCode.includes('-->') && !diagramCode.includes('---')) {
      // If it's a flowchart with no connections, add a basic connection
      diagramCode += '\n    A[Start] --> B[Process]';
    }

    return NextResponse.json({ diagram: diagramCode });
  } catch (error: any) {
    console.error('Error generating diagram:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate diagram' },
      { status: 500 }
    );
  }
} 