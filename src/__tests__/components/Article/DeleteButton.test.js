import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Simulate } from 'react-dom/test-utils';
import DeleteButton from '../../../components/Article/DeleteButton';
import { DELETE_COMMENT } from '../../../constants/actionTypes';

jest.mock('../../../agent', () => ({
  Comments: { delete: jest.fn(() => Promise.resolve()) },
}));

const store = createStore(() => ({}));

describe('DeleteButton', () => {
  it('renders delete icon when show=true', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <DeleteButton show={true} slug="test-article" commentId={1} />
      </Provider>,
      div,
    );
    expect(div.querySelector('.mod-options')).toBeTruthy();
    expect(div.querySelector('.ion-trash-a')).toBeTruthy();
  });

  it('renders nothing when show=false', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <DeleteButton show={false} slug="test-article" commentId={1} />
      </Provider>,
      div,
    );
    expect(div.querySelector('.mod-options')).toBeNull();
  });

  it('triggers click on delete icon without throwing', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <DeleteButton show={true} slug="test-article" commentId={42} />
      </Provider>,
      div,
    );
    Simulate.click(div.querySelector('.ion-trash-a'));
    document.body.removeChild(div);
    expect(true).toBe(true); // no throw
  });

  it('dispatches DELETE_COMMENT with commentId when trash icon is clicked', () => {
    const agent = require('../../../agent');
    const localStore = createStore(() => ({}));
    const dispatchSpy = jest.spyOn(localStore, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={localStore}>
        <DeleteButton show={true} slug="test-article" commentId={42} />
      </Provider>,
      div,
    );
    Simulate.click(div.querySelector('.ion-trash-a'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: DELETE_COMMENT, commentId: 42 }),
    );
    expect(agent.Comments.delete).toHaveBeenCalledWith('test-article', 42);
    document.body.removeChild(div);
  });
});
