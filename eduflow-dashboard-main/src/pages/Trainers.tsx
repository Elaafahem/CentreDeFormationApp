import { apiFetch } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trainer } from "@/data/mockData";
import { Plus, Eye, Pencil, Trash2, MoreHorizontal, Mail, Award, Users, BookOpen } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Trainers() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    specialite: ""
  });

  const { data: trainers = [], isLoading: loading } = useQuery({
    queryKey: ['trainers', 'list'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/formateurs');
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id.toString(),
        nom: d.nom,
        prenom: d.prenom || "",
        email: d.email,
        specialite: d.specialite,
        coursCount: d.coursCount || 0,
        studentsCount: d.studentsCount || 0
      }));
    },
  });

  const handleOpenAdd = () => {
    setSelectedTrainer(null);
    setFormData({ nom: "", email: "", specialite: "" });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      nom: trainer.nom,
      email: trainer.email,
      specialite: trainer.specialite
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { nom: string; email: string; specialite: string; id?: string }) => {
      const url = data.id
        ? `http://localhost:8080/api/formateurs/${data.id}`
        : 'http://localhost:8080/api/formateurs';
      const method = data.id ? 'PUT' : 'POST';
      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.id ? parseInt(data.id) : undefined,
          nom: data.nom,
          email: data.email,
          specialite: data.specialite
        }),
      });
      if (!response.ok) throw new Error('Failed to save trainer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers', 'list'] });
      setIsDialogOpen(false);
      setFormData({ nom: "", email: "", specialite: "" });
      toast.success(isEditMode ? 'Formateur modifié' : 'Formateur ajouté');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      nom: formData.nom,
      email: formData.email,
      specialite: formData.specialite,
      id: isEditMode ? selectedTrainer?.id : undefined,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`http://localhost:8080/api/formateurs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete trainer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers', 'list'] });
      setIsDeleteDialogOpen(false);
      setSelectedTrainer(null);
      toast.success('Formateur supprimé');
    },
  });

  const handleDelete = () => {
    if (!selectedTrainer) return;
    deleteMutation.mutate(selectedTrainer.id);
  };

  const columns = [
    {
      key: "nom",
      header: "Formateur",
      cell: (trainer: Trainer) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{trainer.nom}</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {trainer.email}
          </span>
        </div>
      ),
    },
    {
      key: "specialite",
      header: "Spécialité",
      cell: (trainer: Trainer) => (
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{trainer.specialite}</span>
        </div>
      ),
    },
    {
      key: "coursCount",
      header: "Cours",
      cell: (trainer: Trainer) => (
        <Badge variant="secondary">{trainer.coursCount || 0} cours</Badge>
      ),
    },
    {
      key: "studentsCount",
      header: "Étudiants",
      cell: (trainer: Trainer) => (
        <span className="text-muted-foreground">{trainer.studentsCount || 0} étudiants</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (trainer: Trainer) => (
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
              setSelectedTrainer(trainer);
              setIsViewDialogOpen(true);
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEdit(trainer)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedTrainer(trainer);
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
        { label: "Formateurs" },
      ]}
      title="Gestion des Formateurs"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez l'équipe pédagogique et leurs spécialités.
            </p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un formateur
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-card rounded-xl border shadow-card p-3 min-w-[200px] w-fit">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Effectif Total</span>
            <p className="text-xl font-bold text-foreground mt-0.5">{trainers.length} formateurs</p>
          </div>
        </div>

        <DataTable
          data={trainers}
          columns={columns}
          searchPlaceholder="Rechercher un formateur..."
          searchKey="nom"
        />
      </div>

      {/* Add/Edit Trainer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Modifier le formateur" : "Ajouter un formateur"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modifiez les informations du formateur." : "Remplissez les informations pour créer un nouveau formateur."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Prof. Dupont"
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
                  placeholder="formateur@iit.tn"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialite">Spécialité</Label>
                <Input
                  id="specialite"
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  placeholder="Java/Spring Boot"
                  required
                />
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le formateur <strong>{selectedTrainer?.nom}</strong> ? Cette action est irréversible.
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
      {/* View Trainer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profil du Formateur</DialogTitle>
            <DialogDescription>Information détaillées sur le formateur.</DialogDescription>
          </DialogHeader>
          {selectedTrainer && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selectedTrainer.nom.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedTrainer.nom}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTrainer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Spécialité</span>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{selectedTrainer.specialite}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Impact</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{selectedTrainer.studentsCount} Étudiants</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase block mb-1">Catalogue</span>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{selectedTrainer.coursCount} Cours</p>
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
