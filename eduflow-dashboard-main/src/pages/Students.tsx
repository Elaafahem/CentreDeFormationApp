import { apiFetch } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/data/mockData";
import { Plus, Eye, Pencil, Trash2, MoreHorizontal, Mail, User, Calendar, BookOpen, Award } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export default function Students() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentStats, setStudentStats] = useState({ enrollments: 0, average: 0 });
  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    groupeId: ""
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/groupes');
      return res.json();
    },
  });

  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/etudiants');
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id.toString(),
        matricule: d.matricule || ('ETU' + d.id.toString().padStart(3, '0')),
        nom: d.nom,
        prenom: d.prenom,
        email: d.email,
        dateInscription: d.dateInscription,
        status: 'active',
        moyenne: d.moyenne
      }));
    },
  });

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      matricule: student.matricule,
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      groupeId: (student as any).groupeId || ""
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({ matricule: "", nom: "", prenom: "", email: "", groupeId: "" });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { matricule: string; nom: string; prenom: string; email: string; dateInscription: string; groupeId?: string; id?: string }) => {
      const body = {
        ...data,
        groupe: data.groupeId ? { id: parseInt(data.groupeId) } : null
      };
      const url = data.id
        ? `http://localhost:8080/api/etudiants/${data.id}`
        : 'http://localhost:8080/api/etudiants';
      const response = await apiFetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to save student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      setFormData({ matricule: "", nom: "", prenom: "", email: "", groupeId: "" });
      toast.success(isEditMode ? 'Étudiant modifié' : 'Étudiant ajouté');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      dateInscription: isEditMode ? selectedStudent?.dateInscription || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      id: isEditMode ? selectedStudent?.id : undefined,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`http://localhost:8080/api/etudiants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete student');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      toast.success('Étudiant supprimé');
    },
  });

  const handleDelete = () => {
    if (!selectedStudent) return;
    deleteMutation.mutate(selectedStudent.id);
  };

  const columns = [
    {
      key: "matricule",
      header: "Matricule",
      cell: (student: Student) => (
        <span className="font-medium text-foreground">{student.matricule}</span>
      ),
    },
    {
      key: "nom",
      header: "Nom",
      cell: (student: Student) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {student.prenom} {student.nom}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {student.email}
          </span>
        </div>
      ),
    },
    {
      key: "dateInscription",
      header: "Date d'inscription",
      cell: (student: Student) => (
        <span className="text-muted-foreground">
          {new Date(student.dateInscription).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (student: Student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setSelectedStudent(student);
              // Fetch student specific stats when viewing details
              apiFetch(`http://localhost:8080/api/inscriptions?etudiantId=${student.id}`)
                .then(res => res.json())
                .then(data => {
                  setStudentStats({
                    enrollments: data.length,
                    average: student.moyenne || 0
                  });
                  setIsViewDialogOpen(true);
                });
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEdit(student)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedStudent(student);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];


  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Étudiants" },
      ]}
      title="Gestion des Étudiants"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez les étudiants inscrits dans votre centre de formation.
            </p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un étudiant
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-card rounded-xl border shadow-card p-3 min-w-[200px] w-fit">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Inscriptions Totales</span>
            <p className="text-xl font-bold text-foreground mt-0.5">{students.length} étudiants</p>
          </div>
        </div>

        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Rechercher un étudiant..."
          searchKey="nom"
        />
      </div>

      {/* Add/Edit Student Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Modifier l'étudiant" : "Ajouter un étudiant"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modifiez les informations de l'étudiant." : "Remplissez les informations pour créer un nouvel étudiant."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="matricule">Matricule</Label>
                <Input
                  id="matricule"
                  placeholder="Ex: MAT-2025001"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="groupe">Groupe</Label>
                <Select
                  value={formData.groupeId}
                  onValueChange={(value) => setFormData({ ...formData, groupeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g: any) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.nom} ({g.niveau})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isEditMode ? "Enregistrer" : "Ajouter"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{selectedStudent?.prenom} {selectedStudent?.nom}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* View Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'Étudiant</DialogTitle>
            <DialogDescription>Profil et statistiques académiques.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedStudent.prenom} {selectedStudent.nom}</h4>
                  <p className="text-sm text-muted-foreground">{selectedStudent.matricule}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Contact</span>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium truncate">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Inscription</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{new Date(selectedStudent.dateInscription).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Cours Suivis</span>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{studentStats.enrollments} cours</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Moyenne</span>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{studentStats.average}/20</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
