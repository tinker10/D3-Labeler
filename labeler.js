(function() {

d3.anneal = function() {
  var lab = [],
      anc = [],
      w = 1, // box width
      h = 1, // box width
      r = 1, // anchor radius
      anneal = {};

  var max_move = 5.0,
      max_angle = 0.5,
      acc = 0;
      rej = 0;

  // weights
  var w_len = 0.2, // leader line length 
      w_inter = 1.0, // leader line intersection
      w_lab2 = 30.0, // label-label overlap
      w_lab_anc = 30.0; // label-anchor overlap
      w_orient = 3.0; // orientation bias

  energy = function(index) {
  // energy function, tailored for label placement

      var m = lab.length, 
          ener = 0,
          dx = lab[index].x - anc[index].x,
          dy = anc[index].y - lab[index].y,
          dist = Math.sqrt(dx * dx + dy * dy),
          overlap = true,
          amount = 0
          theta = 0;

      // penalty for length of leader line
      // dist -= (lab_rad+anc_rad);
      if (dist > 0) ener += dist * w_len;

      // label orientation bias
      dx /= dist;
      dy /= dist;
      if (dx > 0 && dy > 0) { ener += 0 * w_orient; }
      else if (dx < 0 && dy > 0) { ener += 1 * w_orient; }
      else if (dx < 0 && dy < 0) { ener += 2 * w_orient; }
      else { ener += 3 * w_orient; }

      var x21 = lab[index].x,
          y21 = lab[index].y - lab[index].height + 2.0,
          x22 = lab[index].x + lab[index].width,
          y22 = lab[index].y + 2.0;
      var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for intersection of leader lines
          overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          if (overlap) ener += w_inter;

          // penalty for label-label overlap
          x11 = lab[i].x;
          y11 = lab[i].y - lab[i].height + 2.0;
          x12 = lab[i].x + lab[i].width;
          y12 = lab[i].y + 2.0;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          overlap_area = x_overlap * y_overlap;
          ener += (overlap_area * w_lab2);
          }

          // penalty for label-anchor overlap
          x11 = anc[i].x - r;
          y11 = anc[i].y - r;
          x12 = anc[i].x + r;
          y12 = anc[i].y + r;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          overlap_area = x_overlap * y_overlap;
          ener += (overlap_area * w_lab_anc);

      }
      return ener;
  };

  mcmove = function(currT) {
  // Monte Carlo translation move

      // select a random label
      var i = Math.floor(Math.random() * lab.length); 

      // save old coordinates
      var x_old = lab[i].x;
      var y_old = lab[i].y;

      // old energy
      var old_energy = energy(i);

      // random translation
      lab[i].x += (Math.random() - 0.5) * max_move;
      lab[i].y += (Math.random() - 0.5) * max_move;

      // hard wall boundaries
      if (lab[i].x > w) lab[i].x = x_old;
      if (lab[i].x < 0) lab[i].x = x_old;
      if (lab[i].y > h) lab[i].y = y_old;
      if (lab[i].y < 0) lab[i].y = y_old;

      // new energy
      var new_energy = energy(i);

      // delta E
      var delta_energy = new_energy - old_energy;

      if (Math.random() < Math.exp(-delta_energy / currT)) {
        acc += 1;
      } else {
        // move back to old coordinates
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;
      }

  };

  mcrotate = function(currT) {
  // Monte Carlo rotation move

      // select a random label
      var i = Math.floor(Math.random() * lab.length); 

      // save old coordinates
      var x_old = lab[i].x;
      var y_old = lab[i].y;

      // old energy
      var old_energy = energy(i);

      // random angle
      var angle = (Math.random() - 0.5) * max_angle;

      var s = Math.sin(angle);
      var c = Math.cos(angle);

      // translate label (relative to anchor at origin):
      lab[i].x -= anc[i].x
      lab[i].y -= anc[i].y

      // rotate label
      var x_new = lab[i].x * c - lab[i].y * s,
          y_new = lab[i].x * s + lab[i].y * c;

      // translate label back
      lab[i].x = x_new + anc[i].x
      lab[i].y = y_new + anc[i].y

      // hard wall boundaries
      if (lab[i].x > w) lab[i].x = x_old;
      if (lab[i].x < 0) lab[i].x = x_old;
      if (lab[i].y > h) lab[i].y = y_old;
      if (lab[i].y < 0) lab[i].y = y_old;

      // new energy
      var new_energy = energy(i);

      // delta E
      var delta_energy = new_energy - old_energy;

      if (Math.random() < Math.exp(-delta_energy / currT)) {
        acc += 1;
      } else {
        // move back to old coordinates
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;
      }
      
  };

  intersect = function(x1, x2, x3, x4, y1, y2, y3, y4) {
  // returns true if two lines intersect, else false
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

  cooling_schedule = function(currT, initialT, nsweeps) {
  // linear cooling
    return (currT - (initialT / nsweeps));
  }

  counter = function() {

      var m = lab.length;

      var tot_inter = 0,
          ll_overlap = 0,
          la_overlap = 0;

      // for (var i = 0; i < (m - 1); i++) {
        // for (var j = i + 1; j < m; j++) {
      for (var i = 0; i < m; i++) {
        for (var j = i ; j < m; j++) {

          // intersection
          tot_inter += overlap = intersect(anc[j].x, lab[j].x, anc[i].x, lab[i].x,
                          anc[j].y, lab[j].y, anc[i].y, lab[i].y);

          var x21 = lab[i].x,
          y21 = lab[i].y - lab[i].height + 2.0,
          x22 = lab[i].x + lab[i].width,
          y22 = lab[i].y + 2.0;
          var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

          // label-label overlap
          x11 = lab[j].x;
          y11 = lab[j].y - lab[j].height + 2.0;
          x12 = lab[j].x + lab[j].width;
          y12 = lab[j].y + 2.0;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          overlap_area = x_overlap * y_overlap;
          if (overlap_area > 0.0) ll_overlap += 1;

          // label-anchor overlap
          x11 = anc[j].x - r;
          y11 = anc[j].y - r;
          x12 = anc[j].x + r;
          y12 = anc[j].y + r;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          overlap_area = x_overlap * y_overlap;
          if (overlap_area > 0.0) la_overlap += 1;
        }
      }
      // console.log(tot_inter, ll_overlap, la_overlap)
      return la_overlap
  };

  anneal.sim_anneal = function(nsweeps) {
  // main simulated annealing function
      var m = lab.length,
          currT = 1.0,
          initialT = 1.0;

      for (var i = 0; i < nsweeps; i++) {
        for (var j = 0; j < m; j++) { 
          if (Math.random() < 0.5) { mcmove(currT); }
          else { mcrotate(currT); }
        }
        currT = cooling_schedule(currT, initialT, nsweeps);
      }
      var c = counter();
      // console.log(c)
      // console.log(acc / (acc + rej));
      return c;
  };

  anneal.test = function() {
  // testing mode
      console.log('Testing mode.');
      energy(0);
  };

  anneal.width = function(x) {
  // users insert graph width
    if (!arguments.length) return w;
    w = x;
    return anneal;
  };

  anneal.height = function(x) {
  // users insert graph height
    if (!arguments.length) return h;
    h = x;    
    return anneal;
  };

  anneal.nodes = function(x) {
  // users insert label positions
    if (!arguments.length) return lab;
    lab = x;
    return anneal;
  };

  anneal.anchor = function(x) {
  // users insert anchor positions
    if (!arguments.length) return anc;
    anc = x;
    return anneal;
  };

  anneal.anchor_radius = function(x) {
  // users insert radius of achor points
    if (!arguments.length) return r;
    r = x;
    return anneal;
  };

  return anneal;
};

})();

