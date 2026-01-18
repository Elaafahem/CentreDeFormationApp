import { Search, ChevronRight, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  onSearch: () => void;
}

export function Header({ breadcrumbs = [], title, onSearch }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'FORMATEUR': return 'Formateur';
      case 'ETUDIANT': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  const getInitials = (username?: string) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col gap-0.5">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                  {item.href ? (
                    <a href={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={onSearch}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium capitalize">{user?.username || 'Utilisateur'}</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel(user?.role)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
