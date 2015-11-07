import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import CanaritusApp from './CanaritusApp';
import * as CanaritusActions from '../actions/CanaritusActions';

const mapStateToProps = (state) => {
  return {
    error: state.error,
    subscribed: state.subscribed,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(CanaritusActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(CanaritusApp);
