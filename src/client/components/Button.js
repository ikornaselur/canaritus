import React, {PropTypes} from 'react';

const Button = ({children, disabled, handleClick}) => {
  return (
    <div>
      <button onClick={handleClick} disabled={disabled}>{children}</button>
    </div>
  );
};

Button.propTypes = {
  handleClick: PropTypes.func.isRequired,
  children: PropTypes.any,
  disabled: PropTypes.bool,
};

export default Button;
