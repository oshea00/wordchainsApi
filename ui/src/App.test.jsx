import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

vi.mock('axios');

async function search(from, to) {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByPlaceholderText('From word'), from);
  await user.type(screen.getByPlaceholderText('To word'), to);
  await user.click(screen.getByRole('button', { name: 'Search' }));
}

beforeEach(() => {
  vi.resetAllMocks();
});

test('renders the search form', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Word Chains Finder' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('From word')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('To word')).toBeInTheDocument();
});

test('shows the chain returned by the API', async () => {
  axios.get.mockResolvedValue({ data: ['cat', 'cot', 'dot', 'dog'] });
  await search('Cat', 'dog');
  expect(await screen.findByText('cot')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  expect(axios.get.mock.calls[0][1].params).toEqual({ from: 'cat', to: 'dog' });
});

test('does not call the API when word lengths differ', async () => {
  await search('cat', 'door');
  expect(axios.get).not.toHaveBeenCalled();
});

test('shows a busy message when the API is throttled', async () => {
  axios.get.mockRejectedValue({ response: { status: 429 } });
  await search('cat', 'dog');
  expect(await screen.findByRole('alert')).toHaveTextContent(/busy/i);
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
});

test('explains rejected input', async () => {
  axios.get.mockRejectedValue({ response: { status: 400 } });
  await search('c4t', 'd0g');
  expect(await screen.findByRole('alert')).toHaveTextContent(/letters/i);
});
