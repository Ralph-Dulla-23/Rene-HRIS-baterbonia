export type FactorCategory = "IQ" | "EQ" | "CONDITIONS";

export type FactorConfidence = "high" | "medium" | "low" | "insufficient";

export interface CompensableFactorEvidence {
  sourceField: string;
  text: string;
}

export interface FactorDefinition {
  key: string;
  number: number;
  category: FactorCategory;
  categoryLabel: string;
  label: string;
  shortDescription: string;
  aiDefinition: string;
  evidenceRequired: string[];
  relevantJobFields: string[];
  missingContextGuidance: string[];
  defaultPoints: number;
  structuredPrompts?: {
    id: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export const COMPENSABLE_FACTORS_CONFIG: FactorDefinition[] = [
  {
    key: "education",
    number: 1,
    category: "IQ",
    categoryLabel: "IQ REQUIREMENT FACTORS",
    label: "Education",
    shortDescription: "Minimum formal educational preparation genuinely required to perform the responsibilities of the position.",
    aiDefinition: `Education represents the minimum formal educational preparation genuinely required to perform the responsibilities of the position. It must describe the position requirement, not the education of the current employee occupying the position.
Analyze: Minimum educational attainment, required degree, relevant field of study, technical or vocational training, professional certifications, licenses, specialized academic preparation, whether education may be substituted by experience, and whether education is mandatory or preferred.
Rule: Do not automatically treat a preferred qualification as mandatory. Distinguish "Bachelor's degree preferred" from "Bachelor's degree required".`,
    evidenceRequired: [
      "Minimum educational attainment / degree level required",
      "Field of study or technical specialization",
      "Mandatory certifications or professional licenses",
      "Explicit statement on whether experience can substitute for degree"
    ],
    relevantJobFields: ["qualifications", "educationRequirements", "roleTitle", "positionOverview"],
    missingContextGuidance: [
      "Is a specific academic degree mandatory or preferred?",
      "Can relevant professional experience substitute for formal educational degrees?",
      "Are there mandatory professional licenses or industry certifications?"
    ],
    defaultPoints: 10
  },
  {
    key: "workExperience",
    number: 2,
    category: "IQ",
    categoryLabel: "IQ REQUIREMENT FACTORS",
    label: "Work Experience",
    shortDescription: "Minimum relevant practical experience required before an individual can reasonably perform the position.",
    aiDefinition: `Work Experience represents the minimum relevant practical experience required before an individual can reasonably perform the position.
Analyze: Minimum number of years, type of experience, industry experience, functional experience, technical experience, management experience, supervisory experience, progressive experience, and specialized professional experience.
Rule: Evaluate BOTH duration (years) and complexity/relevance. 2 years of general administrative experience must NOT be treated as equivalent to 5 years of specialized operational or technical experience.`,
    evidenceRequired: [
      "Minimum years of prior relevant work experience",
      "Industry or functional domain specialization",
      "Required technical, hands-on, or operational background",
      "Prior leadership or supervisory experience prerequisites"
    ],
    relevantJobFields: ["qualifications", "experienceRequirements", "responsibilities", "supervisoryLevel", "roleTitle"],
    missingContextGuidance: [
      "What is the minimum number of years of relevant experience required?",
      "What specific industry or domain background is required vs preferred?",
      "Does the role require specialized technical or leadership experience?"
    ],
    defaultPoints: 15
  },
  {
    key: "desiredCompetencies",
    number: 3,
    category: "IQ",
    categoryLabel: "IQ REQUIREMENT FACTORS",
    label: "Desired Competencies",
    shortDescription: "Technical, professional, behavioral, analytical, interpersonal, and specialized capabilities required.",
    aiDefinition: `Desired Competencies represents the technical, professional, behavioral, analytical, interpersonal, and specialized capabilities required to perform the position successfully.
Analyze: Technical skills, software/system knowledge, analytical skills, communication competency, domain knowledge, professional expertise, leadership skills, problem-solving skills, business knowledge, and required proficiency level.
Rule: Evaluate both breadth and depth. A large number of basic skills must not automatically result in a higher assessment than a smaller set of advanced specialized competencies.`,
    evidenceRequired: [
      "Core technical systems, software, and tools mastery",
      "Communication, analytical, and diagnostic capabilities",
      "Domain-specific operational knowledge and methodologies",
      "Proficiency benchmarks (e.g. Basic, Proficient, Advanced)"
    ],
    relevantJobFields: ["competencies", "qualifications", "skills", "responsibilities", "positionOverview"],
    missingContextGuidance: [
      "What specific software, CRM, or technical tools are mandatory?",
      "What language proficiency level or communication benchmark is required?",
      "Are there specialized analytical or technical standards expected?"
    ],
    defaultPoints: 15
  },
  {
    key: "workComplexityBudgetAuthority",
    number: 4,
    category: "IQ",
    categoryLabel: "IQ REQUIREMENT FACTORS",
    label: "Work Complexity / Budget Authority",
    shortDescription: "Complexity, ambiguity, organizational scope, and financial/budgetary responsibility inherent in the position.",
    aiDefinition: `This factor represents the complexity, ambiguity, organizational scope, and financial responsibility inherent in the position.
There are two dimensions:
A. Work Complexity: Variety of responsibilities, difficulty of work, predictability, ambiguity, number of processes/systems, strategic vs operational scope, cross-functional dependencies, analytical requirements, and impact of errors.
B. Budget Authority: Budget ownership, spending authority, financial approval limits, procurement, revenue responsibility, cost-management, and financial decision-making.
Rule: Do not estimate a budget amount. If no budget information exists, report that financial-authority context is missing. Do not rate complexity merely by counting responsibilities; analyze their nature and difficulty.`,
    evidenceRequired: [
      "Variety, ambiguity, and technical difficulty of deliverables",
      "Cross-functional operational scope and process interdependencies",
      "Direct or indirect financial, budget, or spending authorization limits",
      "Organizational impact of process or operational errors"
    ],
    relevantJobFields: ["responsibilities", "positionOverview", "account", "supervisoryLevel", "remarks"],
    missingContextGuidance: [
      "Does this position manage, approve, or own an operational budget or spending limit?",
      "What level of financial approval or procurement authority does the role possess?",
      "What is the operational scope and complexity of cross-functional workflows?"
    ],
    defaultPoints: 10,
    structuredPrompts: [
      {
        id: "budgetAuthority",
        label: "Financial / Budget Authority Level",
        options: [
          { value: "none", label: "No Direct Budget / Spending Authority" },
          { value: "recommends", label: "Recommends Budget Allocations / Cost Tracking" },
          { value: "approves_minor", label: "Direct Approval Authority (Up to $10,000 / PHP 500,000)" },
          { value: "owns_department", label: "Full Department / Account P&L Budget Ownership" }
        ]
      }
    ]
  },
  {
    key: "independentJudgmentProblemSolving",
    number: 5,
    category: "IQ",
    categoryLabel: "IQ REQUIREMENT FACTORS",
    label: "Independent Judgment / Decision Making / Problem Solving",
    shortDescription: "Independent judgment required to identify problems, evaluate alternatives, make decisions, and determine solutions.",
    aiDefinition: `This factor represents the amount of independent judgment required to identify problems, evaluate alternatives, make decisions, and determine solutions.
Analyze: Routine vs non-routine decisions, availability of standard procedures (SOPs), degree of direct supervision, approval requirements, escalation paths, authority to select solutions or modify processes, decision impact, problem complexity, and consequences of incorrect decisions.
Model: Basic (follows defined procedures) -> Limited discretion (chooses among established alternatives) -> Professional judgment (analyzes unfamiliar situations) -> High independent judgment (makes significant operational decisions) -> Strategic authority (establishes policies/direction).`,
    evidenceRequired: [
      "Degree of autonomy in day-to-day execution and problem diagnosis",
      "Reliance on established SOPs versus creating novel solutions",
      "Escalation thresholds and supervisor sign-off requirements",
      "Impact of independent decisions on customer, team, or company"
    ],
    relevantJobFields: ["responsibilities", "positionOverview", "reportsTo", "supervisoryLevel"],
    missingContextGuidance: [
      "To what extent does the position follow standard procedures vs formulate independent solutions?",
      "What level of supervision or escalation approval is required for routine and edge cases?",
      "What are the consequences or business impacts of erroneous decisions?"
    ],
    defaultPoints: 15
  },
  {
    key: "leadershipSupervisory",
    number: 6,
    category: "EQ",
    categoryLabel: "EQ REQUIREMENT FACTORS",
    label: "Leadership / Supervisory Responsibilities",
    shortDescription: "Formal accountability for leading people, teams, functions, or organizational outcomes.",
    aiDefinition: `This factor represents formal accountability for leading people, teams, functions, or organizational outcomes.
The existing Supervisory field is part of this factor, but Supervisory = Yes is not sufficient by itself.
Analyze: Direct reports, indirect reports, employee levels supervised, hiring responsibility, performance evaluation authority, coaching responsibilities, disciplinary authority, scheduling responsibility, promotion/termination recommendations, and functional leadership.
Rule: Do not classify informal mentoring or onboarding assistance as formal supervision. Informal mentoring does NOT automatically mean supervisory accountability.`,
    evidenceRequired: [
      "Number and job levels of direct/indirect reports",
      "Formal authority for performance reviews, KPI evaluations, and disciplinary actions",
      "Hiring, promotion, and termination recommendation authority",
      "Workforce scheduling, shift management, and floor governance"
    ],
    relevantJobFields: ["supervisoryLevel", "reportsTo", "responsibilities", "positionOverview"],
    missingContextGuidance: [
      "How many direct or indirect reports does this position formally oversee?",
      "Does the role have formal authority for performance appraisals, coaching, or disciplinary measures?",
      "Is leadership limited to informal peer guidance or formal management?"
    ],
    defaultPoints: 10,
    structuredPrompts: [
      {
        id: "supervisoryScope",
        label: "Formal Supervisory Scope",
        options: [
          { value: "none", label: "Individual Contributor (No Direct Reports / Informal Peer Guidance)" },
          { value: "team_lead", label: "Team Lead (5 - 20 Operational Staff / Floor Governance)" },
          { value: "supervisor", label: "Supervisor / Ops Manager (Direct Reports & Performance Appraisals)" },
          { value: "director", label: "Senior Leadership (Manages Multiple Teams / Managers Report In)" }
        ]
      }
    ]
  },
  {
    key: "personalOrganizationalContacts",
    number: 7,
    category: "EQ",
    categoryLabel: "EQ REQUIREMENT FACTORS",
    label: "Personal / Organizational Contacts",
    shortDescription: "Complexity and significance of communication and interaction required with internal and external stakeholders.",
    aiDefinition: `This factor represents the complexity and significance of communication and interaction required by the position with internal and external stakeholders.
Analyze: Internal departments, employees, managers, executives, vendors, candidates, government agencies, business partners, clients; frequency of interaction, purpose of interaction, confidentiality, sensitivity, negotiation, influence, and organizational level of contacts.
Rule: Do not base the assessment only on how frequently the employee communicates. Consider who they communicate with, why, authority required, whether negotiation/influence is required, and business impact.`,
    evidenceRequired: [
      "Key internal stakeholders (peers, cross-functional teams, executives)",
      "Key external stakeholders (clients, vendors, regulatory agencies)",
      "Nature of interaction (routine info exchange vs high-stakes negotiation/influence)",
      "Confidentiality and sensitivity of shared information"
    ],
    relevantJobFields: ["responsibilities", "reportsTo", "account", "positionOverview"],
    missingContextGuidance: [
      "What internal departments or executive levels does the role regularly interface with?",
      "What external parties (vendors, clients, auditors) are contacted and for what purpose?",
      "Does the communication involve negotiation, persuasion, or sensitive data?"
    ],
    defaultPoints: 10
  },
  {
    key: "customerServiceRelationships",
    number: 8,
    category: "EQ",
    categoryLabel: "EQ REQUIREMENT FACTORS",
    label: "Customer Service Relationships",
    shortDescription: "Responsibility for establishing, maintaining, supporting, or recovering relationships with internal or external customers.",
    aiDefinition: `This factor represents the responsibility for establishing, maintaining, supporting, or recovering relationships with internal or external customers.
A customer is not limited to an external consumer (includes external clients, end customers, internal employees, other departments, candidates, business partners).
Analyze: Customer type, frequency, nature of service, complaint handling, escalation responsibility, relationship ownership, client retention, service recovery, negotiation, business impact, and company representation.
Rule: Evaluate complexity and accountability, not simply contact volume. "Handles routine inquiries" is materially different from "Owns executive client relationships and resolves contractual escalations".`,
    evidenceRequired: [
      "Target customer group (external consumers, corporate enterprise clients, internal staff)",
      "Accountability for service recovery and complex complaint resolution",
      "Relationship ownership, SLA guarantees, and client retention impact",
      "Representative role of the company brand and client satisfaction"
    ],
    relevantJobFields: ["account", "responsibilities", "positionOverview", "qualifications"],
    missingContextGuidance: [
      "Who are the primary customers (external enterprise clients, end-users, or internal departments)?",
      "What is the level of accountability for customer retention, escalation, and service recovery?",
      "Does the position handle routine queries or high-impact account management?"
    ],
    defaultPoints: 10
  },
  {
    key: "workingEnvironmentalConditions",
    number: 9,
    category: "CONDITIONS",
    categoryLabel: "JOB CONDITIONS",
    label: "Working / Environmental Conditions",
    shortDescription: "Physical, environmental, scheduling, and operational conditions routinely inherent to the position.",
    aiDefinition: `This factor represents the physical, environmental, scheduling, and operational conditions routinely inherent to the position.
Analyze: Office work, remote/hybrid, field work, night shifts, rotating shifts, weekend/holiday work, travel, physical demands (standing, lifting), noise, temperature, hazard exposure, high-pressure operational environment, repetitive tasks, screen exposure, emergency on-call responsibility.
Rule: Do not use exceptional or temporary circumstances. Only consider conditions that are normally and routinely expected as part of the position.`,
    evidenceRequired: [
      "Work location model (On-site, Hybrid, Remote, Field)",
      "Shift requirements (Standard day, Graveyard/Night shift, Rotational, Weekends)",
      "Operational intensity (high-volume queue, strict time-adherence, on-call)",
      "Physical, ergonomic, or environmental exposure requirements"
    ],
    relevantJobFields: ["qualifications", "responsibilities", "positionOverview", "remarks"],
    missingContextGuidance: [
      "What is the expected work schedule (e.g. graveyard shift, rotating schedule, weekend work)?",
      "What is the work setup (on-site facility, hybrid, or remote)?",
      "Are there specific physical demands, travel requirements, or high-pressure queue environments?"
    ],
    defaultPoints: 5,
    structuredPrompts: [
      {
        id: "scheduleModel",
        label: "Routine Shift & Schedule Model",
        options: [
          { value: "standard_day", label: "Standard Business Hours (Day Shift, Monday - Friday)" },
          { value: "rotational_shifts", label: "Rotational Shifts (Includes Weekends & Holidays)" },
          { value: "night_graveyard", label: "Permanent Graveyard / Night Shift Operations" },
          { value: "on_call_travel", label: "24/7 On-Call Support / Frequent Travel Required" }
        ]
      }
    ]
  }
];

export const FACTOR_CATEGORIES: { id: FactorCategory; label: string; numberRange: string }[] = [
  { id: "IQ", label: "FACTORS REFERRING TO IQ REQUIREMENT FOR THE JOB", numberRange: "Factors 1 to 5" },
  { id: "EQ", label: "FACTORS REFERRING TO EQ REQUIREMENT FOR THE JOB", numberRange: "Factors 6 to 8" },
  { id: "CONDITIONS", label: "JOB CONDITIONS", numberRange: "Factor 9" }
];
