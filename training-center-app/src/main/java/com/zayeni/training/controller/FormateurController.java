package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Formateur;
import com.zayeni.training.service.FormateurService;

@Controller
@RequestMapping("/formateur")
public class FormateurController {

    @Autowired
    private FormateurService formateurService;

    @Autowired
    private com.zayeni.training.service.SpecialiteService specialiteService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Formateur> list = formateurService.findAll();
        model.addAttribute("formateurs", list);
        return "formateurs";
    }

    @GetMapping("/form")
    public String formFormateur(Model model) {
        model.addAttribute("formateur", new Formateur());
        model.addAttribute("specialites", specialiteService.findAll());
        return "formFormateur";
    }

    @GetMapping("/edit")
    public String editFormateur(Model model, @RequestParam(name = "id") Long id) {
        Formateur f = formateurService.findById(id);
        model.addAttribute("formateur", f);
        model.addAttribute("specialites", specialiteService.findAll());
        return "formFormateur";
    }

    @PostMapping("/save")
    public String save(Formateur formateur) {
        formateurService.save(formateur);
        return "redirect:/formateur/index";
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        formateurService.deleteById(id);
        return "redirect:/formateur/index";
    }
}
