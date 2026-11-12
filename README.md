# Youth Empowerment Project (YEP) Platform

The **Youth Empowerment Project (YEP)** platform is a role-governed web application connecting young people aged 18–35 with virtual learning exchanges, mentor rubric evaluations, consent-driven partner opportunity boards, and programmatic impact auditing.

---

## 🚀 How to Run and Test Locally on Your Machine (`localhost`)

You can run and test the complete system locally with zero external server dependencies. All state, enrollments, project submissions, and audit logs persist locally in your browser's storage.

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, e.g. Node 20+)
- **npm** (comes bundled with Node.js) or **pnpm** / **yarn**

---

### Step 1: Clone or Copy the Repository
```bash
git clone <your-repository-url>
cd <repository-directory>
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Local Development Server
```bash
npm run dev
```

The Vite development server will start immediately on **port 3000**:
```text
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

### Step 4: Open in Your Browser
Navigate to:
```text
http://localhost:3000
```

---

## 👥 Demo Role Accounts (1-Click Instant Login)

Upon opening `http://localhost:3000`, the login interface displays 4 pre-configured demo accounts directly beneath the login form for 1-click authentication:

| Role | Name | Email | Persona Workflow |
| :--- | :--- | :--- | :--- |
| **Participant (Age 18–35)** | Amara Okafor | `amara.okafor@outlook.com` | Browse open cohorts, enroll with capacity checks, submit capstone projects, manage portfolio sharing consent. |
| **Mentor / Facilitator** | Dr. Marcus Vance | `marcus.vance@opendev.foundation` | View assigned cohorts, schedule virtual cohort sessions (meeting links), grade capstone projects with 1–5 rubrics. |
| **Employer / Partner** | Elena Rostova | `elena.rostova@afritechhorizons.io` | Publish digital jobs/internships, review consented candidate portfolios, send direct interview invitations. |
| **Administrator** | Sarah Chen | `sarah.chen@yep-initiative.org` | Monitor aggregate metrics, moderate flagged content, manage user suspensions with recorded reasons, inspect immutable audit logs, export zero-PII M&E reports. |

*(Password note: In local demo mode, any password value is accepted, or click the **"Sign In as [Role]"** button for instant 1-click access).*

---

## 🧪 Key Workflows to Test Locally

1. **Exchange Enrollment & Capacity Limits**:
   - Log in as **Amara Okafor** (Participant).
   - Go to **Exchange Catalogue**, filter by theme, and click **Enroll**.
   - Notice that if an exchange is full (e.g. 50/50 seats) or already enrolled, duplicate enrollments are blocked.
2. **Low-Bandwidth Mode & Offline Submissions**:
   - Toggle **Data Saver** or **Offline** in the header.
   - Download the low-bandwidth `.md` Study Bundle.
   - Submit a practical capstone project while simulated offline: the submission is safely cached in the local queue and flushes when reconnected.
3. **Standardized 1–5 Rubric Evaluation**:
   - Click **Sign Out** in the header and sign in as **Dr. Marcus Vance** (Mentor).
   - Open **Unified Project Review Queue**, select a submission, and evaluate against the 4 rubric dimensions (Technical Execution, Problem Solving, Practical Impact, Presentation Clarity).
4. **Consent-Driven Partner Board**:
   - Sign in as **Elena Rostova** (Partner) to view published openings.
   - Inspect applicants: candidate portfolio evidence and rubric grades are only revealed if the participant granted explicit consent.
5. **Administrative Audit Trail & M&E Export**:
   - Sign in as **Sarah Chen** (Administrator).
   - View the immutable security audit log where every registration, grading, and moderation event is recorded.
   - Click **Export M&E CSV** or **JSON** to download aggregated programmatic impact reports stripped of PII.

---

## 🛠️ Production Build
To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy Publicly via GitHub Pages & Student Developer Pack

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the static production bundle and publishes it to your `*.github.io` domain on every push to `main`.

### 1. Push to Your Existing Empty GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit: YEP Platform"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### 2. Enable GitHub Pages (GitHub Actions Source)
1. Open your repository on **GitHub.com**.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Your app will automatically build and deploy to:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`

*(With your active **GitHub Student Developer Pack**, GitHub Pro allows publishing GitHub Pages even from private repositories.)*

### 3. Optional: Connect Student Cloud Host or Custom Domain
- **Free Student Domain (`.me` / `.tech`)**: Claim a free domain via Namecheap or Name.com in the [GitHub Student Developer Pack](https://education.github.com/pack), point its DNS `CNAME` record to `<YOUR_USERNAME>.github.io`, and enter the domain under **Settings → Pages → Custom domain**.
- **Full-Stack Cloud Hosting (Azure / DigitalOcean)**: If you want the server-side Gemini 3.8 Flash API (`server.ts`) active online, deploy the same GitHub repository to **DigitalOcean App Platform** ($200 Student Pack credit) or **Azure App Service / Static Web Apps** ($100 Azure for Students credit), setting start command `npm start` and environment variable `GEMINI_API_KEY`.

