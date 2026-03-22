import reducer from './settings';
import {
  SETTINGS_SAVED,
  SETTINGS_PAGE_UNLOADED,
  ASYNC_START,
} from '../constants/actionTypes';

describe('settings reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles SETTINGS_SAVED success', () => {
    const action = {
      type: SETTINGS_SAVED,
      payload: { user: { username: 'updated' } },
    };
    const state = reducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBeNull();
  });

  it('handles SETTINGS_SAVED error', () => {
    const action = {
      type: SETTINGS_SAVED,
      error: true,
      payload: { errors: { email: ['invalid'] } },
    };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toEqual({ email: ['invalid'] });
  });

  it('handles SETTINGS_PAGE_UNLOADED', () => {
    expect(reducer({ inProgress: false }, { type: SETTINGS_PAGE_UNLOADED })).toEqual({});
  });

  it('handles ASYNC_START — sets inProgress', () => {
    const state = reducer({}, { type: ASYNC_START });
    expect(state.inProgress).toBe(true);
  });
});
