import React from 'react';
import { render } from 'react-dom';
import Banner from './Banner';

describe('Banner', () => {
  it('renders the banner when no token', () => {
    const div = document.createElement('div');
    render(<Banner appName="Conduit" token={null} />, div);
    expect(div.querySelector('.banner')).toBeTruthy();
    expect(div.textContent).toContain('conduit');
    expect(div.textContent).toContain('A place to share your knowledge.');
  });

  it('renders nothing when token is present', () => {
    const div = document.createElement('div');
    render(<Banner appName="Conduit" token="some-jwt" />, div);
    expect(div.querySelector('.banner')).toBeNull();
  });
});
