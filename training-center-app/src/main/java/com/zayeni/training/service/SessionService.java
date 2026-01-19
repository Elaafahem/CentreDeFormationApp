package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Session;
import com.zayeni.training.repository.EtudiantRepository;
import com.zayeni.training.repository.GroupeRepository;
import com.zayeni.training.repository.SessionRepository;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private GroupeRepository groupeRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    public Session findById(Long id) {
        return sessionRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Session save(Session session) {
        return sessionRepository.save(session);
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        sessionRepository.deleteById(id);
    }

    public void toggleStatus(Long id) {
        Session session = findById(id);
        if (session != null) {
            session.setActive(!session.isActive());
            sessionRepository.save(session);
        }
    }

    public long countGroupsBySession(Session session) {
        // Assuming we will add findBySession in GroupeRepository or count by session
        return groupeRepository.countBySession(session);
    }

    public long countStudentsBySession(Session session) {
        // This is a bit more complex, as Etudiant is linked to Groupe, which is linked
        // to Session.
        // Option 1: JOIN query in EtudiantRepository
        // Option 2: Iterate groups (inefficient)
        // Let's assume we add countByGroupeSession in EtudiantRepository
        return etudiantRepository.countByGroupeSession(session);
    }
}
