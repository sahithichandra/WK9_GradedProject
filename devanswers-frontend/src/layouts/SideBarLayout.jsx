import Navbar from '../components/Navbar/Navbar.jsx';
import RightSideBarLayout from './RightSidebarLayout.jsx';
import { Container, Row, Col } from 'react-bootstrap';
import './SideBarLayout.css';

const SideBarLayout = ({ children }) => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Left Sidebar (Navbar) */}
        <Col
          xs={12}
          md={3}
          lg={2}
          className="d-none d-md-block sidebar-left"
        >
          <Navbar />
        </Col>
        {/* Main Content */}
        <Col xs={12} className="sidebar-main-content">
          {children}
        </Col>
        {/* Right Sidebar */}
        <Col
          lg={2}
          className="d-none d-lg-block sidebar-right"
        >
          <RightSideBarLayout />
        </Col>
      </Row>
    </Container>
  );
};

export default SideBarLayout;