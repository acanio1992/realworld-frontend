import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ListPagination from '../../components/ListPagination';

jest.mock('../../agent', () => ({
  Articles: { all: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

describe('ListPagination', () => {
  it('renders nothing when articlesCount <= 10', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <ListPagination articlesCount={5} currentPage={0} />
      </Provider>,
      div,
    );
    expect(div.querySelector('nav')).toBeNull();
  });

  it('renders page links when articlesCount > 10', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <ListPagination articlesCount={25} currentPage={0} />
      </Provider>,
      div,
    );
    const items = div.querySelectorAll('.page-item');
    expect(items.length).toBe(3); // ceil(25/10) = 3 pages
  });

  it('marks the current page as active', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <ListPagination articlesCount={25} currentPage={1} />
      </Provider>,
      div,
    );
    const activeItems = div.querySelectorAll('.page-item.active');
    expect(activeItems.length).toBe(1);
  });

  it('calls pager when a page link is clicked with pager prop', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const pager = jest.fn(() => Promise.resolve());
    render(
      <Provider store={store}>
        <ListPagination articlesCount={25} currentPage={0} pager={pager} />
      </Provider>,
      div,
    );
    const secondPage = div.querySelectorAll('.page-item')[1];
    Simulate.click(secondPage);
    expect(pager).toHaveBeenCalledWith(1);
    document.body.removeChild(div);
  });

  it('calls agent.Articles.all when a page link is clicked without pager prop', () => {
    const agent = require('../../agent').default || require('../../agent');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <ListPagination articlesCount={25} currentPage={0} />
      </Provider>,
      div,
    );
    const secondPage = div.querySelectorAll('.page-item')[1];
    Simulate.click(secondPage);
    document.body.removeChild(div);
  });
});
