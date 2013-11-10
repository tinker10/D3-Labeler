(function() {

d3.anneal = function() {
  var a = 380,
      b = 30,
      lab = [],
      anc = [],
      w = 1, // box width
      h = 1, // box width
      anneal = {};

  energy = function(index) {
      var m = lab.length, 
          ener = 0,
          dx = 0,
          dy = 0,
          dist = 0
          overlap = true;

      // penalty for length of leader line
      dx = anc[index].x - lab[index].x;
      dy = anc[index].y - lab[index].y;
      dist = Math.sqrt(dx * dx + dy * dy);
      // more stuff here

      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for overlap of leader lines
          overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          // if (overlap) continue

          // penalty for label-label overlap
          dx = lab[i].x - lab[index].x;
          dy = lab[i].y - lab[index].y;
          dist = Math.sqrt(dx * dx + dy * dy);
          // if (dist < 50) ener += 500;
        }
        
        // penalty for label-anchor overlap
        dx = anc[i].x - lab[index].x;
        dy = anc[i].y - lab[index].y;
        dist = Math.sqrt(dx * dx + dy * dy);
        // if (dist < 50) ener += 500;
      }
      return ener;
  };

  mcmove = function() {

      // random number between 0 and 
      var i = Math.floor((Math.random()*lab.length)); 

      // console.log(lab[i].name)

      var x_old = lab[i].x;
      var y_old = lab[i].y;

      var old_energy = energy(i);

      lab[i].x += (Math.random() - 0.5) * 50;
      lab[i].y += (Math.random() - 0.5) * 50;

      // hard wall boundaries
      if (lab[i].x > w) lab[i].x = x_old;
      if (lab[i].x < 0) lab[i].x = x_old;
      if (lab[i].y > h) lab[i].y = y_old;
      if (lab[i].y < 0) lab[i].y = y_old;

      var new_energy = energy(i);
      var delta_energy = new_energy - old_energy;

      if (Math.random() < Math.exp(-delta_energy / 1.0)) {
        // acceptance stuff here
      } else {
        lab[i].x = x_old;
        lab[i].y = y_old;
      }

  };

  intersect = function(x1, x2, x3, x4, y1, y2, y3, y4) {
    // from http://paulbourke.net/geometry/lineline2d/

    var mua, mub;
    var denom, numera, numerb;

    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

    /* Is the intersection along the the segments */
    mua = numera / denom;
    mub = numerb / denom;
    if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
        return true;
    }
    return false;
}

  anneal.sweep = function() {
      var m = lab.length;
      for (var i = 0; i < m; i++) { mcmove(); }
  };

  anneal.width = function(x) {
    if (!arguments.length) return w;
    w = x;
    // console.log("width" + w);
    return anneal;
  };

  anneal.height = function(x) {
    if (!arguments.length) return h;
    h = x;    
    // console.log("width" + h);
    return anneal;
  };

  anneal.nodes = function(x) {
    if (!arguments.length) return lab;
    lab = x;
    return anneal;
  };

  anneal.anchor = function(x) {
    if (!arguments.length) return anc;
    anc = x;
    return anneal;
  };

  return anneal;
};

})();

