package com.zayeni.training.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import java.util.Collection;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Inscription implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La date d'inscription est obligatoire")
    @Temporal(TemporalType.DATE)
    private Date dateInscription;

    @NotNull(message = "L'étudiant est obligatoire")
    @ManyToOne
    private Etudiant etudiant;

    @NotNull(message = "Le cours est obligatoire")
    @ManyToOne
    private Cours cours;

    @OneToMany(mappedBy = "inscription", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Collection<Note> notes;

    @NotNull(message = "Le statut est obligatoire")
    private String status = "PENDING";

    public Inscription() {
        super();
        this.dateInscription = new Date();
        this.status = "PENDING";
    }

    public Inscription(Etudiant etudiant, Cours cours) {
        super();
        this.etudiant = etudiant;
        this.cours = cours;
        this.dateInscription = new Date();
    }

    public Inscription(Date dateInscription, Etudiant etudiant, Cours cours) {
        super();
        this.dateInscription = dateInscription;
        this.etudiant = etudiant;
        this.cours = cours;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(Date dateInscription) {
        this.dateInscription = dateInscription;
    }

    public Etudiant getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(Etudiant etudiant) {
        this.etudiant = etudiant;
    }

    public Cours getCours() {
        return cours;
    }

    public void setCours(Cours cours) {
        this.cours = cours;
    }

    public Collection<Note> getNotes() {
        return notes;
    }

    public void setNotes(Collection<Note> notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
