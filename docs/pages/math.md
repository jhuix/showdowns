# [[TOC]]

# LaTeX math and AsciiMath

It's supported by [showdown-katex](https://github.com/obedm503/showdown-katex.git), that render [LaTeX](https://www.latex-project.org/) math and [AsciiMath](http://asciimath.org/) using [KaTeX](https://github.com/Khan/KaTeX), You can check [KaTeX supported functions/symbols](https://khan.github.io/KaTeX/function-support.html).

## Markdown Syntax

* AsciiMath syntax:

  * Block multiple math

    Multiple math are separated by an empty line.

    ````

        ```asciimath {"align": "left | center | right", "codeblock": true | false}
        <code content>
        ```

    ````

  * Inline math

      * `@@...@@` is delimiters of inline ascii math
      * `\\~...\\~` is delimiters of inline block ascii math

* LaTex syntax:

  * Block multiple latex

    Multiple math are separated by an empty line.

    ````
        ```[katex|math|mathjax] {"align": "left | center | right", "codeblock": true | false}
        <code content>
        ```
    ````

  - Inline latex
    - `\\(...\\)` is delimiters of inline latex math
    - `\\[...\\]` is delimiters of inline block latex math
    - `$$...$$` is delimiters of inline block latex math

## LaTex Math examples

```math
x=\frac{ -b\pm\sqrt{ b^2-4ac } } {2a} \\\\

x=\frac{ -b\pm\sqrt{ b^2-4ac } } {2a} \\\\



x=\frac{ -b\pm\sqrt{ b^2-4ac } } {2a}
```

```katex {align="right"}
x=\frac{ -b\pm\sqrt{ b^2-4ac } } {2a}
```

where:

* \\(\sqrt{ b^2-4ac }\\) is inline latex math
* \\\[\sqrt{ b^2-4ac }\\] is inline latex block math
* $$\sqrt{ b^2-4ac }$$ is inline latex block math

## AsciiMath examples

Internal heat energy:

```asciimath {"align":"center"}
delta Q = rho \ c \u

delta Q = rho \ c \u
      
delta Q = rho \ c \u



delta Q = rho \ c \u
```

where:

* @@delta Q@@ is the internal heat energy per unit volume \\$(J \* m^-3)\\$
