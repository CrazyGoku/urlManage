import * as types from './mutation-type';
const matutaions = {
  [types.SET_LOADING_ACTION](state, bool) {
    state.loadingAction = bool
  }
};

export default matutaions;
