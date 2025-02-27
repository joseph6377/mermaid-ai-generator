"use client"

import Link from 'next/link'
import { ArrowLeft, Info, HelpCircle, GitBranch, Database, Activity, Network, BarChart4, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HelpPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="glass border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="gradient-text text-2xl font-bold">JoTkr Help Guide</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex gap-1 items-center glass hover:shadow-md transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Generator</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto py-8 px-4 sm:px-6 md:px-8 max-w-5xl">
        <div className="prose prose-sm sm:prose dark:prose-invert prose-headings:gradient-text prose-a:text-primary max-w-none">
          <section className="mb-10">
            <h2 className="flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              <span>What is JoTkr Diagram Generator?</span>
            </h2>
            <p>
              JoTkr Diagram Generator is a powerful tool that allows you to create and visualize diagrams using natural language or Mermaid syntax. 
              Whether you need a flowchart, sequence diagram, class diagram, or other types of visual representations, 
              JoTkr can generate them for you with simple text descriptions or direct Mermaid code.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              <span>How to Use</span>
            </h2>
            <h3>Method 1: Natural Language Generation</h3>
            <ol>
              <li><strong>Describe your diagram</strong> in plain English. For example: "Create a flowchart showing the user registration process with email verification"</li>
              <li>Hit <strong>Send</strong> or press <strong>Enter</strong> (without Shift)</li>
              <li>The AI will generate a Mermaid diagram based on your description</li>
              <li>You can view the diagram in the <strong>Preview</strong> tab or see the code in the <strong>Code</strong> tab</li>
              <li>You can save the diagram as a PNG image by clicking the download button in the top-right corner of the diagram</li>
            </ol>

            <h3>Method 2: Direct Mermaid Code</h3>
            <ol>
              <li>Write your Mermaid syntax directly in the input box</li>
              <li>The system will detect Mermaid code and render it immediately without AI processing</li>
              <li>This method is useful if you already know Mermaid syntax or want to fine-tune a generated diagram</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Diagram Types You Can Create</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="glass p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <span>Flowcharts</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">For visualizing processes or workflows with decision points.</p>
                <div className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                  <pre>{`flowchart TD
    A[Start] --> B{Is user registered?}
    B -->|Yes| C[Login]
    B -->|No| D[Register]
    C --> E[Dashboard]
    D --> E`}</pre>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Sequence Diagrams</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">For showing interactions between objects over time.</p>
                <div className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                  <pre>{`sequenceDiagram
    User->>Server: Authentication Request
    Server->>Database: Validate Credentials
    Database-->>Server: Validation Result
    Server-->>User: Authentication Response`}</pre>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Entity Relationship Diagrams</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">For modeling database structures and relationships.</p>
                <div className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                  <pre>{`erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"`}</pre>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  <span>Class Diagrams</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">For modeling object-oriented structures and relationships.</p>
                <div className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                  <pre>{`classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    Animal <|-- Dog`}</pre>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
                  <Network className="h-5 w-5 text-primary" />
                  <span>State Diagrams</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">For representing different states of a system.</p>
                <div className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                  <pre>{`stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Submit
    Processing --> Success: Valid
    Processing --> Error: Invalid
    Success --> [*]
    Error --> Idle: Retry`}</pre>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              <span>Tips for Better Results</span>
            </h2>
            <ul>
              <li><strong>Be specific</strong> in your descriptions. The more details you provide, the better the diagram will match your expectations.</li>
              <li><strong>Refine gradually</strong>. Start with a basic diagram, then ask for specific improvements.</li>
              <li><strong>Learn Mermaid syntax</strong> for precise control. The Code tab shows you the Mermaid code, which you can modify directly.</li>
              <li><strong>Use context</strong>. The AI remembers your conversation, so you can refer to previous diagrams when requesting improvements.</li>
              <li><strong>Download your diagrams</strong> using the download button that appears when you hover over a diagram.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              <span>Additional Resources</span>
            </h2>
            <ul>
              <li>
                <a href="https://mermaid.js.org/intro/" target="_blank" rel="noopener noreferrer">
                  Official Mermaid Documentation
                </a> - Comprehensive guide to Mermaid syntax
              </li>
              <li>
                <a href="https://github.com/joseph6377/mermaid-ai-generator" target="_blank" rel="noopener noreferrer">
                  JoTkr GitHub Repository
                </a> - Source code and issues
              </li>
            </ul>
          </section>
        </div>
      </div>

      <footer className="py-2 px-4 text-center text-xs text-muted-foreground">
        <p>
          Made by <a href="https://josepht.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">Joseph Thekkekara</a>
        </p>
      </footer>
    </main>
  )
} 