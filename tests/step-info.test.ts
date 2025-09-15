import { StepInfo } from '../src/StepInfo';
import type { Node } from 'acorn';

describe('StepInfo', () => {
  const createMockNode = (type: string, name?: string): any => ({
    type,
    name,
  });

  describe('constructor', () => {
    it('should create StepInfo with all properties', () => {
      const node = createMockNode('Identifier', 'test');
      const ancestor = new StepInfo(createMockNode('Program'), null);
      const step = new StepInfo(node, 'body', 0, ancestor);

      expect(step.node).toBe(node);
      expect(step.ancestorProp).toBe('body');
      expect(step.ancestorIndex).toBe(0);
      expect(step.ancestor).toBe(ancestor);
    });

    it('should create root StepInfo with null/undefined properties', () => {
      const node = createMockNode('Program');
      const step = new StepInfo(node, null);

      expect(step.node).toBe(node);
      expect(step.ancestorProp).toBe(null);
      expect(step.ancestorIndex).toBeUndefined();
      expect(step.ancestor).toBeUndefined();
    });
  });

  describe('descending property', () => {
    it('should return path from current node to root', () => {
      const rootNode = createMockNode('Program');
      const funcNode = createMockNode('FunctionDeclaration');
      const blockNode = createMockNode('BlockStatement');
      const identNode = createMockNode('Identifier');

      const rootStep = new StepInfo(rootNode, null);
      const funcStep = new StepInfo(funcNode, 'body', 0, rootStep);
      const blockStep = new StepInfo(blockNode, 'body', undefined, funcStep);
      const identStep = new StepInfo(identNode, 'body', 0, blockStep);

      const descending = identStep.descending;
      
      expect(descending).toHaveLength(4);
      expect(descending[0]).toBe(identStep);
      expect(descending[1]).toBe(blockStep);
      expect(descending[2]).toBe(funcStep);
      expect(descending[3]).toBe(rootStep);
    });

    it('should return single item for root node', () => {
      const rootNode = createMockNode('Program');
      const rootStep = new StepInfo(rootNode, null);

      const descending = rootStep.descending;
      
      expect(descending).toHaveLength(1);
      expect(descending[0]).toBe(rootStep);
    });
  });

  describe('ascending property', () => {
    it('should return path from root to current node', () => {
      const rootNode = createMockNode('Program');
      const funcNode = createMockNode('FunctionDeclaration');
      const identNode = createMockNode('Identifier');

      const rootStep = new StepInfo(rootNode, null);
      const funcStep = new StepInfo(funcNode, 'body', 0, rootStep);
      const identStep = new StepInfo(identNode, 'id', undefined, funcStep);

      const ascending = identStep.ascending;
      
      expect(ascending).toHaveLength(3);
      expect(ascending[0]).toBe(rootStep);
      expect(ascending[1]).toBe(funcStep);
      expect(ascending[2]).toBe(identStep);
    });
  });

  describe('nearestOfType', () => {
    it('should find nearest ancestor of specified type', () => {
      const rootNode = createMockNode('Program');
      const funcNode = createMockNode('FunctionDeclaration');
      const blockNode = createMockNode('BlockStatement');
      const identNode = createMockNode('Identifier');

      const rootStep = new StepInfo(rootNode, null);
      const funcStep = new StepInfo(funcNode, 'body', 0, rootStep);
      const blockStep = new StepInfo(blockNode, 'body', undefined, funcStep);
      const identStep = new StepInfo(identNode, 'body', 0, blockStep);

      expect(identStep.nearestOfType('FunctionDeclaration')).toBe(funcStep);
      expect(identStep.nearestOfType('Program')).toBe(rootStep);
      expect(identStep.nearestOfType('BlockStatement')).toBe(blockStep);
    });

    it('should return self if current node matches type', () => {
      const funcNode = createMockNode('FunctionDeclaration');
      const funcStep = new StepInfo(funcNode, 'body', 0);

      expect(funcStep.nearestOfType('FunctionDeclaration')).toBe(funcStep);
    });

    it('should return null if no ancestor matches type', () => {
      const identNode = createMockNode('Identifier');
      const identStep = new StepInfo(identNode, null);

      expect(identStep.nearestOfType('FunctionDeclaration')).toBe(null);
    });
  });

  describe('replaceWith', () => {
    it('should replace node in array property', () => {
      const parentNode = createMockNode('BlockStatement');
      parentNode.body = [createMockNode('VariableDeclaration')];
      
      const parentStep = new StepInfo(parentNode, null);
      const childStep = new StepInfo(parentNode.body[0], 'body', 0, parentStep);
      
      const newNode = createMockNode('ExpressionStatement');
      childStep.replaceWith(newNode);

      expect(parentNode.body[0]).toBe(newNode);
      expect(childStep.node).toBe(newNode);
    });

    it('should replace node in single property', () => {
      const parentNode = createMockNode('IfStatement');
      const testNode = createMockNode('Identifier');
      parentNode.test = testNode;
      
      const parentStep = new StepInfo(parentNode, null);
      const childStep = new StepInfo(testNode, 'test', undefined, parentStep);
      
      const newNode = createMockNode('Literal');
      childStep.replaceWith(newNode);

      expect(parentNode.test).toBe(newNode);
      expect(childStep.node).toBe(newNode);
    });

    it('should throw error when trying to replace root node', () => {
      const rootNode = createMockNode('Program');
      const rootStep = new StepInfo(rootNode, null);
      
      const newNode = createMockNode('BlockStatement');
      
      expect(() => {
        rootStep.replaceWith(newNode);
      }).toThrow('Cannot replace the root node');
    });

    it('should throw error when ancestor info is incomplete', () => {
      const node = createMockNode('Identifier');
      const step = new StepInfo(node, null, undefined, undefined);
      
      const newNode = createMockNode('Literal');
      
      expect(() => {
        step.replaceWith(newNode);
      }).toThrow('Cannot replace the root node');
    });
  });
});