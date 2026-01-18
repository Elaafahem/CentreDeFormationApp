import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BookOpen, MoreHorizontal, Eye, Pencil, Trash2, GraduationCap, FileText } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  code: string;
  titre: string;
  description: string;
  formateur: string;
  formateurId: string;
  inscrits: number;
  maxCapacity: number;
  progress: number;
  statut: string;
}

interface Material {
  id: string;
  titre: string;
  description: string;
  filePath: string;
  fileType: string;
  uploadDate: string;
}

export default function Courses() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    titre: "",
    description: "",
    formateurId: "",
    groupeId: "",
  });

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['courses', 'list', user?.role, user?.username],
    queryFn: async () => {
      // Build URL with optional formateurEmail for scoped queries
      let url = 'http://localhost:8080/api/cours';
      const params = new URLSearchParams();
      if (user?.role === 'FORMATEUR') params.append('formateurEmail', user.username);
      if (user?.role === 'ETUDIANT') params.append('etudiantEmail', user.username);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await apiFetch(url);
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id.toString(),
        code: d.code || ('CRS' + d.id.toString().padStart(3, '0')),
        titre: d.titre,
        description: d.description || '',
        formateur: d.formateur ? [d.formateur.prenom, d.formateur.nom].filter(Boolean).join(' ') : 'Non assigné',
        formateurId: d.formateur ? d.formateur.id.toString() : '',
        inscrits: d.inscritsCount || 0,
        maxCapacity: 20,
        progress: 0,
        statut: 'active',
      }));
    },
  });

  const { data: materials = [], refetch: refetchMaterials } = useQuery({
    queryKey: ['materials', selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      const res = await apiFetch(`http://localhost:8080/api/materials/course/${selectedCourse.id}`);
      return res.json();
    },
    enabled: !!selectedCourse?.id && isMaterialsDialogOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiFetch('http://localhost:8080/api/materials/upload', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data', // Let browser set line boundary
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', selectedCourse?.id] });
      toast.success('Fichier uploadé avec succès');
      setUploadFile(null);
      // Reset file input if possible or just rely on state
      const fileInput = document.getElementById('upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: () => {
      toast.error("Erreur lors de l'upload");
    }
  });

  const handleUpload = () => {
    if (!uploadFile || !selectedCourse) return;

    const data = new FormData();
    data.append('file', uploadFile);
    data.append('courseId', selectedCourse.id);
    data.append('titre', uploadFile.name);

    uploadMutation.mutate(data);
  };

  const handleDownload = async (material: Material) => {
    try {
      const res = await apiFetch(`http://localhost:8080/api/materials/download/${material.id}`);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.titre; // Or get from Content-Disposition header
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      apiFetch(`http://localhost:8080/api/materials/${id}`, { method: 'DELETE' })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['materials', selectedCourse?.id] });
          toast.success("Fichier supprimé");
        })
        .catch(() => toast.error("Erreur lors de la suppression"));
    }
  };


  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers', 'list'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/formateurs');
      return res.json();
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups', 'list'],
    queryFn: async () => {
      const res = await apiFetch('http://localhost:8080/api/groupes');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditMode
        ? `http://localhost:8080/api/cours/${selectedCourse?.id}`
        : 'http://localhost:8080/api/cours';
      const method = isEditMode ? 'PUT' : 'POST';

      const body = {
        code: data.code,
        titre: data.titre,
        description: data.description,
        formateur: data.formateurId ? { id: parseInt(data.formateurId) } : null,
        groupes: data.groupeId ? [{ id: parseInt(data.groupeId) }] : []
      };

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'list'] });
      setIsDialogOpen(false);
      setFormData({ code: "", titre: "", description: "", formateurId: "", groupeId: "" });
      toast.success(isEditMode ? 'Cours modifié' : 'Cours créé');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`http://localhost:8080/api/cours/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'list'] });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      toast.success('Cours supprimé');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ code: "", titre: "", description: "", formateurId: "", groupeId: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setIsEditMode(true);
    setSelectedCourse(course);
    setFormData({
      code: course.code,
      titre: course.titre,
      description: course.description,
      formateurId: course.formateurId || "",
      groupeId: (course as any).groupeId || ""
    });
    setIsDialogOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    // Mock check for access code (or verify with backend)
    // For now, let's just create an inscription
    try {
      const resp = await apiFetch(`http://localhost:8080/api/etudiants`);
      const students = await resp.json();
      const me = students.find((s: any) => s.email === user?.username);

      if (!me) {
        toast.error("Profil étudiant non trouvé");
        return;
      }

      const response = await apiFetch('http://localhost:8080/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiant: { id: me.id },
          cours: { id: parseInt(selectedCourse.id) },
          dateInscription: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        toast.success("Demande d'inscription envoyée ! En attente d'approbation.");
        setIsEnrollDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['courses', 'list'] });
      } else {
        toast.error("Échec de la demande d'inscription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'inscription");
    }
  };

  const handleDelete = () => {
    if (!selectedCourse) return;
    deleteMutation.mutate(selectedCourse.id);
  };

  const filteredCourses = courses.filter((course: Course) =>
    course.titre.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Cours" },
      ]}
      title="Gestion des Cours"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez le catalogue des formations et leurs affectations.
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un cours
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Input
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => (
            <div
              key={course.id}
              className="bg-card rounded-xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-200 relative group"
            >
              <div className="p-5">
                {/* Header: Action Button & Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setIsViewDialogOpen(true);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedCourse(course);
                        setIsMaterialsDialogOpen(true);
                      }}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Supports de cours
                      </DropdownMenuItem>
                      {user?.role === 'ETUDIANT' && (
                        <DropdownMenuItem onClick={() => {
                          setSelectedCourse(course);
                          setIsEnrollDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          S'inscrire
                        </DropdownMenuItem>
                      )}
                      {user?.role === 'ADMIN' && (
                        <DropdownMenuItem onClick={() => handleOpenEdit(course)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Course Info */}
                <div className="mb-6">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="uppercase tracking-wide">{course.code}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                    {course.titre}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {course.description || "Aucune description"}
                  </p>
                </div>
              </div>

              {/* Footer Info */}
              <div className="px-5 py-4 border-t bg-card/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {course.formateur}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Inscriptions
                    </span>
                    <span className="font-medium text-foreground">{course.inscrits}/{course.maxCapacity}</span>
                  </div>
                  <Progress value={(course.inscrits / course.maxCapacity) * 100} className="h-1.5 bg-blue-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Modifier le cours" : "Créer un nouveau cours"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modifiez les informations du cours." : "Remplissez les informations pour créer un nouveau cours."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code du cours</Label>
                <Input
                  id="code"
                  placeholder="Ex: CRS-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre du cours</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Spring Boot Avancé"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du cours..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="formateurId">Formateur</Label>
                <Select
                  value={formData.formateurId}
                  onValueChange={(value) => setFormData({ ...formData, formateurId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un formateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer: any) => (
                      <SelectItem key={trainer.id} value={trainer.id.toString()}>
                        {trainer.nom} {trainer.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="groupeId">Groupe cible</Label>
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
              <Button type="submit">{isEditMode ? "Enregistrer" : "Créer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le cours <strong>{selectedCourse?.titre}</strong> ? Cette action est irréversible.
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du Cours</DialogTitle>
            <DialogDescription>Informations détaillées sur la formation.</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">{selectedCourse.titre}</h4>
                  <p className="text-xs text-muted-foreground">{selectedCourse.code}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Formateur</span>
                  <p className="text-sm font-medium">{selectedCourse.formateur}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Capacité</span>
                  <p className="text-sm font-medium">{selectedCourse.inscrits} / {selectedCourse.maxCapacity} inscrits</p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase">Description</span>
                <p className="text-sm text-foreground bg-muted/30 p-2 rounded border">
                  {selectedCourse.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscription au cours</DialogTitle>
            <DialogDescription>
              Veuillez saisir le code d'accès pour vous inscrire à <strong>{selectedCourse?.titre}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir vous inscrire à ce cours ? Votre demande sera soumise pour approbation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleEnroll}>Valider l'inscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMaterialsDialogOpen} onOpenChange={setIsMaterialsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Supports de cours - {selectedCourse?.titre}</DialogTitle>
            <DialogDescription>
              Accédez aux documents et ressources partagés pour ce cours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {materials.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Aucun support disponible pour ce cours.
                </div>
              ) : (
                materials.map((material: Material) => (
                  <div key={material.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-primary/10 text-primary rounded shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{material.titre}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(material.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(material)}>
                        Télécharger
                      </Button>
                      {(user?.role === 'ADMIN' || user?.role === 'FORMATEUR') && (
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMaterial(material.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {(user?.role === 'FORMATEUR' || user?.role === 'ADMIN') && (
              <div className="pt-4 mt-4 border-t">
                <Label htmlFor="upload" className="block mb-2">Ajouter un support</Label>
                <div className="flex gap-2">
                  <Input
                    id="upload"
                    type="file"
                    className="flex-1"
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <Button size="sm" onClick={handleUpload} disabled={!uploadFile || uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Envoi...' : 'Uploader'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsMaterialsDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
