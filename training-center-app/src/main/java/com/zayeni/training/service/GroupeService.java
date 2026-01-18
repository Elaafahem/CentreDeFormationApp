package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Groupe;
import com.zayeni.training.repository.GroupeRepository;

@Service
public class GroupeService {

    @Autowired
    private GroupeRepository groupeRepository;

    public List<Groupe> findAll() {
        return groupeRepository.findAll();
    }

    public Groupe findById(Long id) {
        return groupeRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Groupe save(Groupe groupe) {
        return groupeRepository.save(groupe);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        groupeRepository.deleteById(id);
    }
}
