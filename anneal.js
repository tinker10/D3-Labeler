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
      w_len = 0.2, // weight for leader line length penalty
      w_inter = 1.0, // weight for leader line intersection penalty
      w_lab2 = 30.0, // weight for label-label overlap
      w_lab_anc = 30.0; // weight for label-anchor overlap
      w_orient = 5.0; // weight for orientation bias

  energy = function(index) {
  // energy function, tailored for label placement

      var m = lab.length, 
          ener = 0,
          dx = 0,
          dy = 0,
          dist = 0
          overlap = true,
          amount = 0
          theta = 0;

      // penalty for length of leader line
      dx = anc[index].x - lab[index].x;
      dy = anc[index].y - lab[index].y;
      dist = Math.sqrt(dx * dx + dy * dy);
      // dist -= (lab_rad+anc_rad);
      if (dist > 0) ener += dist * w_len;

      // label orientation bias
      dx = lab[index].x - anc[index].x;
      dy = anc[index].y - lab[index].y;
      dist = Math.sqrt(dx * dx + dy * dy);
      dx /= dist;
      dy /= dist;

      if (dx > 0 && dy > 0) { ener += 0 * w_orient; }
      else if (dx < 0 && dy > 0) { ener += 1 * w_orient; }
      else if (dx < 0 && dy < 0) { ener += 2 * w_orient; }
      else { ener += 3 * w_orient; }

      /*
      if (dx > 0 && dy > 0) {
        theta = Math.acos(dx) * 180.0 / 3.14159;
        ener += Math.pow(theta - 45.0, 2);
      } else if (dx > 0 && dy < 0) {
        theta = Math.acos(dx) * 180.0 / 3.14159;
        ener += Math.pow(theta - 45.0, 2);
      }
      */

      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for overlap of leader lines
          overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          if (overlap) ener += w_inter;

          // penalty for label-label overlap
          var x11 = lab[i].x;
          var y11 = lab[i].y - lab[i].height + 2.0;
          var x12 = lab[i].x + lab[i].width;
          var y12 = lab[i].y + 2.0;
          var x21 = lab[index].x;
          var y21 = lab[index].y - lab[index].height + 2.0;
          var x22 = lab[index].x + lab[index].width;
          var y22 = lab[index].y + 2.0;
          var x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          var y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          var overlap_area = x_overlap * y_overlap;
          ener += (overlap_area * w_lab2);
          
          }

          // penalty for label-anchor overlap
          var ax11 = anc[i].x - r;
          var ay11 = anc[i].y - r;
          var ax12 = anc[i].x + r;
          var ay12 = anc[i].y + r;
          // console.log(ax11, ay11, ax12, ay12)

          var ax21 = lab[index].x;
          var ay21 = lab[index].y - lab[index].height + 2.0;
          var ax22 = lab[index].x + lab[index].width;
          var ay22 = lab[index].y + 2.0;
          // console.log(ax21, ay21, ax22, ay22)
          var ax_overlap = Math.max(0, Math.min(ax12,ax22) - Math.max(ax11,ax21));
          var ay_overlap = Math.max(0, Math.min(ay12,ay22) - Math.max(ay11,ay21));
          // console.log(ax_overlap, ay_overlap);
          var aoverlap_area = ax_overlap * ay_overlap;
          // console.log(aoverlap_area)
          ener += (aoverlap_area * w_lab_anc);

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
      console.log(acc / (acc + rej));
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

