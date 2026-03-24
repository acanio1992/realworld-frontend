import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import { Simulate } from 'react-dom/test-utils';
import ArticleActions from '../../../components/Article/ArticleActions';
import { DELETE_ARTICLE } from '../../../constants/actionTypes';

jest.mock('../../../agent', () => ({
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

  it('edit button links to /editor/:slug', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ArticleActions article={article} canModify={true} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const editLink = Array.from(div.querySelectorAll('a')).find(a =>
      a.textContent.includes('Edit Article'),
    );
    expect(editLink).toBeTruthy();
    expect(editLink.getAttribute('href')).toBe('/editor/my-article');
  });

  it('dispatches DELETE_ARTICLE when delete button is clicked', () => {
    const agent = require('../../../agent');
    const localStore = createStore(() => ({}));
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={localStore}>
        <MemoryRouter>
          <ArticleActions article={article} canModify={true} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.click(div.querySelector('.btn-outline-danger'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: DELETE_ARTICLE }),
    );
    expect(agent.Articles.del).toHaveBeenCalledWith('my-article');
    document.body.removeChild(div);
  });
});
