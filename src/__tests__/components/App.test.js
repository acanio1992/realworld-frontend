import React from 'react';
import { render } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from '../../components/App';

jest.mock('../../store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
  history: { push: jest.fn(), listen: jest.fn(() => () => {}) },
}));

jest.mock('../../agent', () => ({
  setToken: jest.fn(),
  Auth: { current: jest.fn(() => Promise.resolve({ user: { token: 'tok' } })) },
  Articles: {
    feed: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    all: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    byTag: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
  Tags: { getAll: jest.fn(() => Promise.resolve({ tags: [] })) },
  Profile: {
    get: jest.fn(() => Promise.resolve({ profile: {} })),
    follow: jest.fn(() => Promise.resolve()),
    unfollow: jest.fn(() => Promise.resolve()),
  },
  Comments: {
    forArticle: jest.fn(() => Promise.resolve({ comments: [] })),
    create: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  },
}));

const baseState = {
  common: { appLoaded: false, appName: 'Conduit', currentUser: null, redirectTo: null },
  article: { article: null, comments: [] },
  articleList: { articles: [], articlesCount: 0, currentPage: 0, loading: false, tab: 'all', tag: null, pager: null },
  auth: { email: '', password: '', username: '', inProgress: false, errors: null },
  editor: { title: '', description: '', body: '', tagInput: '', tagList: [], inProgress: false, errors: null },
  home: { tags: [] },
  profile: null,
  settings: { inProgress: false, errors: null },
};

const makeStore = (common = {}) =>
  createStore(() => ({ ...baseState, common: { ...baseState.common, ...common } }));

let localStorageGetItem;

beforeEach(() => {
  jest.clearAllMocks();
  localStorageGetItem = jest.fn(() => null);
  Storage.prototype.getItem = localStorageGetItem;
});

afterEach(() => {
  // Nothing to restore since we replaced on prototype
});

describe('App', () => {
  it('renders loading state (appLoaded=false) — shows header only', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ appLoaded: false })}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('nav')).toBeTruthy();
  });

  it('renders full app with routes when appLoaded=true', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ appLoaded: true })}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('nav')).toBeTruthy();
  });

  it('reads jwt key from localStorage and dispatches APP_LOAD with skipTracking=true', () => {
    const agent = require('../../agent');
    const { APP_LOAD } = require('../../constants/actionTypes');
    localStorageGetItem.mockReturnValue('myjwt');
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // localStorage must be read with the exact key 'jwt'
    expect(localStorageGetItem).toHaveBeenCalledWith('jwt');
    expect(agent.setToken).toHaveBeenCalledWith('myjwt');
    expect(agent.Auth.current).toHaveBeenCalled();
    // onLoad must dispatch APP_LOAD with skipTracking: true
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: APP_LOAD, skipTracking: true, token: 'myjwt' }),
    );
  });

  it('does NOT call agent.setToken when no token in localStorage', () => {
    const agent = require('../../agent');
    localStorageGetItem.mockReturnValue(null);
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(agent.setToken).not.toHaveBeenCalled();
    // onLoad called with null payload
    expect(agent.Auth.current).not.toHaveBeenCalled();
  });

  it('handles redirectTo via componentWillReceiveProps', () => {
    // Use a single store whose state we can change to trigger componentWillReceiveProps
    let stateOverride = { appLoaded: true, redirectTo: null };
    const liveStore = createStore((state, action) => {
      if (action.type === 'TEST_REDIRECT') stateOverride = { ...stateOverride, redirectTo: '/login' };
      if (action.type === 'TEST_CLEAR') stateOverride = { ...stateOverride, redirectTo: null };
      return { ...baseState, common: { ...baseState.common, ...stateOverride } };
    });

    const div = document.createElement('div');
    render(
      <Provider store={liveStore}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );

    // Trigger componentWillReceiveProps with redirectTo=null (false branch)
    liveStore.dispatch({ type: 'NO_OP' });

    // Then trigger with redirectTo set (true branch)
    liveStore.dispatch({ type: 'TEST_REDIRECT' });

    // Then clear it again (triggers false branch again)
    liveStore.dispatch({ type: 'TEST_CLEAR' });

    expect(div.querySelector('nav')).toBeTruthy();
  });

  it('does NOT dispatch REDIRECT when redirectTo is null (kills if(redirectTo)→true mutant)', () => {
    const { REDIRECT } = require('../../constants/actionTypes');
    const store = makeStore({ appLoaded: true, redirectTo: null });
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // No state changes — redirectTo stays null, onRedirect must NOT be called
    expect(dispatchSpy).not.toHaveBeenCalledWith({ type: REDIRECT });
  });

  it('renders routes (Switch) when appLoaded=true, not just header', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ appLoaded: true })}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // Login form is only rendered by the /login route inside the Switch
    expect(div.querySelector('input[type="email"]')).toBeTruthy();
  });

  it('does NOT render routes when appLoaded=false', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ appLoaded: false })}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // Without routes, the login form inputs should not be present
    expect(div.querySelector('input[type="email"]')).toBeFalsy();
  });

  it('dispatches REDIRECT via onRedirect when redirectTo is set (covers onRedirect body)', () => {
    const { REDIRECT } = require('../../constants/actionTypes');
    let stateOverride = { appLoaded: true, redirectTo: null };
    const liveStore = createStore((state, action) => {
      if (action.type === 'TEST_REDIRECT') stateOverride = { ...stateOverride, redirectTo: '/home' };
      return { ...baseState, common: { ...baseState.common, ...stateOverride } };
    });
    const dispatchSpy = jest.spyOn(liveStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={liveStore}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // Trigger componentWillReceiveProps with redirectTo set
    liveStore.dispatch({ type: 'TEST_REDIRECT' });
    // onRedirect() must dispatch { type: REDIRECT }
    expect(dispatchSpy).toHaveBeenCalledWith({ type: REDIRECT });
  });
});
