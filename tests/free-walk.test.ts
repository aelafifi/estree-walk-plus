import { freeWalk, Direction } from '../src/index';
import { createSimpleAST, createFunctionAST, createComplexAST } from './fixtures';
import { TestState, TestNode } from './types';

describe('freeWalk', () => {
  it('should traverse all nodes in both directions', () => {
    const ast = createSimpleAST();
    const visited: Array<{ direction: Direction; type: string }> = [];

    freeWalk(ast, (direction, step, state) => {
      visited.push({ direction, type: step.node.type });
    });

    // Should visit each node twice (top-down and bottom-up)
    const topDownVisits = visited.filter(v => v.direction === Direction.TOP_DOWN);
    const bottomUpVisits = visited.filter(v => v.direction === Direction.BOTTOM_UP);
    
    expect(topDownVisits.length).toBe(bottomUpVisits.length);
    expect(topDownVisits.length).toBeGreaterThan(0);
    
    // First visit should be Program in top-down
    expect(topDownVisits[0].type).toBe('Program');
    // Last visit should be Program in bottom-up
    expect(bottomUpVisits[bottomUpVisits.length - 1].type).toBe('Program');
  });

  it('should pass state through traversal', () => {
    const ast = createSimpleAST();
    const initialState: TestState = { count: 0, identifiers: [] };

    const finalState = freeWalk(ast, (direction, step, state: TestState) => {
      if (direction === Direction.TOP_DOWN) {
        state.count!++;
        if (step.node.type === 'Identifier') {
          state.identifiers!.push((step.node as TestNode).name!);
        }
      }
    }, { state: initialState }) as TestState;

    expect(finalState).toBe(initialState);
    expect(finalState.count).toBeGreaterThan(0);
    expect(finalState.identifiers).toContain('x');
  });

  it('should respect start and end bounds', () => {
    const ast = createComplexAST();
    const visited: string[] = [];

    // Get a specific range within the AST
    freeWalk(ast, (direction, step, state) => {
      if (direction === Direction.TOP_DOWN) {
        visited.push(step.node.type);
      }
    }, { start: 20, end: 50 });

    // Should visit fewer nodes than full traversal
    const allVisited: string[] = [];
    freeWalk(ast, (direction, step, state) => {
      if (direction === Direction.TOP_DOWN) {
        allVisited.push(step.node.type);
      }
    });

    expect(visited.length).toBeLessThan(allVisited.length);
  });

  it('should provide correct parent information when preserveParents is true', () => {
    const ast = createFunctionAST();
    let foundIdentifier = false;

    freeWalk(ast, (direction, step, state) => {
      if (direction === Direction.TOP_DOWN && step.node.type === 'Identifier' && (step.node as TestNode).name === 'test') {
        foundIdentifier = true;
        expect(step.ancestor).toBeDefined();
        expect(step.ancestorProp).toBe('id');
        expect(step.ancestor?.node.type).toBe('FunctionDeclaration');
      }
    }, { preserveParents: true });

    expect(foundIdentifier).toBe(true);
  });

  it('should not provide parent information when preserveParents is false', () => {
    const ast = createFunctionAST();
    let foundIdentifier = false;

    freeWalk(ast, (direction, step, state) => {
      if (direction === Direction.TOP_DOWN && step.node.type === 'Identifier') {
        foundIdentifier = true;
        expect(step.ancestorProp).toBe(null);
        expect(step.ancestorIndex).toBeUndefined();
        expect(step.ancestor).toBeUndefined();
      }
    }, { preserveParents: false });

    expect(foundIdentifier).toBe(true);
  });

  it('should handle empty state when none provided', () => {
    const ast = createSimpleAST();
    
    const finalState = freeWalk(ast, (direction, step, state: TestState) => {
      state.visited = (state.visited || 0) + 1;
    }) as TestState;

    expect(typeof finalState).toBe('object');
    expect(finalState.visited).toBeGreaterThan(0);
  });

  it('should visit nodes in correct order for complex AST', () => {
    const ast = createFunctionAST();
    const topDownOrder: string[] = [];
    const bottomUpOrder: string[] = [];

    freeWalk(ast, (direction, step, state) => {
      if (direction === Direction.TOP_DOWN) {
        topDownOrder.push(step.node.type);
      } else {
        bottomUpOrder.push(step.node.type);
      }
    });

    // Top-down should start with Program
    expect(topDownOrder[0]).toBe('Program');
    // Bottom-up should end with Program
    expect(bottomUpOrder[bottomUpOrder.length - 1]).toBe('Program');
    
    // Should visit same number of nodes in both directions
    expect(topDownOrder.length).toBe(bottomUpOrder.length);
  });
});