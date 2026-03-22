import reducer from './profile';
import {
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  FOLLOW_USER,
  UNFOLLOW_USER,
} from '../constants/actionTypes';

describe('profile reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles PROFILE_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_PAGE_LOADED,
      payload: [{ profile: { username: 'user1', bio: 'Hello', following: false } }, {}],
    };
    const state = reducer({}, action);
    expect(state.username).toBe('user1');
    expect(state.following).toBe(false);
  });

  it('handles PROFILE_PAGE_UNLOADED', () => {
    expect(reducer({ username: 'user1' }, { type: PROFILE_PAGE_UNLOADED })).toEqual({});
  });

  it('handles FOLLOW_USER', () => {
    const action = {
      type: FOLLOW_USER,
      payload: { profile: { username: 'user1', following: true } },
    };
    const state = reducer({}, action);
    expect(state.following).toBe(true);
  });

  it('handles UNFOLLOW_USER', () => {
    const action = {
      type: UNFOLLOW_USER,
      payload: { profile: { username: 'user1', following: false } },
    };
    const state = reducer({ following: true }, action);
    expect(state.following).toBe(false);
  });
});
