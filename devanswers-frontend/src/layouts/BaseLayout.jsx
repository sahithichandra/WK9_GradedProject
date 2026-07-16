import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { Container } from 'react-bootstrap';
import './BaseLayout.css';

const BaseLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 base-main">
        <Container fluid className="p-0">
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default BaseLayout;