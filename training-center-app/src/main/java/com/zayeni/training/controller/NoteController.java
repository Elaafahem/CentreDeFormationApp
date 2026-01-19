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

    @Autowired
    private com.zayeni.training.service.GroupeService groupeService;

    @Autowired
    private com.zayeni.training.service.CoursService coursService;

    @GetMapping("/manage")
    public String manageGroupNotes(Model model,
            @RequestParam(name = "groupeId", required = false) Long groupeId,
            @RequestParam(name = "coursId", required = false) Long coursId) {

        model.addAttribute("groupes", groupeService.findAll());
        model.addAttribute("courses", coursService.findAll());
        model.addAttribute("selectedGroupeId", groupeId);
        model.addAttribute("selectedCoursId", coursId);

        if (groupeId != null && coursId != null) {
            List<Inscription> inscriptions = inscriptionService.findByEtudiant_Groupe_IdAndCours_Id(groupeId, coursId);
            // We need to fetch the existing note for each inscription (if any).
            // Since standard display doesn't easily map "Inscription -> Latest Note",
            // we will let the view handle accessing `inscription.notes`.
            // However, to make it easy to edit, we might want to pre-calculate a
            // "currentNote" map.
            // For now, we'll pass the list of inscriptions. The View can assume:
            // if inscription.notes is not empty, take the last one.
            model.addAttribute("inscriptions", inscriptions);
        }

        return "group-notes";
    }

    @PostMapping("/save-inline")
    public String saveInline(
            @RequestParam(name = "inscriptionId") Long inscriptionId,
            @RequestParam(name = "valeur") double valeur,
            @RequestParam(name = "appreciation", required = false) String appreciation,
            @RequestParam(name = "groupeId") Long groupeId,
            @RequestParam(name = "coursId") Long coursId) {

        Inscription i = inscriptionService.findById(inscriptionId);
        // Check if a note already exists for this inscription?
        // The requirement is "modifier" (edit) or "ajouter" (add).
        // If we want to EDIT the existing note, we need its ID.
        // Simplest logic: If the student has notes, update the LAST one.
        // If not, create a new one.

        List<Note> existingNotes = noteService.findByInscription(i);
        Note noteToSave;

        if (!existingNotes.isEmpty()) {
            // Edit the last one
            noteToSave = existingNotes.get(existingNotes.size() - 1);
            noteToSave.setValeur(valeur);
            noteToSave.setAppreciation(appreciation);
        } else {
            // Create new
            noteToSave = new Note();
            noteToSave.setInscription(i);
            noteToSave.setValeur(valeur);
            noteToSave.setAppreciation(appreciation);
        }

        noteService.save(noteToSave);

        return "redirect:/note/manage?groupeId=" + groupeId + "&coursId=" + coursId;
    }

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
