package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.zayeni.training.model.Note;
import com.zayeni.training.service.NoteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteRestController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private com.zayeni.training.repository.NoteRepository noteRepo;

    @GetMapping
    public List<Note> getAll(@RequestParam(required = false) String formateurEmail,
            @RequestParam(required = false) String etudiantEmail) {
        if (formateurEmail != null && !formateurEmail.isEmpty()) {
            return noteRepo.findByInscription_Cours_Formateur_Email(formateurEmail);
        }
        if (etudiantEmail != null && !etudiantEmail.isEmpty()) {
            return noteRepo.findByInscription_Etudiant_Email(etudiantEmail);
        }
        return noteService.findAll();
    }

    @GetMapping("/{id}")
    public Note getOne(@PathVariable Long id) {
        return noteService.findById(id);
    }

    @PostMapping
    public Note create(@Valid @RequestBody Note note) {
        return noteService.save(note);
    }

    @PutMapping("/{id}")
    public Note update(@PathVariable Long id, @Valid @RequestBody Note note) {
        note.setId(id);
        return noteService.save(note);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noteService.deleteById(id);
    }
}
