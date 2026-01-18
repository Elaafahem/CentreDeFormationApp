package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Inscription;
import com.zayeni.training.repository.InscriptionRepository;

@Service
public class InscriptionService {

    @Autowired
    private InscriptionRepository inscriptionRepository;

    @Autowired
    private EmailService emailService;

    public List<Inscription> findAll() {
        return inscriptionRepository.findAll();
    }

    public Inscription findById(Long id) {
        return inscriptionRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Inscription save(Inscription inscription) {
        Inscription saved = inscriptionRepository.save(inscription);

        // Notify student
        emailService.notifyRegistration(saved.getEtudiant().getEmail(),
                saved.getEtudiant().getPrenom() + " " + saved.getEtudiant().getNom());

        // Notify trainer
        if (saved.getCours().getFormateur() != null) {
            emailService.notifyTrainerEnrollment(saved.getCours().getFormateur().getEmail(),
                    saved.getCours().getFormateur().getNom(),
                    saved.getEtudiant().getPrenom() + " " + saved.getEtudiant().getNom(),
                    saved.getCours().getTitre());
        }

        return saved;
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        inscriptionRepository.deleteById(id);
    }
}
