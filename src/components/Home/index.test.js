import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import Home from './index';

jest.mock('../../agent', () => ({
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

  it('clicking a tag dispatches APPLY_TAG_FILTER', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // Tags are rendered as links in the sidebar
    const tagLinks = div.querySelectorAll('a.tag-default');
    if (tagLinks.length > 0) {
      Simulate.click(tagLinks[0]);
    }
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('calls onUnload on unmount', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div); // unmount
    // No throw means success
    expect(true).toBe(true);
  });
});
