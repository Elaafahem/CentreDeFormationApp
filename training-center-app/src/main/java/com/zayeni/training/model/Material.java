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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Material implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String description;

    @NotBlank(message = "Le chemin du fichier est obligatoire")
    private String filePath;

    @NotBlank(message = "Le type de fichier est obligatoire")
    private String fileType;

    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate;

    @ManyToOne
    @NotNull(message = "Le cours est obligatoire")
    private Cours cours;

    public Material() {
        super();
        this.uploadDate = new Date();
    }

    public Material(String titre, String description, String filePath, String fileType, Cours cours) {
        this();
        this.titre = titre;
        this.description = description;
        this.filePath = filePath;
        this.fileType = fileType;
        this.cours = cours;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Date getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Date uploadDate) {
        this.uploadDate = uploadDate;
    }

    public Cours getCours() {
        return cours;
    }

    public void setCours(Cours cours) {
        this.cours = cours;
    }
}
