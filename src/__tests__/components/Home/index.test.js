import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../../components/Home/index';
import { HOME_PAGE_LOADED, HOME_PAGE_UNLOADED, APPLY_TAG_FILTER } from '../../../constants/actionTypes';

jest.mock('../../../agent', () => ({
  Tags: { getAll: jest.fn(() => Promise.resolve({ tags: [] })) },
  Articles: {
    feed: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    all: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    byTag: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
}));

const makeStore = (token = null) =>
  createStore(() => ({
    home: { tags: ['react', 'redux'] },
    common: { appName: 'Conduit', token },
    articleList: {
      articles: [],
      articlesCount: 0,
      currentPage: 0,
      loading: false,
      tab: 'all',
      tag: null,
      pager: null,
    },
  }));

describe('Home', () => {
  it('renders home page structure', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.home-page')).toBeTruthy();
  });

  it('renders banner with appName', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('conduit');
  });

  it('renders tags in sidebar', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('react');
    expect(div.textContent).toContain('redux');
  });

  it('renders with token (logged-in state)', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore('myjwttoken')}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.home-page')).toBeTruthy();
  });

  it('dispatches HOME_PAGE_LOADED with tab="all" and calls agent.Tags.getAll on mount (no token)', () => {
    const agent = require('../../../agent');
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: HOME_PAGE_LOADED, tab: 'all' }),
    );
    expect(agent.Tags.getAll).toHaveBeenCalled();
    expect(agent.Articles.all).toHaveBeenCalled();
  });

  it('dispatches HOME_PAGE_LOADED with tab="feed" when token is present', () => {
    const localStore = makeStore('myjwt');
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: HOME_PAGE_LOADED, tab: 'feed' }),
    );
  });

  it('clicking a tag dispatches APPLY_TAG_FILTER with correct tag', () => {
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const tagLinks = div.querySelectorAll('a.tag-default');
    if (tagLinks.length > 0) {
      Simulate.click(tagLinks[0]);
    }
    document.body.removeChild(div);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: APPLY_TAG_FILTER, tag: 'react' }),
    );
  });

  it('dispatches HOME_PAGE_UNLOADED on unmount', () => {
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: HOME_PAGE_UNLOADED });
  });
});
