package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Etudiant;
import com.zayeni.training.service.EtudiantService;

@Controller
@RequestMapping("/etudiant")
public class EtudiantController {

    @Autowired
    private EtudiantService etudiantService;

    @Autowired
    private com.zayeni.training.service.GroupeService groupeService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Etudiant> list = etudiantService.findAll();
        model.addAttribute("etudiants", list);
        return "etudiants";
    }

    @GetMapping("/form")
    public String formEtudiant(Model model) {
        model.addAttribute("etudiant", new Etudiant());
        model.addAttribute("groupes", groupeService.findAll());
        return "formEtudiant";
    }

    @GetMapping("/edit")
    public String editEtudiant(Model model, @RequestParam(name = "id") Long id) {
        Etudiant e = etudiantService.findById(id);
        model.addAttribute("etudiant", e);
        model.addAttribute("groupes", groupeService.findAll());
        return "formEtudiant";
    }

    @PostMapping("/save")
    public String save(Etudiant etudiant) {
        etudiantService.save(etudiant);
        return "redirect:/etudiant/index";
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        etudiantService.deleteById(id);
        return "redirect:/etudiant/index";
    }
}
