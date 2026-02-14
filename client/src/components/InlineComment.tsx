import React from 'react';

export interface InlineCommentData {
  file: string;
  line: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

const severityColor: Record<InlineCommentData['severity'], string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
};

export const InlineComment: React.FC<{ comment: InlineCommentData }> = ({ comment }) => {
  return (
    <div
      style={{
        borderLeft: `4px solid ${severityColor[comment.severity]}`,
        background: '#f8fafc',
        padding: '8px 12px',
        marginBottom: 8,
        borderRadius: 4,
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        {comment.file} : line {comment.line}
      </div>
      <div style={{ fontSize: 14 }}>{comment.message}</div>
    </div>
  );
};
