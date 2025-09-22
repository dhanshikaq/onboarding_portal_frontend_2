import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes, FaSearch } from 'react-icons/fa';
import ApiService from '../services/api';
import './UserSelector.css';

const UserSelector = ({ 
  selectedUsers = [], 
  onUsersChange, 
  placeholder = "Select users...",
  label = "Select Users",
  role = "user"
}) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = user.email_id.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

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

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
        setFilteredUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    // Check if user is already selected
    const isAlreadySelected = selectedUsers.some(selected => selected.user_id === user.user_id);
    
    if (!isAlreadySelected) {
      const updatedUsers = [...selectedUsers, user];
      onUsersChange(updatedUsers);
    }
    
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleUserRemove = (userToRemove) => {
    const updatedUsers = selectedUsers.filter(user => user.user_id !== userToRemove.user_id);
    onUsersChange(updatedUsers);
  };

  const getDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email_id;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="user-selector" ref={dropdownRef}>
      <label className="user-selector-label">{label}</label>
      
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className="selected-users">
          {selectedUsers.map(user => (
            <div key={user.user_id} className="selected-user">
              <span className="user-name">{getDisplayName(user)}</span>
              <span className="user-email">({user.email_id})</span>
              <button
                type="button"
                className="remove-user-btn"
                onClick={() => handleUserRemove(user)}
                title="Remove user"
              >
                <FaTimes />
              </button>
            </div>
          ))}
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
            {isLoading ? 'Loading users...' : placeholder}
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="user-list">
              {filteredUsers.length === 0 ? (
                <div className="no-users">
                  {searchTerm ? 'No users found' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map(user => {
                  const isSelected = selectedUsers.some(selected => selected.user_id === user.user_id);
                  return (
                    <div
                      key={user.user_id}
                      className={`user-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isSelected && handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <div className="user-name">{getDisplayName(user)}</div>
                        <div className="user-details">
                          <span className="user-email">{user.email_id}</span>
                          {user.tag && <span className="user-tag">{user.tag}</span>}
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

export default UserSelector;
