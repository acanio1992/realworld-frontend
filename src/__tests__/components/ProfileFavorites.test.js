import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ProfileFavorites from '../../components/ProfileFavorites';
import { PROFILE_PAGE_LOADED, PROFILE_PAGE_UNLOADED } from '../../constants/actionTypes';

jest.mock('../../agent', () => ({
  Profile: {
    get: jest.fn(() => Promise.resolve({ profile: {} })),
    follow: jest.fn(() => Promise.resolve()),
    unfollow: jest.fn(() => Promise.resolve()),
  },
  Articles: {
    favoritedBy: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    byAuthor: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
}));

const defaultState = {
  articleList: { articles: [], articlesCount: 0, currentPage: 0, loading: false },
  profile: { username: 'testuser', bio: 'bio', image: '', following: false },
  common: { currentUser: null },
};

const makeStore = () =>
  // When PROFILE_PAGE_LOADED is dispatched, call the pager so that
  // the inline `page => agent.Articles.favoritedBy(...)` function gets covered
  createStore((state = defaultState, action) => {
    if (action.type === 'PROFILE_PAGE_LOADED' && typeof action.pager === 'function') {
      action.pager(0);
    }
    return defaultState;
  });

describe('ProfileFavorites', () => {
  it('renders profile page', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites
            match={{ params: { username: 'testuser' } }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.profile-page')).toBeTruthy();
  });

  it('renders Favorited Articles tab', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites
            match={{ params: { username: 'testuser' } }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Favorited Articles');
    expect(div.textContent).toContain('My Articles');
  });

  it('dispatches PROFILE_PAGE_LOADED on mount with pager and calls agent methods', () => {
    const agent = require('../../agent');
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: PROFILE_PAGE_LOADED }),
    );
    expect(agent.Profile.get).toHaveBeenCalledWith('testuser');
    expect(agent.Articles.favoritedBy).toHaveBeenCalledWith('testuser');
  });

  it('dispatches PROFILE_PAGE_UNLOADED on unmount', () => {
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: PROFILE_PAGE_UNLOADED });
  });

  it('My Articles link has correct href with username', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const myArticlesLink = Array.from(div.querySelectorAll('a')).find(a =>
      a.textContent.trim() === 'My Articles',
    );
    expect(myArticlesLink).toBeTruthy();
    expect(myArticlesLink.getAttribute('href')).toBe('/@testuser');
  });

  it('Favorited Articles link has correct href with username and /favorites', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={['/@testuser/favorites']}>
          <ProfileFavorites match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const favLink = Array.from(div.querySelectorAll('a')).find(a =>
      a.textContent.trim() === 'Favorited Articles',
    );
    expect(favLink).toBeTruthy();
    expect(favLink.getAttribute('href')).toBe('/@testuser/favorites');
  });
});
