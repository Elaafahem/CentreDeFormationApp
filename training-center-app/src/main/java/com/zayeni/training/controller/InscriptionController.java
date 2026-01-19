package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.service.CoursService;
import com.zayeni.training.service.EtudiantService;
import com.zayeni.training.service.ReportService;
import com.zayeni.training.service.InscriptionService;

@Controller
@RequestMapping("/inscription")
public class InscriptionController {

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private EtudiantService etudiantService;

    @Autowired
    private CoursService coursService;

    @Autowired
    private ReportService reportService;

    @GetMapping("/index")
    public String index(Model model) {
        List<com.zayeni.training.model.Etudiant> list = etudiantService.findAllWithInscriptions();
        System.out.println("DEBUG: Inscription index called. Students found: " + (list != null ? list.size() : "null"));
        if (list != null) {
            for (com.zayeni.training.model.Etudiant e : list) {
                System.out.println("DEBUG: Student: " + e.getNom() + " Inscriptions size: "
                        + (e.getInscriptions() != null ? e.getInscriptions().size() : "null"));
            }
        }
        model.addAttribute("students", list);
        return "inscriptions";
    }

    @GetMapping("/transcript")
    public org.springframework.http.ResponseEntity<byte[]> downloadTranscript(
            @org.springframework.web.bind.annotation.RequestParam(name = "studentId") Long studentId) {
        try {
            com.zayeni.training.model.Etudiant e = etudiantService.findByIdWithInscriptions(studentId);
            byte[] pdfContent = reportService.generateFullTranscriptPdf(e);

            return org.springframework.http.ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=releve_notes_" + e.getNom() + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/form")
    public String formInscription(Model model) {
        model.addAttribute("inscription", new Inscription());
        model.addAttribute("etudiants", etudiantService.findAll());
        model.addAttribute("coursList", coursService.findAll());
        return "formInscription";
    }

    @PostMapping("/save")
    public String save(Inscription inscription,
            org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        try {
            if (inscription.getStatus() == null) {
                inscription.setStatus("PENDING");
            }
            inscriptionService.save(inscription);
            redirectAttributes.addFlashAttribute("successMessage", "L'inscription a été enregistrée avec succès.");
            return "redirect:/inscription/index";
        } catch (RuntimeException e) {
            System.err.println("DEBUG: RuntimeException during save: " + e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/inscription/index";
        }
    }

    @GetMapping("/delete")
    public String delete(Long id) {
        inscriptionService.deleteById(id);
        return "redirect:/inscription/index";
    }
}
