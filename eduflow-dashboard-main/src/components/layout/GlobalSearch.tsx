import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    FileText,
    Calendar,
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, onOpenChange]);

    const runCommand = React.useCallback(
        (command: () => void) => {
            onOpenChange(false);
            command();
        },
        [onOpenChange]
    );

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Rechercher un étudiant, un cours..." />
            <CommandList>
                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/students"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Étudiants</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/trainers"))}>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Formateurs</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/courses"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Cours</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions Rapides">
                    <CommandItem onSelect={() => runCommand(() => navigate("/enrollments"))}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        <span>Inscriptions</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/grades"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Notes</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/schedule"))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Emploi du temps</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
