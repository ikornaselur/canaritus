import React, { PropTypes, Component } from 'react';

export default class Button extends Component {
  static propTypes = {
    handleClick: PropTypes.func.isRequired,
    children: PropTypes.any,
    disabled: PropTypes.bool,
  }

  render() {
    const {children, disabled, handleClick} = this.props;
    return (
      <div>
        <button onClick={handleClick} disabled={disabled}>{children}</button>
      </div>
    );
  }
}
