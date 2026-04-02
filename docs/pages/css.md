# [[TOC]]

# CSS Defined

Support css be defined.

## Markdown Syntax

```

[](css:<css-href>)

OR

<a href="css:<css-href>" />

```

Which will be append a link element to head as:

```

<link rel="stylesheet" href="<css-href>">

```

\<css-href> support format:

    http(s)://jhuix.github.io/showdowns/dist/showdowns.min.css

    file:///i:/showdowns.min.css

    ../dist/showdowns.min.css

OR

```

::css[css content]{attribute}

```

Which will be append a style element to head as:

```

<style ${attribute}>${css content}</style>

```

OR

```

::css-link{attribute}


```

Which will be append a link element to head as:

```

<link ${attribute}>

```

## CSS defined examples

- **CSS Link**


```
[](css:https://jhuix.github.io/showdowns/dist/showdowns.min.css)
```

Which will be append a link element to head as:

```

<link rel="stylesheet" href="https://jhuix.github.io/showdowns/dist/showdowns.min.css">

```

OR

```
::css-link{rel="stylesheet" href="https://jhuix.github.io/showdowns/dist/showdowns.min.css"}
```

Which will be append a link element to head as:

```

<link rel="stylesheet" href="https://jhuix.github.io/showdowns/dist/showdowns.min.css">

```

- **CSS content**


```
::css[a{color: red}]{id="css-demo"}
```

Which will be append a link element to head as:

```
<style id="css-demo">a{color: red}</style>
```
