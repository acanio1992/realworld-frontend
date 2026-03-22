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

import agent from './agent';

const sa = require('superagent');

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
    it('sets the auth token (tokenPlugin called in request.use)', async () => {
      agent.setToken('mytoken');
      await agent.Auth.current();
      expect(sa.get).toHaveBeenCalled();
      agent.setToken(null);
    });

    it('works with null token', async () => {
      agent.setToken(null);
      await agent.Auth.current();
      expect(sa.get).toHaveBeenCalled();
    });
  });

  describe('Auth', () => {
    it('current() — GET /user', async () => {
      await agent.Auth.current();
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/user'));
    });

    it('login() — POST /users/login', async () => {
      await agent.Auth.login('a@b.com', 'pass');
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/users/login'),
        expect.objectContaining({ user: { email: 'a@b.com', password: 'pass' } }),
      );
    });

    it('register() — POST /users', async () => {
      await agent.Auth.register('alice', 'a@b.com', 'pass');
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({ user: { username: 'alice', email: 'a@b.com', password: 'pass' } }),
      );
    });

    it('save() — PUT /user', async () => {
      await agent.Auth.save({ username: 'alice' });
      expect(sa.put).toHaveBeenCalledWith(
        expect.stringContaining('/user'),
        expect.any(Object),
      );
    });
  });

  describe('Tags', () => {
    it('getAll() — GET /tags', async () => {
      await agent.Tags.getAll();
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/tags'));
    });
  });

  describe('Articles', () => {
    it('all(0) — GET /articles with page', async () => {
      await agent.Articles.all(0);
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/articles'));
    });

    it('all() — works without page (offset=0, falsy p branch)', async () => {
      await agent.Articles.all();
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
    });

    it('all(2) — with page>0 covers the p*count truthy branch in limit()', async () => {
      await agent.Articles.all(2);
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('offset=20'));
    });

    it('byAuthor() — GET /articles?author=...', async () => {
      await agent.Articles.byAuthor('alice', 0);
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('author=alice'));
    });

    it('byTag() — GET /articles?tag=...', async () => {
      await agent.Articles.byTag('react', 0);
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('tag=react'));
    });

    it('del() — DELETE /articles/:slug', async () => {
      await agent.Articles.del('my-article');
      expect(sa.del).toHaveBeenCalledWith(expect.stringContaining('/articles/my-article'));
    });

    it('favorite() — POST /articles/:slug/favorite', async () => {
      await agent.Articles.favorite('my-article');
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article/favorite'),
        undefined,
      );
    });

    it('favoritedBy() — GET /articles?favorited=...', async () => {
      await agent.Articles.favoritedBy('alice', 0);
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('favorited=alice'));
    });

    it('feed() — GET /articles/feed', async () => {
      await agent.Articles.feed();
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/articles/feed'));
    });

    it('get() — GET /articles/:slug', async () => {
      await agent.Articles.get('my-article');
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/articles/my-article'));
    });

    it('unfavorite() — DELETE /articles/:slug/favorite', async () => {
      await agent.Articles.unfavorite('my-article');
      expect(sa.del).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article/favorite'),
      );
    });

    it('update() — PUT /articles/:slug (slug omitted from body)', async () => {
      await agent.Articles.update({ slug: 'my-article', title: 'New', tagList: [] });
      expect(sa.put).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article'),
        expect.objectContaining({
          article: expect.objectContaining({ title: 'New' }),
        }),
      );
    });

    it('create() — POST /articles', async () => {
      await agent.Articles.create({ title: 'New Article', tagList: [] });
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/articles'),
        expect.objectContaining({ article: expect.objectContaining({ title: 'New Article' }) }),
      );
    });
  });

  describe('Comments', () => {
    it('create() — POST /articles/:slug/comments', async () => {
      await agent.Comments.create('my-article', { body: 'great!' });
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article/comments'),
        expect.objectContaining({ comment: { body: 'great!' } }),
      );
    });

    it('delete() — DELETE /articles/:slug/comments/:id', async () => {
      await agent.Comments.delete('my-article', 42);
      expect(sa.del).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article/comments/42'),
      );
    });

    it('forArticle() — GET /articles/:slug/comments', async () => {
      await agent.Comments.forArticle('my-article');
      expect(sa.get).toHaveBeenCalledWith(
        expect.stringContaining('/articles/my-article/comments'),
      );
    });
  });

  describe('Profile', () => {
    it('follow() — POST /profiles/:username/follow', async () => {
      await agent.Profile.follow('alice');
      expect(sa.post).toHaveBeenCalledWith(
        expect.stringContaining('/profiles/alice/follow'),
        undefined,
      );
    });

    it('get() — GET /profiles/:username', async () => {
      await agent.Profile.get('alice');
      expect(sa.get).toHaveBeenCalledWith(expect.stringContaining('/profiles/alice'));
    });

    it('unfollow() — DELETE /profiles/:username/follow', async () => {
      await agent.Profile.unfollow('alice');
      expect(sa.del).toHaveBeenCalledWith(
        expect.stringContaining('/profiles/alice/follow'),
      );
    });
  });
});
