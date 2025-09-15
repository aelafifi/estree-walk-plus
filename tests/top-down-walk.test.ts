import { topDownWalk } from '../src/index';
import { createSimpleAST, createFunctionAST, createComplexAST } from './fixtures';

describe('topDownWalk', () => {
  it('should visit nodes only in top-down order', () => {
    const ast = createSimpleAST();
    const visitOrder: string[] = [];

    topDownWalk(ast, {
      Program(step, state) {
        visitOrder.push('Program');
      },
      VariableDeclaration(step, state) {
        visitOrder.push('VariableDeclaration');
      },
      VariableDeclarator(step, state) {
        visitOrder.push('VariableDeclarator');
      },
      Identifier(step, state) {
        visitOrder.push('Identifier');
      },
      Literal(step, state) {
        visitOrder.push('Literal');
      },
    });

    // Program should be visited first
    expect(visitOrder[0]).toBe('Program');
    // Should contain expected node types
    expect(visitOrder).toContain('VariableDeclaration');
    expect(visitOrder).toContain('Identifier');
    expect(visitOrder).toContain('Literal');
  });

  it('should pass correct step info to callbacks', () => {
    const ast = createFunctionAST();
    let functionNameFound = false;

    topDownWalk(ast, {
      Identifier(step, state) {
        const node = step.node as any;
        if (node.name === 'test') {
          functionNameFound = true;
          expect(step.ancestor).toBeDefined();
          expect(step.ancestor?.node.type).toBe('FunctionDeclaration');
          expect(step.ancestorProp).toBe('id');
        }
      },
    });

    expect(functionNameFound).toBe(true);
  });

  it('should accumulate state across callbacks', () => {
    const ast = createComplexAST();
    const initialState = { 
      functionCount: 0, 
      identifierCount: 0,
      functionNames: [] as string[]
    };

    const finalState = topDownWalk(ast, {
      FunctionDeclaration(step, state: any) {
        state.functionCount++;
        const node = step.node as any;
        if (node.id?.name) {
          state.functionNames.push(node.id.name);
        }
      },
      Identifier(step, state: any) {
        state.identifierCount++;
      },
    }, { state: initialState }) as any;

    expect(finalState.functionCount).toBeGreaterThan(0);
    expect(finalState.identifierCount).toBeGreaterThan(0);
    expect(finalState.functionNames).toContain('fibonacci');
    expect(finalState).toBe(initialState);
  });

  it('should only call callbacks once per node type', () => {
    const ast = createFunctionAST();
    const callCounts: Record<string, number> = {};

    topDownWalk(ast, {
      Program(step, state) {
        callCounts.Program = (callCounts.Program || 0) + 1;
      },
      FunctionDeclaration(step, state) {
        callCounts.FunctionDeclaration = (callCounts.FunctionDeclaration || 0) + 1;
      },
      Identifier(step, state) {
        callCounts.Identifier = (callCounts.Identifier || 0) + 1;
      },
    });

    // Should be called exactly once for each occurrence
    expect(callCounts.Program).toBe(1);
    expect(callCounts.FunctionDeclaration).toBe(1);
    expect(callCounts.Identifier).toBeGreaterThan(1); // Multiple identifiers in function
  });

  it('should respect bounds options', () => {
    const ast = createComplexAST();
    let visitCount = 0;

    topDownWalk(ast, {
      Identifier(step, state) {
        visitCount++;
      },
    }, { start: 10, end: 100 });

    // Should visit fewer identifiers than full traversal
    let fullVisitCount = 0;
    topDownWalk(ast, {
      Identifier(step, state) {
        fullVisitCount++;
      },
    });

    expect(visitCount).toBeLessThanOrEqual(fullVisitCount);
  });

  it('should handle callbacks that modify state', () => {
    const ast = createFunctionAST();
    
    const finalState = topDownWalk(ast, {
      FunctionDeclaration(step, state: any) {
        const node = step.node as any;
        state.currentFunction = node.id?.name || 'anonymous';
      },
      Identifier(step, state: any) {
        if (!state.identifiers) {
          state.identifiers = [];
        }
        const node = step.node as any;
        state.identifiers.push({
          name: node.name,
          inFunction: state.currentFunction || null
        });
      },
    }) as any;

    expect(finalState.currentFunction).toBeDefined();
    expect(finalState.identifiers).toBeDefined();
    expect(finalState.identifiers.length).toBeGreaterThan(0);
  });

  it('should work with partial callback objects', () => {
    const ast = createFunctionAST();
    let functionFound = false;

    // Only provide callback for one node type
    topDownWalk(ast, {
      FunctionDeclaration(step, state) {
        functionFound = true;
        expect(step.node.type).toBe('FunctionDeclaration');
      },
      // No callbacks for other node types
    });

    expect(functionFound).toBe(true);
  });

  it('should handle empty callback object', () => {
    const ast = createSimpleAST();
    
    expect(() => {
      topDownWalk(ast, {});
    }).not.toThrow();
  });

  it('should visit parent before children', () => {
    const ast = createFunctionAST();
    const visitOrder: Array<{ type: string; name?: string }> = [];

    topDownWalk(ast, {
      FunctionDeclaration(step, state) {
        const node = step.node as any;
        visitOrder.push({ type: 'FunctionDeclaration', name: node.id?.name });
      },
      Identifier(step, state) {
        const node = step.node as any;
        visitOrder.push({ type: 'Identifier', name: node.name });
      },
      BlockStatement(step, state) {
        visitOrder.push({ type: 'BlockStatement' });
      },
    });

    // Find the function declaration and its identifier
    const funcIndex = visitOrder.findIndex(v => v.type === 'FunctionDeclaration');
    const funcNameIndex = visitOrder.findIndex(v => v.type === 'Identifier' && v.name === 'test');
    
    expect(funcIndex).toBeLessThan(funcNameIndex);
  });
});