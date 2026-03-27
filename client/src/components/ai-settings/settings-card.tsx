interface SettingsCardProps {
  id?: string
  title: string
  subtitle: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function SettingsCard({ id, title, subtitle, children, action }: SettingsCardProps) {
  return (
    <div id={id} className="rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  )
}
