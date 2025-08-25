import React from 'react';
import { FaTimes, FaDownload, FaExpand } from 'react-icons/fa';
import './DocumentPreviewer.css';

const DocumentPreviewer = ({ file, onClose, onDownload }) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="document-previewer-overlay" onClick={onClose}>
      <div className="document-previewer" onClick={(e) => e.stopPropagation()}>
        <div className="document-previewer-header">
          <div className="document-info">
            <div className="document-name">{file.fileName}</div>
            <div className="document-size">{file.fileSize}</div>
          </div>
          <div className="document-actions">
            <button className="action-btn" onClick={handleDownload} title="Download">
              <FaDownload />
            </button>
            <button className="action-btn expand-btn" title="Expand">
              <FaExpand />
            </button>
            <button className="action-btn close-btn" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="document-previewer-content">
          <iframe
            src={`/generated_sow.pdf`}
            title={file.fileName}
            className="pdf-iframe"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewer;
