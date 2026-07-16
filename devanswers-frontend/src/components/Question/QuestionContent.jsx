import { Card, Row, Col, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { FaUser, FaClock } from 'react-icons/fa';
import { voteQuestion } from '../../reducers/questionSlice';
import { formatDate } from '../../utils/timeFormat';
import VoteButtons from '../Shared/VoteButtons';
import './QuestionContent.css';

const QuestionContent = ({ question }) => {
  
  const dispatch = useDispatch();

  return (
    <>
      {/* Question Header */}
      <Card className="mb-4 qcontent-header-card">
        <Card.Body className="p-3 p-sm-4">
          <Card.Title as="h2" className="mb-3 qcontent-title">
            {question.title}
          </Card.Title>
          <div className="d-flex flex-wrap gap-3 gap-sm-4 qcontent-meta">
            <span className="d-flex align-items-center gap-2">
              <FaClock />
              Asked {formatDate(question.createdAt)}
            </span>
          </div>
        </Card.Body>
      </Card>

      {/* Question Content */}
      <Card className="mb-4 qcontent-body-card">
        <Card.Body className="p-3 p-sm-4">
          <Row>
            {/* Voting Controls */}
            <Col xs="auto" className="d-flex flex-column align-items-center pe-3 pe-sm-4">
              <VoteButtons
                voteCount={question.voteCount}
                authorId={question.author?._id}
                onVote={(voteType) => dispatch(voteQuestion({ question, voteType }))}
                variant="outline-secondary"
                upClassName="mb-2 qcontent-vote-btn"
                downClassName="mt-2 qcontent-vote-btn"
                countClassName="qcontent-vote-count"
                upIconClassName="qcontent-icon-up"
                downIconClassName="qcontent-icon-down"
                itemType="question"
              />
            </Col>
            
            {/* Main Content */}
            <Col>
              <div className="mb-4 qcontent-description">
                {question.description}
              </div>
              
              <div className="mb-4">
                {question.tags?.map((tag) => (
                  <Badge 
                    key={tag._id} 
                    className="me-2 mb-2 qcontent-tag-badge"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              
              <div 
                className="d-flex align-items-center gap-2 qcontent-author-row" 
              >
                <FaUser className="qcontent-icon-sm" />
                <span>Posted by </span>
                <strong className="qcontent-author-name">{question.author?.name}</strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default QuestionContent;
