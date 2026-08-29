package de.techcorp.ats.service;

import de.techcorp.ats.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final byte[] PDF_MAGIC_BYTES = new byte[] { '%', 'P', 'D', 'F', '-' };
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf", ".docx", ".doc", ".odt", ".rtf", ".txt",
            ".png", ".jpg", ".jpeg", ".webp", ".gif"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".msi", ".dll", ".vbs", ".js", ".py", ".jar", ".com", ".scr", ".bin"
    );

    public FileStorageService(@Value("${ats.upload.dir:./uploads/documents}") String uploadPath) {
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Konnte Upload-Verzeichnis nicht erstellen: " + this.uploadDir, e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Die hochgeladene Datei ist leer.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Die Dateigröße darf maximal 10 MB betragen.");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String extension = getFileExtension(originalFilename).toLowerCase();

        String contentType = file.getContentType();
        if (contentType != null && (contentType.equals("application/x-msdownload") || contentType.equals("application/x-executable") || contentType.equals("application/x-sh"))) {
            throw new BadRequestException("Ausführbare Dateien und Skripte sind aus Sicherheitsgründen nicht erlaubt.");
        }

        if (BLOCKED_EXTENSIONS.contains(extension) || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Nicht unterstütztes Dateiformat. Erlaubt sind Dokumente (PDF, DOCX, DOC, ODT, RTF, TXT) und Bilder (PNG, JPG, JPEG, WEBP, GIF).");
        }

        // Validate Magic Bytes
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = inputStream.read(header);

            // Check for MZ header (Executable)
            if (read >= 2 && header[0] == 'M' && header[1] == 'Z') {
                throw new BadRequestException("Ausführbare Windows-Dateien sind nicht zulässig.");
            }

            // PDF validation
            if (extension.equals(".pdf")) {
                if (read < 5 || !matchesPdfHeader(header)) {
                    throw new BadRequestException("Ungültiges Dateiformat. Die Datei ist kein valides PDF-Dokument.");
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new BadRequestException("Fehler beim Lesen der Datei: " + e.getMessage());
        }

        // Store file with unique UUID and preserved extension
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetPath = this.uploadDir.resolve(storedFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            return targetPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Konnte Datei nicht speichern: " + e.getMessage(), e);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = Paths.get(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("Datei nicht gefunden oder nicht lesbar.");
            }
        } catch (MalformedURLException e) {
            throw new BadRequestException("Ungültiger Dateipfad.");
        }
    }

    public boolean deleteFile(String filePath) {
        try {
            Path file = Paths.get(filePath).normalize();
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            return false;
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex);
    }

    private boolean matchesPdfHeader(byte[] header) {
        for (int i = 0; i < PDF_MAGIC_BYTES.length; i++) {
            if (header[i] != PDF_MAGIC_BYTES[i]) {
                return false;
            }
        }
        return true;
    }
}
