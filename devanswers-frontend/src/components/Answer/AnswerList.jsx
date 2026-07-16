import { Card, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { FaUser, FaClock } from 'react-icons/fa';
import { voteAnswer } from '../../reducers/questionSlice';
import { formatDate } from '../../utils/timeFormat';
import VoteButtons from '../Shared/VoteButtons';
import './AnswerList.css';

const AnswerList = ({ answers }) => {
  const dispatch = useDispatch();

  return (
    <Card className="alist-card">
      <Card.Body className="p-3">
        <h4 className="mb-3 alist-title">
          {answers?.length || 0} {answers?.length === 1 ? "Answer" : "Answers"}
        </h4>
        {answers && answers.length > 0 ? (
          answers.map((answer) => (
            <Card
              key={answer._id}
              className="mb-1 alist-answer-card"
            >
              <Card.Body className="p-2">
                <Row>
                  {/* Voting Controls */}
                  <Col xs="auto" className="d-flex flex-column align-items-center align-self-start pe-3">
                    <VoteButtons
                      voteCount={answer.voteCount}
                      authorId={answer.author?._id}
                      onVote={(voteType) => dispatch(voteAnswer({ answer, voteType }))}
                      variant="outline-secondary"
                      upClassName="alist-vote-btn alist-vote-btn-up"
                      downClassName="alist-vote-btn alist-vote-btn-down"
                      countClassName="alist-vote-count"
                      upIconClassName="alist-icon-up"
                      downIconClassName="alist-icon-down"
                      itemType="answer"
                    />
                  </Col>
                  
                  {/* Answer Content */}
                  <Col>
                    <div 
                      className="mb-2 alist-content" 
                    >
                      {answer.answerText}
                    </div>
                    <div 
                      className="mt-2 d-flex align-items-center gap-2 alist-meta" 
                    >
                      <FaUser className="alist-icon-sm" />
                      <span>Answered by </span>
                      <strong className="alist-author">{answer.author?.name}</strong>
                      {answer.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <FaClock className="alist-icon-sm" />
                          <span>{formatDate(answer.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="mb-0 alist-meta">No answers yet. Be the first to answer!</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AnswerList;