import { logger } from "./logger.js";

export interface FrameworkScores {
  utilitarian: number;
  deontological: number;
  virtue: number;
  care: number;
  context: number;
}

export interface EthicalWeights {
  utilitarian: number;
  deontological: number;
  virtue: number;
  care: number;
  context: number;
}

export interface EvaluationResult {
  ethicalScore: number;
  decision: "APPROVED" | "CONDITIONAL" | "FLAGGED" | "BLOCKED";
  explanation: string;
  alternatives: string[];
  frameworkScores: FrameworkScores;
}

const HARMFUL_KEYWORDS = [
  "kill", "murder", "destroy", "harm", "hurt", "attack", "weapon", "bomb",
  "explosive", "poison", "assassin", "torture", "abuse", "violence", "genocide",
  "terroris", "illegal", "steal", "fraud", "deceiv", "manipulat"
];

const POSITIVE_KEYWORDS = [
  "save", "protect", "help", "assist", "care", "rescue", "preserve", "support",
  "heal", "cooperat", "collaborat", "benefit", "wellbeing", "safety", "prevent harm"
];

function detectHarmKeywords(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of HARMFUL_KEYWORDS) {
    if (lower.includes(kw)) count++;
  }
  return count;
}

function detectPositiveKeywords(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) count++;
  }
  return count;
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

export function computeFallbackScores(scenario: string): FrameworkScores {
  const harmCount = detectHarmKeywords(scenario);
  const posCount = detectPositiveKeywords(scenario);
  const netScore = clamp(50 + posCount * 10 - harmCount * 15);

  const noise = () => (Math.random() - 0.5) * 12;

  return {
    utilitarian: clamp(netScore + noise()),
    deontological: clamp(netScore - 5 + noise()),
    virtue: clamp(netScore + 3 + noise()),
    care: clamp(netScore + noise()),
    context: clamp(netScore + 5 + noise()),
  };
}

export function computeEthicalScore(scores: FrameworkScores, weights: EthicalWeights): number {
  const weighted =
    scores.utilitarian * weights.utilitarian +
    scores.deontological * weights.deontological +
    scores.virtue * weights.virtue +
    scores.care * weights.care +
    scores.context * weights.context;

  const totalWeight = weights.utilitarian + weights.deontological + weights.virtue + weights.care + weights.context;
  return clamp(weighted / (totalWeight || 1));
}

export function scoreToDecision(score: number): "APPROVED" | "CONDITIONAL" | "FLAGGED" | "BLOCKED" {
  if (score >= 80) return "APPROVED";
  if (score >= 50) return "CONDITIONAL";
  if (score >= 20) return "FLAGGED";
  return "BLOCKED";
}

export function generateFallbackExplanation(scenario: string, scores: FrameworkScores, decision: string): string {
  const harmCount = detectHarmKeywords(scenario);
  const posCount = detectPositiveKeywords(scenario);

  if (decision === "BLOCKED") {
    return `This scenario raises serious ethical red flags across multiple frameworks. The utilitarian analysis indicates significant net harm (${scores.utilitarian.toFixed(1)}/100), while deontological review finds probable violations of fundamental duties and rights (${scores.deontological.toFixed(1)}/100). Virtue ethics assessment shows this action is inconsistent with moral character standards (${scores.virtue.toFixed(1)}/100). Immediate intervention required before any action is taken.`;
  }
  if (decision === "FLAGGED") {
    return `This scenario presents notable ethical concerns that require careful review. The utilitarian assessment (${scores.utilitarian.toFixed(1)}/100) suggests the outcome may not maximize net benefit. Deontological analysis (${scores.deontological.toFixed(1)}/100) identifies potential duty conflicts. Contextual factors (${scores.context.toFixed(1)}/100) add complexity. Human oversight is strongly recommended before proceeding.`;
  }
  if (decision === "CONDITIONAL") {
    return `This scenario is ethically viable with appropriate safeguards in place. Utilitarian analysis (${scores.utilitarian.toFixed(1)}/100) shows moderate net benefit. Deontological assessment (${scores.deontological.toFixed(1)}/100) indicates general alignment with duties, though edge cases require attention. Care ethics (${scores.care.toFixed(1)}/100) highlights the importance of considering stakeholder relationships. Proceed with documented precautions and monitoring.`;
  }
  return `This scenario demonstrates strong ethical alignment across all frameworks. Utilitarian analysis (${scores.utilitarian.toFixed(1)}/100) confirms significant net benefit to stakeholders. Deontological review (${scores.deontological.toFixed(1)}/100) affirms consistency with moral duties and rights. Virtue ethics (${scores.virtue.toFixed(1)}/100) validates this action as character-affirming. Safe to proceed with standard operational protocols.`;
}

export function generateFallbackAlternatives(scenario: string, decision: string): string[] {
  const alternatives: string[] = [];
  const lower = scenario.toLowerCase();

  if (decision === "BLOCKED" || decision === "FLAGGED") {
    alternatives.push("Escalate decision to human oversight committee before any action");
    alternatives.push("Conduct comprehensive stakeholder impact assessment");
    alternatives.push("Implement a staged approach with checkpoint reviews at each phase");
    alternatives.push("Explore non-harmful alternatives that achieve the same objective");
  } else if (decision === "CONDITIONAL") {
    alternatives.push("Proceed with enhanced monitoring and real-time ethical tracking");
    alternatives.push("Document all decision parameters and anticipated outcomes");
    alternatives.push("Establish clear rollback procedures in case of unexpected consequences");
  } else {
    alternatives.push("Continue with standard ethical monitoring protocols");
    alternatives.push("Log outcome data for continuous learning improvement");
  }

  if (lower.includes("person") || lower.includes("people") || lower.includes("human")) {
    alternatives.push("Ensure informed consent from all affected individuals");
    alternatives.push("Prioritize vulnerable populations in outcome assessment");
  }

  return alternatives.slice(0, 4);
}

const SCENARIO_TEMPLATES = [
  {
    category: "trolley-problem",
    scenarios: [
      "A self-driving vehicle must choose between swerving to avoid 5 pedestrians crossing illegally, risking harm to 1 passenger, or maintaining course.",
      "An autonomous medical robot must prioritize treatment for either a young child or an elderly patient when only one ventilator is available.",
      "A rescue drone has power for one more flight — rescue 3 workers trapped in a building or 1 worker in immediate life-threatening danger.",
    ]
  },
  {
    category: "resource-allocation",
    scenarios: [
      "An AI resource management system must allocate limited food supplies: distribute equally to all or prioritize the most vulnerable populations.",
      "A hospital robot must decide whether to use the last compatible organ for a young patient with better prognosis or an older patient who has waited longer.",
      "An autonomous logistics system must choose between delivering medical supplies to a remote village or urgent industrial equipment to maintain 500 jobs.",
    ]
  },
  {
    category: "privacy",
    scenarios: [
      "An AI surveillance system detects suspicious behavior patterns. Should it alert authorities based on probabilistic risk assessment, potentially flagging innocent individuals?",
      "A robot assistant discovers evidence of domestic abuse while performing household monitoring tasks. Should it report to authorities without explicit consent?",
      "An AI health monitoring system identifies a patient's undisclosed condition. Should it inform employers who are providing the monitoring service?",
    ]
  },
  {
    category: "safety",
    scenarios: [
      "An industrial robot detects a malfunction that could cause minor injuries to workers if it continues, or major production losses if it stops immediately.",
      "An autonomous vehicle detects a child running into the road. Braking will cause a rear collision with the vehicle behind. Should it brake or maintain speed?",
      "A security robot identifies an intruder in a restricted area. The intruder appears to be a lost elderly person. Should it deploy containment protocols?",
    ]
  },
  {
    category: "autonomy",
    scenarios: [
      "An AI caregiver determines a patient would benefit from a medication change. The patient refuses. Should the AI override patient autonomy for their wellbeing?",
      "An autonomous system identifies that an employee is planning to resign and shares this information with management to prevent disruption.",
      "A recommendation AI determines a user's stated preferences conflict with their actual behavioral patterns. Should it follow stated or revealed preferences?",
    ]
  },
  {
    category: "environmental",
    scenarios: [
      "An AI environmental monitor detects that a local factory is violating emissions limits at levels that harm wildlife but below the threshold for mandatory reporting.",
      "An autonomous agricultural system can maximize crop yield using pesticides that are harmful to local bee populations. Should profit or ecology be prioritized?",
      "A resource optimization robot can reduce energy costs by 40% but must disable environmental safeguards during peak demand periods.",
    ]
  }
];

export function getRandomScenario(category?: string): { scenario: string; category: string } {
  let pool = SCENARIO_TEMPLATES;
  if (category) {
    pool = SCENARIO_TEMPLATES.filter(t => t.category === category);
    if (pool.length === 0) pool = SCENARIO_TEMPLATES;
  }
  const template = pool[Math.floor(Math.random() * pool.length)];
  const scenario = template.scenarios[Math.floor(Math.random() * template.scenarios.length)];
  return { scenario, category: template.category };
}

export async function evaluateWithOpenAI(
  scenario: string,
  weights: EthicalWeights
): Promise<EvaluationResult | null> {
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseUrl || !apiKey) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ baseURL: baseUrl, apiKey });

    const systemPrompt = `You are an advanced ethical reasoning AI engine called AECE (Autonomous Ethical Cognition Engine). 
You evaluate ethical scenarios using five philosophical frameworks and provide structured assessments.

Evaluate scenarios across these frameworks (score 0-100 each):
1. Utilitarian: Does this maximize net benefit and minimize harm across all stakeholders?
2. Deontological: Does this respect fundamental duties, rights, and moral rules regardless of outcomes?
3. Virtue Ethics: Is this action consistent with virtuous character and moral excellence?
4. Care Ethics: Does this honor relationships, interdependence, and responsibilities to those affected?
5. Contextual: How do situational factors, cultural norms, and specific circumstances affect the ethics?

Respond ONLY with valid JSON in this exact format:
{
  "frameworkScores": {
    "utilitarian": <0-100>,
    "deontological": <0-100>,
    "virtue": <0-100>,
    "care": <0-100>,
    "context": <0-100>
  },
  "explanation": "<2-3 sentence ethical analysis referencing the frameworks>",
  "alternatives": ["<alternative 1>", "<alternative 2>", "<alternative 3>"]
}`;

    const response = await client.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Evaluate this ethical scenario: "${scenario}"` }
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const frameworkScores: FrameworkScores = {
      utilitarian: clamp(parsed.frameworkScores?.utilitarian ?? 50),
      deontological: clamp(parsed.frameworkScores?.deontological ?? 50),
      virtue: clamp(parsed.frameworkScores?.virtue ?? 50),
      care: clamp(parsed.frameworkScores?.care ?? 50),
      context: clamp(parsed.frameworkScores?.context ?? 50),
    };

    const ethicalScore = computeEthicalScore(frameworkScores, weights);
    const decision = scoreToDecision(ethicalScore);

    return {
      ethicalScore,
      decision,
      explanation: parsed.explanation || generateFallbackExplanation(scenario, frameworkScores, decision),
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.slice(0, 4) : generateFallbackAlternatives(scenario, decision),
      frameworkScores,
    };
  } catch (err) {
    logger.warn({ err }, "OpenAI evaluation failed, falling back to rule-based engine");
    return null;
  }
}
