import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Register from '../../components/Register';
import { UPDATE_FIELD_AUTH, REGISTER_PAGE_UNLOADED } from '../../constants/actionTypes';

jest.mock('../../agent', () => ({
  Auth: { register: jest.fn(() => Promise.resolve({ user: { token: 'tok' } })) },
}));
import agent from '../../agent';

const makeStore = (authState = {}) =>
  createStore(() => ({ auth: { email: '', password: '', username: '', inProgress: false, errors: null, ...authState } }));

describe('Register', () => {
  it('renders register form', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Sign Up');
    expect(div.querySelector('input[placeholder="Username"]')).toBeTruthy();
    expect(div.querySelector('input[type="email"]')).toBeTruthy();
    expect(div.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('shows validation errors when present', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ errors: { username: ['has already been taken'] } })}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.error-messages')).toBeTruthy();
    expect(div.textContent).toContain('has already been taken');
  });

  it('disables button when inProgress', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore({ inProgress: true })}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('button').disabled).toBe(true);
  });

  it('submits form and calls agent.Auth.register', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore({ email: 'a@b.com', password: 'pass', username: 'alice' })}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const form = div.querySelector('form');
    Simulate.submit(form);
    expect(agent.Auth.register).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('dispatches REGISTER_PAGE_UNLOADED on unmount', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: REGISTER_PAGE_UNLOADED });
  });

  it('dispatches UPDATE_FIELD_AUTH with key=username when username input changes', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[placeholder="Username"]'), { target: { value: 'newuser' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UPDATE_FIELD_AUTH, key: 'username', value: 'newuser' }),
    );
    document.body.removeChild(div);
  });

  it('dispatches UPDATE_FIELD_AUTH with key=email when email input changes', () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[type="email"]'), { target: { value: 'new@email.com' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UPDATE_FIELD_AUTH, key: 'email', value: 'new@email.com' }),
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
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[type="password"]'), { target: { value: 'newpass' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UPDATE_FIELD_AUTH, key: 'password', value: 'newpass' }),
    );
    document.body.removeChild(div);
  });
});
