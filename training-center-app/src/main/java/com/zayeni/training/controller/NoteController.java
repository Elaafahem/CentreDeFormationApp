package com.zayeni.training.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.model.Note;
import com.zayeni.training.service.InscriptionService;
import com.zayeni.training.service.NoteService;

@Controller
@RequestMapping("/note")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private InscriptionService inscriptionService;

    @GetMapping("/index")
    public String index(Model model, @RequestParam(name = "inscriptionId") Long inscriptionId) {
        Inscription i = inscriptionService.findById(inscriptionId);
        List<Note> list = noteService.findByInscription(i);

        model.addAttribute("notes", list);
        model.addAttribute("inscription", i); // context for back button and adding new note
        return "notes";
    }

    @GetMapping("/form")
    public String formNote(Model model, @RequestParam(name = "inscriptionId") Long inscriptionId) {
        Inscription i = inscriptionService.findById(inscriptionId);
        Note n = new Note();
        n.setInscription(i);

        model.addAttribute("note", n);
        model.addAttribute("inscriptionId", inscriptionId);
        return "formNote";
    }

    @PostMapping("/save")
    public String save(Note note, @RequestParam(name = "inscriptionIdRef") Long inscriptionIdRef) {
        // Re-attach inscription because it might be lost in form submission if not
        // handled carefully
        // Or simpler: use a hidden field 'inscription' in the form with a converter.
        // Simplest strategy here: Load Inscription by ID and set it.

        Inscription i = inscriptionService.findById(inscriptionIdRef);
        note.setInscription(i);

        noteService.save(note);
        return "redirect:/note/index?inscriptionId=" + inscriptionIdRef;
    }

    @GetMapping("/delete")
    public String delete(Long id, Long inscriptionId) {
        noteService.deleteById(id);
        return "redirect:/note/index?inscriptionId=" + inscriptionId;
    }

    @Autowired
    private com.zayeni.training.service.ReportService reportService;

    @GetMapping("/report")
    public org.springframework.http.ResponseEntity<byte[]> downloadReport(
            @RequestParam(name = "inscriptionId") Long inscriptionId) {
        try {
            Inscription i = inscriptionService.findById(inscriptionId);
            List<Note> notes = noteService.findByInscription(i);

            byte[] pdfContent = reportService.generateTranscriptPdf(i, notes);

            return org.springframework.http.ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=releve_notes_" + inscriptionId + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500).build();
        }
    }
}
