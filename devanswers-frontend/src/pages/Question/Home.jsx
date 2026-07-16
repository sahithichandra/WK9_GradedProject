import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button, Badge } from "react-bootstrap";
import { FaPlus, FaTimes } from 'react-icons/fa';
import './Home.css';

import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../../reducers/questionSlice.js';
import { getQuestionsByTag } from '../../services/tagService.js';
import QuestionList from '../../components/Question/QuestionList.jsx';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { questions, loading, error } = useSelector((state) => state.question);
  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;

  // Tag filter state
  const [taggedQuestions, setTaggedQuestions] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagLoading, setTagLoading] = useState(false);
  const tagId = searchParams.get('tag');

  useEffect(() => {
    if (tagId) {
      fetchQuestionsByTag(tagId);
    } else {
      dispatch(fetchQuestions());
      setTaggedQuestions(null);
      setSelectedTag(null);
    }
  }, [dispatch, tagId]);

  const fetchQuestionsByTag = async (tagId) => {
    setTagLoading(true);
    try {
      const data = await getQuestionsByTag(tagId);
      setTaggedQuestions(data);
      if (data.length > 0 && data[0].tags) {
        const tag = data[0].tags.find((t) => t._id === tagId) || data[0].tags[0];
        if (tag) setSelectedTag(tag);
      }
    } catch (err) {
      console.error('Error fetching tagged questions:', err);
      setTaggedQuestions([]);
    } finally {
      setTagLoading(false);
    }
  };

  const handleAskQuestion = () => {
    if (isAuthenticated) {
      navigate('/ask');
    } else {
      alert('Please log in to ask a question.');
    }
  };

  const handleClearTagFilter = () => {
    setSearchParams({});
  };

  const questionsToDisplay = taggedQuestions !== null ? taggedQuestions : questions;

  if (loading || tagLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center home-loading-container">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="home-loading-spinner" />
          <p className="mt-3 text-muted">Loading questions...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 home-error-container">
        <div className="text-center py-5">
          <h4 className="text-muted">No posts found</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 home-page-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={11} xl={10}>
          {/* Header Section */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
            <h2 className="mb-0 home-title">
              {selectedTag ? `Questions tagged [${selectedTag.name}]` : 'All Questions'}
            </h2>
            <Button
              variant="primary"
              onClick={handleAskQuestion}
              className="d-flex align-items-center gap-2 home-ask-btn"
            >
              <FaPlus size={14} />
              <span className="d-none d-sm-inline">Ask Question</span>
              <span className="d-sm-none">Ask</span>
            </Button>
          </div>

          {/* Tag Filter Badge */}
          {selectedTag && (
            <div className="mb-3">
              <Badge
                className="home-tag-badge"
                onClick={handleClearTagFilter}
              >
                {selectedTag.name}
                <FaTimes className="ms-2 home-tag-clear-icon" />
              </Badge>
              <span className="ms-3 text-muted">Click to clear filter</span>
            </div>
          )}

          {/* Question list with search, sort, and pagination */}
          <QuestionList questions={questionsToDisplay} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;