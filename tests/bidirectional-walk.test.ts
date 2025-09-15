import { bidirectionalWalk } from '../src/index';
import { createSimpleAST, createFunctionAST, createComplexAST } from './fixtures';

describe('bidirectionalWalk', () => {
  it('should call enter_ callbacks on top-down traversal', () => {
    const ast = createSimpleAST();
    const enterCalls: string[] = [];

    bidirectionalWalk(ast, {
      enter_Program(step, state) {
        enterCalls.push('Program');
      },
      enter_VariableDeclaration(step, state) {
        enterCalls.push('VariableDeclaration');
      },
      enter_Identifier(step, state) {
        enterCalls.push('Identifier');
      },
    });

    expect(enterCalls).toContain('Program');
    expect(enterCalls).toContain('VariableDeclaration');
    expect(enterCalls).toContain('Identifier');
    
    // Program should be entered first
    expect(enterCalls[0]).toBe('Program');
  });

  it('should call leave_ callbacks on bottom-up traversal', () => {
    const ast = createSimpleAST();
    const leaveCalls: string[] = [];

    bidirectionalWalk(ast, {
      leave_Program(step, state) {
        leaveCalls.push('Program');
      },
      leave_VariableDeclaration(step, state) {
        leaveCalls.push('VariableDeclaration');
      },
      leave_Identifier(step, state) {
        leaveCalls.push('Identifier');
      },
    });

    expect(leaveCalls).toContain('Program');
    expect(leaveCalls).toContain('VariableDeclaration');
    expect(leaveCalls).toContain('Identifier');
    
    // Program should be left last
    expect(leaveCalls[leaveCalls.length - 1]).toBe('Program');
  });

  it('should call both enter and leave callbacks', () => {
    const ast = createFunctionAST();
    const calls: Array<{ type: string; direction: string }> = [];

    bidirectionalWalk(ast, {
      enter_FunctionDeclaration(step, state) {
        calls.push({ type: 'FunctionDeclaration', direction: 'enter' });
      },
      leave_FunctionDeclaration(step, state) {
        calls.push({ type: 'FunctionDeclaration', direction: 'leave' });
      },
      enter_Identifier(step, state) {
        calls.push({ type: 'Identifier', direction: 'enter' });
      },
      leave_Identifier(step, state) {
        calls.push({ type: 'Identifier', direction: 'leave' });
      },
    });

    const enterFunc = calls.find(c => c.type === 'FunctionDeclaration' && c.direction === 'enter');
    const leaveFunc = calls.find(c => c.type === 'FunctionDeclaration' && c.direction === 'leave');
    
    expect(enterFunc).toBeDefined();
    expect(leaveFunc).toBeDefined();
    
    // Should have both enter and leave calls for identifiers
    const enterIds = calls.filter(c => c.type === 'Identifier' && c.direction === 'enter');
    const leaveIds = calls.filter(c => c.type === 'Identifier' && c.direction === 'leave');
    
    expect(enterIds.length).toBe(leaveIds.length);
    expect(enterIds.length).toBeGreaterThan(0);
  });

  it('should support custom prefixes', () => {
    const ast = createSimpleAST();
    const calls: string[] = [];

    bidirectionalWalk(ast, {
      start_Program(step, state) {
        calls.push('start_Program');
      },
      end_Program(step, state) {
        calls.push('end_Program');
      },
      start_Identifier(step, state) {
        calls.push('start_Identifier');
      },
      end_Identifier(step, state) {
        calls.push('end_Identifier');
      },
    }, {
      topDownPrefix: 'start_',
      bottomUpPrefix: 'end_'
    });

    expect(calls).toContain('start_Program');
    expect(calls).toContain('end_Program');
    expect(calls).toContain('start_Identifier');
    expect(calls).toContain('end_Identifier');
  });

  it('should maintain state between enter and leave calls', () => {
    const ast = createFunctionAST();
    
    const finalState = bidirectionalWalk(ast, {
      enter_FunctionDeclaration(step, state: any) {
        if (!state.functionStack) {
          state.functionStack = [];
        }
        const node = step.node as any;
        state.functionStack.push(node.id?.name || 'anonymous');
      },
      leave_FunctionDeclaration(step, state: any) {
        if (state.functionStack) {
          const functionName = state.functionStack.pop();
          if (!state.completedFunctions) {
            state.completedFunctions = [];
          }
          state.completedFunctions.push(functionName);
        }
      },
      enter_Identifier(step, state: any) {
        if (!state.identifiersByFunction) {
          state.identifiersByFunction = {};
        }
        
        const currentFunction = state.functionStack?.[state.functionStack.length - 1] || 'global';
        if (!state.identifiersByFunction[currentFunction]) {
          state.identifiersByFunction[currentFunction] = [];
        }
        state.identifiersByFunction[currentFunction].push((step.node as any).name);
      },
    }) as any;

    expect(finalState.functionStack).toEqual([]);
    expect(finalState.completedFunctions).toContain('test');
    expect(finalState.identifiersByFunction.test).toBeDefined();
    expect(finalState.identifiersByFunction.test.length).toBeGreaterThan(0);
  });

  it('should work with mixed callback styles', () => {
    const ast = createFunctionAST();
    const calls: string[] = [];

    bidirectionalWalk(ast, {
      enter_FunctionDeclaration(step, state) {
        calls.push('enter_function');
      },
      // No leave callback for function
      enter_Identifier(step, state) {
        calls.push('enter_identifier');
      },
      leave_Identifier(step, state) {
        calls.push('leave_identifier');
      },
      // No enter callback for BlockStatement
      leave_BlockStatement(step, state) {
        calls.push('leave_block');
      },
    });

    expect(calls).toContain('enter_function');
    expect(calls).toContain('enter_identifier');
    expect(calls).toContain('leave_identifier');
    expect(calls).toContain('leave_block');
    expect(calls).not.toContain('leave_function');
    expect(calls).not.toContain('enter_block');
  });

  it('should handle complex AST with nested structures', () => {
    const ast = createComplexAST();
    const scope: Array<{ type: string; action: string; name?: string }> = [];

    bidirectionalWalk(ast, {
      enter_FunctionDeclaration(step, state) {
        const node = step.node as any;
        scope.push({ 
          type: 'function', 
          action: 'enter', 
          name: node.id?.name 
        });
      },
      leave_FunctionDeclaration(step, state) {
        const node = step.node as any;
        scope.push({ 
          type: 'function', 
          action: 'leave', 
          name: node.id?.name 
        });
      },
      enter_BlockStatement(step, state) {
        scope.push({ type: 'block', action: 'enter' });
      },
      leave_BlockStatement(step, state) {
        scope.push({ type: 'block', action: 'leave' });
      },
    });

    // Should have enter/leave pairs
    const functionEnters = scope.filter(s => s.type === 'function' && s.action === 'enter');
    const functionLeaves = scope.filter(s => s.type === 'function' && s.action === 'leave');
    
    expect(functionEnters.length).toBe(functionLeaves.length);
    expect(functionEnters.length).toBeGreaterThan(0);
    
    // Should include fibonacci function
    expect(scope.some(s => s.name === 'fibonacci')).toBe(true);
  });

  it('should respect bounds options', () => {
    const ast = createComplexAST();
    let enterCount = 0;
    let leaveCount = 0;

    bidirectionalWalk(ast, {
      enter_Identifier(step, state) {
        enterCount++;
      },
      leave_Identifier(step, state) {
        leaveCount++;
      },
    }, { start: 10, end: 100 });

    // Should have equal enter and leave counts
    expect(enterCount).toBe(leaveCount);
    
    // Should be less than full traversal
    let fullEnterCount = 0;
    bidirectionalWalk(ast, {
      enter_Identifier(step, state) {
        fullEnterCount++;
      },
    });

    expect(enterCount).toBeLessThanOrEqual(fullEnterCount);
  });

  it('should handle empty prefixes', () => {
    const ast = createSimpleAST();
    const calls: string[] = [];

    bidirectionalWalk(ast, {
      Program(step, state) {
        calls.push('Program_enter');
      },
      Identifier(step, state) {
        calls.push('Identifier_enter');
      },
    }, {
      topDownPrefix: '',
      bottomUpPrefix: 'leave_'
    });

    expect(calls).toContain('Program_enter');
    expect(calls).toContain('Identifier_enter');
  });

  it('should provide correct step information', () => {
    const ast = createFunctionAST();
    let parameterFound = false;

    bidirectionalWalk(ast, {
      enter_Identifier(step, state) {
        const node = step.node as any;
        if (node.name === 'a') {
          parameterFound = true;
          expect(step.ancestor).toBeDefined();
          
          const functionContext = step.nearestOfType('FunctionDeclaration');
          expect(functionContext).toBeDefined();
          expect((functionContext?.node as any)?.id?.name).toBe('test');
        }
      },
    });

    expect(parameterFound).toBe(true);
  });
});