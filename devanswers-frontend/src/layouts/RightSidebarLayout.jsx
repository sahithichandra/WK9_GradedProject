import { useEffect, useState } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFire, FaClock } from 'react-icons/fa';
import { getAllTags } from '../services/tagService.js';
import { getAllQuestions } from '../services/questionService.js';
import { getRelativeTime } from '../utils/timeFormat';
import './RightSidebarLayout.css';

const RightSideBarLayout = () => {
  const [hotTags, setHotTags] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    fetchSidebarData();
    
    // Update every 30 seconds for dynamic updates
    const interval = setInterval(fetchSidebarData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSidebarData = async () => {
    try {
      // Fetch tags and questions in parallel
      const [tagsData, questionsData] = await Promise.all([
        getAllTags(),
        getAllQuestions()
      ]);

      // Get top 4 most used tags
      const sortedTags = tagsData
        .sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0))
        .slice(0, 4);
      setHotTags(sortedTags);

      // Get 5 most recent questions
      const sortedQuestions = questionsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentQuestions(sortedQuestions);

      setNetworkError(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
      const isNetwork = error?.code === 'ERR_NETWORK' || error?.message === 'Network Error';
      setNetworkError(isNetwork);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" variant="primary" />
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="sidebar-error text-center py-4 px-3">
        <div className="sidebar-error-icon">🔌</div>
        <p className="mb-0 sidebar-error-title">Sidebar unavailable</p>
        <p className="mb-0 mt-1">Could not connect to the server.</p>
      </div>
    );
  }

  return (
    <div className="sidebar-sticky">
      {/* Hot Tags Section */}
      <Card className="mb-2 sidebar-card">
        <Card.Body className="p-2">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FaFire className="sidebar-hot-tags-icon" />
            <h6 className="mb-0 sidebar-section-title">Hot Tags</h6>
          </div>
          <div className="d-flex flex-column gap-1">
            {hotTags.map((tag) => (
              <Link
                key={tag._id}
                to={`/?tag=${tag._id}`}
                className="sidebar-tag-row d-flex justify-content-between align-items-center"
              >
                <Badge className="sidebar-tag-badge">{tag.name}</Badge>
                <span className="sidebar-tag-count">{tag.questionCount || 0} questions</span>
              </Link>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Recent Questions Section */}
      <Card className="sidebar-card">
        <Card.Body className="p-2">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FaClock className="sidebar-recent-icon" />
            <h6 className="mb-0 sidebar-section-title">Recent Questions</h6>
          </div>
          <div className="d-flex flex-column gap-1">
            {recentQuestions.map((question) => (
              <Link
                key={question._id}
                to={`/question/${question._id}`}
                className="sidebar-question-row d-block"
              >
                <div className="sidebar-question-title">{question.title}</div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="sidebar-question-time">{getRelativeTime(question.createdAt)}</span>
                  {question.voteCount > 0 && (
                    <span className="sidebar-question-votes">+{question.voteCount}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RightSideBarLayout;
