import React, { Component } from 'react';
import axios from 'axios'
import { CREW, Owl } from './mascots'
import './theme.css';
import './App.css';

const API_URL = import.meta.env.VITE_WORDCHAIN_API_URL

const MIN_LETTERS = 2
const MAX_LETTERS = 8
const BEST_MAX_LETTERS = 6

const CARD_COLORS = ['#ffb4c8', '#b7e86a', '#9ed8ff', '#ffc27a', '#d4b8ff']
const CARD_TILTS = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg']

const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`

const validate = (from, to) => {
  if (!from || !to) return "Enter a word in both boxes."
  if (!/^[a-z]+$/.test(from + to)) return "Please use letters only."
  if (from.length < MIN_LETTERS || to.length < MIN_LETTERS) {
    return `Words need at least ${MIN_LETTERS} letters.`
  }
  if (from.length !== to.length) {
    return `Both words must be the same length: "${from}" has ${plural(from.length, 'letter')} and "${to}" has ${plural(to.length, 'letter')}.`
  }
  return ""
}

const lengthHint = (from, to) => {
  if (!from || !to) return `Use two words of the same length, ${MIN_LETTERS} to ${MAX_LETTERS} letters.`
  if (from.length !== to.length) {
    return `${plural(from.length, 'letter')} and ${plural(to.length, 'letter')}: the lengths must match.`
  }
  return from.length > BEST_MAX_LETTERS
    ? `Both ${from.length} letters. Words this long rarely connect, but try it!`
    : `Both ${from.length} letters. Good to go.`
}

const errorMessage = (error, from, to) => {
  const data = error.response?.data
  switch (data?.code) {
    case 'not_in_dictionary':
      return data.words.length === 1
        ? `"${data.words[0]}" isn't in our word list. Names and abbreviations aren't included.`
        : `"${data.words[0]}" and "${data.words[1]}" aren't in our word list. Names and abbreviations aren't included.`
    case 'no_chain':
      return `No chain connects "${from}" and "${to}". Try shorter or more common words.`
    case 'length_mismatch':
      return validate(from, to)
    case 'invalid_word':
      return `Please use letters only, ${MIN_LETTERS} to ${MAX_LETTERS} characters.`
    default:
      return "The word chain service is busy. Please try again later."
  }
}

const ChainWord = ({ word, previous }) => (
  <span className="chain-word">
    {[...word].map((letter, i) => previous && letter !== previous[i]
      ? <mark key={i}>{letter}</mark>
      : <span key={i}>{letter}</span>)}
  </span>
)

const ChainCard = ({ word, previous, step }) => {
  const Critter = CREW[step % CREW.length]
  return (
    <li style={{
      '--card': CARD_COLORS[step % CARD_COLORS.length],
      '--tilt': CARD_TILTS[step % CARD_TILTS.length],
      '--step': step,
    }}>
      <div className="card-critter"><Critter happy={step > 0 && step % CREW.length === 0} /></div>
      <ChainWord word={word} previous={previous} />
    </li>
  )
}

class App extends Component {
  state = {
    from: "",
    to: "",
    chain: [],
    isSearching: false,
    error: "",
    noChain: false
  }

  handleSearch = event => {
    event.preventDefault()
    const from = this.state.from.trim().toLowerCase();
    const to = this.state.to.trim().toLowerCase();

    const invalid = validate(from, to)
    this.setState({chain: [], error: invalid, noChain: false})
    if (invalid) return

    this.setState({isSearching: true})
    axios.get(API_URL, { params: { from, to } })
      .then(res => {
        this.setState({chain: res.data, isSearching: false})
      })
      .catch(error => {
        this.setState({
          error: errorMessage(error, from, to),
          noChain: error.response?.data?.code === 'no_chain',
          isSearching: false
        })
      })
  }

  handleChangeFrom = event => { this.setState({ from: event.target.value })}
  handleChangeTo = event => { this.setState({ to: event.target.value })}

  render() {
    const { from, to, isSearching, chain, error, noChain } = this.state
    const steps = chain.length - 1
    return (
      <div className="page">
        <main>
          <h1>Word Chains Finder</h1>
          <p className="intro">
            The crew passes one word along, changing one letter at a time.
            Every step must be a real word.
          </p>
          <ul className="rules">
            <li>Both words must be the <strong>same length</strong>.</li>
            <li>Use {MIN_LETTERS} to {MAX_LETTERS} letters. {MIN_LETTERS + 1} to {BEST_MAX_LETTERS} letters work best. <a href="/how-it-works.html">How it works</a></li>
          </ul>

          <form className="search" onSubmit={this.handleSearch} noValidate>
            <div className="field">
              <label htmlFor="from-word">From</label>
              <input
                id="from-word"
                type="text"
                placeholder="From word"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck="false"
                maxLength={MAX_LETTERS}
                onChange={this.handleChangeFrom}
                value={from} />
            </div>
            <div className="field">
              <label htmlFor="to-word">To</label>
              <input
                id="to-word"
                type="text"
                placeholder="To word"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck="false"
                maxLength={MAX_LETTERS}
                onChange={this.handleChangeTo}
                value={to} />
            </div>
            <button className="search-button" type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </button>
            <p className="hint" aria-live="polite">{lengthHint(from.trim(), to.trim())}</p>
          </form>

          {error && (
            <div className="error" role="alert">
              <div className="error-critter"><Owl sleepy={noChain} /></div>
              <p>{error}</p>
            </div>
          )}

          {!error && chain.length === 0 && (
            <div className="crew">
              {CREW.map((Critter, i) => <div key={i}><Critter /></div>)}
            </div>
          )}

          {chain.length > 0 && (
            <section className="result" aria-label="Word chain">
              <h2>{steps === 0 ? "Same word, no steps needed" : plural(steps, 'step')}</h2>
              <ol className="chain">
                {chain.map((word, i) => (
                  <ChainCard key={word} word={word} previous={chain[i - 1]} step={i} />
                ))}
              </ol>
            </section>
          )}
        </main>
        <footer>
          Word list derived from <a href="http://wordlist.aspell.net/">SCOWL</a> by Kevin Atkinson.{' '}
          <a href="/third-party-notices.txt">Credits and license</a>
          {' · '}
          <a href="/how-it-works.html">How it works</a>
        </footer>
      </div>
    );
  }

}

export default App;
