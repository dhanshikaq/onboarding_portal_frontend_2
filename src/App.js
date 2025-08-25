import React, { useState } from 'react';
import { 
  FaPlusCircle,
  FaArchive,
  FaHistory,
  FaSearch, 
  FaEllipsisH, 
  FaPaperclip, 
  FaLink, 
  FaImage, 
  FaMicrophone, 
  FaCamera, 
  FaPaperPlane, 
  FaSignOutAlt, 
  FaClipboardList, 
  FaFolder, 
  FaChartBar, 
  FaFolderOpen, 
  FaMapMarkerAlt, 
  FaCameraRetro,
  FaCog,
  FaArrowLeft,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaChevronDown,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaUsers,
  FaProjectDiagram,
  FaCalendarCheck,
  FaFileContract,
  FaHandshake,
  FaCode,
  FaRocket,
  FaCheckDouble,
  FaCircle,
  FaTrash,
  FaRobot
} from 'react-icons/fa';
import './App.css';
import DocumentPreviewer from './components/DocumentPreviewer';
import ApiService from './services/api';


function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showChat, setShowChat] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    
    if (isLoggedIn === 'true' && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setShowChat(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      }
    }
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showDocumentPreviewer, setShowDocumentPreviewer] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    company: '',
    companyIndustry: '',
    projectName: '',
    startDate: '',
    endDate: '',
    projectDomain: '',
    csaMembers: [],
    quadrantTeam: [],
    clientMembers: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  // Chat management state
  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Acme Corp - Cloud Migration',
      preview: 'Phase 2: Migration planning',
      avatar: 'A',
      messages: [
        { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
      ],
      isActive: true,
      unreadCount: 0
    },
    {
      id: 2,
      name: 'Globex Inc - Kubernetes Modernization',
      preview: 'POC ready for review',
      avatar: 'G',
      messages: [
        { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
      ],
      isActive: false,
      unreadCount: 2
    },
    {
      id: 3,
      name: 'Nimbus Partners - Multi-Cloud Strategy',
      preview: 'Draft architecture shared',
      avatar: 'N',
      messages: [
        { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
      ],
      isActive: false,
      unreadCount: 1
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStates, setConversationStates] = useState({});

  const handleLogout = async () => {
    try {
      // Call logout API if available
      await ApiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }
    
    // Clear local storage and state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setUser(null);
    setShowChat(false);
    setFormData({ email: '', password: '' });
    setLoginError('');
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get current chat data
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  // Sample companies for the dropdown
  const companies = [
    { name: 'TechCorp Inc', industry: 'Technology' },
    { name: 'StartupXYZ', industry: 'Healthcare' },
    { name: 'Global Solutions Ltd', industry: 'Consulting' },
    { name: 'Tech Solutions Inc', industry: 'Technology' },
    { name: 'Innovation Corp', industry: 'Finance' },
    { name: 'Digital Dynamics', industry: 'Marketing' }
  ];

  // Sample projects data
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Web Development project for New Tech Corp',
      status: 'In Progress',
      projectId: 'PROJ-005',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      domain: 'Web Development',
      company: 'New Tech Corp',
      csaMembers: [
        { id: 1, name: 'Anirudh Venkataraman', role: 'CSA Lead', email: 'anirudh@quadrant.com', avatar: 'AV' },
        { id: 2, name: 'Dhanshika Vijayaraj', role: 'CSA Associate', email: 'dhanshika@quadrant.com', avatar: 'DV' }
      ],
      quadrantTeam: [
        { id: 3, name: 'Alex Johnson', role: 'Project Manager', email: 'alex@quadrant.com', avatar: 'AJ' },
        { id: 4, name: 'Sarah Chen', role: 'Senior Developer', email: 'sarah@quadrant.com', avatar: 'SC' },
        { id: 5, name: 'Mike Rodriguez', role: 'UI/UX Designer', email: 'mike@quadrant.com', avatar: 'MR' }
      ],
      clientMembers: [
        { id: 6, name: 'David Kim', role: 'CTO', email: 'david@newtechcorp.com', avatar: 'DK' },
        { id: 7, name: 'Lisa Wang', role: 'Product Manager', email: 'lisa@newtechcorp.com', avatar: 'LW' }
      ],
      timeline: [
        {
          id: 1,
          phase: 'Discovery Call',
          status: 'completed',
          documents: [
            { id: 1, name: 'Discovery Call Notes.pdf', type: 'pdf', size: '2.3 MB', uploadedBy: 'Anirudh Venkataraman', uploadedAt: '2024-01-15' },
            { id: 2, name: 'Requirements Document.docx', type: 'docx', size: '1.8 MB', uploadedBy: 'David Kim', uploadedAt: '2024-01-16' }
          ]
        },
        {
          id: 2,
          phase: 'Project Planning',
          status: 'in-progress',
          documents: [
            { id: 3, name: 'Project Plan.pdf', type: 'pdf', size: '3.1 MB', uploadedBy: 'Alex Johnson', uploadedAt: '2024-01-20' },
            { id: 4, name: 'Timeline.xlsx', type: 'xlsx', size: '0.9 MB', uploadedBy: 'Sarah Chen', uploadedAt: '2024-01-21' }
          ]
        },
        {
          id: 3,
          phase: 'Design Phase',
          status: 'pending',
          documents: []
        },
        {
          id: 4,
          phase: 'Development',
          status: 'pending',
          documents: []
        },
        {
          id: 5,
          phase: 'Testing & QA',
          status: 'pending',
          documents: []
        },
        {
          id: 6,
          phase: 'Deployment',
          status: 'pending',
          documents: []
        }
      ]
    },
    {
      id: 2,
      title: 'E-commerce Platform',
      description: 'Web Development project for New Amazonian corps',
      status: 'In Progress',
      projectId: 'PROJ-006',
      startDate: '2024-02-01',
      endDate: '2024-07-01',
      domain: 'Web Development',
      company: 'New Amazonian corps',
      csaMembers: [
        { id: 8, name: 'Anirudh Venkataraman', role: 'CSA Lead', email: 'anirudh@quadrant.com', avatar: 'AV' }
      ],
      quadrantTeam: [
        { id: 9, name: 'Tom Wilson', role: 'Project Manager', email: 'tom@quadrant.com', avatar: 'TW' }
      ],
      clientMembers: [
        { id: 10, name: 'Emma Thompson', role: 'CEO', email: 'emma@amazonian.com', avatar: 'ET' }
      ],
      timeline: [
        {
          id: 1,
          phase: 'Discovery Call',
          status: 'completed',
          documents: []
        },
        {
          id: 2,
          phase: 'Project Planning',
          status: 'in-progress',
          documents: []
        }
      ]
    },
    {
      id: 3,
      title: 'Full-Stack E-commerce Platform',
      description: 'E-commerce & Web Development project for Comprehensive Tech Solutions',
      status: 'In Progress',
      projectId: 'PROJ-007',
      startDate: '2024-01-20',
      endDate: '2024-08-20',
      domain: 'E-commerce & Web Development',
      company: 'Comprehensive Tech Solutions',
      csaMembers: [
        { id: 11, name: 'Dhanshika Vijayaraj', role: 'CSA Associate', email: 'dhanshika@quadrant.com', avatar: 'DV' }
      ],
      quadrantTeam: [
        { id: 12, name: 'Chris Lee', role: 'Project Manager', email: 'chris@quadrant.com', avatar: 'CL' }
      ],
      clientMembers: [
        { id: 13, name: 'Rachel Green', role: 'CTO', email: 'rachel@comprehensive.com', avatar: 'RG' }
      ],
      timeline: [
        {
          id: 1,
          phase: 'Discovery Call',
          status: 'completed',
          documents: []
        },
        {
          id: 2,
          phase: 'Project Planning',
          status: 'pending',
          documents: []
        }
      ]
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOnboardingChange = (e) => {
    const { name, value } = e.target;
    setOnboardingData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCompanySelect = (company) => {
    setOnboardingData(prevState => ({
      ...prevState,
      company: company.name,
      companyIndustry: company.industry
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1 && !onboardingData.company) {
      errors.company = 'Please select a company';
    }
    
    if (step === 2) {
      if (!onboardingData.projectName) {
        errors.projectName = 'Project name is required';
      }
      if (!onboardingData.startDate) {
        errors.startDate = 'Start date is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(onboardingStep) && onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
      setValidationErrors({});
    }
  };

  const handlePrevStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
      setValidationErrors({});
    }
  };

  const handleCloseOnboarding = () => {
    setShowNewProjectForm(false);
    setOnboardingStep(1);
    setValidationErrors({});
    setOnboardingData({
      company: '',
      companyIndustry: '',
      projectName: '',
      startDate: '',
      endDate: '',
      projectDomain: '',
      csaMembers: [],
      quadrantTeam: [],
      clientMembers: []
    });
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    console.log('Client onboarding completed:', onboardingData);
    handleCloseOnboarding();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      const data = await ApiService.login(formData.email, formData.password);
      
      console.log('Login successful:', data);
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      // Set user state and show chat interface
      setUser(data.user);
      setShowChat(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Chat management functions
  const createNewChat = () => {
    const newChatId = Math.max(...chats.map(chat => chat.id)) + 1;
    const newChat = {
      id: newChatId,
      name: `Project Chat ${newChatId}`,
      preview: 'Start a new conversation',
      avatar: String.fromCharCode(65 + (newChatId - 1) % 26), // A, B, C, etc.
      messages: [
        { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
      ],
      isActive: false,
      unreadCount: 0
    };
    
    // Deactivate all other chats
    const updatedChats = chats.map(chat => ({ ...chat, isActive: false }));
    updatedChats.push(newChat);
    
    // Initialize conversation state for new chat
    setConversationStates(prev => ({
      ...prev,
      [newChatId]: {}
    }));
    
    setChats(updatedChats);
    setCurrentChatId(newChatId);
    setInputMessage('');
  };

  const renameChat = (chatId, newName) => {
    if (newName.trim()) {
      const updatedChats = chats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, name: newName.trim() };
        }
        return chat;
      });
      setChats(updatedChats);
    }
  };

  const switchChat = (chatId) => {
    // Deactivate all chats and activate the selected one, clear unread count
    const updatedChats = chats.map(chat => ({
      ...chat,
      isActive: chat.id === chatId,
      unreadCount: chat.id === chatId ? 0 : chat.unreadCount
    }));
    
    setChats(updatedChats);
    setCurrentChatId(chatId);
    setInputMessage('');
  };

  const deleteChat = (chatId) => {
    if (chats.length <= 1) {
      alert('Cannot delete the last chat. At least one chat must remain.');
      return;
    }
    
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    // If we're deleting the current chat, switch to the first available chat
    if (chatId === currentChatId) {
      setCurrentChatId(updatedChats[0].id);
      updatedChats[0].isActive = true;
    }
    
    setChats(updatedChats);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && currentChat && user) {
      const newMessage = {
        id: currentChat.messages.length + 1,
        text: inputMessage,
        isBot: false,
        timestamp: new Date()
      };
      
      // Check if this is the Quadra trigger prompt (with and without space before POC)
      const quadraTriggerPrompt1 = "Create a project Agentic AI Platform with quadrant email id as sahil.d@quadranttechnologies.com , dhanshika.v@quadranttechnologies.com CSA as abc@microsft.com and client with xyz@email.com and qwerty@email.com (POC)";
      const quadraTriggerPrompt2 = "Create a project Agentic AI Platform with quadrant email id as sahil.d@quadranttechnologies.com , dhanshika.v@quadranttechnologies.com CSA as abc@microsft.com and client with xyz@email.com and qwerty@email.com(POC)";
      
      if (inputMessage === quadraTriggerPrompt1 || inputMessage === quadraTriggerPrompt2) {
        console.log("Quadra trigger detected! Starting SOW flow and project creation...");
        // This is the Quadra prompt - implement the flow directly in main chat
        
        // Create project in the portal
        const newProject = createProjectFromQuadraPrompt(inputMessage);
        
        // Add user message to chat
        const updatedChats = chats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              preview: inputMessage.length > 50 ? inputMessage.substring(0, 50) + '...' : inputMessage
            };
          }
          return chat;
        });
        
        setChats(updatedChats);
        setInputMessage('');
        
        // Step 1: "Agentic AI Platform is getting created" (4 seconds)
        setTimeout(() => {
          console.log("Step 1: Agentic AI Platform is getting created");
          setChats(prevChats => {
            const step1Message = {
              id: Date.now() + 1,
              text: "Agentic AI Platform is getting created",
              isBot: true,
              timestamp: new Date(),
              isProcessing: true
            };
            
            return prevChats.map(chat => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: [...chat.messages, step1Message]
                };
              }
              return chat;
            });
          });
          
          // Step 2: "Creating the SOW" (5.5 seconds)
          setTimeout(() => {
            console.log("Step 2: Creating the SOW");
            setChats(prevChats => {
              const step2Message = {
                id: Date.now() + 2,
                text: "Creating the SOW",
                isBot: true,
                timestamp: new Date(),
                isProcessing: true
              };
              
              return prevChats.map(chat => {
                if (chat.id === currentChatId) {
                  return {
                    ...chat,
                    messages: [...chat.messages, step2Message]
                  };
                }
                return chat;
              });
            });
            
            // Step 3: Show SOW file and approval request
            setTimeout(() => {
              console.log("Step 3: Showing SOW file and approval request");
              setChats(prevChats => {
                const sowMessage = {
                  id: Date.now() + 3,
                  text: "Please review and approve this SOW.",
                  isBot: true,
                  timestamp: new Date()
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
                
                return prevChats.map(chat => {
                  if (chat.id === currentChatId) {
                    return {
                      ...chat,
                      messages: [...chat.messages, sowMessage, fileMessage]
                    };
                  }
                  return chat;
                });
              });
            }, 5500); // 5.5 seconds
          }, 4000); // 4 seconds
        }, 100); // Small delay to ensure user message is added first
        
        return;
      }
      
      // Check if this is the approval message
      if (inputMessage === "approve") {
        // Add user message to chat
        const updatedChats = chats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              preview: inputMessage.length > 50 ? inputMessage.substring(0, 50) + '...' : inputMessage
            };
          }
          return chat;
        });
        
        setChats(updatedChats);
        setInputMessage('');
        
        // Show typing indicator
        setIsTyping(true);
        
        // Simulate bot response for approval
        setTimeout(() => {
          const botResponse = {
            id: currentChat.messages.length + 2,
            text: "SOW is sent to client@email.com",
            isBot: true,
            timestamp: new Date()
          };
          
          const updatedChatsWithResponse = chats.map(chat => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage, botResponse]
              };
            } else {
              // Increment unread count for other chats
              return {
                ...chat,
                unreadCount: chat.unreadCount + 1
              };
            }
          });
          
          setChats(updatedChatsWithResponse);
          setIsTyping(false);
        }, 1000);
        
        return;
      }
      
      // Add user message to chat
      const updatedChats = chats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            preview: inputMessage.length > 50 ? inputMessage.substring(0, 50) + '...' : inputMessage
          };
        }
        return chat;
      });
      
      setChats(updatedChats);
      setInputMessage('');
      
      // Show typing indicator
      setIsTyping(true);
      
      try {
        // Get current conversation state for this chat
        const currentConversationState = conversationStates[currentChatId] || {};
        
        // Call the chatbot API
        const response = await ApiService.sendChatMessage(
          user.user_id,
          user.tag || 'client',
          inputMessage,
          currentConversationState
        );
        
        // Update conversation state
        setConversationStates(prev => ({
          ...prev,
          [currentChatId]: response.conversation_state || {}
        }));
        
        // Create bot response
        const botResponse = {
          id: currentChat.messages.length + 2,
          text: response.response,
          isBot: true,
          timestamp: new Date()
        };
        
        // Update chats with bot response
        const updatedChatsWithResponse = chats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage, botResponse]
            };
          } else {
            // Increment unread count for other chats
            return {
              ...chat,
              unreadCount: chat.unreadCount + 1
            };
          }
        });
        
        setChats(updatedChatsWithResponse);
        
      } catch (error) {
        console.error('Chatbot API error:', error);
        
        // Fallback response on error
        const errorResponse = {
          id: currentChat.messages.length + 2,
          text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          isBot: true,
          timestamp: new Date()
        };
        
        const updatedChatsWithError = chats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage, errorResponse]
            };
          } else {
            return {
              ...chat,
              unreadCount: chat.unreadCount + 1
            };
          }
        });
        
        setChats(updatedChatsWithError);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const downloadSOW = () => {
    // Use the actual PDF file from public folder
    const pdfUrl = '/generated_sow.pdf';
    
    // Create a link to download the PDF
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'SOW_Agentic_AI_Platform.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const createProjectFromQuadraPrompt = (promptText) => {
    // Extract project details from the Quadra prompt
    const projectName = "Agentic AI Platform";
    const company = "Client Company"; // Default company name
    const domain = "AI Platform Development";
    
    // Extract email addresses from the prompt
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = promptText.match(emailRegex) || [];
    
    // Parse the emails into different categories
    const quadrantEmails = emails.filter(email => email.includes('quadranttechnologies.com'));
    const csaEmails = emails.filter(email => email.includes('microsft.com'));
    const clientEmails = emails.filter(email => !email.includes('quadranttechnologies.com') && !email.includes('microsft.com'));
    
    // Create team members from emails
    const createTeamMember = (email, role, teamType) => ({
      id: Date.now() + Math.random(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: role,
      email: email,
      avatar: email.split('@')[0].substring(0, 2).toUpperCase()
    });
    
    const csaMembers = csaEmails.map(email => createTeamMember(email, 'CSA Member', 'csa'));
    const quadrantTeam = quadrantEmails.map(email => createTeamMember(email, 'Quadrant Team Member', 'quadrant'));
    const clientMembers = clientEmails.map(email => createTeamMember(email, 'Client Member', 'client'));
    
    // Create new project object
    const newProject = {
      id: Date.now(),
      title: projectName,
      description: `${projectName} project for ${company}`,
      status: 'New',
      projectId: `PROJ-${String(Date.now()).slice(-6)}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
      domain: domain,
      company: company,
      csaMembers: csaMembers,
      quadrantTeam: quadrantTeam,
      clientMembers: clientMembers,
      timeline: [
        {
          id: 1,
          phase: 'Project Initiation',
          status: 'completed',
          documents: [
            { 
              id: 1, 
              name: 'SOW_Agentic_AI_Platform.pdf', 
              type: 'pdf', 
              size: '150 KB', 
              uploadedBy: 'Quadra AI', 
              uploadedAt: new Date().toISOString().split('T')[0] 
            }
          ]
        },
        {
          id: 2,
          phase: 'Requirements Gathering',
          status: 'pending',
          documents: []
        },
        {
          id: 3,
          phase: 'Design & Architecture',
          status: 'pending',
          documents: []
        },
        {
          id: 4,
          phase: 'Development',
          status: 'pending',
          documents: []
        },
        {
          id: 5,
          phase: 'Testing & QA',
          status: 'pending',
          documents: []
        },
        {
          id: 6,
          phase: 'Deployment',
          status: 'pending',
          documents: []
        }
      ]
    };
    
    // Add the new project to the projects list
    setProjects(prevProjects => [newProject, ...prevProjects]);
    
    // Set this as the selected project
    setSelectedProject(newProject);
    
    // Show success message
    console.log('Project created successfully:', newProject);
    
    return newProject;
  };

  const handleNewProjectSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectData = {
      name: formData.get('projectName'),
      client: formData.get('clientName'),
      type: formData.get('projectType'),
      description: formData.get('projectDescription'),
      startDate: formData.get('startDate'),
      duration: formData.get('estimatedDuration')
    };
    
    console.log('New project created:', projectData);
    // Here you would typically send this data to your backend
    // For now, we'll just close the modal
    setShowNewProjectForm(false);
    
    // Reset the form
    e.target.reset();
  };

  if (showChat) {
    return (
      <div className="chat-app">
        {/* Left Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="logo-section">
              <img 
                src={process.env.PUBLIC_URL + '/quadrant-logo.png'} 
                alt="Company Logo" 
                className="company-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="logo-text">Quadra</span>
            </div>
            <div className="chat-counter">
              {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
            </div>
          </div>
          
          <div className="sidebar-menu">
            <div className="menu-item new-chat" onClick={createNewChat}>
              <span className="menu-icon"><FaPlusCircle /></span>
              <span>New chat</span>
            </div>

            <div className="menu-item">
              <span className="menu-icon"><FaArchive /></span>
              <span>Save chat to archived chats</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon"><FaHistory /></span>
              <span>Open all previous chats</span>
            </div>
          </div>
          
          <div className="search-section">
            <div className="search-container">
              <span className="search-icon"><FaSearch /></span>
              <input type="text" placeholder="Search chats..." className="search-input" />
            </div>
          </div>
          
          <div className="chat-list">
            {chats.map((chat) => (
              <div 
                key={chat.id}
                className={`chat-item ${chat.isActive ? 'active' : ''}`}
                onClick={() => switchChat(chat.id)}
                onDoubleClick={() => {
                  const newName = prompt('Enter new chat name:', chat.name);
                  if (newName !== null) {
                    renameChat(chat.id, newName);
                  }
                }}
                title="Click to switch, double-click to rename"
              >
                <div className="chat-avatar">{chat.avatar}</div>
                <div className="chat-info">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-preview">
                    {chat.messages.length > 1 
                      ? `${chat.messages[chat.messages.length - 1].text.substring(0, 40)}${chat.messages[chat.messages.length - 1].text.length > 40 ? '...' : ''}`
                      : 'Start a new conversation'
                    }
                  </div>
                  {chat.messages.length > 1 && (
                    <div className="chat-timestamp">
                      {formatRelativeTime(chat.messages[chat.messages.length - 1].timestamp)}
                    </div>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <div className="unread-badge">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-status">{user ? user.tag : 'Online'}</div>
            </div>
            <div className="user-actions">
              <button className="settings-btn" onClick={() => setShowSettings(true)}>
                <FaCog />
              </button>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-partner">
              <div className="partner-avatar">{currentChat ? currentChat.avatar : 'A'}</div>
              <div className="partner-info">
                <div className="partner-name">{currentChat ? currentChat.name : 'Select a chat'}</div>
                <div className="partner-status">{currentChat ? currentChat.preview : 'No chat selected'}</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="action-btn"><FaEllipsisH /></button>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                <div className="message-avatar">
                  {message.isBot ? 'Q' : userInitial}
                </div>
                <div className="message-content">
                  {message.type === 'file' ? (
                    <div className="file-message">
                      <div className="file-info" onClick={() => {
                        setPreviewFile(message);
                        setShowDocumentPreviewer(true);
                      }}>
                        <FaPaperclip className="file-icon" />
                        <span className="file-name">{message.fileName}</span>
                        <span className="file-size">{message.fileSize}</span>
                      </div>
                      <button className="download-btn" onClick={downloadSOW}>
                        <FaDownload /> Download SOW
                      </button>
                    </div>
                  ) : (
                    <div className={`message-text ${message.isProcessing ? 'processing' : ''}`}>
                      {message.text}
                    </div>
                  )}
                  <div className="message-time">
                    {formatRelativeTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <FaPaperPlane />
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <div className="input-actions">
                <button type="button" className="action-button"><FaPaperclip /></button>
                <button type="button" className="action-button"><FaLink /></button>
                <button type="button" className="action-button"><FaImage /></button>
                <button type="button" className="action-button"><FaMicrophone /></button>
                <button type="button" className="action-button"><FaCamera /></button>
              </div>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Say something..."
                className="chat-input"
              />
              <button type="submit" className="send-button">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
        

        
        {/* Document Previewer */}
        {showDocumentPreviewer && previewFile && (
          <DocumentPreviewer
            file={previewFile}
            onClose={() => {
              setShowDocumentPreviewer(false);
              setPreviewFile(null);
            }}
            onDownload={downloadSOW}
          />
        )}
        
        {/* Right Sidebar */}
        <div className="chat-right-sidebar">
          <div className="sidebar-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-list">
              <div className="quick-action-item" onClick={() => setShowPortal(true)}>
                <span className="action-icon"><FaSignOutAlt /></span>
                <span className="action-text">Take me to portal</span>
              </div>
              <div className="quick-action-item">
                <span className="action-icon"><FaClipboardList /></span>
                <span className="action-text">Current projects</span>
              </div>
              <div className="quick-action-item">
                <span className="action-icon"><FaFolder /></span>
                <span className="action-text">Projects archive</span>
              </div>
              <div className="quick-action-item">
                <span className="action-icon"><FaChartBar /></span>
                <span className="action-text">Dashboard</span>
              </div>
            </div>
          </div>
          
          <div className="floating-actions">
            <button className="floating-btn"><FaFolderOpen /></button>
            <button className="floating-btn"><FaMapMarkerAlt /></button>
            <button className="floating-btn"><FaCameraRetro /></button>
          </div>
        </div>
        
        {/* Portal Screen */}
        {showPortal && (
          <div className="portal-overlay">
            <div className="portal-container">
              {/* Portal Header */}
              <div className="portal-header">
                <div className="portal-header-left">
                  <button 
                    className="back-button" 
                    onClick={() => setShowPortal(false)}
                  >
                    <FaArrowLeft />
                    <span>Back to Chat</span>
                  </button>
                  <div className="portal-title-section">
                    <h1 className="portal-title">Client Onboarding Portal</h1>
                    <p className="portal-subtitle">Manage your projects and client relationships</p>
                  </div>
                </div>
                <div className="portal-user-info">
                  <div className="user-details">
                    <span className="user-greeting">Hi! {userName}</span>
                    <span className="user-role">{user ? user.tag : 'User'}</span>
                  </div>
                  <div className="user-avatar">{userInitial}</div>
                </div>
              </div>
              
              {/* Portal Content */}
              <div className="portal-content">
                {/* Left Pane - Projects */}
                <div className="projects-pane">
                  <div className="pane-header">
                    <h2 className="pane-title">Projects</h2>
                    <button 
                      className="new-project-btn"
                      onClick={() => setShowNewProjectForm(true)}
                    >
                      <FaPlusCircle />
                      <span>Client Onboarding</span>
                    </button>
                  </div>
                  <div className="project-list">
                    {projects.map((project) => (
                      <div 
                        key={project.id}
                        className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="project-header">
                          <h3 className="project-title">{project.title}</h3>
                          <span className="project-status">{project.status}</span>
                        </div>
                        <p className="project-description">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Pane - Project Details */}
                <div className="project-details-pane">
                  <h2 className="pane-title">Project Details</h2>
                  {selectedProject ? (
                    <div className="project-details-content">
                      <div className="project-header">
                        <h3 className="project-title">{selectedProject.title}</h3>
                        <span className="project-status">{selectedProject.status}</span>
                      </div>
                      <p className="project-description">{selectedProject.description}</p>
                      
                      <div className="project-info-section">
                        <h4 className="section-title">Project Information</h4>
                        <div className="info-item">
                          <span className="info-label">Project ID:</span>
                          <span className="info-value">{selectedProject.projectId}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Start Date:</span>
                          <span className="info-value">{selectedProject.startDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">End Date:</span>
                          <span className="info-value">{selectedProject.endDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Domain:</span>
                          <span className="info-value">{selectedProject.domain}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Company:</span>
                          <span className="info-value">{selectedProject.company}</span>
                        </div>
                      </div>

                      <div className="project-info-section">
                        <h4 className="section-title">Team Members</h4>
                        <div className="team-members-grid">
                          <div className="team-section">
                            <h5 className="team-section-title">
                              <FaUsers className="team-icon" />
                              CSA Team ({selectedProject.csaMembers.length})
                            </h5>
                            <div className="team-members-list">
                              {selectedProject.csaMembers.map((member) => (
                                <div key={member.id} className="team-member-card">
                                  <div className="member-avatar">{member.avatar}</div>
                                  <div className="member-info">
                                    <h6 className="member-name">{member.name}</h6>
                                    <span className="member-role">{member.role}</span>
                                    <span className="member-email">{member.email}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="team-section">
                            <h5 className="team-section-title">
                              <FaBuilding className="team-icon" />
                              Quadrant Team ({selectedProject.quadrantTeam.length})
                            </h5>
                            <div className="team-members-list">
                              {selectedProject.quadrantTeam.map((member) => (
                                <div key={member.id} className="team-member-card">
                                  <div className="member-avatar">{member.avatar}</div>
                                  <div className="member-info">
                                    <h6 className="member-name">{member.name}</h6>
                                    <span className="member-role">{member.role}</span>
                                    <span className="member-email">{member.email}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="team-section">
                            <h5 className="team-section-title">
                              <FaHandshake className="team-icon" />
                              Client Team ({selectedProject.clientMembers.length})
                            </h5>
                            <div className="team-members-list">
                              {selectedProject.clientMembers.map((member) => (
                                <div key={member.id} className="team-member-card">
                                  <div className="member-avatar">{member.avatar}</div>
                                  <div className="member-info">
                                    <h6 className="member-name">{member.name}</h6>
                                    <span className="member-role">{member.role}</span>
                                    <span className="member-email">{member.email}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                                             <div className="project-info-section">
                         <h4 className="section-title">Project Timeline & Documents</h4>
                         <div className="timeline-container">
                           <div className="timeline-track">
                             {selectedProject.timeline.map((phase, index) => (
                               <div key={phase.id} className="timeline-phase">
                                 <div className="phase-indicator">
                                   <div className={`phase-dot ${phase.status}`}>
                                     {phase.status === 'completed' && <FaCheckDouble />}
                                     {phase.status === 'in-progress' && <FaClock />}
                                     {phase.status === 'pending' && <FaCircle />}
                                   </div>
                                   {index < selectedProject.timeline.length - 1 && (
                                     <div className="phase-connector"></div>
                                   )}
                                 </div>
                                 <div className="phase-content">
                                   <div className="phase-header">
                                     <h5 className="phase-title">{phase.phase}</h5>
                                     <span className={`phase-status ${phase.status}`}>
                                       {phase.status === 'completed' && 'Completed'}
                                       {phase.status === 'in-progress' && 'In Progress'}
                                       {phase.status === 'pending' && 'Pending'}
                                     </span>
                                   </div>
                                   
                                   <div className="phase-documents">
                                     <div className="documents-header">
                                       <FaFileAlt className="documents-icon" />
                                       <span>Documents ({phase.documents.length})</span>
                                     </div>
                                     {phase.documents.length > 0 ? (
                                       <div className="documents-grid">
                                         {phase.documents.map((doc) => (
                                           <div key={doc.id} className="document-card">
                                             <div className="document-icon">
                                               <FaFileAlt />
                                             </div>
                                             <div className="document-info">
                                               <h6 className="document-name">{doc.name}</h6>
                                               <div className="document-meta">
                                                 <span className="document-type">{doc.type.toUpperCase()}</span>
                                                 <span className="document-size">{doc.size}</span>
                                               </div>
                                               <div className="document-upload-info">
                                                 <span className="uploaded-by">by {doc.uploadedBy}</span>
                                                 <span className="uploaded-at">{doc.uploadedAt}</span>
                                               </div>
                                             </div>
                                             <div className="document-actions">
                                               <button className="action-btn" title="View">
                                                 <FaEye />
                                               </button>
                                               <button className="action-btn" title="Download">
                                                 <FaDownload />
                                               </button>
                                             </div>
                                           </div>
                                         ))}
                                       </div>
                                     ) : (
                                       <div className="no-documents">
                                         <FaFileAlt className="no-docs-icon" />
                                         <p>No documents uploaded yet for this phase</p>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="placeholder-message">
                      <div className="placeholder-icon">
                        <FaFolder />
                      </div>
                      <h3 className="placeholder-title">Select a project from the left pane to view details</h3>
                      <p className="placeholder-subtitle">Choose any project to see comprehensive information, timelines, and progress updates</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Client Onboarding Modal */}
              {showNewProjectForm && (
                <div className="onboarding-overlay" onClick={handleCloseOnboarding}>
                  <div className="onboarding-container" onClick={(e) => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="onboarding-header">
                      <button 
                        className="onboarding-close-btn" 
                        onClick={handleCloseOnboarding}
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* Step 1: Company Selection */}
                    {onboardingStep === 1 && (
                      <div className="onboarding-step">
                        <div className="step-header">
                          <h2 className="step-title">Step 1: Select Company</h2>
                          <p className="step-subtitle">Choose an existing company or create a new one</p>
                        </div>
                        
                        <div className="step-progress">
                          <div className="progress-step active">
                            <div className="progress-circle">1</div>
                            <span className="progress-text">Company</span>
                          </div>
                          <div className="progress-step">
                            <div className="progress-circle">2</div>
                            <span className="progress-text">Project</span>
                          </div>
                          <div className="progress-step">
                            <div className="progress-circle">3</div>
                            <span className="progress-text">Users</span>
                          </div>
                        </div>

                        <div className="company-selection">
                          <div className="company-dropdown">
                            <label className="form-label">Select a company</label>
                            <div className="dropdown-container">
                              <input
                                type="text"
                                className="dropdown-input"
                                placeholder="Select a company..."
                                value={onboardingData.company}
                                readOnly
                              />
                              <FaChevronDown className="dropdown-arrow" />
                            </div>
                            {onboardingData.company && (
                              <div className="selected-company">
                                <span className="company-name">{onboardingData.company}</span>
                                <span className="company-industry">{onboardingData.companyIndustry}</span>
                              </div>
                            )}
                          </div>

                          <div className="company-search">
                            <label className="form-label">Search companies</label>
                            <input
                              type="text"
                              className="search-input"
                              placeholder="Search companies..."
                            />
                          </div>

                          <div className="company-list">
                            {companies.map((company, index) => (
                              <div 
                                key={index}
                                className={`company-item ${onboardingData.company === company.name ? 'selected' : ''}`}
                                onClick={() => handleCompanySelect(company)}
                              >
                                <span className="company-name">{company.name}</span>
                                <span className="company-industry">{company.industry}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="step-actions">
                          <button 
                            type="button" 
                            className="btn-primary"
                            onClick={handleNextStep}
                            disabled={!onboardingData.company}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Project Details */}
                    {onboardingStep === 2 && (
                      <div className="onboarding-step">
                        <div className="step-header">
                          <h2 className="step-title">Step 2: Project Details</h2>
                          <p className="step-subtitle">Provide project information and timeline</p>
                        </div>
                        
                        <div className="step-progress">
                          <div className="progress-step completed">
                            <div className="progress-circle">1</div>
                            <span className="progress-text">Company</span>
                          </div>
                          <div className="progress-step active">
                            <div className="progress-circle">2</div>
                            <span className="progress-text">Project</span>
                          </div>
                          <div className="progress-step">
                            <div className="progress-circle">3</div>
                            <span className="progress-text">Users</span>
                          </div>
                        </div>

                        <div className="company-info">
                          <span className="company-name">{onboardingData.company}</span>
                          <span className="company-industry">{onboardingData.companyIndustry}</span>
                        </div>

                        <form className="project-form">
                          <div className="form-group">
                            <label className="form-label">Project Name *</label>
                            <input
                              type="text"
                              name="projectName"
                              className={`form-input ${validationErrors.projectName ? 'error' : ''}`}
                              placeholder="Enter project name"
                              value={onboardingData.projectName}
                              onChange={handleOnboardingChange}
                              required
                            />
                            {validationErrors.projectName && (
                              <div className="error-message">{validationErrors.projectName}</div>
                            )}
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input
                              type="date"
                              name="startDate"
                              className={`form-input ${validationErrors.startDate ? 'error' : ''}`}
                              value={onboardingData.startDate}
                              onChange={handleOnboardingChange}
                              required
                            />
                            {validationErrors.startDate && (
                              <div className="error-message">{validationErrors.startDate}</div>
                            )}
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                              type="date"
                              name="endDate"
                              className="form-input"
                              value={onboardingData.endDate}
                              onChange={handleOnboardingChange}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Project Domain</label>
                            <textarea
                              name="projectDomain"
                              className="form-input"
                              placeholder="Describe the project domain, scope, and objectives..."
                              rows="3"
                              value={onboardingData.projectDomain}
                              onChange={handleOnboardingChange}
                            ></textarea>
                          </div>
                        </form>

                        <div className="step-actions">
                          <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={handlePrevStep}
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            className="btn-primary"
                            onClick={handleNextStep}
                            disabled={!onboardingData.projectName || !onboardingData.startDate}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Assign Users */}
                    {onboardingStep === 3 && (
                      <div className="onboarding-step">
                        <div className="step-header">
                          <h2 className="step-title">Step 3: Assign Users</h2>
                          <p className="step-subtitle">Assign team members and their roles</p>
                        </div>
                        
                        <div className="step-progress">
                          <div className="progress-step completed">
                            <div className="progress-circle">1</div>
                            <span className="progress-text">Company</span>
                          </div>
                          <div className="progress-step completed">
                            <div className="progress-circle">2</div>
                            <span className="progress-text">Project</span>
                          </div>
                          <div className="progress-step active">
                            <div className="progress-circle">3</div>
                            <span className="progress-text">Users</span>
                          </div>
                        </div>

                        <div className="user-assignment">
                          <div className="user-section">
                            <h3 className="section-title">CSA (0)</h3>
                            <div className="user-inputs">
                              <div className="input-group">
                                <label className="form-label">CSA Members</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search CSA members..."
                                />
                              </div>
                              <div className="input-group">
                                <label className="form-label">Other Users</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search other users..."
                                />
                              </div>
                            </div>
                            <div className="assigned-users">
                              <h4 className="assigned-title">Assigned (0)</h4>
                              <div className="empty-assigned">
                                <span>No users assigned</span>
                              </div>
                            </div>
                          </div>

                          <div className="user-section">
                            <h3 className="section-title">Quadrant Team (0)</h3>
                            <div className="user-inputs">
                              <div className="input-group">
                                <label className="form-label">Quadrant Team Members</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search Quadrant Team members..."
                                />
                              </div>
                              <div className="input-group">
                                <label className="form-label">Other Users</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search other users..."
                                />
                              </div>
                            </div>
                            <div className="assigned-users">
                              <h4 className="assigned-title">Assigned (0)</h4>
                              <div className="empty-assigned">
                                <span>No users assigned</span>
                              </div>
                            </div>
                          </div>

                          <div className="user-section">
                            <h3 className="section-title">Client (0)</h3>
                            <div className="user-inputs">
                              <div className="input-group">
                                <label className="form-label">Client Members</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search Client members..."
                                />
                              </div>
                              <div className="input-group">
                                <label className="form-label">Other Users</label>
                                <input
                                  type="text"
                                  className="search-input"
                                  placeholder="Search other users..."
                                />
                              </div>
                            </div>
                            <div className="assigned-users">
                              <h4 className="assigned-title">Assigned (0)</h4>
                              <div className="empty-assigned">
                                <span>No users assigned</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="step-actions">
                          <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={handlePrevStep}
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            className="btn-primary"
                            onClick={handleOnboardingSubmit}
                          >
                            Complete Onboarding
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Popup */}
        {showSettings && (
          <div className="settings-overlay" onClick={() => setShowSettings(false)}>
            <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
              <div className="settings-header">
                <h3 className="settings-title">Settings</h3>
                <button 
                  className="settings-close-btn" 
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="settings-content">
                <div className="settings-section">
                  <h4 className="section-heading">Account</h4>
                  <div className="setting-item">
                    <span className="setting-label">Profile</span>
                    <button className="setting-action-btn">Edit</button>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Password</span>
                    <button className="setting-action-btn">Change</button>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Email</span>
                    <button className="setting-action-btn">Update</button>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h4 className="section-heading">Preferences</h4>
                  <div className="setting-item">
                    <span className="setting-label">Notifications</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Dark Mode</span>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Sound</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h4 className="section-heading">Privacy</h4>
                  <div className="setting-item">
                    <span className="setting-label">Online Status</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Read Receipts</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="settings-footer">
                <button className="settings-save-btn">Save Changes</button>
                <button 
                  className="settings-cancel-btn" 
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="login-container">
        <div className="login-card">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Sign in to continue to your portal</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" className="checkbox" disabled={isLoading} />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
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
