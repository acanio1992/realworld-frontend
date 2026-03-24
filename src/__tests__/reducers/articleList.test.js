import reducer from '../../reducers/articleList';
import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
} from '../../constants/actionTypes';

const makeArticle = (slug, favorited, favoritesCount) => ({
  slug,
  title: 'Title',
  favorited,
  favoritesCount,
});

describe('articleList reducer', () => {
  it('returns default state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  describe('ARTICLE_FAVORITED / ARTICLE_UNFAVORITED', () => {
    const initialState = {
      articles: [makeArticle('a', false, 0), makeArticle('b', false, 5)],
    };

    it('updates matching article on ARTICLE_FAVORITED', () => {
      const action = {
        type: ARTICLE_FAVORITED,
        payload: { article: { slug: 'a', favorited: true, favoritesCount: 1 } },
      };
      const state = reducer(initialState, action);
      expect(state.articles[0].favorited).toBe(true);
      expect(state.articles[0].favoritesCount).toBe(1);
      expect(state.articles[1].favoritesCount).toBe(5); // unchanged
    });

    it('updates matching article on ARTICLE_UNFAVORITED', () => {
      const prev = { articles: [makeArticle('b', true, 6), makeArticle('c', false, 0)] };
      const action = {
        type: ARTICLE_UNFAVORITED,
        payload: { article: { slug: 'b', favorited: false, favoritesCount: 5 } },
      };
      const state = reducer(prev, action);
      expect(state.articles[0].favorited).toBe(false);
      expect(state.articles[0].favoritesCount).toBe(5);
    });

    it('leaves non-matching articles unchanged', () => {
      const action = {
        type: ARTICLE_FAVORITED,
        payload: { article: { slug: 'z', favorited: true, favoritesCount: 1 } },
      };
      const state = reducer(initialState, action);
      expect(state.articles[0]).toEqual(initialState.articles[0]);
    });
  });

  it('handles SET_PAGE', () => {
    const action = {
      type: SET_PAGE,
      page: 2,
      payload: { articles: [makeArticle('x', false, 0)], articlesCount: 1 },
    };
    const state = reducer({}, action);
    expect(state.currentPage).toBe(2);
    expect(state.articlesCount).toBe(1);
  });

  it('handles APPLY_TAG_FILTER', () => {
    const pager = () => {};
    const action = {
      type: APPLY_TAG_FILTER,
      tag: 'react',
      pager,
      payload: { articles: [], articlesCount: 0 },
    };
    const state = reducer({}, action);
    expect(state.tag).toBe('react');
    expect(state.tab).toBeNull();
    expect(state.currentPage).toBe(0);
  });

  describe('HOME_PAGE_LOADED', () => {
    it('handles HOME_PAGE_LOADED success', () => {
      const pager = () => {};
      const action = {
        type: HOME_PAGE_LOADED,
        tab: 'all',
        pager,
        payload: [
          { tags: ['tag1'] },
          { articles: [makeArticle('a', false, 0)], articlesCount: 1 },
        ],
      };
      const state = reducer({}, action);
      expect(state.tags).toEqual(['tag1']);
      expect(state.tab).toBe('all');
      expect(state.currentPage).toBe(0);
    });

    it('handles HOME_PAGE_LOADED with error', () => {
      const action = {
        type: HOME_PAGE_LOADED,
        error: true,
        tab: 'feed',
      };
      const state = reducer({}, action);
      expect(state.tab).toBe('feed');
      expect(state.currentPage).toBe(0);
      expect(state.tags).toBeUndefined();
    });
  });

  it('handles HOME_PAGE_UNLOADED', () => {
    expect(reducer({ articles: [] }, { type: HOME_PAGE_UNLOADED })).toEqual({});
  });

  it('handles CHANGE_TAB', () => {
    const action = {
      type: CHANGE_TAB,
      tab: 'feed',
      pager: () => {},
      payload: { articles: [], articlesCount: 0 },
    };
    const state = reducer({}, action);
    expect(state.tab).toBe('feed');
    expect(state.tag).toBeNull();
    expect(state.currentPage).toBe(0);
  });

  it('handles PROFILE_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_PAGE_LOADED,
      pager: () => {},
      payload: [
        { profile: { username: 'user' } },
        { articles: [makeArticle('a', false, 0)], articlesCount: 1 },
      ],
    };
    const state = reducer({}, action);
    expect(state.articlesCount).toBe(1);
    expect(state.currentPage).toBe(0);
  });

  it('handles PROFILE_FAVORITES_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_FAVORITES_PAGE_LOADED,
      pager: () => {},
      payload: [
        { profile: {} },
        { articles: [], articlesCount: 5 },
      ],
    };
    const state = reducer({}, action);
    expect(state.articlesCount).toBe(5);
  });

  it('handles PROFILE_PAGE_UNLOADED', () => {
    expect(reducer({ articles: [] }, { type: PROFILE_PAGE_UNLOADED })).toEqual({});
  });

  it('handles PROFILE_FAVORITES_PAGE_UNLOADED', () => {
    expect(reducer({ articles: [] }, { type: PROFILE_FAVORITES_PAGE_UNLOADED })).toEqual({});
  });
});
