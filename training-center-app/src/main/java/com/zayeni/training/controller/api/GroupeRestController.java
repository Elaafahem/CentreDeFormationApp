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
import org.springframework.web.bind.annotation.CrossOrigin;

import com.zayeni.training.model.Groupe;
import com.zayeni.training.service.GroupeService;

@RestController
@RequestMapping("/api/groupes")
@CrossOrigin(origins = "*")
public class GroupeRestController {

    @Autowired
    private com.zayeni.training.repository.GroupeRepository groupeRepo;

    @Autowired
    private GroupeService groupeService;

    @GetMapping
    public List<Groupe> getAll(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String formateurEmail) {
        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            return groupeRepo.findDistinctByCours_Formateur_Email(formateurEmail);
        }
        return groupeService.findAll();
    }

    @GetMapping("/{id}")
    public Groupe getOne(@PathVariable Long id) {
        return groupeService.findById(id);
    }

    @PostMapping
    public Groupe create(@RequestBody Groupe groupe) {
        return groupeService.save(groupe);
    }

    @PutMapping("/{id}")
    public Groupe update(@PathVariable Long id, @RequestBody Groupe groupe) {
        groupe.setId(id);
        return groupeService.save(groupe);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        groupeService.deleteById(id);
    }
}
