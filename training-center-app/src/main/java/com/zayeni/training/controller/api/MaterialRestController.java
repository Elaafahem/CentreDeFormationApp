package com.zayeni.training.controller.api;

import com.zayeni.training.model.Material;
import com.zayeni.training.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialRestController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private com.zayeni.training.repository.CoursRepository coursRepository;

    @GetMapping("/course/{courseId}")
    public List<Material> getMaterialsByCourse(@PathVariable Long courseId) {
        return materialService.findByCoursId(courseId);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "description", required = false) String description) {
        try {
            // Create uploads directory if it doesn't exist
            String currentDir = System.getProperty("user.dir");
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(currentDir, "uploads", "materials");

            System.out.println("Upload Path: " + uploadPath.toAbsolutePath().toString()); // LOG PATH

            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                originalFilename = "unknown_file";
            }

            // Sanitize filename roughly
            originalFilename = java.nio.file.Paths.get(originalFilename).getFileName().toString();

            String uniqueFilename = System.currentTimeMillis() + "_" + originalFilename;
            java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file
            file.transferTo(filePath.toFile());

            // Create material entity
            Material material = new Material();
            material.setTitre(titre != null ? titre : originalFilename);
            material.setDescription(description);
            material.setFilePath(uniqueFilename);
            material.setFileType(file.getContentType());

            com.zayeni.training.model.Cours cours = coursRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            material.setCours(cours);

            Material savedMaterial = materialService.save(material);
            return ResponseEntity.ok(savedMaterial);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadMaterial(@PathVariable Long id) {
        try {
            Material material = materialService.findById(id);
            if (material == null) {
                return ResponseEntity.notFound().build();
            }

            String currentDir = System.getProperty("user.dir");
            java.nio.file.Path filePath = java.nio.file.Paths.get(currentDir, "uploads", "materials",
                    material.getFilePath());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(
                    filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + material.getTitre() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public Material createMaterial(@RequestBody Material material) {
        return materialService.save(material);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            Material material = materialService.findById(id);
            if (material != null) {
                // Delete file from filesystem
                String currentDir = System.getProperty("user.dir");
                java.nio.file.Path filePath = java.nio.file.Paths.get(currentDir, "uploads", "materials",
                        material.getFilePath());
                java.nio.file.Files.deleteIfExists(filePath);
            }
            materialService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting material: " + e.getMessage());
        }
    }
}
