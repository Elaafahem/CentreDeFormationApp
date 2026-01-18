import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock, User, AlertCircle, Loader2, Mail, BookOpen, Contact } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
    const [role, setRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [matricule, setMatricule] = useState("");
    const [specialiteId, setSpecialiteId] = useState("");
    const [specialites, setSpecialites] = useState<any[]>([]);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { registerStudent, registerTrainer } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch specialities for trainer registration
        apiFetch('http://localhost:8080/api/specialites')
            .then(res => res.json())
            .then(data => setSpecialites(data))
            .catch(err => console.error("Error fetching specialities:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            let success = false;
            if (role === 'STUDENT') {
                success = await registerStudent({ email, password, nom, prenom, matricule });
            } else {
                success = await registerTrainer({ email, password, nom, specialiteId: parseInt(specialiteId) });
            }

            if (success) {
                toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                navigate("/login");
            } else {
                setError("Erreur lors de l'inscription. Vérifiez vos informations.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg px-6">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">EduFlow</h1>
                    <p className="text-slate-500 mt-1">Rejoignez notre centre de formation</p>
                </div>

                {/* Register Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                    <div className="flex gap-4 mb-8 bg-slate-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => setRole('STUDENT')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Étudiant
                        </button>
                        <button
                            onClick={() => setRole('TRAINER')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${role === 'TRAINER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Formateur
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="pl-10" required />
                                </div>
                            </div>
                            {role === 'STUDENT' && (
                                <div className="space-y-2">
                                    <Label htmlFor="prenom">Prénom</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="pl-10" required />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email professionnel</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                            </div>
                        </div>

                        {role === 'STUDENT' ? (
                            <div className="space-y-2">
                                <Label htmlFor="matricule">Numéro de matricule</Label>
                                <div className="relative">
                                    <Contact className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input id="matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} className="pl-10" placeholder="MAT-2025XXX" required />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="specialite">Spécialité</Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select
                                        id="specialite"
                                        value={specialiteId}
                                        onChange={(e) => setSpecialiteId(e.target.value)}
                                        className="w-full pl-10 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Sélectionner une spécialité</option>
                                        {specialites.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Créer mon compte"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Déjà un compte ?{" "}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
