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

@Controller
@RequestMapping("/groupe")
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @GetMapping("/index")
    public String index(Model model) {
        model.addAttribute("groupes", groupeService.findAll());
        return "groupes";
    }

    @GetMapping("/form")
    public String formGroupe(Model model) {
        model.addAttribute("groupe", new Groupe());
        return "formGroupe";
    }

    @GetMapping("/edit")
    public String editGroupe(@RequestParam("id") Long id, Model model) {
        model.addAttribute("groupe", groupeService.findById(id));
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
