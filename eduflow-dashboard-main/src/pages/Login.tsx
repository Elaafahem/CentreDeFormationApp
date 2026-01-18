import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const success = await login(username, password);
            if (success) {
                toast.success("Connexion réussie !");
                navigate("/");
            } else {
                setError("Identifiants incorrects");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md px-6">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">EduFlow</h1>
                    <p className="text-slate-500 mt-1">Gestion de Centre de Formation</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Connexion</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Entrez vos identifiants pour accéder au tableau de bord
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-700">
                                Nom d'utilisateur
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </Button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-500 text-center mb-3">
                            Comptes de démonstration
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-slate-50 text-center">
                                <span className="block font-medium text-slate-700">Admin</span>
                                <span className="text-slate-500">admin / admin123</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 text-center">
                                <span className="block font-medium text-slate-700">Formateur</span>
                                <span className="text-slate-500">formateur / formateur123</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 text-center">
                                <span className="block font-medium text-slate-700">Étudiant</span>
                                <span className="text-slate-500">etudiant / etudiant123</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    © 2026 EduFlow - Tous droits réservés
                </p>
            </div>
        </div>
    );
}
