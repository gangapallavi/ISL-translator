import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for redirection
import '../styles/Home.css';

const Home = ({ user, onLogout }) => {
  const navigate = useNavigate(); // Hook for navigation
  const [stats, setStats] = useState({
    totalLogins: 0,
    lastLogin: '',
    accountAge: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentUser, setCurrentUser] = useState(user);
  const [updateError, setUpdateError] = useState('');
  
  useEffect(() => {
    // Simulate fetching user stats and activities from backend
    const fetchUserData = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // For demo purposes, we're creating mock data
        setTimeout(() => {
          // Mock stats
          setStats({
            totalLogins: Math.floor(Math.random() * 20) + 1,
            lastLogin: new Date().toLocaleString(),
            accountAge: Math.floor(Math.random() * 30) + 1
          });
          
          // Mock activities
          const mockActivities = [
            { id: 1, type: 'login', description: 'Logged in successfully', date: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: 2, type: 'profile_update', description: 'Updated profile picture', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 3, type: 'settings', description: 'Changed notification settings', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
          ];
          
          setActivities(mockActivities);
          setLoading(false);
        }, 1000); // Simulate network delay
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
    setCurrentUser(user);
    setNewName(user.name);
  }, [user]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      // Reset any previous errors
      setUpdateError('');
      
      // Get the token from localStorage or wherever it's stored in your app
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUpdateError('Authentication error. Please log in again.');
        return;
      }
      
      // Make API call to update the username
      const response = await fetch('http://localhost:5000/api/user/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ name: newName })
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check your API endpoint.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update name');
      }
      
      // Update local state with the updated user data
      setCurrentUser({
        ...currentUser,
        name: data.user.name
      });
      
      // Add a new activity for the name change
      const nameChangeActivity = {
        id: Date.now(),
        type: 'profile_update',
        description: 'Changed user name',
        date: new Date().toISOString()
      };
      
      setActivities([nameChangeActivity, ...activities]);
      setIsEditingProfile(false);
      
    } catch (error) {
      console.error('Error updating name:', error);
      setUpdateError(error.message || 'Error updating profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setNewName(currentUser.name);
    setIsEditingProfile(false);
  };
  
  const toggleAccountSettings = () => {
    setShowAccountSettings(!showAccountSettings);
  };
  
  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Call the logout handler passed from parent component if it exists
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login page - using window.location for a hard redirect
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome, {currentUser.name}!</h1>
        <p>Here's what's happening with your account today.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card stats-card">
          <h2>Account Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalLogins}</span>
              <span className="stat-label">Total Logins</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.accountAge} days</span>
              <span className="stat-label">Account Age</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Profile Complete</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{currentUser.name.charAt(0)}</span>
            </div>
            <div className="profile-info">
              {isEditingProfile ? (
                <div className="edit-profile-form">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={newName}
                    onChange={handleNameChange}
                    className="name-input"
                  />
                </div>
              ) : (
                <>
                  <h3>{currentUser.name}</h3>
                  <p>{currentUser.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="profile-actions">
            {isEditingProfile ? (
              <>
                <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                <button className="btn btn-outline" onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={handleEditProfile}>Edit Profile</button>
                <button className="btn btn-outline" onClick={toggleAccountSettings}>Account Settings</button>
              </>
            )}
          </div>
          
          {/* Account Settings Panel - With Logout that Redirects */}
          {showAccountSettings && (
            <div className="account-settings-panel">
              <div className="logout-container">
                <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span> Log Out
                </button>
               
              </div>
            </div>
          )}
        </div>
        
        <div className="dashboard-card activity-card">
          <h2>Recent Activity</h2>
          {activities.length > 0 ? (
            <ul className="activity-list">
              {activities.map(activity => (
                <li key={activity.id} className={`activity-item ${activity.type}`}>
                  <div className="activity-icon"></div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">
                      {new Date(activity.date).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No recent activities found.</p>
          )}
        </div>
        
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">📝</span>
              <span>New Post</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔒</span>
              <span>Security</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
            <button className="action-btn" onClick={toggleAccountSettings}>
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;