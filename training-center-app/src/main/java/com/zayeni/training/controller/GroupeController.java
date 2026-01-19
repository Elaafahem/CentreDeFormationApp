package com.zayeni.training.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Groupe;
import com.zayeni.training.service.GroupeService;
import com.zayeni.training.service.EtudiantService;
import com.zayeni.training.service.SessionService;
import com.zayeni.training.repository.NoteRepository;

@Controller
@RequestMapping("/groupe")
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private EtudiantService etudiantService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private NoteRepository noteRepository;

    @GetMapping("/index")
    public String index(Model model) {
        model.addAttribute("groupes", groupeService.findAll());
        return "groupes";
    }

    @GetMapping("/etudiants")
    public String showGroupeEtudiants(@RequestParam("id") Long id, Model model) {
        Groupe groupe = groupeService.findById(id);
        var etudiants = etudiantService.findByGroupeId(id);

        // Calculate average for each student
        etudiants.forEach(e -> {
            Double avg = noteRepository.findAverageByEtudiant(e.getId());
            e.setMoyenne(avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0);
        });

        model.addAttribute("groupe", groupe);
        model.addAttribute("etudiants", etudiants);
        return "groupe-etudiants";
    }

    @GetMapping("/form")
    public String formGroupe(Model model) {
        model.addAttribute("groupe", new Groupe());
        model.addAttribute("sessions", sessionService.findAll());
        return "formGroupe";
    }

    @GetMapping("/edit")
    public String editGroupe(@RequestParam("id") Long id, Model model) {
        model.addAttribute("groupe", groupeService.findById(id));
        model.addAttribute("sessions", sessionService.findAll());
        return "formGroupe";
    }

    @PostMapping("/save")
    public String saveGroupe(@ModelAttribute("groupe") Groupe groupe) {
        groupeService.save(groupe);
        return "redirect:/groupe/index";
    }

    @GetMapping("/delete")
    public String deleteGroupe(@RequestParam("id") Long id) {
        groupeService.deleteById(id);
        return "redirect:/groupe/index";
    }
}
