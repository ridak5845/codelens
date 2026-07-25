export function getCodeExcerpt(patch, targetLine, contextLines = 1) {
  if (!patch || !targetLine) return null;

  const lines = patch.split('\n');
  let newLineNum = 0;
  const numberedLines = [];

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      if (match) newLineNum = parseInt(match[1], 10) - 1;
      continue;
    }
    if (line.startsWith('+') && !line.startsWith('+++')) {
      newLineNum += 1;
      numberedLines.push({ lineNumber: newLineNum, text: line.slice(1), type: 'added' });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      numberedLines.push({ lineNumber: null, text: line.slice(1), type: 'removed' });
    } else if (!line.startsWith('\\')) {
      newLineNum += 1;
      numberedLines.push({ lineNumber: newLineNum, text: line.slice(1) || line, type: 'context' });
    }
  }

  const withNumbers = numberedLines.filter((l) => l.lineNumber !== null);
  const centerIndex = withNumbers.findIndex((l) => l.lineNumber === targetLine);
  if (centerIndex === -1) return null;

  const start = Math.max(0, centerIndex - contextLines);
  const end = Math.min(withNumbers.length, centerIndex + contextLines + 1);
  return withNumbers.slice(start, end);
}