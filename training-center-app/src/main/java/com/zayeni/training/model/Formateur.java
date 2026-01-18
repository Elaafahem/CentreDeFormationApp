package com.zayeni.training.model;

import java.io.Serializable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class Formateur implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du formateur est obligatoire")
    @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
    private String nom;

    @ManyToOne
    private Specialite specialite;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Column(unique = true)
    private String email;

    @Transient
    @JsonProperty("coursCount")
    private int coursCount;

    @Transient
    @JsonProperty("studentsCount")
    private int studentsCount;

    public Formateur() {
        super();
    }

    public Formateur(String nom, Specialite specialite, String email) {
        super();
        this.nom = nom;
        this.specialite = specialite;
        this.email = email;
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

    public Specialite getSpecialite() {
        return specialite;
    }

    public void setSpecialite(Specialite specialite) {
        this.specialite = specialite;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getCoursCount() {
        return coursCount;
    }

    public void setCoursCount(int coursCount) {
        this.coursCount = coursCount;
    }

    public int getStudentsCount() {
        return studentsCount;
    }

    public void setStudentsCount(int studentsCount) {
        this.studentsCount = studentsCount;
    }

    @Override
    public String toString() {
        return "Formateur [id=" + id + ", nom=" + nom + ", specialite=" + specialite + "]";
    }
}
