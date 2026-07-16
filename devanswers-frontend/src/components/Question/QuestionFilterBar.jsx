import { InputGroup, FormControl, Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown } from 'react-icons/fa';
import './QuestionList.css';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'votes', label: 'Most Votes' },
    { value: 'answers', label: 'Most Answers' },
];

const QuestionFilterBar = ({ searchQuery, onSearch, sortBy, onSort }) => {
    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

    return (
        <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
            <InputGroup className="qlist-search-group">
                <InputGroup.Text className="qlist-search-icon">
                    <FaSearch size={14} />
                </InputGroup.Text>
                <FormControl
                    className="qlist-search-input"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </InputGroup>

            <Dropdown as={ButtonGroup}>
                <Button variant="outline-secondary" className="qlist-sort-btn">
                    <FaSortAmountDown size={14} />
                    {currentSortLabel}
                </Button>
                <Dropdown.Toggle split variant="outline-secondary" className="qlist-sort-toggle" />
                <Dropdown.Menu>
                    {SORT_OPTIONS.map(({ value, label }) => (
                        <Dropdown.Item
                            key={value}
                            active={sortBy === value}
                            onClick={() => onSort(value)}
                        >
                            {label}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export { SORT_OPTIONS };
export default QuestionFilterBar;
