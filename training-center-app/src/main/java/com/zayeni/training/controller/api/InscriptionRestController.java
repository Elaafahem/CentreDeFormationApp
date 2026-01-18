package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.service.InscriptionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inscriptions")
@CrossOrigin(origins = "*")
public class InscriptionRestController {

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private com.zayeni.training.repository.InscriptionRepository inscriptionRepo;

    @GetMapping
    public List<Inscription> getAll(@RequestParam(required = false) String formateurEmail,
            @RequestParam(required = false) String etudiantEmail) {
        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            return inscriptionRepo.findByCours_Formateur_EmailIgnoreCase(formateurEmail);
        }
        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            return inscriptionRepo.findByEtudiant_EmailIgnoreCase(etudiantEmail);
        }
        return inscriptionService.findAll();
    }

    @GetMapping("/{id}")
    public Inscription getOne(@PathVariable Long id) {
        return inscriptionService.findById(id);
    }

    @PostMapping
    public Inscription create(@Valid @RequestBody Inscription inscription) {
        if (inscription.getStatus() == null) {
            inscription.setStatus("PENDING");
        }
        return inscriptionService.save(inscription);
    }

    @PutMapping("/{id}")
    public Inscription update(@PathVariable Long id, @Valid @RequestBody Inscription inscription) {
        inscription.setId(id);
        return inscriptionService.save(inscription);
    }

    @PutMapping("/{id}/status")
    public Inscription updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        Inscription inscription = inscriptionService.findById(id);
        if (inscription != null && status != null) {
            inscription.setStatus(status);
            return inscriptionService.save(inscription);
        }
        throw new RuntimeException("Inscription not found or status invalid");
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inscriptionService.deleteById(id);
    }
}
