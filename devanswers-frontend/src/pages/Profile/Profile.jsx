import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaSave, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API } from '../../config/config.js';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalVotesReceived: 0,
    reputation: 0
  });
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    bio: '',
    location: '',
    website: '',    
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (userInfo?.userId) {
      fetchUserStats();
    }
  }, [isAuthenticated, navigate, userInfo]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(USER_API.STATS(userInfo.userId));
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: For more real world usecase, Implement API call to update profile
      // await updateUserProfile(formData);
      
      // Simulated success
      setTimeout(() => {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 profile-page-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          {/* Profile Header */}
          <Card className="mb-4 profile-header-card">
            <Card.Body className="p-3 p-sm-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                <div>
                  <h2 className="profile-title">My Profile</h2>
                  <p className="text-muted mb-0 profile-subtitle">Manage your account information</p>
                </div>
                {!isEditing && (
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="profile-edit-btn"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Profile Content */}
          <Card className="profile-body-card">
            <Card.Body className="p-4">
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Profile Picture Section */}
                <div className="text-center mb-4 pb-4 profile-section-divider">
                  <div className="profile-avatar">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h4 className="mt-3 mb-1 profile-username">
                    {formData.name || userInfo?.name || 'User'}
                  </h4>
                  <p className="text-muted">Member since January 2026</p>
                </div>

                {/* Form Fields */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="profile-label">
                        <FaUser className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        disabled={!isEditing}
                        className={`profile-input ${isEditing ? 'profile-input-editable' : 'profile-input-readonly'}`}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="profile-label">
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={!isEditing}
                        className={`profile-input ${isEditing ? 'profile-input-editable' : 'profile-input-readonly'}`}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="profile-label">
                    Bio
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    disabled={!isEditing}
                    className={`profile-input ${isEditing ? 'profile-input-editable' : 'profile-input-readonly'}`}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="profile-label">
                        Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., San Francisco, CA"
                        disabled={!isEditing}
                        className={`profile-input ${isEditing ? 'profile-input-editable' : 'profile-input-readonly'}`}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="profile-label">
                        Website
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        disabled={!isEditing}
                        className={`profile-input ${isEditing ? 'profile-input-editable' : 'profile-input-readonly'}`}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex gap-3 justify-content-end mt-4 pt-4 profile-section-divider">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                      }}
                      className="profile-cancel-btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="profile-save-btn"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>

              {/* User Stats Section */}
              {!isEditing && (
                <div className="mt-4 pt-4 profile-section-divider">
                  <h5 className="mb-3 profile-stats-title">Activity Stats</h5>
                  <Row>
                    <Col xs={6} md={3} className="mb-3">
                      <Card className="profile-stat-card">
                        <Card.Body className="p-3">
                          <h3 className="mb-1 profile-stat-num-primary">{stats.totalQuestions}</h3>
                          <p className="mb-0 profile-stat-label">Questions</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={6} md={3} className="mb-3">
                      <Card className="profile-stat-card">
                        <Card.Body className="p-3">
                          <h3 className="mb-1 profile-stat-num-success">{stats.totalAnswers}</h3>
                          <p className="mb-0 profile-stat-label">Answers</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={6} md={3} className="mb-3">
                      <Card className="profile-stat-card">
                        <Card.Body className="p-3">
                          <h3 className="mb-1 profile-stat-num-secondary">{stats.totalVotesReceived}</h3>
                          <p className="mb-0 profile-stat-label">Votes Received</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={6} md={3} className="mb-3">
                      <Card className="profile-stat-card">
                        <Card.Body className="p-3">
                          <h3 className="mb-1 profile-stat-num-primary">{stats.reputation}</h3>
                          <p className="mb-0 profile-stat-label">Reputation</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Alert variant="info" className="mt-3">
                    <small>
                      <strong>💡 How Reputation Works:</strong><br/>
                      • Post a question: <strong>+5 points</strong><br/>
                      • Post an answer: <strong>+10 points</strong><br/>
                      • Receive an upvote: <strong>+10 points</strong><br/>
                      Your reputation reflects your contribution to the community!
                    </small>
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
