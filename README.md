# 🚀 TalentFlow ATS – Setup & Quickstart Guide

Dieses Dokument erklärt, wie das Gesamtsystem (**Spring Boot Backend** & **React Frontend**) in wenigen Schritten lokal gestartet und bedient werden kann.

---

## 📋 Voraussetzungen

* **Java JDK 21** (oder höher)
* **Node.js 18+** (inkl. `npm`)
* Ein moderner Webbrowser (Chrome, Firefox, Edge, Safari)

---

## ⚙️ 1. Backend starten (Java 21 & Spring Boot 3)

Das Backend nutzt den mitgelieferten Maven Wrapper (`mvnw`), sodass keine separate Maven-Installation erforderlich ist. Eine dateibasierte H2-Datenbank und Demodaten werden automatisch beim Start initialisiert.

1. **Terminal öffnen und ins Backend-Verzeichnis wechseln**:
   ```bash
   cd g:/Studium/Web-Programmierung-Projekt/Projekt/backend
   ```

2. **Backend-Server starten**:
   * **Windows (PowerShell / CMD)**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```

3. **Verfügbarkeit prüfen**:
   * REST-API läuft auf: `http://localhost:8000`
   * Interaktive API-Dokumentation (Swagger UI): `http://localhost:8000/docs`
   * Health-Check Endpunkt: `http://localhost:8000/api/v1/health`

---

## 💻 2. Frontend starten (React + TypeScript + Vite)

1. **Zweites Terminal öffnen und ins Frontend-Verzeichnis wechseln**:
   ```bash
   cd g:/Studium/Web-Programmierung-Projekt/Projekt/frontend
   ```

2. **Abhängigkeiten installieren** *(nur beim ersten Mal nötig)*:
   ```bash
   npm install
   ```

3. **Vite Development Server starten**:
   ```bash
   npm run dev
   ```

4. **Webanwendung im Browser öffnen**:
   👉 **`http://localhost:5173`**

*(Der Vite-Entwicklungsserver ist so vorkonfiguriert, dass alle `/api`-Anfragen automatisch an das Spring Boot Backend auf Port 8000 weitergeleitet werden).*

---

## 👥 3. Vorkonfigurierte Test-Accounts (Zero-Config)

Beim Start der Anwendung werden automatisch folgende Benutzerkonten mit Testdaten in der Datenbank angelegt:

| Rolle | E-Mail-Adresse | Passwort | Beschreibung / Zugriff |
| :--- | :--- | :--- | :--- |
| **Recruiter** | `recruiter@techcorp.de` | `recruiter123` | Zugriff auf Recruiter-Cockpit, Kanban-Board, Stellenverwaltung & Notizen |
| **System-Admin** | `admin@techcorp.de` | `admin123` | Vollzugriff inkl. Benutzerverwaltung & DSGVO-Batch-Cleanup-Job |
| **Bewerber (Konto)** | `max.mustermann@example.de` | `candidate123` | Eigene Bewerbungen einsehen, Status tracken & Bewerbung zurückziehen |
| **Gast-Bewerber** | *(kein Login nötig)* | – | Hürdenfreie Bewerbung via öffentlicher Karriereseite |

---

## 🗺️ 4. Wichtige Seiten & Klickpfade

* 🌐 **Karriereseite (Öffentlich)**: [`http://localhost:5173/`](http://localhost:5173/)
  * Live-Suche mit Debouncing, Abteilungsfilter und Stellendetails.
  * Hürdenfreie Schnellbewerbung mit Drag-and-Drop PDF-Upload.
* 🔐 **Login**: [`http://localhost:5173/login`](http://localhost:5173/login)
  * Schnellauswahl für Recruiter, Admin oder Bewerber mit 1-Klick Login-Hilfe.
* 📊 **Recruiter-Cockpit & Kanban-Board**: [`http://localhost:5173/recruiter`](http://localhost:5173/recruiter)
  * 6 Phasen-Workflow, Detaildrawer, integrierter PDF-Viewer, AGG-Notizen & Schnellkontakt.
* 🏢 **Stellenverwaltung**: [`http://localhost:5173/recruiter/jobs`](http://localhost:5173/recruiter/jobs)
  * Neue Stellen erstellen, bestehende bearbeiten, archivieren und Abteilungen verwalten.
* 👤 **Bewerber-Dashboard**: [`http://localhost:5173/applicant/dashboard`](http://localhost:5173/applicant/dashboard)
  * Statusverfolgung eingereichter Bewerbungen und 180-Tage-Löschfrist.
* 🛡️ **Compliance & Legal Hub**: [`http://localhost:5173/compliance`](http://localhost:5173/compliance)
  * Transparenz zu DSGVO (§ 26 BDSG), AGG (§ 1) und digitaler Barrierefreiheit (WCAG 2.1 AA).

---

## 🧪 5. Automatisierte Tests ausführen

Zur Überprüfung aller Backend-Sicherheitsmechanismen und des gesamten ATS-Workflows:

```bash
cd g:/Studium/Web-Programmierung-Projekt/Projekt/backend
.\mvnw.cmd test
```

---

## 🐳 6. Alternativer Start via Docker Compose (Staging- & Linux-Parität)

Für die isolierte Bereitstellung beider Services in Linux-Containern (gemäß ADR 0020):

```bash
cd g:/Studium/Web-Programmierung-Projekt/Projekt
docker compose up --build -d
```

* **Frontend (Nginx Alpine SPA & Reverse Proxy)**: `http://localhost:80`
* **Backend (Spring Boot 3 / JRE 21 Alpine)**: `http://localhost:8000`
* **Spring Boot Actuator Health Probe**: `http://localhost:8000/actuator/health`
* **Swagger API-Dokumentation**: `http://localhost:8000/docs`

Zum Stoppen der Container:
```bash
docker compose down
```
