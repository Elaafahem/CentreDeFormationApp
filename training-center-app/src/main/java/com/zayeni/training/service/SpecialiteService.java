package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Specialite;
import com.zayeni.training.repository.SpecialiteRepository;

@Service
public class SpecialiteService {

    @Autowired
    private SpecialiteRepository specialiteRepository;

    @SuppressWarnings("null")
    public List<Specialite> findAll() {
        return specialiteRepository.findAll();
    }

    public Specialite findById(Long id) {
        return specialiteRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Specialite save(Specialite specialite) {
        return specialiteRepository.save(specialite);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        specialiteRepository.deleteById(id);
    }
}
