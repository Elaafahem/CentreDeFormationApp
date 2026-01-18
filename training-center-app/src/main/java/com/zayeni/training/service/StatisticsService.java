package com.zayeni.training.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zayeni.training.model.Cours;
import com.zayeni.training.repository.CoursRepository;
import com.zayeni.training.repository.EtudiantRepository;
import com.zayeni.training.repository.FormateurRepository;
import com.zayeni.training.repository.InscriptionRepository;
import com.zayeni.training.repository.NoteRepository;
import com.zayeni.training.repository.SeanceRepository;
import com.zayeni.training.model.*;
import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.Calendar;
import java.util.Set;

@Service
public class StatisticsService {

    @Autowired
    private EtudiantRepository etudiantRepo;
    @Autowired
    private FormateurRepository formateurRepo;
    @Autowired
    private CoursRepository coursRepo;
    @Autowired
    private NoteRepository noteRepo;
    @Autowired
    private InscriptionRepository inscriptionRepo;
    @Autowired
    private SeanceRepository seanceRepo;

    public Map<String, Long> getGlobalCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("etudiants", etudiantRepo.count());
        counts.put("formateurs", formateurRepo.count());
        counts.put("cours", coursRepo.count());
        return counts;
    }

    public Map<String, Object> getFilteredStats(Long coursId, Long formateurId, String etudiantEmail) {
        Map<String, Object> stats = new HashMap<>();

        List<Etudiant> students = etudiantRepo.findAll();
        List<Formateur> trainers = formateurRepo.findAll();
        List<Cours> courses = coursRepo.findAll();
        List<Inscription> inscriptions = inscriptionRepo.findAll();
        List<Note> grades = noteRepo.findAll();

        // Filter by Student Email (Personal Dashboard)
        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getEtudiant() != null && etudiantEmail.equalsIgnoreCase(i.getEtudiant().getEmail()))
                    .collect(Collectors.toList());

            Set<Long> courseIds = inscriptions.stream().map(i -> i.getCours().getId()).collect(Collectors.toSet());
            courses = courses.stream().filter(c -> courseIds.contains(c.getId())).collect(Collectors.toList());

            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getEtudiant() != null
                            && etudiantEmail.equalsIgnoreCase(n.getInscription().getEtudiant().getEmail()))
                    .collect(Collectors.toList());

            students = students.stream().filter(s -> etudiantEmail.equalsIgnoreCase(s.getEmail()))
                    .collect(Collectors.toList());
        }

        // Filter by Course
        if (coursId != null) {
            final Long finalCoursId = coursId;
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && i.getCours().getId().equals(finalCoursId))
                    .collect(Collectors.toList());

            Set<Long> studentIds = inscriptions.stream()
                    .map(i -> i.getEtudiant().getId())
                    .collect(Collectors.toSet());

            students = students.stream().filter(s -> studentIds.contains(s.getId()))
                    .collect(Collectors.toList());
            courses = courses.stream().filter(c -> c.getId().equals(finalCoursId)).collect(Collectors.toList());

            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getId().equals(finalCoursId))
                    .collect(Collectors.toList());
        }

        // Filter by Trainer
        if (formateurId != null) {
            final Long finalFormateurId = formateurId;
            courses = courses.stream()
                    .filter(c -> c.getFormateur() != null
                            && c.getFormateur().getId().equals(finalFormateurId))
                    .collect(Collectors.toList());

            Set<Long> courseIds = courses.stream().map(Cours::getId).collect(Collectors.toSet());

            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && courseIds.contains(i.getCours().getId()))
                    .collect(Collectors.toList());

            Set<Long> studentIds = inscriptions.stream()
                    .map(i -> i.getEtudiant().getId())
                    .collect(Collectors.toSet());

            students = students.stream().filter(s -> studentIds.contains(s.getId()))
                    .collect(Collectors.toList());

            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && courseIds.contains(n.getInscription().getCours().getId()))
                    .collect(Collectors.toList());
        }

        // Calculate success rate / GPA
        double summaryValue;
        String summaryLabel;

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            // Calculate GPA for student
            double gpa = grades.stream().mapToDouble(Note::getValeur).average().orElse(0.0);
            summaryValue = Math.round(gpa * 100.0) / 100.0;
            summaryLabel = "Moyenne Générale";
        } else {
            // Calculate success rate for admin/trainer
            long successCount = grades.stream().filter(n -> n.getValeur() >= 10).count();
            summaryValue = grades.isEmpty() ? 0 : (successCount * 100.0 / grades.size());
            summaryValue = Math.round(summaryValue);
            summaryLabel = "Taux de Réussite";
        }

        stats.put("totalStudents", students.size());
        stats.put("activeStudents", students.size());
        stats.put("totalTrainers", formateurId != null ? 1 : trainers.size());
        stats.put("totalCourses", courses.size());
        stats.put("activeCourses", courses.size());
        stats.put("pendingEnrollments", 0);
        stats.put("successRate", summaryValue);
        stats.put("summaryLabel", summaryLabel);

        return stats;
    }

    public List<Map<String, Object>> getEnrollmentsByMonth(Long coursId, Long formateurId, String etudiantEmail) {
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        List<Inscription> inscriptions = inscriptionRepo.findAll();

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getEtudiant() != null && etudiantEmail.equalsIgnoreCase(i.getEtudiant().getEmail()))
                    .collect(Collectors.toList());
        }

        if (coursId != null) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && i.getCours().getId().equals(coursId))
                    .collect(Collectors.toList());
        }

        if (formateurId != null) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && i.getCours().getFormateur() != null
                            && i.getCours().getFormateur().getId().equals(formateurId))
                    .collect(Collectors.toList());
        }
        // ... rest of the method (monthlyData calculation) ...
        Map<Integer, Long> enrollmentsByMonth = inscriptions.stream()
                .collect(Collectors.groupingBy(
                        i -> {
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(i.getDateInscription());
                            return cal.get(Calendar.MONTH);
                        },
                        Collectors.counting()));

        String[] months = { "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov",
                "Déc" };

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", months[i]);
            monthData.put("inscriptions", enrollmentsByMonth.getOrDefault(i, 0L));
            monthlyData.add(monthData);
        }

        return monthlyData;
    }

    public List<Map<String, Object>> getTodaysSessions(Long coursId, Long formateurId, String etudiantEmail) {
        List<Map<String, Object>> sessions = new ArrayList<>();
        List<Seance> allSeances = seanceRepo.findAll();
        LocalDate today = LocalDate.now();

        for (Seance seance : allSeances) {
            if (seance.getDateSeance().equals(today)) {
                if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
                    // Check if student is in any group tied to this course
                    boolean enrolled = seance.getCours().getGroupes().stream()
                            .flatMap(g -> g.getEtudiants().stream())
                            .anyMatch(e -> etudiantEmail.equalsIgnoreCase(e.getEmail()));
                    if (!enrolled)
                        continue;
                }
                if (coursId != null && (seance.getCours() == null
                        || !seance.getCours().getId().equals(coursId)))
                    continue;
                if (formateurId != null && (seance.getCours() == null
                        || seance.getCours().getFormateur() == null
                        || !seance.getCours().getFormateur().getId().equals(formateurId)))
                    continue;

                Map<String, Object> sessionData = new HashMap<>();
                sessionData.put("id", seance.getId());
                sessionData.put("title",
                        seance.getCours() != null ? seance.getCours().getTitre() : "Cours");
                sessionData.put("trainer",
                        seance.getCours() != null && seance.getCours().getFormateur() != null
                                ? seance.getCours().getFormateur().getNom()
                                : "Non assigné");
                sessionData.put("time", seance.getHeureDebut() + " - " + seance.getHeureFin());
                sessionData.put("room", seance.getSalle());
                sessionData.put("students",
                        seance.getCours() != null && seance.getCours().getInscriptions() != null
                                ? seance.getCours().getInscriptions().size()
                                : 0);
                sessionData.put("status", determineStatus(seance));
                sessions.add(sessionData);
            }
        }

        return sessions;
    }

    private String determineStatus(Seance seance) {
        LocalDate now = LocalDate.now();
        if (seance.getDateSeance().isBefore(now)) {
            return "completed";
        } else if (seance.getDateSeance().equals(now)) {
            return "ongoing";
        } else {
            return "upcoming";
        }
    }

    public List<Map<String, Object>> getPerformanceDistribution(Long coursId, Long formateurId, String etudiantEmail) {
        List<Note> grades = noteRepo.findAll();

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getEtudiant() != null
                            && etudiantEmail.equalsIgnoreCase(n.getInscription().getEtudiant().getEmail()))
                    .collect(Collectors.toList());
        }

        if (coursId != null) {
            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getId().equals(coursId))
                    .collect(Collectors.toList());
        }

        if (formateurId != null) {
            grades = grades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getFormateur() != null
                            && n.getInscription().getCours().getFormateur().getId()
                                    .equals(formateurId))
                    .collect(Collectors.toList());
        }

        String[] ranges = { "0-5", "5-10", "10-12", "12-14", "14-16", "16-20" };
        double[][] bounds = { { 0, 5 }, { 5, 10 }, { 10, 12 }, { 12, 14 }, { 14, 16 }, { 16, 20.01 } };

        List<Map<String, Object>> distribution = new ArrayList<>();
        for (int i = 0; i < ranges.length; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("range", ranges[i]);
            double min = bounds[i][0];
            double max = bounds[i][1];
            long count = grades.stream().filter(g -> g.getValeur() >= min && g.getValeur() < max).count();
            item.put("count", count);
            distribution.add(item);
        }

        return distribution;
    }

    public List<Map<String, Object>> getTopPerformers(Long coursId, Long formateurId, String etudiantEmail) {
        List<Note> allGrades = noteRepo.findAll();

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            allGrades = allGrades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getEtudiant() != null
                            && etudiantEmail.equalsIgnoreCase(n.getInscription().getEtudiant().getEmail()))
                    .collect(Collectors.toList());
        }

        if (coursId != null) {
            allGrades = allGrades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getId().equals(coursId))
                    .collect(Collectors.toList());
        }

        if (formateurId != null) {
            allGrades = allGrades.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getFormateur() != null
                            && n.getInscription().getCours().getFormateur().getId()
                                    .equals(formateurId))
                    .collect(Collectors.toList());
        }

        Map<Long, List<Double>> studentGrades = new HashMap<>();
        Map<Long, String> studentNames = new HashMap<>();

        for (Note note : allGrades) {
            Etudiant e = note.getInscription().getEtudiant();
            studentGrades.computeIfAbsent(e.getId(), k -> new ArrayList<>()).add(note.getValeur());
            studentNames.put(e.getId(), e.getPrenom() + " " + e.getNom());
        }

        return studentGrades.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    double avg = entry.getValue().stream().mapToDouble(d -> d).average().orElse(0);
                    map.put("id", entry.getKey());
                    map.put("name", studentNames.get(entry.getKey()));
                    map.put("average", avg);
                    map.put("coursesCount", entry.getValue().size());
                    return map;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("average"), (Double) a.get("average")))
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDistribution(Long coursId, Long formateurId, String etudiantEmail) {
        List<Cours> courses = coursRepo.findAll();

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            courses = courses.stream()
                    .filter(c -> c.getGroupes().stream()
                            .flatMap(g -> g.getEtudiants().stream())
                            .anyMatch(e -> etudiantEmail.equalsIgnoreCase(e.getEmail())))
                    .collect(Collectors.toList());
        }

        if (coursId != null) {
            courses = courses.stream().filter(c -> c.getId().equals(coursId)).collect(Collectors.toList());
        }

        if (formateurId != null) {
            courses = courses.stream()
                    .filter(c -> c.getFormateur() != null
                            && c.getFormateur().getId().equals(formateurId))
                    .collect(Collectors.toList());
        }

        return courses.stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", c.getTitre());
                    map.put("value", c.getInscriptions() != null ? c.getInscriptions().size() : 0);
                    return map;
                })
                .filter(m -> (int) m.get("value") > 0)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRecentActivity(Long coursId, Long formateurId, String etudiantEmail) {
        List<Map<String, Object>> activities = new ArrayList<>();

        List<Inscription> inscriptions = inscriptionRepo.findAll();
        List<Note> notes = noteRepo.findAll();

        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getEtudiant() != null && etudiantEmail.equalsIgnoreCase(i.getEtudiant().getEmail()))
                    .collect(Collectors.toList());
            notes = notes.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getEtudiant() != null
                            && etudiantEmail.equalsIgnoreCase(n.getInscription().getEtudiant().getEmail()))
                    .collect(Collectors.toList());
        }

        if (coursId != null) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && i.getCours().getId().equals(coursId))
                    .collect(Collectors.toList());
            notes = notes.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getId().equals(coursId))
                    .collect(Collectors.toList());
        }

        if (formateurId != null) {
            inscriptions = inscriptions.stream()
                    .filter(i -> i.getCours() != null && i.getCours().getFormateur() != null
                            && i.getCours().getFormateur().getId().equals(formateurId))
                    .collect(Collectors.toList());
            notes = notes.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getCours() != null
                            && n.getInscription().getCours().getFormateur() != null
                            && n.getInscription().getCours().getFormateur().getId()
                                    .equals(formateurId))
                    .collect(Collectors.toList());
        }

        // Add Recent Inscriptions
        inscriptions.stream().sorted((a, b) -> b.getId().compareTo(a.getId())).limit(3).forEach(i -> {
            Map<String, Object> act = new HashMap<>();
            act.put("id", "enroll-" + i.getId());
            act.put("type", "enrollment");
            act.put("title", "Nouvelle inscription");
            act.put("description",
                    i.getEtudiant().getPrenom() + " " + i.getEtudiant().getNom()
                            + " s'est inscrit à "
                            + i.getCours().getTitre());
            act.put("time", "Récent");
            activities.add(act);
        });

        // Add Recent Grades
        notes.stream().sorted((a, b) -> b.getId().compareTo(a.getId())).limit(2).forEach(n -> {
            Map<String, Object> act = new HashMap<>();
            act.put("id", "grade-" + n.getId());
            act.put("type", "grade");
            act.put("title", "Note publiée");
            act.put("description", "Note de " + n.getValeur() + " pour "
                    + (n.getInscription().getEtudiant() != null ? n.getInscription().getEtudiant().getNom()
                            : "Etudiant"));
            act.put("time", "Récent");
            activities.add(act);
        });

        return activities;
    }

    public List<CourseStats> getCourseStats() {
        List<Cours> allCours = coursRepo.findAll();
        List<CourseStats> statsList = new ArrayList<>();

        for (Cours c : allCours) {
            Long totalInscrits = inscriptionRepo.countByCours_Id(c.getId());
            if (totalInscrits == 0) {
                statsList.add(new CourseStats(c.getTitre(), 0L, 0.0, 0.0));
                continue;
            }

            Double avg = noteRepo.findAverageByCours(c.getId());
            Long passed = noteRepo.countPassedByCours(c.getId());

            double average = (avg != null) ? avg : 0.0;
            double successRate = (passed != null) ? ((double) passed / totalInscrits) * 100 : 0.0;

            statsList.add(new CourseStats(c.getTitre(), totalInscrits, average, successRate));
        }
        return statsList;
    }

    // Simple DTO
    public static class CourseStats {
        public String titre;
        public Long inscrits;
        public Double moyenne;
        public Double tauxReussite;

        public CourseStats(String titre, Long inscrits, Double moyenne, Double tauxReussite) {
            this.titre = titre;
            this.inscrits = inscrits;
            this.moyenne = Math.round(moyenne * 100.0) / 100.0; // Round to 2 decimals
            this.tauxReussite = Math.round(tauxReussite * 100.0) / 100.0;
        }
    }
}
