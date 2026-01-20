import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleEvent {
  id: string;
  title: string;
  trainer: string;
  room: string;
  students: number;
  startHour: number;
  duration: number; // in hours
  day: number; // 0-4 (Mon-Fri)
  color: "primary" | "success" | "warning" | "chart-5";
}

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const colorStyles = {
  primary: "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15",
  success: "bg-success/10 border-success/30 text-success hover:bg-success/15",
  warning: "bg-warning/10 border-warning/30 text-warning hover:bg-warning/15",
  "chart-5": "bg-chart-5/10 border-chart-5/30 text-chart-5 hover:bg-chart-5/15",
};

export default function Schedule() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    date: new Date().toISOString().split('T')[0],
    heureDebut: "08:00",
    heureFin: "10:00",
    salle: ""
  });

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1);
    return days.map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const fetchSessions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
    if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

    apiFetch(`http://localhost:8080/api/seances?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const adaptedEvents: ScheduleEvent[] = data.map((d: any) => {
          const dateSeance = new Date(d.dateSeance);
          const dayIndex = dateSeance.getDay() - 1; // Mon=1 -> 0

          const startHour = parseInt(d.heureDebut.split(':')[0], 10);
          const endHour = parseInt(d.heureFin.split(':')[0], 10);
          const duration = endHour - startHour;

          // Cycle colors based on ID
          const colors: Array<"primary" | "success" | "warning" | "chart-5"> = ["primary", "success", "warning", "chart-5"];
          const color = colors[d.id % 4];

          return {
            id: d.id.toString(),
            title: d.cours.titre,
            trainer: d.cours.formateur ? d.cours.formateur.nom : "TBA",
            room: d.salle,
            students: 0,
            startHour: startHour,
            duration: duration,
            day: dayIndex,
            color: color
          };
        });
        setEvents(adaptedEvents);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching sessions:", err);
        setLoading(false);
      });
  };

  const fetchCourses = () => {
    const params = new URLSearchParams();
    if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
    if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

    const url = params.toString()
      ? `http://localhost:8080/api/cours?${params.toString()}`
      : 'http://localhost:8080/api/cours';

    apiFetch(url)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error fetching courses:", err));
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchCourses();
    }
  }, [currentWeek, user?.username, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch('http://localhost:8080/api/seances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateSeance: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          salle: formData.salle,
          cours: { id: parseInt(formData.courseId) }
        }),
      });

      if (response.ok) {
        console.log("DEBUG: Response OK (200)");
        setIsDialogOpen(false);
        setFormData({
          ...formData,
          salle: "",
          courseId: ""
        });
        fetchSessions();
        toast.success("Séance planifiée avec succès");
      } else {
        console.log("DEBUG: Response Error (" + response.status + ")");
        const errorData = await response.json().catch(() => ({ message: "Erreur lors de la lecture de la réponse" }));
        console.log("DEBUG: Error data:", errorData);
        toast.error(errorData.message || "Conflit de planning détecté");
      }
    } catch (error) {
      console.error("Error adding session:", error);
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      const response = await apiFetch(`http://localhost:8080/api/seances/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setSelectedEvent(null);
        fetchSessions();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Emploi du temps" },
      ]}
      title="Emploi du temps"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentWeek(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentWeek(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Semaine du {weekDates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {weekDates[0].toLocaleDateString("fr-FR")} - {weekDates[4].toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
              Aujourd'hui
            </Button>
            {user?.role !== 'ETUDIANT' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un cours
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border">
            <div className="p-4 border-r border-border bg-muted/30"></div>
            {days.map((day, i) => {
              const date = weekDates[i];
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day}
                  className={cn(
                    "p-4 text-center border-r border-border last:border-r-0",
                    isToday && "bg-primary/5"
                  )}
                >
                  <p className={cn("text-sm font-medium", isToday && "text-primary")}>
                    {day}
                  </p>
                  <p className={cn(
                    "text-2xl font-semibold mt-1",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
            {/* Time Labels */}
            <div className="border-r border-border">
              {hours.map((hour) => (
                <div key={hour} className="h-16 flex items-start justify-end pr-3 pt-1">
                  <span className="text-xs text-muted-foreground">
                    {hour}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((_, dayIndex) => (
              <div key={dayIndex} className="relative border-r border-border last:border-r-0">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "h-16 border-b border-border last:border-b-0",
                      hour === 12 && "bg-muted/30"
                    )}
                  />
                ))}

                {/* Events */}
                {events
                  .filter((event) => event.day === dayIndex)
                  .map((event) => {
                    const top = (event.startHour - 8) * 64; // 64px = h-16
                    const height = event.duration * 64;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg border p-2 cursor-pointer transition-all duration-200",
                          colorStyles[event.color]
                        )}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs opacity-80">{event.trainer}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {event.startHour}:00
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {event.room}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">Légende :</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm">React</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm">Spring Boot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-sm">Python</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-5"></div>
              <span className="text-sm">Angular / Node.js</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programmer un cours</DialogTitle>
            <DialogDescription>
              Ajouter une nouvelle séance à l'emploi du temps.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="courseId">Choisir un cours</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salle">Salle</Label>
                  <Input
                    id="salle"
                    value={formData.salle}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    placeholder="Salle A2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="heureDebut">Heure de début</Label>
                  <Input
                    id="heureDebut"
                    type="time"
                    value={formData.heureDebut}
                    onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heureFin">Heure de fin</Label>
                  <Input
                    id="heureFin"
                    type="time"
                    value={formData.heureFin}
                    onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Programmer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la séance</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler la séance de <strong>{selectedEvent?.title}</strong> prévue le {selectedEvent && weekDates[selectedEvent.day].toLocaleDateString("fr-FR")} à {selectedEvent?.startHour}:00 ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Annuler la séance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
