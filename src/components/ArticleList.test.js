import React from 'react';
import { render } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ArticleList from './ArticleList';

jest.mock('../agent', () => ({
  Articles: {
    favorite: jest.fn(() => Promise.resolve({})),
    unfavorite: jest.fn(() => Promise.resolve({})),
    all: jest.fn(() => Promise.resolve({})),
  },
}));

const store = createStore(() => ({}));

const mockArticle = {
  slug: 'test-slug',
  title: 'Test Article',
  description: 'A description',
  body: 'Body',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  tagList: ['tag1'],
  favorited: false,
  favoritesCount: 0,
  author: { username: 'author', image: null, bio: null, following: false },
};

describe('ArticleList', () => {
  it('renders loading state when articles is undefined', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleList articles={undefined} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Loading...');
  });

  it('renders empty message when articles is empty', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleList articles={[]} articlesCount={0} currentPage={0} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('No articles are here');
  });

  it('renders articles when provided', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleList
            articles={[mockArticle]}
            articlesCount={1}
            currentPage={0}
            pager={null}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.article-preview')).toBeTruthy();
    expect(div.textContent).toContain('Test Article');
  });
});
