package com.zayeni.training.repository;

import com.zayeni.training.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    AcademicYear findByActiveTrue();
}
