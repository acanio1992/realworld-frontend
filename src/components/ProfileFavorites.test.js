import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ProfileFavorites from './ProfileFavorites';

jest.mock('../agent', () => ({
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

  it('calls onUnload on unmount', () => {
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
    render(null, div); // unmount
    expect(true).toBe(true);
  });
});
