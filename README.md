Fast lightweight quadtree implementation written in JavaScript

## Installation

Vanilla HTML:
```html
<script src="./path/to/quadtree.min.js"></script>
<script>
  const quadtree = new Quadtree(...);
</script>
```

CommonJS:
```js
const Quadtree = require("./path/to/quadtree.min.js");

const quadtree = new Quadtree(...);
```

ESM:
```html
<script type="module">
  import { Quadtree } from "./path/to/quadtree.min.mjs";

  const quadtree = new Quadtree(...);
</script>
```

> Ensure you are using the correct build; ESM modules uses the `.mjs` extension while UMD uses `.js`

<br><hr><br>

## AABB Note

All AABBs are defined by the top left and bottom right coordinates (x1, y1), (x2, y2) respectively

```
(x1, y1) ──────────────┐
│                      │
│                      │
│                      │
│                      │
└────────────── (x2, y2)
```

<br><hr><br>

## API Docs

<a name="quadtree_constructor" href="#quadtree_constructor">></a> *Quadtree*(*x1, y1, x2, y2, maxChildren, maxDepth*)

Constructor

- `@param {Number} x1` - x coordinate of top left corner of quadtree
- `@param {Number} y1` - y coordinate of top left corner of quadtree
- `@param {Number} x2` - x coordinate of bottom right corner of quadtree
- `@param {Number} y2` - y coordinate of bottom right corner of quadtree
- `@param {Number} maxChilren` - max children per node before subdividing
- `@param {Number} maxDepth` - maximum subdivision depth

```js
const quadtree = new Quadtree(0, 0, 1000, 1000, 10, 5);
```

<hr>

<a name="quadtree_push" href="#quadtree_push">></a> *quadtree*.**push**(*item*)

Insert item into quadtree.

- `@param {Object} item` - item to insert; AABB retrieved from `._qtree_bbox` property

> Note: If you wish to use a different property name, search and replace all instances of `_qtree_bbox` with your desired name and [build](#build)

```js
const item = {
  _qtree_bbox: {
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100
  }
};

quadtree.push(item);
```

<hr>

<a name="quadtree_remove" href="#quadtree_remove">></a> *quadtree*.**remove**(*item*)

Remove item from quadtree.

- `@param {Object} item` - item to remove; Item must be in a quadtree, as the `._qtree_node` accessor is needed to determine item location

```js
quadtree.remove(item);
```

<hr>

<a name="quadtree_removePreserve" href="#quadtree_removePreserve">></a> *quadtree*.**removePreserve**(*item*)

Remove item from quadtree while preserving tree structure.

- `@param {Object} item` - item to remove; Item must be in a quadtree, as the `._qtree_node` accessor is needed to determine item location

> More expensive than `.remove()` but could lead to higher quality trees for querying

```js
quadtree.removePreserve(item);
```

<hr>

<a name="quadtree_query" href="#quadtree_query">></a> *quadtree*.**query**(*x1, y1, x2, y2, callback*)

Retrieve all items that intersect with the query bounds.

- `@param {Number} x1` - x coordinate of top left corner of query bounds
- `@param {Number} y1` - y coordinate of top left corner of query bounds
- `@param {Number} x2` - x coordinate of bottom right corner of query bounds
- `@param {Number} y2` - y coordinate of bottom right corner of query bounds
- `@param {Function} callback` - Called as `callback(item)` for every item that fufills the query

```js
quadtree.query(0, 0, 100, 100, item => {
  console.log(item);
});
```

<hr>

<a name="quadtree_queryPredicate" href="#quadtree_queryPredicate">></a> *quadtree*.**queryPredicate**(*x1, y1, x2, y2, predicate, callback*)

Retrieve all items that intersect with the query bounds and fufills the predicate condition.

- `@param {Number} x1` - x coordinate of top left corner of query bounds
- `@param {Number} y1` - y coordinate of top left corner of query bounds
- `@param {Number} x2` - x coordinate of bottom right corner of query bounds
- `@param {Number} y2` - y coordinate of bottom right corner of query bounds
- `@param {Function} predicate` - Called as `predicate(item)`, item is passed to callback if predicate returns true
- `@param {Function} callback` - Called as `callback(item)` for every item that fufills the query and predicate

```js
const circle = {
  x: 0,
  y: 0,
  r: 50
}

quadtree.queryPredicate(circle.x, circle.y, circle.r, circle.r,
  item => {
    if (!boundingBoxCollision(item, circle)) return false;
    return (circle.x - item.x) ** 2 + (circle.y - item.y) ** 2 <= circle.r ** 2;
  },
  item => {
    console.log(item);
  });
```

<hr>

### Updating items

Remove and re-insert the item

```js
item._qtree_bbox.x1 += 5;

quadtree.remove(item);
quadtree.push(item);
```

If objects are frequently being updated, then consider rebuilding the entire quadtree instead.

```js
for (let item of items) {
  item._qtree_bbox.x1 += 5;
}

quadtree.clear();

for (let item of items) {
  quadtree.push(item);
}
```

<br><hr>

## Build

Install dependencies

1) `npm install webpack`

Build

2) `npm run build`

<hr>

###### Archived link: https://javascriptcompressor.com/