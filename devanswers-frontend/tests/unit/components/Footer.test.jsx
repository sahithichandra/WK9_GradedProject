import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../../../src/components/Footer/Footer';

describe('Footer Component', () => {
  it('renders the footer text', () => {
    render(<Footer />);
    expect(screen.getByText(/Copyright 2025/i)).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
