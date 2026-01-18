import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role permissions if specified
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center p-8 bg-white rounded-xl shadow-lg border max-w-md">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚫</span>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Accès refusé</h2>
                        <p className="text-slate-500 text-sm mb-4">
                            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        </p>
                        <p className="text-xs text-slate-400">
                            Rôle actuel: <span className="font-medium">{user?.role}</span>
                        </p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
