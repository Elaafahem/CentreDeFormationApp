import { Clock, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ClassItem {
  id: string;
  title: string;
  trainer: string;
  time: string;
  room: string;
  students: number;
  status: "upcoming" | "ongoing" | "completed";
}

const statusStyles = {
  upcoming: "bg-primary-muted text-primary",
  ongoing: "bg-success-muted text-success",
  completed: "bg-muted text-muted-foreground",
};

const statusLabels = {
  upcoming: "À venir",
  ongoing: "En cours",
  completed: "Terminé",
};

export function UpcomingClasses({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.coursId) params.append("coursId", filters.coursId);
    if (filters?.formateurId) params.append("formateurId", filters.formateurId);
    if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
    if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

    apiFetch(`http://localhost:8080/api/dashboard/todays-sessions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching today's sessions:", err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <div className="bg-card rounded-xl border shadow-card">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Cours du jour</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Planning des sessions
          </p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun cours prévu aujourd'hui
          </div>
        ) : (
          classes.map((classItem, index) => (
            <div
              key={classItem.id}
              className={cn(
                "p-4 hover:bg-muted/50 transition-colors animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{classItem.title}</h4>
                  <p className="text-sm text-muted-foreground">{classItem.trainer}</p>
                </div>
                <Badge className={cn("text-xs", statusStyles[classItem.status])}>
                  {statusLabels[classItem.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {classItem.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {classItem.room}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {classItem.students} étudiants
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-border">
        <button className="text-sm text-primary font-medium hover:underline">
          Voir l'emploi du temps complet →
        </button>
      </div>
    </div>
  );
}
