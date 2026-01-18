package com.zayeni.training.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.zayeni.training.service.StatisticsService;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private StatisticsService statsService;

    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("counts", statsService.getGlobalCounts());
        model.addAttribute("courseStats", statsService.getCourseStats());
        return "dashboard";
    }
}
