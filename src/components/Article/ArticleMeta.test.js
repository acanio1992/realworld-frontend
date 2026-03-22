import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ArticleMeta from './ArticleMeta';

jest.mock('../../agent', () => ({
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
});
