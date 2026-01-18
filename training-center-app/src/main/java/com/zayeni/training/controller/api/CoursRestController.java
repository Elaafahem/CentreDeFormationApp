package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.zayeni.training.model.Cours;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.repository.CoursRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cours")
@CrossOrigin(origins = "*")
public class CoursRestController {

    @Autowired
    private CoursService coursService;

    @Autowired
    private CoursRepository coursRepository;

    @GetMapping

    public List<Cours> getAll(@RequestParam(required = false) String formateurEmail,
            @RequestParam(required = false) String etudiantEmail) {
        List<Cours> cours;

        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            cours = coursRepository.findByFormateur_Email(formateurEmail);
        } else if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            cours = coursRepository.findByEtudiantEmail(etudiantEmail);
        } else {
            cours = coursService.findAll();
        }

        cours.forEach(c -> {
            if (c.getInscriptions() != null) {
                c.setInscritsCount(c.getInscriptions().size());
            }
        });
        return cours;
    }

    @GetMapping("/{id}")
    public Cours getOne(@PathVariable Long id) {
        Cours c = coursService.findById(id);
        if (c != null && c.getInscriptions() != null) {
            c.setInscritsCount(c.getInscriptions().size());
        }
        return c;
    }

    @PostMapping
    public Cours create(@Valid @RequestBody Cours cours) {
        return coursService.save(cours);
    }

    @PutMapping("/{id}")
    public Cours update(@PathVariable Long id, @Valid @RequestBody Cours cours) {
        cours.setId(id);
        return coursService.save(cours);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        coursService.deleteById(id);
    }
}
