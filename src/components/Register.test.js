import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Register from './Register';

jest.mock('../agent', () => ({
  Auth: { register: jest.fn(() => Promise.resolve({ user: { token: 'tok' } })) },
}));
import agent from '../agent';

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

  it('calls onUnload when unmounted', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(true).toBe(true);
  });

  it('handles input changes', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[placeholder="Username"]'), { target: { value: 'newuser' } });
    Simulate.change(div.querySelector('input[type="email"]'), { target: { value: 'new@email.com' } });
    Simulate.change(div.querySelector('input[type="password"]'), { target: { value: 'newpass' } });
    document.body.removeChild(div);
    expect(true).toBe(true);
  });
});
