# [[TOC]]

# Railroad diagrams

It's implemented in showdown-viz.js, render diagrams of railroad using [railroad-diagrams](https://github.com/tabatkins/railroad-diagrams).

## Markdown Syntax

````
```railroad {"align": "left | center | right", "codeblock": true | false}
<code content>
```
````

## Railroad diagrams example

```railroad {"align":"center"}
Diagram(
  Optional('+', 'skip'),
    Choice(0,
      NonTerminal('name-start char'),
      NonTerminal('escape')),
      ZeroOrMore(
        Choice(0,
          NonTerminal('name char'),
          NonTerminal('escape'))))
```
