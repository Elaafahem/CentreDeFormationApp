import { Trophy, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface TopStudent {
    id: string;
    name: string;
    average: number;
    coursesCount: number;
    rank: number;
}

const rankColors = {
    1: "text-warning bg-warning/10",
    2: "text-muted-foreground bg-muted",
    3: "text-chart-5 bg-chart-5/10",
};

export function TopPerformers({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
    const [students, setStudents] = useState<TopStudent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.coursId) params.append("coursId", filters.coursId);
        if (filters?.formateurId) params.append("formateurId", filters.formateurId);
        if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
        if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

        apiFetch(`http://localhost:8080/api/dashboard/top-performers?${params.toString()}`)
            .then(res => res.json())
            .then(topStudents => {
                setStudents(topStudents.map((s: any, index: number) => ({ ...s, rank: index + 1 })));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching top performers:", err);
                setLoading(false);
            });
    }, [filters]);

    return (
        <div className="bg-card rounded-xl border shadow-card">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Meilleurs étudiants</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Top 5 par moyenne générale
                </p>
            </div>
            <div className="divide-y divide-border">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Chargement...
                    </div>
                ) : students.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Aucune note disponible
                    </div>
                ) : (
                    students.map((student, index) => (
                        <div
                            key={student.id}
                            className={cn(
                                "p-4 flex items-center justify-between hover:bg-muted/50 transition-colors animate-fade-in"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg",
                                    rankColors[student.rank as keyof typeof rankColors] || "bg-muted text-muted-foreground"
                                )}>
                                    {student.rank === 1 && <Trophy className="h-5 w-5" />}
                                    {student.rank === 2 && <Award className="h-5 w-5" />}
                                    {student.rank === 3 && <TrendingUp className="h-5 w-5" />}
                                    {student.rank > 3 && student.rank}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {student.coursesCount} cours {student.coursesCount > 1 ? 'évalués' : 'évalué'}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                className={cn(
                                    "text-sm font-semibold",
                                    student.average >= 16 ? "bg-success-muted text-success" :
                                        student.average >= 14 ? "bg-primary-muted text-primary" :
                                            "bg-warning-muted text-warning"
                                )}
                            >
                                {student.average.toFixed(2)}/20
                            </Badge>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 border-t border-border">
                <button className="text-sm text-primary font-medium hover:underline">
                    Voir tous les étudiants →
                </button>
            </div>
        </div>
    );
}
