package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Etudiant;
import com.zayeni.training.repository.EtudiantRepository;

@Service
public class EtudiantService {

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private UserAccountService userAccountService;

    @SuppressWarnings("null")
    public List<Etudiant> findAll() {
        return etudiantRepository.findAll();
    }

    public List<Etudiant> findAllWithInscriptions() {
        return etudiantRepository.findAllWithInscriptions();
    }

    public Etudiant findByIdWithInscriptions(Long id) {
        return etudiantRepository.findByIdWithInscriptions(id).orElse(null);
    }

    public Etudiant findById(Long id) {
        return etudiantRepository.findById(id).orElse(null);
    }

    public Etudiant findByEmail(String email) {
        return etudiantRepository.findByEmail(email);
    }

    public List<Etudiant> findByGroupeId(Long groupeId) {
        return etudiantRepository.findByGroupe_Id(groupeId);
    }

    @SuppressWarnings("null")
    public Etudiant save(Etudiant etudiant) {
        if (etudiant.getId() != null) {
            Etudiant existing = etudiantRepository.findById(etudiant.getId()).orElse(null);
            if (existing != null) {
                // Update scalar fields
                existing.setNom(etudiant.getNom());
                existing.setPrenom(etudiant.getPrenom());
                existing.setEmail(etudiant.getEmail());
                existing.setDateInscription(etudiant.getDateInscription());
                if (etudiant.getGroupe() != null) {
                    existing.setGroupe(etudiant.getGroupe());
                }
                // Do NOT touch inscriptions here to avoid "collection no longer referenced"
                // error

                Etudiant saved = etudiantRepository.save(existing);
                // No need to create account on update usually, but keeping logic if needed
                // userAccountService.createAccountFor(...) - should only be on create?
                // Keeping original behavior safe:
                return saved;
            }
        }

        if (etudiant.getMatricule() == null || etudiant.getMatricule().trim().isEmpty()) {
            etudiant.setMatricule(generateMatricule());
        }
        Etudiant saved = etudiantRepository.save(etudiant);
        userAccountService.createAccountFor(saved.getEmail(), saved.getPrenom() + " " + saved.getNom(),
                "ROLE_ETUDIANT");
        return saved;
    }

    private String generateMatricule() {
        return "ETU-" + java.time.Year.now().getValue() + "-"
                + String.format("%04d", new java.util.Random().nextInt(10000));
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        etudiantRepository.deleteById(id);
    }
}
