package com.zayeni.training.service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.zayeni.training.model.Inscription;
import com.zayeni.training.model.Note;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@Service
public class ReportService {

    public byte[] generateTranscriptPdf(Inscription i, List<Note> notes) throws Exception {
        InputStream reportStream = getClass().getResourceAsStream("/reports/transcript.jrxml");
        if (reportStream == null) {
            throw new RuntimeException("Report template not found: /reports/transcript.jrxml");
        }

        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("etudiantName", i.getEtudiant().getPrenom() + " " + i.getEtudiant().getNom());
        parameters.put("coursTitle", i.getCours().getTitre());

        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(notes);
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    public byte[] generateFullTranscriptPdf(com.zayeni.training.model.Etudiant e) throws Exception {
        InputStream reportStream = getClass().getResourceAsStream("/reports/transcript.jrxml");
        if (reportStream == null) {
            throw new RuntimeException("Report template not found: /reports/transcript.jrxml");
        }

        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("etudiantName", e.getPrenom() + " " + e.getNom());
        parameters.put("coursTitle", "Tous les cours");

        // Collect all notes from all inscriptions
        List<Note> allNotes = new java.util.ArrayList<>();
        if (e.getInscriptions() != null) {
            for (Inscription i : e.getInscriptions()) {
                if (i.getNotes() != null) {
                    allNotes.addAll(i.getNotes());
                }
            }
        }

        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(allNotes);
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}
