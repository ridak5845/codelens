/**
 * Parses a unified diff patch and returns the set of line numbers (in the NEW version
 * of the file) that are actually part of the diff — i.e. valid targets for a GitHub
 * PR review comment. GitHub rejects comments on lines outside the diff's changed hunks.
 */
function getValidCommentLines(patch) {
  const validLines = new Set();
  if (!patch) return validLines;

  const lines = patch.split('\n');
  let newLineNum = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      if (match) newLineNum = parseInt(match[1], 10) - 1;
      continue;
    }
    if (line.startsWith('+') && !line.startsWith('+++')) {
      newLineNum += 1;
      validLines.add(newLineNum);
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      // removed lines don't exist in the new file — not a valid comment target
    } else if (!line.startsWith('\\')) {
      newLineNum += 1;
      validLines.add(newLineNum); // unchanged context lines are still commentable
    }
  }

  return validLines;
}

module.exports = { getValidCommentLines };