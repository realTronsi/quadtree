"use-strict";

/**
 * Fast quadtree implementation
 * Utilizes one node per item strategy
 * 
 * Copyright (c) 2022 tronsi
 *
 * Licensed under MIT license
 */

export default class Quadtree {
  /**
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2 
   * @param {Number} y2
   * @param {Number} maxChildren
   * @param {Number} maxDepth
   * @param {Quadtree} parent - Will never be used user-end
   */
  constructor (x1, y1, x2, y2, maxChildren, maxDepth, parent) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.mx = x1 + (x2 - x1) / 2;
    this.my = y1 + (y2 - y1) / 2;
  
    this.maxChildren = maxChildren;
    this.depth = maxDepth;
    this.parent = parent;
  
    this.children = [];
    this.nodes = [];
  }

  /**
   * Get the quadrant that can fit the entire bound
   * Returns -1 if the bound cannot fit in any quadrant
   * @param {Object} bound
   * @return index of node for corresponding quadrant
   */
  getBoundQuadrant (bound) {
    if (this.nodes.length === 0) return -1;
    // top
    if (bound.y2 < this.my && bound.y1 > this.y1) {
      if (bound.x2 < this.mx && bound.x1 > this.x1) return 0;
      if (bound.x1 > this.mx && bound.x2 < this.x2) return 1;
    }
    // bottom
    if (bound.y1 > this.my && bound.y2 < this.y2) {
      if (bound.x2 < this.mx && bound.x1 > this.x1) return 2;
      if (bound.x1 > this.mx && bound.x2 < this.x2) return 3;
    }
    return -1;
  }

  /**
   * @param {Object} item
   * bounds need to be assigned to item.bound
   */
  push (item) {
    // Get quadrant of item, -1 denotes the item cannot fit in a quad
    const quadrant = this.getBoundQuadrant(item.bound);
  
    if (quadrant !== -1) return this.nodes[quadrant].push(item);
  
    this.children.push(item);
    item._qtree_node = this;
  
    if (this.nodes.length !== 0 || this.depth === 0 || this.children.length <= this.maxChildren) return;
  
    /* subdivision */
    // nw, ne, sw, se
    this.nodes = [
      new Quadtree(
        this.x1, this.y1, this.mx, this.my,
        this.maxChildren, this.depth - 1, this
      ),
      new Quadtree(
        this.mx, this.y1, this.x2, this.my,
        this.maxChildren, this.depth - 1, this
      ),
      new Quadtree(
        this.x1, this.my, this.mx, this.y2,
        this.maxChildren, this.depth - 1, this
      ),
      new Quadtree(
        this.mx, this.my, this.x2, this.y2,
        this.maxChildren, this.depth - 1, this
      )
    ];
  
    const children = this.children;
    let i = children.length;
    let len = i;
    while (--i) {
      // Rebalance all children
      const child = children[i];
      const childQuadrant = this.getBoundQuadrant(child.bound);
  
      if (childQuadrant !== -1) {
        this.nodes[childQuadrant].push(child);
        // Remove child from this node
        len--;
        let index = i;
        // Simple shift (faster splice)
        while (index < len) {
          children[index] = children[++index];
        }
        children.pop();
      }
    }
  }

  /**
   * Removes item with minimal cleanup
   * @param {Object} item
   */
  remove (item) {
    const itemNode = item._qtree_node;
    if (this !== itemNode) return itemNode.remove(item);

    const itemNodeChildren = itemNode.children;
    const i = itemNodeChildren.indexOf(item);
    itemNodeChildren[i] = itemNodeChildren[itemNodeChildren.length - 1];
    itemNodeChildren.pop();
  
    if (this.parent === undefined) return;
    
    this.parent.clean();
  }

  /**
   * Clears child nodes if there are no items
   */
  clean () {
    const nodes = this.nodes;
    if (nodes.length === 0) return;
    if (nodes[0].children.length > 0) return;
    if (nodes[1].children.length > 0) return;
    if (nodes[2].children.length > 0) return;
    if (nodes[3].children.length > 0) return;
  
    this.nodes = [];
    
    if (this.parent === undefined) return;
    
    this.parent.clean();
  }
  
  /**
   * Removes item with cleanup that preserves tree quality
   * @param {Object} item
   */
  removePreserve (item) {
    const itemNode = item._qtree_node;
    if (this !== itemNode) return itemNode.removePreserve(item);

    const itemNodeChildren = itemNode.children;
    let i = itemNodeChildren.indexOf(item);
    itemNodeChildren[i] = itemNodeChildren[itemNodeChildren.length - 1];
    itemNodeChildren.pop();
  
    if (this.parent === undefined) return;
    
    this.parent.cleanPreserve();
  }

  cleanPreserve () {
    const nodes = this.nodes;
    if (nodes.length === 0) return;

    const itemCount = this.getChildrenCount();
  
    if (itemCount > this.maxChildren) return;
  
    const nwChildren = nodes[0].children;
    let i = nwChildren.length;
    while (i--) {
      this.children.push(nwChildren[i]);
    }
  
    const neChildren = nodes[1].children;
    i = neChildren.length;
    while (i--) {
      this.children.push(neChildren[i]);
    }
  
    const swChildren = nodes[2].children;
    i = swChildren.length;
    while (i--) {
      this.children.push(swChildren[i]);
    }
  
    const seChildren = nodes[3].children;
    i = seChildren.length;
    while (i--) {
      this.children.push(seChildren[i]);
    }
  
    this.nodes = [];

    if (this.parent === null) return;
    
    this.parent.cleanPreserve();
  }

  getChildrenCount () {
    let count = this.children.length;
    if (this.nodes.length !== 0) {
      count += this.nodes[1].getChildrenCount() + this.nodes[0].getChildrenCount() + this.nodes[2].getChildrenCount() + this.nodes[3].getChildrenCount();
    }
    return count;
  }

  /**
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Function} callback
   */
  query (x1, y1, x2, y2, callback) {
    if (isNotIntersectingBound(this.x1, this.y1, this.x2, this.y2, x1, y1, x2, y2)) return;
  
    const children = this.children;
    const nodes = this.nodes;
  
    let i = children.length;
    while (i--) {
      if (callback(children[i])) return;
    }
  
    if (nodes.length === 0) return;
  
    nodes[0].query(x1, y1, x2, y2, callback);
    nodes[1].query(x1, y1, x2, y2, callback);
    nodes[2].query(x1, y1, x2, y2, callback);
    nodes[3].query(x1, y1, x2, y2, callback);
  }

  clear () {
    this.children = [];
    this.nodes = [];
  }
}

function isNotIntersectingBound (x1, y1, x2, y2, tx1, ty1, tx2, ty2) {
  return tx2 < x1 || tx1 > x2 || ty2 < y1 || ty1 > y2;
}