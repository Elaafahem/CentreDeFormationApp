import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Layers,
  History,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  badge?: number;
}

const NavItem = ({ to, icon: Icon, label, collapsed, badge }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground/70"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
      {!collapsed && (
        <span className="flex-1 truncate">{label}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary text-xs">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

interface NavItemConfig {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: string[]; // If undefined, accessible to all authenticated users
}

const allNavItems: NavItemConfig[] = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/courses", icon: BookOpen, label: "Cours", roles: ["FORMATEUR", "ETUDIANT"] },
  { to: "/enrollments", icon: ClipboardList, label: "Inscriptions", roles: ["FORMATEUR"] },
  { to: "/grades", icon: FileText, label: "Notes", roles: ["FORMATEUR", "ETUDIANT"] },
  { to: "/schedule", icon: Calendar, label: "Emploi du temps", roles: ["FORMATEUR", "ETUDIANT"] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSearch: () => void;
}

export function Sidebar({ collapsed, onToggle, onSearch }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Filter nav items based on user role
  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.roles) return true; // No role restriction
    return user && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">EduFlow</span>
              <span className="text-xs text-muted-foreground">Gestion Formation</span>
            </div>
          )}
        </div>
      </div>

      {/* User Role Badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role === "ADMIN" && "Administrateur"}
                {user.role === "FORMATEUR" && "Formateur"}
                {user.role === "ETUDIANT" && "Étudiant"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-4">
          <button
            onClick={onSearch}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Rechercher...</span>
            <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="mb-4">
          {!collapsed && (
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Menu principal
            </span>
          )}
        </div>
        {visibleNavItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <NavItem to="/settings" icon={Settings} label="Paramètres" collapsed={collapsed} />
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "text-destructive hover:bg-destructive/10"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-soft flex items-center justify-center hover:shadow-elevated transition-all"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
