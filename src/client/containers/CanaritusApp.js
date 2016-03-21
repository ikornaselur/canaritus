import React, {PropTypes} from 'react';
import {Status} from '../components';

const CanaritusApp = () => (
  <Status />
);

CanaritusApp.propTypes = {
  error: PropTypes.any,
};

export default CanaritusApp;
