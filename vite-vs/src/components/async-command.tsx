import React from 'react';
import {ErrorMessage} from './styled';
export class AsyncCommand extends React.Component<{
  promise: Promise<any>;
  render: any;
}> {
  state = {
    didError: false,
    value: undefined,
  };
  componentDidCatch() {
    this.setState({didError: true});
  }
  componentDidMount() {
    this.props.promise.then(
      (val) => this.setState({value: val}),
      () => this.setState({didError: true}),
    );
  }
  render() {
    if (this.state.didError) {
      return <ErrorMessage>Command Unsupported</ErrorMessage>;
    } else if (this.state.value === undefined) {
      return null;
    } else {
      return <>{this.props.render(this.state.value)}</>;
    }
  }
}
