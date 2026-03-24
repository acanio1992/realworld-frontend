import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import Article from '../../../components/Article/index';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from '../../../constants/actionTypes';

jest.mock('../../../agent', () => ({
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

  it('dispatches ARTICLE_PAGE_LOADED with Promise.all on mount and calls agent methods', () => {
    const agent = require('../../../agent');
    const localStore = makeStore();
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: ARTICLE_PAGE_LOADED }),
    );
    expect(agent.Articles.get).toHaveBeenCalledWith('test-slug');
    expect(agent.Comments.forArticle).toHaveBeenCalledWith('test-slug');
  });

  it('dispatches ARTICLE_PAGE_UNLOADED on unmount', () => {
    const localStore = makeStore({ articleState: { article } });
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: ARTICLE_PAGE_UNLOADED });
  });

  it('sanitizes HTML in article body (sanitize:true must strip script tags)', () => {
    const htmlArticle = {
      ...article,
      body: '<script>alert("xss")</script>safe content',
    };
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article: htmlArticle } })}>
        <MemoryRouter>
          <Article match={{ params: { id: htmlArticle.slug } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.innerHTML).not.toContain('<script>');
    expect(div.textContent).toContain('safe content');
  });

  it('renders article tags in tag list', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ articleState: { article } })}>
        <MemoryRouter>
          <Article match={{ params: { id: 'test-slug' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('react');
    const tagItems = div.querySelectorAll('.tag-default.tag-pill.tag-outline');
    expect(tagItems.length).toBe(1);
  });
});
