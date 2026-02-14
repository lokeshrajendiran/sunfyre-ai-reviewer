import React from 'react';

interface DiffViewerProps {
  diff: string;
  inlineComments?: Array<{ file: string; line: number; message: string; severity: string }>;
}

// Minimal diff viewer; for production integrate a library like react-diff-view
export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, inlineComments = [] }) => {
  const lines = diff.split('\n');

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#0f172a', color: '#f1f5f9', padding: 12, borderRadius: 6 }}>
      {lines.map((line, idx) => {
        const lineNumber = idx + 1;
        const commentsForLine = inlineComments.filter(c => c.line === lineNumber);
        let lineColor = 'transparent';
        if (line.startsWith('+')) lineColor = 'rgba(16,185,129,0.15)';
        if (line.startsWith('-')) lineColor = 'rgba(239,68,68,0.25)';
        if (line.startsWith('diff --git')) lineColor = 'rgba(59,130,246,0.25)';

        return (
          <div key={idx} style={{ position: 'relative' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 48, textAlign: 'right', paddingRight: 8, userSelect: 'none', opacity: 0.4 }}>{lineNumber}</div>
              <div style={{ flex: 1, background: lineColor, padding: '0 4px' }}>{line}</div>
            </div>
            {commentsForLine.length > 0 && (
              <div style={{ marginLeft: 56 }}>
                {commentsForLine.map((c, i) => (
                  <div key={i} style={{ background: '#1e293b', borderLeft: '4px solid #6366f1', padding: '4px 8px', margin: '4px 0', borderRadius: 4 }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{c.file} : line {c.line}</div>
                    <div style={{ fontSize: 12 }}>{c.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
