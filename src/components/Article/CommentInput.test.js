import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CommentInput from './CommentInput';

jest.mock('../../agent', () => ({
  Comments: { create: jest.fn(() => Promise.resolve({ comment: { id: 1 } })) },
}));
import agent from '../../agent';

const store = createStore(() => ({}));

const currentUser = { username: 'alice', image: 'http://example.com/alice.jpg' };

describe('CommentInput', () => {
  it('renders comment form', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    expect(div.querySelector('.comment-form')).toBeTruthy();
    expect(div.querySelector('textarea')).toBeTruthy();
    expect(div.querySelector('button')).toBeTruthy();
  });

  it('updates textarea value on change', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    const textarea = div.querySelector('textarea');
    Simulate.change(textarea, { target: { value: 'hello comment' } });
    expect(textarea.value).toBe('hello comment');
    document.body.removeChild(div);
  });

  it('submits comment and resets body on form submit', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    const textarea = div.querySelector('textarea');
    Simulate.change(textarea, { target: { value: 'my comment' } });
    const form = div.querySelector('form');
    Simulate.submit(form);
    expect(agent.Comments.create).toHaveBeenCalledWith('test-slug', { body: 'my comment' });
    document.body.removeChild(div);
  });
});
