import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grade } from "@/data/mockData";
import { Plus, MoreHorizontal, Eye, Pencil, BookOpen, User, Calendar, Trash2, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const getGradeColor = (note: number) => {
  if (note >= 16) return "bg-success-muted text-success";
  if (note >= 12) return "bg-primary-muted text-primary";
  if (note >= 10) return "bg-warning-muted text-warning";
  return "bg-destructive-muted text-destructive";
};

const getGradeLabel = (note: number) => {
  if (note >= 16) return "Excellent";
  if (note >= 14) return "Très bien";
  if (note >= 12) return "Bien";
  if (note >= 10) return "Passable";
  return "Insuffisant";
};

export default function Grades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    inscriptionId: "",
    valeur: "",
    appreciation: ""
  });

  const { user } = useAuth();
  const fetchGrades = () => {
    const params = new URLSearchParams();
    if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
    if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

    apiFetch(`http://localhost:8080/api/notes?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const adaptedGrades: Grade[] = data.map((d: any) => ({
          id: d.id.toString(),
          inscriptionId: d.inscription.id.toString(),
          etudiantId: d.inscription.etudiant.id.toString(),
          etudiant: d.inscription.etudiant.prenom + ' ' + d.inscription.etudiant.nom,
          coursId: d.inscription.cours.id.toString(),
          cours: d.inscription.cours.titre,
          note: d.valeur,
          dateEvaluation: d.inscription.dateInscription,
          commentaire: d.appreciation || '',
          groupeId: d.inscription.etudiant.groupe ? d.inscription.etudiant.groupe.id.toString() : '0'
        }));
        setGrades(adaptedGrades);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching grades:", err);
        setLoading(false);
      });
  };

  const fetchEnrollments = () => {
    const params = new URLSearchParams();
    if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
    if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

    const url = params.toString()
      ? `http://localhost:8080/api/inscriptions?${params.toString()}`
      : 'http://localhost:8080/api/inscriptions';

    apiFetch(url)
      .then(res => res.json())
      .then(data => setEnrollments(data))
      .catch(err => console.error("Error fetching enrollments:", err));
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

  const fetchGroups = () => {
    const params = new URLSearchParams();
    if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);

    const url = params.toString()
      ? `http://localhost:8080/api/groupes?${params.toString()}`
      : 'http://localhost:8080/api/groupes';

    apiFetch(url)
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error("Error fetching groups:", err));
  };

  useEffect(() => {
    if (user) {
      fetchGrades();
      fetchEnrollments();
      fetchCourses();
      fetchGroups();
    }
  }, [user?.username, user?.role]);

  const filteredGrades = grades.filter((grade: any) => {
    let matchesCourse = true;
    let matchesGroup = true;

    if (selectedCourse && selectedCourse !== "all") {
      matchesCourse = grade.coursId === selectedCourse;
    }

    if (selectedGroup && selectedGroup !== "all") {
      matchesGroup = grade.groupeId === selectedGroup;
    }

    return matchesCourse && matchesGroup;
  });

  const handleOpenAdd = () => {
    setSelectedGrade(null);
    setFormData({ inscriptionId: "", valeur: "", appreciation: "" });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (grade: Grade) => {
    setSelectedGrade(grade);
    // Note: We need the enrollment ID to update. 
    // Let's find it from the enrollments list if needed, or if we had it in grade.
    // Looking at fetchGrades, we don't have enrollmentId directly in adapted grade.
    // Let's fetch the full grade object from server.
    apiFetch(`http://localhost:8080/api/notes/${grade.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          inscriptionId: data.inscription.id.toString(),
          valeur: data.valeur.toString(),
          appreciation: data.appreciation || ""
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
      })
      .catch(err => console.error("Error fetching grade details:", err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditMode
        ? `http://localhost:8080/api/notes/${selectedGrade?.id}`
        : 'http://localhost:8080/api/notes';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditMode ? parseInt(selectedGrade!.id) : undefined,
          inscription: { id: parseInt(formData.inscriptionId) },
          valeur: parseFloat(formData.valeur),
          appreciation: formData.appreciation
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ inscriptionId: "", valeur: "", appreciation: "" });
        fetchGrades();
      } else {
        console.error("Failed to save grade");
      }
    } catch (error) {
      console.error("Error saving grade:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedGrade) return;

    try {
      const response = await apiFetch(`http://localhost:8080/api/notes/${selectedGrade.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setSelectedGrade(null);
        fetchGrades();
      } else {
        console.error("Failed to delete grade");
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
    }
  };

  const handleDownloadTranscript = (inscriptionId: string) => {
    window.open(`http://localhost:8080/api/reports/transcript/${inscriptionId}`, '_blank');
  };

  const columns = [
    {
      key: "etudiant",
      header: "Étudiant",
      cell: (grade: Grade) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{grade.etudiant}</span>
        </div>
      ),
    },
    {
      key: "cours",
      header: "Cours",
      cell: (grade: Grade) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>{grade.cours}</span>
        </div>
      ),
    },
    {
      key: "note",
      header: "Note",
      cell: (grade: Grade) => (
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs font-semibold", getGradeColor(grade.note))}>
            {grade.note}/20
          </Badge>
          <span className="text-xs text-muted-foreground">
            {getGradeLabel(grade.note)}
          </span>
        </div>
      ),
    },
    {
      key: "dateEvaluation",
      header: "Date d'évaluation",
      cell: (grade: Grade) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(grade.dateEvaluation).toLocaleDateString("fr-FR")}</span>
        </div>
      ),
    },
    {
      key: "commentaire",
      header: "Commentaire",
      cell: (grade: Grade) => (
        <span className="text-sm text-muted-foreground italic">
          {grade.commentaire || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (grade: Grade) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleDownloadTranscript(grade.inscriptionId)}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger Relevé
            </DropdownMenuItem>

            {user?.role !== 'ETUDIANT' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenEdit(grade)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier la note
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedGrade(grade);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const averageGrade = grades.length > 0 ? (grades.reduce((acc, g) => acc + g.note, 0) / grades.length).toFixed(1) : "0.0";
  const successCount = grades.filter((g) => g.note >= 10).length;
  const successRate = grades.length > 0 ? ((successCount / grades.length) * 100).toFixed(0) : "0";
  const maxGrade = grades.length > 0 ? Math.max(...grades.map((g) => g.note)) : 0;

  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Notes" },
      ]}
      title="Gestion des Notes"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Consultez et gérez les notes des étudiants par cours.
            </p>
          </div>
          {user?.role !== 'ETUDIANT' && (
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Saisir une note
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-end">
          {user?.role !== 'ETUDIANT' && (
            <div className="w-[200px]">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les groupes</SelectItem>
                  {groups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-[200px]">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border shadow-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total notes</span>
              <Badge variant="secondary">{grades.length}</Badge>
            </div>
            <p className="text-2xl font-semibold mt-1">{grades.length} notes</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Moyenne générale</span>
            </div>
            <p className="text-2xl font-semibold mt-1">{averageGrade}/20</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taux de réussite</span>
              <Badge className="bg-success-muted text-success">{successRate}%</Badge>
            </div>
            <p className="text-2xl font-semibold mt-1">{successCount} réussites</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Meilleure note</span>
            </div>
            <p className="text-2xl font-semibold mt-1">{maxGrade}/20</p>
          </div>
        </div>

        <DataTable
          data={filteredGrades}
          columns={columns}
          searchPlaceholder={user?.role !== 'ETUDIANT' ? "Rechercher par étudiant..." : undefined}
          searchKey={user?.role !== 'ETUDIANT' ? "etudiant" : undefined}
        />
      </div>

      {/* Add/Edit Grade Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Modifier la note" : "Saisir une note"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modifiez la note de l'étudiant." : "Sélectionnez une inscription et saisissez la note obtenue."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="inscriptionId">Inscription (Étudiant - Cours)</Label>
                <Select
                  value={formData.inscriptionId}
                  onValueChange={(value) => setFormData({ ...formData, inscriptionId: value })}
                  required
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une inscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((enrollment) => (
                      <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                        {enrollment.etudiant.prenom} {enrollment.etudiant.nom} - {enrollment.cours.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valeur">Note (/20)</Label>
                <Input
                  id="valeur"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appreciation">Appréciation (optionnel)</Label>
                <Textarea
                  id="appreciation"
                  value={formData.appreciation}
                  onChange={(e) => setFormData({ ...formData, appreciation: e.target.value })}
                  placeholder="Commentaire sur la performance..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isEditMode ? "Enregistrer" : "Saisir"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la note de <strong>{selectedGrade?.etudiant}</strong> ({selectedGrade?.note}/20) ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
