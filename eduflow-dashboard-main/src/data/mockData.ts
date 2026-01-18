// Interfaces for the training center application

export interface Student {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  dateInscription: string;
  status: "active" | "inactive" | "pending";
  moyenne?: number;
}

export interface Trainer {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  status: "active" | "inactive";
  coursCount?: number;
  studentsCount?: number;
}

export interface Course {
  id: string;
  code: string;
  titre: string;
  description: string;
  formateur: string;
  formateurId: string;
  inscrits: number;
  maxCapacity: number;
  status: "active" | "draft" | "completed";
}

export interface Enrollment {
  id: string;
  etudiant: string;
  etudiantId: string;
  cours: string;
  coursId: string;
  dateInscription: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Grade {
  id: string;
  inscriptionId: string;
  etudiant: string;
  etudiantId: string;
  cours: string;
  coursId: string;
  note: number;
  dateEvaluation: string;
  commentaire?: string;
}
