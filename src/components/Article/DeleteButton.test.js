import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import DeleteButton from './DeleteButton';

jest.mock('../../agent', () => ({
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
    // Just verify clicking the icon doesn't throw
    expect(() => div.querySelector('.ion-trash-a').click()).not.toThrow();
    document.body.removeChild(div);
  });
});
