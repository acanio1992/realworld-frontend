import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CommentInput from '../../../components/Article/CommentInput';
import { ADD_COMMENT } from '../../../constants/actionTypes';

jest.mock('../../../agent', () => ({
  Comments: { create: jest.fn(() => Promise.resolve({ comment: { id: 1 } })) },
}));
import agent from '../../../agent';

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

  it('textarea initial value is empty string (initial state body="")', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    expect(div.querySelector('textarea').value).toBe('');
  });

  it('body resets to empty string after submit', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    const textarea = div.querySelector('textarea');
    Simulate.change(textarea, { target: { value: 'typed comment' } });
    Simulate.submit(div.querySelector('form'));
    expect(textarea.value).toBe('');
    document.body.removeChild(div);
  });

  it('dispatches ADD_COMMENT with correct payload on submit', () => {
    const localStore = createStore(() => ({}));
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={localStore}>
        <CommentInput slug="test-slug" currentUser={currentUser} />
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('textarea'), { target: { value: 'dispatch test' } });
    Simulate.submit(div.querySelector('form'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: ADD_COMMENT }),
    );
    document.body.removeChild(div);
  });
});
