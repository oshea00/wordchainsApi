import React from 'react';
import { Bunny, Owl } from './mascots';
import './theme.css';
import './HowItWorks.css';

const REPO = 'https://github.com/oshea00/wordchainsApi/blob/master'

// Word counts per length from backend/domain/words.txt, and the largest group
// of words that can all reach each other.
const CONNECTIVITY = [
  [2, 62, 62],
  [3, 653, 641],
  [4, 2552, 2416],
  [5, 5062, 3855],
  [6, 8236, 3487],
  [7, 11539, 2242],
  [8, 12627, 459],
]

const NODES = [
  ['cold', 50, 40], ['cord', 170, 40], ['word', 290, 40], ['ward', 410, 40], ['warm', 530, 40],
  ['card', 290, 130], ['core', 170, 130], ['worm', 410, 130],
]
const EDGES = [
  ['cold', 'cord', true], ['cord', 'word', true], ['word', 'ward', true], ['ward', 'warm', true],
  ['cord', 'card'], ['cord', 'core'], ['card', 'ward'], ['word', 'worm'], ['worm', 'warm'],
]
const ON_PATH = ['cold', 'cord', 'word', 'ward', 'warm']
const place = name => NODES.find(node => node[0] === name)

const Graph = () => (
  <svg className="graph" viewBox="0 0 580 170" role="img"
    aria-label="A graph of eight words joined by one-letter changes, with the path cold, cord, word, ward, warm highlighted.">
    {EDGES.map(([a, b, path]) => {
      const [, x1, y1] = place(a)
      const [, x2, y2] = place(b)
      return <line key={a + b} className={path ? 'edge-path' : 'edge'} x1={x1} y1={y1} x2={x2} y2={y2} />
    })}
    {NODES.map(([name, x, y]) => (
      <g key={name}>
        <rect className={ON_PATH.includes(name) ? 'node-path' : 'node'} x={x - 38} y={y - 18} width="76" height="36" rx="10" />
        <text x={x} y={y + 5}>{name}</text>
      </g>
    ))}
  </svg>
)

const HowItWorks = () => (
  <div className="page">
    <main className="article">
      <p><a href="/">Back to Word Chains Finder</a></p>
      <h1>How it works</h1>
      <p className="lede">
        Finding a word chain is a classic computer science problem in disguise:
        it's a shortest-path search through a graph.
      </p>

      <h2>Words as a graph</h2>
      <div className="critter-aside"><Bunny /></div>
      <p>
        A graph is a set of points, called nodes, joined by links, called edges.
        Here, every word is a node, and an edge joins two words that differ by
        exactly one letter. Counting the positions where two words differ gives
        their Hamming distance, so an edge means a Hamming distance of 1.
      </p>
      <p>
        That's why both words must be the same length. A single letter change
        can't add or remove a letter, so words of different lengths are never connected.
      </p>
      <Graph />
      <p>
        A chain is simply a path along the edges. The picture shows a small part
        of the real graph, with the <code>cold</code> to <code>warm</code> chain highlighted.
      </p>

      <h2>Building the graph</h2>
      <p>
        <a href={`${REPO}/backend/domain/WordChains.cs`}><code>HammingOneGraph</code></a> starts
        from your first word. It keeps only dictionary words of the same length,
        then compares the current word with each of them, adds an edge for every
        one-letter neighbour, and repeats from those neighbours. The result holds
        only the words you can reach, so if your second word isn't in it, no chain exists.
      </p>

      <h2>Breadth-first search</h2>
      <p>
        <a href={`${REPO}/backend/domain/BFSPaths.cs`}><code>BFSPaths</code></a> then
        explores outward in rings. It visits every word one step from the start,
        then every word two steps away, and so on, remembering which word led to
        each new one. Because nearer words are always visited first, the first
        time it reaches a word is along a shortest route. Following those
        remembered links backwards from your second word gives the chain.
      </p>
      <p>
        Several chains can tie for shortest. The search returns the first one it
        finds, so your chain is as short as any, though others of the same length may exist.
      </p>

      <h2>Why long words rarely connect</h2>
      <div className="critter-aside"><Owl sleepy /></div>
      <p>
        Longer words have far fewer neighbours, so the graph breaks into tiny
        islands. The table shows the largest group of words that can all reach
        each other, for each length. Words outside that group can only reach a
        handful of others, or none at all.
      </p>
      <div className="table-box">
        <table>
          <thead>
            <tr><th scope="col">Letters</th><th scope="col">Words</th><th scope="col">Largest group</th><th scope="col">Share</th></tr>
          </thead>
          <tbody>
            {CONNECTIVITY.map(([letters, words, group]) => (
              <tr key={letters}>
                <td>{letters}</td>
                <td>{words.toLocaleString('en-US')}</td>
                <td>{group.toLocaleString('en-US')}</td>
                <td>{Math.round(100 * group / words)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Where the words come from</h2>
      <p>
        The list is derived from <a href="http://wordlist.aspell.net/">SCOWL</a> by
        Kevin Atkinson, limited to words of 2 to 8 letters. See
        the <a href="/third-party-notices.txt">credits and license</a>.
      </p>
    </main>
    <footer><a href="/">Back to Word Chains Finder</a></footer>
  </div>
)

export default HowItWorks
