import { apiFetch } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreHorizontal, Calendar } from "lucide-react";
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

interface Session {
    id: string;
    nom: string;
    dateDebut: string;
    dateFin: string;
}

export default function Sessions() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [formData, setFormData] = useState({
        nom: "",
        dateDebut: "",
        dateFin: ""
    });

    const { data: sessions = [], isLoading: loading } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await apiFetch('http://localhost:8080/api/sessions');
            const data = await res.json();
            return data.map((d: any) => ({
                id: d.id.toString(),
                nom: d.nom,
                dateDebut: d.dateDebut,
                dateFin: d.dateFin
            }));
        },
    });

    const handleOpenEdit = (session: Session) => {
        setSelectedSession(session);
        setFormData({
            nom: session.nom,
            dateDebut: session.dateDebut,
            dateFin: session.dateFin
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
    };

    const handleOpenAdd = () => {
        setSelectedSession(null);
        setFormData({ nom: "", dateDebut: "", dateFin: "" });
        setIsEditMode(false);
        setIsDialogOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: { nom: string; dateDebut: string; dateFin: string; id?: string }) => {
            const url = data.id
                ? `http://localhost:8080/api/sessions/${data.id}`
                : 'http://localhost:8080/api/sessions';
            const method = data.id ? 'PUT' : 'POST';
            const response = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save session');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            setIsDialogOpen(false);
            toast.success(isEditMode ? 'Session modifiée' : 'Session ajoutée');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            id: isEditMode ? selectedSession?.id : undefined
        });
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiFetch(`http://localhost:8080/api/sessions/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete session');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            setIsDeleteDialogOpen(false);
            toast.success('Session supprimée');
        },
    });

    const columns = [
        {
            key: "nom",
            header: "Nom",
            cell: (item: Session) => (
                <span className="font-medium">{item.nom}</span>
            ),
        },
        {
            key: "dates",
            header: "Période",
            cell: (item: Session) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.dateDebut).toLocaleDateString()} - {new Date(item.dateFin).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (item: Session) => (
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
                                setSelectedSession(item);
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
                { label: "Sessions" },
            ]}
            title="Gestion des Sessions"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">
                            Définissez les périodes académiques (Années scolaires, Semestres).
                        </p>
                    </div>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une session
                    </Button>
                </div>

                <DataTable
                    data={sessions}
                    columns={columns}
                    searchPlaceholder="Rechercher une session..."
                    searchKey="nom"
                />
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Modifier la session" : "Ajouter une session"}</DialogTitle>
                        <DialogDescription>
                            Définissez le nom et les dates de début et de fin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nom">Nom de la session</Label>
                                <Input
                                    id="nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="ex: Année 2025-2026"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="dateDebut">Date de début</Label>
                                    <Input
                                        id="dateDebut"
                                        type="date"
                                        value={formData.dateDebut}
                                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dateFin">Date de fin</Label>
                                    <Input
                                        id="dateFin"
                                        type="date"
                                        value={formData.dateFin}
                                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                        required
                                    />
                                </div>
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
                            Êtes-vous sûr de vouloir supprimer la session <strong>{selectedSession?.nom}</strong> ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedSession && deleteMutation.mutate(selectedSession.id)}
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
