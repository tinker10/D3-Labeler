D3-Labeler
=========

A D3 plug-in for automatic label placement using simulated annealing that easily incorporates into existing D3 code, with syntax mirroring other D3 layouts. 

Installation
------------

Download labeler.js. Include the plug-in in the relevant .html file with:
```html
<script src="labeler.js"></script>
```

Components of a labeling problem
--------------------------------

![label](label.png)

Each *label* corresponds to an *anchor point*. A *leader line* may be used to help with the correspondence between the *label* and *anchor point*. None of the elements may cross the *graph boundary*.

Usage
-----------------

To automatically place labels, users declare a labeler (simulated annealing) layout, input label and anchor positions, the figure boundaries, and the number of Monte Carlo sweeps for simulated annealing. The general pattern is as follows:
```javascript
var labels = d3.labeler()
               .nodes(label_array)
               .anchor(anchor_array)
               .width(w)
               .height(h)
               .start(nsweeps);
```
The default settings are: width = 1, height = 1, and nsweeps = 1000. The default label_array and anchor_array are empty arrays. Here we describe each term in more detail.

d3.<b>labeler</b>()

Start by declaring a labeling layout, the same as declaring any other D3 layout.

labeler.<b>label</b>([<i>label_array</i>])

Each label has the following attributes. Note that width and height can be easily measured using the SVG getBBox() method. The dimensions are used to calculate overlaps.

* x - the *x*-coordinate of the label.
* y - the *y*-coordinate of the label.
* width - the *width* of the label (approximating the label as a rectangle).
* height - the *height* of the label (same approximation).
* name - the label text.

labeler.<b>anchor</b>([<i>anchor_array</i>])

Each anchor has the following attributes:

* x - the *x*-coordinate of the anchor.
* y - the *y*-coordinate of the anchor.
* r - the anchor radius (assuming anchor is a circle). 

labeler.<b>width</b>(<i>w</i>)

labeler.<b>height</b>(<i>h</i>)

The width and height are used to set the boundary conditions so that labels do not go outside the width and height of the figure. More specifically, Monte Carlo moves in which the labels cross the boundaries are rejected. If they are not specified, both the width and height default to 1. 

labeler.<b>start</b>(<i>nsweeps</i>)

Finally, we specify the number of Monte Carlo sweeps for the optimization and run the simulated annealing procedure. The default for nsweeps is 1000. Note that one Monte Carlo sweep means that on average, each label is translated or rotated once. To obtain the actual number of Monte Carlo steps taken, multiply the number of sweeps by the number of labels N.

labeler.<b>alt_energy</b>(<i>user_defined_energy</i>)
labeler.<b>alt_energy</b>(<i>user_defined_energy</i>)

Implementation details
----------------------



Author
------
* Evan Wang (<evan.wang@berkeley.edu>)
