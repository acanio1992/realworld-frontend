import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ArticlePreview from '../../components/ArticlePreview';

jest.mock('../../agent', () => ({
  Articles: {
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
}));
import agent from '../../agent';

const store = createStore(() => ({}));

const baseArticle = {
  slug: 'test-slug',
  title: 'Test Title',
  description: 'Test description',
  body: 'body',
  tagList: ['react', 'redux'],
  createdAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 5,
  author: {
    username: 'testuser',
    image: 'http://example.com/img.jpg',
    following: false,
  },
};

describe('ArticlePreview', () => {
  it('renders article title and description', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={baseArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Test Title');
    expect(div.textContent).toContain('Test description');
  });

  it('renders tags', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={baseArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('react');
    expect(div.textContent).toContain('redux');
  });

  it('renders not-favorited button when favorited=false', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={baseArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button');
    expect(btn.className).toContain('btn-outline-primary');
  });

  it('renders favorited button when favorited=true', () => {
    const div = document.createElement('div');
    const favoritedArticle = { ...baseArticle, favorited: true };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={favoritedArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button');
    expect(btn.className).toContain('btn-primary');
  });

  it('calls unfavorite when clicking on a favorited article', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const favoritedArticle = { ...baseArticle, favorited: true };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={favoritedArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button');
    Simulate.click(btn);
    expect(agent.Articles.unfavorite).toHaveBeenCalledWith('test-slug');
    document.body.removeChild(div);
  });

  it('calls favorite when clicking on a non-favorited article', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticlePreview article={baseArticle} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button');
    Simulate.click(btn);
    expect(agent.Articles.favorite).toHaveBeenCalledWith('test-slug');
    document.body.removeChild(div);
  });
});
