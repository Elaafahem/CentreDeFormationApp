package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Cours;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.service.FormateurService;

@Controller
@RequestMapping("/cours")
public class CoursController {

    @Autowired
    private CoursService coursService;

    @Autowired
    private FormateurService formateurService;

    @Autowired
    private com.zayeni.training.service.GroupeService groupeService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Cours> list = coursService.findAll();
        model.addAttribute("coursList", list);
        return "cours";
    }

    @GetMapping("/form")
    public String formCours(Model model) {
        model.addAttribute("cours", new Cours());
        model.addAttribute("formateurs", formateurService.findAll());
        model.addAttribute("groupes", groupeService.findAll());
        return "formCours";
    }

    @GetMapping("/edit")
    public String editCours(Model model, @RequestParam(name = "id") Long id) {
        Cours c = coursService.findById(id);
        model.addAttribute("cours", c);
        model.addAttribute("formateurs", formateurService.findAll());
        model.addAttribute("groupes", groupeService.findAll());
        return "formCours";
    }

    @PostMapping("/save")
    public String save(Cours cours) {
        coursService.save(cours);
        return "redirect:/cours/index";
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        coursService.deleteById(id);
        return "redirect:/cours/index";
    }
}
