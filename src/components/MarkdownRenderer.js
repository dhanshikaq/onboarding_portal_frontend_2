import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ text, className = '' }) => {
  if (!text) return null;

  // Preprocess text to convert bullet characters to proper markdown
  const preprocessText = (text) => {
    // Convert bullet characters (•) to markdown list items
    // This handles cases where the backend sends bullet characters instead of proper markdown
    return text.replace(/^[•]\s*/gm, '- ');
  };

  const processedText = preprocessText(text);

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          // Custom styling for different elements
          p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
          strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ordered-list">{children}</ol>,
          li: ({ children }) => <li className="markdown-list-item">{children}</li>,
          h1: ({ children }) => <h1 className="markdown-heading markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-heading markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-heading markdown-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="markdown-heading markdown-h4">{children}</h4>,
          h5: ({ children }) => <h5 className="markdown-heading markdown-h5">{children}</h5>,
          h6: ({ children }) => <h6 className="markdown-heading markdown-h6">{children}</h6>,
          code: ({ children }) => <code className="markdown-code">{children}</code>,
          pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
          em: ({ children }) => <em className="markdown-italic">{children}</em>,
        }}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
