import React, { useMemo } from "react";
import CodeBlock from "./CodeBlock";

interface BlogContentProps {
  html: string;
  className?: string;
}

interface ContentNode {
  type: "html" | "code";
  content: string;
  language?: string;
  filename?: string;
}

/**
 * BlogContent component that parses HTML content and renders code blocks
 * with syntax highlighting while preserving the rest of the HTML content.
 */
const BlogContent: React.FC<BlogContentProps> = ({ html, className = "" }) => {
  const contentNodes = useMemo<ContentNode[]>(() => {
    if (!html) return [];

    const nodes: ContentNode[] = [];

    // Parse HTML to find code blocks
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Process all pre elements (with or without code children)
    // Also handle Ghost CMS kg-code-card elements
    const preElements = doc.querySelectorAll(
      "pre, .kg-code-card pre, figure.kg-card pre",
    );

    if (preElements.length === 0) {
      // No code blocks, return HTML as-is
      return [{ type: "html", content: html }];
    }

    // Create a placeholder system to split content
    const placeholders: Map<
      string,
      { language: string; code: string; filename?: string }
    > = new Map();

    preElements.forEach((pre, index) => {
      const code = pre.querySelector("code");
      const placeholder = `___CODE_BLOCK_${index}___`;

      // Get the code content - either from code element or directly from pre
      const codeContent = code ? code.textContent : pre.textContent;

      if (codeContent && codeContent.trim()) {
        // Extract language from multiple possible sources
        const codeClassNames = code?.className || "";
        const preClassNames = pre.className || "";
        const parentClassNames = pre.parentElement?.className || "";
        const allClassNames = `${codeClassNames} ${preClassNames} ${parentClassNames}`;

        // Match language-xxx, lang-xxx, or just xxx after kg-code-card-
        const languageMatch = allClassNames.match(
          /(?:language-|lang-|kg-code-card-)(\w+)/,
        );
        const language = languageMatch
          ? languageMatch[1]
          : detectLanguage(codeContent);

        // Check for filename in data attribute
        const filename =
          pre.getAttribute("data-filename") ||
          code?.getAttribute("data-filename") ||
          pre.parentElement?.getAttribute("data-filename");

        placeholders.set(placeholder, {
          language,
          code: codeContent,
          filename: filename || undefined,
        });

        // Replace pre element (or its parent if it's a kg-code-card) with placeholder
        const elementToReplace =
          pre.closest(".kg-code-card") || pre.closest("figure.kg-card") || pre;
        const placeholderNode = doc.createTextNode(placeholder);
        elementToReplace.parentNode?.replaceChild(
          placeholderNode,
          elementToReplace,
        );
      }
    });

    // Get the modified HTML
    const modifiedHtml = doc.body.innerHTML;

    // Split by placeholders
    const parts = modifiedHtml.split(/(___CODE_BLOCK_\d+___)/);

    parts.forEach((part) => {
      if (part.startsWith("___CODE_BLOCK_")) {
        const codeData = placeholders.get(part);
        if (codeData) {
          nodes.push({
            type: "code",
            content: codeData.code,
            language: codeData.language,
            filename: codeData.filename,
          });
        }
      } else if (part.trim()) {
        nodes.push({
          type: "html",
          content: part,
        });
      }
    });

    return nodes;
  }, [html]);

  return (
    <div className={`blog-article-content ${className}`}>
      {contentNodes.map((node, index) => {
        if (node.type === "code") {
          return (
            <CodeBlock
              key={`code-${index}`}
              code={node.content}
              language={node.language}
              filename={node.filename}
              showLineNumbers={node.content.split("\n").length > 3}
            />
          );
        }

        return (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: node.content }}
          />
        );
      })}
    </div>
  );
};

/**
 * Attempt to detect language from code content
 */
function detectLanguage(code: string): string {
  const trimmed = code.trim();

  // Check for common patterns
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return "html";
  }
  if (trimmed.startsWith("<?php")) {
    return "php";
  }
  if (trimmed.startsWith("#!/bin/bash") || trimmed.startsWith("#!/bin/sh")) {
    return "bash";
  }
  if (
    trimmed.startsWith("#!/usr/bin/env python") ||
    trimmed.startsWith("#!/usr/bin/python")
  ) {
    return "python";
  }

  // Check for import/export statements (JavaScript/TypeScript)
  if (
    /^import\s+.*from\s+['"]/.test(trimmed) ||
    /^export\s+(default\s+)?/.test(trimmed)
  ) {
    // Check for TypeScript indicators
    if (
      /:\s*(string|number|boolean|any|void|never|unknown|object)\b/.test(
        trimmed,
      ) ||
      /<[A-Z]\w*>/.test(trimmed) ||
      /interface\s+\w+/.test(trimmed) ||
      /type\s+\w+\s*=/.test(trimmed)
    ) {
      return "typescript";
    }
    return "javascript";
  }

  // Check for React/JSX
  if (/<[A-Z][a-zA-Z]*[\s/>]/.test(trimmed) || /className=/.test(trimmed)) {
    if (/:\s*(React\.|FC|Props|string|number|boolean)/.test(trimmed)) {
      return "tsx";
    }
    return "jsx";
  }

  // Check for function declarations
  if (
    /^(async\s+)?function\s+\w+/.test(trimmed) ||
    /^const\s+\w+\s*=\s*(async\s+)?\(/.test(trimmed)
  ) {
    return "javascript";
  }

  // Check for Python
  if (
    /^(def|class|import|from)\s+/.test(trimmed) ||
    /:\s*$/.test(trimmed.split("\n")[0])
  ) {
    return "python";
  }

  // Check for CSS
  if (/^[.#@]?\w+[\s{]/.test(trimmed) && /{\s*[\w-]+\s*:/.test(trimmed)) {
    return "css";
  }

  // Check for JSON
  if (/^\s*[{[]/.test(trimmed) && /[}\]]\s*$/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON
    }
  }

  // Check for YAML
  if (/^\w+:\s*(\n|$)/.test(trimmed) || /^-\s+\w+/.test(trimmed)) {
    return "yaml";
  }

  // Check for SQL
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i.test(trimmed)) {
    return "sql";
  }

  // Check for shell commands
  if (
    /^\$\s+/.test(trimmed) ||
    /^npm\s+/.test(trimmed) ||
    /^git\s+/.test(trimmed)
  ) {
    return "bash";
  }

  // Check for Markdown
  if (
    /^#+\s+/.test(trimmed) ||
    /^\*\*\w+\*\*/.test(trimmed) ||
    /^\[.+\]\(.+\)/.test(trimmed)
  ) {
    return "markdown";
  }

  // Check for Go
  if (/^package\s+\w+/.test(trimmed) || /^func\s+/.test(trimmed)) {
    return "go";
  }

  // Check for Rust
  if (
    /^(fn|pub|use|mod|impl|struct|enum)\s+/.test(trimmed) ||
    /let\s+mut\s+/.test(trimmed)
  ) {
    return "rust";
  }

  // Check for Ruby
  if (
    /^(require|gem|class|module|def|end)\b/.test(trimmed) ||
    /do\s*\|/.test(trimmed)
  ) {
    return "ruby";
  }

  // Check for Java/Kotlin
  if (
    /^(public|private|protected)\s+(static\s+)?(class|void|int|String)/.test(
      trimmed,
    )
  ) {
    return "java";
  }

  // Check for C/C++
  if (/^#include\s+[<"]/.test(trimmed) || /^int\s+main\s*\(/.test(trimmed)) {
    return "cpp";
  }

  // Default to plaintext
  return "text";
}

export default BlogContent;
