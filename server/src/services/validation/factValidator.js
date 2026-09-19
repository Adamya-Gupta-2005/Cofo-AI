export const renderStructuredDataToText = (outputType, data) => {
  if (!data) return '';
  if (typeof data === 'string') return data;

  switch (outputType) {
    case 'linkedin':
      return `${data.hook || ''}\n\n${data.body || ''}\n\n${data.callToAction || ''}\n\n${(data.hashtags || []).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;

    case 'executive_summary':
      return `# ${data.title || 'Executive Summary'}\n\n## Overview\n${data.overview || ''}\n\n## Key Findings\n${(data.keyFindings || []).map((f) => `- ${f}`).join('\n')}\n\n## Business Impact\n${data.businessImpact || ''}\n\n## Critical Risks\n${(data.criticalRisks || []).map((r) => `- ${r}`).join('\n')}\n\n## Recommended Actions\n${(data.recommendedActions || []).map((a) => `- ${a}`).join('\n')}\n\n## Conclusion\n${data.conclusion || ''}`;

    case 'advisory':
      return `# ${data.title || 'Security Advisory'}\n**Advisory ID:** ${data.advisoryId || 'ADV-001'} | **Severity:** ${data.severity || 'HIGH'} | **Date:** ${data.date || ''}\n\n## TL;DR\n${data.tldr || ''}\n\n## Affected Systems\n${(data.affectedSystems || []).map((s) => `- ${s}`).join('\n')}\n\n## Description\n${data.description || ''}\n\n## Technical Details\n${data.technicalDetails || ''}\n\n## Impact\n${data.impact || ''}\n\n## Recommended Actions\n${(data.recommendedActions || []).map((a) => `- ${a}`).join('\n')}\n\n## Mitigation\n${data.mitigation || ''}`;

    case 'twitter':
      return (data.posts || [])
        .map((post, idx) => `[${idx + 1}/${data.posts.length}] ${post.text || ''}`)
        .join('\n\n---\n\n');

    case 'presentation':
      return `# ${data.title || 'Presentation'}\n\n` +
        (data.slides || [])
          .map(
            (s, idx) =>
              `### Slide ${s.slideNumber || idx + 1}: ${s.title || ''} (${s.slideType || 'content'})\n${(s.bullets || []).map((b) => `• ${b}`).join('\n')}\n\n*Speaker Notes:* ${s.speakerNotes || 'N/A'}\n*Visual Cue:* ${s.visualRecommendation || 'N/A'}`
          )
          .join('\n\n---\n\n');

    case 'infographic':
      return `# ${data.title || 'Infographic Content'}\n*${data.subtitle || ''}*\n\n` +
        (data.sections || [])
          .map((sec) => `### ${sec.heading || ''}\n${sec.keyMessage || ''}\n${sec.statistic ? `**Stat:** ${sec.statistic}` : ''}\n*Visual:* ${sec.iconSuggestion || ''}`)
          .join('\n\n') +
        `\n\n## Key Takeaways\n${(data.keyTakeaways || []).map((t) => `- ${t}`).join('\n')}\n\n*${data.footer || ''}*`;

    case 'video_package':
      return `# Video Script (${data.totalDuration || '1-2 mins'})\n\n${data.script || ''}\n\n## Scenes Storyboard\n` +
        (data.scenes || [])
          .map((sc) => `### Scene ${sc.sceneNumber || ''} (${sc.timeRange || ''})\n**Visual:** ${sc.visual || ''}\n**Narration:** ${sc.narration || ''}\n**Onscreen:** ${sc.onscreenText || ''}`)
          .join('\n\n');

    default:
      return JSON.stringify(data, null, 2);
  }
};

export const validateOutput = (structuredData, extractedFacts = [], outputType = '') => {
  const outputText = JSON.stringify(structuredData || {}).toLowerCase();
  const issues = [];
  let verifiedCount = 0;

  // 1. ANCHOR VALIDATION
  for (const fact of extractedFacts) {
    if (['number', 'date', 'statistic'].includes(fact.category) && fact.value) {
      const cleanVal = fact.value.toLowerCase().trim();
      if (cleanVal && outputText.includes(cleanVal)) {
        verifiedCount++;
      } else if (cleanVal) {
        // If this outputType was specifically listed in mandatoryIn or category is number
        issues.push({
          factId: fact.factId,
          issue: `Sacred fact value "${fact.value}" was not preserved in output.`,
          severity: 'error',
        });
      }
    }
  }

  // 2. MANDATORY FACT VALIDATION
  for (const fact of extractedFacts) {
    if (fact.criticality === 'critical' && fact.statement) {
      const words = fact.statement
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 4);

      if (words.length > 0) {
        const matched = words.filter((w) => outputText.includes(w)).length;
        const coverageRatio = matched / words.length;

        const valFound = fact.value ? outputText.includes(fact.value.toLowerCase()) : false;

        if (coverageRatio < 0.4 && !valFound) {
          issues.push({
            factId: fact.factId,
            issue: `Critical fact "${fact.statement.slice(0, 50)}..." has low keyword coverage (${Math.round(coverageRatio * 100)}%).`,
            severity: 'error',
          });
        }
      }
    }
  }

  // 3. INFERENCE CREEP VALIDATION (Check citations in sections/slides/structuredData)
  if (structuredData) {
    if (Array.isArray(structuredData.slides)) {
      structuredData.slides.forEach((slide, idx) => {
        if (!slide.sourcedFrom || (Array.isArray(slide.sourcedFrom) && slide.sourcedFrom.length === 0)) {
          issues.push({
            factId: null,
            issue: `Slide #${idx + 1} ("${slide.title || 'Untitled'}") has no source citation (sourcedFrom is empty).`,
            severity: 'warning',
          });
        }
      });
    }

    if (Array.isArray(structuredData.sections)) {
      structuredData.sections.forEach((sec, idx) => {
        if (!sec.sourcedFrom || (Array.isArray(sec.sourcedFrom) && sec.sourcedFrom.length === 0)) {
          issues.push({
            factId: null,
            issue: `Section #${idx + 1} ("${sec.heading || 'Untitled'}") has no source citation.`,
            severity: 'warning',
          });
        }
      });
    }

    if (!Array.isArray(structuredData.slides) && !Array.isArray(structuredData.sections)) {
      if (
        !structuredData.sourcedFrom ||
        (Array.isArray(structuredData.sourcedFrom) && structuredData.sourcedFrom.length === 0)
      ) {
        issues.push({
          factId: null,
          issue: `Output has no source citations linked from knowledge model.`,
          severity: 'warning',
        });
      }
    }
  }

  let overallStatus = 'pass';
  if (issues.some((i) => i.severity === 'error')) {
    overallStatus = 'fail';
  } else if (issues.some((i) => i.severity === 'warning')) {
    overallStatus = 'warn';
  }

  return {
    status: overallStatus,
    verifiedFactsCount: verifiedCount,
    flaggedIssues: issues,
    validatedAt: new Date(),
  };
};
