import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the app title and all three tabs', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /rotom earpiece/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /damage calculator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /team builder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /battle tracker/i })).toBeInTheDocument();
  });
});
