# [[TOC]]

# Footnotes

Footnotes are a great way to add supplemental or additional information to a specific word, phrase or sentence without interrupting the flow of a document. Material for MkDocs provides the ability to define, reference and render footnotes. It's implemented in showdown-footnotes.js, use for reference the [showdown-footnotes](https://github.com/Kriegslustig/showdown-footnotes).


## Adding footnote references
A footnote reference must be enclosed in square brackets and must start with a caret ^, directly followed by an arbitrary identifier, which is similar to the standard Markdown link syntax.

```markdown title="Text with footnote references"
Lorem ipsum\[^1] dolor sit amet, consectetur adipiscing elit.\[^2]
```

Lorem ipsum[^1] dolor sit amet, consectetur adipiscing elit.[^2]

## Adding footnote content
The footnote content must be declared with the same identifier as the reference. It can be inserted at an arbitrary position in the document and is always rendered at the bottom of the page. Furthermore, a backlink to the footnote reference is automatically added.


### On a single line

Short footnotes can be written on the same line:

```markdown title="Footnote"
\[^1]: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
```

[^1]: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

### On multiple lines

Paragraphs can be written on the next line and must be indented by four spaces:

```markdown title="Footnote"
\[^2]:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.
```

[^2]:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.
