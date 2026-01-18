import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PerformanceAnalytics } from "@/components/dashboard/PerformanceAnalytics";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { CourseDistribution } from "@/components/dashboard/CourseDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { Users, BookOpen, Award, TrendingUp, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [selectedTrainer, setSelectedTrainer] = useState<string>("all");

    // Build scoped URL for formateurs
    const buildScopedUrl = (baseUrl: string) => {
        if (user?.role === 'FORMATEUR') {
            const separator = baseUrl.includes('?') ? '&' : '?';
            return `${baseUrl}${separator}formateurEmail=${encodeURIComponent(user.username)}`;
        }
        return baseUrl;
    };

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', 'dropdown', user?.username],
        queryFn: async () => {
            const res = await apiFetch(buildScopedUrl('http://localhost:8080/api/cours'));
            return res.json();
        }
    });

    const { data: trainers = [] } = useQuery({
        queryKey: ['trainers', 'dropdown'],
        queryFn: async () => {
            const res = await apiFetch('http://localhost:8080/api/formateurs');
            return res.json();
        }
    });

    const { data: stats, isLoading: loading } = useQuery({
        queryKey: ['dashboard-stats', selectedCourse, selectedTrainer, user?.formateurEmail, user?.role, user?.username],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (selectedCourse !== "all") params.append("coursId", selectedCourse);
            if (selectedTrainer !== "all") params.append("formateurId", selectedTrainer);

            if (user?.role === 'FORMATEUR' && user?.formateurEmail) {
                params.append("formateurEmail", user.formateurEmail);
            }
            if (user?.role === 'ETUDIANT') {
                params.append("etudiantEmail", user.username);
            }

            const res = await apiFetch(`http://localhost:8080/api/dashboard/stats?${params.toString()}`);
            return res.json();
        },
        placeholderData: (previousData) => previousData
    });


    const defaultStats = {
        totalStudents: 0,
        activeStudents: 0,
        totalTrainers: 0,
        totalCourses: 0,
        activeCourses: 0,
        pendingEnrollments: 0,
        successRate: 0,
        summaryLabel: "Taux de Réussite"
    };

    const currentStats = stats || defaultStats;

    const filters = {
        coursId: selectedCourse === "all" ? undefined : selectedCourse,
        formateurId: selectedTrainer === "all" ? undefined : selectedTrainer,
        formateurEmail: user?.role === 'FORMATEUR' ? user.username : undefined,
        etudiantEmail: user?.role === 'ETUDIANT' ? user.username : undefined
    };

    return (
        <Layout
            breadcrumbs={[{ label: "Tableau de bord" }]}
            title="Tableau de bord"
        >
            <div className="space-y-6 animate-fade-in">
                {/* Dashboard Filters - Hide for students, partial for trainers */}
                {user?.role !== 'ETUDIANT' && (
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Filter className="h-4 w-4" /> Filtrer par Cours
                            </label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les cours" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les cours</SelectItem>
                                    {courses.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.titre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Filtrer par Formateur
                                </label>
                                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous les formateurs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les formateurs</SelectItem>
                                        {trainers.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.prenom} {t.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <button
                            onClick={() => { setSelectedCourse("all"); setSelectedTrainer("all"); }}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {user?.role !== 'ETUDIANT' && (
                        <>
                            <StatsCard
                                title="Total Étudiants"
                                value={currentStats.totalStudents}
                                icon={<Users className="h-5 w-5" />}
                                variant="primary"
                            />
                            {user?.role === 'ADMIN' && (
                                <StatsCard
                                    title="Formateurs"
                                    value={currentStats.totalTrainers}
                                    icon={<Award className="h-5 w-5" />}
                                    variant="warning"
                                />
                            )}
                        </>
                    )}
                    <StatsCard
                        title={user?.role === 'ETUDIANT' ? "Mes Cours" : "Cours"}
                        value={currentStats.totalCourses}
                        icon={<BookOpen className="h-5 w-5" />}
                        variant="primary"
                    />
                    <StatsCard
                        title={currentStats.summaryLabel}
                        value={currentStats.summaryLabel === "Moyenne Générale" ? (currentStats.successRate || "0.00") : `${currentStats.successRate || 0}%`}
                        icon={<TrendingUp className="h-5 w-5" />}
                        variant="success"
                    />
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CourseDistribution filters={filters} />
                    <RecentActivity filters={filters} />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EnrollmentChart filters={filters} />
                    <PerformanceAnalytics filters={filters} />
                </div>

                {/* Activity & Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopPerformers filters={filters} />
                    <UpcomingClasses filters={filters} />
                </div>
            </div>
        </Layout>
    );
}
