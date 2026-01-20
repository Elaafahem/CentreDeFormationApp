package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Specialite;
import com.zayeni.training.service.SpecialiteService;

@Controller
@RequestMapping("/specialite")
public class SpecialiteController {

    @Autowired
    private SpecialiteService specialiteService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Specialite> list = specialiteService.findAll();
        model.addAttribute("specialites", list);
        return "specialites";
    }

    @GetMapping("/form")
    public String formSpecialite(Model model) {
        model.addAttribute("specialite", new Specialite());
        return "formSpecialite";
    }

    @GetMapping("/edit")
    public String editSpecialite(Model model, @RequestParam(name = "id") Long id) {
        Specialite s = specialiteService.findById(id);
        model.addAttribute("specialite", s);
        return "formSpecialite";
    }

    @PostMapping("/save")
    public String save(Specialite specialite) {
        specialiteService.save(specialite);
        return "redirect:/specialite/index";
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        specialiteService.deleteById(id);
        return "redirect:/specialite/index";
    }
}
