package com.zayeni.training.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.service.StatisticsService;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.service.FormateurService;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private StatisticsService statsService;

    @Autowired
    private CoursService coursService;

    @Autowired
    private FormateurService formateurService;

    @GetMapping
    public String dashboard(
            @RequestParam(required = false) Long coursId,
            @RequestParam(required = false) Long formateurId,
            Model model) {

        // Global counts
        model.addAttribute("counts", statsService.getGlobalCounts());

        // Filtered stats
        model.addAttribute("stats", statsService.getFilteredStats(coursId, formateurId, null));

        // Course stats table
        model.addAttribute("courseStats", statsService.getCourseStats());

        // Chart data
        model.addAttribute("enrollmentData", statsService.getEnrollmentsByMonth(coursId, formateurId, null));
        model.addAttribute("performanceData", statsService.getPerformanceDistribution(coursId, formateurId, null));
        model.addAttribute("distributionData", statsService.getDistribution(coursId, formateurId, null));

        // Activities and performers
        model.addAttribute("recentActivities", statsService.getRecentActivity(coursId, formateurId, null));
        model.addAttribute("topPerformers", statsService.getTopPerformers(coursId, formateurId, null));
        model.addAttribute("upcomingSessions", statsService.getTodaysSessions(coursId, formateurId, null));

        // Dropdowns for filters
        model.addAttribute("allCourses", coursService.findAll());
        model.addAttribute("allFormateurs", formateurService.findAll());

        // Current filter values
        model.addAttribute("selectedCoursId", coursId);
        model.addAttribute("selectedFormateurId", formateurId);

        return "dashboard";
    }
}
