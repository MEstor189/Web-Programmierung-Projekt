package de.techcorp.ats;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.techcorp.ats.dto.CandidateRegisterRequest;
import de.techcorp.ats.dto.JobPostingCreateRequest;
import de.techcorp.ats.dto.LoginRequest;
import de.techcorp.ats.entity.ApplicationDocument;
import de.techcorp.ats.entity.EmploymentType;
import de.techcorp.ats.entity.JobPostingStatus;
import de.techcorp.ats.repository.ApplicationDocumentRepository;
import de.techcorp.ats.repository.ApplicationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityAndComplianceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationDocumentRepository documentRepository;

    private String getJwtToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login/json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("access_token").asText();
    }

    @Test
    @DisplayName("Security 1: Multi-Stage Upload Security - Abweisung von Schadsoftware & gefälschten PDFs")
    void testUploadSecurity_RejectFakePdfsAndMalware() throws Exception {
        // Fall 1: Executable / Skript mit verbotenem MIME-Type
        MockMultipartFile exeFile = new MockMultipartFile(
                "cv_file",
                "malware.exe",
                "application/x-msdownload",
                "MZ This is a fake Windows executable".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(exeFile)
                        .param("job_posting_id", "1")
                        .param("first_name", "Evil")
                        .param("last_name", "Hacker")
                        .param("email", "evil@attacker.com")
                        .param("dsgvo_consent", "true"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));

        // Fall 2: Gefälschte PDF-Endung mit ungültigen Magic Bytes (Text-Inhalt statt %PDF-)
        MockMultipartFile fakePdf = new MockMultipartFile(
                "cv_file",
                "fake_cv.pdf",
                "application/pdf",
                "Plain text file pretending to be a PDF".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(fakePdf)
                        .param("job_posting_id", "1")
                        .param("first_name", "Evil")
                        .param("last_name", "Hacker")
                        .param("email", "fake_pdf@attacker.com")
                        .param("dsgvo_consent", "true"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ungültiges Dateiformat. Die Datei ist kein valides PDF-Dokument."));
    }

    @Test
    @DisplayName("Security 2: Path-Traversal-Abwehr & Blockierung gefährlicher Skript-Endungen")
    void testUploadSecurity_PathTraversalAndBlockedExtensions() throws Exception {
        // Fall 1: Path Traversal im Dateinamen (z.B. ../../../../etc/passwd) mit validen PDF Magic Bytes
        byte[] validPdfContent = "%PDF-1.5 Valid PDF Content For Security Test".getBytes();
        MockMultipartFile traversalFile = new MockMultipartFile(
                "cv_file",
                "../../../../etc/passwd.pdf",
                "application/pdf",
                validPdfContent
        );

        MvcResult result = mockMvc.perform(multipart("/api/v1/applications")
                        .file(traversalFile)
                        .param("job_posting_id", "1")
                        .param("first_name", "Traversal")
                        .param("last_name", "Tester")
                        .param("email", "traversal_" + System.currentTimeMillis() + "@test.de")
                        .param("dsgvo_consent", "true"))
                .andExpect(status().isCreated())
                .andReturn();

        long appId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
        List<ApplicationDocument> docs = documentRepository.findByApplicationId(appId);
        assertThat(docs).isNotEmpty();

        // Verifikation: Dateipfad wurde isoliert unter einer UUID im Upload-Verzeichnis gespeichert
        String storedPath = docs.get(0).getStoredFilepath();
        assertThat(storedPath).doesNotContain("..");
        assertThat(storedPath).contains("uploads");
        assertThat(Files.exists(Paths.get(storedPath))).isTrue();

        // Fall 2: Gefährliche Dateiendungen (.sh, .bat, .py, .msi) werden serverseitig abgewiesen
        String[] dangerousNames = { "payload.sh", "install.bat", "exploit.py", "setup.msi" };
        for (String badFilename : dangerousNames) {
            MockMultipartFile badFile = new MockMultipartFile(
                    "cv_file",
                    badFilename,
                    "application/octet-stream",
                    "echo 'hacked'".getBytes()
            );

            mockMvc.perform(multipart("/api/v1/applications")
                            .file(badFile)
                            .param("job_posting_id", "1")
                            .param("first_name", "Bad")
                            .param("last_name", "Script")
                            .param("email", "script_" + System.currentTimeMillis() + "@test.de")
                            .param("dsgvo_consent", "true"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    @DisplayName("Security 3: RBAC Endpunktschutz - Unberechtigte Zugriffe (401 & 403)")
    void testRbacEndpointProtection() throws Exception {
        // 1. Unauthentifizierter Aufruf von Recruiter-/Admin-Endpunkten -> 403 Forbidden
        mockMvc.perform(get("/api/v1/applications"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        // 2. Registrierung & Login als normaler Bewerber (Rolle CANDIDATE)
        String candEmail = "sec_cand_" + System.currentTimeMillis() + "@test.de";
        CandidateRegisterRequest candReg = new CandidateRegisterRequest(candEmail, "Password123!", "Sec", "Candidate");
        mockMvc.perform(post("/api/v1/auth/register-candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candReg)))
                .andExpect(status().isCreated());

        String candidateToken = getJwtToken(candEmail, "Password123!");

        // 3. Bewerber versucht geschützte Recruiter- & Admin-Endpunkte aufzurufen -> 403 Forbidden
        mockMvc.perform(get("/api/v1/applications")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/compliance/run-cleanup-job")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Hacked Department\"}"))
                .andExpect(status().isForbidden());

        // 4. Recruiter versucht Admin-Endpunkt aufzurufen (run-cleanup-job) -> 403 Forbidden
        String recruiterToken = getJwtToken("recruiter@techcorp.de", "recruiter123");
        mockMvc.perform(post("/api/v1/compliance/run-cleanup-job")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isForbidden());

        // 5. Admin darf Admin-Endpunkt aufrufen -> 200 OK
        String adminToken = getJwtToken("admin@techcorp.de", "admin123");
        mockMvc.perform(post("/api/v1/compliance/run-cleanup-job")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    @DisplayName("Security 4: Negative RBAC - Isolation fremder Bewerbungen & Notizen für Kandidaten")
    void testCandidateApplicationIsolation() throws Exception {
        // 1. Kandidat A registrieren und Bewerbung einreichen
        String candAEmail = "cand_a_" + System.currentTimeMillis() + "@test.de";
        mockMvc.perform(post("/api/v1/auth/register-candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateRegisterRequest(candAEmail, "Password123!", "Alice", "Candidate"))))
                .andExpect(status().isCreated());
        String tokenA = getJwtToken(candAEmail, "Password123!");

        byte[] pdfContent = "%PDF-1.4 Alice CV".getBytes();
        MockMultipartFile fileA = new MockMultipartFile("cv_file", "alice_cv.pdf", "application/pdf", pdfContent);
        MvcResult appResultA = mockMvc.perform(multipart("/api/v1/applications")
                        .file(fileA)
                        .header("Authorization", "Bearer " + tokenA)
                        .param("job_posting_id", "1")
                        .param("first_name", "Alice")
                        .param("last_name", "Candidate")
                        .param("email", candAEmail)
                        .param("dsgvo_consent", "true"))
                .andExpect(status().isCreated())
                .andReturn();
        long appAId = objectMapper.readTree(appResultA.getResponse().getContentAsString()).get("id").asLong();

        // 2. Kandidat B registrieren
        String candBEmail = "cand_b_" + System.currentTimeMillis() + "@test.de";
        mockMvc.perform(post("/api/v1/auth/register-candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateRegisterRequest(candBEmail, "Password123!", "Bob", "Candidate"))))
                .andExpect(status().isCreated());
        String tokenB = getJwtToken(candBEmail, "Password123!");

        // 3. Kandidat B versucht auf Bewerbung von Kandidat A zuzugreifen -> 403 Forbidden
        mockMvc.perform(get("/api/v1/applications/" + appAId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());

        // 4. Kandidat B versucht Bewerbung von Kandidat A zurückzuziehen -> 403 Forbidden
        mockMvc.perform(post("/api/v1/applications/" + appAId + "/withdraw")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());

        // 5. Kandidat A darf eigene Bewerbung einsehen -> 200 OK
        mockMvc.perform(get("/api/v1/applications/" + appAId)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appAId));

        // 6. Kandidat A versucht interne Recruiter-Notizen abzurufen -> 403 Forbidden
        mockMvc.perform(get("/api/v1/applications/" + appAId + "/notes")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security 5: Physikalische DSGVO-Dateilöschung & Anonymisierungsnachweis")
    void testPhysicalFileLifecycleAndGdprAnonymization() throws Exception {
        String recruiterToken = getJwtToken("recruiter@techcorp.de", "recruiter123");

        // 1. Bewerbung mit physischem PDF-Upload anlegen
        byte[] pdfBytes = "%PDF-1.7 Real PDF Content To Be Physically Destroyed".getBytes();
        MockMultipartFile cvFile = new MockMultipartFile(
                "cv_file",
                "DatenschutzTest_Lebenslauf.pdf",
                "application/pdf",
                pdfBytes
        );

        String testEmail = "gdpr_victim_" + System.currentTimeMillis() + "@test.de";
        MvcResult submitResult = mockMvc.perform(multipart("/api/v1/applications")
                        .file(cvFile)
                        .param("job_posting_id", "1")
                        .param("first_name", "Erika")
                        .param("last_name", "Mustermann")
                        .param("email", testEmail)
                        .param("phone", "+49 89 9876543")
                        .param("dsgvo_consent", "true"))
                .andExpect(status().isCreated())
                .andReturn();

        long appId = objectMapper.readTree(submitResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Dokumentenpfad in Datenbank ermitteln und physische Existenz auf Datenträger prüfen
        List<ApplicationDocument> docs = documentRepository.findByApplicationId(appId);
        assertThat(docs).isNotEmpty();
        String storedFilePath = docs.get(0).getStoredFilepath();
        Path physicalFilePath = Paths.get(storedFilePath);

        assertThat(Files.exists(physicalFilePath))
                .as("Die Datei muss vor der Anonymisierung physisch auf der Festplatte existieren")
                .isTrue();

        // 3. DSGVO-Anonymisierung ausführen
        mockMvc.perform(post("/api/v1/compliance/applications/" + appId + "/anonymize")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_anonymized").value(true))
                .andExpect(jsonPath("$.first_name").value("Anonymisiert"))
                .andExpect(jsonPath("$.email").value("anonymized_" + appId + "@deleted.de"));

        // 4. Verifikation der physischen Dateilöschung (Art. 17 DSGVO Recht auf Vergessenwerden)
        assertThat(Files.exists(physicalFilePath))
                .as("Die Datei muss nach der DSGVO-Anonymisierung physisch vom Datenträger gelöscht sein")
                .isFalse();
    }

    @Test
    @DisplayName("Security 6: Information-Leakage-Schutz (ADR 0010) - Unveröffentlichte Stellen liefern 404")
    void testInformationLeakageProtection() throws Exception {
        String recruiterToken = getJwtToken("recruiter@techcorp.de", "recruiter123");

        // Recruiter erstellt internen Entwurf (DRAFT)
        JobPostingCreateRequest draftJob = new JobPostingCreateRequest();
        draftJob.setTitle("Geheimes Stealth Projekt");
        draftJob.setDepartmentId(1L);
        draftJob.setLocation("Berlin");
        draftJob.setEmploymentType(EmploymentType.FULL_TIME);
        draftJob.setDescription("Vertrauliches Zukunftsprojekt.");
        draftJob.setRequirements("Senior Architekt.");
        draftJob.setStatus(JobPostingStatus.DRAFT);

        MvcResult result = mockMvc.perform(post("/api/v1/jobs")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draftJob)))
                .andExpect(status().isCreated())
                .andReturn();

        String draftSlug = objectMapper.readTree(result.getResponse().getContentAsString()).get("slug").asText();

        // 1. Unauthentifizierter Gast sucht nach dem Entwurf -> 404 Not Found (nicht 403!)
        mockMvc.perform(get("/api/v1/jobs/" + draftSlug))
                .andExpect(status().isNotFound());

        // 2. Recruiter kann den Entwurf einsehen -> 200 OK
        mockMvc.perform(get("/api/v1/jobs/" + draftSlug)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Geheimes Stealth Projekt"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("Security 7: AGG-Compliance Validierung - Notizen erfordern Bestätigung")
    void testAggConstraintEnforcement() throws Exception {
        String recruiterToken = getJwtToken("recruiter@techcorp.de", "recruiter123");

        // Versuch, Notiz ohne agg_disclaimer_confirmed einzureichen -> 400 Bad Request
        mockMvc.perform(post("/api/v1/applications/1/notes")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\": \"Test Notiz\", \"rating\": 4, \"agg_disclaimer_confirmed\": false}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Security 8: DSGVO Anonymisierung & Aufbewahrungsfristen-Batch-Job")
    void testComplianceCleanupBatchJob() throws Exception {
        String adminToken = getJwtToken("admin@techcorp.de", "admin123");

        // Führe Cleanup-Job als Admin aus
        mockMvc.perform(post("/api/v1/compliance/run-cleanup-job")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.processed_count").isNumber());
    }

    @Test
    @DisplayName("Security 9: SQL-Injection- und XSS-Resilienz")
    void testSqlInjectionAndXssResilience() throws Exception {
        // 1. SQL Injection Versuch in Suchparametern -> saubere 200 OK ohne SQL-Syntax-Error
        mockMvc.perform(get("/api/v1/jobs")
                        .param("search", "' OR '1'='1' -- "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());

        // 2. XSS Payload in Suchparametern -> keine ungefilterte Code-Ausführung oder Serverabsturz
        mockMvc.perform(get("/api/v1/jobs")
                        .param("search", "<script>alert('xss')</script>"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }
}
