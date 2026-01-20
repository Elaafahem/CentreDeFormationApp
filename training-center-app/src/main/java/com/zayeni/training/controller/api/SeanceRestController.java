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

    @GetMapping
    public List<Seance> getAll(@RequestParam(required = false) String formateurEmail,
            @RequestParam(required = false) String etudiantEmail) {
        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            return seanceService.findByFormateurEmail(formateurEmail);
        }
        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            return seanceService.findByEtudiantEmail(etudiantEmail);
        }
        return seanceService.findAll();
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> create(@RequestBody Seance seance) {
        try {
            Seance saved = seanceService.save(seance);
            return org.springframework.http.ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage());
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(error);
        } catch (Exception e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", "Erreur serveur: " + e.getMessage());
            return org.springframework.http.ResponseEntity
                    .status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            seanceService.deleteById(id);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity
                    .status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
