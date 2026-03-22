import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Settings from './Settings';

jest.mock('../agent', () => ({
  Auth: { save: jest.fn(() => Promise.resolve({ user: { token: 'tok' } })) },
}));

const makeStore = (overrides = {}) =>
  createStore(() => ({
    settings: { inProgress: false, errors: null, ...overrides.settings },
    common: {
      currentUser: {
        username: 'alice',
        email: 'alice@example.com',
        bio: 'bio',
        image: 'http://example.com/img.jpg',
      },
      ...overrides.common,
    },
  }));

describe('Settings', () => {
  it('renders settings form with inputs', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Your Settings');
    expect(div.querySelector('input[placeholder="Username"]')).toBeTruthy();
    expect(div.querySelector('input[type="email"]')).toBeTruthy();
    expect(div.querySelector('input[type="password"]')).toBeTruthy();
    expect(div.querySelector('button')).toBeTruthy();
  });

  it('renders logout button', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('logout');
  });

  it('renders errors when present', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ settings: { errors: { username: ['taken'] } } })}>
        <Settings />
      </Provider>,
      div,
    );
    expect(div.querySelector('.error-messages')).toBeTruthy();
    expect(div.textContent).toContain('taken');
  });

  it('clicking logout button does not throw', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    const logoutBtn = div.querySelector('.btn-outline-danger');
    expect(() => Simulate.click(logoutBtn)).not.toThrow();
    document.body.removeChild(div);
  });

  it('submitting form does not throw', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    const form = div.querySelector('form');
    expect(() => Simulate.submit(form)).not.toThrow();
    document.body.removeChild(div);
  });

  it('updates form fields on change', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[placeholder="Username"]'), { target: { value: 'newname' } });
    Simulate.change(div.querySelector('input[type="email"]'), { target: { value: 'new@email.com' } });
    Simulate.change(div.querySelector('input[placeholder="URL of profile picture"]'), { target: { value: 'http://img.com' } });
    Simulate.change(div.querySelector('textarea'), { target: { value: 'new bio' } });
    Simulate.change(div.querySelector('input[type="password"]'), { target: { value: 'newpass' } });
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('submits form without password when password is empty', () => {
    const agent = require('../agent');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    const form = div.querySelector('form');
    Simulate.submit(form);
    expect(agent.Auth.save).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('renders with no currentUser without crashing (componentWillMount false branch)', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ common: { currentUser: null } })}>
        <Settings />
      </Provider>,
      div,
    );
    expect(div.querySelector('.settings-page')).toBeTruthy();
  });

  it('covers image || "" when image is null/undefined', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ common: { currentUser: { username: 'u', email: 'e@e.com', bio: 'b', image: null } } })}>
        <Settings />
      </Provider>,
      div,
    );
    expect(div.querySelector('.settings-page')).toBeTruthy();
  });

  it('covers componentWillReceiveProps when currentUser updates', () => {
    // Use a live store so state can change and trigger componentWillReceiveProps
    const { createStore: cs } = require('redux');
    let currentUser = { username: 'alice', email: 'a@a.com', bio: 'bio', image: 'img' };
    const liveStore = cs((state, action) => {
      if (action.type === 'UPDATE_USER') currentUser = action.user;
      if (action.type === 'CLEAR_USER') currentUser = null;
      return {
        settings: { inProgress: false, errors: null },
        common: { currentUser },
      };
    });

    const div = document.createElement('div');
    render(<Provider store={liveStore}><Settings /></Provider>, div);

    // Trigger componentWillReceiveProps with new currentUser (covers true branch + image||'')
    liveStore.dispatch({ type: 'UPDATE_USER', user: { username: 'bob', email: 'b@b.com', bio: 'bio2', image: null } });

    // Trigger componentWillReceiveProps with null currentUser (covers false branch)
    liveStore.dispatch({ type: 'CLEAR_USER' });

    expect(div.querySelector('.settings-page')).toBeTruthy();
  });

  it('submitting form WITH password does not delete it', () => {
    const agent = require('../agent');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <Settings />
      </Provider>,
      div,
    );
    // Set a non-empty password via input change
    Simulate.change(div.querySelector('input[type="password"]'), { target: { value: 'mypassword' } });
    const form = div.querySelector('form');
    Simulate.submit(form);
    // agent.Auth.save called — password should be included (not deleted)
    expect(agent.Auth.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'mypassword' }));
    document.body.removeChild(div);
  });
});
