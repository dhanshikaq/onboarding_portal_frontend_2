import React from 'react';
import { FaDownload, FaFileExcel, FaFilePdf, FaFileCsv, FaSync } from 'react-icons/fa';

const AnalyticsExport = ({ data, type = 'overall' }) => {
  const exportToCSV = () => {
    if (!data) return;
    
    let csvContent = '';
    let headers = [];
    let rows = [];
    
    switch (type) {
      case 'overview':
        headers = ['Metric', 'Value'];
        rows = [
          ['Total Companies', data.overview?.total_companies || 0],
          ['Total Projects', data.overview?.total_projects || 0],
          ['Total Users', data.overview?.total_users || 0],
          ['Total Conversations', data.overview?.total_conversations || 0],
          ['Total Documents', data.overview?.total_documents || 0],
          ['Signed Documents', data.overview?.total_signed_documents || 0],
        ];
        break;
        
      case 'company':
        headers = ['Metric', 'Value'];
        rows = [
          ['Company Name', data.company?.company_name || ''],
          ['Sector', data.company?.sector || ''],
          ['Revenue', data.company?.revenue || 0],
          ['Total Projects', data.overview?.total_projects || 0],
          ['Active Projects', data.overview?.active_projects || 0],
          ['Team Members', data.overview?.team_members || 0],
          ['Total Documents', data.overview?.total_documents || 0],
        ];
        break;
        
      case 'domain':
        headers = ['Domain', 'Count', 'Companies'];
        rows = (data.domain_stats || []).map(item => [
          item.domain || 'Unknown',
          item.count || 0,
          item.companies || 0
        ]);
        break;
        
      default:
        return;
    }
    
    csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // This would require a PDF generation library like jsPDF
    // For now, we'll just show an alert
    alert('PDF export functionality would be implemented here with jsPDF library');
  };

  const exportToExcel = () => {
    // This would require an Excel generation library like xlsx
    // For now, we'll just show an alert
    alert('Excel export functionality would be implemented here with xlsx library');
  };

  return (
    <div className="export-controls">
      <div className="export-dropdown">
        <button className="export-btn">
          <FaDownload />
          Export
        </button>
        <div className="export-menu">
          <button onClick={exportToCSV} className="export-option">
            <FaFileCsv />
            Export as CSV
          </button>
          <button onClick={exportToExcel} className="export-option">
            <FaFileExcel />
            Export as Excel
          </button>
          <button onClick={exportToPDF} className="export-option">
            <FaFilePdf />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExport;
