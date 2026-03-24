jest.mock('react-router-redux', () => ({
  routerReducer: (state = {}, action) => state,
  routerMiddleware: () => next => action => next(action),
  push: path => ({ type: '@@router/CALL_HISTORY_METHOD', payload: { method: 'push', args: [path] } }),
}));

import reducer from '../reducer';

describe('root reducer', () => {
  it('is a function (combineReducers result)', () => {
    expect(typeof reducer).toBe('function');
  });

  it('returns initial state with all slices', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toHaveProperty('article');
    expect(state).toHaveProperty('articleList');
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('common');
    expect(state).toHaveProperty('editor');
    expect(state).toHaveProperty('home');
    expect(state).toHaveProperty('profile');
    expect(state).toHaveProperty('settings');
    expect(state).toHaveProperty('router');
  });

  it('passes actions through to slice reducers', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    const nextState = reducer(state, { type: 'UNKNOWN_ACTION' });
    expect(nextState).toEqual(state);
  });
});
