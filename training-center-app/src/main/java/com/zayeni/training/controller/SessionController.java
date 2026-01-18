package com.zayeni.training.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.zayeni.training.model.Session;
import com.zayeni.training.service.SessionService;

@Controller
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @GetMapping("/index")
    public String index(Model model) {
        model.addAttribute("sessions", sessionService.findAll());
        return "sessions";
    }

    @GetMapping("/form")
    public String form(Model model) {
        model.addAttribute("session", new Session());
        return "formSession";
    }

    @GetMapping("/edit")
    public String edit(@RequestParam("id") Long id, Model model) {
        model.addAttribute("session", sessionService.findById(id));
        return "formSession";
    }

    @PostMapping("/save")
    public String save(@ModelAttribute Session session) {
        sessionService.save(session);
        return "redirect:/session/index";
    }

    @GetMapping("/delete")
    public String delete(@RequestParam("id") Long id) {
        sessionService.deleteById(id);
        return "redirect:/session/index";
    }
}
