package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.zayeni.training.model.Specialite;
import com.zayeni.training.service.SpecialiteService;

@RestController
@RequestMapping("/api/specialites")
@CrossOrigin(origins = "*")
public class SpecialiteRestController {

    @Autowired
    private SpecialiteService specialiteService;

    @GetMapping
    public List<Specialite> getAll() {
        return specialiteService.findAll();
    }

    @GetMapping("/{id}")
    public Specialite getOne(@PathVariable Long id) {
        return specialiteService.findById(id);
    }

    @PostMapping
    public Specialite create(@RequestBody Specialite specialite) {
        return specialiteService.save(specialite);
    }

    @PutMapping("/{id}")
    public Specialite update(@PathVariable Long id, @RequestBody Specialite specialite) {
        specialite.setId(id);
        return specialiteService.save(specialite);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        specialiteService.deleteById(id);
    }
}
