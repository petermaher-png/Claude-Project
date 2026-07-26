// Anthropic SDK wrapper — implemented in ROADMAP issue 6 (recommendation engine).
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-5-20250929";
const PROPOSAL_TOOL_NAME = "submit_recommendation";

export interface RecommendationCandidateSupplier {
  supplierName: string;
  pricingBands: unknown;
  leadTimeDays: number | null;
  paymentTerms: string | null;
}

export interface RecommendationCandidateProduct {
  id: string;
  name: string;
  sku: string;
  specs: unknown;
  certificationNotes: string | null;
  certifications: unknown;
  productLine: {
    name: string;
    slug: string;
  };
  suppliers: RecommendationCandidateSupplier[];
}

export interface RecommendationInput {
  needText: string;
  sector: string | null;
  application: string | null;
  candidateProducts: RecommendationCandidateProduct[];
}

export interface RecommendationOutput {
  proposal: Record<string, unknown>;
  reasoning: string;
}

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.",
    );
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

// Structured output via tool use — more reliable than asking Claude to emit
// bare JSON in prose, and avoids a separate freeform-parsing code path.
const PROPOSAL_TOOL: Anthropic.Tool = {
  name: PROPOSAL_TOOL_NAME,
  description:
    "Submit the structured equipment, material, and sourcing recommendation for this client need, along with the reasoning behind it. Only recommend items from the candidate product list provided — never invent products, suppliers, or specs that weren't given to you.",
  input_schema: {
    type: "object",
    properties: {
      proposal: {
        type: "object",
        description:
          "The structured recommendation, broken into equipment, material, and sourcing sections. Leave an array empty if nothing in the candidate list fits that section.",
        properties: {
          equipment: {
            type: "array",
            description:
              "Recommended equipment items (the primary devices/units) drawn from the candidate products.",
            items: {
              type: "object",
              properties: {
                productId: { type: "string", description: "id of the candidate product" },
                name: { type: "string" },
                sku: { type: "string" },
                quantity: { type: "string", description: "e.g. '4 units' or 'TBD pending site survey'" },
                notes: { type: "string" },
              },
              required: ["name"],
            },
          },
          material: {
            type: "array",
            description:
              "Recommended consumables/materials (mounting hardware, cabling, spares, etc.) drawn from the candidate products.",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                name: { type: "string" },
                sku: { type: "string" },
                quantity: { type: "string" },
                notes: { type: "string" },
              },
              required: ["name"],
            },
          },
          sourcing: {
            type: "array",
            description:
              "Sourcing plan per recommended item: which supplier, indicative pricing, lead time, and payment terms.",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                supplierName: { type: "string" },
                estimatedPricing: { type: "string" },
                leadTimeDays: { type: "number" },
                paymentTerms: { type: "string" },
              },
            },
          },
        },
        required: ["equipment", "material", "sourcing"],
      },
      reasoning: {
        type: "string",
        description:
          "Clear, human-readable explanation of why these products/suppliers were chosen (or why nothing fit well) for internal review before anything reaches the client.",
      },
    },
    required: ["proposal", "reasoning"],
  },
};

const SYSTEM_PROMPT = `You are an internal solution-engineering assistant for PMG Trading EG, a trading and procurement consulting agency. Your job is to translate a client's stated need into a recommended mix of equipment, material, and sourcing, drawn strictly from the candidate product list you are given.

Rules:
- Only recommend products that appear in the candidate list. Never invent products, suppliers, specs, or pricing.
- If nothing in the candidate list is a good fit, say so plainly in your reasoning and return empty arrays rather than forcing a bad match.
- Your reasoning must be visible and specific — explain which specs/certifications/terms drove each choice, since a human reviews this before anything reaches the client.
- This output is for internal review only. It is not client-facing.`;

function buildUserPrompt(input: RecommendationInput): string {
  const { needText, sector, application, candidateProducts } = input;

  return [
    "## Client Need",
    `Need (client's own words): ${needText}`,
    `Sector: ${sector ?? "Not specified"}`,
    `Application: ${application ?? "Not specified"}`,
    "",
    "## Candidate Products",
    "These are the only products you may recommend from (all belong to product lines currently marked ACTIVE / deliverable):",
    JSON.stringify(candidateProducts, null, 2),
    "",
    "Using only the candidate products above, call the submit_recommendation tool with a proposal covering equipment, material, and sourcing, plus your reasoning.",
  ].join("\n");
}

export async function generateRecommendation(
  input: RecommendationInput,
): Promise<RecommendationOutput> {
  const anthropic = getClient();

  let message: Anthropic.Message;
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [PROPOSAL_TOOL],
      tool_choice: { type: "tool", name: PROPOSAL_TOOL_NAME },
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Claude API request failed: ${detail}`);
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === "tool_use" && block.name === PROPOSAL_TOOL_NAME,
  );

  if (!toolUse) {
    throw new Error(
      "Claude did not return a structured recommendation (no tool_use block in response).",
    );
  }

  try {
    const parsed = toolUse.input as { proposal?: unknown; reasoning?: unknown };
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.proposal === undefined ||
      parsed.proposal === null ||
      typeof parsed.proposal !== "object" ||
      typeof parsed.reasoning !== "string" ||
      parsed.reasoning.trim() === ""
    ) {
      throw new Error("Response is missing a valid proposal object or reasoning string.");
    }

    return {
      proposal: parsed.proposal as Record<string, unknown>,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse Claude's recommendation output: ${detail}`);
  }
}
