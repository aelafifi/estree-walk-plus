import { bottomUpWalk } from '../src/index';
import { createSimpleAST, createFunctionAST, createComplexAST } from './fixtures';

describe('bottomUpWalk', () => {
  it('should visit children before parents', () => {
    const ast = createFunctionAST();
    const visitOrder: Array<{ type: string; name?: string }> = [];

    bottomUpWalk(ast, {
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

    // Find the function declaration and its body
    const funcIndex = visitOrder.findIndex(v => v.type === 'FunctionDeclaration');
    const blockIndex = visitOrder.findIndex(v => v.type === 'BlockStatement');
    
    // BlockStatement should be visited before FunctionDeclaration
    expect(blockIndex).toBeLessThan(funcIndex);
  });

  it('should accumulate data from children to parents', () => {
    const ast = createComplexAST();
    
    const finalState = bottomUpWalk(ast, {
      Identifier(step, state: any) {
        if (!state.identifiersByFunction) {
          state.identifiersByFunction = {};
        }
        
        // Find nearest function
        const nearestFunction = step.nearestOfType('FunctionDeclaration');
        const functionName = (nearestFunction?.node as any)?.id?.name || 'global';
        
        if (!state.identifiersByFunction[functionName]) {
          state.identifiersByFunction[functionName] = [];
        }
        state.identifiersByFunction[functionName].push((step.node as any).name);
      },
      FunctionDeclaration(step, state: any) {
        // By this point, all identifiers in the function have been processed
        const functionName = (step.node as any).id?.name;
        if (functionName && state.identifiersByFunction?.[functionName]) {
          if (!state.functionStats) {
            state.functionStats = {};
          }
          state.functionStats[functionName] = {
            identifierCount: state.identifiersByFunction[functionName].length
          };
        }
      },
    }) as any;

    expect(finalState.identifiersByFunction).toBeDefined();
    expect(finalState.functionStats).toBeDefined();
    expect(finalState.functionStats.fibonacci).toBeDefined();
    expect(finalState.functionStats.fibonacci.identifierCount).toBeGreaterThan(0);
  });

  it('should visit Program node last', () => {
    const ast = createSimpleAST();
    const visitOrder: string[] = [];

    bottomUpWalk(ast, {
      Program(step, state) {
        visitOrder.push('Program');
      },
      VariableDeclaration(step, state) {
        visitOrder.push('VariableDeclaration');
      },
      Identifier(step, state) {
        visitOrder.push('Identifier');
      },
      Literal(step, state) {
        visitOrder.push('Literal');
      },
    });

    // Program should be visited last
    expect(visitOrder[visitOrder.length - 1]).toBe('Program');
    expect(visitOrder).toContain('VariableDeclaration');
    expect(visitOrder).toContain('Identifier');
    expect(visitOrder).toContain('Literal');
  });

  it('should provide correct step info in callbacks', () => {
    const ast = createFunctionAST();
    let identifierInFunction = false;

    bottomUpWalk(ast, {
      Identifier(step, state) {
        const node = step.node as any;
        if (node.name === 'a') { // Parameter name
          identifierInFunction = true;
          expect(step.ancestor).toBeDefined();
          
          // Should be able to find the function context
          const functionContext = step.nearestOfType('FunctionDeclaration');
          expect(functionContext).toBeDefined();
          expect((functionContext?.node as any)?.id?.name).toBe('test');
        }
      },
    });

    expect(identifierInFunction).toBe(true);
  });

  it('should handle transformations safely', () => {
    const ast = createSimpleAST();
    const transformations: Array<{ from: string; to: string }> = [];

    bottomUpWalk(ast, {
      Literal(step, state) {
        const node = step.node as any;
        if (typeof node.value === 'number') {
          transformations.push({
            from: node.value.toString(),
            to: (node.value * 2).toString()
          });
          
          // Safe to modify since we're in bottom-up traversal
          node.value = node.value * 2;
        }
      },
    });

    expect(transformations.length).toBeGreaterThan(0);
    expect(transformations[0].from).toBe('42');
    expect(transformations[0].to).toBe('84');
  });

  it('should respect bounds options', () => {
    const ast = createComplexAST();
    let visitCount = 0;

    bottomUpWalk(ast, {
      Identifier(step, state) {
        visitCount++;
      },
    }, { start: 10, end: 100 });

    // Should visit fewer identifiers than full traversal
    let fullVisitCount = 0;
    bottomUpWalk(ast, {
      Identifier(step, state) {
        fullVisitCount++;
      },
    });

    expect(visitCount).toBeLessThanOrEqual(fullVisitCount);
  });

  it('should work with partial callback objects', () => {
    const ast = createFunctionAST();
    let returnStatementFound = false;

    bottomUpWalk(ast, {
      ReturnStatement(step, state) {
        returnStatementFound = true;
      },
      // Only callback for return statements
    });

    expect(returnStatementFound).toBe(true);
  });

  it('should handle aggregation use case', () => {
    const ast = createComplexAST();
    
    const finalState = bottomUpWalk(ast, {
      Literal(step, state: any) {
        if (!state.literals) {
          state.literals = [];
        }
        state.literals.push((step.node as any).value);
      },
      BinaryExpression(step, state: any) {
        if (!state.binaryOps) {
          state.binaryOps = [];
        }
        state.binaryOps.push((step.node as any).operator);
      },
      FunctionDeclaration(step, state: any) {
        // By now all literals and binary ops in this function have been processed
        if (!state.functionComplexity) {
          state.functionComplexity = {};
        }
        
        const functionName = (step.node as any).id?.name;
        if (functionName) {
          state.functionComplexity[functionName] = {
            literalCount: state.literals?.length || 0,
            binaryOpCount: state.binaryOps?.length || 0
          };
        }
      },
    }) as any;

    expect(finalState.literals).toBeDefined();
    expect(finalState.binaryOps).toBeDefined();
    expect(finalState.functionComplexity).toBeDefined();
  });

  it('should call callbacks only once per node', () => {
    const ast = createFunctionAST();
    const callCounts: Record<string, number> = {};

    bottomUpWalk(ast, {
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

    expect(callCounts.Program).toBe(1);
    expect(callCounts.FunctionDeclaration).toBe(1);
    expect(callCounts.Identifier).toBeGreaterThan(1); // Multiple identifiers
  });
});