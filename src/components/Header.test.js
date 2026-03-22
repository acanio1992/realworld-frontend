import React from 'react';
import { render } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

describe('Header', () => {
  it('renders logged-out view when no currentUser', () => {
    const div = document.createElement('div');
    render(
      <MemoryRouter>
        <Header appName="Conduit" currentUser={null} />
      </MemoryRouter>,
      div,
    );
    expect(div.textContent).toContain('Sign in');
    expect(div.textContent).toContain('Sign up');
    expect(div.textContent).toContain('conduit');
  });

  it('renders logged-in view when currentUser is set', () => {
    const div = document.createElement('div');
    render(
      <MemoryRouter>
        <Header
          appName="Conduit"
          currentUser={{ username: 'testuser', image: null }}
        />
      </MemoryRouter>,
      div,
    );
    expect(div.textContent).toContain('testuser');
    expect(div.textContent).toContain('New Post');
    expect(div.textContent).toContain('Settings');
  });
});
