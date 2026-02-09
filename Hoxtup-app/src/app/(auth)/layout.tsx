export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-display text-brand-primary">Hoxtup</span>
          <span className="inline-block h-3 w-3 rounded-full bg-brand-accent" />
        </div>
        {children}
      </div>
    </div>
  )
}
