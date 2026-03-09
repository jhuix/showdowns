# [[TOC]]

# Directives

It's implemented in showdown-directive.js, allows you to create container directive, leaf directive, text directive.
Generic directives syntax can refer to [generic-directives-plugins-syntax](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) of commonmark.

## Container Directives

The special container directive syntax by wrapping text with a set of greater or equal 3 colons or exclamation marks, as seen below:

```
::: name [label] {attributes}
contents, which are sometimes further block elements
:::

OR

!!! name [label] {attributes}
contents, which are sometimes further block elements
!!!
```

The special container directive syntax is classified as [container syntax](#container-syntax) and [callout syntax](#callout-syntax) and admonitions syntax.
But the admonitions syntax also includes [rST-style syntax](#rst-style-syntax) and [compatible syntax](#compatible-syntax).

::css[.colorpicker-color-decoration {
    border: solid .1em #eee;
    box-sizing: border-box;
    margin: .1em .2em 0;
    width: .8em;
    height: .8em;
    line-height: .8em;
    display: inline-block;
}
.dyn-rule-1 {
    background-color: rgb(0,176,255);
}
.dyn-rule-2 {
    background-color: rgb(0,184,212);
}
.dyn-rule-3 {
    background-color: rgb(0,191,165);
}
.dyn-rule-4 {
    background-color: rgb(0,200,83);
}
.dyn-rule-5 {
    background-color: rgb(100,221,23);
}
.dyn-rule-6 {
    background-color: rgb(255,145,0);
}
.dyn-rule-7 {
    background-color: rgb(255,82,82);
}
.dyn-rule-8 {
    background-color: rgb(255,23,68);
}
.dyn-rule-9 {
    background-color: rgb(101,31,255);
}
.dyn-rule-10 {
    background-color: rgb(158, 158, 158);
}
.dyn-rule-11 {
    background-color: rgb(230, 32, 196);
}
.dyn-flag {
  font-family: admons-icons;text-align: center;display: inline-block;width: 100%;
}
.dyn-flag-rule-1 {
  color: rgb(0,176,255);
}
.dyn-flag-rule-2 {
    color: rgb(0,184,212);
}
.dyn-flag-rule-3 {
    color: rgb(0,191,165);
}
.dyn-flag-rule-4 {
    color: rgb(0,200,83);
}
.dyn-flag-rule-5 {
    color: rgb(100,221,23);
}
.dyn-flag-rule-6 {
    color: rgb(255,145,0);
}
.dyn-flag-rule-7 {
    color: rgb(255,82,82);
}
.dyn-flag-rule-8 {
    color: rgb(255,23,68);
}
.dyn-flag-rule-9 {
    color: rgb(101,31,255);
}
.dyn-flag-rule-10 {
    color: rgb(158, 158, 158);
}
.dyn-flag-rule-11 {
    color: rgb(230, 32, 196);
}
]{}

Default the admonitions styles are [note](#note-style) , [alert](#alert-style), [simple](#simple-style) style name in admonitions syntax.
**Also customize the type name as a custom style name.**
Each style includes the following types, each type corresponds to a class name of css:

| Type Name | Flag | Color |
| ---- | ----- | ----- |
|`summary`, `tldr`, `概要`, `摘要`| <span class="dyn-flag dyn-flag-rule-1">&#xebbf;</span> | <span class="colorpicker-color-decoration dyn-rule-1"></span>rgb(0,176,255) |
|`abstract`, `抽象`| <span class="dyn-flag dyn-flag-rule-1">&#xe787;</span> | ^^ |
|`info`, `todo`, `信息`, `待办`| <span class="dyn-flag dyn-flag-rule-2">&#xe626;</span> | <span class="colorpicker-color-decoration dyn-rule-2"></span>rgb(0,184,212)|
|`tip`, `hint`, `提示`, `小窍门`| <span class="dyn-flag dyn-flag-rule-3">&#xe60c;</span>| <span class="colorpicker-color-decoration dyn-rule-3"></span>rgb(0,191,165)|
|`success`, `check`, `done`, `成功`, `检测`, `完成`|<span class="dyn-flag dyn-flag-rule-4">&#xe608;</span> | <span class="colorpicker-color-decoration dyn-rule-4"></span>rgb(0,200,83)|
|`question`, `help`, `faq`, `问题`, `帮助`, `问答`| <span class="dyn-flag dyn-flag-rule-5">&#xe606;</span>| <span class="colorpicker-color-decoration dyn-rule-5"></span>rgb(100,221,23)|
|`warning`, `caution`, `警告`, `提醒`| <span class="dyn-flag dyn-flag-rule-6">&#xe62a;</span>| <span class="colorpicker-color-decoration dyn-rule-6"></span>rgb(255,145,0)|
|`attention`, `关注`| <span class="dyn-flag dyn-flag-rule-6">&#xe603;</span>| ^^ |
|`failure`, `fail`, `missing`, `故障`, `失败`, `缺失`| <span class="dyn-flag dyn-flag-rule-7">&#xe609;</span>| <span class="colorpicker-color-decoration dyn-rule-7"></span>rgb(255,82,82)|
|`danger`, `危险`| <span class="dyn-flag dyn-flag-rule-8">&#xe628;</span>| <span class="colorpicker-color-decoration dyn-rule-8"></span>rgb(255,23,68)|
|`error`, `错误`| <span class="dyn-flag dyn-flag-rule-8">&#xe612;</span>|^^|
|`bug`, `缺陷`| <span class="dyn-flag dyn-flag-rule-8">&#xe61f;</span>|^^|
|`example`, `示例`| <span class="dyn-flag dyn-flag-rule-9">&#xe690;</span>| <span class="colorpicker-color-decoration dyn-rule-9"></span>rgb(101,31,255)|
|`snippet`, `片段`| <span class="dyn-flag dyn-flag-rule-9">&#xe8e9;</span>|^^|
|`quote`, `cite`, `引用`, `引文`| <span class="dyn-flag dyn-flag-rule-10">&#xe618;</span>| <span class="colorpicker-color-decoration dyn-rule-10"></span>rgb(158, 158, 158)|
|`important`, `key`, `重点`, `要点`| <span class="dyn-flag dyn-flag-rule-11">&#xe604;</span>| <span class="colorpicker-color-decoration dyn-rule-11"></span>rgb(230, 32, 196)|

And you can also customize the style and type.

### Container Syntax

Container blocks contain further blocks. The proposed syntax for container block directives is:

```
::: name [label] {#id.x.y attributes}
contents, which are sometimes further block elements
:::

OR

!!! name [label] {#id.x.y attributes}
contents, which are sometimes further block elements
!!!

```
Analogous to fenced code blocks, an arbitrary number of colons or exclamation marks greater or equal three could be used as long as the closing line is longer than the opening line. That way, you can even nest blocks (think divs) by using successively fewer colons for each containing block.

When the name string in the container directive syntax is `container` (also defaults to container when empty string), `row`, or `col`, it is called container syntax; `details` string is called details-summary syntax; other strings are called admonitions syntax.

- The container syntax, for example:

```
:::::
::::row

:::col-one
!!!tip[tip example]{#example-one.note style="width:100%;"}
one contents, which are sometimes further block elements
!!!
:::

:::col-two
!!! info [info example] {#example-two.alert style="width:100%;"}
two contents, which are sometimes further block elements
!!!
:::

::::
:::::

```

Which will be rendered as:

```
<div class="container">
  <div class="container-content">
    <div class="row">
      <div class="row-content">
        <div class="col one">
          <div class="col-content">
            <div id="example-one" class="admonition note tip" style="width:100%;">
              <div class="admonition-title">tip example</div>
              <div class="admonition-content">
                <p>one contents, which are sometimes further block elements</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col two">
          <div class="col-content">
            <div id="example-two" class="admonition alert info" style="width:100%;">
              <div class="admonition-title">info example</div>
              <div class="admonition-content">
                <p>two contents, which are sometimes further block elements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

:::::
::::row

:::col-one
!!!tip[tip example]{#example-one.note style="width:100%;"}
one contents, which are sometimes further block elements
!!!
:::

:::col-two
!!! info [info example] {#example-two.alert style="width:100%;"}
two contents, which are sometimes further block elements
!!!
:::

::::
:::::

- The details-summary syntax, for example:

```
::: details[summary title]{#example}
contents, which are sometimes further block elements
:::
```

Which will be rendered as:
```
<details id="example" class="details">
  <summary class="details-title">
    summary title
  </summary>
  <div class="details-content">
    <p>contents, which are sometimes further block elements</p>
  </div>
</details>
```

::: details[summary title]{#example}
contents, which are sometimes further block elements
:::


When adding a '+' or '-' after the `details` token, the admonition is rendered as an expandable block with a small toggle on the right side:

::: details+[summary title]{#example}
Admonition, collapsible and initially expanded
:::


- The admonitions of container syntax, for example:

```
::: tip [tip example] {#example.alert style="width:100%;"}
You should info that the title will be automatically capitalized.
:::

OR

!!! tip [tip example] {#example.alert style="width:100%;"}
You should info that the title will be automatically capitalized.
!!!
```

Which will be rendered as:

```
<div id="example" class="admonition alert tip" style="width:100%;">
  <div class="admonition-title">
    tip example
  </div>
  <div class="admonition-content">
    <p>You should info that the title will be automatically capitalized.</p>
  </div>
</div>
```

!!! tip [tip example] {#example.alert style="width:100%;"}
You should info that the title will be automatically capitalized.
!!!

### rST-style Syntax

Admonitions of [rST-style](https://docutils.sourceforge.io/docs/ref/rst/directives.html#specific-admonitions) or [mkdocs-material](https://squidfunk.github.io/mkdocs-material/reference/admonitions) are created using the following syntax:

```markdown
!!! types "optional explicit title within double quotes"
    Any number of other indented markdown elements.

    This is the second paragraph.
```

Type will be used as the CSS class name and as default title. It must be a single word and default style is [simple](#simple-style). So, for instance:

```
!!! info
    You should type name(info) or style name(simple) that the title will be automatically capitalized.
```

will render:

```
<div class="admonition simple info">
  <div class="admonition-title">
    info
  </div>
  <div class="admonition-content">
    <p>You should info that the title will be automatically capitalized.</p>
  </div>
</div>
```

!!! info
    You should type name(info) or style name(simple) that the title will be automatically capitalized.

- Changing the title

By default, the title will equal the type qualifier in titlecase. However, it can be changed by adding a quoted string containing valid Markdown (including links, formatting, ...) after the type qualifier:

```markdown
!!! info "Phasellus posuere in sem ut cursus"

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.
```

will render:

```html
<div class="admonition simple info">
  <div class="admonition-title">
    Phasellus posuere in sem ut cursus
  </div>
  <div class="admonition-content">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.</p>
  </div>
</div>
```

!!! info "Phasellus posuere in sem ut cursus"

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.

- Collapsible blocks

When an admonition block is started with ??? instead of !!!, the admonition is rendered as an expandable block with a small toggle on the right side:
Admonition, collapsible

```markdown
??? tip

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```

will render:

```html
<details class="admonition simple tip">
  <summary class="admonition-title">
    note
  </summary>
  <div class="admonition-content">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.</p>
  </div>
</details>
```

??? tip

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

Adding a + after the ??? token renders the block expanded:

```markdown
???+ info

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```

will render:

```html
<details class="admonition simple info" open>
  <summary class="admonition-title">
    note
  </summary>
  <div class="admonition-content">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.</p>
  </div>
</details>
```

???+ info

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

### Compatible Syntax

A compatible admonitions syntax by wrapping text with a set of greater or equal 3 colons, as seen below:

```
::: <name | name0-name1-...> <label>
*Some text*
:::
```

For Example:

```
::: simple-warning A Compatible Syntax
*Some text*
:::
```

Which will be rendered as:

```
<div class=`admonition simple warning`>
  <div class=`admonition-title`>
    A Compatible Syntax
  </div>
  <div class=`admonition-content`>
    <p>
      <em>Some text</em>
    </p>
  </div>
</div>
```

::: simple-warning A Compatible Syntax
*Some text*
:::

### Callout Syntax

A callout syntax by wrapping text with below:

```
> [!name] title
> content line 1
> content line 2
> ...
```

For example:

```
> [!tip] Callouts can have custom titles
> Like this one.
```

will render:

```
<div class="callout note tip">
  <div class="callout-title">
    Callouts can have custom titles
  </div>
  <div class="callout-content">
    <p>Like this one.</p>
  </div>
</div>
```

> [!tip] Callouts can have custom titles
> Like this one.

You can even omit the body to create title-only callouts:

```
> [!tip] Title-only callout
```

will render:

```
<div class="callout note tip">
  <div class="callout-title">
    Title-only callout
  </div>
</div>
```

> [!tip] Title-only callout

- Foldable callouts

You can make a callout foldable by adding a plus (+) or a minus (-) directly after the type identifier.

A plus sign expands the callout by default, and a minus sign collapses it instead.

```
> [!faq]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed.
```

will render:

```
<details class="callout note faq">
  <summary class="callout-title">
    Are callouts foldable?
  </summary>
  <div class="callout-content">
    <p>Yes! In a foldable callout, the contents are hidden when the callout is collapsed.</p>
  </div>
</details>
```

> [!faq]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed.

### Container Example

For [note](#note-style), [alert](#alert-style), [simple](#simple-style) style examples.

#### Note Style

:::::
!!!key[key]{.note}
Some **content** with *Markdown* `syntax`. Check [this `api`](#).
!!!

!!! note info "info"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

???+ note tip "tip"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

::::row
:::col

!!!key[key]{.note}
Some **content** with *Markdown* `syntax`. Check [this `api`](#).
!!!

!!!cite[cite]{.note}
Some **content** with __Markdown__ `syntax`. Check [this `api`](#).
!!!

!!!snippet[snippet]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!hint[hint]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!todo[todo]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::


:::col

!!!important[important]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!quote[quote]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!example[example]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tip[tip]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!info[info]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::
::::

::::row
:::col

!!!bug[bug]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!missing[missing]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!caution[caution]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!faq[faq]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!done[done]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tldr[tldr]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!error[error]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!fail[fail]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!attention[attention]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!help[help]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!check[check]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!abstract[abstract]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!danger[danger]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!failure[failure]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!warning[warning]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!question[question]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!success[success]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!summary[summary]{.note}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

::::
:::::

#### Alert Style

:::::

!!!key[key]{.alert}
Some **content** with *Markdown* `syntax`. Check [this `api`](#).
!!!

!!! alert info "info"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

???+ alert tip "tip"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

::::row
:::col

!!!key[key]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!cite[cite]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!snippet[snippet]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!hint[hint]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!todo[todo]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::


:::col

!!!important[important]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!quote[quote]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!example[example]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tip[tip]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!info[info]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::
::::

::::row
:::col

!!!bug[bug]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!missing[missing]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!caution[caution]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!faq[faq]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!done[done]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tldr[tldr]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!error[error]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!fail[fail]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!attention[attention]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!help[help]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!check[check]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!abstract[abstract]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!danger[danger]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!failure[failure]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!warning[warning]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!question[question]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!success[success]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!summary[summary]{.alert}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

::::
:::::

#### Simple Style

:::::
!!!key[key]{.simple}
Some **content** with *Markdown* `syntax`. Check [this `api`](#).
!!!

!!! info "info"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

???+ tip "tip"
    Some **content** with *Markdown* `syntax`. Check [this `api`](#).

::::row
:::col

!!!key[key]{.simple}
Some **content** with *Markdown* `syntax`. Check [this `api`](#).
!!!

!!!cite[cite]{.simple}
Some **content** with __Markdown__ `syntax`. Check [this `api`](#).
!!!

!!!snippet[snippet]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!hint[hint]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!todo[todo]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::


:::col

!!!important[important]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!quote[quote]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!example[example]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tip[tip]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!info[info]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::
::::

::::row
:::col

!!!bug[bug]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!missing[missing]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!caution[caution]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!faq[faq]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!done[done]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!tldr[tldr]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!error[error]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!


!!!fail[fail]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!attention[attention]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!help[help]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!check[check]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!abstract[abstract]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

:::col

!!!danger[danger]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!failure[failure]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!warning[warning]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!question[question]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!success[success]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

!!!summary[summary]{.simple}
Some **content** with _Markdown_ `syntax`. Check [this `api`](#).
!!!

:::

::::
:::::

## Leaf Directives

The syntax for leaf block directives:

```
:: name [title | content] {#id.x.y attributes(key=val)}
```

To be recognized as a directive, this has to form an otherwise empty paragraph. But as opposed to [text directives](#text-directives), there are two colons now, the brackets [] are optional as well, and spaces may be interspersed for readability.

Leaf blocks are defined by default in three types: `media` or `video` or `媒体` or `音视频`, `css-link`, and `css`. See the table below for details:

| Type Name | [title \| content] | {attributes} | Rendered content |
| --------- | -- | -- | ---------------- |
|`media`,`video`,`媒体`,`音视频`| optional `title` | `src` attribute | \<iframe id="id" class="x y" src="...">\<div class="media-title">title\</div>\</iframe> |
|`css-link`| free | `href` attribute | \<link id="id" class="x y" href="..."> |
|`css`| css content | free | \<style id="id" key=val>content\</style> |

And you can also customize the type that can be triggered by event `leafDirective` to output custom HTML code.

## Text Directives

The syntax for text directives, it is also an inline directives:

```
:name[content]{#id.x.y attributes(key=val)}
```

Exactly one colon, followed by the name which is the identifier for the extension and must be a string without spaces, content may be further inline markdown elements to be interpreted and then printed in one way or another and the {#myId.myClass key=val key2="val 2"} contain generic attributes (i.e. key-value pairs) and are optional.

Rendered by default as:

```
<name id="id" class="x y" key=val>content</name>
```

And you can also customize the type that can be triggered by event `textDirective` to customize and reset default HTML code.
