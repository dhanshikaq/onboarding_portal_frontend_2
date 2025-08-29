import React, { useState } from 'react';
import { 
  FaPlus,
  FaPlusCircle,
  FaEllipsisH, 
  FaPaperclip, 
  FaMicrophone, 
  FaPaperPlane, 
  FaSignOutAlt, 
  FaClipboardList, 
  FaFolder, 
  FaChartBar, 
  FaFolderOpen, 
  FaCog,
  FaArrowLeft,
  FaBuilding,
  FaClock,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaUsers,
  FaProjectDiagram,
  FaCalendarCheck,
  FaFileContract,
  FaHandshake,
  FaCheckDouble,
  FaCircle,
  FaTrash,
  FaRobot,
  FaVolumeUp,
  FaPlay
} from 'react-icons/fa';
import './App.css';
import DocumentPreviewer from './components/DocumentPreviewer';
import ApiService from './services/api';
import MarkdownRenderer from './components/MarkdownRenderer';


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

  // Load user sessions when user is available
  React.useEffect(() => {
    if (user?.user_id) {
      loadUserSessions();
    }
  }, [user?.user_id]);
  const [showSettings, setShowSettings] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showDocumentPreviewer, setShowDocumentPreviewer] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showChatOptions, setShowChatOptions] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isProjectInfoCollapsed, setIsProjectInfoCollapsed] = useState(true);
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
      name: 'New Chat',
      preview: 'Start a new conversation',
      avatar: 'N',
      messages: [], // Empty messages array for blank chat
      isActive: true,
      unreadCount: 0
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStates, setConversationStates] = useState({});
  const [sessionIds, setSessionIds] = useState({}); // Track session IDs for each chat - used to maintain conversation continuity
  const [projectIds, setProjectIds] = useState({}); // Track project IDs for each chat - used to link conversations to projects
  const [userSessions, setUserSessions] = useState([]); // Store user sessions from API
  const [isLoadingSessions, setIsLoadingSessions] = useState(false); // Loading state for sessions
  
  // Document upload state
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Document preview state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);

  // Phase completion confirmation state
  const [showPhaseConfirmation, setShowPhaseConfirmation] = useState(false);
  const [phaseToComplete, setPhaseToComplete] = useState(null);
  const [showPhaseSuccess, setShowPhaseSuccess] = useState(false);
  const [completedPhaseName, setCompletedPhaseName] = useState('');

  // Close chat options dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChatOptions && !event.target.closest('.chat-options-container')) {
        setShowChatOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatOptions]);

  // Close document upload when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDocumentUpload && !event.target.closest('.document-upload-section') && !event.target.closest('.add-document-btn')) {
        setShowDocumentUpload(false);
        setUploadedFiles([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocumentUpload]);

  // Cleanup preview URLs when component unmounts or document changes
  React.useEffect(() => {
    return () => {
      if (documentPreviewUrl) {
        URL.revokeObjectURL(documentPreviewUrl);
      }
    };
  }, [documentPreviewUrl]);

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

  // Helper function to parse conversation context into messages
  const parseConversationContext = (context) => {
    if (!context) return [];
    
    const messages = [];
    const lines = context.split('\n');
    let currentMessage = null;
    let messageId = 1;
    
    for (const line of lines) {
      if (line.startsWith('user: ')) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage);
        }
        // Start new user message
        currentMessage = {
          id: messageId++,
          text: line.substring(6), // Remove 'user: ' prefix
          isBot: false,
          timestamp: new Date() // We don't have exact timestamps, so use current time
        };
      } else if (line.startsWith('bot: ')) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage);
        }
        // Start new bot message
        currentMessage = {
          id: messageId++,
          text: line.substring(5), // Remove 'bot: ' prefix
          isBot: true,
          timestamp: new Date() // We don't have exact timestamps, so use current time
        };
      } else if (currentMessage && line.trim()) {
        // Continue previous message (multi-line)
        currentMessage.text += '\n' + line;
      }
    }
    
    // Add the last message if exists
    if (currentMessage) {
      messages.push(currentMessage);
    }
    
    return messages;
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
          phase: 'Closure',
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
        },
        {
          id: 3,
          phase: 'Design Phase',
          status: 'pending',
          documents: []
        },
        {
          id: 4,
          phase: 'Closure',
          status: 'pending',
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
        },
        {
          id: 3,
          phase: 'Design Phase',
          status: 'pending',
          documents: []
        },
        {
          id: 4,
          phase: 'Closure',
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
      // Validate that end date is after start date if provided
      if (onboardingData.endDate && onboardingData.startDate) {
        const startDate = new Date(onboardingData.startDate);
        const endDate = new Date(onboardingData.endDate);
        if (endDate <= startDate) {
          errors.endDate = 'End date must be after start date';
        }
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

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare project data according to the API specification
      const projectData = {
        company: {
          company_name: onboardingData.company,
          sector: onboardingData.companyIndustry
        },
        project: {
          project_name: onboardingData.projectName,
          start_date: onboardingData.startDate,
          end_date: onboardingData.endDate || null,
          domain: onboardingData.projectDomain || null
        },
        user_assignments: [
          // Add current user as default assignment
          {
            user_id: user?.user_id || 'current_user',
            role: user?.tag || 'client'
          }
          // Additional user assignments can be added here based on the form data
        ]
      };

      // Call the API to create the project
      const response = await ApiService.createProject(projectData);
      
      console.log('Project created successfully:', response);
      
      // Create a new project object for the UI
      const newProject = {
        id: response.data.project_id,
        title: onboardingData.projectName,
        description: `${onboardingData.projectName} project for ${onboardingData.company}`,
        status: 'New',
        projectId: `PROJ-${String(response.data.project_id).padStart(6, '0')}`,
        startDate: onboardingData.startDate,
        endDate: onboardingData.endDate || 'TBD',
        domain: onboardingData.projectDomain || 'General',
        company: onboardingData.company,
        csaMembers: [],
        quadrantTeam: [],
        clientMembers: [],
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
          },
          {
            id: 3,
            phase: 'Design Phase',
            status: 'pending',
            documents: []
          },
          {
            id: 4,
            phase: 'Closure',
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
      alert(`Project "${onboardingData.projectName}" created successfully!`);
      
      handleCloseOnboarding();
    } catch (error) {
      console.error('Project creation error:', error);
      alert(`Failed to create project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
      name: `New Chat ${newChatId}`,
      preview: 'Start a new conversation',
      avatar: String.fromCharCode(65 + (newChatId - 1) % 26), // A, B, C, etc.
      messages: [], // Empty messages array for blank chat
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
    
    // Initialize session_id as null for new chat
    setSessionIds(prev => ({
      ...prev,
      [newChatId]: null
    }));
    
    // Initialize project_id as null for new chat
    setProjectIds(prev => ({
      ...prev,
      [newChatId]: null
    }));
    
    // Add new chat to userSessions for Recent Sessions display
    const newSession = {
      session_id: `local_${newChatId}`,
      project_name: newChat.name,
      message_count: 1,
      is_active: true,
      last_activity: new Date().toISOString(),
      project_id: null
    };
    
    setUserSessions(prev => [newSession, ...prev]);
    
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

  const linkChatToProject = (chatId, projectId) => {
    setProjectIds(prev => ({
      ...prev,
      [chatId]: projectId
    }));
    console.log(`Linked chat ${chatId} to project ${projectId}`);
  };

  const loadUserSessions = async (options = {}) => {
    if (!user?.user_id) return;
    
    setIsLoadingSessions(true);
    try {
      const response = await ApiService.getUserSessions(user.user_id, options);
      const sessions = response.sessions || [];
      setUserSessions(sessions);

      
      // Clean up stale session mappings
      const validSessionIds = sessions.map(s => s.session_id);
      setSessionIds(prev => {
        const cleaned = {};
        Object.entries(prev).forEach(([chatId, sessionId]) => {
                    if (validSessionIds.includes(sessionId)) {
            cleaned[chatId] = sessionId;
          }
        });
        return cleaned;
      });
    } catch (error) {
      console.error('Failed to load user sessions:', error);
      // Don't show error to user for now, just log it
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSessionClick = async (session) => {
    // Move the clicked session to the top of the Recent Sessions list
    setUserSessions(prev => {
      const otherSessions = prev.filter(s => s.session_id !== session.session_id);
      return [session, ...otherSessions];
    });

    // Check if there's already a chat with this session_id
    const existingChatId = Object.keys(sessionIds).find(chatId => 
      sessionIds[chatId] === session.session_id
    );

    if (existingChatId) {
      // If chat exists, switch to it
      console.log(`Switching to existing chat ${existingChatId} for session ${session.session_id}`);
      switchChat(parseInt(existingChatId));
    } else {
      // Create a new chat for this session and load conversation history
      const newChatId = Math.max(...chats.map(chat => chat.id)) + 1;
      
      // Create initial chat structure
      const newChat = {
        id: newChatId,
        name: session.project_name || `Session ${session.session_id}`,
        preview: `${session.message_count} messages`,
        avatar: String.fromCharCode(65 + (newChatId - 1) % 26), // A, B, C, etc.
        messages: [
          { id: 1, text: "Loading conversation history...", isBot: true, timestamp: new Date() }
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
      
      // Set session_id for the new chat - MAP LOCAL CHAT ID TO REAL SESSION ID
      // This creates the mapping: localChatId -> realSessionId
      // Example: { 10: 8, 11: 9 } means local chat 10 maps to session 8, local chat 11 maps to session 9
      setSessionIds(prev => ({
        ...prev,
        [newChatId]: session.session_id
      }));
      
      // Set project_id if available
      if (session.project_id) {
        setProjectIds(prev => ({
          ...prev,
          [newChatId]: session.project_id
        }));
      }
      
      setChats(updatedChats);
      setCurrentChatId(newChatId);
      setInputMessage('');
      
      // Fetch conversation history for this session using the REAL session ID
      try {
        const response = await ApiService.getSessionConversation(session.session_id);
        
        if (response.success && response.session) {
          // Parse the conversation context into individual messages
          const conversationMessages = parseConversationContext(response.session.context);
          
          // Update the chat with the actual conversation history
          setChats(prevChats => {
            return prevChats.map(chat => {
              if (chat.id === newChatId) {
                return {
                  ...chat,
                  messages: conversationMessages.length > 0 ? conversationMessages : [
                    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
                  ],
                  preview: conversationMessages.length > 0 
                    ? `${conversationMessages.length} messages` 
                    : 'Start a new conversation'
                };
              }
              return chat;
            });
          });
          

        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        
        // Handle 404 errors specifically - session doesn't exist on backend
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.warn(`Session ${session.session_id} not found on backend - this might be a stale session`);
          
          // Update the chat to show a warning message
          setChats(prevChats => {
            return prevChats.map(chat => {
              if (chat.id === newChatId) {
                return {
                  ...chat,
                  messages: [
                    { 
                      id: 1, 
                      text: "This session appears to be no longer available on the server. Starting a new conversation.", 
                      isBot: true, 
                      timestamp: new Date() 
                    }
                  ],
                  preview: 'Session not found - new conversation'
                };
              }
              return chat;
            });
          });
        }
      }
    }
  };

  const deleteChat = (chatId) => {
    if (chats.length <= 1) {
      alert('Cannot delete the last chat. At least one chat must remain.');
      return;
    }
    
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    // Clean up session_id, project_id and conversation state for deleted chat
    setSessionIds(prev => {
      const newSessionIds = { ...prev };
      delete newSessionIds[chatId];
      return newSessionIds;
    });
    
    setProjectIds(prev => {
      const newProjectIds = { ...prev };
      delete newProjectIds[chatId];
      return newProjectIds;
    });
    
    setConversationStates(prev => {
      const newConversationStates = { ...prev };
      delete newConversationStates[chatId];
      return newConversationStates;
    });
    
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
        const newProject = await createProjectFromQuadraPrompt(inputMessage);
        
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
        
        // Get current session ID for this chat (null for new chats, actual ID for existing sessions)
        const currentSessionId = sessionIds[currentChatId];
        
        // Get current project ID for this chat (null if not linked to a project)
        const currentProjectId = projectIds[currentChatId];
        

        
        // Call the chatbot API
        const response = await ApiService.sendChatMessage(
          user.user_id,
          user.tag || 'client',
          inputMessage,
          currentConversationState,
          currentSessionId,
          currentProjectId
        );
        
        // Update conversation state
        setConversationStates(prev => ({
          ...prev,
          [currentChatId]: response.conversation_state || {}
        }));
        
        // Store session_id if provided in response
        if (response.session_id) {
          setSessionIds(prev => ({
            ...prev,
            [currentChatId]: response.session_id
          }));
          
          // Refresh user sessions to get updated session data
          loadUserSessions();
        }
        
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
        
        // Update userSessions to reflect new message count and move to top
        setUserSessions(prev => {
          const updatedSessions = prev.map(session => {
            if (session.session_id === `local_${currentChatId}` || session.session_id === sessionIds[currentChatId]) {
              return {
                ...session,
                message_count: session.message_count + 2, // +2 for user message and bot response
                last_activity: new Date().toISOString()
              };
            }
            return session;
          });
          
          // Move the current session to the top
          const currentSession = updatedSessions.find(session => 
            session.session_id === `local_${currentChatId}` || session.session_id === sessionIds[currentChatId]
          );
          
          if (currentSession) {
            const otherSessions = updatedSessions.filter(session => 
              session.session_id !== currentSession.session_id
            );
            return [currentSession, ...otherSessions];
          }
          
          return updatedSessions;
        });
        
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



  const saveChatAsPDF = () => {
    if (currentChat) {
      // Here you would implement the logic to save the chat as PDF
      console.log('Saving chat as PDF:', currentChat.name);
      alert(`Chat "${currentChat.name}" is being saved as PDF`);
      setShowChatOptions(false);
    }
  };

  const deleteCurrentChat = () => {
    if (currentChat && window.confirm(`Are you sure you want to delete "${currentChat.name}"?`)) {
      deleteChat(currentChat.id);
      setShowChatOptions(false);
    }
  };

  // Helper function to convert document URLs to clickable links
  const convertDocumentUrlsToLinks = (text) => {
    if (!text) return text;
    
    // Regex to match document download URLs
    const urlRegex = /(https?:\/\/localhost:8000\/api\/chatbot\/download\/[^\s]+)/g;
    
    return text.replace(urlRegex, (match) => {
      // Extract file type and filename from URL
      const urlParts = match.split('/');
      const fileType = urlParts[urlParts.length - 2]; // e.g., "docx", "pdf"
      const filename = urlParts[urlParts.length - 1]; // e.g., "generated_sow.docx"
      
      // Create a more user-friendly display text
      const displayText = `Download ${fileType.toUpperCase()} Document`;
      
      return `<a href="${match}" target="_blank" download="${filename}" class="document-download-link">${displayText}</a>`;
    });
  };

  // Custom component to render markdown with clickable document links
  const MarkdownWithLinks = ({ text }) => {
    if (!text) return null;
    
    // Check if text contains document URLs
    const urlRegex = /(https?:\/\/localhost:8000\/api\/chatbot\/download\/[^\s]+)/g;
    const hasDocumentUrls = urlRegex.test(text);
    
    if (!hasDocumentUrls) {
      // If no document URLs, just render normal markdown
      return <MarkdownRenderer text={text} />;
    }
    
    // Split text into parts: regular text and URLs
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex
    urlRegex.lastIndex = 0;
    
    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add the URL
      const urlParts = match[0].split('/');
      const fileType = urlParts[urlParts.length - 2];
      const filename = urlParts[urlParts.length - 1];
      const displayText = `Download ${fileType.toUpperCase()} Document`;
      
      parts.push({
        type: 'url',
        url: match[0],
        displayText,
        filename
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return (
      <div>
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <MarkdownRenderer key={index} text={part.content} />;
          } else {
            return (
              <a
                key={index}
                href={part.url}
                target="_blank"
                download={part.filename}
                className="document-download-link"
              >
                {part.displayText}
              </a>
            );
          }
        })}
      </div>
    );
  };

  

  const createProjectFromQuadraPrompt = async (promptText) => {
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
    
    try {
      // Prepare project data for API
      const projectData = {
        company: {
          company_name: company,
          sector: "Technology"
        },
        project: {
          project_name: projectName,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
          domain: domain
        },
        user_assignments: [
          // Add current user
          {
            user_id: user?.user_id || 'current_user',
            role: user?.tag || 'client'
          },
          // Add extracted emails as user assignments
          ...quadrantEmails.map(email => ({
            user_id: email, // Using email as user_id for now
            role: 'quadrant_team'
          })),
          ...csaEmails.map(email => ({
            user_id: email,
            role: 'csa'
          })),
          ...clientEmails.map(email => ({
            user_id: email,
            role: 'client'
          }))
        ]
      };

      // Call the API to create the project
      const response = await ApiService.createProject(projectData);
      
      // Create team members from emails for UI display
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
          phase: 'Discovery Call',
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
          phase: 'Project Planning',
          status: 'pending',
          documents: []
        },
        {
          id: 3,
          phase: 'Design Phase',
          status: 'pending',
          documents: []
        },
        {
          id: 4,
          phase: 'Closure',
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
     console.log('Project created successfully via API:', response);
     
     return newProject;
   } catch (error) {
     console.error('Failed to create project via API:', error);
     
     // Fallback: create project locally if API fails
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
     
     const fallbackProject = {
       id: Date.now(),
       title: projectName,
       description: `${projectName} project for ${company}`,
       status: 'New',
       projectId: `PROJ-${String(Date.now()).slice(-6)}`,
       startDate: new Date().toISOString().split('T')[0],
       endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       domain: domain,
       company: company,
       csaMembers: csaMembers,
       quadrantTeam: quadrantTeam,
       clientMembers: clientMembers,
       timeline: [
         {
           id: 1,
           phase: 'Discovery Call',
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
           phase: 'Project Planning',
           status: 'pending',
           documents: []
         },
         {
           id: 3,
           phase: 'Design Phase',
           status: 'pending',
           documents: []
         },
         {
           id: 4,
           phase: 'Closure',
           status: 'pending',
           documents: []
         }
       ]
     };
     
     setProjects(prevProjects => [fallbackProject, ...prevProjects]);
     setSelectedProject(fallbackProject);
     
     console.log('Project created locally (API failed):', fallbackProject);
     return fallbackProject;
   }
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

  // Document upload functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(files);
  };

  const handleDocumentUpload = async () => {
    if (!selectedProject || uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Find the current active phase (in-progress or completed)
      const currentPhase = selectedProject.timeline.find(p => p.status === 'in-progress') || 
                          selectedProject.timeline.find(p => p.status === 'completed');
      
      if (!currentPhase) {
        alert('No active phase found for document upload');
        return;
      }

      // Create new documents with uploaded file info
      const newDocuments = uploadedFiles.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.name.split('.').pop().toLowerCase(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: user?.name || 'Current User',
        uploadedAt: new Date().toISOString().split('T')[0],
        file: file // Store the actual file object for preview
      }));

      // Update the project timeline with new documents
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            timeline: project.timeline.map(phase => {
              if (phase.id === currentPhase.id) {
                return {
                  ...phase,
                  documents: [...(phase.documents || []), ...newDocuments]
                };
              }
              return phase;
            })
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      
      // Update selected project
      const updatedSelectedProject = updatedProjects.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedSelectedProject);
      
      // Reset upload state
      setUploadedFiles([]);
      setShowDocumentUpload(false);
      
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Document upload error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    
    // Create preview URL for the document
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      setDocumentPreviewUrl(url);
    } else {
      setDocumentPreviewUrl(null);
    }
  };

  // Phase completion handlers
  const handlePhaseCompletionClick = () => {
    const currentPhase = selectedProject.timeline.find(p => p.status === 'in-progress')?.phase;
    if (currentPhase) {
      setPhaseToComplete(currentPhase);
      setShowPhaseConfirmation(true);
    }
  };

  const handleConfirmPhaseCompletion = () => {
    if (selectedProject && phaseToComplete) {
      // Create a copy of the selected project to update
      const updatedProject = { ...selectedProject };
      
      // Find the target phase
      const targetPhaseIndex = updatedProject.timeline.findIndex(p => p.phase === phaseToComplete);
      if (targetPhaseIndex !== -1) {
        const targetPhase = updatedProject.timeline[targetPhaseIndex];
        
        if (targetPhase.status === 'in-progress') {
          // Completing a phase
          updatedProject.timeline[targetPhaseIndex].status = 'completed';
          
          // Find the next phase and mark it as in-progress
          const nextPhaseIndex = targetPhaseIndex + 1;
          if (nextPhaseIndex < updatedProject.timeline.length) {
            updatedProject.timeline[nextPhaseIndex].status = 'in-progress';
          }
          
          console.log(`Phase "${phaseToComplete}" completed successfully. Moved to next phase.`);
          
          // Show success message
          setCompletedPhaseName(phaseToComplete);
          setShowPhaseSuccess(true);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setShowPhaseSuccess(false);
            setCompletedPhaseName('');
          }, 3000);
        } else if (targetPhase.status === 'pending') {
          // Starting a new phase
          updatedProject.timeline[targetPhaseIndex].status = 'in-progress';
          
          console.log(`Phase "${phaseToComplete}" started successfully.`);
          
          // Show success message
          setCompletedPhaseName(phaseToComplete);
          setShowPhaseSuccess(true);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setShowPhaseSuccess(false);
            setCompletedPhaseName('');
          }, 3000);
        }
        
        // Update the selected project
        setSelectedProject(updatedProject);
        
        // Update the projects array to reflect the change
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          )
        );
      }
    }
    
    // Close the confirmation dialog
    setShowPhaseConfirmation(false);
    setPhaseToComplete(null);
  };

  const handleCancelPhaseCompletion = () => {
    setShowPhaseConfirmation(false);
    setPhaseToComplete(null);
  };

  const handleStartNextPhase = () => {
    const nextPendingPhase = selectedProject.timeline.find(p => p.status === 'pending');
    if (nextPendingPhase) {
      setPhaseToComplete(nextPendingPhase.phase);
      setShowPhaseConfirmation(true);
    }
  };

  // Function to calculate project status based on timeline
  const getProjectStatus = (project) => {
    if (!project.timeline || project.timeline.length === 0) {
      return 'New';
    }
    
    const completedPhases = project.timeline.filter(p => p.status === 'completed').length;
    const totalPhases = project.timeline.length;
    
    if (completedPhases === 0) {
      return 'New';
    } else if (completedPhases === totalPhases) {
      return 'Completed';
    } else {
      return 'In Progress';
    }
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
          </div>
          
          <div className="sidebar-menu">
            <div className="menu-item new-chat" onClick={createNewChat}>
              <span className="menu-icon"><FaPlusCircle /></span>
              <span>New chat</span>
            </div>



          </div>
          

          

          
          <div className="sidebar-section">
            <h3 className="section-title">Recent Sessions</h3>
            {isLoadingSessions ? (
              <div className="sessions-loading">
                <span>Loading sessions...</span>
              </div>
            ) : userSessions.length > 0 ? (
              <div className="sessions-list">
                {userSessions.map((session) => (
                  <div 
                    key={session.session_id} 
                    className="session-item"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="session-header">
                      <span className="session-project">{session.project_name}</span>
                      <span className={`session-status ${session.is_active ? 'active' : 'inactive'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="session-details">
                      <span className="session-messages">{session.message_count} messages</span>
                      <span className="session-time">
                        {formatRelativeTime(new Date(session.last_activity))}
                      </span>
                    </div>
                  </div>
                ))}
                
              </div>
            ) : (
              <div className="sessions-empty">
                <span>No recent sessions</span>
              </div>
            )}
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
              <div className="chat-options-container">
                <button 
                  className="action-btn" 
                  onClick={() => setShowChatOptions(!showChatOptions)}
                >
                  <FaEllipsisH />
                </button>
                
                {showChatOptions && (
                  <div className="chat-options-dropdown">

                    <div className="dropdown-item" onClick={saveChatAsPDF}>
                      <FaFileAlt />
                      <span>Save this chat as PDF</span>
                    </div>
                    <div className="dropdown-item delete-option" onClick={deleteCurrentChat}>
                      <FaTrash />
                      <span>Delete chat</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-placeholder">
                <div className="placeholder-icon">
                  <FaRobot />
                </div>
                <h2 className="placeholder-title">Where should we begin?</h2>
                <p className="placeholder-subtitle">Start a new conversation by typing in the input box below</p>
              </div>
            ) : (
              <>
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
                          {message.isBot ? (
                            <MarkdownWithLinks text={message.text} />
                          ) : (
                            message.text
                          )}
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
              </>
            )}
          </div>
          
          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <div className="input-actions">
                <button type="button" className="action-button plus-button"><FaPlus /></button>
              </div>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything"
                className="chat-input"
              />
              <div className="input-right-actions">
                <button type="button" className="action-button">
                  <FaMicrophone />
                </button>
                <button type="button" className="action-button">
                  <FaVolumeUp />
                </button>
                <button type="submit" className="action-button send-button">
                  <FaPaperPlane />
                </button>
              </div>
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
               <div className="quick-action-item" onClick={() => setShowDashboard(true)}>
                 <span className="action-icon"><FaChartBar /></span>
                 <span className="action-text">Dashboard</span>
               </div>
             </div>
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
                          <span className={`project-status ${getProjectStatus(project).toLowerCase().replace(' ', '-')}`}>
                            {getProjectStatus(project)}
                          </span>
                        </div>
                        <p className="project-description">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Pane - Project Details */}
                <div className="project-details-pane">
                  {selectedProject ? (
                    <div className="project-details-content">
                      <div className="project-header">
                        <h3 className="project-title">{selectedProject.title}</h3>
                        <p className="project-description">{selectedProject.description}</p>
                        <span className={`project-status ${getProjectStatus(selectedProject).toLowerCase().replace(' ', '-')}`}>
                          {getProjectStatus(selectedProject)}
                        </span>
                      </div>
                      
                      <div className="project-info-section">
                        <div className="section-header" onClick={() => setIsProjectInfoCollapsed(!isProjectInfoCollapsed)}>
                          <h4 className="section-title">Project Information & Team Members</h4>
                          <button className="collapse-toggle">
                            {isProjectInfoCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                          </button>
                        </div>
                        
                        {!isProjectInfoCollapsed && (
                          <>
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
                          </>
                        )}
                      </div>

                                                                   <div className="project-info-section">
                        <h4 className="section-title">Project Timeline & Documents</h4>
                        
                        {/* Timeline Bar at Top */}
                        <div className="timeline-bar">
                          <div className="timeline-steps">
                            {selectedProject.timeline.map((phase, index) => (
                              <div key={phase.id} className={`timeline-step ${phase.status === 'in-progress' ? 'active' : phase.status === 'completed' ? 'completed' : 'pending'}`}>
                                <div className="step-indicator">
                                  {phase.status === 'completed' && <FaCheckDouble />}
                                  {phase.status === 'in-progress' && <FaClock />}
                                  {phase.status === 'pending' && <FaCircle />}
                                </div>
                                <span className="step-label">{phase.phase}</span>
                                {index < selectedProject.timeline.length - 1 && (
                                  <div className="step-connector"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Two Panel Layout */}
                        <div className="timeline-panels">
                          {/* Left Panel - Documents */}
                          <div className="documents-panel">
                            <div className="panel-header">
                              <h5 className="panel-title">Documents - {selectedProject.timeline.find(p => p.status === 'in-progress')?.phase || 'No Active Phase'}</h5>
                              <button 
                                className="add-document-btn"
                                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                              >
                                <FaPlus />
                                <span>Add</span>
                                <FaChevronDown />
                              </button>
                            </div>
                            
                            {/* Document Upload Interface */}
                            {showDocumentUpload && (
                              <div className="document-upload-section">
                                <div className="upload-header">
                                  <h6>Upload Documents</h6>
                                  <button 
                                    className="close-upload-btn"
                                    onClick={() => setShowDocumentUpload(false)}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                                
                                <div className="file-input-container">
                                  <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                                    className="file-input"
                                    id="document-upload"
                                  />
                                  <label htmlFor="document-upload" className="file-input-label">
                                    <FaPaperclip />
                                    <span>Choose Files</span>
                                  </label>
                                </div>
                                
                                {uploadedFiles.length > 0 && (
                                  <div className="uploaded-files">
                                    <h6>Selected Files:</h6>
                                    {uploadedFiles.map((file, index) => (
                                      <div key={index} className="uploaded-file-item">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                                        <button 
                                          className="remove-file-btn"
                                          onClick={() => removeUploadedFile(index)}
                                        >
                                          <FaTimes />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="upload-actions">
                                  <button 
                                    className="upload-btn"
                                    onClick={handleDocumentUpload}
                                    disabled={uploadedFiles.length === 0 || isUploading}
                                  >
                                    {isUploading ? 'Uploading...' : 'Upload Documents'}
                                  </button>
                                  <button 
                                    className="cancel-upload-btn"
                                    onClick={() => {
                                      setShowDocumentUpload(false);
                                      setUploadedFiles([]);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="documents-list">
                                                              {selectedProject.timeline.find(p => p.status === 'in-progress')?.documents?.map((doc, index) => (
                                  <div 
                                    key={doc.id || index} 
                                    className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                                    onClick={() => handleDocumentSelect(doc)}
                                  >
                                    <div className="document-info">
                                      <span className="document-name">{doc.name}</span>
                                      <span className="document-status">Uploaded</span>
                                    </div>
                                    <span className="document-type">{doc.type.toUpperCase()}</span>
                                  </div>
                                )) || (
                                <div className="no-documents">
                                  <FaFileAlt className="no-docs-icon" />
                                  <p>No documents uploaded yet for this phase</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Panel - Document Viewer */}
                          <div className="document-viewer-panel">
                            <div className="viewer-content">
                              {selectedDocument ? (
                                <div className="document-preview">
                                  <div className="preview-header">
                                    <h4>{selectedDocument.name}</h4>
                                    <div className="document-meta">
                                      <span className="file-type">{selectedDocument.type.toUpperCase()}</span>
                                      <span className="file-size">{selectedDocument.size}</span>
                                    </div>
                                  </div>
                                  <div className="preview-content">
                                    {documentPreviewUrl ? (
                                      <iframe
                                        src={documentPreviewUrl}
                                        title={selectedDocument.name}
                                        className="document-iframe"
                                        frameBorder="0"
                                      />
                                    ) : (
                                      <div className="no-preview">
                                        <div className="file-icon">📄</div>
                                        <p className="file-name">{selectedDocument.name}</p>
                                        <p className="file-info">Preview not available</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="file-placeholder">FILE</div>
                                  <div className="no-document-selected">
                                    <p>No Document Selected</p>
                                    <p>Select a document from the left panel to view its content</p>
                                  </div>
                                </>
                              )}
                            </div>
                            {(() => {
                              const currentPhase = selectedProject.timeline.find(p => p.status === 'in-progress');
                              const nextPendingPhase = selectedProject.timeline.find(p => p.status === 'pending');
                              
                              if (currentPhase) {
                                return (
                                  <button className="complete-phase-btn" onClick={handlePhaseCompletionClick}>
                                    <FaCheckDouble />
                                    <span>Complete {currentPhase.phase} Phase</span>
                                  </button>
                                );
                              } else if (nextPendingPhase) {
                                return (
                                  <button className="start-phase-btn" onClick={handleStartNextPhase}>
                                    <FaPlay />
                                    <span>Start {nextPendingPhase.phase} Phase</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}

                            {/* Phase Completion Confirmation Modal */}
                            {showPhaseConfirmation && (
                              <div className="phase-confirmation-overlay" onClick={handleCancelPhaseCompletion}>
                                <div className="phase-confirmation-modal" onClick={(e) => e.stopPropagation()}>
                                  <div className="phase-confirmation-header">
                                    <h3 className="phase-confirmation-title">Complete Phase</h3>
                                    <button 
                                      className="phase-confirmation-close-btn" 
                                      onClick={handleCancelPhaseCompletion}
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                  
                                  <div className="phase-confirmation-content">
                                    <div className="phase-confirmation-icon">
                                      {selectedProject.timeline.find(p => p.phase === phaseToComplete)?.status === 'in-progress' ? (
                                        <FaCheckDouble />
                                      ) : (
                                        <FaPlay />
                                      )}
                                    </div>
                                    <h4 className="phase-confirmation-message">
                                      {selectedProject.timeline.find(p => p.phase === phaseToComplete)?.status === 'in-progress' ? (
                                        <>Are you sure you want to complete the <strong>{phaseToComplete}</strong> phase?</>
                                      ) : (
                                        <>Are you sure you want to start the <strong>{phaseToComplete}</strong> phase?</>
                                      )}
                                    </h4>
                                    <p className="phase-confirmation-description">
                                      {selectedProject.timeline.find(p => p.phase === phaseToComplete)?.status === 'in-progress' ? (
                                        <>This action will mark the current phase as completed and move the project to the next phase. This action cannot be undone.</>
                                      ) : (
                                        <>This action will start the {phaseToComplete} phase and make it the active phase for the project.</>
                                      )}
                                    </p>
                                  </div>
                                  
                                  <div className="phase-confirmation-footer">
                                    <button 
                                      className="phase-confirmation-cancel-btn" 
                                      onClick={handleCancelPhaseCompletion}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      className="phase-confirmation-confirm-btn" 
                                      onClick={handleConfirmPhaseCompletion}
                                    >
                                      {selectedProject.timeline.find(p => p.phase === phaseToComplete)?.status === 'in-progress' ? 'Complete Phase' : 'Start Phase'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Phase Completion Success Notification */}
                            {showPhaseSuccess && (
                              <div className="phase-success-notification">
                                <div className="success-icon">
                                  <FaCheckDouble />
                                </div>
                                <div className="success-content">
                                  <h4 className="success-title">
                                    {selectedProject.timeline.find(p => p.phase === completedPhaseName)?.status === 'completed' ? 'Phase Completed!' : 'Phase Started!'}
                                  </h4>
                                  <p className="success-message">
                                    {selectedProject.timeline.find(p => p.phase === completedPhaseName)?.status === 'completed' ? (
                                      <>The <strong>{completedPhaseName}</strong> phase has been successfully completed and the project has moved to the next phase.</>
                                    ) : (
                                      <>The <strong>{completedPhaseName}</strong> phase has been successfully started and is now the active phase.</>
                                    )}
                                  </p>
                                </div>
                                <button 
                                  className="success-close-btn" 
                                  onClick={() => setShowPhaseSuccess(false)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
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
                            {validationErrors.endDate && (
                              <div className="error-message">{validationErrors.endDate}</div>
                            )}
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
                            disabled={isLoading}
                          >
                            {isLoading ? 'Creating Project...' : 'Complete Onboarding'}
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

        {/* Dashboard Popup */}
        {showDashboard && (
          <div className="dashboard-overlay" onClick={() => setShowDashboard(false)}>
            <div className="dashboard-popup" onClick={(e) => e.stopPropagation()}>
              <div className="dashboard-header">
                <div className="dashboard-header-left">
                  <h2 className="dashboard-title">Dashboard</h2>
                  <p className="dashboard-subtitle">Overview of your projects and activities</p>
                </div>
                <button 
                  className="dashboard-close-btn" 
                  onClick={() => setShowDashboard(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="dashboard-content">
                {/* Stats Overview */}
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaProjectDiagram />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">{projects.length}</h3>
                      <p className="stat-label">Total Projects</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaUsers />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">
                        {projects.reduce((total, project) => 
                          total + project.csaMembers.length + project.quadrantTeam.length + project.clientMembers.length, 0
                        )}
                      </h3>
                      <p className="stat-label">Team Members</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaCalendarCheck />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">
                        {projects.filter(project => project.status === 'In Progress').length}
                      </h3>
                      <p className="stat-label">Active Projects</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaFileContract />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">
                        {projects.reduce((total, project) => 
                          total + project.timeline.reduce((phaseTotal, phase) => 
                            phaseTotal + phase.documents.length, 0
                          ), 0
                        )}
                      </h3>
                      <p className="stat-label">Documents</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-section">
                  <h3 className="section-title">Recent Activity</h3>
                  <div className="activity-list">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="activity-item">
                        <div className="activity-icon">
                          <FaProjectDiagram />
                        </div>
                        <div className="activity-content">
                          <h4 className="activity-title">{project.title}</h4>
                          <p className="activity-description">
                            Project {project.status.toLowerCase()} - {project.company}
                          </p>
                          <span className="activity-time">
                            Started {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="activity-status">
                          <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Status Overview */}
                <div className="dashboard-section">
                  <h3 className="section-title">Project Status Overview</h3>
                  <div className="status-overview">
                    <div className="status-item">
                      <div className="status-header">
                        <span className="status-label">New</span>
                        <span className="status-count">
                          {projects.filter(p => getProjectStatus(p) === 'New').length}
                        </span>
                      </div>
                      <div className="status-bar">
                        <div 
                          className="status-fill new" 
                          style={{width: `${(projects.filter(p => getProjectStatus(p) === 'New').length / projects.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="status-item">
                      <div className="status-header">
                        <span className="status-label">In Progress</span>
                        <span className="status-count">
                          {projects.filter(p => getProjectStatus(p) === 'In Progress').length}
                        </span>
                      </div>
                      <div className="status-bar">
                        <div className="status-fill in-progress" 
                          style={{width: `${(projects.filter(p => getProjectStatus(p) === 'In Progress').length / projects.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="status-item">
                      <div className="status-header">
                        <span className="status-label">Completed</span>
                        <span className="status-count">
                          {projects.filter(p => getProjectStatus(p) === 'Completed').length}
                        </span>
                      </div>
                      <div className="status-bar">
                        <div 
                          className="status-fill completed" 
                          style={{width: `${(projects.filter(p => getProjectStatus(p) === 'Completed').length / projects.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section">
                  <h3 className="section-title">Quick Actions</h3>
                  <div className="quick-actions-grid">
                                         <button className="quick-action-btn" onClick={() => {
                       setShowDashboard(false);
                       setShowNewProjectForm(true);
                     }}>
                       <FaPlusCircle />
                       <span>Create New Project</span>
                     </button>
                     <button className="quick-action-btn" onClick={() => {
                       setShowDashboard(false);
                       setShowPortal(true);
                     }}>
                       <FaFolderOpen />
                       <span>View All Projects</span>
                     </button>
                    <button className="quick-action-btn">
                      <FaChartBar />
                      <span>Generate Report</span>
                    </button>
                    <button className="quick-action-btn">
                      <FaUsers />
                      <span>Manage Team</span>
                    </button>
                  </div>
                </div>
              </div>
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
