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

Authors
-------
* Evan Wang (<evan.wang@berkeley.edu>)