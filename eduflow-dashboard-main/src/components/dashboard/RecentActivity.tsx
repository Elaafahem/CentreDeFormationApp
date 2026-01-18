import { UserPlus, BookOpen, FileText, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Activity {
  id: string;
  type: "enrollment" | "course" | "grade" | "schedule" | "registration";
  title: string;
  description: string;
  time: string;
}

const typeIcons = {
  enrollment: UserPlus,
  course: BookOpen,
  grade: FileText,
  schedule: Calendar,
  registration: CheckCircle,
};

const typeColors = {
  enrollment: "text-primary bg-primary/10",
  course: "text-success bg-success/10",
  grade: "text-warning bg-warning/10",
  schedule: "text-chart-5 bg-chart-5/10",
  registration: "text-success bg-success/10",
};

export function RecentActivity({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.coursId) params.append("coursId", filters.coursId);
    if (filters?.formateurId) params.append("formateurId", filters.formateurId);
    if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
    if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

    apiFetch(`http://localhost:8080/api/dashboard/recent-activity?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recent activity:", err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <div className="bg-card rounded-xl border shadow-card">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-foreground">Activité récente</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Dernières actions sur la plateforme
        </p>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune activité récente pour ces critères
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = typeIcons[activity.type] || FileText;
            return (
              <div
                key={activity.id}
                className={cn(
                  "p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("p-2 rounded-lg shrink-0", typeColors[activity.type] || "text-muted bg-muted")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 border-t border-border">
        <button className="text-sm text-primary font-medium hover:underline">
          Voir toute l'activité →
        </button>
      </div>
    </div>
  );
}
