package com.zayeni.training.model;

import java.io.Serializable;
import java.util.Collection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.CascadeType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class Cours implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le code du cours est obligatoire")
    @Size(min = 2, max = 20, message = "Le code doit contenir entre 2 et 20 caractères")
    @Column(unique = true)
    private String code;

    @NotBlank(message = "Le titre du cours est obligatoire")
    @Size(min = 3, max = 200, message = "Le titre doit contenir entre 3 et 200 caractères")
    private String titre;

    @Size(max = 1000, message = "La description ne peut pas dépasser 1000 caractères")
    private String description;

    @ManyToOne
    private Formateur formateur;

    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL)
    @JsonIgnore
    private Collection<Inscription> inscriptions;

    @ManyToMany
    private Collection<Groupe> groupes;

    private String accessCode;

    @Transient
    @JsonProperty("inscritsCount")
    private int inscritsCount;

    public Cours() {
        super();
    }

    public Cours(String code, String titre, String description, Formateur formateur) {
        super();
        this.code = code;
        this.titre = titre;
        this.description = description;
        this.formateur = formateur;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Formateur getFormateur() {
        return formateur;
    }

    public void setFormateur(Formateur formateur) {
        this.formateur = formateur;
    }

    public Collection<Inscription> getInscriptions() {
        return inscriptions;
    }

    public void setInscriptions(Collection<Inscription> inscriptions) {
        this.inscriptions = inscriptions;
    }

    public Collection<Groupe> getGroupes() {
        return groupes;
    }

    public void setGroupes(Collection<Groupe> groupes) {
        this.groupes = groupes;
    }

    public int getInscritsCount() {
        if (inscriptions != null) {
            return inscriptions.size();
        }
        return inscritsCount;
    }

    public void setInscritsCount(int inscritsCount) {
        this.inscritsCount = inscritsCount;
    }

    public String getAccessCode() {
        return accessCode;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }
}
