import { inBounds, outOfBounds } from '../src/helpers';
import type { Node } from 'acorn';

describe('helpers', () => {
  describe('inBounds', () => {
    const mockNode = (start: number, end: number): Node => ({
      type: 'Identifier',
      start,
      end,
    } as Node);

    it('should return true when no bounds are specified', () => {
      const node = mockNode(10, 20);
      expect(inBounds(node)).toBe(true);
    });

    it('should return true when node is within bounds', () => {
      const node = mockNode(10, 20);
      expect(inBounds(node, 5, 25)).toBe(true);
    });

    it('should return true when node exactly matches bounds', () => {
      const node = mockNode(10, 20);
      expect(inBounds(node, 10, 20)).toBe(true);
    });

    it('should return false when node starts before bound', () => {
      const node = mockNode(5, 15);
      expect(inBounds(node, 10, 20)).toBe(false);
    });

    it('should return false when node ends after bound', () => {
      const node = mockNode(15, 25);
      expect(inBounds(node, 10, 20)).toBe(false);
    });

    it('should handle undefined start/end properties', () => {
      const node = { type: 'Identifier' } as Node;
      expect(inBounds(node, 10, 20)).toBe(true);
    });

    it('should handle only start bound', () => {
      const node = mockNode(15, 25);
      expect(inBounds(node, 10)).toBe(true);
      expect(inBounds(node, 20)).toBe(false);
    });

    it('should handle only end bound', () => {
      const node = mockNode(10, 20);
      expect(inBounds(node, undefined, 25)).toBe(true);
      expect(inBounds(node, undefined, 15)).toBe(false);
    });
  });

  describe('outOfBounds', () => {
    const mockNode = (start: number, end: number): Node => ({
      type: 'Identifier',
      start,
      end,
    } as Node);

    it('should return false when no bounds are specified', () => {
      const node = mockNode(10, 20);
      expect(outOfBounds(node)).toBe(false);
    });

    it('should return false when node is within bounds', () => {
      const node = mockNode(10, 20);
      expect(outOfBounds(node, 5, 25)).toBe(false);
    });

    it('should return true when node is completely before start bound', () => {
      const node = mockNode(5, 10);
      expect(outOfBounds(node, 15, 25)).toBe(true);
    });

    it('should return true when node is completely after end bound', () => {
      const node = mockNode(25, 30);
      expect(outOfBounds(node, 10, 20)).toBe(true);
    });

    it('should return false when node intersects with bounds', () => {
      const node = mockNode(5, 15);
      expect(outOfBounds(node, 10, 20)).toBe(false);
    });

    it('should handle undefined start/end properties', () => {
      const node = { type: 'Identifier' } as Node;
      expect(outOfBounds(node, 10, 20)).toBe(false);
    });

    it('should handle only start bound', () => {
      const node = mockNode(5, 10);
      expect(outOfBounds(node, 15)).toBe(true);
      expect(outOfBounds(node, 5)).toBe(false);
    });

    it('should handle only end bound', () => {
      const node = mockNode(25, 30);
      expect(outOfBounds(node, undefined, 20)).toBe(true);
      expect(outOfBounds(node, undefined, 30)).toBe(false);
    });
  });
});