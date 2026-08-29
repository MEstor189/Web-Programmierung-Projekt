package de.techcorp.ats.config;

import de.techcorp.ats.entity.*;
import de.techcorp.ats.repository.DepartmentRepository;
import de.techcorp.ats.repository.JobPostingRepository;
import de.techcorp.ats.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           JobPostingRepository jobPostingRepository,
                           PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed default departments if none exist
        if (departmentRepository.count() == 0) {
            List<Department> departments = Arrays.asList(
                    new Department("Software Engineering", "ENG", "Entwicklung von Frontend, Backend und Cloud-Systemen."),
                    new Department("DevOps & Infrastructure", "DEVOPS", "Sicherstellung von CI/CD Pipelines, Cloud-Infrastruktur und Security."),
                    new Department("UI/UX Design", "DESIGN", "Gestaltung von Benutzeroberflächen und Nutzererlebnissen."),
                    new Department("Data Science & AI", "DATA", "Analyse von Daten und Entwicklung von Machine-Learning-Modellen.")
            );
            departmentRepository.saveAll(departments);
        }

        // 2. Seed default demo users if none exist
        if (userRepository.count() == 0) {
            Department engDept = departmentRepository.findByCodeIgnoreCase("ENG").orElse(null);

            User adminUser = new User();
            adminUser.setEmail("admin@techcorp.de");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
            adminUser.setFirstName("Admin");
            adminUser.setLastName("TechCorp");
            adminUser.setRole(Role.ADMIN);
            adminUser.setDepartment(engDept);
            adminUser.setActive(true);

            User recruiterUser = new User();
            recruiterUser.setEmail("recruiter@techcorp.de");
            recruiterUser.setPasswordHash(passwordEncoder.encode("recruiter123"));
            recruiterUser.setFirstName("Sarah");
            recruiterUser.setLastName("Recruiter");
            recruiterUser.setRole(Role.RECRUITER);
            recruiterUser.setDepartment(engDept);
            recruiterUser.setActive(true);

            userRepository.saveAll(Arrays.asList(adminUser, recruiterUser));
        }

        // 3. Seed 7 realistic and diverse job postings if none exist
        if (jobPostingRepository.count() == 0) {
            User creator = userRepository.findByEmailIgnoreCase("recruiter@techcorp.de")
                    .or(() -> userRepository.findAll().stream().findFirst())
                    .orElse(null);

            Department engDept = departmentRepository.findByCodeIgnoreCase("ENG").orElse(null);
            Department devopsDept = departmentRepository.findByCodeIgnoreCase("DEVOPS").orElse(null);
            Department designDept = departmentRepository.findByCodeIgnoreCase("DESIGN").orElse(null);
            Department dataDept = departmentRepository.findByCodeIgnoreCase("DATA").orElse(null);

            if (creator != null && engDept != null) {
                LocalDateTime now = LocalDateTime.now();

                // Job 1: Senior Fullstack Engineer
                JobPosting job1 = new JobPosting();
                job1.setTitle("Senior Fullstack Engineer (Java / React)");
                job1.setSlug("senior-fullstack-engineer-java-react");
                job1.setDepartment(engDept);
                job1.setLocation("Berlin (Hybrid)");
                job1.setEmploymentType(EmploymentType.FULL_TIME);
                job1.setDescription("Als Senior Fullstack Engineer übernimmst du eine Schlüsselrolle bei der Weiterentwicklung unserer hochskalierbaren Cloud-Plattform. Du gestaltest moderne Web-Architekturen, implementierst performante Microservices in Spring Boot 3 und entwickelst reaktive, intuitive Benutzeroberflächen mit React und TypeScript. Gemeinsam mit einem agilen, cross-funktionalen Team treibst du technische Innovationen und Best Practices im gesamten Software-Lebenszyklus voran.");
                job1.setRequirements("• Mindestens 5 Jahre professionelle Erfahrung in der Fullstack-Entwicklung mit Java (Spring Boot) und modernen JavaScript/TypeScript-Frameworks (bevorzugt React)\n• Fundierte Kenntnisse in relationalen Datenbanken (PostgreSQL), RESTful API-Design und Microservice-Architekturen\n• Erfahrung mit Container-Technologien (Docker, Kubernetes) und CI/CD-Pipelines (GitHub Actions / GitLab CI)\n• Starkes Verständnis von Software-Qualität, TDD, Clean Code und Security-Prinzipien\n• Fließende Deutsch- und gute Englischkenntnisse in Wort und Schrift");
                job1.setBenefits("• 30 Tage Jahresurlaub und flexible Arbeitszeiten mit bis zu 80% Homeoffice-Anteil\n• 3.000 € jährliches Weiterbildungs- und Konferenzbudget\n• High-End Hardware nach Wahl (z.B. MacBook Pro M3 Max oder Dell XPS)\n• Urban Sports Club Mitgliedschaft oder Zuschuss zum Fitnessstudio\n• Bezuschusstes Deutschlandticket & betriebliche Altersvorsorge (bAV)\n• Regelmäßige Team-Events, Hackathons und Tech-Talks");
                job1.setStatus(JobPostingStatus.PUBLISHED);
                job1.setCreator(creator);
                job1.setPublishedAt(now.minusDays(6));

                // Job 2: Cloud & DevOps Engineer
                JobPosting job2 = new JobPosting();
                job2.setTitle("Cloud & DevOps Engineer (Kubernetes & AWS)");
                job2.setSlug("cloud-devops-engineer-kubernetes-aws");
                job2.setDepartment(devopsDept != null ? devopsDept : engDept);
                job2.setLocation("Frankfurt am Main (Remote)");
                job2.setEmploymentType(EmploymentType.FULL_TIME);
                job2.setDescription("Für den Ausbau und die Absicherung unserer Multi-Cloud-Infrastruktur suchen wir einen engagierten Cloud & DevOps Engineer. Du automatisierst Infrastrukturen mit Infrastructure-as-Code (Terraform), optimierst unsere Kubernetes-Cluster und stellst hochverfügbare, resiliente CI/CD-Deployment-Pipelines für unsere Entwicklerteams bereit.");
                job2.setRequirements("• Fundierte Praxiserfahrung im Betrieb von Cloud-Umgebungen (AWS oder Azure) und Container-Orchestrierung (Kubernetes, Helm)\n• Sichere Beherrschung von Infrastructure-as-Code (Terraform, Ansible)\n• Erfahrung im Aufbau und der Wartung von CI/CD-Pipelines (GitHub Actions, ArgoCD)\n• Kenntnisse in Monitoring und Observability (Prometheus, Grafana, OpenTelemetry, ELK-Stack)\n• Hands-on-Mentalität und Begeisterung für Automatisierung und 'Infrastructure as Code'");
                job2.setBenefits("• 100% Remote-Work innerhalb Deutschlands möglich inkl. voller Ausstattung fürs Homeoffice\n• Volle Kostenübernahme für Zertifizierungen (AWS Certified Solutions Architect, CKA/CKAD)\n• Attraktive Vergütung und erfolgsabhängige Jahresprämie\n• Firmenhandy auch zur privaten Nutzung\n• Großzügige betriebliche Altersvorsorge mit Arbeitgeberzuschuss");
                job2.setStatus(JobPostingStatus.PUBLISHED);
                job2.setCreator(creator);
                job2.setPublishedAt(now.minusDays(5));

                // Job 3: Lead UI/UX Designer
                JobPosting job3 = new JobPosting();
                job3.setTitle("Lead UI/UX Designer & Design Systems Architect");
                job3.setSlug("lead-ui-ux-designer-design-systems-architect");
                job3.setDepartment(designDept != null ? designDept : engDept);
                job3.setLocation("München (Hybrid)");
                job3.setEmploymentType(EmploymentType.FULL_TIME);
                job3.setDescription("Als Lead UI/UX Designer bist du die treibende Kraft für das visuelle Erscheinungsbild und die Benutzerführung aller TechCorp-Produkte. Du verantwortest den Aufbau, die Standardisierung und Weiterentwicklung unseres zentralen Design-Systems in Figma und arbeitest eng mit Product Managern und Frontend-Entwicklern zusammen, um barrierefreie, begeisternde Nutzererlebnisse zu schaffen.");
                job3.setRequirements("• Mindestens 4 Jahre Erfahrung im Bereich UI/UX Design für komplexe SaaS-, Web- oder Enterprise-Anwendungen\n• Nachweisbare Expertise in der Konzeption, Dokumentation und Skalierung von Design Systems in Figma\n• Fundierte Kenntnisse im Bereich Barrierefreiheit und Accessibility-Standards (WCAG 2.1 AA / BFSG)\n• Methodenkompetenz in User Research, Usability Testing, Wireframing und interaktivem Prototyping\n• Ausgeprägte Kommunikationsstärke und Freude an der Moderation von Design-Thinking-Workshops");
                job3.setBenefits("• Zentrales, modernes Design-Studio im Herzen von München mit Dachterrasse\n• Modernste Kreativ-Ausstattung (Apple Studio Display, iPad Pro, Figma Enterprise)\n• 30 Tage Urlaub, flexible Vertrauensarbeitszeit und hybrides Arbeitsmodell\n• JobRad-Leasing und Fahrtkostenzuschuss\n• Regelmäßige Design-Retreats und Teilnahme an führenden UX-Konferenzen (Config, UXDX)");
                job3.setStatus(JobPostingStatus.PUBLISHED);
                job3.setCreator(creator);
                job3.setPublishedAt(now.minusDays(4));

                // Job 4: Data Scientist & ML Engineer
                JobPosting job4 = new JobPosting();
                job4.setTitle("Data Scientist & Machine Learning Engineer (NLP / LLM)");
                job4.setSlug("data-scientist-machine-learning-engineer-nlp-llm");
                job4.setDepartment(dataDept != null ? dataDept : engDept);
                job4.setLocation("Hamburg (Hybrid)");
                job4.setEmploymentType(EmploymentType.FULL_TIME);
                job4.setDescription("Verstärke unser KI- und Data-Team bei der Entwicklung intelligenter Analyse- und Matching-Algorithmen. Du trainierst, evaluierst und integrierst modernste NLP- und LLM-Modelle in unsere Plattform, optimierst Vektordatenbanken und entwickelst datengestützte Features, die echten Mehrwert für unsere Kunden generieren.");
                job4.setRequirements("• Abgeschlossenes Masterstudium in Informatik, Data Science, Statistik, Mathematik oder vergleichbare Qualifikation\n• Mindestens 3 Jahre Erfahrung mit Python und dem Data-Science-Stack (PyTorch, TensorFlow, Pandas, Scikit-Learn)\n• Praktische Erfahrung mit Large Language Models (LLMs), RAG-Architekturen, Embeddings und Vektor-DBs (z.B. pgvector, Qdrant)\n• Erfahrung im produktiven Bereitstellen von ML-Modellen (FastAPI, MLflow, Docker)\n• Analytisches Denkvermögen und Leidenschaft für datengetriebene Problemlösungen");
                job4.setBenefits("• Zugriff auf leistungsstarke GPU-Cluster und Cloud-Compute-Ressourcen\n• 2.500 € Weiterbildungsbudget sowie Zeit für eigene Open-Source- und Forschungsprojekte\n• Hybrides Arbeitsmodell mit flexiblen Arbeitszeiten und Homeoffice\n• Betriebliche Krankenzusatzversicherung und bezuschusste Mittagsverpflegung\n• Offene Feedbackkultur und agiles Arbeiten auf Augenhöhe");
                job4.setStatus(JobPostingStatus.PUBLISHED);
                job4.setCreator(creator);
                job4.setPublishedAt(now.minusDays(3));

                // Job 5: Frontend Developer (Werkstudent)
                JobPosting job5 = new JobPosting();
                job5.setTitle("Frontend Developer (React & TypeScript) - Werkstudent");
                job5.setSlug("frontend-developer-react-typescript-werkstudent");
                job5.setDepartment(engDept);
                job5.setLocation("Köln (Hybrid)");
                job5.setEmploymentType(EmploymentType.WORKING_STUDENT);
                job5.setDescription("Du möchtest während deines Studiums praxisnahe Erfahrung in einem professionellen Entwicklungsumfeld sammeln? Als Werkstudent im Frontend-Team unterstützt du uns bei der Umsetzung moderner Benutzeroberflächen mit React 18/19, TypeScript und CSS. Du lernst Best Practices in State Management, API-Integration und Clean Code von erfahrenen Senior Developern.");
                job5.setRequirements("• Eingeschriebene/r Student/in der Informatik, Wirtschaftsinformatik, Medieninformatik oder eines verwandten Studiengangs\n• Erste praktische Erfahrungen mit JavaScript/TypeScript, HTML5, CSS und React (z.B. durch Uniprojekte oder eigene Apps)\n• Grundlegendes Verständnis von REST-Schnittstellen und Git-Versionsverwaltung\n• Hohe Lernbereitschaft, strukturierte Arbeitsweise und Begeisterung für moderne Webtechnologien\n• Verfügbarkeit von 15–20 Stunden pro Woche (in den Semesterferien gerne bis zu 40 Stunden)");
                job5.setBenefits("• Attraktiver Stundenlohn (19 – 23 €/h je nach Vorerfahrung) und bezahlter Urlaub\n• Maximale zeitliche Flexibilität und Anpassung an deine Vorlesungs- und Prüfungspläne\n• Umfassendes Mentoring und 1-on-1-Coaching durch Senior Software Engineers\n• Möglichkeit zur Betreuung von Bachelor- oder Masterarbeiten mit Praxisbezug\n• Hervorragende Perspektive auf eine Festanstellung nach Studienabschluss");
                job5.setStatus(JobPostingStatus.PUBLISHED);
                job5.setCreator(creator);
                job5.setPublishedAt(now.minusDays(2));

                // Job 6: Site Reliability & Security Engineer
                JobPosting job6 = new JobPosting();
                job6.setTitle("Site Reliability & Security Engineer (DevSecOps)");
                job6.setSlug("site-reliability-security-engineer-devsecops");
                job6.setDepartment(devopsDept != null ? devopsDept : engDept);
                job6.setLocation("Stuttgart (Hybrid)");
                job6.setEmploymentType(EmploymentType.FULL_TIME);
                job6.setDescription("Sicherheit und Zuverlässigkeit stehen bei TechCorp an erster Stelle. Als Site Reliability & Security Engineer integrierst du Sicherheitsprüfungen (SAST/DAST, Container Scanning) direkt in unsere CI/CD-Pipelines, überwachst Service-Level-Objectives (SLOs/SLAs) und implementierst Best Practices nach ISO 27001, SOC 2 und DSGVO.");
                job6.setRequirements("• Mehrjährige Erfahrung im Bereich IT-Sicherheit, DevSecOps oder Site Reliability Engineering (SRE)\n• Fundiertes Wissen in Linux-Sicherheit, Netzwerkprotokollen, TLS/SSL und Identity Management (OAuth2, OIDC)\n• Erfahrung mit Secret Management (HashiCorp Vault), Vulnerability Scanning (Trivy, Snyk) und WAFs\n• Kenntnisse in der Incident-Response, Root-Cause-Analyse und Durchführung von Security-Audits\n• Sichere Deutsch- und Englischkenntnisse sowie ausgeprägtes Verantwortungsbewusstsein");
                job6.setBenefits("• 30 Tage Urlaub sowie Sonderurlaub für Fortbildungen\n• Fachbezogene Security-Zertifizierungen (z.B. CISSP, CISM, CEH) vollständig finanziert\n• Ergonomischer Arbeitsplatz mit modernster Technik im Stuttgarter Technologiepark\n• Mobilitätsprämie oder Firmenwagenoption\n• Attraktive betriebliche Altersvorsorge mit überdurchschnittlichem Arbeitgeberanteil");
                job6.setStatus(JobPostingStatus.PUBLISHED);
                job6.setCreator(creator);
                job6.setPublishedAt(now.minusDays(1));

                // Job 7: Product Design & UX Research Praktikant
                JobPosting job7 = new JobPosting();
                job7.setTitle("Product Design & UX Research Praktikant (w/m/d)");
                job7.setSlug("product-design-ux-research-praktikant");
                job7.setDepartment(designDept != null ? designDept : engDept);
                job7.setLocation("Remote (Deutschlandweit)");
                job7.setEmploymentType(EmploymentType.INTERNSHIP);
                job7.setDescription("Du brennst für nutzerzentriertes Design und möchtest tiefe Einblicke in den gesamten Product-Design-Prozess gewinnen? In diesem 3- bis 6-monatigen Praktikum begleitest du User-Interviews, hilfst bei der Analyse von Nutzerdaten und erstellst interaktive Wireframes und Klick-Prototypen in Figma. Du wirst von Tag eins an als vollwertiges Teammitglied integriert.");
                job7.setRequirements("• Studium im Bereich UX/UI Design, Interaction Design, Medieninformatik, Informationsdesign oder Psychologie\n• Erste Erfahrungen im Umgang mit Design-Tools wie Figma oder Adobe XD\n• Interesse an quantitativen und qualitativen Research-Methoden (Usability-Tests, Personas, User Journeys)\n• Kreativität, Neugierde und ein gutes Gespür für Ästhetik und Nutzerbedürfnisse\n• Fließende Deutschkenntnisse in Wort und Schrift");
                job7.setBenefits("• Faire und überdurchschnittliche Praktikumsvergütung (1.850 €/Monat)\n• 100% remote Arbeitsmöglichkeit mit bereitgestelltem MacBook\n• Fest zugewiesener Mentor für regelmäßiges Feedback und persönliche Weiterentwicklung\n• Übernahmeoption in eine Werkstudententätigkeit oder Junior-Stelle nach dem Praktikum\n• Teilnahme an internen Design-Workshops und Team-Events");
                job7.setStatus(JobPostingStatus.PUBLISHED);
                job7.setCreator(creator);
                job7.setPublishedAt(now);

                jobPostingRepository.saveAll(Arrays.asList(job1, job2, job3, job4, job5, job6, job7));
            }
        }
    }
}
