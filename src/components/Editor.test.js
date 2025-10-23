import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Editor } from './Editor';

// Mock del módulo agent
jest.mock('../agent', () => ({
  Articles: {
    get: jest.fn(() => Promise.resolve({})),
    create: jest.fn(() => Promise.resolve({})),
    update: jest.fn(() => Promise.resolve({}))
  }
}));

// Mock súper simple del reducer
const mockReducer = (state = {}, action) => {
  return {
    editor: {
      title: '',
      description: '',
      body: '',
      tagInput: '',
      tagList: [],
      inProgress: false,
      errors: null
    }
  };
};

// Mock del store
const createMockStore = () => {
  return createStore(mockReducer);
};

// Props básicas
const defaultProps = {
  title: '',
  description: '',
  body: '',
  tagInput: '',
  tagList: [],
  inProgress: false,
  errors: null,
  onUpdateField: jest.fn(),
  onAddTag: jest.fn(),
  onRemoveTag: jest.fn(),
  onSubmit: jest.fn(),
  onLoad: jest.fn(),
  onUnload: jest.fn(),
  match: {
    params: {
      slug: null
    }
  }
};

describe('Editor Component', () => {
  test('should render without crashing', () => {
    const div = document.createElement('div');
    
    // Renderizar el componente sin Redux para mejor coverage
    render(<Editor {...defaultProps} />, div);
    
    // Verificar que el componente se renderizó
    expect(div.innerHTML).toBeTruthy();
    expect(div.innerHTML.length).toBeGreaterThan(0);
    
    // Verificar que el botón existe
    const button = div.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Publish Article');
    
    // Verificar que hay inputs
    const inputs = div.querySelectorAll('input');
    const textareas = div.querySelectorAll('textarea');
    expect(inputs.length).toBeGreaterThan(0);
    expect(textareas.length).toBeGreaterThan(0);
  });

  test('should render with custom props', () => {
    const div = document.createElement('div');
    
    const customProps = {
      ...defaultProps,
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['test', 'article'],
      inProgress: true
    };
    
    render(<Editor {...customProps} />, div);
    
    // Verificar que el componente se renderizó con los props personalizados
    expect(div.innerHTML).toBeTruthy();
    
    // Verificar que el botón está deshabilitado cuando inProgress es true
    const button = div.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(true);
    
    // Verificar que hay inputs con los valores correctos
    const titleInput = div.querySelector('input[placeholder="Article Title"]');
    const descriptionInput = div.querySelector('input[placeholder="What\'s this article about?"]');
    const bodyTextarea = div.querySelector('textarea[placeholder="Write your article (in markdown)"]');
    
    expect(titleInput).toBeTruthy();
    expect(descriptionInput).toBeTruthy();
    expect(bodyTextarea).toBeTruthy();
  });


  test('should render with errors', () => {
    const div = document.createElement('div');
    
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        title: ['Title is required'],
        description: ['Description is too short']
      }
    };
    
    render(<Editor {...propsWithErrors} />, div);
    
    // Verificar que el componente se renderizó con errores
    expect(div.innerHTML).toBeTruthy();
    
    // Verificar que ListErrors se renderiza
    const listErrors = div.querySelector('.error-messages');
    expect(listErrors).toBeTruthy();
  });

  test('should handle component lifecycle methods', () => {
    const div = document.createElement('div');
    const mockOnLoad = jest.fn();
    const mockOnUnload = jest.fn();
    
    const propsWithLifecycle = {
      ...defaultProps,
      onLoad: mockOnLoad,
      onUnload: mockOnUnload,
      match: {
        params: {
          slug: 'test-article'
        }
      }
    };
    
    render(<Editor {...propsWithLifecycle} />, div);
    
    // Verificar que onLoad se llamó (componentWillMount)
    expect(mockOnLoad).toHaveBeenCalled();
  });

});
