import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ListGroup } from 'react-bootstrap'
import axios from 'axios'
import './App.css';

const API_URL = import.meta.env.VITE_WORDCHAIN_API_URL

const errorMessage = error => error.response?.status === 400
  ? "Please use letters only, up to 20 characters."
  : "The word chain service is busy. Please try again later."

class App extends Component {
  state = {
    from: "",
    to: "",
    chain: [],
    isSearching: false,
    error: ""
  }

  handleSearch = async event => {
    event.preventDefault()
    const from = this.state.from.toLowerCase();
    const to = this.state.to.toLowerCase();

    this.setState({chain: [], error: ""})
    if (from && to && from.length === to.length) {
      this.setState({isSearching: true})
      axios.get(API_URL, { params: { from, to } })
        .then(res => {
          this.setState({chain: res.data, isSearching: false})
        })
        .catch(error => {
          this.setState({error: errorMessage(error), isSearching: false})
        })
    }
  }

  handleChangeFrom = event => { this.setState({ from: event.target.value })}
  handleChangeTo = event => { this.setState({ to: event.target.value })}

  render() {
    const { from, to, isSearching, chain, error} = this.state
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-green">
        <h1 className="code f2-l">Word Chains Finder</h1>
        <form className="mb3" onSubmit={this.handleSearch}>
          <input
            type="text"
            className="pa2 f4"
            placeholder="From word"
            onChange={this.handleChangeFrom}
            value={from} />
          <input
            type="text"
            className="pa2 f4"
            style={{marginLeft: '5px'}}
            placeholder="To word"
            onChange={this.handleChangeTo}
            value={to} />
            <Button 
              style={{ height: '55px', marginLeft: '5px', marginBottom: '9px'}}
              variant="warning"
              onClick={this.handleSearch}
            >
                {isSearching ? "Searching..." : "Search"}
            </Button>
        </form>
        {error && <p role="alert">{error}</p>}
        <ListGroup style={{ width: '250px'}}>
          {chain && chain.map(word=>(
            <ListGroup.Item key={word} >{word}</ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    );
  }

}

export default App;
