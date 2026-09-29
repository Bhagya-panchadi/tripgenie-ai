import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines while preserving markdown structure
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="space-y-2 my-2.5 ml-1 text-slate-200">
          {listItems}
        </ul>
      );
      inList = false;
      listItems = [];
    }
  };

  const flushTable = (keyPrefix: string) => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div key={`${keyPrefix}-table`} className="my-4 overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/60 shadow-md">
          <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-teal-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {tableHeader.map((th, idx) => (
                  <th key={idx} className="px-4 py-3 border-b border-slate-700/80">
                    {parseInlineMarkdown(th.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-slate-300">
                      {parseInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Markdown Table handling
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList(`pre-table-${i}`);
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's a delimiter row: |---|---|:--:|
      const isDelimiter = cells.every((c) => /^:?-+:?$/.test(c));

      if (isDelimiter) {
        // Delimiter row confirms table header
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable(`post-table-${i}`);
    }

    // Empty lines
    if (!line) {
      flushList(`empty-${i}`);
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^([-*_]){3,}$/.test(line)) {
      flushList(`hr-${i}`);
      elements.push(
        <hr key={`hr-${i}`} className="my-5 border-t border-slate-800" />
      );
      continue;
    }

    // Headings (h4, h3, h2, h1)
    if (line.startsWith('#### ')) {
      flushList(`h4-${i}`);
      elements.push(
        <h5 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-sky-300 mt-3.5 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
          {parseInlineMarkdown(line.replace(/^####\s+/, ''))}
        </h5>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList(`h3-${i}`);
      elements.push(
        <h4 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-teal-300 mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
          {parseInlineMarkdown(line.replace(/^###\s+/, ''))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList(`h2-${i}`);
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-white mt-5 mb-2.5 pb-1 border-b border-slate-800">
          {parseInlineMarkdown(line.replace(/^##\s+/, ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      flushList(`h1-${i}`);
      elements.push(
        <h2 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 font-display">
          {parseInlineMarkdown(line.replace(/^#\s+/, ''))}
        </h2>
      );
      continue;
    }

    // Bullet points (-, *, •)
    if (/^[-*•]\s+/.test(line)) {
      inList = true;
      const bulletContent = line.replace(/^[-*•]\s+/, '');
      listItems.push(
        <li key={`li-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
          <div className="flex-1">{parseInlineMarkdown(bulletContent)}</div>
        </li>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      flushList(`num-${i}`);
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={`num-item-${i}`} className="flex items-start gap-3 my-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="w-5 h-5 rounded-md bg-teal-950 border border-teal-800 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1">{parseInlineMarkdown(numMatch[2])}</div>
          </div>
        );
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`quote-${i}`);
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-teal-500 bg-teal-950/30 px-4 py-2.5 my-3 rounded-r-xl text-xs sm:text-sm text-teal-200 italic">
          {parseInlineMarkdown(line.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Standard paragraph
    flushList(`p-${i}`);
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-2">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  flushList('final');
  flushTable('final');

  return <div className={`space-y-1 font-sans ${className}`}>{elements}</div>;
};

// Helper function to parse inline bold (**text**), italic (*text*), inline code (`code`), and currency symbols
export function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  // Split tokens for bold (**), code (`), and italic (*)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  // Regular expression to identify **bold**, `code`, and *italic*
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const segments = remaining.split(pattern);

  for (const seg of segments) {
    if (!seg) continue;

    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      parts.push(
        <strong key={keyIdx++} className="font-bold text-white tracking-wide">
          {seg.slice(2, -2)}
        </strong>
      );
    } else if (seg.startsWith('`') && seg.endsWith('`') && seg.length >= 2) {
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-teal-300 font-medium">
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('*') && seg.endsWith('*') && seg.length >= 2) {
      parts.push(
        <em key={keyIdx++} className="italic text-slate-200">
          {seg.slice(1, -1)}
        </em>
      );
    } else {
      // Highlight currency amounts like ₹45,000 or INR 50,000 smoothly
      const formattedSeg = highlightCurrency(seg, keyIdx);
      parts.push(formattedSeg);
      keyIdx += 10;
    }
  }

  return parts;
}

function highlightCurrency(text: string, baseKey: number): React.ReactNode {
  const currencyRegex = /(₹\s?[\d,]+(?:\.\d+)?|INR\s?[\d,]+(?:\.\d+)?)/g;
  if (!currencyRegex.test(text)) {
    return text;
  }

  const chunks = text.split(currencyRegex);
  return chunks.map((chunk, idx) => {
    if (currencyRegex.test(chunk)) {
      return (
        <span key={`${baseKey}-curr-${idx}`} className="text-amber-400 font-semibold font-mono">
          {chunk}
        </span>
      );
    }
    return chunk;
  });
}
