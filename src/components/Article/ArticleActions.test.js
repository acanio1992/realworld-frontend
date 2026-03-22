import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ArticleActions from './ArticleActions';

jest.mock('../../agent', () => ({
  Articles: { del: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

const article = {
  slug: 'my-article',
  title: 'My Article',
};

describe('ArticleActions', () => {
  it('renders edit and delete buttons when canModify=true', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleActions article={article} canModify={true} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Edit Article');
    expect(div.textContent).toContain('Delete Article');
  });

  it('renders empty span when canModify=false', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleActions article={article} canModify={false} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).not.toContain('Edit Article');
    expect(div.textContent).not.toContain('Delete Article');
  });

  it('clicking delete does not throw', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleActions article={article} canModify={true} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(() => div.querySelector('.btn-outline-danger').click()).not.toThrow();
    document.body.removeChild(div);
  });
});
