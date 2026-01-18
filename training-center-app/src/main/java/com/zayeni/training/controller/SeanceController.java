package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.zayeni.training.model.Seance;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.service.SeanceService;

@Controller
@RequestMapping("/seance")
public class SeanceController {

    @Autowired
    private SeanceService seanceService;

    @Autowired
    private CoursService coursService;

    @GetMapping("/index")
    public String index(Model model) {
        List<Seance> list = seanceService.findAll();
        model.addAttribute("seances", list);
        return "seances";
    }

    @GetMapping("/form")
    public String formSeance(Model model) {
        model.addAttribute("seance", new Seance());
        model.addAttribute("coursList", coursService.findAll());
        return "formSeance";
    }

    @PostMapping("/save")
    public String save(Seance seance, Model model) {
        try {
            seanceService.save(seance);
            return "redirect:/seance/index";
        } catch (RuntimeException e) {
            // Validation failed (Conflict)
            model.addAttribute("error", e.getMessage());
            model.addAttribute("coursList", coursService.findAll()); // Reload lists
            return "formSeance";
        }
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        seanceService.deleteById(id);
        return "redirect:/seance/index";
    }
}
