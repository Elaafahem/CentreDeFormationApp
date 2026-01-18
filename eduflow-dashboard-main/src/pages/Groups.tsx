import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreHorizontal, Users, GraduationCap, Laptop } from "lucide-react";
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Group {
    id: string;
    nom: string;
    niveau: string;
    specialite: string;
}

export default function Groups() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState({
        nom: "",
        niveau: "",
        specialite: ""
    });

    const { data: groups = [], isLoading: loading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8080/api/groupes');
            const data = await res.json();
            return data.map((d: any) => ({
                id: d.id.toString(),
                nom: d.nom,
                niveau: d.niveau,
                specialite: d.specialite
            }));
        },
    });

    const handleOpenEdit = (group: Group) => {
        setSelectedGroup(group);
        setFormData({
            nom: group.nom,
            niveau: group.niveau,
            specialite: group.specialite
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
    };

    const handleOpenAdd = () => {
        setSelectedGroup(null);
        setFormData({ nom: "", niveau: "", specialite: "" });
        setIsEditMode(false);
        setIsDialogOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: { nom: string; niveau: string; specialite: string; id?: string }) => {
            const url = data.id
                ? `http://localhost:8080/api/groupes/${data.id}`
                : 'http://localhost:8080/api/groupes';
            const method = data.id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save group');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setIsDialogOpen(false);
            toast.success(isEditMode ? 'Groupe modifié' : 'Groupe ajouté');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            id: isEditMode ? selectedGroup?.id : undefined
        });
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:8080/api/groupes/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete group');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setIsDeleteDialogOpen(false);
            toast.success('Groupe supprimé');
        },
    });

    const columns = [
        {
            key: "nom",
            header: "Nom",
            cell: (item: Group) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{item.nom}</span>
                </div>
            ),
        },
        {
            key: "niveau",
            header: "Niveau",
            cell: (item: Group) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{item.niveau}</span>
                </div>
            ),
        },
        {
            key: "specialite",
            header: "Spécialité",
            cell: (item: Group) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Laptop className="h-4 w-4" />
                    <span>{item.specialite}</span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (item: Group) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                setSelectedGroup(item);
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
                { label: "Groupes" },
            ]}
            title="Gestion des Groupes"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">
                            Gérez les groupes d'étudiants (TP, Ssections, Promotions).
                        </p>
                    </div>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un groupe
                    </Button>
                </div>

                <DataTable
                    data={groups}
                    columns={columns}
                    searchPlaceholder="Rechercher un groupe..."
                    searchKey="nom"
                />
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Modifier le groupe" : "Ajouter un groupe"}</DialogTitle>
                        <DialogDescription>
                            Remplissez les détails pour identifier le groupe.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nom">Nom du groupe</Label>
                                <Input
                                    id="nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="ex: TP1-Informatique"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="niveau">Niveau</Label>
                                <Input
                                    id="niveau"
                                    value={formData.niveau}
                                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                                    placeholder="ex: 1ère Année"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="specialite">Spécialité</Label>
                                <Input
                                    id="specialite"
                                    value={formData.specialite}
                                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                                    placeholder="ex: GL / SI"
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

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le groupe <strong>{selectedGroup?.nom}</strong> ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedGroup && deleteMutation.mutate(selectedGroup.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
