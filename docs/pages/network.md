
# [[TOC]]

# Network Sequence

It's implemented in showdown-sequence.js, render diagrams of sequence using [js-sequence-diagrams](https://github.com/bramp/js-sequence-diagrams).

## Markdown Syntax

The \<theme name> of json's "theme" field value is "hand" or "simple" in syntax language attribute;

````
```sequence {"theme": "<theme name>", "align": "<align>"}
<code content>
```
````

## Network Sequence example

* Sequence example with hand theme:

```sequence {"theme":"hand", "align":"center"}
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

<br>

* Sequence example with simple theme:

```sequence {"theme":"simple", "align":"right"}
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```
