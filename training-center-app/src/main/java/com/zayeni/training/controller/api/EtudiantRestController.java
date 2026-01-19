package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zayeni.training.model.Etudiant;
import com.zayeni.training.service.EtudiantService;
import com.zayeni.training.repository.NoteRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/etudiants")
@CrossOrigin(origins = "*")
public class EtudiantRestController {

    @Autowired
    private EtudiantService etudiantService;

    @Autowired
    private NoteRepository noteRepo;

    @GetMapping
    public List<Etudiant> getAll(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long groupeId) {
        List<Etudiant> etudiants;
        if (groupeId != null) {
            etudiants = etudiantService.findByGroupeId(groupeId);
        } else {
            etudiants = etudiantService.findAll();
        }

        etudiants.forEach(e -> {
            Double avg = noteRepo.findAverageByEtudiant(e.getId());
            e.setMoyenne(avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0);
        });
        return etudiants;
    }

    @GetMapping("/{id}")
    public Etudiant getOne(@PathVariable Long id) {
        Etudiant e = etudiantService.findById(id);
        if (e != null) {
            Double avg = noteRepo.findAverageByEtudiant(e.getId());
            e.setMoyenne(avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0);
        }
        return e;
    }

    @PostMapping
    public Etudiant create(@Valid @RequestBody Etudiant etudiant) {
        return etudiantService.save(etudiant);
    }

    @PutMapping("/{id}")
    public Etudiant update(@PathVariable Long id, @Valid @RequestBody Etudiant etudiant) {
        etudiant.setId(id);
        return etudiantService.save(etudiant);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        etudiantService.deleteById(id);
    }
}
