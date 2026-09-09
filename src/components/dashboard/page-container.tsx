import React from 'react'

interface PageContainerProps {
  title: string | React.ReactNode
  description?: string | React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
}

export function PageContainer({ title, description, children, action }: PageContainerProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] h-full flex-col space-y-6 p-8">
      {/* Ambient Glow Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
      </div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white drop-shadow-sm">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col pb-20">
        {children}
      </div>
    </div>
  )
}
