import { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaRegLightbulb } from 'react-icons/fa';

import { summarizeAnswers } from '../../services/aiService.js';
import './AnswerSummary.css';

// Matches MIN_ANSWERS_FOR_SUMMARY on the backend.
const MIN_ANSWERS_FOR_SUMMARY = 3;

/**
 * "Summarize Answers" control plus the dismissible TL;DR banner it produces.
 * Dismissing the banner clears the summary, which brings the button back so the
 * summary can be regenerated.
 */
const AnswerSummary = ({ questionId, answers }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;

  const hasEnoughAnswers = (answers?.length || 0) >= MIN_ANSWERS_FOR_SUMMARY;

  // The feature is available only to logged-in users on well-answered questions.
  if (!isAuthenticated || !hasEnoughAnswers) {
    return null;
  }

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await summarizeAnswers(questionId, userInfo.token);
      setSummary(result.summary);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not summarize the answers. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asum-wrapper">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {summary ? (
        <Alert
          variant="info"
          dismissible
          onClose={() => setSummary(null)}
          className="asum-banner"
        >
          <Alert.Heading as="h6" className="asum-banner-heading">
            <FaRegLightbulb className="me-2" />
            TL;DR — AI summary of {answers.length} answers
          </Alert.Heading>
          <p className="asum-banner-text">{summary}</p>
        </Alert>
      ) : (
        <Button
          type="button"
          variant="outline-primary"
          className="asum-btn"
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Summarizing answers...
            </>
          ) : (
            <>
              <FaRegLightbulb className="me-2" />
              Summarize Answers
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default AnswerSummary;
