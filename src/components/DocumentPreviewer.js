import React from 'react';
import { FaTimes, FaDownload, FaExpand } from 'react-icons/fa';
import './DocumentPreviewer.css';

const DocumentPreviewer = ({ file, onClose, onDownload, documentUrl }) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  // Determine the document URL to use
  const getDocumentUrl = () => {
    console.log('DocumentPreviewer - documentUrl prop:', documentUrl);
    console.log('DocumentPreviewer - file object:', file);
    
    // If documentUrl is provided (from backend API), use it
    if (documentUrl) {
      console.log('Using documentUrl prop:', documentUrl);
      return documentUrl;
    }
    
    // If file has a status_id, construct the backend serve endpoint
    if (file?.status_id) {
      const constructedUrl = `http://localhost:8000/api/status/documents/serve/${file.status_id}/`;
      console.log('Using constructed URL from status_id:', constructedUrl);
      return constructedUrl;
    }
    
    // If file has a direct URL, use it
    if (file?.url) {
      console.log('Using file.url:', file.url);
      return file.url;
    }
    
    // Fallback to hardcoded PDF (for backward compatibility)
    console.log('Using fallback hardcoded PDF');
    return '/generated_sow.pdf';
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
             src={getDocumentUrl()}
             title={file.fileName}
             className="pdf-iframe"
             width="100%"
             height="100%"
             onLoad={() => {
               console.log('Iframe loaded successfully with URL:', getDocumentUrl());
             }}
             onError={(e) => {
               console.error('Iframe load error:', e);
               console.error('Failed to load URL:', getDocumentUrl());
             }}
           />
         </div>
      </div>
    </div>
  );
};

export default DocumentPreviewer;
