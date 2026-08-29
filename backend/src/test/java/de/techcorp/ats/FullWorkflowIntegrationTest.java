package de.techcorp.ats;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.techcorp.ats.dto.CandidateRegisterRequest;
import de.techcorp.ats.dto.JobPostingCreateRequest;
import de.techcorp.ats.dto.LoginRequest;
import de.techcorp.ats.entity.EmploymentType;
import de.techcorp.ats.entity.JobPostingStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FullWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Healthcheck & Actuator Test")
    void testHealthCheck() throws Exception {
        // Standard Custom Health Check
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.database").value("connected"));

        // Spring Boot Actuator Health Probe (ADR 0020)
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("2. Complete ATS Workflow Test: Auth -> Jobs -> Application -> Notes -> Status -> Compliance")
    void testCompleteAtsWorkflow() throws Exception {
        // Step 1: Login as Recruiter
        LoginRequest loginRequest = new LoginRequest("recruiter@techcorp.de", "recruiter123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login/json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String recruiterToken = loginNode.get("access_token").asText();

        // Step 2: Fetch Current Profile
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("recruiter@techcorp.de"))
                .andExpect(jsonPath("$.role").value("RECRUITER"));

        // Step 3: Fetch Departments
        MvcResult deptResult = mockMvc.perform(get("/api/v1/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();

        JsonNode deptNode = objectMapper.readTree(deptResult.getResponse().getContentAsString());
        assertThat(deptNode.size()).isGreaterThan(0);
        long deptId = deptNode.get(0).get("id").asLong();

        // Step 4: Create a new Job Posting
        JobPostingCreateRequest newJob = new JobPostingCreateRequest();
        newJob.setTitle("Senior Java Backend Engineer");
        newJob.setDepartmentId(deptId);
        newJob.setLocation("Frankfurt am Main");
        newJob.setEmploymentType(EmploymentType.FULL_TIME);
        newJob.setDescription("Entwicklung von Spring Boot Backends.");
        newJob.setRequirements("Fundierte Java & Spring Boot Kenntnisse.");
        newJob.setBenefits("30 Tage Urlaub, Remote Work.");
        newJob.setStatus(JobPostingStatus.PUBLISHED);

        MvcResult jobResult = mockMvc.perform(post("/api/v1/jobs")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newJob)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("senior-java-backend-engineer"))
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andReturn();

        JsonNode jobJson = objectMapper.readTree(jobResult.getResponse().getContentAsString());
        long jobId = jobJson.get("id").asLong();
        String slug = jobJson.get("slug").asText();

        // Step 5: Public Lookup by Slug
        mockMvc.perform(get("/api/v1/jobs/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(jobId))
                .andExpect(jsonPath("$.title").value("Senior Java Backend Engineer"));

        // Step 6: Submit a Guest Application with valid PDF
        byte[] pdfContent = "%PDF-1.4 Mock PDF Content".getBytes();
        MockMultipartFile pdfFile = new MockMultipartFile(
                "cv_file",
                "Lebenslauf.pdf",
                "application/pdf",
                pdfContent
        );

        MvcResult appResult = mockMvc.perform(multipart("/api/v1/applications")
                        .file(pdfFile)
                        .param("job_posting_id", String.valueOf(jobId))
                        .param("first_name", "Max")
                        .param("last_name", "Mustermann")
                        .param("email", "max.mustermann@example.de")
                        .param("phone", "+49 170 1234567")
                        .param("expected_salary", "75000.00")
                        .param("dsgvo_consent", "true")
                        .param("cover_letter_text", "Sehr geehrte Damen und Herren..."))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.email").value("max.mustermann@example.de"))
                .andReturn();

        JsonNode appJson = objectMapper.readTree(appResult.getResponse().getContentAsString());
        long appId = appJson.get("id").asLong();

        // Step 7: Candidate Registers and Auto-Links previous application (ADR 0003)
        CandidateRegisterRequest candReg = new CandidateRegisterRequest(
                "max.mustermann@example.de",
                "securePassword123",
                "Max",
                "Mustermann"
        );

        mockMvc.perform(post("/api/v1/auth/register-candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candReg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CANDIDATE"));

        // Candidate Log in
        MvcResult candLoginResult = mockMvc.perform(post("/api/v1/auth/login/json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("max.mustermann@example.de", "securePassword123"))))
                .andExpect(status().isOk())
                .andReturn();

        String candidateToken = objectMapper.readTree(candLoginResult.getResponse().getContentAsString()).get("access_token").asText();

        // Candidate views own applications
        mockMvc.perform(get("/api/v1/applications/my")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(appId));

        // Step 8: Recruiter updates pipeline status
        mockMvc.perform(patch("/api/v1/applications/" + appId + "/status")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"SCREENING\", \"reason\": \"Gute Qualifikation\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SCREENING"));

        // Step 9: Recruiter creates AGG-compliant note
        mockMvc.perform(post("/api/v1/applications/" + appId + "/notes")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\": 5, \"content\": \"Starker Eindruck im Code-Portfolio.\", \"agg_disclaimer_confirmed\": true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5));

        // Step 10: DSGVO Anonymization
        mockMvc.perform(post("/api/v1/compliance/applications/" + appId + "/anonymize")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_anonymized").value(true))
                .andExpect(jsonPath("$.first_name").value("Anonymisiert"));
    }
}
