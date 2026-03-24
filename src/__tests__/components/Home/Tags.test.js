import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import Tags from '../../../components/Home/Tags';

jest.mock('../../../agent', () => ({
  Articles: { byTag: jest.fn(() => Promise.resolve({})) },
}));

describe('Tags', () => {
  it('renders loading state when tags is falsy', () => {
    const div = document.createElement('div');
    render(<Tags tags={null} onClickTag={jest.fn()} />, div);
    expect(div.textContent).toContain('Loading Tags...');
  });

  it('renders tag list when tags is provided', () => {
    const div = document.createElement('div');
    render(<Tags tags={['react', 'redux', 'javascript']} onClickTag={jest.fn()} />, div);
    expect(div.querySelector('.tag-list')).toBeTruthy();
    expect(div.textContent).toContain('react');
    expect(div.textContent).toContain('redux');
  });

  it('calls onClickTag when a tag is clicked', () => {
    const onClickTag = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Tags tags={['mytag']} onClickTag={onClickTag} />, div);
    const link = div.querySelector('a');
    Simulate.click(link);
    expect(onClickTag).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('invokes pager function passed to onClickTag', () => {
    const agent = require('../../../agent');
    // onClickTag receives (tag, pager, payload) — we call pager to cover that branch
    const onClickTag = jest.fn((_tag, pager) => pager(0));
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Tags tags={['mytag']} onClickTag={onClickTag} />, div);
    Simulate.click(div.querySelector('a'));
    expect(agent.Articles.byTag).toHaveBeenCalledWith('mytag', 0);
    document.body.removeChild(div);
  });
});
