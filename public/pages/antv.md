# [[TOC]]

# AntV Infographic

Support rendering svg of [AntV Infographic](https://github.com/antvis/Infographic).

[AntV Infographic](https://github.com/antvis/Infographic) is AntV's next-generation declarative infographic visualization engine. With a carefully designed infographic syntax, it can quickly and flexibly render high-quality infographics, making information presentation more efficient and data storytelling simpler.

Infographic options see [InfographicOptions](https://infographic.antv.vision/reference/infographic-options).

## Markdown Syntax

````
```infographic {"align": "<align>", “options": "<InfographicOptions>"}
<code content>
```
````

## AntV Infographic example

````
```infographic

infographic list-row-simple-horizontal-arrow
data
  lists
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete


```
````

```infographic

infographic list-row-simple-horizontal-arrow
data
  lists
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete


```
