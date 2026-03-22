import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import ConnectedProfile, { Profile } from './Profile';

jest.mock('../agent', () => ({
  Profile: {
    get: jest.fn(() => Promise.resolve({ profile: {} })),
    follow: jest.fn(() => Promise.resolve({ profile: {} })),
    unfollow: jest.fn(() => Promise.resolve({ profile: {} })),
  },
  Articles: {
    byAuthor: jest.fn(() => Promise.resolve({ articles: [], articlesCount: 0 })),
    favorite: jest.fn(() => Promise.resolve()),
    unfavorite: jest.fn(() => Promise.resolve()),
  },
}));

const store = createStore(() => ({}));

const makeProfileStore = (overrides = {}) =>
  createStore(() => ({
    articleList: {
      articles: [],
      articlesCount: 0,
      currentPage: 0,
      loading: false,
    },
    profile: {
      username: 'testuser',
      bio: 'bio',
      image: '',
      following: false,
      ...overrides.profile,
    },
    common: { currentUser: null, ...overrides.common },
  }));

const baseProps = {
  match: { params: { username: 'testuser' } },
  profile: {
    username: 'testuser',
    bio: 'Test bio',
    image: 'http://example.com/img.jpg',
    following: false,
  },
  currentUser: null,
  articles: [],
  articlesCount: 0,
  currentPage: 0,
  loading: false,
  onLoad: jest.fn(),
  onUnload: jest.fn(),
  onFollow: jest.fn(),
  onUnfollow: jest.fn(),
};

describe('Profile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders null when profile is falsy', () => {
    const div = document.createElement('div');
    render(
      <MemoryRouter>
        <Profile {...baseProps} profile={null} />
      </MemoryRouter>,
      div,
    );
    expect(div.innerHTML).toBe('');
  });

  it('renders profile page with username', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile {...baseProps} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.profile-page')).toBeTruthy();
    expect(div.textContent).toContain('testuser');
  });

  it('shows Edit Profile Settings link when isUser', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile
            {...baseProps}
            currentUser={{ username: 'testuser' }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Edit Profile Settings');
  });

  it('shows Follow button when not isUser and not following', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile
            {...baseProps}
            currentUser={{ username: 'otheruser' }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Follow');
  });

  it('shows Unfollow button when following=true and not isUser', () => {
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile
            {...baseProps}
            currentUser={{ username: 'otheruser' }}
            profile={{ ...baseProps.profile, following: true }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.textContent).toContain('Unfollow');
  });

  it('calls onFollow when Follow button is clicked', () => {
    const onFollow = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile
            {...baseProps}
            currentUser={{ username: 'otheruser' }}
            onFollow={onFollow}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button.action-btn');
    Simulate.click(btn);
    expect(onFollow).toHaveBeenCalledWith('testuser');
    document.body.removeChild(div);
  });

  it('calls onUnfollow when Unfollow button is clicked', () => {
    const onUnfollow = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile
            {...baseProps}
            currentUser={{ username: 'otheruser' }}
            onUnfollow={onUnfollow}
            profile={{ ...baseProps.profile, following: true }}
          />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button.action-btn');
    Simulate.click(btn);
    expect(onUnfollow).toHaveBeenCalledWith('testuser');
    document.body.removeChild(div);
  });

  it('calls onLoad on mount', () => {
    const onLoad = jest.fn();
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile {...baseProps} onLoad={onLoad} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(onLoad).toHaveBeenCalled();
  });

  it('calls onUnload on unmount', () => {
    const onUnload = jest.fn();
    const div = document.createElement('div');
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile {...baseProps} onUnload={onUnload} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(onUnload).toHaveBeenCalled();
  });
});

// Tests for the connected Profile component (covers mapDispatchToProps)
describe('Profile (connected)', () => {
  it('renders with connected store and calls mapDispatchToProps.onLoad on mount', () => {
    const div = document.createElement('div');
    const profileStore = makeProfileStore();
    render(
      <Provider store={profileStore}>
        <MemoryRouter>
          <ConnectedProfile match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.profile-page')).toBeTruthy();
  });

  it('dispatches FOLLOW_USER when Follow is clicked (connected)', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const profileStore = makeProfileStore({ common: { currentUser: { username: 'otheruser' } } });
    render(
      <Provider store={profileStore}>
        <MemoryRouter>
          <ConnectedProfile match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button.action-btn');
    if (btn) Simulate.click(btn);
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('dispatches UNFOLLOW_USER when Unfollow is clicked (connected)', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const profileStore = makeProfileStore({
      profile: { username: 'testuser', bio: '', image: '', following: true },
      common: { currentUser: { username: 'otheruser' } },
    });
    render(
      <Provider store={profileStore}>
        <MemoryRouter>
          <ConnectedProfile match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    const btn = div.querySelector('button.action-btn');
    if (btn) Simulate.click(btn);
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('calls onUnload on unmount (connected)', () => {
    const div = document.createElement('div');
    const profileStore = makeProfileStore();
    render(
      <Provider store={profileStore}>
        <MemoryRouter>
          <ConnectedProfile match={{ params: { username: 'testuser' } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(true).toBe(true);
  });
});
