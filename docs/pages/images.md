# [[TOC]]

# Inline Image

Support inline image be defined, including the image path can be reset using a reset event.

Its markdown syntax format Its grammatical format is the same as that of obsidian-style image links.

## Markdown Syntax

```

![[<image path>]]

OR

![[<image path>]]{<image attributes>}


```

Which will be append a image element as:

```

<img class="inline-image" src="<image path>" <image attributes> />

```

## Inline Image examples

```
![[logo.png]]{ width="64" heigth="64" }
```

Which will be append a image element as:

```

<img class="inline-image" src="logo.png" width="64" heigth="64" />

```
