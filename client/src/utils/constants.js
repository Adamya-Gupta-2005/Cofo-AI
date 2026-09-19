export const DEMO_SAMPLE_TEXT = `[DEMONSTRATION DATA — FICTIONAL]

INCIDENT REPORT — Ransomware Attack
Organization: Acme Financial Services (Fictional)
Report Date: 12 August 2026

On 12 August 2026, Acme Financial Services detected ransomware activity
affecting approximately 15,000 user accounts across its internal network infrastructure.

Investigation determined the initial access vector was a compromised employee
credential obtained through a phishing campaign targeting the finance department.

The incident response team isolated affected systems within 4 hours of detection.
All compromised credentials were reset within 6 hours of the incident being identified.

Forensic analysis at the time of reporting found no evidence of data exfiltration.
Customer-facing systems and production databases were not impacted by the attack.

Recommended immediate actions:
- Mandatory multi-factor authentication rollout for all staff
- Company-wide phishing awareness training
- Full review of credential management and access policies
- Audit of all privileged access accounts

Severity Classification: HIGH
CVE Reference: None identified at time of report
Affected Systems: HR management platform, internal document storage, departmental email servers`;

export const DEMO_SAMPLE_TITLE = "Ransomware Incident — Acme Financial";

export const OUTPUT_TYPES = [
  {
    id: 'linkedin',
    label: 'LinkedIn Post',
    description: 'Hook, narrative body, call-to-action & relevant hashtags',
    icon: 'Linkedin',
    defaultSelected: true,
  },
  {
    id: 'executive_summary',
    label: 'Executive Summary',
    description: 'High-level overview, business impact & strategic risks',
    icon: 'FileText',
    defaultSelected: true,
  },
  {
    id: 'advisory',
    label: 'Advisory Document',
    description: 'Technical breakdown, severity rating & mitigation steps',
    icon: 'ShieldAlert',
    defaultSelected: true,
  },
  {
    id: 'presentation',
    label: 'Presentation Slides',
    description: 'Structured multi-slide deck with visual cues and speaker notes',
    icon: 'Presentation',
    defaultSelected: false,
  },
  {
    id: 'twitter',
    label: 'Twitter / X Thread',
    description: 'Engaging, concise multi-post thread under 280 characters',
    icon: 'Twitter',
    defaultSelected: false,
  },
  {
    id: 'infographic',
    label: 'Infographic Content',
    description: 'Key data points, modular statistics & visual icons',
    icon: 'BarChart',
    defaultSelected: false,
  },
  {
    id: 'video_package',
    label: 'Video Package',
    description: 'Voiceover script, scene storyboards & timed SRT subtitles',
    icon: 'Video',
    defaultSelected: false,
  },
];

export const SETTINGS_OPTIONS = {
  targetAudience: [
    'Executive',
    'General Public',
    'Technical',
    'Developers',
    'Researchers',
    'Government',
    'Security Professionals',
  ],
  tone: [
    'Professional',
    'Formal',
    'Informative',
    'Conversational',
    'Urgent',
    'Persuasive',
    'Technical',
  ],
  language: [
    { value: 'en', label: 'English', available: true },
    { value: 'hi', label: 'Hindi (Coming Soon)', available: false },
    { value: 'es', label: 'Spanish (Coming Soon)', available: false },
    { value: 'fr', label: 'French (Coming Soon)', available: false },
  ],
  levelOfDetail: ['Concise', 'Moderate', 'Detailed'],
  communicationObjective: [
    'Alert',
    'Inform',
    'Educate',
    'Persuade',
    'Summarize',
    'Explain',
  ],
  contentStyle: [
    'Formal',
    'Technical',
    'Business',
    'Public-Facing',
    'Academic',
    'Social Media',
  ],
};
