package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.service.EtudiantService;
import com.zayeni.training.service.InscriptionService;

@Controller
@RequestMapping("/inscription")
public class InscriptionController {

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private EtudiantService etudiantService;

    @Autowired
    private CoursService coursService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Inscription> list = inscriptionService.findAll();
        model.addAttribute("inscriptions", list);
        return "inscriptions";
    }

    @GetMapping("/form")
    public String formInscription(Model model) {
        model.addAttribute("inscription", new Inscription());
        model.addAttribute("etudiants", etudiantService.findAll());
        model.addAttribute("coursList", coursService.findAll());
        return "formInscription";
    }

    @PostMapping("/save")
    public String save(Inscription inscription) {
        // Validation logic could go here (e.g. check if already enrolled)
        if (inscription.getStatus() == null) {
            inscription.setStatus("PENDING");
        }
        inscriptionService.save(inscription);
        return "redirect:/inscription/index";
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        inscriptionService.deleteById(id);
        return "redirect:/inscription/index";
    }
}
