import React, { useState } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";

// Custom theme that works with both light and dark modes
const customTheme: PrismTheme = {
  plain: {
    color: "var(--prism-foreground, #d6deeb)",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "var(--prism-comment, #637777)",
        fontStyle: "italic",
      },
    },
    {
      types: ["punctuation"],
      style: {
        color: "var(--prism-punctuation, #c792ea)",
      },
    },
    {
      types: [
        "property",
        "tag",
        "boolean",
        "number",
        "constant",
        "symbol",
        "deleted",
      ],
      style: {
        color: "var(--prism-property, #f78c6c)",
      },
    },
    {
      types: ["selector", "attr-name", "string", "char", "builtin", "inserted"],
      style: {
        color: "var(--prism-string, #addb67)",
      },
    },
    {
      types: ["operator", "entity", "url"],
      style: {
        color: "var(--prism-operator, #89ddff)",
      },
    },
    {
      types: ["atrule", "attr-value", "keyword"],
      style: {
        color: "var(--prism-keyword, #c792ea)",
      },
    },
    {
      types: ["function", "class-name"],
      style: {
        color: "var(--prism-function, #82aaff)",
      },
    },
    {
      types: ["regex", "important", "variable"],
      style: {
        color: "var(--prism-variable, #d6deeb)",
      },
    },
  ],
};

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Normalize language name
  const normalizeLanguage = (lang: string): string => {
    const langMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      tsx: "tsx",
      jsx: "jsx",
      py: "python",
      rb: "ruby",
      sh: "bash",
      shell: "bash",
      yml: "yaml",
      md: "markdown",
      html: "markup",
      xml: "markup",
      svg: "markup",
    };
    return langMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  const normalizedLanguage = normalizeLanguage(language);

  return (
    <div className="code-block-wrapper my-8 border-2 border-base-content/20 bg-base-300 overflow-hidden">
      {/* Header */}
      <div className="code-block-header flex items-center justify-between px-4 py-2 bg-base-content border-b border-base-content/20">
        <div className="flex items-center gap-3">
          {/* Language badge */}
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-base-100 font-semibold">
            {language || "code"}
          </span>
          {/* Filename */}
          {filename && (
            <>
              <span className="text-base-100/30">|</span>
              <span className="font-mono text-[0.65rem] text-base-100/70">
                {filename}
              </span>
            </>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-base-100/70 hover:text-base-100 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <Highlight
        theme={customTheme}
        code={code.trim()}
        language={normalizedLanguage as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-x-auto p-4 m-0 text-sm leading-relaxed`}
            style={{ ...style, background: "transparent" }}
          >
            <code className="font-mono">
              {tokens.map((line, lineIndex) => {
                const lineProps = getLineProps({ line, key: lineIndex });
                return (
                  <div
                    key={lineIndex}
                    {...lineProps}
                    className={`${lineProps.className || ""} table-row`}
                  >
                    {showLineNumbers && (
                      <span className="table-cell pr-4 text-right select-none text-base-content/30 font-mono text-xs w-8">
                        {lineIndex + 1}
                      </span>
                    )}
                    <span className="table-cell">
                      {line.map((token, tokenIndex) => (
                        <span key={tokenIndex} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
