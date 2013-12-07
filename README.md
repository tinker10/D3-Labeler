D3-Labeler
=========

A D3 plug-in for automatic label placement using simulated annealing that easily incorporates into existing D3 code, with syntax mirroring other D3 layouts. 

Installation
------------

Download anneal.js. Include the plug-in in the relevant .html file with:
```html
<script src="labeler.js"></script>
```

Labeling parlance
-----------------

![label](label.png)

Each *label* corresponds to an *anchor point*. A *leader line* may be used to help with the correspondence between the *label* and *anchor point*. None of the elements may cross the *graph boundary*.

Usage
-----------------

To automatically place labels, users declare a labler (simulated annealing) layout, input label and anchor positions, the figure boundaries, and the number of Monte Carlo sweeps for simulated annealing. The general pattern is as follows:
```javascript
var labels = d3.labeler()
               .nodes(label_positions)
               .anchor(anchor_positions)
               .width(w)
               .height(h)
               .start(nsweeps);
```
The default settings are: width 1, height 1, and nsweeps 1000. The default label_positions and anchor_positions are empty arrays. Here we describe each term in more detail. 

d3.<b>labeler</b>()
Start by declaring a labeling layout, the same as declaring any other D3 layout.

labeler.<b>label</b>([<i>labels</i>])

Each label has the following attributes:

* x - the *x*-coordinate of the label.
* y - the *y*-coordinate of the label.
* width - the *width* of the label (approximating the label as a rectangle).
* height - the *height* of the label (same approximation).
* name - the label text.

The width and height can be easily measured using the SVG getBBox() method. The dimensions are used to calculate overlaps.

labeler.<b>anchor</b>([<i>anchors</i>])

Each anchor has the following attributes:

* x - the *x*-coordinate of the anchor.
* y - the *y*-coordinate of the anchor.
* r - the anchor radius (assuming anchor is a circle). 

The radius used to calculate overlaps.

labeler.<b>start</b>(<i>nsweeps</i>)

labeler.<b>width</b>(<i>w</i>)

labeler.<b>height</b>(<i>h</i>)


Authors
-------
* Evan Wang (<evan.wang@berkeley.edu>)
