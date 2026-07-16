import { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';
import { postAnswer } from '../../reducers/questionSlice.js';
import './AnswerForm.css';

const AnswerForm = ({ questionId }) => {
  const [answerText, setAnswerText] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("You must be logged in to post an answer.");
      return;
    }

    if (!answerText) {
      alert("Answer cannot be empty!");
      return;
    }

    dispatch(postAnswer({ questionId, answerText }));
    setAnswerText(''); // Clear form after submission
  };

  return (
    <Card className="mt-4 mb-4 aform-card">
      <Card.Body className="p-3 p-sm-4">
        <h5 className="mb-3 mb-sm-4 aform-title">Your Answer</h5>
        <Form onSubmit={handleSubmitAnswer}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              placeholder="Write your answer here..."
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="aform-textarea"
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button 
              type="submit"
              size="lg"
              className="aform-btn"
            >
              <FaPaperPlane className="me-2" />
              Post Answer
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AnswerForm;