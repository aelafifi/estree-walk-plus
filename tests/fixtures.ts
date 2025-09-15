import * as acorn from 'acorn';
import type { Node } from 'acorn';

// Extended node types for testing
export interface TestNode extends Node {
  id?: { name: string } | null;
  name?: string;
  value?: any;
  body?: any;
  test?: any;
  [key: string]: any;
}

export function createSimpleAST(): TestNode {
  // Creates AST for: const x = 42;
  return acorn.parse('const x = 42;', { ecmaVersion: 'latest' }) as TestNode;
}

export function createFunctionAST(): TestNode {
  // Creates AST for: function test(a, b) { return a + b; }
  return acorn.parse('function test(a, b) { return a + b; }', { ecmaVersion: 'latest' }) as TestNode;
}

export function createComplexAST(): TestNode {
  // Creates AST for a more complex code example
  const code = `
    function fibonacci(n) {
      if (n <= 1) {
        return n;
      }
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    const result = fibonacci(5);
    console.log(result);
  `;
  return acorn.parse(code, { ecmaVersion: 'latest' }) as TestNode;
}

export function createClassAST(): TestNode {
  // Creates AST for: class Test { constructor(x) { this.x = x; } }
  const code = `
    class Test {
      constructor(x) {
        this.x = x;
      }
    }
  `;
  return acorn.parse(code, { ecmaVersion: 'latest' }) as TestNode;
}

export function createArrowFunctionAST(): TestNode {
  // Creates AST for: const add = (a, b) => a + b;
  return acorn.parse('const add = (a, b) => a + b;', { ecmaVersion: 'latest' }) as TestNode;
}