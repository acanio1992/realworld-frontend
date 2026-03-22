import { promiseMiddleware, localStorageMiddleware } from './middleware';
import { LOGIN, REGISTER, LOGOUT, ASYNC_START, ASYNC_END } from './constants/actionTypes';

jest.mock('./agent', () => ({ setToken: jest.fn() }));
import agent from './agent';

// ─── promiseMiddleware ────────────────────────────────────────────────────────

describe('promiseMiddleware', () => {
  let store, next, dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    store = {
      getState: jest.fn(() => ({ viewChangeCounter: 0 })),
      dispatch,
    };
    next = jest.fn();
  });

  it('calls next(action) when payload is NOT a promise', () => {
    const action = { type: 'PLAIN', payload: 'not-a-promise' };
    promiseMiddleware(store)(next)(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('calls next(action) when payload is undefined', () => {
    const action = { type: 'NO_PAYLOAD' };
    promiseMiddleware(store)(next)(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('dispatches ASYNC_START when payload is a promise', async () => {
    const action = { type: 'MY_ACTION', payload: Promise.resolve({ data: 1 }) };
    promiseMiddleware(store)(next)(action);
    expect(dispatch).toHaveBeenCalledWith({ type: ASYNC_START, subtype: 'MY_ACTION' });
  });

  it('dispatches ASYNC_END and action on promise resolve', async () => {
    const resolved = { data: 42 };
    const action = { type: 'MY_ACTION', payload: Promise.resolve(resolved) };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch).toHaveBeenCalledWith({ type: ASYNC_END, promise: resolved });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MY_ACTION', payload: resolved }));
  });

  it('dispatches nothing on resolve when viewChangeCounter changed (skipTracking=false)', async () => {
    let callCount = 0;
    store.getState = jest.fn(() => {
      callCount++;
      return { viewChangeCounter: callCount - 1 }; // changes between calls
    });
    const action = { type: 'MY_ACTION', payload: Promise.resolve({}) };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    // ASYNC_START is dispatched (first call), but resolve dispatches are skipped
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: ASYNC_START, subtype: 'MY_ACTION' });
  });

  it('dispatches regardless of viewChangeCounter when skipTracking=true', async () => {
    let callCount = 0;
    store.getState = jest.fn(() => ({ viewChangeCounter: callCount++ }));
    const action = { type: 'MY_ACTION', payload: Promise.resolve({ ok: true }), skipTracking: true };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: ASYNC_END }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MY_ACTION' }));
  });

  it('sets action.error=true and dispatches on promise rejection', async () => {
    const error = { response: { body: { errors: { email: ['invalid'] } } } };
    const action = { type: 'MY_ACTION', payload: Promise.reject(error) };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MY_ACTION', error: true }));
  });

  it('skips dispatching on rejection when viewChangeCounter changed', async () => {
    let callCount = 0;
    store.getState = jest.fn(() => ({ viewChangeCounter: callCount++ }));
    const error = { response: { body: {} } };
    const action = { type: 'MY_ACTION', payload: Promise.reject(error) };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch).toHaveBeenCalledTimes(1); // only ASYNC_START
  });

  it('skips ASYNC_END on rejection when skipTracking=true', async () => {
    const error = { response: { body: {} } };
    const action = { type: 'MY_ACTION', payload: Promise.reject(error), skipTracking: true };
    promiseMiddleware(store)(next)(action);
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: ASYNC_END }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MY_ACTION', error: true }));
  });
});

// ─── localStorageMiddleware ───────────────────────────────────────────────────

describe('localStorageMiddleware', () => {
  let store, next;

  let setItemSpy;
  let originalSetItem;

  beforeEach(() => {
    store = { getState: jest.fn(() => ({})), dispatch: jest.fn() };
    next = jest.fn();
    // Mock Storage.prototype.setItem so window.localStorage.setItem is intercepted
    originalSetItem = Storage.prototype.setItem;
    setItemSpy = jest.fn();
    Storage.prototype.setItem = setItemSpy;
    agent.setToken.mockClear();
  });

  afterEach(() => {
    Storage.prototype.setItem = originalSetItem;
  });

  it('sets token in localStorage and agent on LOGIN without error', () => {
    const action = { type: LOGIN, payload: { user: { token: 'mytoken' } } };
    localStorageMiddleware(store)(next)(action);
    expect(setItemSpy).toHaveBeenCalledWith('jwt', 'mytoken');
    expect(agent.setToken).toHaveBeenCalledWith('mytoken');
    expect(next).toHaveBeenCalledWith(action);
  });

  it('sets token on REGISTER without error', () => {
    const action = { type: REGISTER, payload: { user: { token: 'regtoken' } } };
    localStorageMiddleware(store)(next)(action);
    expect(setItemSpy).toHaveBeenCalledWith('jwt', 'regtoken');
    expect(agent.setToken).toHaveBeenCalledWith('regtoken');
  });

  it('does NOT set token on LOGIN with error', () => {
    const action = { type: LOGIN, error: true, payload: { errors: {} } };
    localStorageMiddleware(store)(next)(action);
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(agent.setToken).not.toHaveBeenCalled();
  });

  it('clears token on LOGOUT', () => {
    const action = { type: LOGOUT };
    localStorageMiddleware(store)(next)(action);
    expect(setItemSpy).toHaveBeenCalledWith('jwt', '');
    expect(agent.setToken).toHaveBeenCalledWith(null);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('just calls next for unrelated actions', () => {
    const action = { type: 'UNRELATED' };
    localStorageMiddleware(store)(next)(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
