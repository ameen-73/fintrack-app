import { FolderKanban, Users, Wallet, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-text p-6 sm:p-8">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <section className="rounded-[32px] border border-theme-border bg-theme-panel p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-theme-accent font-semibold">Business Overview</p>
              <h1 className="text-5xl font-extrabold tracking-tight text-theme-text">Dashboard</h1>
              <p className="max-w-2xl text-theme-muted">A clear, consistent workspace for finance, design, clients, and projects.</p>
            </div>
            <div className="rounded-[28px] bg-theme-card-dark p-6 text-white shadow-lg border border-theme-border-dark min-w-[240px]">
              <p className="text-sm uppercase tracking-[0.3em] text-theme-accent font-semibold">Total Balance</p>
              <p className="mt-3 text-5xl font-extrabold text-white">₹0</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard title="Projects" value="0" icon={<FolderKanban size={22} />} />
          <MetricCard title="Clients" value="0" icon={<Users size={22} />} />
          <MetricCard title="Revenue" value="₹0" icon={<Wallet size={22} />} />
          <MetricCard title="Analytics" value="₹0" icon={<BarChart3 size={22} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelCard title="Design Workspace" items={["Projects", "Clients", "Progress"]} />
          <PanelCard title="Finance Center" items={["Income", "Expense", "Analytics"]} />
        </div>
      </div>
    </main>
  )
}

function MetricCard({ title, value, icon }: any) {
  return (
    <div className="rounded-[28px] border border-theme-border bg-theme-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-theme-muted font-medium">{title}</p>
          <h2 className="mt-4 text-4xl font-extrabold text-theme-text">{value}</h2>
        </div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-accent/15 text-theme-accent shadow-sm">{icon}</div>
      </div>
    </div>
  )
}

function PanelCard({ title, items }: any) {
  return (
    <div className="rounded-[32px] border border-theme-border bg-theme-card p-8 shadow-sm">
      <p className="text-sm uppercase tracking-[0.3em] text-theme-accent font-semibold">{title}</p>
      <div className="mt-8 space-y-4 text-theme-text">
        {items.map((item: string) => (
          <div key={item} className="rounded-2xl border border-theme-border bg-theme-bg p-4 font-medium transition hover:translate-x-1 duration-200">{item}</div>
        ))}
      </div>
    </div>
  )
}
