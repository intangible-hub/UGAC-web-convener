// components/app-shell.tsx — Main layout shell with sidebar navigation.
// Used by all authenticated pages. Shows different nav items
// depending on the user's role (student vs admin).

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/courses", label: "Courses" },
    { href: "/dashboard", label: "My Registrations" },
  ];

  if (user.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin Panel" });
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="p-6">
          <h1 className="text-lg font-semibold tracking-tight text-primary">
            Course Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">University Registration</p>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Separator />
        <div className="p-4">
          <div className="mb-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
              {user.role}
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-white">
          <h1 className="text-base font-semibold text-primary">Course Portal</h1>
          <MobileNav items={navItems} pathname={pathname} user={user} onLogout={handleLogout} />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* Simple mobile dropdown nav */
function MobileNav({
  items,
  pathname,
  user,
  onLogout,
}: {
  items: { href: string; label: string }[];
  pathname: string;
  user: { name: string; role: string };
  onLogout: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        Menu
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-md border bg-white shadow-md p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname.startsWith(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Separator className="my-2" />
          <div className="px-3 py-1 text-xs text-muted-foreground">
            {user.name} ({user.role})
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary text-destructive"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
