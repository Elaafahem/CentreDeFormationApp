package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Formateur;
import com.zayeni.training.repository.FormateurRepository;

@Service
public class FormateurService {

    @Autowired
    private FormateurRepository formateurRepository;

    @Autowired
    private UserAccountService userAccountService;

    @SuppressWarnings("null")
    public List<Formateur> findAll() {
        return formateurRepository.findAll();
    }

    public Formateur findById(Long id) {
        return formateurRepository.findById(id).orElse(null);
    }

    public Formateur findByEmail(String email) {
        return formateurRepository.findByEmail(email);
    }

    @SuppressWarnings("null")
    public Formateur save(Formateur formateur) {
        Formateur saved = formateurRepository.save(formateur);
        userAccountService.createAccountFor(saved.getEmail(), saved.getNom(), "ROLE_FORMATEUR");
        return saved;
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        formateurRepository.deleteById(id);
    }
}
