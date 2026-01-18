import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreHorizontal, Layers } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Specialite {
    id: string;
    nom: string;
    description: string;
}

export default function Specialties() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialite | null>(null);
    const [formData, setFormData] = useState({
        nom: "",
        description: ""
    });

    const { data: specialties = [], isLoading: loading } = useQuery({
        queryKey: ['specialties'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8080/api/specialites');
            const data = await res.json();
            return data.map((d: any) => ({
                id: d.id.toString(),
                nom: d.nom,
                description: d.description || ''
            }));
        },
    });

    const handleOpenEdit = (specialty: Specialite) => {
        setSelectedSpecialty(specialty);
        setFormData({
            nom: specialty.nom,
            description: specialty.description
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
    };

    const handleOpenAdd = () => {
        setSelectedSpecialty(null);
        setFormData({ nom: "", description: "" });
        setIsEditMode(false);
        setIsDialogOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: { nom: string; description: string; id?: string }) => {
            const url = data.id
                ? `http://localhost:8080/api/specialites/${data.id}`
                : 'http://localhost:8080/api/specialites';
            const method = data.id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save specialty');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            setIsDialogOpen(false);
            toast.success(isEditMode ? 'Spécialité modifiée' : 'Spécialité ajoutée');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            id: isEditMode ? selectedSpecialty?.id : undefined
        });
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:8080/api/specialites/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete specialty');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            setIsDeleteDialogOpen(false);
            toast.success('Spécialité supprimée');
        },
    });

    const columns = [
        {
            key: "nom",
            header: "Nom",
            cell: (item: Specialite) => (
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="font-medium">{item.nom}</span>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            cell: (item: Specialite) => (
                <span className="text-muted-foreground line-clamp-1">{item.description}</span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (item: Specialite) => (
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
                                setSelectedSpecialty(item);
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
                { label: "Spécialités" },
            ]}
            title="Gestion des Spécialités"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">
                            Gérez les spécialités disponibles pour vos formateurs.
                        </p>
                    </div>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une spécialité
                    </Button>
                </div>

                <DataTable
                    data={specialties}
                    columns={columns}
                    searchPlaceholder="Rechercher une spécialité..."
                    searchKey="nom"
                />
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Modifier la spécialité" : "Ajouter une spécialité"}</DialogTitle>
                        <DialogDescription>
                            Informations détaillées sur le domaine d'expertise.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nom">Nom de la spécialité</Label>
                                <Input
                                    id="nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="ex: Développement Fullstack"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez brièvement cette spécialité..."
                                    rows={3}
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
                            Êtes-vous sûr de vouloir supprimer la spécialité <strong>{selectedSpecialty?.nom}</strong> ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedSpecialty && deleteMutation.mutate(selectedSpecialty.id)}
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
