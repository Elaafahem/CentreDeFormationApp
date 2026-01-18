package com.zayeni.training.model;

import java.io.Serializable;
import java.util.Collection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Groupe implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom; // ex: "TP1"
    private String niveau; // ex: "1ere Année", "Semestre 1"
    private String specialite; // ex: "Informatique"

    @OneToMany(mappedBy = "groupe")
    @JsonIgnore
    private Collection<Etudiant> etudiants;

    @ManyToMany(mappedBy = "groupes")
    @JsonIgnore
    private Collection<Cours> cours;

    public Groupe() {
        super();
    }

    public Groupe(String nom, String niveau, String specialite) {
        super();
        this.nom = nom;
        this.niveau = niveau;
        this.specialite = specialite;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public Collection<Etudiant> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(Collection<Etudiant> etudiants) {
        this.etudiants = etudiants;
    }

    public Collection<Cours> getCours() {
        return cours;
    }

    public void setCours(Collection<Cours> cours) {
        this.cours = cours;
    }
}
