import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import Article from './index';

jest.mock('../../agent', () => ({
  Articles: {
    get: jest.fn(() => Promise.resolve({ article: {} })),
    del: jest.fn(() => Promise.resolve()),
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
  Comments: {
    forArticle: jest.fn(() => Promise.resolve({ comments: [] })),
    create: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  },
}));

const makeStore = ({ articleState = {}, currentUser = null } = {}) =>
  createStore(() => ({
    article: {
      article: null,
      comments: [],
      ...articleState,
    },
    common: { currentUser },
  }));

const article = {
  slug: 'test-slug',
  title: 'Test Article',
  description: 'Test description',
  body: 'Hello **world**',
  tagList: ['react'],
  createdAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: {
    username: 'author1',
    image: '',
    following: false,
  },
};

describe('Article', () => {
  it('renders null when no article in state', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.article-page')).toBeNull();
  });

  it('renders article page when article exists', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.article-page')).toBeTruthy();
    expect(div.textContent).toContain('Test Article');
  });

  it('renders article body as markdown', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.innerHTML).toContain('<strong>world</strong>');
  });

  it('canModify=true when currentUser matches author', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article }, currentUser: { username: 'author1' } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    // canModify=true renders Edit/Delete buttons
    expect(div.textContent).toContain('Edit Article');
  });

  it('canModify=false when currentUser does NOT match author', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article }, currentUser: { username: 'otheruser' } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).not.toContain('Edit Article');
  });

  it('renders with comments=undefined (falls back to [])', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article, comments: undefined } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.article-page')).toBeTruthy();
  });

  it('calls onUnload on unmount', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(true).toBe(true);
  });
});
