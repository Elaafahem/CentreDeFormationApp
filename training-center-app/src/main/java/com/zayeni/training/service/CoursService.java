package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Cours;
import com.zayeni.training.repository.CoursRepository;

@Service
public class CoursService {

    @Autowired
    private CoursRepository coursRepository;

    @SuppressWarnings("null")
    public List<Cours> findAll() {
        return coursRepository.findAll();
    }

    @SuppressWarnings("null")
    public Cours findById(Long id) {
        return coursRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Cours save(Cours cours) {
        return coursRepository.save(cours);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        coursRepository.deleteById(id);
    }
}
