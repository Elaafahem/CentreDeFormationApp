package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.zayeni.training.model.Formateur;
import com.zayeni.training.service.FormateurService;
import com.zayeni.training.repository.CoursRepository;
import com.zayeni.training.repository.InscriptionRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/formateurs")
@CrossOrigin(origins = "*")
public class FormateurRestController {

    @Autowired
    private FormateurService formateurService;

    @Autowired
    private CoursRepository coursRepo;

    @Autowired
    private InscriptionRepository inscriptionRepo;

    @GetMapping
    public List<Formateur> getAll() {
        List<Formateur> formateurs = formateurService.findAll();
        formateurs.forEach(f -> {
            f.setCoursCount(coursRepo.countByFormateurId(f.getId()).intValue());
            f.setStudentsCount(inscriptionRepo.countDistinctEtudiantsByFormateurId(f.getId()).intValue());
        });
        return formateurs;
    }

    @GetMapping("/{id}")
    public Formateur getOne(@PathVariable Long id) {
        Formateur f = formateurService.findById(id);
        if (f != null) {
            f.setCoursCount(coursRepo.countByFormateurId(id).intValue());
            f.setStudentsCount(inscriptionRepo.countDistinctEtudiantsByFormateurId(id).intValue());
        }
        return f;
    }

    @PostMapping
    public Formateur create(@Valid @RequestBody Formateur formateur) {
        return formateurService.save(formateur);
    }

    @PutMapping("/{id}")
    public Formateur update(@PathVariable Long id, @Valid @RequestBody Formateur formateur) {
        formateur.setId(id);
        return formateurService.save(formateur);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        formateurService.deleteById(id);
    }
}
