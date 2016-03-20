import React, {PropTypes} from 'react';

const Button = () => {
  const {children, disabled, handleClick} = this.props;
  return (
    <div>
      <button onClick={handleClick} disabled={disabled}>{children}</button>
    </div>
  );
};
Button.propTyped = {
  handleClick: PropTypes.func.isRequired,
  children: PropTypes.any,
  disabled: PropTypes.bool,
};

export default Button;
