import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaMagic } from 'react-icons/fa';

import { postQuestion } from '../../reducers/questionSlice.js';
import { improveQuestion } from '../../services/aiService.js';
import AiSuggestion from '../../components/Shared/AiSuggestion.jsx';

import { Col, Container, Form, Button, Card, Row, Spinner, Alert } from 'react-bootstrap';
import './PostQuestion.css';

const PostQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // AI suggestions are ephemeral form state: each field holds a pending
  // suggestion until the user accepts or rejects it.
  const [suggestions, setSuggestions] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const dismissSuggestion = (field) =>
    setSuggestions((current) => {
      const { [field]: _removed, ...rest } = current;
      return rest;
    });

  const handleImproveWithAi = async () => {
    // The backend enforces this too; this keeps the message useful for the user.
    if (!userInfo) {
      setAiError('You must be logged in to use AI suggestions.');
      return;
    }

    if (!title.trim() && !description.trim()) {
      setAiError('Add a title or description before asking for improvements.');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const improved = await improveQuestion(
        { title, description, tags },
        userInfo?.token,
      );
      setSuggestions(improved);
    } catch (error) {
      setAiError(
        error.response?.data?.message ||
          error.message ||
          'Could not generate improvements. Please try again.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(postQuestion({ title, description, tags }));
      
      if (postQuestion.fulfilled.match(result)) {
        const newQuestion = result.payload;
        alert('Question posted successfully!');
        navigate(`/question/${newQuestion._id}`);
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question. Please try again.');
    }
  };

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 pq-page-container">
      <Row className="justify-content-center">
         <Col xs={12} lg={10} xl={9}>
            <Card className="mb-4 pq-header-card">
              <Card.Body className="p-3 p-sm-4">
                  <Card.Title as="h2" className="pq-title">
                    Ask a Question
                  </Card.Title>
                  <p className="text-muted mb-0">Be specific and imagine you're asking another person</p>
              </Card.Body>
            </Card>

            <Card className="pq-body-card">
              <Card.Body className="p-3 p-sm-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="title" className="pq-label">
                      Title
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's your programming question?"
                      required
                      className="pq-input"
                    />
                    {suggestions.title && (
                      <AiSuggestion
                        label="Suggested title"
                        onAccept={() => {
                          setTitle(suggestions.title);
                          dismissSuggestion('title');
                        }}
                        onReject={() => dismissSuggestion('title')}
                      >
                        {suggestions.title}
                      </AiSuggestion>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="description" className="pq-label">
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more details about your question..."
                      rows={10}
                      required
                      className="pq-textarea"
                    />
                    {suggestions.description && (
                      <AiSuggestion
                        label="Suggested description"
                        onAccept={() => {
                          setDescription(suggestions.description);
                          dismissSuggestion('description');
                        }}
                        onReject={() => dismissSuggestion('description')}
                      >
                        {suggestions.description}
                      </AiSuggestion>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="tags" className="pq-label">
                      Tags (comma-separated)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="tags"
                      name="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., javascript, react, css"
                      className="pq-input"
                    />
                    <Form.Text className="text-muted">
                      Add up to 5 tags to describe what your question is about
                    </Form.Text>
                    {suggestions.tags?.length > 0 && (
                      <AiSuggestion
                        label="Suggested tags"
                        onAccept={() => {
                          setTags(suggestions.tags.join(', '));
                          dismissSuggestion('tags');
                        }}
                        onReject={() => dismissSuggestion('tags')}
                      >
                        <div className="ai-suggestion-tags">
                          {suggestions.tags.map((tag) => (
                            <span key={tag} className="ai-suggestion-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </AiSuggestion>
                    )}
                  </Form.Group>

                  {aiError && (
                    <Alert
                      variant="danger"
                      dismissible
                      onClose={() => setAiError(null)}
                      className="mb-4"
                    >
                      {aiError}
                    </Alert>
                  )}

                  <Button
                    type="button"
                    variant="outline-primary"
                    size="lg"
                    className="w-100 mb-3 ai-improve-btn"
                    onClick={handleImproveWithAi}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Improving your question...
                      </>
                    ) : (
                      <>
                        <FaMagic className="me-2" />
                        Improve with AI
                      </>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 pq-btn"
                  >
                    <FaPaperPlane className="me-2" />
                    Post Question
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </Container>
  );
};

export default PostQuestion;