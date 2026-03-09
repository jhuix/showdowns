# [[TOC]]

# Code Block Theme

Code blocks must be enclosed with two separate lines containing at least three  '\`\`\`' or '~~~'.

## Markdown Syntax

- Syntax

````
  ```[js|c|c++|go...] {"theme": "ayu-dark"} title="<custom title>"
  <code content>
  ``` 
  OR

  ~~~[js|c|c++|go...] {"theme": "ayu-dark"} title="<custom title>"
  <code content>
  ~~~ 

````

- Adding a title

In order to provide additional context, a custom title can be added to a code block by using the title="<custom title>" option directly after the shortcode, e.g. to display the name of a file:

```` title="Code block with title"

  ``` py title="bubble_sort.py"
  def bubble_sort(items):
      for i in range(len(items)):
          for j in range(len(items) - 1 - i):
              if items[j] > items[j + 1]:
                  items[j], items[j + 1] = items[j + 1], items[j]
  ```
````

## Code Block examples

- For JavaScript:

```javascript {theme="github-dark"}
/**
 * Merge object with deepth
 *
 * @param {object} target
 *     Target object
 * @param {object[]} sources
 *     Source object or objects
 * @returns {object}
 *     Meraged Object
 */
export function deepMerge(target, ...sources) {
  for (const source of sources) {
    for (const [key, val] of Object.entries(source)) {
      // @ts-ignore
      if (isObject(val) && isObject(target[key])) {
        // @ts-ignore
        deepMerge(target[key], val);
      } else {
        Object.assign(target, { [key]: val });
      }
    }
  }
  return target;
}
```

- For GO:

```go
package utils

import (
  "math"
  "sync"
)

type levelPool struct {
  size int
  pool sync.Pool
}

func newLevelPool(size int) *levelPool {
  return &levelPool{
    size: size,
    pool: sync.Pool{
      New: func() interface{} {
        data := make([]byte, size)
        return &data
      },
    },
  }
}

type LimitedPool struct {
  minSize int
  maxSize int
  pools   []*levelPool
}

func NewLimitedPool(minSize, maxSize int) *LimitedPool {
  if maxSize < minSize {
    panic("maxSize can't be less than minSize")
  }
  const multiplier = 2
  var pools []*levelPool
  curSize := minSize
  for curSize < maxSize {
    pools = append(pools, newLevelPool(curSize))
    curSize *= multiplier
  }
  pools = append(pools, newLevelPool(maxSize))
  return &LimitedPool{
    minSize: minSize,
    maxSize: maxSize,
    pools:   pools,
  }
}

func (p *LimitedPool) findPool(size int) *levelPool {
  if size > p.maxSize {
    return nil
  }
  idx := int(math.Ceil(math.Log2(float64(size) / float64(p.minSize))))
  if idx < 0 {
    idx = 0
  }
  if idx > len(p.pools)-1 {
    return nil
  }
  return p.pools[idx]
}

func (p *LimitedPool) findPutPool(size int) *levelPool {
  if size > p.maxSize {
    return nil
  }
  if size < p.minSize {
    return nil
  }

  idx := int(math.Floor(math.Log2(float64(size) / float64(p.minSize))))
  if idx < 0 {
    idx = 0
  }
  if idx > len(p.pools)-1 {
    return nil
  }
  return p.pools[idx]
}

func (p *LimitedPool) Get(size int) *[]byte {
  sp := p.findPool(size)
  if sp == nil {
    data := make([]byte, size)
    return &data
  }
  buf := sp.pool.Get().(*[]byte)
  *buf = (*buf)[:size]
  return buf
}

func (p *LimitedPool) Put(b *[]byte) {
  sp := p.findPutPool(cap(*b))
  if sp == nil {
    return
  }
  *b = (*b)[:cap(*b)]
  sp.pool.Put(b)
}

```
