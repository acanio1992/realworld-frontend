import React from 'react';
import { render } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Comment from './Comment';

jest.mock('../../agent', () => ({
  Comments: { delete: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

const mockComment = {
  id: 1,
  body: 'This is a test comment',
  createdAt: '2024-01-15T00:00:00.000Z',
  author: { username: 'commenter', image: null },
};

describe('Comment', () => {
  it('renders comment body and author', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Comment
            comment={mockComment}
            currentUser={null}
            slug="test-article"
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('This is a test comment');
    expect(div.textContent).toContain('commenter');
  });

  it('shows delete button when currentUser is the author', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Comment
            comment={mockComment}
            currentUser={{ username: 'commenter' }}
            slug="test-article"
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.mod-options')).toBeTruthy();
  });

  it('hides delete button when currentUser is not the author', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Comment
            comment={mockComment}
            currentUser={{ username: 'other-user' }}
            slug="test-article"
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.mod-options')).toBeNull();
  });
});
