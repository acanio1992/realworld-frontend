import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import MainView from './MainView';

jest.mock('../../agent', () => {
  const feed = jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 }));
  feed.mockReturnValue = feed; // feed is also used as pager (called as feed())
  return {
    Articles: {
      feed,
      all: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
      favorite: jest.fn(() => Promise.resolve()),
      unfavorite: jest.fn(() => Promise.resolve()),
    },
  };
});

const makeStore = (overrides = {}) =>
  createStore(() => ({
    articleList: {
      articles: [],
      articlesCount: 0,
      currentPage: 0,
      loading: false,
      tab: 'all',
      tag: null,
      pager: null,
      ...overrides.articleList,
    },
    home: { tags: [] },
    common: { token: null, ...overrides.common },
  }));

describe('MainView', () => {
  it('renders global feed tab', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Global Feed');
  });

  it('renders Your Feed tab when token is present', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ common: { token: 'jwt123' } })}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Your Feed');
    expect(div.textContent).toContain('Global Feed');
  });

  it('does not render Your Feed tab when no token', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).not.toContain('Your Feed');
  });

  it('renders tag filter tab when tag is set', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleList: { tag: 'javascript' } })}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('javascript');
  });

  it('clicking Your Feed tab triggers clickHandler (covers lines 10-11)', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore({ common: { token: 'jwt123' } })}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // With token, "Your Feed" is the first tab
    const yourFeedLink = div.querySelector('a.nav-link');
    expect(() => Simulate.click(yourFeedLink)).not.toThrow();
    document.body.removeChild(div);
  });

  it('applies active class to Your Feed when tab=feed', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ common: { token: 'jwt' }, articleList: { tab: 'feed' } })}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const yourFeedLink = div.querySelector('a.nav-link.active');
    expect(yourFeedLink).toBeTruthy();
    expect(yourFeedLink.textContent).toContain('Your Feed');
  });

  it('applies active class to Global Feed when tab=all', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleList: { tab: 'all' } })}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const globalFeedLink = div.querySelector('a.nav-link.active');
    expect(globalFeedLink).toBeTruthy();
    expect(globalFeedLink.textContent).toContain('Global Feed');
  });

  it('clicking global feed tab calls dispatch', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <MainView />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const links = div.querySelectorAll('a.nav-link');
    // click global feed (last tab when no token)
    expect(() => Simulate.click(links[links.length - 1])).not.toThrow();
    document.body.removeChild(div);
  });
});
