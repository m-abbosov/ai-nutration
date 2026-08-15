import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/admin/shared/ui/admin-sidebar'

export function AdminShell() {
  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
