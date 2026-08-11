import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../auth/auth-context";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export function ProtectedLayout() {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center text-ink/60">Loading…</div>;
  }

  if (status === "guest") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden w-56 shrink-0 md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 shrink-0">
            <Sidebar onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </div>
          <div className="flex-1 bg-ink/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-ink/10 bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded p-1.5 text-ink hover:bg-ink/5 md:hidden"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold md:hidden">D-Shirtak Admin</span>
          <div className="hidden md:block">
            <Breadcrumbs />
          </div>
          <div className="ml-auto">
            <UserMenu onLogout={handleLogout} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
