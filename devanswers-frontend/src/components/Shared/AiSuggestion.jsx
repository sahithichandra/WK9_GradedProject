import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes, FaMagic } from 'react-icons/fa';
import './AiSuggestion.css';

/**
 * Renders a single AI suggestion inline beneath a form field, with independent
 * accept / reject controls. Buttons are explicitly type="button" so that acting
 * on a suggestion never submits the surrounding form.
 */
const AiSuggestion = ({ label, onAccept, onReject, children }) => (
  <div className="ai-suggestion" role="group" aria-label={label}>
    <div className="ai-suggestion-header">
      <FaMagic className="ai-suggestion-icon" />
      <span className="ai-suggestion-label">{label}</span>
    </div>

    <div className="ai-suggestion-body">{children}</div>

    <div className="ai-suggestion-actions">
      <Button
        type="button"
        size="sm"
        variant="success"
        className="ai-suggestion-btn"
        onClick={onAccept}
      >
        <FaCheck className="me-1" />
        Accept
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        className="ai-suggestion-btn"
        onClick={onReject}
      >
        <FaTimes className="me-1" />
        Reject
      </Button>
    </div>
  </div>
);

export default AiSuggestion;
