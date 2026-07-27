import { useState } from 'react';
import FindingCard from './FindingCard';

const CATEGORIES = [
  { key: 'bug', label: 'Bugs' },
  { key: 'security', label: 'Security' },
  { key: 'performance', label: 'Performance' },
  { key: 'quality', label: 'Code Quality' }
];

export default function FindingsList({ findings, files }) {
  const [openSections, setOpenSections] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, true]))
  );

  const toggle = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = (findings || []).filter((f) => f.category === cat.key);
    return acc;
  }, {});

  const patchByFile = Object.fromEntries((files || []).map((f) => [f.filename, f.patch]));

  return (
    <div className="findings-list">
      <h2 className="section-title">Findings</h2>
      {CATEGORIES.map((cat) => {
        const isOpen = openSections[cat.key];
        const sectionId = `findings-section-${cat.key}`;
        return (
          <div key={cat.key} className="findings-section">
            <button
              className="findings-section-header"
              onClick={() => toggle(cat.key)}
              aria-expanded={isOpen}
              aria-controls={sectionId}
            >
              <span>{cat.label} ({grouped[cat.key].length})</span>
              <span className={`chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">▾</span>
            </button>
            {isOpen && (
              <div className="findings-section-body" id={sectionId}>
                {grouped[cat.key].length === 0 ? (
                  <p className="no-issues">No issues found in this category.</p>
                ) : (
                  grouped[cat.key].map((finding, i) => (
                    <FindingCard key={i} finding={finding} patch={patchByFile[finding.file]} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}