package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.zayeni.training.model.Seance;
import com.zayeni.training.service.SeanceService;

@RestController
@RequestMapping("/api/seances")
@CrossOrigin(origins = "*")
public class SeanceRestController {

    @Autowired
    private SeanceService seanceService;

    @Autowired
    private com.zayeni.training.repository.SeanceRepository seanceRepo;

    @GetMapping
    public List<Seance> getAll(@RequestParam(required = false) String formateurEmail,
            @RequestParam(required = false) String etudiantEmail) {
        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            return seanceRepo.findByCours_Formateur_Email(formateurEmail);
        }
        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            return seanceRepo.findByEtudiantEmail(etudiantEmail);
        }
        return seanceService.findAll();
    }

    @PostMapping
    public Seance create(@RequestBody Seance seance) {
        return seanceService.save(seance);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        seanceService.deleteById(id);
    }
}
