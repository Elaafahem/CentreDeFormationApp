package com.zayeni.training.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zayeni.training.model.Session;
import com.zayeni.training.repository.SessionRepository;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

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
}
