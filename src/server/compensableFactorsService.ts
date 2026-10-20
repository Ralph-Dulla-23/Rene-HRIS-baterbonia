import { GoogleGenAI, Type } from "@google/genai";
import { COMPENSABLE_FACTORS_CONFIG } from "../data/compensableFactorsConfig.ts";
import type {
  NormalizedJobDescriptionContext,
  CompensableFactorAssessmentItem,
  CompensableFactorAnalysisResponse
} from "../types/compensableFactors.ts";

// System prompt strictly adhering to compensable factor guidelines
const SYSTEM_INSTRUCTION = `You are an expert HR Job Evaluation Assistant specializing in compensable factor analysis for enterprise job descriptions.
Your task is to analyze a Job Description using 9 defined compensable factors.

CRITICAL RULES:
1. YOU ARE EVALUATING THE POSITION, NOT THE CURRENT EMPLOYEE OCCUPYING IT.
2. USE ONLY INFORMATION EXPLICITLY CONTAINED IN THE SUPPLIED JOB DESCRIPTION CONTEXT.
3. NEVER INVENT OR FABRICATE MISSING FACTS. Do NOT invent:
   - Specific years of experience if unstated
   - Mandatory educational degrees if unstated
   - Number of direct/indirect reports if unstated
   - Budget amounts or financial signing authority limits if unstated
   - Specific client responsibilities or shift schedules if unstated
   - Physical or environmental hazards if unstated
4. DO NOT USE THE JOB TITLE AS SOLE EVIDENCE. A title like "Manager" or "Lead" alone does NOT prove supervisory reports or budget authority without corroborating text in responsibilities/qualifications.
5. DISTINGUISH REQUIRED VS PREFERRED QUALIFICATIONS. (e.g. "Bachelor's preferred" != "Bachelor's required").
6. MISSING CONTEXT HANDLING: If context is missing for a factor, explicitly state what is missing in the "missingContext" array and set "requiresUserInput" to true. Do not guess.
7. CONFIDENCE RATINGS:
   - "high": Multiple explicit JD statements directly support the assessment.
   - "medium": Relevant evidence exists but some important context is missing.
   - "low": Evidence is indirect or sparse.
   - "insufficient": Key context is missing; cannot make a reliable assessment without user input.

NINE COMPENSABLE FACTORS TO EVALUATE:
1. Education (IQ): Minimum formal educational preparation genuinely required. Mandatory vs preferred.
2. Work Experience (IQ): Minimum relevant practical experience. Consider both duration and complexity/relevance.
3. Desired Competencies (IQ): Technical, professional, behavioral, analytical, and interpersonal capabilities. Consider breadth and depth.
4. Work Complexity / Budget Authority (IQ): Task ambiguity/difficulty and financial/spending authority. If no budget info, report financial context missing.
5. Independent Judgment / Decision Making / Problem Solving (IQ): Degree of independent problem solving, SOP availability, escalation thresholds.
6. Leadership / Supervisory Responsibilities (EQ): Formal accountability for leading people/teams. Do NOT treat informal peer mentoring as formal supervision.
7. Personal / Organizational Contacts (EQ): Complexity, purpose, and sensitivity of communication with internal/external stakeholders.
8. Customer Service Relationships (EQ): Responsibility for maintaining/supporting internal or external customers, escalation handling, relationship ownership.
9. Working / Environmental Conditions (CONDITIONS): Routine physical, shift, and operational conditions inherent to the role (e.g. graveyard shifts, rotational schedules).`;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export async function analyzeCompensableFactorsWithGemini(
  context: NormalizedJobDescriptionContext
): Promise<CompensableFactorAnalysisResponse> {
  const ai = getAiClient();

  if (!ai) {
    console.warn("GEMINI_API_KEY is not set. Generating deterministic context analysis fallback.");
    return generateDeterministicFallbackAnalysis(context);
  }

  const promptContent = `Please evaluate the following Job Description against all 9 compensable factors:

JOB DESCRIPTION CONTEXT:
- Role Title: ${context.roleTitle || "Not specified"}
- Department: ${context.department || "Not specified"}
- Account / Client: ${context.account || "Not specified"}
- Reports To: ${context.reportsTo || "Not specified"}
- Supervisory Level / Scope: ${context.supervisoryLevel || "Not specified"} (Supervisory Flag: ${context.supervisory ? "Yes" : "No"})
- Position Overview: ${context.positionOverview || "Not specified"}
- Key Responsibilities:
${Array.isArray(context.responsibilities) && context.responsibilities.length > 0 ? context.responsibilities.map((r, i) => `  ${i + 1}. ${r}`).join("\n") : "  (No specific responsibilities listed)"}
- Qualifications & Requirements:
${context.qualifications || "Not specified"}
- Competencies & Skills:
${Array.isArray(context.competencies) ? context.competencies.join(", ") : context.competencies || "Not specified"}
- Target Personality: ${context.targetPersonality || "Not specified"}
- Working Conditions / Shifts: ${context.workingConditions || "Not specified"}
- Additional Remarks / Context: ${context.remarks || "None provided"}
${
  context.additionalContext && Object.keys(context.additionalContext).length > 0
    ? `\nADDITIONAL USER-SUPPLIED CONTEXT:\n${Object.entries(context.additionalContext)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}`
    : ""
}

Analyze each of the 9 compensable factors thoroughly, extract direct text excerpts as evidence, flag missing information, and return the structured evaluation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: {
              type: Type.STRING,
              description: "Executive summary of the compensable factor evaluation for this position.",
            },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: {
                    type: Type.STRING,
                    description: "Unique factor key corresponding to the standard 9 factors (e.g. education, workExperience, desiredCompetencies, workComplexityBudgetAuthority, independentJudgmentProblemSolving, leadershipSupervisory, personalOrganizationalContacts, customerServiceRelationships, workingEnvironmentalConditions)",
                  },
                  factorNumber: {
                    type: Type.INTEGER,
                    description: "Factor sequence number from 1 to 9.",
                  },
                  factor: {
                    type: Type.STRING,
                    description: "Official name of the factor.",
                  },
                  category: {
                    type: Type.STRING,
                    description: "Factor category: IQ, EQ, or CONDITIONS.",
                  },
                  assessment: {
                    type: Type.STRING,
                    description: "Concise qualitative assessment for this factor (e.g., 'Moderate', 'High', 'Standard Operational Level', or null if insufficient).",
                  },
                  confidence: {
                    type: Type.STRING,
                    description: "Confidence level based on available evidence completeness: high, medium, low, or insufficient.",
                  },
                  summary: {
                    type: Type.STRING,
                    description: "Detailed explanatory rationale describing what the evidence indicates for this position.",
                  },
                  evidence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sourceField: {
                          type: Type.STRING,
                          description: "Source field name where evidence was found (e.g. qualifications, responsibilities, positionOverview, supervisoryLevel).",
                        },
                        text: {
                          type: Type.STRING,
                          description: "Verbatim or accurate quote from the JD providing factual evidence.",
                        },
                      },
                      required: ["sourceField", "text"],
                    },
                    description: "List of supporting evidence items extracted directly from the JD.",
                  },
                  missingContext: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description: "Specific context or questions regarding information that is missing from the JD for this factor.",
                  },
                  requiresUserInput: {
                    type: Type.BOOLEAN,
                    description: "True if key context is missing and the user should review or supply additional details.",
                  },
                },
                required: [
                  "key",
                  "factorNumber",
                  "factor",
                  "category",
                  "confidence",
                  "summary",
                  "evidence",
                  "missingContext",
                  "requiresUserInput",
                ],
              },
            },
          },
          required: ["factors"],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const parsed = JSON.parse(rawText);
    const validatedFactors = validateAndEnrichFactors(parsed.factors, context);

    return {
      factors: validatedFactors,
      overallSummary: parsed.overallSummary || `Evaluated 9 compensable factors for ${context.roleTitle || "Position"}.`,
      analyzedAt: new Date().toISOString(),
      modelUsed: "gemini-2.5-flash",
    };
  } catch (error: any) {
    console.error("Error during Gemini Compensable Factor Analysis:", error);
    // Return high quality deterministic analysis to ensure continuous user flow without blocking
    const fallback = generateDeterministicFallbackAnalysis(context);
    fallback.overallSummary = `AI analysis fallback generated based on standard criteria for ${context.roleTitle || "Position"} (Error: ${error?.message || "Service unavailable"}).`;
    return fallback;
  }
}

function validateAndEnrichFactors(
  rawFactors: any[],
  context: NormalizedJobDescriptionContext
): CompensableFactorAssessmentItem[] {
  const result: CompensableFactorAssessmentItem[] = [];

  for (const config of COMPENSABLE_FACTORS_CONFIG) {
    const rawMatch = Array.isArray(rawFactors)
      ? rawFactors.find(
          (f: any) =>
            f?.key === config.key ||
            f?.factorNumber === config.number ||
            (typeof f?.factor === "string" && f.factor.toLowerCase().includes(config.label.toLowerCase()))
        )
      : null;

    if (rawMatch) {
      const validConfidence = ["high", "medium", "low", "insufficient"].includes(rawMatch.confidence)
        ? rawMatch.confidence
        : "medium";

      const validEvidence = Array.isArray(rawMatch.evidence)
        ? rawMatch.evidence.map((e: any) => ({
            sourceField: typeof e?.sourceField === "string" ? e.sourceField : "jobDescription",
            text: typeof e?.text === "string" ? e.text : String(e),
          }))
        : [];

      const validMissing = Array.isArray(rawMatch.missingContext)
        ? rawMatch.missingContext.filter((m: any) => typeof m === "string" && m.trim().length > 0)
        : [];

      result.push({
        key: config.key,
        factorNumber: config.number,
        factor: config.label,
        category: config.category,
        assessment: rawMatch.assessment || (validEvidence.length > 0 ? "Standard" : null),
        confidence: validConfidence,
        summary: rawMatch.summary || config.shortDescription,
        evidence: validEvidence,
        missingContext: validMissing.length > 0 ? validMissing : (validEvidence.length === 0 ? config.missingContextGuidance : []),
        requiresUserInput: Boolean(rawMatch.requiresUserInput || validEvidence.length === 0),
        criteria: rawMatch.summary || config.shortDescription,
        weightOrPoints: config.defaultPoints,
        source: "AI",
        reviewed: false,
      });
    } else {
      // Create fallback item from configuration
      result.push({
        key: config.key,
        factorNumber: config.number,
        factor: config.label,
        category: config.category,
        assessment: null,
        confidence: "insufficient",
        summary: `No explicit statements found in the current Job Description text for ${config.label}.`,
        evidence: [],
        missingContext: config.missingContextGuidance,
        requiresUserInput: true,
        criteria: config.shortDescription,
        weightOrPoints: config.defaultPoints,
        source: "AI",
        reviewed: false,
      });
    }
  }

  return result;
}

export function generateDeterministicFallbackAnalysis(
  context: NormalizedJobDescriptionContext
): CompensableFactorAnalysisResponse {
  const factors: CompensableFactorAssessmentItem[] = COMPENSABLE_FACTORS_CONFIG.map((config) => {
    const evidence: { sourceField: string; text: string }[] = [];
    const missing: string[] = [];
    let assessment: string | null = null;
    let confidence: "high" | "medium" | "low" | "insufficient" = "medium";
    let summary = "";

    const qualText = (context.qualifications || "").toLowerCase();
    const respText = (context.responsibilities || []).join(" ").toLowerCase();
    const overviewText = (context.positionOverview || "").toLowerCase();

    switch (config.key) {
      case "education": {
        if (qualText.includes("bachelor") || qualText.includes("degree") || qualText.includes("college")) {
          evidence.push({
            sourceField: "qualifications",
            text: context.qualifications.split("\n").find((l) => /degree|bachelor|college/i.test(l)) || "Educational degree mentioned in qualifications.",
          });
          assessment = "Moderate / Bachelor's Level";
          confidence = "high";
          summary = "The role specifies tertiary educational qualifications (Bachelor's degree or equivalent).";
        } else {
          missing.push("Is a specific academic degree mandatory or preferred?");
          confidence = "insufficient";
          summary = "No explicit formal educational requirement is specified in the qualifications.";
        }
        break;
      }
      case "workExperience": {
        const expMatch = context.qualifications.match(/(\d+\+?\s*years?|\d+-\d+\s*years?)/i);
        if (expMatch) {
          evidence.push({
            sourceField: "qualifications",
            text: context.qualifications.split("\n").find((l) => /year/i.test(l)) || expMatch[0],
          });
          assessment = "Standard Operational Experience";
          confidence = "high";
          summary = `The position requires prior relevant experience (${expMatch[0]}).`;
        } else {
          missing.push("Minimum years of relevant prior work experience is not specified.");
          confidence = "insufficient";
          summary = "No explicit duration or depth of work experience is stated.";
        }
        break;
      }
      case "desiredCompetencies": {
        const compList = Array.isArray(context.competencies)
          ? context.competencies
          : (context.competencies || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (compList.length > 0) {
          evidence.push({
            sourceField: "competencies",
            text: compList.join(", "),
          });
          assessment = "Proficient / Multi-competency";
          confidence = "high";
          summary = `The position specifies ${compList.length} distinct technical and operational competencies.`;
        } else {
          missing.push("Specific software, technical tools, and language proficiency benchmarks are needed.");
          confidence = "low";
          summary = "General competency profile provided; detailed proficiency criteria can be reviewed.";
        }
        break;
      }
      case "workComplexityBudgetAuthority": {
        if (context.responsibilities && context.responsibilities.length > 0) {
          evidence.push({
            sourceField: "responsibilities",
            text: context.responsibilities[0],
          });
        }
        missing.push("Does this position manage or approve an operational or departmental budget?");
        assessment = "Moderate Complexity / No Direct Budget";
        confidence = "medium";
        summary = "Role involves operational workflow execution; explicit financial/budget approval authority is unstated.";
        break;
      }
      case "independentJudgmentProblemSolving": {
        if (respText.includes("troubleshoot") || respText.includes("resolve") || respText.includes("diagnose")) {
          evidence.push({
            sourceField: "responsibilities",
            text: context.responsibilities.find((r) => /troubleshoot|resolve|diagnose|decision/i.test(r)) || context.responsibilities[0] || "Problem diagnosis responsibilities.",
          });
          assessment = "Autonomous Troubleshooting & SOP Execution";
          confidence = "high";
          summary = "Exercises independent diagnostic judgment within standard operating playbooks and escalation workflows.";
        } else {
          missing.push("What degree of autonomous decision-making vs strict SOP adherence is expected?");
          confidence = "medium";
          summary = "Executes assigned responsibilities with standard supervisory escalation.";
        }
        break;
      }
      case "leadershipSupervisory": {
        if (context.supervisory || (context.supervisoryLevel && !/individual/i.test(context.supervisoryLevel))) {
          evidence.push({
            sourceField: "supervisoryLevel",
            text: `Supervisory Level: ${context.supervisoryLevel || "Supervisory role"}`,
          });
          assessment = "Team Leadership / Floor Guidance";
          confidence = "medium";
          summary = "Position has leadership accountability, but direct report headcount and formal appraisal authority should be verified.";
          missing.push("How many direct/indirect reports does this role formally oversee?");
        } else {
          assessment = "Individual Contributor (Non-Supervisory)";
          confidence = "high";
          summary = "Individual contributor role with no formal direct report management authority.";
        }
        break;
      }
      case "personalOrganizationalContacts": {
        if (context.reportsTo) {
          evidence.push({
            sourceField: "reportsTo",
            text: `Reports directly to: ${context.reportsTo}`,
          });
        }
        if (context.account) {
          evidence.push({
            sourceField: "account",
            text: `Assigned Account / Client: ${context.account}`,
          });
        }
        assessment = "Cross-Functional & Client Peer Contacts";
        confidence = "high";
        summary = `Maintains regular operational and functional communication with ${context.reportsTo || "management"} and client teams.`;
        break;
      }
      case "customerServiceRelationships": {
        if (context.account || respText.includes("customer") || overviewText.includes("customer")) {
          evidence.push({
            sourceField: "positionOverview",
            text: context.positionOverview || `Supports client engagement for ${context.account}.`,
          });
          assessment = "Active Client / Customer Relationship Handling";
          confidence = "high";
          summary = "Responsible for day-to-day customer communication, issue resolution, and positive stakeholder representation.";
        } else {
          missing.push("Who are the primary internal or external customers served by this position?");
          confidence = "medium";
          summary = "General stakeholder interaction; specific client relationship ownership can be detailed.";
        }
        break;
      }
      case "workingEnvironmentalConditions": {
        if (context.workingConditions) {
          evidence.push({
            sourceField: "workingConditions",
            text: context.workingConditions,
          });
          assessment = "Standard Facility / Rotational Shifts";
          confidence = "high";
          summary = context.workingConditions;
        } else {
          missing.push("What is the exact shift schedule (e.g. night shift, rotating shifts, weekend support)?");
          assessment = "Standard Office / Operations Facility";
          confidence = "medium";
          summary = "Standard facility workstation environment with operational shift requirements.";
        }
        break;
      }
      default:
        summary = config.shortDescription;
    }

    return {
      key: config.key,
      factorNumber: config.number,
      factor: config.label,
      category: config.category,
      assessment,
      confidence,
      summary: summary || config.shortDescription,
      evidence,
      missingContext: missing.length > 0 ? missing : (evidence.length === 0 ? config.missingContextGuidance : []),
      requiresUserInput: missing.length > 0 || evidence.length === 0,
      criteria: summary || config.shortDescription,
      weightOrPoints: config.defaultPoints,
      source: "AI",
      reviewed: false,
    };
  });

  return {
    factors,
    overallSummary: `Contextual evaluation completed for ${context.roleTitle || "Job Description"}.`,
    analyzedAt: new Date().toISOString(),
    modelUsed: "deterministic-engine",
  };
}
