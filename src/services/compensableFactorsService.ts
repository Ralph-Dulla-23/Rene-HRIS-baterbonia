import {
  NormalizedJobDescriptionContext,
  CompensableFactorAnalysisResponse,
  CompensableFactorAssessmentItem
} from "../types/compensableFactors";
import { COMPENSABLE_FACTORS_CONFIG } from "../data/compensableFactorsConfig";

export function buildNormalizedJobDescriptionContext(formData: {
  documentTitle?: string;
  roleTitle: string;
  department: string;
  account: string;
  reportsTo: string;
  supervisoryLevel: string;
  positionOverview: string;
  responsibilities: string[];
  qualifications: string;
  competencies: { title: string; description: string; proficiency: string }[] | string[];
  targetPersonality?: string;
  workingConditions?: string;
  remarks?: string;
  additionalContext?: Record<string, string>;
}): NormalizedJobDescriptionContext {
  const formattedCompetencies = Array.isArray(formData.competencies)
    ? formData.competencies.map((c) => (typeof c === "string" ? c : `${c.title} (${c.proficiency}): ${c.description}`))
    : [];

  const isSupervisory = Boolean(
    formData.supervisoryLevel &&
      !formData.supervisoryLevel.toLowerCase().includes("individual") &&
      !formData.supervisoryLevel.toLowerCase().includes("non-supervisory")
  );

  return {
    documentTitle: formData.documentTitle || "",
    roleTitle: (formData.roleTitle || "").trim(),
    department: (formData.department || "").trim(),
    account: (formData.account || "").trim(),
    reportsTo: (formData.reportsTo || "").trim(),
    supervisory: isSupervisory,
    supervisoryLevel: formData.supervisoryLevel || "Individual Contributor",
    positionOverview: (formData.positionOverview || "").trim(),
    responsibilities: (formData.responsibilities || []).map((r) => r.trim()).filter(Boolean),
    qualifications: (formData.qualifications || "").trim(),
    competencies: formattedCompetencies,
    targetPersonality: (formData.targetPersonality || "").trim(),
    workingConditions: (formData.workingConditions || "").trim(),
    remarks: (formData.remarks || "").trim(),
    additionalContext: formData.additionalContext || {},
  };
}

export async function analyzeCompensableFactors(
  context: NormalizedJobDescriptionContext
): Promise<CompensableFactorAnalysisResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch("/api/compensable-factors/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(context),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server returned status ${response.status}`);
    }

    const data: CompensableFactorAnalysisResponse = await response.json();
    return validateAndNormalizeClientResponse(data, context);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn("API call to /api/compensable-factors/analyze failed or timed out. Falling back to local assessment.", error);
    return generateClientSideFallback(context, error?.message);
  }
}

function validateAndNormalizeClientResponse(
  data: CompensableFactorAnalysisResponse,
  context: NormalizedJobDescriptionContext
): CompensableFactorAnalysisResponse {
  if (!data || !Array.isArray(data.factors)) {
    return generateClientSideFallback(context, "Invalid response payload received.");
  }

  const completeFactors: CompensableFactorAssessmentItem[] = COMPENSABLE_FACTORS_CONFIG.map((config) => {
    const found = data.factors.find(
      (f) =>
        f.key === config.key ||
        f.factorNumber === config.number ||
        (f.factor && f.factor.toLowerCase().includes(config.label.toLowerCase()))
    );

    if (found) {
      return {
        ...found,
        key: config.key,
        factorNumber: config.number,
        factor: config.label,
        category: config.category,
        criteria: found.criteria || found.summary || config.shortDescription,
        weightOrPoints: typeof found.weightOrPoints === "number" ? found.weightOrPoints : config.defaultPoints,
        source: "AI" as const,
        reviewed: false,
      };
    }

    return {
      key: config.key,
      factorNumber: config.number,
      factor: config.label,
      category: config.category,
      assessment: null,
      confidence: "insufficient" as const,
      summary: config.shortDescription,
      evidence: [],
      missingContext: config.missingContextGuidance,
      requiresUserInput: true,
      criteria: config.shortDescription,
      weightOrPoints: config.defaultPoints,
      source: "AI" as const,
      reviewed: false,
    };
  });

  return {
    factors: completeFactors,
    overallSummary: data.overallSummary || `Evaluated 9 compensable factors for ${context.roleTitle || "Position"}.`,
    analyzedAt: data.analyzedAt || new Date().toISOString(),
    modelUsed: data.modelUsed || "gemini-3.7-flash",
  };
}

export function generateClientSideFallback(
  context: NormalizedJobDescriptionContext,
  errorReason?: string
): CompensableFactorAnalysisResponse {
  const qualText = (context.qualifications || "").toLowerCase();
  const respList = context.responsibilities || [];

  const factors: CompensableFactorAssessmentItem[] = COMPENSABLE_FACTORS_CONFIG.map((config) => {
    const evidence: { sourceField: string; text: string }[] = [];
    const missing: string[] = [];
    let assessment: string | null = null;
    let confidence: "high" | "medium" | "low" | "insufficient" = "medium";
    let summary = "";

    switch (config.key) {
      case "education":
        if (qualText.includes("bachelor") || qualText.includes("degree") || qualText.includes("college")) {
          const line = context.qualifications.split("\n").find((l) => /degree|bachelor|college/i.test(l));
          evidence.push({ sourceField: "qualifications", text: line || "Educational requirements specified." });
          assessment = "Moderate (Bachelor's Degree)";
          confidence = "high";
          summary = "Requires tertiary degree or equivalent technical domain foundation.";
        } else {
          missing.push("Is a specific academic degree mandatory or preferred?");
          confidence = "insufficient";
          summary = "Formal education requirement is not explicitly detailed.";
        }
        break;

      case "workExperience": {
        const match = context.qualifications.match(/(\d+\+?\s*years?|\d+-\d+\s*years?)/i);
        if (match) {
          evidence.push({ sourceField: "qualifications", text: match[0] });
          assessment = `Relevant Experience (${match[0]})`;
          confidence = "high";
          summary = `Requires prior relevant practical domain experience of ${match[0]}.`;
        } else {
          missing.push("Minimum years of prior relevant work experience not explicitly specified.");
          confidence = "insufficient";
          summary = "Experience duration or depth is not specified in the JD.";
        }
        break;
      }

      case "desiredCompetencies": {
        const compCount = Array.isArray(context.competencies) ? context.competencies.length : 0;
        if (compCount > 0) {
          evidence.push({
            sourceField: "competencies",
            text: Array.isArray(context.competencies) ? context.competencies.join("; ") : String(context.competencies),
          });
          assessment = "Proficient / Multi-Disciplinary";
          confidence = "high";
          summary = `Clear technical, analytical, and communication competencies identified (${compCount} defined).`;
        } else {
          missing.push("Software, system tooling, and specific proficiency benchmarks need specification.");
          confidence = "low";
          summary = "General skill expectations provided.";
        }
        break;
      }

      case "workComplexityBudgetAuthority":
        if (respList.length > 0) {
          evidence.push({ sourceField: "responsibilities", text: respList[0] });
        }
        missing.push("Does this position manage, approve, or own an operational budget or financial spending limit?");
        assessment = "Moderate Complexity / No Direct Budget";
        confidence = "medium";
        summary = "Role involves operational workflow execution; direct discretionary budget authority is unstated.";
        break;

      case "independentJudgmentProblemSolving":
        if (respList.some((r) => /troubleshoot|diagnose|resolve|decision/i.test(r))) {
          const r = respList.find((r) => /troubleshoot|diagnose|resolve|decision/i.test(r)) || respList[0];
          evidence.push({ sourceField: "responsibilities", text: r });
          assessment = "Autonomous Troubleshooting & SOP Execution";
          confidence = "high";
          summary = "Exercises independent diagnostic judgment within standard operating playbooks and escalation workflows.";
        } else {
          missing.push("What degree of autonomous decision-making vs strict SOP adherence is expected?");
          confidence = "medium";
          summary = "Follows established procedures with standard supervisory escalation.";
        }
        break;

      case "leadershipSupervisory":
        if (context.supervisory) {
          evidence.push({ sourceField: "supervisoryLevel", text: context.supervisoryLevel });
          assessment = "Team Leadership / Floor Guidance";
          confidence = "medium";
          summary = "Leadership accountability specified; direct report headcount and formal appraisal authority can be reviewed.";
          missing.push("How many direct/indirect reports does this role formally oversee?");
        } else {
          assessment = "Individual Contributor (Non-Supervisory)";
          confidence = "high";
          summary = "Individual contributor with no formal direct report supervisory authority.";
        }
        break;

      case "personalOrganizationalContacts":
        if (context.reportsTo) {
          evidence.push({ sourceField: "reportsTo", text: `Reports to: ${context.reportsTo}` });
        }
        assessment = "Internal Team & Client Contacts";
        confidence = "high";
        summary = `Maintains regular operational communication with ${context.reportsTo || "management"} and client teams.`;
        break;

      case "customerServiceRelationships":
        if (context.account) {
          evidence.push({ sourceField: "account", text: `Account: ${context.account}` });
        }
        assessment = "Client Service & Stakeholder Care";
        confidence = "high";
        summary = "Responsible for customer issue resolution, professional communication, and positive client representation.";
        break;

      case "workingEnvironmentalConditions":
        if (context.workingConditions) {
          evidence.push({ sourceField: "workingConditions", text: context.workingConditions });
          assessment = "Operational Workstation / Shift Operations";
          confidence = "high";
          summary = context.workingConditions;
        } else {
          missing.push("What is the exact shift schedule (e.g. night shift, rotating shifts, weekend support)?");
          assessment = "Standard Facility / Shifts";
          confidence = "medium";
          summary = "Standard facility workstation environment with operational shift requirements.";
        }
        break;
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
      source: "AI" as const,
      reviewed: false,
    };
  });

  return {
    factors,
    overallSummary: `Compensable factor contextual evaluation completed for ${context.roleTitle || "Job Description"}${
      errorReason ? ` (${errorReason})` : ""
    }.`,
    analyzedAt: new Date().toISOString(),
    modelUsed: "local-evaluator",
  };
}
