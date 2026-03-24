import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ArticleMeta from '../../../components/Article/ArticleMeta';
import { Simulate } from 'react-dom/test-utils';

jest.mock('../../../agent', () => ({
  Articles: { del: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

const article = {
  slug: 'test-slug',
  createdAt: '2024-01-01T00:00:00.000Z',
  author: {
    username: 'authoruser',
    image: 'http://example.com/img.jpg',
  },
};

describe('ArticleMeta', () => {
  it('renders author username', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleMeta article={article} canModify={false} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('authoruser');
  });

  it('renders with canModify=true', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleMeta article={article} canModify={true} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.article-meta')).toBeTruthy();
  });

  it('author links contain the correct username in href', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleMeta article={article} canModify={false} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const authorLinks = Array.from(div.querySelectorAll('a')).filter(a =>
      a.getAttribute('href') && a.getAttribute('href').includes('authoruser'),
    );
    expect(authorLinks.length).toBeGreaterThan(0);
    authorLinks.forEach(link =>
      expect(link.getAttribute('href')).toBe('/@authoruser'),
    );
  });
});
