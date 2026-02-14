import React from 'react';

const getColor = (score: number) => {
  if (score <= 3) return '#10b981'; // green
  if (score <= 6) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

export const RiskScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  return (
    <span
      style={{
        backgroundColor: getColor(score),
        color: 'white',
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      Risk: {score}/10
    </span>
  );
};
