import reducer from '../../reducers/common';
import {
  APP_LOAD,
  REDIRECT,
  LOGOUT,
  ARTICLE_SUBMITTED,
  SETTINGS_SAVED,
  LOGIN,
  REGISTER,
  DELETE_ARTICLE,
  ARTICLE_PAGE_UNLOADED,
  EDITOR_PAGE_UNLOADED,
  HOME_PAGE_UNLOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
  SETTINGS_PAGE_UNLOADED,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
} from '../../constants/actionTypes';

const defaultState = { appName: 'Conduit', token: null, viewChangeCounter: 0 };

describe('common reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual(defaultState);
  });

  it('handles APP_LOAD with token and payload', () => {
    const action = {
      type: APP_LOAD,
      token: 'jwt-token',
      payload: { user: { username: 'user1' } },
    };
    const state = reducer(defaultState, action);
    expect(state.token).toBe('jwt-token');
    expect(state.appLoaded).toBe(true);
    expect(state.currentUser).toEqual({ username: 'user1' });
  });

  it('handles APP_LOAD without payload', () => {
    const action = { type: APP_LOAD, token: null, payload: null };
    const state = reducer(defaultState, action);
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
  });

  it('handles REDIRECT', () => {
    const state = reducer({ ...defaultState, redirectTo: '/somewhere' }, { type: REDIRECT });
    expect(state.redirectTo).toBeNull();
  });

  it('handles LOGOUT', () => {
    const state = reducer({ ...defaultState, token: 'abc', currentUser: { username: 'u' } }, { type: LOGOUT });
    expect(state.redirectTo).toBe('/');
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
  });

  it('handles ARTICLE_SUBMITTED', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      payload: { article: { slug: 'my-article' } },
    };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBe('/article/my-article');
  });

  it('handles SETTINGS_SAVED success', () => {
    const action = {
      type: SETTINGS_SAVED,
      payload: { user: { username: 'updated' } },
    };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBe('/');
    expect(state.currentUser).toEqual({ username: 'updated' });
    // token must not be touched by SETTINGS_SAVED (distinguishes from LOGIN fallthrough)
    expect(state.token).toBeNull();
  });

  it('handles SETTINGS_SAVED error', () => {
    const action = {
      type: SETTINGS_SAVED,
      error: true,
      payload: { errors: { bio: ['too long'] } },
    };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBeNull();
    expect(state.currentUser).toBeNull();
  });

  it('handles LOGIN success', () => {
    const action = {
      type: LOGIN,
      payload: { user: { token: 'tok', username: 'u' } },
    };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBe('/');
    expect(state.token).toBe('tok');
    expect(state.currentUser).toEqual({ token: 'tok', username: 'u' });
  });

  it('handles LOGIN error', () => {
    const action = { type: LOGIN, error: true, payload: {} };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBeNull();
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
  });

  it('handles REGISTER success', () => {
    const action = {
      type: REGISTER,
      payload: { user: { token: 'tok2', username: 'newuser' } },
    };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBe('/');
    expect(state.token).toBe('tok2');
  });

  it('handles REGISTER error', () => {
    const action = { type: REGISTER, error: true, payload: {} };
    const state = reducer(defaultState, action);
    expect(state.redirectTo).toBeNull();
  });

  it('handles DELETE_ARTICLE', () => {
    const state = reducer(defaultState, { type: DELETE_ARTICLE });
    expect(state.redirectTo).toBe('/');
  });

  const unloadActions = [
    ARTICLE_PAGE_UNLOADED,
    EDITOR_PAGE_UNLOADED,
    HOME_PAGE_UNLOADED,
    PROFILE_PAGE_UNLOADED,
    PROFILE_FAVORITES_PAGE_UNLOADED,
    SETTINGS_PAGE_UNLOADED,
    LOGIN_PAGE_UNLOADED,
    REGISTER_PAGE_UNLOADED,
  ];

  unloadActions.forEach(type => {
    it(`increments viewChangeCounter on ${type}`, () => {
      // Use undefined state so the source's defaultState (appName, token, etc.) is exercised
      const state = reducer(undefined, { type });
      expect(state.viewChangeCounter).toBe(1);
      expect(state.appName).toBe('Conduit');
      expect(state.token).toBeNull();
    });
  });
});
