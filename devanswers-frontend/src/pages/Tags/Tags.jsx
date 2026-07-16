import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { FaTags, FaSearch, FaQuestionCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAllTags } from '../../services/tagService.js';
import './Tags.css';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(tags);
    }
  }, [searchQuery, tags]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await getAllTags();
      setTags(data);
      setFilteredTags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center tags-loading-container">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="tags-loading-spinner" />
          <p className="mt-3 text-muted">Loading tags...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 tags-error-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 tags-page-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={11} xl={10}>
          {/* Header Section */}
          <Card className="mb-4 tags-header-card">
            <Card.Body className="p-3 p-sm-4">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mb-3 gap-2">
                <FaTags className="tags-icon" />
                <div>
                  <h2 className="mb-2 tags-title">Tags</h2>
                  <p className="mb-0 tags-desc">
                    A tag is a keyword or label that categorizes your question with other, similar questions.
                  </p>
                </div>
              </div>
              
              {/* Search Bar */}
              <InputGroup>
                <InputGroup.Text className="tags-search-prepend">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="tags-search-input"
                />
              </InputGroup>
            </Card.Body>
          </Card>

          {/* Tags Grid */}
          <div className="mb-3 tags-count">
            <strong>{filteredTags.length}</strong> {filteredTags.length === 1 ? 'tag' : 'tags'}
          </div>

          {filteredTags.length > 0 ? (
            <Row>
              {filteredTags.map((tag) => (
                <Col key={tag._id} xs={12} sm={6} lg={4} xl={3} className="mb-4">
                  <Link 
                    to={`/?tag=${tag._id}`}
                    className="tag-card-link"
                  >
                    <Card className="tag-card">
                      <Card.Body className="p-3">
                        <Badge className="tag-card-badge">
                          {tag.name}
                        </Badge>
                        
                        <div className="d-flex align-items-center gap-2 text-muted tag-card-meta">
                          <FaQuestionCircle className="tag-card-question-icon" />
                          <span>
                            <strong className="tag-card-question-count">{tag.questionCount}</strong>{' '}
                            {tag.questionCount === 1 ? 'question' : 'questions'}
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="tag-card-cta">
                            View questions →
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <Card className="tags-empty-card">
                <Card.Body className="p-5">
                  <FaTags className="tags-empty-icon" />
                  <h4 className="text-muted">No tags found</h4>
                  <p className="text-muted">Try adjusting your search query</p>
                </Card.Body>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Tags;
