import { apiFetch } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Enrollment } from "@/data/mockData";
import { Plus, Check, X, MoreHorizontal, Eye, Calendar, BookOpen, User } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export default function Enrollments() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState({
    etudiantId: "",
    coursId: ""
  });

  const { user } = useAuth();
  const { data: enrollments = [], isLoading: loading } = useQuery({
    queryKey: ['enrollments', user?.role, user?.username],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
      if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

      const res = await apiFetch(`http://localhost:8080/api/inscriptions?${params.toString()}`);
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id.toString(),
        etudiantId: d.etudiant.id.toString(),
        etudiant: [d.etudiant.prenom, d.etudiant.nom].filter(Boolean).join(' '),
        coursId: d.cours.id.toString(),
        cours: d.cours.titre,
        dateInscription: d.dateInscription,
        status: d.status || 'PENDING'
      }));
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/etudiants');
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/cours');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { etudiantId: string; coursId: string }) => {
      const response = await apiFetch('http://localhost:8080/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiant: { id: parseInt(data.etudiantId) },
          cours: { id: parseInt(data.coursId) },
          dateInscription: new Date().toISOString().split('T')[0],
          status: 'PENDING'
        }),
      });
      if (!response.ok) throw new Error('Failed to create enrollment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setIsDialogOpen(false);
      setFormData({ etudiantId: "", coursId: "" });
      toast.success('Inscription ajoutée');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiFetch(`http://localhost:8080/api/inscriptions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Statut mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`http://localhost:8080/api/inscriptions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete enrollment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setIsDeleteDialogOpen(false);
      setSelectedEnrollment(null);
      toast.success('Inscription supprimée');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      etudiantId: formData.etudiantId,
      coursId: formData.coursId,
    });
  };

  const handleDelete = () => {
    if (!selectedEnrollment) return;
    deleteMutation.mutate(selectedEnrollment.id);
  };

  const columns = [
    {
      key: "etudiant",
      header: "Étudiant",
      cell: (enrollment: Enrollment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{enrollment.etudiant}</span>
        </div>
      ),
    },
    {
      key: "cours",
      header: "Cours",
      cell: (enrollment: Enrollment) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>{enrollment.cours}</span>
        </div>
      ),
    },
    {
      key: "dateInscription",
      header: "Date d'inscription",
      cell: (enrollment: Enrollment) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(enrollment.dateInscription).toLocaleDateString("fr-FR")}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (enrollment: any) => (
        <Badge variant={enrollment.status === 'APPROVED' ? 'default' : enrollment.status === 'PENDING' ? 'outline' : 'secondary'}
          className={cn(
            enrollment.status === 'APPROVED' && "bg-success hover:bg-success/80",
            enrollment.status === 'PENDING' && "text-warning border-warning hover:bg-warning/10",
            enrollment.status === 'REJECTED' && "bg-destructive hover:bg-destructive/80"
          )}
        >
          {enrollment.status === 'APPROVED' ? 'Confirmé' : enrollment.status === 'PENDING' ? 'En attente' : 'Rejeté'}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (enrollment: any) => (
        <div className="flex items-center gap-1">
          {enrollment.status === "PENDING" && (user?.role === 'ADMIN' || user?.role === 'FORMATEUR') && (
            <>
              <Button onClick={() => statusMutation.mutate({ id: enrollment.id, status: 'APPROVED' })} variant="ghost" size="icon-sm" className="text-success hover:text-success hover:bg-success-muted" title="Approuver">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={() => statusMutation.mutate({ id: enrollment.id, status: 'REJECTED' })} variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive hover:bg-destructive-muted" title="Rejeter">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedEnrollment(enrollment);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Inscriptions" },
      ]}
      title="Gestion des Inscriptions"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez les demandes d'inscription des étudiants aux cours.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle inscription
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-card rounded-xl border shadow-card p-3 min-w-[200px] w-fit">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Volume d'Inscriptions</span>
            <p className="text-xl font-bold text-foreground mt-0.5">{enrollments.length} inscriptions</p>
          </div>
        </div>

        <DataTable
          data={enrollments}
          columns={columns}
          searchPlaceholder="Rechercher une inscription..."
          searchKey="etudiant"
        />
      </div>

      {/* Add Enrollment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle inscription</DialogTitle>
            <DialogDescription>
              Sélectionnez un étudiant et un cours pour créer une nouvelle inscription.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="etudiantId">Étudiant</Label>
                <Select
                  value={formData.etudiantId}
                  onValueChange={(value) => setFormData({ ...formData, etudiantId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.prenom} {student.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coursId">Cours</Label>
                <Select
                  value={formData.coursId}
                  onValueChange={(value) => setFormData({ ...formData, coursId: value })}
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Inscrire</Button>
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
              Êtes-vous sûr de vouloir supprimer l'inscription de <strong>{selectedEnrollment?.etudiant}</strong> au cours <strong>{selectedEnrollment?.cours}</strong> ? Cette action est irréversible.
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
