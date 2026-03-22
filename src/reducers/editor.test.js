import reducer from './editor';
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR,
} from '../constants/actionTypes';

describe('editor reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles EDITOR_PAGE_LOADED with payload', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: {
        article: {
          slug: 'my-slug',
          title: 'My Title',
          description: 'Desc',
          body: 'Body text',
          tagList: ['tag1', 'tag2'],
        },
      },
    };
    const state = reducer({}, action);
    expect(state.articleSlug).toBe('my-slug');
    expect(state.title).toBe('My Title');
    expect(state.tagList).toEqual(['tag1', 'tag2']);
    expect(state.tagInput).toBe('');
  });

  it('handles EDITOR_PAGE_LOADED without payload (new article)', () => {
    const action = { type: EDITOR_PAGE_LOADED, payload: null };
    const state = reducer({}, action);
    expect(state.articleSlug).toBe('');
    expect(state.title).toBe('');
    expect(state.tagList).toEqual([]);
    expect(state.tagInput).toBe('');
  });

  it('handles EDITOR_PAGE_UNLOADED', () => {
    expect(reducer({ title: 'something' }, { type: EDITOR_PAGE_UNLOADED })).toEqual({});
  });

  it('handles ARTICLE_SUBMITTED success', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      payload: { article: { slug: 'new' } },
    };
    const state = reducer({ inProgress: true }, action);
    expect(state.inProgress).toBeNull();
    expect(state.errors).toBeNull();
  });

  it('handles ARTICLE_SUBMITTED error', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      error: true,
      payload: { errors: { title: ['required'] } },
    };
    const state = reducer({}, action);
    expect(state.errors).toEqual({ title: ['required'] });
  });

  it('handles ASYNC_START with ARTICLE_SUBMITTED subtype', () => {
    const action = { type: ASYNC_START, subtype: ARTICLE_SUBMITTED };
    const state = reducer({}, action);
    expect(state.inProgress).toBe(true);
  });

  it('handles ASYNC_START with other subtype — unchanged', () => {
    const state = reducer({ title: 'x' }, { type: ASYNC_START, subtype: 'OTHER' });
    expect(state.inProgress).toBeUndefined();
    expect(state.title).toBe('x');
  });

  it('handles ADD_TAG', () => {
    const state = reducer(
      { tagList: ['existing'], tagInput: 'newtag' },
      { type: ADD_TAG },
    );
    expect(state.tagList).toEqual(['existing', 'newtag']);
    expect(state.tagInput).toBe('');
  });

  it('handles REMOVE_TAG', () => {
    const state = reducer(
      { tagList: ['keep', 'remove', 'also-keep'] },
      { type: REMOVE_TAG, tag: 'remove' },
    );
    expect(state.tagList).toEqual(['keep', 'also-keep']);
  });

  it('handles UPDATE_FIELD_EDITOR', () => {
    const state = reducer({}, { type: UPDATE_FIELD_EDITOR, key: 'title', value: 'New Title' });
    expect(state.title).toBe('New Title');
  });
});
