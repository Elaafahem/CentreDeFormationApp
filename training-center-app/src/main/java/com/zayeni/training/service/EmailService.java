package com.zayeni.training.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        logger.info("Sending email to {}: {}", to, subject);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            } catch (Exception e) {
                logger.error("Failed to send email to " + to, e);
            }
        } else {
            logger.warn("JavaMailSender not configured. Email NOT sent to {}: {}", to, body);
        }
    }

    public void notifyRegistration(String studentEmail, String studentName) {
        String subject = "Confirmation d'inscription";
        String body = "Bonjour " + studentName + ",\n\nVotre inscription au centre de formation a été confirmée.";
        sendEmail(studentEmail, subject, body);
    }

    public void notifyTrainerEnrollment(String trainerEmail, String trainerName, String studentName,
            String courseName) {
        String subject = "Nouvelle inscription à votre cours";
        String body = "Bonjour " + trainerName + ",\n\nL'étudiant " + studentName + " s'est inscrit à votre cours: "
                + courseName;
        sendEmail(trainerEmail, subject, body);
    }
}
