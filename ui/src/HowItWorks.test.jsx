import React from 'react';
import { render, screen } from '@testing-library/react';
import HowItWorks from './HowItWorks';

test('explains the search and links back to the game', () => {
  render(<HowItWorks />);
  expect(screen.getByRole('heading', { level: 1, name: 'How it works' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Breadth-first search' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Back to Word Chains Finder' })[0]).toHaveAttribute('href', '/');
});

test('links to the code it describes', () => {
  render(<HowItWorks />);
  expect(screen.getByRole('link', { name: 'BFSPaths' }).href).toMatch(/backend\/domain\/BFSPaths\.cs$/);
  expect(screen.getByRole('link', { name: 'HammingOneGraph' }).href).toMatch(/backend\/domain\/WordChains\.cs$/);
});

test('describes the example graph for screen readers', () => {
  render(<HowItWorks />);
  expect(screen.getByRole('img', { name: /cold, cord, word, ward, warm/ })).toBeInTheDocument();
});
