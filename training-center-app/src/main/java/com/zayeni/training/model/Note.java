package com.zayeni.training.model;

import java.io.Serializable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
public class Note implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La note est obligatoire")
    @DecimalMin(value = "0.0", message = "La note ne peut pas être inférieure à 0")
    @DecimalMax(value = "20.0", message = "La note ne peut pas être supérieure à 20")
    private double valeur;

    private String appreciation;

    @NotNull(message = "L'inscription est obligatoire")
    @ManyToOne
    private Inscription inscription;

    public Note() {
        super();
    }

    public Note(double valeur, String appreciation, Inscription inscription) {
        super();
        this.valeur = valeur;
        this.appreciation = appreciation;
        this.inscription = inscription;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getValeur() {
        return valeur;
    }

    public void setValeur(double valeur) {
        this.valeur = valeur;
    }

    public String getAppreciation() {
        return appreciation;
    }

    public void setAppreciation(String appreciation) {
        this.appreciation = appreciation;
    }

    public Inscription getInscription() {
        return inscription;
    }

    public void setInscription(Inscription inscription) {
        this.inscription = inscription;
    }
}
