import reducer from './article';
import {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
  ADD_COMMENT,
  DELETE_COMMENT,
} from '../constants/actionTypes';

describe('article reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('handles ARTICLE_PAGE_LOADED', () => {
    const action = {
      type: ARTICLE_PAGE_LOADED,
      payload: [
        { article: { slug: 'test', title: 'Test Article' } },
        { comments: [{ id: 1, body: 'hello' }] },
      ],
    };
    const state = reducer({}, action);
    expect(state.article).toEqual({ slug: 'test', title: 'Test Article' });
    expect(state.comments).toEqual([{ id: 1, body: 'hello' }]);
  });

  it('handles ARTICLE_PAGE_UNLOADED', () => {
    const prev = { article: { slug: 'test' }, comments: [] };
    expect(reducer(prev, { type: ARTICLE_PAGE_UNLOADED })).toEqual({});
  });

  it('handles ADD_COMMENT success — appends comment', () => {
    const action = {
      type: ADD_COMMENT,
      payload: { comment: { id: 2, body: 'new comment' } },
    };
    const state = reducer({ comments: [{ id: 1, body: 'existing' }] }, action);
    expect(state.commentErrors).toBeNull();
    expect(state.comments).toHaveLength(2);
    expect(state.comments[1]).toEqual({ id: 2, body: 'new comment' });
  });

  it('handles ADD_COMMENT success — no existing comments', () => {
    const action = {
      type: ADD_COMMENT,
      payload: { comment: { id: 1, body: 'first' } },
    };
    const state = reducer({}, action);
    expect(state.comments).toEqual([{ id: 1, body: 'first' }]);
  });

  it('handles ADD_COMMENT error', () => {
    const action = {
      type: ADD_COMMENT,
      error: true,
      payload: { errors: { body: ["can't be blank"] } },
    };
    const state = reducer({ comments: [{ id: 1 }] }, action);
    expect(state.commentErrors).toEqual({ body: ["can't be blank"] });
    expect(state.comments).toBeNull();
  });

  it('handles DELETE_COMMENT — removes correct comment', () => {
    const state = reducer(
      { comments: [{ id: 1, body: 'del' }, { id: 2, body: 'keep' }] },
      { type: DELETE_COMMENT, commentId: 1 },
    );
    expect(state.comments).toHaveLength(1);
    expect(state.comments[0].id).toBe(2);
  });
});
