import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { FaComments, FaUser, FaClock } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { voteQuestion } from '../../reducers/questionSlice';
import { formatDate } from '../../utils/timeFormat';
import VoteButtons from '../Shared/VoteButtons';
import './QuestionCard.css';

const QuestionCard = ({ question }) => {
  const dispatch = useDispatch();

  if (!question || !question._id) {
    return null;
  }

  const voteCount = question.voteCount ?? 0;
  const answerCount = question.answerCount || (Array.isArray(question.answers) ? question.answers.length : 0);
  const authorName = question.author?.name || 'Anonymous';

  return (
    <Card className="mb-2 qcard">
      <Card.Body className="p-3">
        <div className="d-flex gap-2">
          {/* Stats Column */}
          <div className="d-flex flex-column align-items-center gap-1 qcard-stats-col">
            <VoteButtons
              voteCount={voteCount}
              authorId={question.author?._id}
              onVote={async (voteType) => {
                try {
                  await dispatch(voteQuestion({ question, voteType })).unwrap();
                } catch (error) {
                  alert(`Failed to ${voteType} question: ${error}`);
                }
              }}
              variant="link"
              upClassName="p-0 text-decoration-none qcard-vote-btn"
              downClassName="p-0 text-decoration-none qcard-vote-btn"
              countClassName="qcard-vote-count"
              upIconClassName="qcard-icon-up"
              downIconClassName="qcard-icon-down"
              itemType="question"
            />
            <div className="d-flex align-items-center gap-1 text-muted mt-1">
              <FaComments className="qcard-icon-comments" />
              <span className="qcard-answer-count">{answerCount}</span>
            </div>
          </div>

          {/* Content Column */}
          <div className="flex-grow-1">
            <Card.Title className="mb-2">
              <Link to={`/question/${question._id}`} className="qcard-title-link">
                {question.title}
              </Link>
            </Card.Title>

            <Card.Text className="mb-2 qcard-desc">
              {question.description}
            </Card.Text>

            {/* Tags */}
            <div className="mb-2">
              {question.tags && Array.isArray(question.tags) && question.tags.map((tag, idx) => (
                <Badge key={tag._id || idx} className="me-2 mb-1 qcard-tag-badge">
                  {tag.name || tag}
                </Badge>
              ))}
            </div>

            {/* Meta Info */}
            <div className="d-flex align-items-center gap-3 qcard-meta">
              <span className="d-flex align-items-center gap-1">
                <FaUser className="qcard-icon-sm" />
                <strong className="qcard-author">{authorName}</strong>
              </span>
              <span className="d-flex align-items-center gap-1">
                <FaClock className="qcard-icon-xs" />
                <span>Asked {formatDate(question.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuestionCard;
