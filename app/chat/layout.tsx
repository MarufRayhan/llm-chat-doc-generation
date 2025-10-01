import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, MessageSquare } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ChatLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xl font-bold">AI Chat</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                New Chat
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-muted/50">{children}</main>
    </div>
  )
}
