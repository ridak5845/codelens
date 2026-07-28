import { useState, useRef } from 'react';
import api from '../services/api';
import ScorePanel from '../components/ScorePanel';
import FindingsList from '../components/FindingsList';
import ErrorBanner from '../components/ErrorBanner';

const MAX_CODE_LENGTH = 50000;

export default function FileReview() {
  const [mode, setMode] = useState('paste');
  const [filename, setFilename] = useState('');
  const [code, setCode] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_CODE_LENGTH) {
      setReviewError(`That file is too large (max ${(MAX_CODE_LENGTH / 1000).toFixed(0)}KB). Please choose a smaller file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      setFilename(file.name);
      setReviewError(null);
    };
    reader.onerror = () => {
      setReviewError('Could not read that file. Please try a different one.');
    };
    reader.readAsText(file);
  };

  const runReview = async () => {
    if (!filename.trim() || !code.trim()) {
      setReviewError('Please provide both a filename and some code to review.');
      return;
    }
    if (code.length > MAX_CODE_LENGTH) {
      setReviewError(`Code is too large (max ${MAX_CODE_LENGTH.toLocaleString()} characters, currently ${code.length.toLocaleString()}). Please trim it down.`);
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    setReviewResult(null);
    try {
      const res = await api.post('/review/file', { filename, code });
      setReviewResult(res.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Review failed — the AI service may be busy, try again in a moment.';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  const charCount = code.length;
  const isOverLimit = charCount > MAX_CODE_LENGTH;

  return (
    <div>
      <h1 className="page-title">Single-File Review</h1>
      <p className="page-subtitle">Paste code directly, or upload a file — independent of any GitHub PR.</p>

      <div className="input-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'paste'}
          className={`input-tab ${mode === 'paste' ? 'active' : ''}`}
          onClick={() => setMode('paste')}
        >
          Paste Code
        </button>
        <button
          role="tab"
          aria-selected={mode === 'upload'}
          className={`input-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload File
        </button>
      </div>

      <div className="file-review-form">
        <label className="form-label" htmlFor="filename-input">Filename</label>
        <input
          id="filename-input"
          type="text"
          className="text-input"
          placeholder="e.g. utils.js"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />

        {mode === 'paste' ? (
          <>
            <div className="form-row-between">
              <label className="form-label" htmlFor="code-input">Code</label>
              <span className={`char-count ${isOverLimit ? 'char-count-over' : ''}`}>
                {charCount.toLocaleString()} / {MAX_CODE_LENGTH.toLocaleString()} characters
              </span>
            </div>
            <textarea
              id="code-input"
              className="code-textarea"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
            />
          </>
        ) : (
          <>
            <label className="form-label">File</label>
            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current.click(); }}
            >
              <span aria-hidden="true">📄</span> Click to choose a file
              {filename && <div className="upload-filename">{filename}</div>}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rb,.php,.c,.cpp,.cs,.html,.css,.txt"
            />
          </>
        )}

        <button className="btn" onClick={runReview} disabled={reviewLoading || isOverLimit} style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}>
          {reviewLoading && <span className="spinner" aria-hidden="true" />}
          {reviewLoading ? 'Running AI Review...' : 'Run AI Review'}
        </button>
      </div>

      {reviewError && <ErrorBanner message={reviewError} />}

      {reviewResult && (
        <>
          <ScorePanel scores={reviewResult.scores} />
          <FindingsList findings={reviewResult.findings} files={[]} />
        </>
      )}
    </div>
  );
}