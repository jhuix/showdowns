![Showdowns](https://jhuix.github.io/showdowns/logo.png)

# [Showdowns Features](https://jhuix.github.io/showdowns)

[Showdowns](https://github.com/jhuix/showdowns) is a lib that make markdown to html with some extensions of showdown.js.
Click the link to preview the [showdowns features](https://jhuix.github.io/showdowns).

Showdowns Markdown Syntax, refer to the document -- [Showdown's Markdown Syntax](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax).

## Table

| Return Code | Style | Value | DESC      |
| ----------- | ----- | ----- | --------- |
| OK          | int   | 1     | Succeeded |
| ERROR       | int   | 0     | Failed    |

## markdown extension features

**In browser environment, it is implemented to dynamically load js lib files related to more showdown diagrams extension for using [showdowns >= 0.3.0 version](https://github.com/jhuix/showdowns).**

[TOC]

### LaTeX math and AsciiMath

It's supported by [showdown-katex](https://github.com/obedm503/showdown-katex.git), that render [LaTeX](https://www.latex-project.org/) math and [AsciiMath](http://asciimath.org/) using [KaTeX](https://github.com/Khan/KaTeX), You can check [KaTeX supported functions/symbols](https://khan.github.io/KaTeX/function-support.html).

#### Math examples

```asciimath
x = (-b +- sqrt(b^2-4ac)) / (2a)
```

```latex
x=\frac{ -b\pm\sqrt{ b^2-4ac } } {2a}
```

### Table of Contents

It's implemented sub-TOC in showdown-toc.js.

```
  [TOC]
```

[TOC]

#### sub-TOC examples1

#### sub-TOC examples2

### Mermaid

It's implemented in showdown-mermaid.js, render diagrams of Flowchart or Sequence or Gantt using [mermaid](https://github.com/knsv/mermaid), check [mermaid doc](https://mermaidjs.github.io) for more information.

#### Mermaid examples

##### Flowchart

```mermaid
graph TD;
           A-->B;
           A-->C;
           B-->D;
           C-->D;
```

##### Sequence diagram

```mermaid
sequenceDiagram
           participant Alice
           participant Bob
           Alice->>John: Hello John, how are you?
           loop Healthcheck
               John->>John: Fight against hypochondria
           end
           Note right of John: Rational thoughts <br/>prevail!
           John-->>Alice: Great!
           John->>Bob: How about you?
           Bob-->>John: Jolly good!
```

##### Gantt diagram

```mermaid
       gantt
       dateFormat  YYYY-MM-DD
       title Adding GANTT diagram to mermaid
       excludes weekdays 2014-01-10

       section A section
       Completed task            :done,    des1, 2014-01-06,2014-01-08
       Active task               :active,  des2, 2014-01-09, 3d
       Future task               :         des3, after des2, 5d
       Future task2               :         des4, after des3, 5d
```

### Plantuml

It's implemented in showdown-plantuml.js. render diagrams of uml using [plantuml](http://plantuml.com). To know more about PlantUML, please visit [plantuml website](http://plantuml.com/).

```plantuml
      @startuml
      participant User

      User -> A: DoWork
      activate A

      A -> B: << createRequest >>
      activate B

      B -> C: DoWork
      activate C
      C --> B: WorkDone
      destroy C

      B --> A: RequestCreated
      deactivate B

      A -> User: Done
      deactivate A

      @enduml
```

### Flowchart

It's implemented in showdown-flowchart.js, render diagrams of flowchart using [flowchart.js](https://github.com/adrai/flowchart.js), check [flowchart website](http://flowchart.js.org/) for more information.

```flow
st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.google.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks

st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1
```

```flowchart
st=>start: Start
e=>end
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something
st->op1->cond
cond(yes)->io->e
cond(no)->sub1(right)->op1
```

### Network Sequence

It's implemented in showdown-sequence.js, render diagrams of sequence using [js-sequence-diagrams](https://github.com/bramp/js-sequence-diagrams).

```sequence {"theme":"hand"}
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

```sequence {"theme":"simple"}
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

### Graphviz's dot

It's implemented in showdown-viz.js, render diagrams of graphviz's dot using [viz.js](https://github.com/mdaines/viz.js).

```dot {"engine":"dot"}
digraph G {
    main -> parse -> execute;
    main -> init;
    main -> cleanup;
    execute -> make_string;
    execute -> printf
    init -> make_string;
    main -> printf;
    execute -> compare;
}
```

```dot {"engine":"circo"}
digraph G {
    main -> parse -> execute;
    main -> init;
    main -> cleanup;
    execute -> make_string;
    execute -> printf
    init -> make_string;
    main -> printf;
    execute -> compare;
}
```

### Railroad diagrams

It's implemented in showdown-viz.js, render diagrams of railroad using [railroad-diagrams](https://github.com/tabatkins/railroad-diagrams).

```railroad
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

### WaveDrom

It's implemented in showdown-viz.js, render diagrams of wavedrom using [wavedrom](https://github.com/wavedrom/wavedrom), check [wavedrom website](https://wavedrom.com) for more information.

```wavedrom
{signal: [
  {name: 'clk', wave: 'p.....|...'},
  {name: 'dat', wave: 'x.345x|=.x', data: ['head', 'body', 'tail', 'data']},
  {name: 'req', wave: '0.1..0|1.0'},
  {},
  {name: 'ack', wave: '1.....|01.'}
]}
```

```wavedrom
{ signal: [
  { name: "pclk", wave: 'p.......' },
  { name: "Pclk", wave: 'P.......' },
  { name: "nclk", wave: 'n.......' },
  { name: "Nclk", wave: 'N.......' },
  {},
  { name: 'clk0', wave: 'phnlPHNL' },
  { name: 'clk1', wave: 'xhlhLHl.' },
  { name: 'clk2', wave: 'hpHplnLn' },
  { name: 'clk3', wave: 'nhNhplPl' },
  { name: 'clk4', wave: 'xlh.L.Hx' },
]}
```

### Footnotes

It's implemented in showdown-footnotes.js, use for reference the [showdown-footnotes](https://github.com/Kriegslustig/showdown-footnotes).

[^1]: The explanation.
