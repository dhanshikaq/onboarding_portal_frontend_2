import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes, FaSearch, FaBuilding } from 'react-icons/fa';
import ApiService from '../services/api';
import './CompanySelector.css';

const CompanySelector = ({ 
  selectedCompany = null, 
  onCompanyChange, 
  placeholder = "Select a company...",
  label = "Select Company",
  showLabel = true,
  compact = false
}) => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  // Filter companies based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => {
        const name = company.company_name.toLowerCase();
        const industry = (company.industry || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || industry.includes(search);
      });
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, companies]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getAllCompanies();
      if (response.success) {
        setCompanies(response.companies);
        setFilteredCompanies(response.companies);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      // Set empty array on error to prevent crashes
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = (company) => {
    onCompanyChange(company);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCompanyRemove = () => {
    onCompanyChange(null);
  };

  const getDisplayName = (company) => {
    return company.company_name;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className={`company-selector ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      {showLabel && <label className="company-selector-label">{label}</label>}
      
      {/* Selected Company Display */}
      {selectedCompany && (
        <div className="selected-company">
          <div className="company-info">
            <FaBuilding className="company-icon" />
            <span className="company-name">{getDisplayName(selectedCompany)}</span>
            {selectedCompany.industry && (
              <span className="company-industry">({selectedCompany.industry})</span>
            )}
          </div>
          <button
            type="button"
            className="remove-company-btn"
            onClick={handleCompanyRemove}
            title="Remove company"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Dropdown Toggle */}
      <div className="dropdown-container">
        <button
          type="button"
          className="dropdown-toggle"
          onClick={toggleDropdown}
          disabled={isLoading}
        >
          <span className="dropdown-placeholder">
            {isLoading ? 'Loading companies...' : placeholder}
          </span>
          <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="dropdown-menu">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="company-list">
              {filteredCompanies.length === 0 ? (
                <div className="no-companies">
                  {searchTerm ? 'No companies found' : 'No companies available'}
                </div>
              ) : (
                filteredCompanies.map(company => {
                  const isSelected = selectedCompany && selectedCompany.company_id === company.company_id;
                  return (
                    <div
                      key={company.company_id}
                      className={`company-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isSelected && handleCompanySelect(company)}
                    >
                      <div className="company-info">
                        <FaBuilding className="company-icon" />
                        <div className="company-details">
                          <div className="company-name">{getDisplayName(company)}</div>
                          {company.industry && (
                            <div className="company-industry">{company.industry}</div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelector;
