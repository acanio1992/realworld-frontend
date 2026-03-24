import React from 'react';
import { render } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CommentList from '../../../components/Article/CommentList';

jest.mock('../../../agent', () => ({
  Comments: { delete: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

describe('CommentList', () => {
  it('renders a list of comments', () => {
    const comments = [
      { id: 1, body: 'First', createdAt: '2024-01-01T00:00:00Z', author: { username: 'user1', image: null } },
      { id: 2, body: 'Second', createdAt: '2024-01-02T00:00:00Z', author: { username: 'user2', image: null } },
    ];
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList comments={comments} currentUser={null} slug="my-article" />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('First');
    expect(div.textContent).toContain('Second');
    expect(div.querySelectorAll('.card')).toHaveLength(2);
  });

  it('renders empty div for empty comments', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList comments={[]} currentUser={null} slug="my-article" />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelectorAll('.card')).toHaveLength(0);
  });
});
