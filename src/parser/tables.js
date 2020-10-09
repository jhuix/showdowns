/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import showdown from 'showdown';

// Override tables parser;
showdown.subParser('tables', function (text, options, globals) {
  'use strict';

  if (!options.tables) {
    return text;
  }

  var tableRgx = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
    singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm,
    headerlessTableRgx = /^ {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
    headerlessSingeColTblRgx = /^ {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

  function parseStyles(sLine) {
    if (/^:[ \t]*--*$/.test(sLine)) {
      return ' style="text-align:left;"';
    } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
      return ' style="text-align:right;"';
    } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
      return ' style="text-align:center;"';
    } else {
      return '';
    }
  }

  function parseHeaders(header, style) {
    var id = '';
    header = header.trim();
    // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
    if (options.tablesHeaderId || options.tableHeaderId) {
      id = ' id="' + header.replace(/ /g, '_').toLowerCase() + '"';
    }
    header = showdown.subParser('spanGamut')(header, options, globals);

    return '<th' + id + style + '>' + header + '</th>\n';
  }

  function mergeCells(cells, row, col, cell) {
    if (cell) {
      if (!options.tablesRowspan || cell !== '^^' || !row) {
        return;
      }

      // up merge except for first row cells
      for (var i = row - 1; i >= 0; --i) {
        if (!cells[i][col]) {
          for (var ii = col - 1; ii >= 0; -ii) {
            if (cells[i + 1][ii] && cells[i + 1][ii] !== '^^') {
              return;
            }

            if (cells[i][ii]) {
              if (!cells[i + 1][ii]) {
                return;
              }

              cells[i][ii] = cells[i][ii]
                .replace(/rowspan="[0-9]*"/g, '')
                .replace(/^(<td[^<>\n\r]*?)(>.*<\/td>\n)/, function (str, left, right) {
                  return left + ' rowspan="' + (row - i + 1) + '"' + right;
                });
              return cell;
            }
          }
        } else if (cells[i][col] !== '^^') {
          cells[i][col] = cells[i][col]
            .replace(/rowspan="[0-9]*"/g, '')
            .replace(/^(<td[^<>\n\r]*?)(>.*<\/td>\n)/, function (str, left, right) {
              return left + ' rowspan="' + (row - i + 1) + '"' + right;
            });
          return cell;
        } else if (i === 0) {
          cells[i][col] = '<td rowspan="' + (row - i + 1) + '"></td>\n';
          return cell;
        }
      }

      return;
    }

    // left merge except for first column cells
    if (!col) {
      return;
    }

    for (var ii = col - 1; ii >= 0; --ii) {
      if (cells[row][ii]) {
        if (cells[row][ii] === '^^') {
          for (var i = row - 1; i >= 0; --i) {
            if (cells[i][ii + 1]) {
              return;
            }

            if (cells[i][ii] !== '^^') {
              cells[i][ii] = cells[i][ii]
                .replace(/colspan="[0-9]*"/g, '')
                .replace(/^(<td[^<>\n\r]*?)(>.*<\/td>\n)/, function (str, left, right) {
                  return left + ' colspan="' + (col - ii + 1) + '"' + right;
                });
              return cell;
            }
          }
        } else {
          cells[row][ii] = cells[row][ii]
            .replace(/colspan="[0-9]*"/g, '')
            .replace(/^(<td[^<>\n\r]*?)(>.*<\/td>\n)/, function (str, left, right) {
              return left + ' colspan="' + (col - ii + 1) + '"' + right;
            });
          return cell;
        }
      } else if (ii === 0) {
        cells[row][ii] = '<td colspan="' + (col - ii + 1) + '"></td>\n';
        return cell;
      }
    }

    return;
  }

  function parseCells(cells, row, col, cell, style) {
    if (options.tablesMerge) {
      var direct = mergeCells(cells, row, col, cell);
      if (!showdown.helper.isUndefined(direct)) {
        return direct;
      }
    }

    cell = cell.trim();
    var subText = showdown.subParser('spanGamut')(cell, options, globals);
    return '<td' + style + '>' + subText + '</td>\n';
  }

  function buildTable(headers, styles, cells) {
    var tb = '<table>\n',
      tblLgn = styles.length;

    if (headers.length) {
      tb += '<thead>\n<tr>\n';
      for (var i = 0; i < headers.length; ++i) {
        tb += headers[i];
      }
      tb += '</tr>\n</thead>\n';
    }
    tb += '<tbody>\n'

    for (i = 0; i < cells.length; ++i) {
      tb += '<tr>\n';
      for (var ii = 0; ii < tblLgn; ++ii) {
        if (!options.tablesMerge || cells[i][ii] !== '^^') {
          tb += cells[i][ii];
        }
      }
      tb += '</tr>\n';
    }
    tb += '</tbody>\n</table>\n';
    return tb;
  }

  function parseTableContent(rawTable, headerless) {
    var i,
      tableLines = rawTable.split('\n');

    for (i = 0; i < tableLines.length; ++i) {
      // strip wrong first and last column if wrapped tables are used
      if (/^ {0,3}\|/.test(tableLines[i])) {
        tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
      }
      if (/\|[ \t]*$/.test(tableLines[i])) {
        tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
      }
      // parse code spans first, but we only support one line code spans
      tableLines[i] = showdown.subParser('codeSpans')(tableLines[i], options, globals);
    }

    var rawStyles = [],
      rawCells = [],
      headers = [],
      styles = [],
      cells = [];

    if (headerless) {
      rawStyles = tableLines[0].split('|').map(function (s) {
        return s.trim();
      });
      tableLines.shift();
      for (i = 0; i < rawStyles.length; ++i) {
        styles.push(parseStyles(rawStyles[i]));
      }
    } else {
      var rawHeaders = tableLines[0].split('|').map(function (s) {
        return s.trim();
      });
      rawStyles = tableLines[1].split('|').map(function (s) {
        return s.trim();
      });

      tableLines.shift();
      tableLines.shift();

      if (rawHeaders.length < rawStyles.length) {
        return rawTable;
      }

      for (i = 0; i < rawStyles.length; ++i) {
        styles.push(parseStyles(rawStyles[i]));
      }

      for (i = 0; i < rawHeaders.length; ++i) {
        if (showdown.helper.isUndefined(styles[i])) {
          styles[i] = '';
        }
        headers.push(parseHeaders(rawHeaders[i], styles[i]));
      }
    }

    for (i = 0; i < tableLines.length; ++i) {
      if (tableLines[i].trim() === '') {
        continue;
      }
      rawCells.push(
        tableLines[i].split('|').map(function (s) {
          var cell = s.trim();
          if (cell === '' && s.length > 0) return s;
          return cell;
        })
      );
    }

    for (i = 0; i < rawCells.length; ++i) {
      var row = [];
      cells.push(row);
      for (var ii = 0; ii < styles.length; ++ii) {
        if (showdown.helper.isUndefined(rawCells[i][ii])) {
          rawCells[i][ii] = '';
        }
        row.push(parseCells(cells, i, ii, rawCells[i][ii], styles[ii]));
      }
    }

    return buildTable(headers, styles, cells);
  }

  function parseTable(rawTable) {
    return parseTableContent(rawTable, false);
  }

  function parseHeaderlessTable(rawTable) {
    return parseTableContent(rawTable, true);
  }

  text = globals.converter._dispatch('tables.before', text, options, globals);

  // find escaped pipe characters
  text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

  // parse multi column tables
  text = text.replace(tableRgx, parseTable);

  // parse one column tables
  text = text.replace(singeColTblRgx, parseTable);

  if (options.tablesHeaderless) {
    // parse multi column headerless tables
    text = text.replace(headerlessTableRgx, parseHeaderlessTable);

    // parse one column headerless tables
    text = text.replace(headerlessSingeColTblRgx, parseHeaderlessTable);
  }

  text = globals.converter._dispatch('tables.after', text, options, globals);

  return text;
});
