import reducer from './auth';
import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH,
} from '../constants/actionTypes';

describe('auth reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles LOGIN success', () => {
    const action = { type: LOGIN, payload: { user: { token: 'abc' } } };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBeNull();
  });

  it('handles LOGIN error', () => {
    const action = { type: LOGIN, error: true, payload: { errors: { 'email or password': ['is invalid'] } } };
    const state = reducer({}, action);
    expect(state.errors).toEqual({ 'email or password': ['is invalid'] });
  });

  it('handles REGISTER success', () => {
    const action = { type: REGISTER, payload: { user: { token: 'abc' } } };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBeNull();
  });

  it('handles REGISTER error', () => {
    const action = { type: REGISTER, error: true, payload: { errors: { username: ['taken'] } } };
    const state = reducer({}, action);
    expect(state.errors).toEqual({ username: ['taken'] });
  });

  it('handles LOGIN_PAGE_UNLOADED', () => {
    expect(reducer({ email: 'a@b.com' }, { type: LOGIN_PAGE_UNLOADED })).toEqual({});
  });

  it('handles REGISTER_PAGE_UNLOADED', () => {
    expect(reducer({ username: 'test' }, { type: REGISTER_PAGE_UNLOADED })).toEqual({});
  });

  it('handles ASYNC_START with LOGIN subtype — sets inProgress', () => {
    const action = { type: ASYNC_START, subtype: LOGIN };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(true);
  });

  it('handles ASYNC_START with REGISTER subtype — sets inProgress', () => {
    const action = { type: ASYNC_START, subtype: REGISTER };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(true);
  });

  it('handles ASYNC_START with other subtype — unchanged', () => {
    const state = reducer({ email: 'test' }, { type: ASYNC_START, subtype: 'OTHER' });
    expect(state.inProgress).toBeUndefined();
    expect(state.email).toBe('test');
  });

  it('handles UPDATE_FIELD_AUTH', () => {
    const action = { type: UPDATE_FIELD_AUTH, key: 'email', value: 'user@test.com' };
    const state = reducer({}, action);
    expect(state.email).toBe('user@test.com');
  });
});
