import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import CommentContainer from '../../../components/Article/CommentContainer';

jest.mock('../../../agent', () => ({
  Comments: {
    create: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  },
}));

const store = createStore(() => ({}));

const currentUser = { username: 'alice', image: 'http://example.com/img.jpg' };
const comments = [
  {
    id: 1,
    body: 'Great article!',
    createdAt: '2024-01-01T00:00:00.000Z',
    author: { username: 'bob', image: '', following: false },
  },
];

describe('CommentContainer', () => {
  it('renders comment input when currentUser is provided', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentContainer
            slug="test-slug"
            currentUser={currentUser}
            comments={comments}
            errors={null}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.comment-form')).toBeTruthy();
    expect(div.textContent).toContain('Great article!');
  });

  it('renders sign in links when no currentUser', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentContainer
            slug="test-slug"
            currentUser={null}
            comments={comments}
            errors={null}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Sign in');
    expect(div.textContent).toContain('sign up');
    expect(div.querySelector('.comment-form')).toBeNull();
  });
});
