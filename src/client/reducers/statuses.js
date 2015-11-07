import {
  GET_STATUSES,
} from '../constants/ActionTypes';

const initialState = {
  error: null,
};

const statuses = (state = initialState, action) => {
  switch (action.type) {
  case GET_STATUSES:
    return Object.assign({}, state, {
      error: null,
    });
  default:
    return state;
  }
};

export default statuses;
