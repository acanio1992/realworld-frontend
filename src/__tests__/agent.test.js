jest.mock('superagent', () => {
  const makeReq = () => {
    const req = {
      set: jest.fn(),
      // use() actually CALLS the callback so tokenPlugin body gets covered
      use: jest.fn(cb => { if (typeof cb === 'function') cb(req); return req; }),
      then: jest.fn(cb =>
        Promise.resolve(cb ? cb({ body: { ok: true } }) : { body: { ok: true } }),
      ),
    };
    return req;
  };
  return {
    get: jest.fn(makeReq),
    post: jest.fn(makeReq),
    put: jest.fn(makeReq),
    del: jest.fn(makeReq),
  };
});

jest.mock('superagent-promise', () => sa => sa);

import agent from '../agent';

const sa = require('superagent');

const API = 'http://localhost:3000/api';

beforeEach(() => {
  jest.clearAllMocks();
  const freshReq = () => {
    const req = {
      set: jest.fn(),
      use: jest.fn(cb => { if (typeof cb === 'function') cb(req); return req; }),
      then: jest.fn(cb =>
        Promise.resolve(cb ? cb({ body: { ok: true } }) : { body: { ok: true } }),
      ),
    };
    return req;
  };
  sa.get.mockImplementation(freshReq);
  sa.post.mockImplementation(freshReq);
  sa.put.mockImplementation(freshReq);
  sa.del.mockImplementation(freshReq);
});

describe('agent', () => {
  describe('setToken', () => {
    it('sets the auth token — req.set called with correct Authorization header', async () => {
      agent.setToken('mytoken');
      await agent.Auth.current();
      const req = sa.get.mock.results[0].value;
      expect(req.set).toHaveBeenCalledWith('authorization', 'Token mytoken');
      agent.setToken(null);
    });

    it('works with null token — req.set is never called', async () => {
      agent.setToken(null);
      await agent.Auth.current();
      const req = sa.get.mock.results[0].value;
      expect(req.set).not.toHaveBeenCalled();
      expect(sa.get).toHaveBeenCalled();
    });
  });

  describe('Auth', () => {
    it('current() — GET /user, returns response body', async () => {
      const result = await agent.Auth.current();
      expect(sa.get).toHaveBeenCalledWith(`${API}/user`);
      expect(result).toEqual({ ok: true });
    });

    it('login() — POST /users/login with credentials, returns response body', async () => {
      const result = await agent.Auth.login('a@b.com', 'pass');
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/users/login`,
        { user: { email: 'a@b.com', password: 'pass' } },
      );
      expect(result).toEqual({ ok: true });
    });

    it('register() — POST /users with user fields, returns response body', async () => {
      const result = await agent.Auth.register('alice', 'a@b.com', 'pass');
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/users`,
        { user: { username: 'alice', email: 'a@b.com', password: 'pass' } },
      );
      expect(result).toEqual({ ok: true });
    });

    it('save() — PUT /user with wrapped user object, returns response body', async () => {
      const result = await agent.Auth.save({ username: 'alice' });
      expect(sa.put).toHaveBeenCalledWith(
        `${API}/user`,
        { user: { username: 'alice' } },
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('Tags', () => {
    it('getAll() — GET /tags, returns response body', async () => {
      const result = await agent.Tags.getAll();
      expect(sa.get).toHaveBeenCalledWith(`${API}/tags`);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('Articles', () => {
    it('all(0) — GET /articles with limit and offset=0', async () => {
      const result = await agent.Articles.all(0);
      expect(sa.get).toHaveBeenCalledWith(`${API}/articles?limit=10&offset=0`);
      expect(result).toEqual({ ok: true });
    });

    it('all() — works without page (offset=0, falsy p branch)', async () => {
      await agent.Articles.all();
      expect(sa.get).toHaveBeenCalledWith(`${API}/articles?limit=10&offset=0`);
    });

    it('all(2) — page>0 uses p*count for offset', async () => {
      await agent.Articles.all(2);
      expect(sa.get).toHaveBeenCalledWith(`${API}/articles?limit=10&offset=20`);
    });

    it('byAuthor() — GET /articles?author=alice with limit/offset', async () => {
      const result = await agent.Articles.byAuthor('alice', 0);
      expect(sa.get).toHaveBeenCalledWith(
        `${API}/articles?author=alice&limit=5&offset=0`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('byTag() — GET /articles?tag=react with limit/offset', async () => {
      const result = await agent.Articles.byTag('react', 0);
      expect(sa.get).toHaveBeenCalledWith(
        `${API}/articles?tag=react&limit=10&offset=0`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('del() — DELETE /articles/:slug, returns response body', async () => {
      const result = await agent.Articles.del('my-article');
      expect(sa.del).toHaveBeenCalledWith(`${API}/articles/my-article`);
      expect(result).toEqual({ ok: true });
    });

    it('favorite() — POST /articles/:slug/favorite with no body', async () => {
      const result = await agent.Articles.favorite('my-article');
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/articles/my-article/favorite`,
        undefined,
      );
      expect(result).toEqual({ ok: true });
    });

    it('favoritedBy() — GET /articles?favorited=alice with limit/offset', async () => {
      const result = await agent.Articles.favoritedBy('alice', 0);
      expect(sa.get).toHaveBeenCalledWith(
        `${API}/articles?favorited=alice&limit=5&offset=0`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('feed() — GET /articles/feed with fixed limit and offset', async () => {
      const result = await agent.Articles.feed();
      expect(sa.get).toHaveBeenCalledWith(
        `${API}/articles/feed?limit=10&offset=0`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('get() — GET /articles/:slug, returns response body', async () => {
      const result = await agent.Articles.get('my-article');
      expect(sa.get).toHaveBeenCalledWith(`${API}/articles/my-article`);
      expect(result).toEqual({ ok: true });
    });

    it('unfavorite() — DELETE /articles/:slug/favorite', async () => {
      const result = await agent.Articles.unfavorite('my-article');
      expect(sa.del).toHaveBeenCalledWith(
        `${API}/articles/my-article/favorite`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('update() — PUT /articles/:slug with slug omitted from body', async () => {
      const result = await agent.Articles.update({ slug: 'my-article', title: 'New', tagList: [] });
      expect(sa.put).toHaveBeenCalledWith(
        `${API}/articles/my-article`,
        { article: { slug: undefined, title: 'New', tagList: [] } },
      );
      expect(result).toEqual({ ok: true });
    });

    it('create() — POST /articles with article body', async () => {
      const result = await agent.Articles.create({ title: 'New Article', tagList: [] });
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/articles`,
        { article: { title: 'New Article', tagList: [] } },
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('Comments', () => {
    it('create() — POST /articles/:slug/comments with comment body', async () => {
      const result = await agent.Comments.create('my-article', { body: 'great!' });
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/articles/my-article/comments`,
        { comment: { body: 'great!' } },
      );
      expect(result).toEqual({ ok: true });
    });

    it('delete() — DELETE /articles/:slug/comments/:id', async () => {
      const result = await agent.Comments.delete('my-article', 42);
      expect(sa.del).toHaveBeenCalledWith(
        `${API}/articles/my-article/comments/42`,
      );
      expect(result).toEqual({ ok: true });
    });

    it('forArticle() — GET /articles/:slug/comments', async () => {
      const result = await agent.Comments.forArticle('my-article');
      expect(sa.get).toHaveBeenCalledWith(
        `${API}/articles/my-article/comments`,
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('Profile', () => {
    it('follow() — POST /profiles/:username/follow with no body', async () => {
      const result = await agent.Profile.follow('alice');
      expect(sa.post).toHaveBeenCalledWith(
        `${API}/profiles/alice/follow`,
        undefined,
      );
      expect(result).toEqual({ ok: true });
    });

    it('get() — GET /profiles/:username, returns response body', async () => {
      const result = await agent.Profile.get('alice');
      expect(sa.get).toHaveBeenCalledWith(`${API}/profiles/alice`);
      expect(result).toEqual({ ok: true });
    });

    it('unfollow() — DELETE /profiles/:username/follow', async () => {
      const result = await agent.Profile.unfollow('alice');
      expect(sa.del).toHaveBeenCalledWith(
        `${API}/profiles/alice/follow`,
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
