import reducer from './home';
import { HOME_PAGE_LOADED, HOME_PAGE_UNLOADED } from '../constants/actionTypes';

describe('home reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles HOME_PAGE_LOADED success', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      payload: [{ tags: ['react', 'redux'] }, { articles: [], articlesCount: 0 }],
    };
    const state = reducer({}, action);
    expect(state.tags).toEqual(['react', 'redux']);
  });

  it('handles HOME_PAGE_LOADED with error — returns unchanged state', () => {
    const prev = { tags: ['old'] };
    const action = { type: HOME_PAGE_LOADED, error: true };
    expect(reducer(prev, action)).toBe(prev);
  });

  it('handles HOME_PAGE_UNLOADED', () => {
    expect(reducer({ tags: ['react'] }, { type: HOME_PAGE_UNLOADED })).toEqual({});
  });
});
