import { getAIProvider } from '../ai/aiProviderFactory.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

const SYSTEM_ANALYSIS_PROMPT = `You are an expert canonical content and knowledge extraction engine.
Analyze the provided source text thoroughly and extract a complete, strictly structured canonical knowledge model.

Return ONLY a JSON object with this EXACT schema:
{
  "topic": "Primary topic of the document",
  "summary": "Concise executive summary (2-3 sentences)",
  "keyFacts": ["Fact 1", "Fact 2"],
  "entities": [{"name": "Acme Financial Services", "type": "Organization"}],
  "statistics": ["15,000 user accounts affected", "4 hours isolation time"],
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "claims": ["Claim 1"],
  "communicationIntent": "Alert / Incident Notification / Educational / Policy",
  "domain": "Cybersecurity / Finance / Healthcare / General",
  "extractedFacts": [
    {
      "factId": "FACT-001",
      "statement": "15,000 user accounts were affected by the ransomware activity",
      "value": "15,000",
      "category": "number",
      "criticality": "critical",
      "mandatoryIn": ["advisory", "executive_summary", "linkedin"]
    }
  ]
}

CRITICAL EXTRACTION RULES:
1. Every specific numeric value, count, percentage, currency, or statistic MUST be an item in extractedFacts with category "number" or "statistic".
2. Every explicit date or time interval (e.g., "12 August 2026", "4 hours", "6 hours") MUST be in extractedFacts with category "date" or "number".
3. Assign factId sequentially starting at FACT-001.
4. Set criticality to "critical" for core metrics, root causes, severity ratings, and impact assessments; "high" for key recommendations; "medium" or "low" for peripheral context.
5. In extractedFacts, the "value" field MUST contain the exact literal string (e.g., "15,000", "12 August 2026", "4 hours", "HIGH").
6. Do not fabricate, hallucinate, extrapolate, or embellish facts.`;

export const analyzeSourceContent = async (source) => {
  if (source.analysisStatus === 'completed' && source.canonicalContent?.extractedFacts?.length > 0) {
    logger.info(`[ContentAnalyzer] Source ${source._id} already analyzed. Using cached canonicalContent.`);
    return source.canonicalContent;
  }

  logger.info(`[ContentAnalyzer] Starting canonical analysis for source: ${source._id} (${source.title})`);
  const aiProvider = getAIProvider();

  const userMessage = `SOURCE DOCUMENT TITLE: ${source.title}\n\nSOURCE DOCUMENT CONTENT:\n${source.rawText}`;

  try {
    source.analysisStatus = 'processing';
    await source.save();

    const canonicalData = await aiProvider.completeJSON(
      SYSTEM_ANALYSIS_PROMPT,
      userMessage,
      { tier: 'deep', temperature: 0.1, maxTokens: 4000 }
    );

    // Normalize and sanitize extractedFacts
    if (!Array.isArray(canonicalData.extractedFacts) || canonicalData.extractedFacts.length === 0) {
      // Fallback if empty
      canonicalData.extractedFacts = (canonicalData.keyFacts || []).map((fact, idx) => ({
        factId: `FACT-${String(idx + 1).padStart(3, '0')}`,
        statement: fact,
        value: '',
        category: 'general',
        criticality: 'medium',
        mandatoryIn: [],
      }));
    } else {
      canonicalData.extractedFacts = canonicalData.extractedFacts.map((fact, idx) => ({
        factId: fact.factId || `FACT-${String(idx + 1).padStart(3, '0')}`,
        statement: fact.statement || '',
        value: fact.value !== undefined ? String(fact.value) : '',
        category: ['number', 'date', 'entity', 'claim', 'statistic', 'general'].includes(fact.category)
          ? fact.category
          : 'general',
        criticality: ['critical', 'high', 'medium', 'low'].includes(fact.criticality)
          ? fact.criticality
          : 'medium',
        mandatoryIn: Array.isArray(fact.mandatoryIn) ? fact.mandatoryIn : [],
      }));
    }

    source.canonicalContent = canonicalData;
    source.analysisStatus = 'completed';
    await source.save();

    logger.info(
      `[ContentAnalyzer] Completed analysis for source ${source._id}. Extracted ${source.canonicalContent.extractedFacts.length} facts.`
    );
    return source.canonicalContent;
  } catch (error) {
    logger.error(`[ContentAnalyzer] Analysis failed for source ${source._id}: ${error.message}`);
    source.analysisStatus = 'failed';
    await source.save();
    throw new ApiError(500, `Failed to analyze source document: ${error.message}`, 'ANALYSIS_FAILED');
  }
};
