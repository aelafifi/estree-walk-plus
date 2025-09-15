// Test-specific type definitions for AST nodes
export interface TestState extends Record<string, any> {
  count?: number;
  identifiers?: string[];
  identifiersByFunction?: Record<string, string[]>;
  functionStats?: Record<string, { identifierCount: number }>;
  functionStack?: string[];
  completedFunctions?: string[];
  currentFunction?: string;
  literals?: any[];
  binaryOps?: string[];
  functionComplexity?: Record<string, { literalCount: number; binaryOpCount: number }>;
  visited?: number;
  vars?: Record<string, { kind: string; initValue?: any }>;
  [key: string]: any;
}

export interface TestNode extends Record<string, any> {
  type: string;
  id?: { name: string } | null;
  name?: string;
  value?: any;
  body?: any;
  test?: any;
  operator?: string;
  start?: number;
  end?: number;
  [key: string]: any;
}

// Type assertion helpers for tests
export function asTestNode(node: any): TestNode {
  return node as TestNode;
}

export function asTestState(state: any): TestState {
  return state as TestState;
}