# [[TOC]]

# Gnuplot

Support local render svg for gnuplot, for example website: [Gnuplot](http://www.gnuplot.info/).

## Markdown Syntax

````
```gnuplot {"align": "<align>"}
<code content>
```
````

## Gnuplot example

````
```gnuplot
#
# Compare surface drawn "with pm3d" colored with a 7-color discrete palette
# to the same surface drawn "with contourfill"
#

set colorbox user origin 0.75,0.2 size 0.15, 0.6
set cbtics scale .1
set view ,,,1.2
unset key

set xrange [-8:8]
set yrange [-8:8]

set rmargin at screen 0.75
set xyplane 0
set isosamples 51
set samples 51

set pm3d border lt -1 lw 0.5
set pm3d depth

sinc(x) = (x==0) ? 1.0 : sin(x) / x
f(x,y) = sinc( sqrt(x*x + y*y) )

set label 1 "set palette cubehelix\nmaxcolors 7"
set label 1 at screen 0.825, 0.9 center
set palette cubehelix maxcolors 7

set label 2 at screen 0.4, 0.9 center
set label 2 "set contourfill cbtics\nsplot with contourfill"
set contourfill cbtics

splot f(x,y) with contourfill fs border lc "black" lw 0.5
```
````
