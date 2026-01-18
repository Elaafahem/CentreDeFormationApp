package com.zayeni.training;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.zayeni.training.model.Cours;
import com.zayeni.training.model.Etudiant;
import com.zayeni.training.model.Formateur;
import com.zayeni.training.model.Inscription;
import com.zayeni.training.model.Note;
import com.zayeni.training.model.Role;
import com.zayeni.training.model.User;
import com.zayeni.training.model.Specialite;
import com.zayeni.training.repository.CoursRepository;
import com.zayeni.training.repository.EtudiantRepository;
import com.zayeni.training.repository.FormateurRepository;
import com.zayeni.training.repository.InscriptionRepository;
import com.zayeni.training.repository.NoteRepository;
import com.zayeni.training.repository.RoleRepository;
import com.zayeni.training.repository.UserRepository;
import com.zayeni.training.repository.SpecialiteRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private EtudiantRepository etudiantRepo;

    @Autowired
    private FormateurRepository formateurRepo;

    @Autowired
    private CoursRepository coursRepo;

    @Autowired
    private InscriptionRepository inscriptionRepo;

    @Autowired
    private NoteRepository noteRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SpecialiteRepository specialiteRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Seeding Initial Database Data (Idempotent) ===");

        // 0. Create Roles
        List<String> roles = Arrays.asList("ROLE_ADMIN", "ROLE_FORMATEUR", "ROLE_ETUDIANT");
        for (String r : roles) {
            String roleName = r;
            if (roleRepo.findByName(roleName) == null) {
                // Determine description based on role name
                String description = "";
                if (r.equals("ROLE_ADMIN"))
                    description = "Administrateur système";
                else if (r.equals("ROLE_FORMATEUR"))
                    description = "Formateur - Gestion cours et notes";
                else
                    description = "Étudiant - Consultation uniquement";

                roleRepo.save(new Role(roleName, description));
            }
        }

        // 0.1 Create Admin User
        if (userRepo.findByUsername("admin") == null) {
            Role adminRole = roleRepo.findByName("ROLE_ADMIN");
            User admin = new User("admin", passwordEncoder.encode("admin123"), true, Arrays.asList(adminRole));
            userRepo.save(admin);
            System.out.println("-> Created Admin user: admin / admin123");
        }

        // 1. Create Trainers with Specialities
        String[][] trainerData = {
                { "Mohamed Zayeni", "Spring Boot / Java", "zayeni@gmail.com" },
                { "Sarra Ben Ahmed", "UX/UI Design", "sarra.design@email.com" },
                { "Ahmed Mansouri", "DevOps & Cloud", "ahmed.ops@email.com" },
                { "Leila Gharbi", "Data Science", "leila.data@email.com" }
        };
        List<Formateur> trainers = new ArrayList<>();
        for (String[] data : trainerData) {
            Formateur f = formateurRepo.findByEmail(data[2]);
            if (f == null) {
                // Find or create specialite
                String specName = data[1];
                Specialite spec = specialiteRepo.findByNom(specName);
                if (spec == null) {
                    spec = specialiteRepo.save(new Specialite(specName, "Spécialité " + specName));
                }
                f = formateurRepo.save(new Formateur(data[0], spec, data[2]));
            }
            trainers.add(f);

            // Create user account for trainer if not exists
            if (userRepo.findByUsername(data[2]) == null) {
                Role trainerRole = roleRepo.findByName("ROLE_FORMATEUR");
                User trainerUser = new User(data[2], passwordEncoder.encode("formateur123"), true,
                        Arrays.asList(trainerRole));
                userRepo.save(trainerUser);
            }
        }

        // 2. Create Courses
        String[][] courseData = {
                { "Spring Boot Avancé", "Maîtrisez microservices et sécurité", "0" },
                { "Figma Masterclass", "Design d'interfaces modernes de A à Z", "1" },
                { "Introduction à Docker", "Conteneurisation pour débutants", "2" },
                { "Deep Learning avec Python", "Réseaux de neurones et IA", "3" },
                { "React & Next.js", "Le futur du développement web frontend", "0" }
        };
        List<Cours> courses = new ArrayList<>();
        int codeCounter = 101;
        for (String[] data : courseData) {
            String generatedCode = "CRS-" + codeCounter++;
            Cours c = coursRepo.findByTitre(data[0]);
            if (c == null) {
                int trainerIndex = Integer.parseInt(data[2]);
                if (trainerIndex < trainers.size()) {
                    Formateur f = trainers.get(trainerIndex);
                    c = coursRepo.save(new Cours(generatedCode, data[0], data[1], f));
                }
            }
            if (c != null)
                courses.add(c);
        }

        // 3. Create Students
        String[] firstNames = { "Amine", "Sami", "Yasmine", "Meryem", "Omar", "Hager", "Khalil", "Rim", "Anis",
                "Selma" };
        String[] lastNames = { "Trabelsi", "Ayari", "Hammami", "Belhedi", "Cherif", "Dridi", "Zidi", "Khlifi",
                "Slimani", "Bouazizi" };

        List<Etudiant> students = new ArrayList<>();
        int matriculeCounter = 2025000;
        for (int i = 0; i < 10; i++) {
            String email = firstNames[i].toLowerCase() + "." + lastNames[i].toLowerCase() + "@etudiant.tn";
            String matricule = "MAT-" + matriculeCounter++;
            Etudiant e = etudiantRepo.findByEmail(email);
            if (e == null) {
                e = etudiantRepo.save(new Etudiant(matricule, lastNames[i], firstNames[i], email, new Date()));
            }
            students.add(e);

            // Create User account for student
            if (userRepo.findByUsername(email) == null) {
                Role studentRole = roleRepo.findByName("ROLE_ETUDIANT");
                User studentUser = new User(email, passwordEncoder.encode("etudiant123"), true,
                        Arrays.asList(studentRole));
                userRepo.save(studentUser);
            }
        }

        // 4. Create Inscriptions & Random Notes
        Random rand = new Random();
        for (Etudiant s : students) {
            // Enroll in 2 random courses
            for (int k = 0; k < 2; k++) {
                Cours c = courses.get(rand.nextInt(courses.size()));

                // Check if already enrolled
                if (inscriptionRepo.findByEtudiantAndCours(s, c) == null) {
                    Inscription ins = new Inscription(new Date(), s, c);
                    inscriptionRepo.save(ins);

                    // Add a mock note
                    Note n = new Note(10 + rand.nextDouble() * 10, "Bien", ins); // Note between 10 and 20
                    noteRepo.save(n);
                }
            }
        }

        System.out.println("-> Database seeded with Trainers, Courses, Students, Inscriptions, and Notes.");
    }
}
