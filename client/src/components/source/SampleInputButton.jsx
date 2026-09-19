import React from 'react';
import { FlaskConical } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { DEMO_SAMPLE_TEXT, DEMO_SAMPLE_TITLE } from '../../utils/constants.js';

export const SampleInputButton = ({ onLoadSample }) => {
  const handleClick = () => {
    onLoadSample({
      title: DEMO_SAMPLE_TITLE,
      text: DEMO_SAMPLE_TEXT,
      selectedOutputs: ['linkedin', 'executive_summary', 'advisory'],
      settings: {
        targetAudience: 'Executive',
        tone: 'Professional',
        communicationObjective: 'Alert',
        levelOfDetail: 'Moderate',
        language: 'en',
        contentStyle: 'Formal',
      },
    });
  };

  return (
    <Button
      variant="demo"
      size="sm"
      leftIcon={FlaskConical}
      onClick={handleClick}
      title="Load Acme Financial Ransomware Incident demo scenario"
    >
      Load Sample Input (Demo)
    </Button>
  );
};
