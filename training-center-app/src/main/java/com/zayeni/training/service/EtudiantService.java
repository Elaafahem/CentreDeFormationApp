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

    public Etudiant findById(Long id) {
        return etudiantRepository.findById(id).orElse(null);
    }

    public Etudiant findByEmail(String email) {
        return etudiantRepository.findByEmail(email);
    }

    @SuppressWarnings("null")
    public Etudiant save(Etudiant etudiant) {
        Etudiant saved = etudiantRepository.save(etudiant);
        userAccountService.createAccountFor(saved.getEmail(), saved.getPrenom() + " " + saved.getNom(),
                "ROLE_ETUDIANT");
        return saved;
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        etudiantRepository.deleteById(id);
    }
}
