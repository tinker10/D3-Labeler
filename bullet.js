(function() {

d3.anneal = function() {
  var lab = [],
      anc = [],
      w = 1, // box width
      h = 1, // box width
      anneal = {};

  var k_len = 0.3, // weight for leader line length penalty
      k_inter = 1.0, // weight for leader line intersection penalty
      k_lab2 = 30.0, // weight for label-label overlap
      k_lab_anc = 30.0, // weight for label-anchor overlap
      lab_rad = 20,
      anc_rad = 4;

  energy = function(index) {
      var m = lab.length, 
          ener = 0,
          dx = 0,
          dy = 0,
          dist = 0
          overlap = true,
          amount = 0;

      // penalty for length of leader line
      dx = anc[index].x - lab[index].x;
      dy = anc[index].y - lab[index].y;
      dist = Math.sqrt(dx * dx + dy * dy);
      dist -= (lab_rad+anc_rad);
      if (dist > 0) ener += dist * k_len;

      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for overlap of leader lines
          overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          if (overlap) ener += k_inter;

          // penalty for label-label overlap
          dx = lab[i].x - lab[index].x;
          dy = lab[i].y - lab[index].y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2 * lab_rad) {
            amount = (2 * lab_rad - dist) / (2 * lab_rad);
            ener += (amount * k_lab2);
          }
        }

        // penalty for label-anchor overlap
        dx = anc[i].x - lab[index].x;
        dy = anc[i].y - lab[index].y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (lab_rad + anc_rad)) {
          amount = ((lab_rad + anc_rad) - dist) / ((lab_rad + anc_rad));
          ener += (amount * k_lab_anc);
        }
      }
      return ener;
  };

  mcmove = function(temperature) {

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

      if (Math.random() < Math.exp(-delta_energy / temperature)) {
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

  anneal.sim_anneal = function(speed) {
      var m = lab.length;
          nsweeps = Math.floor(speed * 50000);
          temperature = 1.0,
          initialT = 1.0;

      var increment = initialT / nsweeps;

      for (var i = 0; i < nsweeps; i++) {
        for (var j = 0; j < m; j++) { mcmove(temperature); }
        temperature -= increment;
        // console.log(temperature);
      }
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

