import { getCodeExcerpt } from '../utils/diffParser';

const CATEGORY_COLORS = {
  bug: '#f97316',
  security: '#ef4444',
  performance: '#3b82f6',
  quality: '#a855f7'
};

export default function FindingCard({ finding, patch }) {
  const excerpt = finding.line ? getCodeExcerpt(patch, finding.line, 1) : null;
  const accentColor = CATEGORY_COLORS[finding.category] || '#666';

  return (
    <div className="finding-card" style={{ borderLeftColor: accentColor }}>
      <div className="finding-header">
        <span className="category-tag" style={{ backgroundColor: accentColor }}>
          {finding.category}
        </span>
        <code className="finding-file">{finding.file}</code>
        {finding.line && <span className="line-badge">Line {finding.line}</span>}
      </div>
      <p className="finding-message">{finding.message}</p>
      {excerpt && excerpt.length > 0 && (
        <pre className="code-excerpt">
          <code>
            {excerpt.map((l, i) => (
              <div key={i} className={`excerpt-line ${l.lineNumber === finding.line ? 'excerpt-highlight' : ''}`}>
                <span className="excerpt-linenum">{l.lineNumber}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </code>
        </pre>
      )}
    </div>
  );
}