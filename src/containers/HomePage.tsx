import * as React from 'react';
import {Component} from 'react';
import {Home} from '../components/Home';

export default class HomePage extends Component {
  render() {
    return <Home>{this.props.children}</Home>;
  }
}
