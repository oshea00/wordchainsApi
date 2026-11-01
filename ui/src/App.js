import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ListGroup } from 'react-bootstrap'
import axios from 'axios'
import './App.css';


class App extends Component {
  state = {
    from: "",
    to: "",
    chain: [],
    isSearching: false
  }

  handleSearch = async event => {
    event.preventDefault()
    const from = this.state.from.toLowerCase();
    const to = this.state.to.toLowerCase();

    if (from && to && from.length === to.length) {
      this.setState({isSearching: true})
      axios.get(`https://vpce-056d3cd2ffde7eba3-j01dp3hg-us-east-1a.execute-api.us-east-1.vpce.amazonaws.com/dev/wordchain?from=${from}&to=${to}`, {
        headers: {
          'x-api-key' : 'CkW9N1eIM83VpgCJIjSvTaXuOqFI7qvV6Mfo60yn',
          'x-apigw-api-id' : '3vu32re33m'
        }
      })
      // axios.get(`https://qux5svesmk.execute-api.us-west-2.amazonaws.com/dev/wordchain?from=${from}&to=${to}`, {
      //   headers: {
      //     'x-api-key' : 'lw1VY5iWCk9zfU0Yx2ycG7giLiKmkJgn9FDk4xjT',
      //   }
      // })
      .then(res => {
        this.setState({chain: res.data, isSearching: false})
      })
    }
    this.setState({chain:[]})
  }

  handleChangeFrom = event => { this.setState({ from: event.target.value })}
  handleChangeTo = event => { this.setState({ to: event.target.value })}

  render() {
    const { from, to, isSearching, chain} = this.state
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
