# [[TOC]]

# Mermaid

It's implemented in showdown-mermaid.js, render diagrams of Flowchart or Sequence or Gantt using [mermaid](https://github.com/knsv/mermaid), check [mermaid doc](https://mermaidjs.github.io) for more information.

## Markdown Syntax

* Flowchart syntax:

  ````
    ```mermaid {"align": "left | center | right", "codeblock": true | false}
    graph TD;
    <code content>
    ```
  ````

* Sequence diagram syntax:

  ````
    ```mermaid {"align": "left | center | right", "codeblock": true | false}
    sequenceDiagram
    <code content>
    ```
  ````

* Gantt diagram syntax:

  ````
    ```mermaid {"align": "left | center | right", "codeblock": true | false}
    gantt
    <code content>
    ```
  ````

* Support mermaid code of azure syntax

  ````
    :::mermaid 
      mermaid syntax content
    :::
  ````  

## Mermaid examples

### Flowchart

```mermaid {"align":"center", "codeblock": true}
graph TD;
           A-->B;
           A-->C;
           B-->D;
           C-->D;
```

```mermaid {"align":"center"}
graph TD;
           A-->B
           A-->C
           B-->D
           C-->D
```

### Sequence diagram

```mermaid {"align":"right"}
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

### Gantt diagram

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

### ZenUML

```mermaid
zenuml
    Alice->Bob: Hello Bob, how are you?
    if(is_sick) {
      Bob->Alice: Not so good :(
    } else {
      Bob->Alice: Feeling fresh like a daisy
    }
```

### Mindmap

```mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```
