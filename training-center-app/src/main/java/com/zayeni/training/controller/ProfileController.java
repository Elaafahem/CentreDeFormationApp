package com.zayeni.training.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.zayeni.training.service.UserService;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String profile(Model model, Principal principal) {
        model.addAttribute("username", principal.getName());
        return "profile";
    }

    @PostMapping("/update")
    public String updatePassword(String newPassword, Principal principal, RedirectAttributes attrs) {
        userService.changePassword(principal.getName(), newPassword);
        attrs.addFlashAttribute("message", "Mot de passe mis à jour avec succès.");
        return "redirect:/profile";
    }
}
