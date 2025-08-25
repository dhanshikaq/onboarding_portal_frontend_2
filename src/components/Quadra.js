import React, { useState } from 'react';
import { FaRobot, FaPaperclip, FaDownload } from 'react-icons/fa';
import './Quadra.css';

const Quadra = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Quadra, your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Check for the exact trigger prompt
    if (inputValue === "Create a project Agentic AI Platform with quadrant email id as sahil.d@quadranttechnologies.com , dhanshika.v@quadranttechnologies.com CSA as abc@microsft.com and client with xyz@email.com and qwerty@email.com (POC)") {
      setIsProcessing(true);
      
      // Step 1: "Agentic AI Platform is getting created" (4 seconds)
      const step1Message = {
        id: Date.now() + 1,
        text: "Agentic AI Platform is getting created",
        isBot: true,
        timestamp: new Date(),
        type: 'text',
        isProcessing: true
      };
      
      setMessages(prev => [...prev, step1Message]);
      
      // After 4 seconds, show "Creating the SOW" (5-6 seconds)
      setTimeout(() => {
        const step2Message = {
          id: Date.now() + 2,
          text: "Creating the SOW",
          isBot: true,
          timestamp: new Date(),
          type: 'text',
          isProcessing: true
        };
        
        setMessages(prev => [...prev, step2Message]);
        
        // After 5-6 seconds, show the SOW file
        setTimeout(() => {
          const sowMessage = {
            id: Date.now() + 3,
            text: "Please review and approve this SOW.",
            isBot: true,
            timestamp: new Date(),
            type: 'text'
          };
          
          const fileMessage = {
            id: Date.now() + 4,
            text: "SOW_Agentic_AI_Platform.pdf",
            isBot: true,
            timestamp: new Date(),
            type: 'file',
            fileName: "SOW_Agentic_AI_Platform.pdf",
            fileSize: "150 KB"
          };
          
          setMessages(prev => [...prev, sowMessage, fileMessage]);
          setIsProcessing(false);
        }, 5500); // 5.5 seconds
      }, 4000); // 4 seconds
      
    } else if (inputValue === "approve") {
      // Handle approval
      const approvalMessage = {
        id: Date.now(),
        text: "SOW is sent to client@email.com",
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, approvalMessage]);
    } else {
      // Default response for other messages
      const defaultResponse = {
        id: Date.now(),
        text: "I'm here to help with project creation and SOW management. Please use the specific format to create a project.",
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, defaultResponse]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadSOW = () => {
    // Use the actual PDF file from assets folder
    const pdfUrl = '/src/assets/generated_sow.pdf';
    
    // Create a link to download the PDF
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'SOW_Agentic_AI_Platform.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="quadra-container">
      <div className="quadra-header">
        <div className="quadra-title">
          <FaRobot className="quadra-icon" />
          <span>Quadra</span>
        </div>
        <button className="quadra-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="quadra-messages">
        {messages.map((message) => (
          <div key={message.id} className={`quadra-message ${message.isBot ? 'bot' : 'user'}`}>
            {message.isBot && (
              <div className="quadra-avatar">
                <FaRobot />
              </div>
            )}
            <div className="quadra-message-content">
              {message.type === 'file' ? (
                <div className="quadra-file-message">
                  <div className="quadra-file-info">
                    <FaPaperclip className="file-icon" />
                    <span className="file-name">{message.fileName}</span>
                    <span className="file-size">{message.fileSize}</span>
                  </div>
                  <button className="quadra-download-btn" onClick={downloadSOW}>
                    <FaDownload /> Download SOW
                  </button>
                </div>
              ) : (
                <div className={`quadra-text ${message.isProcessing ? 'processing' : ''}`}>{message.text}</div>
              )}
              <div className="quadra-timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        

      </div>

      <div className="quadra-input-container">
        <textarea
          className="quadra-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isProcessing}
        />
        <button 
          className="quadra-send-btn"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isProcessing}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Quadra;
