import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearch } from "./GlobalSearch";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  title?: string;
}

export function Layout({ children, breadcrumbs, title }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSearch={() => setSearchOpen(true)}
      />
      <div className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        collapsed ? "pl-16" : "pl-64"
      )}>
        <Header
          breadcrumbs={breadcrumbs}
          title={title}
          onSearch={() => setSearchOpen(true)}
        />
        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
