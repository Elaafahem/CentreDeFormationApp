package com.zayeni.training.controller.api;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.zayeni.training.model.Session;
import com.zayeni.training.service.SessionService;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionRestController {

    @Autowired
    private SessionService sessionService;

    @GetMapping
    public List<Session> getAll() {
        return sessionService.findAll();
    }

    @GetMapping("/{id}")
    public Session getOne(@PathVariable Long id) {
        return sessionService.findById(id);
    }

    @PostMapping
    public Session create(@RequestBody Session session) {
        return sessionService.save(session);
    }

    @PutMapping("/{id}")
    public Session update(@PathVariable Long id, @RequestBody Session session) {
        session.setId(id);
        return sessionService.save(session);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        sessionService.deleteById(id);
    }
}
