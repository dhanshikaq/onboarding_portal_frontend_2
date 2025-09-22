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
  FaVolumeUp,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaUpload,
  FaLock
} from 'react-icons/fa';
import './App.css';
import DocumentPreviewer from './components/DocumentPreviewer';
import ApiService from './services/api';
import MarkdownRenderer from './components/MarkdownRenderer';
import UserSelector from './components/UserSelector';

// Custom Quadra Logo Component
const QuadraLogo = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`quadra-logo-container ${className}`}
      style={{
        fontSize: `${size}px`,
        width: 'auto',
        height: 'auto'
      }}
    >
      <div className="quadra-text-logo">
        Quadra
      </div>
    </div>
  );
};

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

  // DocuSign completion message listener
  React.useEffect(() => {
    const handleMessage = (event) => {
      console.log('Message received:', event.origin, event.data);
      
      // Allow messages from backend (localhost:8000) or same origin
      const allowedOrigins = [
        window.location.origin,
        'http://localhost:8000',
        'http://127.0.0.1:8000'
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Message origin not allowed:', event.origin);
        return;
      }
      
      if (event.data && event.data.type === 'DOCUSIGN_COMPLETE') {
        console.log('DocuSign completion detected:', event.data);
        // DON'T handle completion automatically - let webhook show document directly
        // handleDocuSignComplete(event.data.webhookData);
      }
      
      if (event.data && event.data.type === 'REFRESH_DOCUMENT_LIST') {
        console.log('Refresh document list requested from webhook');
        // Refresh the document list when user clicks the refresh button
        refreshDocumentList();
      }
    };

    // Make functions available globally for webhook page to call
    window.setShowDocuSignModal = setShowDocuSignModal;

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up global functions
      delete window.setShowDocuSignModal;
    };
  }, []);

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
  const [isLoadingProjects, setIsLoadingProjects] = useState(false); // Loading state for projects
  const [projectsError, setProjectsError] = useState(null); // Error state for projects
  
  // Document upload state
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('discovery_call');
  const [activePhaseForUpload, setActivePhaseForUpload] = useState(null);
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [selectedPhaseForView, setSelectedPhaseForView] = useState('all');
  const [phaseDocuments, setPhaseDocuments] = useState([]);
  const [isRefreshingDiscoveryDocs, setIsRefreshingDiscoveryDocs] = useState(false);
  
  // DocuSign integration state
  const [showDocuSignModal, setShowDocuSignModal] = useState(false);
  const [signingUrl, setSigningUrl] = useState('');
  const [docusignLoading, setDocusignLoading] = useState(false);
  const [envelopeStatus, setEnvelopeStatus] = useState(null);
  const [documentToSign, setDocumentToSign] = useState(null);
  
  // Document preview state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [iframeLoadError, setIframeLoadError] = useState(false);
  
  // Signed documents state
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [showSignedDocuments, setShowSignedDocuments] = useState(false);

  // Phase completion confirmation state
  const [showPhaseConfirmation, setShowPhaseConfirmation] = useState(false);
  const [phaseToComplete, setPhaseToComplete] = useState(null);
  const [showPhaseSuccess, setShowPhaseSuccess] = useState(false);
  const [completedPhaseName, setCompletedPhaseName] = useState('');

  // Sidebar visibility state - hidden by default for clean chat interface
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(false);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);

  // Load user sessions when user is available
  React.useEffect(() => {
    if (user?.user_id) {
      loadUserSessions();
    }
  }, [user?.user_id]);

  // Load signed documents when a project is selected
  React.useEffect(() => {
    if (selectedProject?.id) {
      loadSignedDocuments(selectedProject.id).then(docs => {
        setSignedDocuments(docs);
      });
    }
  }, [selectedProject?.id]);

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

  // Auto-resize textarea when inputMessage changes
  React.useEffect(() => {
    const textarea = document.querySelector('.chat-input');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

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

  // Projects data - loaded from API
  const [projects, setProjects] = useState([]);

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

  const handleCSAMembersChange = (selectedUsers) => {
    setOnboardingData(prevState => ({
      ...prevState,
      csaMembers: selectedUsers
    }));
  };

  const handleQuadrantTeamChange = (selectedUsers) => {
    setOnboardingData(prevState => ({
      ...prevState,
      quadrantTeam: selectedUsers
    }));
  };

  const handleClientMembersChange = (selectedUsers) => {
    setOnboardingData(prevState => ({
      ...prevState,
      clientMembers: selectedUsers
    }));
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
        user_assignments: {
          csa_users: onboardingData.csaMembers.map(user => ({
            user_id: user.user_id
          })),
          quadrant_users: onboardingData.quadrantTeam.map(user => ({
            user_id: user.user_id
          })),
          client_users: onboardingData.clientMembers.map(user => ({
            user_id: user.user_id
          }))
        }
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
        csaMembers: onboardingData.csaMembers.map(user => ({
          id: user.user_id,
          name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email_id,
          role: 'CSA Member',
          email: user.email_id,
          avatar: (user.first_name || user.email_id).substring(0, 2).toUpperCase()
        })),
        quadrantTeam: onboardingData.quadrantTeam.map(user => ({
          id: user.user_id,
          name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email_id,
          role: 'Quadrant Team Member',
          email: user.email_id,
          avatar: (user.first_name || user.email_id).substring(0, 2).toUpperCase()
        })),
        clientMembers: onboardingData.clientMembers.map(user => ({
          id: user.user_id,
          name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email_id,
          role: 'Client Member',
          email: user.email_id,
          avatar: (user.first_name || user.email_id).substring(0, 2).toUpperCase()
        })),
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

  const loadUserProjects = async () => {
    if (!user?.user_id) {
      return;
    }
    
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const response = await ApiService.getUserProjects(user.user_id);
      
      if (response.success && response.projects) {
        // Transform the API response to match the expected project format
        const transformedProjects = response.projects.map(project => {
          // For admin users, use the assigned_users data from API
          let teamMembers = { csaMembers: [], quadrantTeam: [], clientMembers: [] };
          
          if (response.is_admin_view && project.assigned_users) {
            // Group assigned users by role
            project.assigned_users.forEach(user => {
              const teamMember = {
                id: user.user_id,
                name: user.name,
                role: user.role === 'CSA' ? 'CSA Member' : 
                      user.role === 'Quadrant' ? 'Quadrant Team Member' : 
                      'Client Member',
                email: user.email,
                avatar: user.name.substring(0, 2).toUpperCase()
              };
              
              if (user.role === 'CSA') {
                teamMembers.csaMembers.push(teamMember);
              } else if (user.role === 'Quadrant') {
                teamMembers.quadrantTeam.push(teamMember);
              } else {
                teamMembers.clientMembers.push(teamMember);
              }
            });
          }
          
          return {
            id: project.project_id,
            title: project.project_name,
            description: `${project.domain || 'General'} project for ${project.company_name}`,
            status: 'In Progress', // Default status since API doesn't provide it
            projectId: `PROJ-${project.project_id.toString().padStart(3, '0')}`,
            startDate: project.start_date,
            endDate: project.end_date,
            domain: project.domain,
            company: project.company_name,
            userRole: project.user_role,
            companyId: project.company_id,
            isAdminView: response.is_admin_view,
            // Use team members from API or default empty arrays
            csaMembers: teamMembers.csaMembers,
            quadrantTeam: teamMembers.quadrantTeam,
            clientMembers: teamMembers.clientMembers,
            timeline: [
            {
              id: 1,
              phase: 'Discovery Call',
              phase_key: 'discovery_call',
              status: 'completed',
              documents: []
            },
            {
              id: 2,
              phase: 'Project Planning',
              phase_key: 'project_planning',
              status: 'in-progress',
              documents: []
            },
            {
              id: 3,
              phase: 'Design Phase',
              phase_key: 'design_phase',
              status: 'pending',
              documents: []
            },
            {
              id: 4,
              phase: 'Closure',
              phase_key: 'closure',
              status: 'pending',
              documents: []
            }
          ]
        };
        });
        
        setProjects(transformedProjects);
        
        // Automatically select the first project if none is selected
        if (transformedProjects.length > 0 && !selectedProject) {
          const firstProject = transformedProjects[0];
          setSelectedProject(firstProject);
          // Load documents for the auto-selected project
          const documents = await loadAllProjectDocuments(firstProject.id);
          setProjectDocuments(documents);
          console.log('Auto-selected first project:', firstProject);
          console.log('Loaded documents for auto-selected project:', documents);
        }
      }
    } catch (error) {
      console.error('Failed to load user projects:', error);
      setProjectsError('Failed to load projects. Please try again.');
      // No fallback projects - user needs to create projects or fix API connection
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleOpenPortal = async () => {
    setShowPortal(true);
    await loadUserProjects();
  };

  const handleProjectSelect = async (project) => {
    console.log('🔄 Selecting project:', project.title, 'ID:', project.id);
    setSelectedProject(project);
    
    // Load documents for the selected project
    console.log('📄 Loading documents for project:', project.id);
    const documents = await loadAllProjectDocuments(project.id);
    console.log('📄 Loaded documents:', documents);
    setProjectDocuments(documents);
    
    // Also load signed documents
    console.log('📋 Loading signed documents for project:', project.id);
    const signedDocs = await loadSignedDocuments(project.id);
    console.log('📋 Loaded signed documents:', signedDocs);
    setSignedDocuments(signedDocs);
    
    console.log('✅ Project selection complete:', { project: project.title, documentCount: documents.length, signedCount: signedDocs.length });
  };

  const handlePhaseViewChange = async (phase) => {
    console.log(`Phase clicked: ${phase}`);
    setSelectedPhaseForView(phase);
    if (selectedProject) {
      console.log(`Loading documents for project ${selectedProject.id}, phase ${phase}`);
      
      // If discovery call phase is clicked, refresh all project documents first
      if (phase === 'discovery_call') {
        console.log('🔄 Discovery call clicked - refreshing latest documents...');
        setIsRefreshingDiscoveryDocs(true);
        try {
          // Load all project documents to get the latest
          const allDocuments = await loadAllProjectDocuments(selectedProject.id);
          console.log('📄 Latest documents loaded:', allDocuments);
          
          // Filter documents for discovery call phase
          const discoveryDocuments = allDocuments.filter(doc => 
            doc.phase === 'discovery_call' || 
            doc.phase_key === 'discovery_call' ||
            (doc.activity_type && doc.activity_type.includes('discovery'))
          );
          
          setPhaseDocuments(discoveryDocuments);
          console.log(`✅ Discovery call documents refreshed:`, discoveryDocuments);
        } catch (error) {
          console.error('❌ Error refreshing discovery call documents:', error);
          // Fallback to regular phase loading
          const documents = await loadDocumentsByPhase(selectedProject.id, phase);
          setPhaseDocuments(documents);
        } finally {
          setIsRefreshingDiscoveryDocs(false);
        }
      } else {
        // For other phases, use regular loading
        const documents = await loadDocumentsByPhase(selectedProject.id, phase);
        setPhaseDocuments(documents);
        console.log(`Switched to view phase ${phase}:`, documents);
        console.log(`API called: http://localhost:8000/api/status/projects/${selectedProject.id}/documents/phase/${phase}/`);
      }
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
      
      // Reset textarea height
      const textarea = document.querySelector('.chat-input');
      if (textarea) {
        textarea.style.height = 'auto';
      }
      
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
                  fileSize: "150 KB",
                  status_id: 22, // Use the actual status_id from your signed document
                  url: "http://localhost:8000/api/status/documents/serve/22/"
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
      id: response.data.project_id,
      title: projectName,
      description: `${projectName} project for ${company}`,
      status: 'New',
      projectId: `PROJ-${String(response.data.project_id).padStart(6, '0')}`,
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

  const handlePhaseClick = (phase) => {
    // Set the active phase for upload and open the upload modal
    setActivePhaseForUpload(phase);
    setSelectedPhase(phase.phase_key || phase.phase.toLowerCase().replace(/\s+/g, '_'));
    setShowDocumentUpload(true);
  };

  const getCurrentActivePhase = () => {
    if (!selectedProject) {
      console.log('getCurrentActivePhase: No selectedProject');
      return null;
    }
    
    console.log('getCurrentActivePhase: selectedProject timeline:', selectedProject.timeline);
    
    // First, try to find a phase with 'in-progress' status
    let activePhase = selectedProject.timeline.find(phase => phase.status === 'in-progress');
    
    // If no 'in-progress' phase found, look for the most recent completed phase
    // This handles cases where all phases might be completed or there's a data issue
    if (!activePhase) {
      console.log('getCurrentActivePhase: No in-progress phase found, looking for most recent phase');
      activePhase = selectedProject.timeline[selectedProject.timeline.length - 1];
    }
    
    console.log('getCurrentActivePhase: found active phase:', activePhase);
    
    return activePhase;
  };

  const handleDocumentUpload = async () => {
    if (!selectedProject || uploadedFiles.length === 0) return;
    
    // Auto-detect current active phase
    const currentPhase = getCurrentActivePhase();
    if (!currentPhase) {
      alert('No active phase found. Please ensure the project has an active phase.');
      return;
    }
    
    // Set the phase for upload - use the phase_key from the timeline
    const phaseKey = currentPhase.phase_key || currentPhase.phase.toLowerCase().replace(/\s+/g, '_');
    setSelectedPhase(phaseKey);
    
    console.log('Phase conversion:', {
      originalPhase: currentPhase.phase,
      phaseKey: currentPhase.phase_key,
      convertedKey: phaseKey,
      selectedPhase: selectedPhase
    });
    
    console.log('Selected project for upload:', selectedProject);
    console.log('Current active phase:', currentPhase);
    console.log('Uploaded files:', uploadedFiles);
    
    setIsUploading(true);
    
    try {
      // Upload each file to the backend with phase information
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        // Ensure we have a valid project ID
        const projectId = selectedProject?.id || selectedProject?.project_id;
        if (!projectId) {
          alert('No project selected. Please select a project first.');
        return;
      }
        formData.append('project_id', projectId);
        formData.append('phase', selectedPhase);
        formData.append('activity_type', file.name.split('.')[0]); // Use filename as activity type
        
        const response = await fetch('http://localhost:8000/api/status/documents/upload/', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        return response.json();
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      
      // Create new documents with uploaded file info and backend response
      const newDocuments = uploadedFiles.map((file, index) => ({
        id: uploadResults[index]?.data?.status_id || Date.now() + index,
        name: file.name,
        type: file.name.split('.').pop().toLowerCase(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        phase: selectedPhase,
        uploadedBy: user?.name || 'Current User',
        uploadedAt: new Date().toISOString().split('T')[0],
        file: file, // Store the actual file object for preview
        blobUrl: uploadResults[index]?.data?.blob_url,
        status: uploadResults[index]?.data?.status || 'in_progress'
      }));

      // Update the project timeline with new documents
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            timeline: project.timeline.map(phase => {
              // Find the phase that matches the selected phase
              if (phase.phase_key === selectedPhase || phase.phase.toLowerCase().replace(/\s+/g, '_') === selectedPhase) {
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
      
      // Reload documents from backend
      const updatedDocuments = await loadAllProjectDocuments(selectedProject.id);
      setProjectDocuments(updatedDocuments);
      
      // Reset upload state
      setUploadedFiles([]);
      setShowDocumentUpload(false);
      setSelectedPhase('discovery_call'); // Reset to default
      
      alert(`Documents uploaded successfully to ${selectedPhase} phase!`);
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

  const loadProjectDocuments = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/status/projects/${projectId}/documents/`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.documents || [];
      }
    } catch (error) {
      console.error('Error loading project documents:', error);
    }
    return [];
  };

  const refreshDocumentList = async () => {
    if (!selectedProject) return;
    
    console.log('Refreshing document list...');
    try {
      const updatedDocuments = await loadAllProjectDocuments(selectedProject.id);
      setProjectDocuments(updatedDocuments);
      
      // Also refresh phase documents if we're viewing a specific phase
      if (selectedPhaseForView !== 'all') {
        const phaseDocuments = await loadDocumentsByPhase(selectedProject.id, selectedPhaseForView);
        setPhaseDocuments(phaseDocuments);
      }
      
      console.log('Document list refreshed:', updatedDocuments);
    } catch (error) {
      console.error('Error refreshing document list:', error);
    }
  };

  const loadProjectDocumentsByPhase = async (projectId, phase) => {
    try {
      const response = await fetch(`http://localhost:8000/api/status/projects/${projectId}/documents/phase/${phase}/`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.documents || [];
      }
    } catch (error) {
      console.error('Error loading project documents by phase:', error);
    }
    return [];
  };

  const loadAllProjectDocuments = async (projectId) => {
    try {
      console.log('🌐 Fetching documents from API for project:', projectId);
      const response = await fetch(`http://localhost:8000/api/status/projects/${projectId}/documents/`);
      if (response.ok) {
        const data = await response.json();
        console.log('🌐 API Response:', data);
        const documents = data.data?.documents || [];
        console.log('📄 Parsed documents:', documents);
        
        // Check if any documents are signed
        const signedCount = documents.filter(doc => doc.activity_type?.includes('SIGNED')).length;
        console.log('✅ Found signed documents:', signedCount);
        
        return documents;
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading all project documents:', error);
      return [];
    }
  };

  const loadDocumentsByPhase = async (projectId, phase) => {
    try {
      if (phase === 'all') {
        return await loadAllProjectDocuments(projectId);
      } else {
        const response = await fetch(`http://localhost:8000/api/status/projects/${projectId}/documents/phase/${phase}/`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded documents for phase ${phase}:`, data);
          return data.data?.documents || [];
        }
      }
    } catch (error) {
      console.error(`Error loading documents for phase ${phase}:`, error);
      return [];
    }
    return [];
  };

  // Function to load signed documents for a project
  const loadSignedDocuments = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/status/projects/${projectId}/signed-documents/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded signed documents:', data);
        return data.data?.documents || [];
      }
    } catch (error) {
      console.error('Error loading signed documents:', error);
      return [];
    }
    return [];
  };

  // Function to preview a signed document
  const previewSignedDocument = (document) => {
    console.log('Previewing signed document:', document);
    
    // Set the document for preview
    setSelectedDocument({
      status_id: document.status_id,
      activity_type: document.activity_type,
      fileName: document.activity_type
    });
    
    // Set the preview URL
    const previewUrl = `http://localhost:8000${document.preview_url}`;
    setDocumentPreviewUrl(previewUrl);
    
    // Set the preview file
    setPreviewFile({
      fileName: document.activity_type,
      fileType: 'pdf',
      fileSize: "PDF Document",
      status_id: document.status_id,
      url: previewUrl
    });
    
    // Show the document previewer
    setShowDocumentPreviewer(true);
  };

  // DocuSign integration functions
  const initiateDocuSign = async (document) => {
    setDocumentToSign(document);
    setDocusignLoading(true);
    setSigningUrl('');
    
    try {
      const response = await fetch('http://localhost:8000/api/status/docusign/get_signing_url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'client@example.com', 
          name: 'Client Name',
          document_name: document.activity_type || 'Document'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSigningUrl(data.signing_url);
        setShowDocuSignModal(true);
        setEnvelopeStatus('sent');
        
        // Also set the document for preview
        setSelectedDocument(document);
        // Use the backend serve endpoint for preview, not the DocuSign URL
        if (document?.status_id) {
          const previewUrl = `http://localhost:8000/api/status/documents/serve/${document.status_id}/`;
          setDocumentPreviewUrl(previewUrl);
        } else {
          setDocumentPreviewUrl(data.signing_url);
        }
      } else {
        alert('Failed to initiate DocuSign process');
      }
    } catch (error) {
      console.error('DocuSign error:', error);
      alert('Failed to initiate DocuSign process');
    }
    
    setDocusignLoading(false);
  };

  const checkEnvelopeStatus = async (envelopeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/status/envelope/${envelopeId}/status/`);
      if (response.ok) {
        const data = await response.json();
        setEnvelopeStatus(data.status);
        return data.status;
      }
    } catch (error) {
      console.error('Error checking envelope status:', error);
    }
    return null;
  };

  const handleDocuSignComplete = async (webhookData = null) => {
    console.log('handleDocuSignComplete called with:', webhookData);
    
    // Don't close the modal immediately - let the webhook page handle it
    // setShowDocuSignModal(false);
    setSigningUrl('');
    setEnvelopeStatus('completed');
    
    // Refresh the document list to show the updated signed document
    if (selectedProject) {
      console.log('Refreshing document list after DocuSign completion...');
      try {
        const updatedDocuments = await loadAllProjectDocuments(selectedProject.id);
        setProjectDocuments(updatedDocuments);
        
        // Also refresh phase documents if we're viewing a specific phase
        if (selectedPhaseForView !== 'all') {
          const phaseDocuments = await loadDocumentsByPhase(selectedProject.id, selectedPhaseForView);
          setPhaseDocuments(phaseDocuments);
        }
        
        console.log('Document list refreshed with signed documents:', updatedDocuments);
      } catch (error) {
        console.error('Error refreshing document list after DocuSign:', error);
      }
    }
    
    // Use webhook data if available, otherwise fallback to manual completion
    let previewUrl = null;
    let documentId = null;
    let documentName = null;
    
    if (webhookData && webhookData.success && webhookData.preview_url) {
      // Use the preview URL from the webhook response
      previewUrl = `http://localhost:8000${webhookData.preview_url}`;
      documentId = webhookData.document_id;
      documentName = webhookData.document_name || "Signed Document";
      console.log('Using webhook preview URL:', previewUrl);
      console.log('Document name from webhook:', documentName);
    } else if (documentToSign?.status_id) {
      // Fallback to manual completion
      previewUrl = `http://localhost:8000/api/status/documents/serve/${documentToSign.status_id}/`;
      documentId = documentToSign.status_id;
      documentName = documentToSign.activity_type || "Signed Document";
      console.log('Using fallback preview URL:', previewUrl);
    }
    
    if (previewUrl) {
      console.log('Setting document preview with URL:', previewUrl);
      console.log('Document to sign:', documentToSign);
      
      // Keep the document selected for preview
      setSelectedDocument(documentToSign);
      setDocumentPreviewUrl(previewUrl);
      
      // Show the document previewer
      setShowDocumentPreviewer(true);
      setPreviewFile({
        fileName: documentName || documentToSign?.activity_type || "Signed Document.pdf",
        fileType: 'pdf',
        fileSize: "PDF Document",
        status_id: documentId,
        url: previewUrl
      });
      
      // Add a signed document message to the current chat
      const signedDocumentMessage = {
        id: Date.now(),
        text: webhookData ? "Document has been signed successfully!" : "Document signing completed!",
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      };
      
      const signedFileMessage = {
        id: Date.now() + 1,
        text: documentName || documentToSign?.activity_type || "Signed Document.pdf",
        isBot: true,
        timestamp: new Date(),
        type: 'file',
        fileName: documentName || documentToSign?.activity_type || "Signed Document.pdf",
        fileSize: "PDF Document",
        status_id: documentId,
        url: previewUrl
      };
      
      console.log('Created signed file message:', signedFileMessage);
      
      // Add messages to current chat
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, signedDocumentMessage, signedFileMessage]
            };
          }
          return chat;
        });
      });
    } else {
      setDocumentPreviewUrl(documentToSign?.location);
    }
    alert('Document signed successfully!');
  };

  const handleDocumentSelect = async (document) => {
    console.log('Document selected for preview:', document);
    console.log('Document location:', document.location);
    console.log('Document file:', document.file);
    setSelectedDocument(document);
    setIframeLoadError(false); // Reset error state
    
    // Create preview URL for the document - ONLY for preview, not download
    if (document.file) {
      // For uploaded files (local files)
      const url = URL.createObjectURL(document.file);
      setDocumentPreviewUrl(url);
      console.log('Using file URL for preview:', url);
    } else if (document.status_id) {
      // For documents from API - try to get the latest version by type first
      let previewUrl = null;
      
      try {
        // Extract document type from activity_type (e.g., "SOW", "NDA", etc.)
        // Handle cases like "discovery_call_Quadrant TJH SoW 1" -> "Quadrant TJH SoW 1"
        let documentType = document.activity_type;
        if (document.activity_type?.includes('_')) {
          const parts = document.activity_type.split('_');
          documentType = parts.slice(1).join('_'); // Take everything after the first underscore
        }
        
        // Try to get the latest document of this type
        const response = await fetch(`http://localhost:8000/api/status/projects/${selectedProject?.id}/documents/latest/${documentType}/url/`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            previewUrl = `http://localhost:8000${data.data.serve_url}`;
            console.log('Using latest document by type:', previewUrl);
            console.log('Document is signed:', data.data.is_signed);
          }
        }
      } catch (error) {
        console.log('Could not get latest document by type, falling back to specific document:', error);
      }
      
      // Fallback to specific document if latest by type fails
      if (!previewUrl) {
        previewUrl = `http://localhost:8000/api/status/documents/serve/${document.status_id}/`;
        console.log('Using backend serve endpoint for preview:', previewUrl);
      }
      
      setDocumentPreviewUrl(previewUrl);
    } else {
      setDocumentPreviewUrl(null);
      console.log('No preview URL available for document - missing status_id');
    }
  };

  const handleDocuSignPreview = async (document) => {
    setDocumentToSign(document);
    setDocusignLoading(true);
    setSigningUrl('');
    
    try {
      const response = await fetch('http://localhost:8000/api/status/docusign/get_signing_url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'client@example.com', 
          name: 'Client Name',
          document_name: document.activity_type || 'Document'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSigningUrl(data.signing_url);
        setShowDocuSignModal(true);
        setEnvelopeStatus('sent');
        
        // Set the document for DocuSign preview
        setSelectedDocument(document);
        setDocumentPreviewUrl(data.signing_url);
        console.log('DocuSign preview URL set:', data.signing_url);
      } else {
        alert('Failed to initiate DocuSign process');
      }
    } catch (error) {
      console.error('DocuSign error:', error);
      alert('Error initiating DocuSign process');
    } finally {
      setDocusignLoading(false);
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

  // Sidebar toggle functions
  const toggleLeftSidebar = () => {
    setIsLeftSidebarVisible(!isLeftSidebarVisible);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarVisible(!isRightSidebarVisible);
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
        {isLeftSidebarVisible && (
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
        )}

        {/* Left Sidebar Toggle Button */}
        <button 
          className={`sidebar-toggle-btn left-toggle ${isLeftSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}
          onClick={toggleLeftSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleLeftSidebar();
            }
          }}
          title={isLeftSidebarVisible ? 'Hide left sidebar' : 'Show left sidebar'}
          aria-label={isLeftSidebarVisible ? 'Hide left sidebar' : 'Show left sidebar'}
        >
          <FaChevronRight />
        </button>

        {/* Main Chat Area */}
        <div className={`chat-main ${!isLeftSidebarVisible ? 'expanded-left' : ''} ${!isRightSidebarVisible ? 'expanded-right' : ''} ${messages.length === 0 ? 'no-messages' : ''}`}>
          {/* Only show chat header when there are messages or user is typing */}
          {(messages.length > 0 || inputMessage.trim()) && (
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
          )}
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-placeholder">
                <QuadraLogo size={64} />
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
                            
                            // Set the document preview URL based on the message
                            if (message?.status_id) {
                              const previewUrl = `http://localhost:8000/api/status/documents/serve/${message.status_id}/`;
                              setDocumentPreviewUrl(previewUrl);
                            } else if (message?.url) {
                              setDocumentPreviewUrl(message.url);
                            } else {
                              setDocumentPreviewUrl(null);
                            }
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
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="ask quadra anything..."
                className="chat-input"
                rows="1"
                onInput={(e) => {
                  // Auto-resize the textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  // Allow Enter to send message, Shift+Enter for new line
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="input-right-actions">
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
            documentUrl={documentPreviewUrl}
            onClose={() => {
              setShowDocumentPreviewer(false);
              setPreviewFile(null);
            }}
            onDownload={downloadSOW}
          />
        )}
        
        {/* Right Sidebar */}
        {isRightSidebarVisible && (
          <div className="chat-right-sidebar">
            <div className="sidebar-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-list">
                <div className="quick-action-item" onClick={handleOpenPortal}>
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
        )}

        {/* Right Sidebar Toggle Button */}
        <button 
          className={`sidebar-toggle-btn right-toggle ${isRightSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}
          onClick={toggleRightSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleRightSidebar();
            }
          }}
          title={isRightSidebarVisible ? 'Hide right sidebar' : 'Show right sidebar'}
          aria-label={isRightSidebarVisible ? 'Hide right sidebar' : 'Show right sidebar'}
        >
          <FaChevronLeft />
        </button>
        
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
                    <h1 className="portal-title">
                      {user?.tag?.toLowerCase() === 'admin' ? 'Admin Portal - All Projects' : 'Client Onboarding Portal'}
                    </h1>
                    <p className="portal-subtitle">
                      {user?.tag?.toLowerCase() === 'admin' 
                        ? 'Manage all projects and client relationships across the system' 
                        : 'Manage your projects and client relationships'
                      }
                    </p>
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
                    <div className="pane-actions">
                      <button 
                        className="refresh-projects-btn"
                        onClick={loadUserProjects}
                        disabled={isLoadingProjects}
                        title="Refresh projects"
                      >
                        <FaSync className={isLoadingProjects ? 'spinning' : ''} />
                      </button>
                      <button 
                        className="new-project-btn"
                        onClick={() => setShowNewProjectForm(true)}
                      >
                        <FaPlusCircle />
                        <span>Client Onboarding</span>
                      </button>
                    </div>
                  </div>
                  <div className="project-list">
                    {isLoadingProjects ? (
                      <div className="loading-projects">
                        <div className="loading-spinner"></div>
                        <p>Loading projects...</p>
                      </div>
                    ) : projectsError ? (
                      <div className="projects-error">
                        <p>{projectsError}</p>
                        <button 
                          className="retry-btn"
                          onClick={loadUserProjects}
                        >
                          <FaSync />
                          <span>Retry</span>
                        </button>
                      </div>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <div 
                          key={project.id}
                          className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="project-header">
                            <h3 className="project-title">{project.title}</h3>
                            <span className={`project-status ${getProjectStatus(project).toLowerCase().replace(' ', '-')}`}>
                              {getProjectStatus(project)}
                            </span>
                          </div>
                          <p className="project-description">{project.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="no-projects">
                        <p>No projects found</p>
                        <button 
                          className="create-first-project-btn"
                          onClick={() => setShowNewProjectForm(true)}
                        >
                          <FaPlusCircle />
                          <span>Create Your First Project</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Pane - Project Details */}
                <div className="project-details-pane">
                  {selectedProject ? (
                    <div className="project-details-content">
                      <div className="project-header">
                        <h3 className="project-title">{selectedProject.title}</h3>
                        <p className="project-description">{selectedProject.description}</p>
                        <div className="project-header-actions">
                          <span className={`project-status ${getProjectStatus(selectedProject).toLowerCase().replace(' ', '-')}`}>
                            {getProjectStatus(selectedProject)}
                          </span>
                          <button 
                            className="refresh-docs-btn"
                            onClick={refreshDocumentList}
                            title="Refresh document list"
                          >
                            🔄 Refresh Documents
                          </button>
                          {signedDocuments.length > 0 && (
                            <button 
                              className="view-signed-docs-btn"
                              onClick={() => setShowSignedDocuments(true)}
                            >
                              <FaFileContract /> View Signed Documents ({signedDocuments.length})
                            </button>
                          )}
                        </div>
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
                              <div 
                                key={phase.id} 
                                className={`timeline-step clickable-phase ${phase.status === 'in-progress' ? 'active' : phase.status === 'completed' ? 'completed' : 'pending'} ${selectedPhaseForView === phase.phase_key ? 'selected' : ''} ${isRefreshingDiscoveryDocs && phase.phase_key === 'discovery_call' ? 'refreshing' : ''}`}
                                onClick={() => handlePhaseViewChange(phase.phase_key)}
                                title={`Click to view documents in ${phase.phase}${phase.phase_key === 'discovery_call' ? ' (refreshes latest documents)' : ''}`}
                              >
                                <div className="step-indicator">
                                  {isRefreshingDiscoveryDocs && phase.phase_key === 'discovery_call' && <FaSync className="spinning" />}
                                  {!isRefreshingDiscoveryDocs && phase.status === 'completed' && <FaCheckDouble />}
                                  {!isRefreshingDiscoveryDocs && phase.status === 'in-progress' && <FaClock />}
                                  {!isRefreshingDiscoveryDocs && phase.status === 'pending' && <FaCircle />}
                                </div>
                                <span className="step-label">
                                  {phase.phase}
                                  {isRefreshingDiscoveryDocs && phase.phase_key === 'discovery_call' && (
                                    <span className="refreshing-text"> (Refreshing...)</span>
                                  )}
                                </span>
                                <div className="view-hint">
                                  <FaEye className="view-icon" />
                                </div>
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
                              <h5 className="panel-title">Documents</h5>
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
                                  <h6>
                                    Upload Documents 
                                    <span className="selected-phase-indicator">
                                      to {getCurrentActivePhase()?.phase || 'Current Phase'}
                                    </span>
                                  </h6>
                                  <button 
                                    className="close-upload-btn"
                                    onClick={() => {
                                      setShowDocumentUpload(false);
                                      setActivePhaseForUpload(null);
                                    }}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                                
                                <div className="phase-info-container">
                                  <div className="current-phase-display">
                                    <div className="phase-icon">
                                      {getCurrentActivePhase()?.status === 'in-progress' && <FaClock />}
                                      {getCurrentActivePhase()?.status === 'completed' && <FaCheckDouble />}
                                      {getCurrentActivePhase()?.status === 'pending' && <FaCircle />}
                                    </div>
                                    <div className="phase-details">
                                      <span className="phase-name">{getCurrentActivePhase()?.phase || 'No Active Phase'}</span>
                                      <span className="phase-status">{getCurrentActivePhase()?.status || 'inactive'}</span>
                                    </div>
                                  </div>
                                  <p className="phase-description">
                                    {getCurrentActivePhase() ? 
                                      `Documents will be uploaded to the ${getCurrentActivePhase().phase} phase.` :
                                      'No active phase found. Please check your project timeline or contact support.'
                                    }
                                  </p>
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
                              {(selectedPhaseForView && selectedPhaseForView !== 'all' ? phaseDocuments : projectDocuments.filter(doc => doc.phase === getCurrentActivePhase()?.phase_key)).map((doc, index) => (
                                  <div 
                                    key={doc.status_id || index} 
                                    className={`document-item ${selectedDocument?.status_id === doc.status_id ? 'selected' : ''}`}
                                    onClick={() => handleDocumentSelect(doc)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="document-info">
                                      <span className="document-name">
                                        {doc.activity_type}
                                        {doc.activity_type?.includes('SIGNED') && (
                                          <span className="signed-badge">✅ SIGNED</span>
                                        )}
                                      </span>
                                    <span className="document-status">
                                      {doc.phase ? `${doc.phase} - ` : ''}{doc.status}
                                    </span>
                                    {doc.status && (
                                      <span className={`document-status-badge ${doc.status}`}>
                                        {doc.status}
                                      </span>
                                    )}
                                    </div>
                                  <div className="document-meta">
                                    <span className="document-type">{(doc.activity_type || 'DOCUMENT').toUpperCase()}</span>
                                    {doc.phase && (
                                      <span className="document-phase">
                                        {doc.phase === 'discovery_call' ? '🔍' : 
                                         doc.phase === 'project_planning' ? '📋' : 
                                         doc.phase === 'design_phase' ? '🎨' : 
                                         doc.phase === 'closure' ? '🏁' : ''}
                                      </span>
                                    )}
                                    <span className="document-date">{new Date(doc.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="document-actions">
                                    <button 
                                      className="download-document-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (doc.location) {
                                          window.open(doc.location, '_blank');
                                        }
                                      }}
                                      title="Download document"
                                    >
                                      📥
                                    </button>
                                    <button 
                                      className="sign-document-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDocuSignPreview(doc);
                                      }}
                                      title="Sign document with DocuSign"
                                      disabled={docusignLoading}
                                    >
                                      {docusignLoading ? '⏳' : '✍️'}
                                    </button>
                                  </div>
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
                                      <h4>{selectedDocument.activity_type || 'Document'}</h4>
                                    <div className="document-meta">
                                        <span className="file-type">{(selectedDocument.phase || 'DOCUMENT').toUpperCase()}</span>
                                        <span className="file-size">{selectedDocument.status || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  <div className="preview-content">
                                    {documentPreviewUrl ? (
                                      iframeLoadError ? (
                                        <div className="no-preview">
                                          <div className="file-icon">⚠️</div>
                                          <p className="file-name">{selectedDocument.activity_type || 'Document'}</p>
                                          <p className="file-info">Failed to load preview</p>
                                          <p className="file-url">URL: {documentPreviewUrl}</p>
                                          <button 
                                            className="retry-preview-btn"
                                            onClick={() => {
                                              setIframeLoadError(false);
                                              // Force iframe reload by updating the src
                                              const currentUrl = documentPreviewUrl;
                                              setDocumentPreviewUrl('');
                                              setTimeout(() => setDocumentPreviewUrl(currentUrl), 100);
                                            }}
                                          >
                                            Retry Preview
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="preview-container">
                                          <iframe
                                            src={documentPreviewUrl}
                                            title={selectedDocument.activity_type || 'Document'}
                                            className="document-iframe"
                                            frameBorder="0"
                                            onLoad={() => {
                                              console.log('Iframe loaded successfully:', documentPreviewUrl);
                                            }}
                                            onError={(e) => {
                                              console.error('Iframe failed to load:', documentPreviewUrl, e);
                                              setIframeLoadError(true);
                                            }}
                                            onLoadStart={() => {
                                              console.log('Iframe started loading:', documentPreviewUrl);
                                            }}
                                          />
                                        </div>
                                      )
                                    ) : (
                                        <div className="no-preview">
                                          <div className="file-icon">📄</div>
                                          <p className="file-name">{selectedDocument.activity_type || 'Document'}</p>
                                          <p className="file-info">Preview not available</p>
                                          <p className="file-url">Location: {selectedDocument.location || 'No location'}</p>
                                          <p className="file-url">Status ID: {selectedDocument.status_id || 'No status ID'}</p>
                                          <button 
                                            className="open-external-btn"
                                            onClick={() => {
                                              if (selectedDocument.location) {
                                                window.open(selectedDocument.location, '_blank');
                                              }
                                            }}
                                          >
                                            Open in New Tab
                                          </button>
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
                      <FaFolder />
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
                            <h3 className="section-title">
                              CSA Members ({onboardingData.csaMembers.length})
                            </h3>
                            <UserSelector
                              selectedUsers={onboardingData.csaMembers}
                              onUsersChange={handleCSAMembersChange}
                              placeholder="Search and select CSA members..."
                              label="CSA Members"
                              role="CSA"
                            />
                          </div>

                          <div className="user-section">
                            <h3 className="section-title">
                              Quadrant Team ({onboardingData.quadrantTeam.length})
                            </h3>
                            <UserSelector
                              selectedUsers={onboardingData.quadrantTeam}
                              onUsersChange={handleQuadrantTeamChange}
                              placeholder="Search and select Quadrant team members..."
                              label="Quadrant Team"
                              role="Quadrant"
                            />
                          </div>

                          <div className="user-section">
                            <h3 className="section-title">
                              Client Members ({onboardingData.clientMembers.length})
                            </h3>
                            <UserSelector
                              selectedUsers={onboardingData.clientMembers}
                              onUsersChange={handleClientMembersChange}
                              placeholder="Search and select client members..."
                              label="Client Members"
                              role="Client"
                            />
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
                      <p className="stat-label">
                        {user?.tag?.toLowerCase() === 'admin' ? 'All Projects' : 'Your Projects'}
                      </p>
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
                       handleOpenPortal();
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
            <div className="quadra-logo">
              <h2 className="logo-text">Quadra</h2>
            </div>
            <h1 className="welcome-title">WELCOME</h1>
            <p className="welcome-subtitle">Sign in to continue into Quadra</p>
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
              {isLoading ? 'Logging In...' : 'Login In'}
            </button>
          </form>

          <div className="signup-section">
            <p className="signup-text">
              Don't have an account? <a href="#" className="signup-link">Sign up</a>
            </p>
          </div>
        </div>
      </div>

      {/* DocuSign Modal */}
      {showDocuSignModal && (
        <div className="docusign-modal-overlay">
          <div className="docusign-modal">
            <div className="docusign-modal-header">
              <h3>📝 Sign Document - {documentToSign?.activity_type}</h3>
              <button 
                className="close-docusign-btn"
                onClick={() => setShowDocuSignModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="docusign-status">
              <div className="status-indicator">
                {envelopeStatus === 'sent' && <span className="status-sent">📤 Sent for Client Signature</span>}
                {envelopeStatus === 'completed' && <span className="status-completed">✅ Document Signed</span>}
                {envelopeStatus === 'delivered' && <span className="status-delivered">📬 Delivered to Client</span>}
              </div>
            </div>

            <div className="docusign-iframe-container">
              {signingUrl ? (
                <iframe
                  title="DocuSign Signing"
                  src={signingUrl}
                  width="100%"
                  height="600px"
                  style={{ border: '1px solid #333', borderRadius: '8px' }}
                  onLoad={() => {
                    console.log('DocuSign iframe loaded');
                    // The completion will be handled by the message listener
                    // when the iframe navigates to the /signed page
                  }}
                />
              ) : (
                <div className="docusign-loading">
                  <div className="loading-spinner">⏳</div>
                  <p>Preparing document for signing...</p>
                </div>
              )}
            </div>

            <div className="docusign-actions">
              <button 
                className="docusign-complete-btn"
                onClick={handleDocuSignComplete}
                disabled={envelopeStatus !== 'completed'}
              >
                ✅ Mark as Complete
              </button>
              <button 
                className="docusign-cancel-btn"
                onClick={() => setShowDocuSignModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signed Documents Modal */}
      {showSignedDocuments && (
        <div className="modal-overlay" onClick={() => setShowSignedDocuments(false)}>
          <div className="modal-content signed-documents-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Signed Documents</h3>
              <button className="close-btn" onClick={() => setShowSignedDocuments(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {signedDocuments.length > 0 ? (
                <div className="signed-documents-list">
                  {signedDocuments.map((doc, index) => (
                    <div key={doc.status_id || index} className="signed-document-item">
                      <div className="document-info">
                        <div className="document-name">{doc.activity_type}</div>
                        <div className="document-date">
                          Signed: {new Date(doc.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="document-actions">
                        <button 
                          className="preview-btn"
                          onClick={() => {
                            previewSignedDocument(doc);
                            setShowSignedDocuments(false);
                          }}
                        >
                          <FaEye /> Preview
                        </button>
                        <button 
                          className="download-btn"
                          onClick={() => window.open(`http://localhost:8000${doc.preview_url}`, '_blank')}
                        >
                          <FaDownload /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-signed-documents">
                  <FaFileContract className="no-docs-icon" />
                  <h4>No Signed Documents</h4>
                  <p>No documents have been signed for this project yet.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setShowSignedDocuments(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
