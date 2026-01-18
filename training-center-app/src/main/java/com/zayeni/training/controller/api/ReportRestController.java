package com.zayeni.training.controller.api;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.model.Note;
import com.zayeni.training.service.InscriptionService;
import com.zayeni.training.service.NoteService;
import com.zayeni.training.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportRestController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private NoteService noteService;

    @SuppressWarnings("null")
    @GetMapping("/transcript/{inscriptionId}")
    public ResponseEntity<byte[]> getTranscript(@PathVariable Long inscriptionId) {
        try {
            Inscription inscription = inscriptionService.findById(inscriptionId);
            if (inscription == null) {
                return ResponseEntity.notFound().build();
            }

            List<Note> allNotes = noteService.findAll();
            List<Note> filteredNotes = allNotes.stream()
                    .filter(n -> n.getInscription() != null && n.getInscription().getId().equals(inscriptionId))
                    .collect(Collectors.toList());

            byte[] pdfBytes = reportService.generateTranscriptPdf(inscription, filteredNotes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=releve_notes_" + inscriptionId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
