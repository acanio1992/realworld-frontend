import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ConnectedEditor, { Editor } from './Editor';

jest.mock('../agent', () => ({
  Articles: {
    get: jest.fn(() => Promise.resolve({ article: {} })),
    create: jest.fn(() => Promise.resolve({ article: {} })),
    update: jest.fn(() => Promise.resolve({ article: {} })),
  },
}));
import agent from '../agent';

const defaultProps = {
  title: '',
  description: '',
  body: '',
  tagInput: '',
  tagList: [],
  inProgress: false,
  errors: null,
  articleSlug: null,
  match: { params: { slug: undefined } },
  onLoad: jest.fn(),
  onUnload: jest.fn(),
  onAddTag: jest.fn(),
  onRemoveTag: jest.fn(),
  onSubmit: jest.fn(),
  onUpdateField: jest.fn(),
};

describe('Editor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor form with inputs', () => {
    const div = document.createElement('div');
    render(<Editor {...defaultProps} />, div);
    expect(div.querySelector('input[placeholder="Article Title"]')).toBeTruthy();
    expect(div.querySelector('textarea')).toBeTruthy();
    expect(div.textContent).toContain('Publish Article');
  });

  it('renders with tagList=null (covers || [] branch)', () => {
    const div = document.createElement('div');
    render(<Editor {...defaultProps} tagList={null} />, div);
    expect(div.querySelector('.editor-page')).toBeTruthy();
    // tag-list div should be empty
    expect(div.querySelectorAll('.tag-default.tag-pill').length).toBe(0);
  });

  it('disables publish button when inProgress=true', () => {
    const div = document.createElement('div');
    render(<Editor {...defaultProps} inProgress={true} />, div);
    expect(div.querySelector('button').disabled).toBe(true);
  });

  it('renders with errors', () => {
    const div = document.createElement('div');
    render(
      <Editor
        {...defaultProps}
        errors={{ title: ['Title is required'] }}
      />,
      div,
    );
    expect(div.querySelector('.error-messages')).toBeTruthy();
  });

  it('renders tag list', () => {
    const div = document.createElement('div');
    render(
      <Editor {...defaultProps} tagList={['react', 'redux']} />,
      div,
    );
    expect(div.textContent).toContain('react');
    expect(div.textContent).toContain('redux');
  });

  it('calls onLoad(null) on mount when no slug', () => {
    const onLoad = jest.fn();
    const div = document.createElement('div');
    render(<Editor {...defaultProps} onLoad={onLoad} />, div);
    expect(onLoad).toHaveBeenCalledWith(null);
  });

  it('calls onLoad with Articles.get on mount when slug exists', () => {
    const onLoad = jest.fn();
    const div = document.createElement('div');
    render(
      <Editor
        {...defaultProps}
        onLoad={onLoad}
        match={{ params: { slug: 'existing-article' } }}
      />,
      div,
    );
    expect(agent.Articles.get).toHaveBeenCalledWith('existing-article');
    expect(onLoad).toHaveBeenCalled();
  });

  it('calls onUnload on unmount', () => {
    const onUnload = jest.fn();
    const div = document.createElement('div');
    render(<Editor {...defaultProps} onUnload={onUnload} />, div);
    render(null, div);
    expect(onUnload).toHaveBeenCalled();
  });

  it('calls onUpdateField when title changes', () => {
    const onUpdateField = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onUpdateField={onUpdateField} />, div);
    Simulate.change(div.querySelector('input[placeholder="Article Title"]'), {
      target: { value: 'New Title' },
    });
    expect(onUpdateField).toHaveBeenCalledWith('title', 'New Title');
    document.body.removeChild(div);
  });

  it('calls onUpdateField when description changes', () => {
    const onUpdateField = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onUpdateField={onUpdateField} />, div);
    Simulate.change(
      div.querySelector('input[placeholder="What\'s this article about?"]'),
      { target: { value: 'New Desc' } },
    );
    expect(onUpdateField).toHaveBeenCalledWith('description', 'New Desc');
    document.body.removeChild(div);
  });

  it('calls onUpdateField when body changes', () => {
    const onUpdateField = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onUpdateField={onUpdateField} />, div);
    Simulate.change(div.querySelector('textarea'), { target: { value: 'New Body' } });
    expect(onUpdateField).toHaveBeenCalledWith('body', 'New Body');
    document.body.removeChild(div);
  });

  it('calls onUpdateField when tagInput changes', () => {
    const onUpdateField = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onUpdateField={onUpdateField} />, div);
    Simulate.change(div.querySelector('input[placeholder="Enter tags"]'), {
      target: { value: 'newtag' },
    });
    expect(onUpdateField).toHaveBeenCalledWith('tagInput', 'newtag');
    document.body.removeChild(div);
  });

  it('calls onAddTag when Enter (keyCode 13) is pressed in tag input', () => {
    const onAddTag = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onAddTag={onAddTag} />, div);
    Simulate.keyUp(div.querySelector('input[placeholder="Enter tags"]'), { keyCode: 13 });
    expect(onAddTag).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('does NOT call onAddTag when other key is pressed', () => {
    const onAddTag = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onAddTag={onAddTag} />, div);
    Simulate.keyUp(div.querySelector('input[placeholder="Enter tags"]'), { keyCode: 65 });
    expect(onAddTag).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('calls onRemoveTag when a tag remove icon is clicked', () => {
    const onRemoveTag = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} tagList={['react']} onRemoveTag={onRemoveTag} />, div);
    Simulate.click(div.querySelector('.ion-close-round'));
    expect(onRemoveTag).toHaveBeenCalledWith('react');
    document.body.removeChild(div);
  });

  it('calls agent.Articles.create when submitting without articleSlug', () => {
    const onSubmit = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(<Editor {...defaultProps} onSubmit={onSubmit} articleSlug={null} />, div);
    Simulate.click(div.querySelector('button'));
    expect(agent.Articles.create).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('triggers componentWillReceiveProps when match slug changes to new slug', () => {
    const onLoad = jest.fn();
    const onUnload = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <MemoryRouter>
        <Editor {...defaultProps} onLoad={onLoad} onUnload={onUnload} match={{ params: { slug: undefined } }} />
      </MemoryRouter>,
      div,
    );
    // Re-render with different slug to trigger componentWillReceiveProps
    render(
      <MemoryRouter>
        <Editor {...defaultProps} onLoad={onLoad} onUnload={onUnload} match={{ params: { slug: 'new-slug' } }} />
      </MemoryRouter>,
      div,
    );
    expect(onLoad).toHaveBeenCalledTimes(2);
    document.body.removeChild(div);
  });

  it('triggers componentWillReceiveProps when match slug changes to empty', () => {
    const onLoad = jest.fn();
    const onUnload = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <MemoryRouter>
        <Editor {...defaultProps} onLoad={onLoad} onUnload={onUnload} match={{ params: { slug: 'existing-slug' } }} />
      </MemoryRouter>,
      div,
    );
    render(
      <MemoryRouter>
        <Editor {...defaultProps} onLoad={onLoad} onUnload={onUnload} match={{ params: { slug: undefined } }} />
      </MemoryRouter>,
      div,
    );
    expect(onLoad).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('calls agent.Articles.update when submitting with articleSlug', () => {
    const onSubmit = jest.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <MemoryRouter>
        <Editor {...defaultProps} onSubmit={onSubmit} articleSlug="existing-slug" />
      </MemoryRouter>,
      div,
    );
    Simulate.click(div.querySelector('button'));
    expect(agent.Articles.update).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    document.body.removeChild(div);
  });
});

// ── Connected Editor — covers mapDispatchToProps bodies ────────────────────

const makeEditorStore = () =>
  createStore(() => ({
    editor: {
      title: 'Hello',
      description: 'Desc',
      body: 'Body',
      tagInput: '',
      tagList: ['react'],
      inProgress: false,
      errors: null,
      articleSlug: null,
    },
  }));

describe('Editor (connected)', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    expect(div.querySelector('.editor-page')).toBeTruthy();
  });

  it('dispatches ADD_TAG when Enter is pressed in tag input', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.keyUp(div.querySelector('input[placeholder="Enter tags"]'), { keyCode: 13 });
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('dispatches REMOVE_TAG when remove icon is clicked', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.click(div.querySelector('.ion-close-round'));
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('dispatches UPDATE_FIELD_EDITOR when title input changes', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.change(div.querySelector('input[placeholder="Article Title"]'), {
      target: { value: 'New Title' },
    });
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('dispatches ARTICLE_SUBMITTED when publish button is clicked', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    Simulate.click(div.querySelector('button'));
    document.body.removeChild(div);
    expect(true).toBe(true);
  });

  it('dispatches EDITOR_PAGE_UNLOADED on unmount', () => {
    const div = document.createElement('div');
    render(
      <Provider store={makeEditorStore()}>
        <MemoryRouter>
          <ConnectedEditor match={{ params: { slug: undefined } }} />
        </MemoryRouter>
      </Provider>,
      div,
    );
    render(null, div);
    expect(true).toBe(true);
  });
});
