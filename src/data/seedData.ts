import {
  UserProfile,
  VirtualExchange,
  Enrollment,
  ProjectSubmission,
  PartnerOpportunity,
  ExpressionOfInterest,
  AuditLogEntry,
  AchievementBadge,
  AppNotification
} from '../types/yep';

import heroYouthImg from '../assets/images/yep_hero_youth_learning_1794428115627.jpg';
import exchangeCloudImg from '../assets/images/yep_exchange_cloud_tech_1794428117839.jpg';
import exchangeAgritechImg from '../assets/images/yep_exchange_agritech_1794428117636.jpg';
import partnerEmploymentImg from '../assets/images/yep_partner_employment_1794428118093.jpg';

export const SEED_HERO_IMAGE = heroYouthImg;
export const SEED_EXCHANGE_CLOUD_IMAGE = exchangeCloudImg;
export const SEED_EXCHANGE_AGRITECH_IMAGE = exchangeAgritechImg;
export const SEED_PARTNER_IMAGE = partnerEmploymentImg;

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-part-01',
    name: 'Amara Okafor',
    email: 'amara.okafor@outlook.com',
    role: 'participant',
    age: 22,
    region: 'West Africa (Lagos, Nigeria)',
    titleOrOrg: 'Aspiring Full-Stack Software Developer',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git Workflow'],
    interests: ['Cloud & Web Dev', 'AI & Data Analytics', 'Civic Tech & Social Innovation'],
    careerGoal: 'Secure an entry-level junior software engineering role building scalable community tools.',
    bio: 'Passionate about leveraging modern web architectures and asynchronous data pipelines to solve low-bandwidth challenges across West Africa.',
    consentDataSharing: true,
    isSuspended: false,
    registeredAt: '2026-09-14T09:30:00Z'
  },
  {
    id: 'usr-mentor-01',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@opendev.foundation',
    role: 'mentor',
    region: 'East Africa (Nairobi, Kenya)',
    titleOrOrg: 'Principal Cloud Architect & Curriculum Fellow at OpenDev',
    skills: ['Distributed Systems', 'Cloud Architecture', 'Mentorship & Pedagogy', 'System Design'],
    interests: ['Cloud & Web Dev', 'Civic Tech & Social Innovation'],
    bio: '12+ years building cloud-native infrastructure and mentoring over 800 young engineers across Africa. Passionate about practical engineering rubrics.',
    consentDataSharing: false,
    isSuspended: false,
    isVetted: true,
    registeredAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'usr-partner-01',
    name: 'Elena Rostova',
    email: 'elena.rostova@afritechhorizons.io',
    role: 'partner',
    region: 'Global / Southern Africa (Johannesburg, South Africa)',
    titleOrOrg: 'Head of Emerging Talent at AfriTech Horizons & Global Labs',
    skills: ['Talent Sourcing', 'Workforce Development', 'Technical Recruiting'],
    interests: ['Cloud & Web Dev', 'Green Tech & Agritech', 'AI & Data Analytics'],
    bio: 'AfriTech Horizons partners with high-growth technology ventures to place certified youth in paid digital apprenticeships and remote junior engineering roles.',
    consentDataSharing: false,
    isSuspended: false,
    isVetted: true,
    registeredAt: '2026-08-15T14:20:00Z'
  },
  {
    id: 'usr-admin-01',
    name: 'Sarah Chen',
    email: 'sarah.chen@yep-initiative.org',
    role: 'admin',
    region: 'Programme Secretariat (Global Coordination Hub)',
    titleOrOrg: 'YEP Programme Director & Operations Lead',
    skills: ['Programme Monitoring & Evaluation', 'Trust & Safety', 'Audit Compliance', 'Demographic Research'],
    interests: ['Youth Empowerment', 'Audit Transparency', 'Equitable Access'],
    bio: 'Overseeing YEP regional hubs, safeguarding youth data privacy, moderating exchange content, and delivering verifiable M&E impact metrics.',
    consentDataSharing: false,
    isSuspended: false,
    isVetted: true,
    registeredAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'usr-part-02',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@ghanalabs.tech',
    role: 'participant',
    age: 24,
    region: 'West Africa (Accra, Ghana)',
    titleOrOrg: 'Junior Data Analyst & Python Scripter',
    skills: ['Python', 'SQL', 'Data Visualization', 'Pandas'],
    interests: ['AI & Data Analytics', 'Green Tech & Agritech'],
    careerGoal: 'Apply data analytics to local agricultural yield forecasting.',
    bio: 'Self-taught data enthusiast looking to bridge satellite data with smallholder farm efficiency.',
    consentDataSharing: true,
    isSuspended: false,
    registeredAt: '2026-09-20T11:15:00Z'
  },
  {
    id: 'usr-part-03',
    name: 'Fatima Al-Mansoor',
    email: 'fatima.almansoor@cairodesign.org',
    role: 'participant',
    age: 21,
    region: 'North Africa (Cairo, Egypt)',
    titleOrOrg: 'UI/UX Designer & Design Systems Apprentice',
    skills: ['Figma', 'User Research', 'Design Systems', 'Accessibility Audit'],
    interests: ['UI/UX & Creative Media', 'Digital Growth & Product'],
    careerGoal: 'Design intuitive interfaces for non-profit and educational mobile applications.',
    bio: 'Focused on high-contrast accessibility and mobile design patterns for first-time internet users.',
    consentDataSharing: false,
    isSuspended: false,
    registeredAt: '2026-10-02T16:45:00Z'
  }
];

export const INITIAL_EXCHANGES: VirtualExchange[] = [
  {
    id: 'exc-01',
    title: 'Cloud-Native Web Architecture & Microservices',
    theme: 'Cloud & Web Dev',
    skillLevel: 'Intermediate',
    format: '4-Week Cohort',
    startDate: '2026-11-15',
    endDate: '2026-12-12',
    scheduleSummary: 'Tuesdays & Thursdays, 17:00–18:30 GMT',
    facilitatorId: 'usr-mentor-01',
    facilitatorName: 'Dr. Marcus Vance',
    facilitatorTitle: 'Principal Cloud Architect',
    facilitatorOrg: 'OpenDev Foundation',
    capacityMax: 40,
    enrolledCount: 36,
    status: 'open',
    summary: 'Master robust API contracts, resilient caching, and containerized deployment tailored for intermittent internet conditions and high-efficiency architectures.',
    learningOutcomes: [
      'Architect stateless backend microservices using Node.js & REST principles',
      'Implement resilient offline-first caching patterns and optimistic client updates',
      'Deploy production containers on cloud infrastructure with automated health probes',
      'Produce professional technical documentation and peer code review artifacts'
    ],
    prerequisites: 'Basic JavaScript/TypeScript familiarity and fundamental Git branching concepts.',
    bannerImage: SEED_EXCHANGE_CLOUD_IMAGE,
    assignmentTitle: 'Resilient Low-Bandwidth REST Service Implementation',
    assignmentPrompt: 'Build and deploy a lightweight REST service with client caching headers, graceful network degradation, and automated unit tests. Submit your repository link, live deployment URL, and an architectural summary.',
    sessions: [
      {
        id: 'ses-01-1',
        title: 'Orientation & Architectural Foundations',
        date: '2026-11-17',
        time: '17:00–18:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-cloud-native-w1',
        agenda: 'Introductions, container setup, stateless API contracts, and low-bandwidth architectural considerations.',
        isCompleted: false
      },
      {
        id: 'ses-01-2',
        title: 'Offline Sync & Optimistic Mutation Strategies',
        date: '2026-11-19',
        time: '17:00–18:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-cloud-native-w2',
        agenda: 'Implementing retryable HTTP queues, idempotency tokens, and local cache synchronization.',
        isCompleted: false
      },
      {
        id: 'ses-01-3',
        title: 'Containerization & Cloud Health Checking',
        date: '2026-11-24',
        time: '17:00–18:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-cloud-native-w3',
        agenda: 'Dockerfile optimization, multi-stage builds, and deployment on serverless container runtimes.',
        isCompleted: false
      },
      {
        id: 'ses-01-4',
        title: 'Final Capstone Review & Industry Panel',
        date: '2026-12-08',
        time: '17:00–19:00 GMT',
        durationMinutes: 120,
        meetingLink: 'https://meet.jit.si/yep-cloud-native-capstone',
        agenda: 'Live project showcases, partner feedback, rubric evaluations, and career mentorship.',
        isCompleted: false
      }
    ],
    offlinePack: {
      title: 'YEP-CloudNative-OfflineStudyBundle.md',
      fileSizeBytes: 245000,
      notesMarkdown: `# YEP Virtual Exchange: Cloud-Native Web Architecture
Facilitator: Dr. Marcus Vance (OpenDev Foundation)

## Core Architectural Modules
1. **Stateless Protocols**: Keep server instances interchangeable. Move session storage to distributed key-value stores.
2. **Bandwidth Economy**: Minimize payload sizes. Gzip compression, ETags for client cache revalidation, and pagination on all collection endpoints.
3. **Resilient Retry Policy**:
   - Use exponential backoff with jitter for transient 503 errors.
   - Attach idempotency keys (UUIDv4) to all mutating POST/PUT requests to prevent duplicate transactions.

## Recommended Tooling for Low-Bandwidth Workstations
- SQLite for local prototype storage
- Docker multi-stage builds with Alpine base images (< 15MB footprints)
- Git shallow clones (\`git clone --depth=1\`) to conserve cellular data quota.`,
      checklist: [
        'Review Session 1 slide deck and CLI cheat sheet',
        'Configure local Git signing key and GitHub repo structure',
        'Implement idempotency middleware in Express/Node.js',
        'Run test suite locally before network dispatch'
      ]
    }
  },
  {
    id: 'exc-02',
    title: 'Agritech Data Systems & Remote Sensing for Smallholders',
    theme: 'Green Tech & Agritech',
    skillLevel: 'Beginner',
    format: 'Virtual Bootcamp',
    startDate: '2026-11-20',
    endDate: '2026-12-18',
    scheduleSummary: 'Mondays & Wednesdays, 14:00–15:30 GMT',
    facilitatorId: 'usr-mentor-01',
    facilitatorName: 'Dr. Marcus Vance',
    facilitatorTitle: 'Principal Cloud Architect',
    facilitatorOrg: 'OpenDev Foundation & GreenGrid Agro',
    capacityMax: 50,
    enrolledCount: 50,
    status: 'open',
    summary: 'Learn how satellite vegetation indices (NDVI) and low-cost soil moisture telemetry can empower smallholder farming cooperatives to adapt to climate unpredictability.',
    learningOutcomes: [
      'Parse open-access Sentinel-2 satellite imagery for vegetative stress indices',
      'Format and clean field telemetry datasets for moisture and thermal variations',
      'Build straightforward SMS/USSD alerts for farmers without smartphone access',
      'Synthesize geospatial observations into actionable cooperative reports'
    ],
    prerequisites: 'Foundational comfort with spreadsheets and curiosity about climate technology.',
    bannerImage: SEED_EXCHANGE_AGRITECH_IMAGE,
    assignmentTitle: 'Smallholder Crop Stress Early-Warning Dashboard',
    assignmentPrompt: 'Create a predictive moisture threshold alert using sample cooperative telemetry. Document your methodology and propose an SMS alert format for community farmers.',
    sessions: [
      {
        id: 'ses-02-1',
        title: 'Remote Sensing & Climate Resilience Principles',
        date: '2026-11-23',
        time: '14:00–15:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-agritech-w1',
        agenda: 'Spectral bands, NDVI calculation, and regional agriculture challenges.',
        isCompleted: false
      },
      {
        id: 'ses-02-2',
        title: 'Building Lightweight Farmer Alert Systems',
        date: '2026-11-30',
        time: '14:00–15:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-agritech-w2',
        agenda: 'SMS gateways, threshold triggers, and simple data visualization.',
        isCompleted: false
      }
    ],
    offlinePack: {
      title: 'YEP-Agritech-Sensors-Guide.md',
      fileSizeBytes: 182000,
      notesMarkdown: `# Agritech Data Systems & Remote Sensing Guide
Module 1: Soil Moisture & Thermal Threshold Calculations.
Formula for Normalized Difference Vegetation Index (NDVI):
NDVI = (NIR - RED) / (NIR + RED)
Values > 0.4 indicate dense healthy vegetation; values < 0.2 indicate crop moisture stress or bare ground.`,
      checklist: [
        'Calculate NDVI for 3 benchmark regional plots',
        'Formulate 140-character SMS alert template in plain language',
        'Export summary table as CSV for mentor review'
      ]
    }
  },
  {
    id: 'exc-03',
    title: 'Human-Centered UI/UX & Accessible Design Systems',
    theme: 'UI/UX & Creative Media',
    skillLevel: 'Beginner',
    format: 'Weekend Sprint',
    startDate: '2026-11-28',
    endDate: '2026-11-30',
    scheduleSummary: 'Friday–Sunday Intensive Sprint, 10:00–16:00 GMT',
    facilitatorId: 'usr-mentor-01',
    facilitatorName: 'Dr. Marcus Vance',
    facilitatorTitle: 'Interim Design Fellow',
    facilitatorOrg: 'Global Civic Tech Institute',
    capacityMax: 30,
    enrolledCount: 18,
    status: 'open',
    summary: 'Design intuitive, accessible digital experiences engineered for varied literacy levels, multi-lingual audiences, and mobile devices in low-bandwidth regions.',
    learningOutcomes: [
      'Conduct empathetic user interviews and extract contextual pain points',
      'Create high-contrast, WCAG AAA compliant component libraries in Figma',
      'Design graceful degradation states for slow 3G cellular network speeds',
      'Present design system rationales to cross-functional engineering teams'
    ],
    prerequisites: 'No prior design tool experience required; open to all interested participants.',
    bannerImage: SEED_HERO_IMAGE,
    assignmentTitle: 'Civic Health Access Mobile Flow & Style Token Library',
    assignmentPrompt: 'Design a 4-screen mobile workflow for community clinic appointments with offline fallback confirmation cards and accessibility annotations.',
    sessions: [
      {
        id: 'ses-03-1',
        title: 'Accessibility Audits & Low-Resource UX Constraints',
        date: '2026-11-28',
        time: '10:00–12:30 GMT',
        durationMinutes: 150,
        meetingLink: 'https://meet.jit.si/yep-uiux-sprint',
        agenda: 'Color contrast ratios, tap targets, screen reader semantic structure, and network latency friction.',
        isCompleted: false
      }
    ],
    offlinePack: {
      title: 'YEP-Accessible-UX-CheatSheet.md',
      fileSizeBytes: 120000,
      notesMarkdown: `# Human-Centered Accessibility Checklist
- Touch targets must be at least 48x48px on mobile devices.
- Contrast ratio must exceed 4.5:1 for body copy and 3:1 for large headers.
- Never rely on color alone to convey error or confirmation states.`,
      checklist: [
        'Run contrast checker on primary and secondary action buttons',
        'Verify keyboard tab navigation order',
        'Create low-bandwidth wireframe sketches'
      ]
    }
  },
  {
    id: 'exc-04',
    title: 'Practical AI & Data Pipelines with Python',
    theme: 'AI & Data Analytics',
    skillLevel: 'Intermediate',
    format: '4-Week Cohort',
    startDate: '2026-12-01',
    endDate: '2026-12-28',
    scheduleSummary: 'Tuesdays & Thursdays, 16:00–17:30 GMT',
    facilitatorId: 'usr-mentor-01',
    facilitatorName: 'Dr. Marcus Vance',
    facilitatorTitle: 'Principal Cloud Architect',
    facilitatorOrg: 'OpenDev Foundation',
    capacityMax: 45,
    enrolledCount: 42,
    status: 'open',
    summary: 'Build practical ETL pipelines, tabular forecasting models, and lightweight LLM prompt engineering chains for real-world enterprise operations.',
    learningOutcomes: [
      'Clean and normalize unstructured CSV and JSON data streams using Pandas',
      'Train lightweight scikit-learn models for customer retention forecasting',
      'Integrate structured LLM API calls with schema validation and error fallback',
      'Document model limitations and fairness metrics across demographic cohorts'
    ],
    prerequisites: 'Basic Python syntax and elementary algebraic equations.',
    bannerImage: SEED_EXCHANGE_CLOUD_IMAGE,
    assignmentTitle: 'Automated Micro-Business Revenue Forecasting Pipeline',
    assignmentPrompt: 'Build a Python script that ingests sales receipts, handles missing data points, and outputs a 30-day forecast with confidence intervals and a clean summary report.',
    sessions: [
      {
        id: 'ses-04-1',
        title: 'Data Ingestion & Cleaning Strategies',
        date: '2026-12-03',
        time: '16:00–17:30 GMT',
        durationMinutes: 90,
        meetingLink: 'https://meet.jit.si/yep-data-ai-w1',
        agenda: 'Handling missing values, outlier detection, and reproducible notebooks.',
        isCompleted: false
      }
    ],
    offlinePack: {
      title: 'YEP-Python-Data-Handbook.md',
      fileSizeBytes: 310000,
      notesMarkdown: `# Practical Data Pipelines Handbook
Core principles for building deterministic data transformations and handling null values gracefully.`,
      checklist: [
        'Clone data starter repository',
        'Run sample unit tests locally',
        'Verify reproducible virtual environment setup'
      ]
    }
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-01',
    participantId: 'usr-part-01',
    participantName: 'Amara Okafor',
    exchangeId: 'exc-01',
    enrolledAt: '2026-11-01T10:00:00Z',
    status: 'active',
    progressPercentage: 65
  },
  {
    id: 'enr-02',
    participantId: 'usr-part-01',
    participantName: 'Amara Okafor',
    exchangeId: 'exc-03',
    enrolledAt: '2026-11-05T14:30:00Z',
    status: 'active',
    progressPercentage: 20
  },
  {
    id: 'enr-03',
    participantId: 'usr-part-02',
    participantName: 'Kofi Mensah',
    exchangeId: 'exc-02',
    enrolledAt: '2026-11-02T11:00:00Z',
    status: 'active',
    progressPercentage: 80
  }
];

export const INITIAL_SUBMISSIONS: ProjectSubmission[] = [
  {
    id: 'sub-01',
    exchangeId: 'exc-01',
    exchangeTitle: 'Cloud-Native Web Architecture & Microservices',
    participantId: 'usr-part-01',
    participantName: 'Amara Okafor',
    participantEmail: 'amara.okafor@outlook.com',
    participantRegion: 'West Africa (Lagos, Nigeria)',
    title: 'Offline-First Logistics Inventory Service with Local SQLite Cache',
    description: 'Developed an asynchronous microservice using Node.js/Express that caches parcel statuses locally in IndexedDB/SQLite during cellular dropouts and replays mutations with monotonic UUID tokens when connectivity restores.',
    repositoryLink: 'https://github.com/amara-okafor/resilient-parcel-service',
    demoOrArtifactLink: 'https://parcel-sync-demo.dev',
    keyTakeaways: 'Learned the nuances between pessimistic locking vs optimistic concurrency control, and why idempotency keys prevent catastrophic double-billing during mobile packet loss.',
    submittedAt: '2026-11-08T15:20:00Z',
    syncStatus: 'synced',
    status: 'graded',
    grade: {
      rubricScores: {
        technicalExecution: 5,
        problemSolving: 5,
        practicalImpact: 4,
        presentationClarity: 5
      },
      averageScore: 4.75,
      qualitativeFeedback: 'Exceptional work, Amara! Your idempotency key middleware handles duplicate POST requests seamlessly. The architectural documentation in the README includes benchmark latency charts that show deep mastery of real-world infrastructure constraints.',
      mentorId: 'usr-mentor-01',
      mentorName: 'Dr. Marcus Vance',
      reviewedAt: '2026-11-09T18:00:00Z'
    }
  },
  {
    id: 'sub-02',
    exchangeId: 'exc-02',
    exchangeTitle: 'Agritech Data Systems & Remote Sensing for Smallholders',
    participantId: 'usr-part-02',
    participantName: 'Kofi Mensah',
    participantEmail: 'kofi.mensah@ghanalabs.tech',
    participantRegion: 'West Africa (Accra, Ghana)',
    title: 'Low-Bandwidth Soil Moisture Early-Warning & SMS Gateway',
    description: 'Aggregated 12 weeks of sensor telemetry from 4 cassava farming cooperatives in the Volta Region. Programmed an automated rule engine that triggers twilio/USSD alerts whenever root moisture drops below 22% for 48 consecutive hours.',
    repositoryLink: 'https://github.com/kofi-mensah/cassava-telemetry-alerts',
    demoOrArtifactLink: 'https://volta-soil-dashboard.gh',
    keyTakeaways: 'Balancing sensor sleep intervals to prolong solar battery life while maintaining enough temporal granularity for meaningful wilt prediction.',
    submittedAt: '2026-11-10T12:00:00Z',
    syncStatus: 'synced',
    status: 'under_review'
  },
  {
    id: 'sub-03',
    exchangeId: 'exc-01',
    exchangeTitle: 'Cloud-Native Web Architecture & Microservices',
    participantId: 'usr-part-03',
    participantName: 'Fatima Al-Mansoor',
    participantEmail: 'fatima.almansoor@cairodesign.org',
    participantRegion: 'North Africa (Cairo, Egypt)',
    title: 'Containerized Edge Reverse Proxy with Dynamic Brotli Compression',
    description: 'Configured an Envoy/Nginx proxy pipeline that compresses JSON payloads up to 82% over 2G connections, reducing average data transfer costs for participants on metered data plans.',
    repositoryLink: 'https://github.com/fatima-ux/lowband-edge-proxy',
    demoOrArtifactLink: 'https://edge-compressor.cairo.dev',
    keyTakeaways: 'Observed tangible mobile CPU trade-offs when compressing at max levels vs dynamic compression levels.',
    submittedAt: '2026-11-11T08:30:00Z',
    syncStatus: 'synced',
    status: 'submitted'
  }
];

export const INITIAL_OPPORTUNITIES: PartnerOpportunity[] = [
  {
    id: 'opp-01',
    partnerId: 'usr-partner-01',
    partnerName: 'AfriTech Horizons & Global Labs',
    partnerType: 'Tech Enterprise & Accelerator',
    partnerLogo: '🏢',
    title: 'Junior Cloud Infrastructure Associate (Remote Apprenticeship)',
    type: 'Entry-Level Digital Work',
    locationType: 'Remote',
    region: 'Sub-Saharan Africa / Pan-African',
    stipendOrSalary: '$1,200 – $1,600 / month (Full-Time Paid)',
    closingDate: '2026-12-15',
    description: 'We are seeking two junior cloud associates to join our distributed infrastructure team. You will support Docker container maintenance, write CI/CD test automation, and help deploy resilient web services for pan-African fintech and logistics partners.',
    requirements: [
      'Completion of at least one YEP Virtual Exchange in Cloud, Web Dev, or Systems',
      'Demonstrated understanding of REST APIs, Git version control, and container fundamentals',
      'Strong written communication skills and commitment to team knowledge sharing',
      'Consent to share verified YEP project portfolio and mentor rubric evaluations'
    ],
    status: 'published',
    createdAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'opp-02',
    partnerId: 'usr-partner-01',
    partnerName: 'GreenGrid Agritech Cooperative',
    partnerType: 'Agritech Social Enterprise',
    partnerLogo: '🌱',
    title: 'Data & Telemetry Support Fellow (Hybrid)',
    type: 'Paid Internship',
    locationType: 'Hybrid',
    region: 'East & West Africa Regional Hubs',
    stipendOrSalary: '$950 / month + Hardware Allowance',
    closingDate: '2026-12-20',
    description: 'Work alongside field agronomists to clean sensor datasets, monitor SMS alert pipeline uptime, and generate monthly soil health summaries for 2,400+ smallholder farmers.',
    requirements: [
      'Demonstrated data literacy (Python, SQL, or advanced spreadsheet analysis)',
      'Interest in rural technology deployment and climate adaptation solutions',
      'Comfort with asynchronous collaboration and low-bandwidth tooling'
    ],
    status: 'published',
    createdAt: '2026-11-01T14:00:00Z'
  },
  {
    id: 'opp-03',
    partnerId: 'usr-partner-01',
    partnerName: 'CivicSphere Studio',
    partnerType: 'Digital Agency & Civic Tech',
    partnerLogo: '🎨',
    title: 'Accessible Interface Design Contractor (3-Month Gig)',
    type: 'Freelance Gig',
    locationType: 'Remote',
    region: 'Global / Emerging Markets',
    stipendOrSalary: '$35 / hour (Approx. 20 hrs/week)',
    closingDate: '2026-12-05',
    description: 'Audit and redesign three community health scheduling flows for low-bandwidth mobile browsers, implementing WCAG AAA color standards and high-efficiency typography tokens.',
    requirements: [
      'Figma design system portfolio featuring accessible mobile components',
      'Understanding of progressive web apps and offline design patterns',
      'Verified YEP UI/UX or Creative Media coursework'
    ],
    status: 'published',
    createdAt: '2026-11-03T09:15:00Z'
  }
];

export const INITIAL_EXPRESSIONS_OF_INTEREST: ExpressionOfInterest[] = [
  {
    id: 'eoi-01',
    opportunityId: 'opp-01',
    opportunityTitle: 'Junior Cloud Infrastructure Associate (Remote Apprenticeship)',
    partnerId: 'usr-partner-01',
    partnerName: 'AfriTech Horizons & Global Labs',
    participantId: 'usr-part-01',
    participantName: 'Amara Okafor',
    participantEmail: 'amara.okafor@outlook.com',
    participantRegion: 'West Africa (Lagos, Nigeria)',
    appliedAt: '2026-11-09T20:30:00Z',
    consentedToSharePortfolio: true,
    consentTimestamp: '2026-11-09T20:30:00Z',
    portfolioSnapshot: {
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git Workflow'],
      completedExchanges: ['Cloud-Native Web Architecture & Microservices'],
      verifiedSubmissions: [
        {
          exchangeTitle: 'Cloud-Native Web Architecture & Microservices',
          projectTitle: 'Offline-First Logistics Inventory Service with Local SQLite Cache',
          averageScore: 4.75,
          repoLink: 'https://github.com/amara-okafor/resilient-parcel-service'
        }
      ]
    },
    status: 'interview_invited',
    partnerNotes: 'Top candidate. Mentor rubric rating 4.75/5.0 with exceptional idempotency implementation. Ready for technical conversation.',
    messages: [
      {
        id: 'msg-01',
        senderRole: 'partner',
        senderName: 'Elena Rostova (AfriTech Horizons)',
        message: 'Hello Amara! We thoroughly reviewed your verified YEP project submission on offline-first parcel services. The architecture and code clarity are outstanding. We would love to invite you to an introductory technical interview next Tuesday at 14:00 GMT.',
        timestamp: '2026-11-10T11:20:00Z'
      },
      {
        id: 'msg-02',
        senderRole: 'participant',
        senderName: 'Amara Okafor',
        message: 'Thank you Elena! I am very excited for the opportunity and have confirmed Tuesday at 14:00 GMT on my calendar. I will review the cloud infrastructure specs in preparation.',
        timestamp: '2026-11-10T13:45:00Z'
      }
    ]
  },
  {
    id: 'eoi-02',
    opportunityId: 'opp-02',
    opportunityTitle: 'Data & Telemetry Support Fellow (Hybrid)',
    partnerId: 'usr-partner-01',
    partnerName: 'GreenGrid Agritech Cooperative',
    participantId: 'usr-part-02',
    participantName: 'Kofi Mensah',
    participantEmail: 'kofi.mensah@ghanalabs.tech',
    participantRegion: 'West Africa (Accra, Ghana)',
    appliedAt: '2026-11-10T15:00:00Z',
    consentedToSharePortfolio: true,
    consentTimestamp: '2026-11-10T15:00:00Z',
    portfolioSnapshot: {
      skills: ['Python', 'SQL', 'Data Visualization', 'Pandas'],
      completedExchanges: ['Agritech Data Systems & Remote Sensing for Smallholders'],
      verifiedSubmissions: [
        {
          exchangeTitle: 'Agritech Data Systems & Remote Sensing for Smallholders',
          projectTitle: 'Low-Bandwidth Soil Moisture Early-Warning & SMS Gateway',
          averageScore: 4.5,
          repoLink: 'https://github.com/kofi-mensah/cassava-telemetry-alerts'
        }
      ]
    },
    status: 'reviewing',
    messages: [
      {
        id: 'msg-03',
        senderRole: 'partner',
        senderName: 'Elena Rostova (GreenGrid Agritech)',
        message: 'Hello Kofi, thank you for sharing your soil moisture sensor project. We are reviewing your telemetry calculations with our Lead Agronomist and will update your status shortly.',
        timestamp: '2026-11-10T16:30:00Z'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-11-11T12:05:00Z',
    actorId: 'usr-admin-01',
    actorName: 'Sarah Chen',
    actorRole: 'admin',
    actionType: 'IMPACT_REPORT_EXPORTED',
    targetEntity: 'Aggregate-M&E-Q4-2026',
    details: 'Generated anonymized CSV extract of regional completion rates and skill mastery cohorts (stripped of PII).',
    ipHash: 'sha256:4a8b...9f01'
  },
  {
    id: 'aud-002',
    timestamp: '2026-11-10T15:00:00Z',
    actorId: 'usr-part-02',
    actorName: 'Kofi Mensah',
    actorRole: 'participant',
    actionType: 'CONSENT_GRANTED_EOI',
    targetEntity: 'opp-02 (Data & Telemetry Support Fellow)',
    details: 'User explicitly granted permission to share verified YEP project evidence and rubric grades with GreenGrid Agritech.',
    ipHash: 'sha256:7c1a...3e44'
  },
  {
    id: 'aud-003',
    timestamp: '2026-11-09T18:00:00Z',
    actorId: 'usr-mentor-01',
    actorName: 'Dr. Marcus Vance',
    actorRole: 'mentor',
    actionType: 'RUBRIC_EVALUATED',
    targetEntity: 'sub-01 (Amara Okafor)',
    details: 'Evaluated submission using standard 4-dimension rubric. Overall score: 4.75 / 5.00 with structured qualitative feedback.',
    ipHash: 'sha256:1d9b...88aa'
  },
  {
    id: 'aud-004',
    timestamp: '2026-11-08T15:20:00Z',
    actorId: 'usr-part-01',
    actorName: 'Amara Okafor',
    actorRole: 'participant',
    actionType: 'PROJECT_SUBMITTED',
    targetEntity: 'exc-01 (Cloud-Native Web Architecture)',
    details: 'Submitted practical capstone project: "Offline-First Logistics Inventory Service" with GitHub repo artifact.',
    ipHash: 'sha256:88bc...22ef'
  },
  {
    id: 'aud-005',
    timestamp: '2026-11-01T10:00:00Z',
    actorId: 'usr-part-01',
    actorName: 'Amara Okafor',
    actorRole: 'participant',
    actionType: 'EXCHANGE_ENROLLED',
    targetEntity: 'exc-01 (Cloud-Native Web Architecture)',
    details: 'Verified age (22 within 18-35 policy), capacity checked (Seat 36/40), and enrollment active.',
    ipHash: 'sha256:88bc...22ef'
  },
  {
    id: 'aud-006',
    timestamp: '2026-10-25T10:00:00Z',
    actorId: 'usr-partner-01',
    actorName: 'Elena Rostova',
    actorRole: 'partner',
    actionType: 'OPPORTUNITY_PUBLISHED',
    targetEntity: 'opp-01 (Junior Cloud Infrastructure Associate)',
    details: 'Published verified paid entry-level opportunity adhering to fair compensation criteria.',
    ipHash: 'sha256:55aa...67bc'
  }
];

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'ach-01',
    title: 'Cloud Systems Builder',
    description: 'Completed capstone project in Cloud-Native Architecture with a rubric score above 4.5/5.0.',
    category: 'Technical Milestone',
    earnedAt: '2026-11-09T18:00:00Z',
    iconName: 'Server'
  },
  {
    id: 'ach-02',
    title: 'Reliable Collaborator',
    description: 'Attended 100% of live virtual cohort sessions with active engagement.',
    category: 'Engagement',
    earnedAt: '2026-11-08T17:00:00Z',
    iconName: 'Users'
  },
  {
    id: 'ach-03',
    title: 'Low-Bandwidth Champion',
    description: 'Engineered code that successfully tested within strict 2G simulated network limits.',
    category: 'Innovation',
    earnedAt: '2026-11-09T18:00:00Z',
    iconName: 'WifiOff'
  },
  {
    id: 'ach-04',
    title: 'Opportunity Ready',
    description: 'Completed candidate portfolio and granted partner consent verification.',
    category: 'Career Readiness',
    earnedAt: '2026-11-09T20:30:00Z',
    iconName: 'Briefcase'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    recipientId: 'usr-part-01',
    category: 'mentor_feedback',
    title: 'Capstone Rubric Evaluated (4.75 / 5.00)',
    message: 'Dr. Marcus Vance graded "Offline-First Logistics Inventory Service" with feedback across all 4 rubric pillars.',
    createdAt: '2026-11-09T18:05:00Z',
    readByUserIds: [],
    targetTab: 'dashboard'
  },
  {
    id: 'notif-02',
    recipientId: 'usr-part-01',
    category: 'submission',
    title: 'Exchange Capstone Verified & Synced',
    message: 'Your submission for Cloud-Native Web Architecture was synced cleanly to the mentor review queue.',
    createdAt: '2026-11-08T15:25:00Z',
    readByUserIds: ['usr-part-01'],
    targetTab: 'dashboard'
  },
  {
    id: 'notif-03',
    recipientRole: 'participant',
    category: 'opportunity',
    title: 'New Partner Opening: Junior Cloud Infrastructure Associate',
    message: 'AfriTech Horizons & Global Labs published a remote paid entry-level role matching React & Cloud skills.',
    createdAt: '2026-11-10T09:00:00Z',
    readByUserIds: [],
    targetTab: 'opportunities'
  },
  {
    id: 'notif-04',
    recipientId: 'usr-mentor-01',
    category: 'submission',
    title: 'Pending Capstone Review: Kofi Mensah',
    message: 'New practical capstone submission in AI & Data Analytics for Low-Bandwidth Environments awaits your 1–5 rubric review.',
    createdAt: '2026-11-11T10:15:00Z',
    readByUserIds: [],
    targetTab: 'mentor'
  },
  {
    id: 'notif-05',
    recipientId: 'usr-mentor-01',
    category: 'mentor_feedback',
    title: 'Rubric Evaluation Logged for Amara Okafor',
    message: 'Your 4.75 / 5.00 evaluation and feedback were published to Amara Okafor’s verified portfolio.',
    createdAt: '2026-11-09T18:10:00Z',
    readByUserIds: ['usr-mentor-01'],
    targetTab: 'mentor'
  },
  {
    id: 'notif-06',
    recipientId: 'usr-partner-01',
    category: 'opportunity',
    title: 'New Consented Expression of Interest',
    message: 'Amara Okafor expressed interest in Junior Cloud Infrastructure Associate and shared verified capstone scores.',
    createdAt: '2026-11-11T14:30:00Z',
    readByUserIds: [],
    targetTab: 'partner-manage'
  },
  {
    id: 'notif-07',
    recipientRole: 'admin',
    category: 'opportunity',
    title: 'Partner Opportunity Compliance Check',
    message: 'New partner openings and consented candidate expressions are logged in the immutable audit trail.',
    createdAt: '2026-11-11T15:00:00Z',
    readByUserIds: [],
    targetTab: 'admin'
  }
];

