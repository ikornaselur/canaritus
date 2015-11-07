import React, {Component, PropTypes} from 'react';
import {Status} from '../components';

export default class CanaritusApp extends Component {
  static propTypes = {
    error: PropTypes.any,
    subscribed: PropTypes.bool,
  };

  render() {
//     const actions = {
//     };


    return (
      <Status />
    );
  }
}
