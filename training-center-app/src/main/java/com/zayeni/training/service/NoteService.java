package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Note;
import com.zayeni.training.model.Inscription;
import com.zayeni.training.repository.NoteRepository;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @SuppressWarnings("null")
    public List<Note> findAll() {
        return noteRepository.findAll();
    }

    public Note findById(Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    public List<Note> findByInscription(Inscription inscription) {
        return noteRepository.findByInscription(inscription);
    }

    @SuppressWarnings("null")
    public Note save(Note note) {
        return noteRepository.save(note);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        noteRepository.deleteById(id);
    }
}
