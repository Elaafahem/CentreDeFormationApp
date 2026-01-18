package com.zayeni.training.controller.api;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.zayeni.training.model.Formateur;
import com.zayeni.training.service.FormateurService;
import com.zayeni.training.service.StatisticsService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardRestController {

        @Autowired
        private StatisticsService statisticsService;

        @Autowired
        private FormateurService formateurService;

        @GetMapping("/stats")
        public Map<String, Object> getStats(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {

                // Resolve formateurEmail to formateurId if provided
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur formateur = formateurService.findByEmail(formateurEmail);
                        if (formateur != null) {
                                formateurId = formateur.getId();
                        }
                }

                return statisticsService.getFilteredStats(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/enrollments-by-month")
        public List<Map<String, Object>> getEnrollmentsByMonth(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getEnrollmentsByMonth(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/todays-sessions")
        public List<Map<String, Object>> getTodaysSessions(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getTodaysSessions(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/performance")
        public List<Map<String, Object>> getPerformanceDistribution(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getPerformanceDistribution(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/top-performers")
        public List<Map<String, Object>> getTopPerformers(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getTopPerformers(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/distribution")
        public List<Map<String, Object>> getDistribution(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getDistribution(coursId, formateurId, etudiantEmail);
        }

        @GetMapping("/recent-activity")
        public List<Map<String, Object>> getRecentActivity(
                        @RequestParam(required = false) Long coursId,
                        @RequestParam(required = false) Long formateurId,
                        @RequestParam(required = false) String formateurEmail,
                        @RequestParam(required = false) String etudiantEmail) {
                if (formateurEmail != null && !formateurEmail.isEmpty() && formateurId == null) {
                        Formateur f = formateurService.findByEmail(formateurEmail);
                        if (f != null)
                                formateurId = f.getId();
                }
                return statisticsService.getRecentActivity(coursId, formateurId, etudiantEmail);
        }
}
