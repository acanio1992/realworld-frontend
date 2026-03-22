import { history, store } from './store';

describe('store', () => {
  it('exports a redux store', () => {
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
  });

  it('exports a history object', () => {
    expect(history).toBeDefined();
    expect(typeof history.push).toBe('function');
  });

  it('initial state has expected shape', () => {
    const state = store.getState();
    expect(state).toHaveProperty('common');
    expect(state).toHaveProperty('auth');
  });
});
