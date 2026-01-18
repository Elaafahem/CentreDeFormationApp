package com.zayeni.training.service;

import com.zayeni.training.model.Material;
import com.zayeni.training.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public List<Material> findByCoursId(Long coursId) {
        return materialRepository.findByCoursId(coursId);
    }

    @SuppressWarnings("null")
    public Material save(Material material) {
        return materialRepository.save(material);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        materialRepository.deleteById(id);
    }

    @SuppressWarnings("null")
    public Material findById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }
}
