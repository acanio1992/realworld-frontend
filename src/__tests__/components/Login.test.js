import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Login from '../../components/Login';
import { UPDATE_FIELD_AUTH, LOGIN_PAGE_UNLOADED } from '../../constants/actionTypes';

jest.mock('../../agent', () => ({
  Auth: { login: jest.fn(() => Promise.resolve({ user: { token: 'tok' } })) },
}));

const makeStore = (authState = {}) =>
  createStore(() => ({ auth: { email: '', password: '', inProgress: false, errors: null, ...authState } }));

describe('Login', () => {
  it('renders login form', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Sign In');
    expect(div.querySelector('input[type="email"]')).toBeTruthy();
    expect(div.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('shows errors when present', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ errors: { 'email or password': ['is invalid'] } })}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.error-messages')).toBeTruthy();
    expect(div.textContent).toContain('is invalid');
  });

  it('disables button when inProgress', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ inProgress: true })}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('button').disabled).toBe(true);
  });

  it('submits form and calls agent.Auth.login', () => {
    const agent = require('../../agent');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore({ email: 'a@b.com', password: 'pass' })}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const form = div.querySelector('form');
    Simulate.submit(form);
    expect(agent.Auth.login).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('dispatches LOGIN_PAGE_UNLOADED on unmount', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: LOGIN_PAGE_UNLOADED });
  });

  it('dispatches UPDATE_FIELD_AUTH with key=email when email input changes', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[type="email"]'), { target: { value: 'test@test.com' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UPDATE_FIELD_AUTH, key: 'email', value: 'test@test.com' }),
    );
    document.body.removeChild(div);
  });

  it('dispatches UPDATE_FIELD_AUTH with key=password when password input changes', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[type="password"]'), { target: { value: 'secret123' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UPDATE_FIELD_AUTH, key: 'password', value: 'secret123' }),
    );
    document.body.removeChild(div);
  });
});
