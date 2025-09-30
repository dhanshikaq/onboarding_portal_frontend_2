import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  FaChartBar,
  FaUsers,
  FaProjectDiagram,
  FaFileContract,
  FaHandshake,
  FaBuilding,
  FaGlobe,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaChevronLeft
} from 'react-icons/fa';
import ApiService from '../services/api';
import './AnalyticsDashboard.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const StatCard = ({ title, value, icon: Icon, change, changeType, color = '#3B82F6', onClick }) => (
  <motion.div
    className="stat-card"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="stat-card-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon />
      </div>
      <div className="stat-change">
        {change && (
          <span className={`change-indicator ${changeType}`}>
            {changeType === 'positive' ? <FaArrowUp /> : <FaArrowDown />}
            {change}%
          </span>
        )}
      </div>
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value.toLocaleString()}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, className = "", actions }) => (
  <motion.div
    className={`chart-card ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      {actions && <div className="chart-actions">{actions}</div>}
    </div>
    <div className="chart-content">
      {children}
    </div>
  </motion.div>
);

const CompanySelector = ({ companies, selectedCompany, onCompanyChange }) => (
  <div className="company-selector">
    <label>Company View:</label>
    <select value={selectedCompany} onChange={(e) => onCompanyChange(e.target.value)}>
      <option value="">All Companies</option>
      {companies.map(company => (
        <option key={company.company_id} value={company.company_id}>
          {company.company_name}
        </option>
      ))}
    </select>
  </div>
);

const AnalyticsDashboard = ({ onClose, navigationContext = 'chat' }) => {
  const [overallData, setOverallData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [domainData, setDomainData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyData(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data first, fallback to mock data if it fails
      try {
        const [overallRes, companiesRes, domainRes, realTimeRes] = await Promise.all([
          ApiService.get('/api/analytics/overall/'),
          ApiService.get('/api/companies/list/'),
          ApiService.get('/api/analytics/domain/'),
          ApiService.get('/api/analytics/real-time/')
        ]);

        setOverallData(overallRes.data);
        setCompanies(companiesRes.data || []);
        setDomainData(domainRes.data);
        setRealTimeData(realTimeRes.data);
      } catch (dbError) {
        console.log('Database not available, using mock data:', dbError.message);
        
        // Use mock data when database is not available
        const [overallRes, companiesRes, domainRes, realTimeRes] = await Promise.all([
          ApiService.get('/api/analytics/mock/overall/'),
          ApiService.get('/api/analytics/mock/companies/'),
          ApiService.get('/api/analytics/mock/domain/'),
          ApiService.get('/api/analytics/mock/real-time/')
        ]);

        setOverallData(overallRes.data);
        setCompanies(companiesRes.data || []);
        setDomainData(domainRes.data);
        setRealTimeData(realTimeRes.data);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async (companyId) => {
    try {
      // Try real data first, fallback to mock data
      try {
        const response = await ApiService.get(`/api/analytics/company/${companyId}/`);
        setCompanyData(response.data);
      } catch (dbError) {
        console.log('Using mock company data');
        const response = await ApiService.get(`/api/analytics/mock/company/${companyId}/`);
        setCompanyData(response.data);
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      // Try real data first, fallback to mock data
      try {
        const response = await ApiService.get('/api/analytics/real-time/');
        setRealTimeData(response.data);
      } catch (dbError) {
        const response = await ApiService.get('/api/analytics/mock/real-time/');
        setRealTimeData(response.data);
      }
    } catch (err) {
      console.error('Error fetching real-time data:', err);
    }
  };

  const formatChartData = (data, keyField, valueField) => {
    if (!data) return [];
    return data.map(item => ({
      name: item[keyField] || 'Unknown',
      value: item[valueField] || 0
    }));
  };

  const getProjectStatusData = () => {
    if (!overallData?.project_status) return [];
    return Object.entries(overallData.project_status).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'active' ? '#10B981' : status === 'completed' ? '#3B82F6' : '#F59E0B'
    }));
  };

  const getDocumentStatusData = () => {
    if (!overallData?.document_status) return [];
    return Object.entries(overallData.document_status).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: COLORS[Object.keys(overallData.document_status).indexOf(status) % COLORS.length]
    }));
  };

  const getMonthlyTrendData = () => {
    if (!overallData?.monthly_trends?.projects) return [];
    return overallData.monthly_trends.projects.map(item => ({
      month: item.month,
      projects: item.count,
      conversations: overallData.monthly_trends.conversations.find(c => c.month === item.month)?.count || 0
    }));
  };

  if (loading) {
    return (
      <div className="analytics-overlay" onClick={onClose}>
        <div className="analytics-popup" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-overlay" onClick={onClose}>
        <div className="analytics-popup" onClick={(e) => e.stopPropagation()}>
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchInitialData} className="retry-btn">
              <FaSync /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <motion.div
        className="analytics-popup"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="analytics-header">
          <div className="analytics-header-left">
            <h2 className="analytics-title">
              <FaChartBar className="title-icon" />
              Analytics Dashboard
            </h2>
            <p className="analytics-subtitle">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="analytics-header-right">
            <CompanySelector
              companies={companies}
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
            />
            <button className="analytics-back-btn" onClick={onClose}>
              <FaChevronLeft /> Back to {navigationContext === 'portal' ? 'Portal' : 'Chat'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="analytics-nav">
          <button
            className={`nav-item ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button
            className={`nav-item ${selectedView === 'companies' ? 'active' : ''}`}
            onClick={() => setSelectedView('companies')}
          >
            <FaBuilding /> Companies
          </button>
          <button
            className={`nav-item ${selectedView === 'domains' ? 'active' : ''}`}
            onClick={() => setSelectedView('domains')}
          >
            <FaGlobe /> Domains
          </button>
          <button
            className={`nav-item ${selectedView === 'realtime' ? 'active' : ''}`}
            onClick={() => setSelectedView('realtime')}
          >
            <FaClock /> Real-time
          </button>
        </div>

        {/* Content */}
        <div className="analytics-content">
          <AnimatePresence mode="wait">
            {selectedView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Overview */}
                <div className="stats-grid">
                  <StatCard
                    title="Total Companies"
                    value={overallData?.overview?.total_companies || 0}
                    icon={FaBuilding}
                    color="#3B82F6"
                  />
                  <StatCard
                    title="Active Projects"
                    value={overallData?.overview?.total_projects || 0}
                    icon={FaProjectDiagram}
                    color="#10B981"
                  />
                  <StatCard
                    title="Total Users"
                    value={overallData?.overview?.total_users || 0}
                    icon={FaUsers}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title="Documents Generated"
                    value={overallData?.overview?.total_documents || 0}
                    icon={FaFileContract}
                    color="#F59E0B"
                  />
                  <StatCard
                    title="Signed Documents"
                    value={overallData?.overview?.total_signed_documents || 0}
                    icon={FaHandshake}
                    color="#EF4444"
                  />
                  <StatCard
                    title="Conversations"
                    value={overallData?.overview?.total_conversations || 0}
                    icon={FaCheckCircle}
                    color="#06B6D4"
                  />
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                  <ChartCard title="Project Status Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getProjectStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getProjectStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Monthly Trends">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getMonthlyTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="conversations" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Document Status">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDocumentStatusData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Sector Analysis">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatChartData(overallData?.sector_analysis, 'sector', 'count')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </motion.div>
            )}

            {selectedView === 'companies' && selectedCompany && (
              <motion.div
                key="companies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {companyData && (
                  <>
                    <div className="company-header">
                      <h3>{companyData.company.company_name}</h3>
                      <p>Sector: {companyData.company.sector}</p>
                    </div>
                    
                    <div className="stats-grid">
                      <StatCard
                        title="Total Projects"
                        value={companyData.overview.total_projects}
                        icon={FaProjectDiagram}
                        color="#3B82F6"
                      />
                      <StatCard
                        title="Active Projects"
                        value={companyData.overview.active_projects}
                        icon={FaCheckCircle}
                        color="#10B981"
                      />
                      <StatCard
                        title="Documents"
                        value={companyData.overview.total_documents}
                        icon={FaFileContract}
                        color="#F59E0B"
                      />
                      <StatCard
                        title="Team Members"
                        value={companyData.overview.team_members}
                        icon={FaUsers}
                        color="#8B5CF6"
                      />
                    </div>

                    <div className="charts-grid">
                      <ChartCard title="Company Activity Timeline">
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={formatChartData(companyData.monthly_activity, 'month', 'count')}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F620" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      <ChartCard title="Project Domains">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={formatChartData(companyData.project_domains, 'domain', 'count')}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {selectedView === 'domains' && (
              <motion.div
                key="domains"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="charts-grid">
                  <ChartCard title="Domain Distribution">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={formatChartData(domainData?.domain_stats, 'domain', 'count')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Sector vs Projects">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={formatChartData(domainData?.sector_stats, 'sector', 'project_count')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </motion.div>
            )}

            {selectedView === 'realtime' && (
              <motion.div
                key="realtime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="realtime-grid">
                  <StatCard
                    title="Active Sessions"
                    value={realTimeData?.active_sessions || 0}
                    icon={FaUsers}
                    color="#10B981"
                  />
                  <StatCard
                    title="Pending Signatures"
                    value={realTimeData?.pending_signatures || 0}
                    icon={FaFileContract}
                    color="#F59E0B"
                  />
                  <StatCard
                    title="Recent Conversations"
                    value={realTimeData?.recent_activity?.new_conversations || 0}
                    icon={FaCheckCircle}
                    color="#3B82F6"
                  />
                  <StatCard
                    title="New Documents"
                    value={realTimeData?.recent_activity?.new_documents || 0}
                    icon={FaFileContract}
                    color="#8B5CF6"
                  />
                </div>

                <div className="realtime-info">
                  <p>Last updated: {realTimeData?.timestamp ? new Date(realTimeData.timestamp).toLocaleTimeString() : 'Never'}</p>
                  <button onClick={fetchRealTimeData} className="refresh-btn">
                    <FaSync /> Refresh Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
