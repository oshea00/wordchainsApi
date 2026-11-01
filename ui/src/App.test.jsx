import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

vi.mock('axios');

async function search(from, to) {
  const user = userEvent.setup();
  render(<App />);
  if (from) await user.type(screen.getByLabelText('From'), from);
  if (to) await user.type(screen.getByLabelText('To'), to);
  await user.click(screen.getByRole('button', { name: 'Search' }));
}

beforeEach(() => {
  vi.resetAllMocks();
});

test('renders the search form and the rules', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Word Chains Finder' })).toBeInTheDocument();
  expect(screen.getByLabelText('From')).toBeInTheDocument();
  expect(screen.getByLabelText('To')).toBeInTheDocument();
  expect(screen.getByText('same length')).toBeInTheDocument();
  expect(screen.getByText(/2 to 8 letters\. 3 to 6 letters work best/)).toBeInTheDocument();
});

test('credits the word list', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'SCOWL' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Credits and license' }))
    .toHaveAttribute('href', '/third-party-notices.txt');
});

test('shows the chain returned by the API', async () => {
  axios.get.mockResolvedValue({ data: ['cat', 'cot', 'dot', 'dog'] });
  await search('Cat', 'dog');
  const chain = await screen.findByRole('region', { name: 'Word chain' });
  expect(within(chain).getByRole('heading', { name: '3 steps' })).toBeInTheDocument();
  expect(within(chain).getAllByRole('listitem').map(item => item.textContent))
    .toEqual(['cat', 'cot', 'dot', 'dog']);
  expect(axios.get.mock.calls[0][1].params).toEqual({ from: 'cat', to: 'dog' });
});

test('highlights the letter that changed at each step', async () => {
  axios.get.mockResolvedValue({ data: ['cat', 'cot', 'dot'] });
  await search('cat', 'dot');
  const chain = await screen.findByRole('region', { name: 'Word chain' });
  expect([...chain.querySelectorAll('mark')].map(mark => mark.textContent)).toEqual(['o', 'd']);
});

test('explains when the words are the same', async () => {
  axios.get.mockResolvedValue({ data: ['cat'] });
  await search('cat', 'cat');
  expect(await screen.findByRole('heading', { name: /same word/i })).toBeInTheDocument();
});

test('pressing Enter searches', async () => {
  axios.get.mockResolvedValue({ data: ['cat', 'cot'] });
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('From'), 'cat');
  await user.type(screen.getByLabelText('To'), 'cot{Enter}');
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test('disables the button while searching', async () => {
  axios.get.mockReturnValue(new Promise(() => {}));
  await search('cat', 'dog');
  expect(screen.getByRole('button', { name: 'Searching...' })).toBeDisabled();
});

test.each([
  ['cat', 'door', /same length.*"cat" has 3 letters and "door" has 4 letters/],
  ['cat', '', /both boxes/],
  ['c4t', 'dog', /letters only/],
  ['a', 'b', /at least 2 letters/],
])('explains invalid input %s / %s without calling the API', async (from, to, message) => {
  await search(from, to);
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(axios.get).not.toHaveBeenCalled();
});

test('stops typing at 8 letters', () => {
  render(<App />);
  expect(screen.getByLabelText('From')).toHaveAttribute('maxlength', '8');
  expect(screen.getByLabelText('To')).toHaveAttribute('maxlength', '8');
});

test('the hint follows the word lengths', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText(/two words of the same length/i)).toBeInTheDocument();
  await user.type(screen.getByLabelText('From'), 'cat');
  await user.type(screen.getByLabelText('To'), 'door');
  expect(screen.getByText('3 letters and 4 letters: the lengths must match.')).toBeInTheDocument();
  await user.clear(screen.getByLabelText('To'));
  await user.type(screen.getByLabelText('To'), 'dog');
  expect(screen.getByText(/Both 3 letters/)).toBeInTheDocument();
});

test('warns that long words rarely connect', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('From'), 'kitchens');
  await user.type(screen.getByLabelText('To'), 'mountain');
  expect(screen.getByText(/rarely connect/)).toBeInTheDocument();
});

test('shows a busy message when the API is throttled', async () => {
  axios.get.mockRejectedValue({ response: { status: 429 } });
  await search('cat', 'dog');
  expect(await screen.findByRole('alert')).toHaveTextContent(/busy/i);
  expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
});

test.each([
  [{ code: 'not_in_dictionary', words: ['zzz'] }, /"zzz" isn't in our word list/],
  [{ code: 'not_in_dictionary', words: ['zzz', 'qqq'] }, /"zzz" and "qqq" aren't in our word list/],
  [{ code: 'no_chain' }, /No chain connects "cat" and "dog"/],
  [{ code: 'invalid_word' }, /letters only, 2 to 8/],
])('explains API failure %j', async (data, message) => {
  axios.get.mockRejectedValue({ response: { status: 400, data } });
  await search('cat', 'dog');
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.queryByRole('region', { name: 'Word chain' })).not.toBeInTheDocument();
});
