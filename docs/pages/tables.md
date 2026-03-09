# [[TOC]]

# Tables

* The following features are extended based on the showdown's table:

  * Cell spans over columns
  * Cell spans over rows (optional)
  * Omitted table header (optional)

## Showdown's table

cell style syntax has "-{2,}",":-{2,}",":-{2,}:","-{2,}:", means default (align left), align left, align center, and align right style

```
| Return Code | Style | Value | DESC      |
| ----------- | :-----: | :----- | ---------: |
| OK          | int   | 1     | Succeeded |
| ERROR       | int   | 0     | Failed '\|'    |
```

| Return Code | Style | Value | DESC      |
| ----------- | :-----: | :----- | ---------: |
| OK          | int   | 1     | Succeeded |
| ERROR       | int   | 0     | Failed    |

## Colspan table

"||" indicates cells being merged left.

```
| Return Code | Style | Value | DESC      |
| ====== | :-----: | ===== | ===== |
| **OK**          | int   | 1     | [Succeeded](https://www.baidu.com) |
| ERROR       | int   | 0     ||
| ERROR       || 0     ||
```

| Return Code | Style | Value | DESC      |
| ====== | :-----: | ===== | ===== |
| **OK**          | int   | 1     | [Succeeded](https://www.baidu.com) |
| ERROR       | int   | 0     ||
| ERROR       || 0     ||

## Rowspan table (optional: tablesRowspan)

"^^" indicates cells being merged above.

```
| Return Code | Style | Value | DESC      |
| ====== | :-----: | ===== | ===== |
| ^^         || 1     | [Succeeded](https://www.baidu.com) |
| ^^       || 0     ||
| ERROR       | int   | 0     ||
| ERROR       || 0     ||
| ^^       || 0     ||
```

| Return Code | Style | Value | DESC      |
| ====== | :-----: | ===== | ===== |
| ^^         || 1     | [Succeeded](https://www.baidu.com) |
| ^^       || 0     ||
| ERROR       | int   | 0     ||
| ERROR       || 0     ||
| ^^       || 0     ||

## Headerless table (optional: tablesHeaderless)

Table header can be eliminated.

```
|--|--|--|--|--|--|--|--|
|♜|  |♝|♛|♚|♝|♞|♜|
|  |♟|♟|♟|  |♟|♟|♟|
|♟|  |♞|  |  |  |  |  |
|  |♗|  |  |♟|  |  |  |
|  |  |  |  |♙|  |  |  |
|  |  |  |  |  |♘|  |  |
|♙|♙|♙|♙|  |♙|♙|♙|
|♖|♘|♗|♕|♔|  |  |♖|
```

|--|--|--|--|--|--|--|--|
|♜|  |♝|♛|♚|♝|♞|♜|
|  |♟|♟|♟|  |♟|♟|♟|
|♟|  |♞|  |  |  |  |  |
|  |♗|  |  |♟|  |  |  |
|  |  |  |  |♙|  |  |  |
|  |  |  |  |  |♘|  |  |
|♙|♙|♙|♙|  |♙|♙|♙|
|♖|♘|♗|♕|♔|  |  |♖|
