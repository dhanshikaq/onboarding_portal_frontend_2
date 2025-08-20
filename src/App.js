import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // Simulate successful login and show chat
    setShowChat(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        isBot: false,
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "I understand you said: " + inputMessage + ". This is a demo response. In a real application, this would be processed by an LLM model.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  if (showChat) {
    return (
      <div className="chat-app">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="logo-section">
              <div className="logo-icon">AI</div>
              <span className="logo-text">Chat</span>
            </div>
          </div>
          <div className="sidebar-menu">
            <div className="menu-item">
              <span className="menu-icon">+</span>
              <span>New Chat</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon">S</span>
              <span>Search</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon">P</span>
              <span>Profile</span>
            </div>
          </div>
          <div className="user-profile">
            <div className="user-avatar">D</div>
          </div>
        </div>
        
        <div className="chat-main">
          <div className="chat-header">
            <button className="upgrade-button">
              <span className="diamond-icon">★</span>
              Upgrade your plan
            </button>
            <div className="header-actions">
              <button className="settings-button">⚙</button>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                <div className="message-avatar">
                  {message.isBot ? 'AI' : 'U'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <div className="input-actions">
                <button type="button" className="action-button">+</button>
                <button type="button" className="action-button">W</button>
                <button type="button" className="action-button">A</button>
              </div>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Write your prompt here..."
                className="chat-input"
              />
              <button type="submit" className="send-button">
                →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="login-container">
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" className="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="signup-section">
            <p className="signup-text">
              Don't have an account? <a href="#" className="signup-link">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
