import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Sparkles, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-xl font-bold">Doc Chat</span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/chat">
              <Button>Go to Chat</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-24 md:py-32">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by AI
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your AI Assistant
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Ready to Help Making Doc
              </span>
            </h1>

            <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
              Experience intelligent conversations with our AI chat assistant.
              Get instant report by using your multimedia files.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Chatting
                  <MessageSquare className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chat"></Link>
            </div>
          </div>
          <div className="mt-16 grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Natural Conversations"
              description="Chat naturally with AI that understands context and nuance"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast"
              description="Get instant responses powered by advanced AI models"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Smart & Helpful"
              description="From answers to creative documentation, your AI assistant adapts to your needs"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Doc Chat. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/chat"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Chat
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center transition-colors">
      <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
