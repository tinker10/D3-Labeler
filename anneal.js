(function() {

d3.anneal = function() {
  var lab = [],
      anc = [],
      w = 1, // box width
      h = 1, // box width
      anneal = {};

  var max_move = 5.0,
      max_angle = 0.5,
      acc = 0;
      rej = 0;
      k_len = 0.2, // weight for leader line length penalty
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

/*
            x11 = d0.left,
            y11 = d0.top,
            x12 = d0.left + divs.eq(0).width(),
            y12 = d0.top + divs.eq(0).height(),
            x21 = d1.left,
            y21 = d1.top,
            x22 = d1.left + divs.eq(1).width(),
            y22 = d1.top + divs.eq(1).height(),
        
            x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21))
            y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
*/



      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for overlap of leader lines
          overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          if (overlap) ener += k_inter;

          // penalty for label-label overlap
          
          var x11 = lab[i].x;
          var y11 = lab[i].y;
          var x12 = lab[i].x + lab[i].width;
          var y12 = lab[i].y + lab[i].height;
          var x21 = lab[index].x;
          var y21 = lab[index].y;
          var x22 = lab[index].x + lab[index].width;
          var y22 = lab[index].y + lab[index].height;

          var x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21))
          var y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          var overlap = x_overlap * y_overlap;
          ener += (overlap * k_lab2);

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

      // select a random label
      var i = Math.floor(Math.random() * lab.length); 

      var x_old = lab[i].x;
      var y_old = lab[i].y;

      var old_energy = energy(i);

      lab[i].x += (Math.random() - 0.5) * max_move;
      lab[i].y += (Math.random() - 0.5) * max_move;

      // hard wall boundaries
      if (lab[i].x > w) lab[i].x = x_old;
      if (lab[i].x < 0) lab[i].x = x_old;
      if (lab[i].y > h) lab[i].y = y_old;
      if (lab[i].y < 0) lab[i].y = y_old;

      var new_energy = energy(i);
      var delta_energy = new_energy - old_energy;

      if (Math.random() < Math.exp(-delta_energy / temperature)) {
        acc += 1;
      } else {
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;
      }

  };

  mcrotate = function(temperature) {

      // select a random label
      var i = Math.floor(Math.random() * lab.length); 

      var x_old = lab[i].x;
      var y_old = lab[i].y;

      var old_energy = energy(i);

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

      var new_energy = energy(i);
      var delta_energy = new_energy - old_energy;

      if (Math.random() < Math.exp(-delta_energy / temperature)) {
        acc += 1;
      } else {
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;
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
        for (var j = 0; j < m; j++) { 
          if (Math.random() < 0.5) { mcmove(temperature); }
          else { mcrotate(temperature); }
        }
        temperature -= increment;
      }

      console.log(acc / (acc + rej));
  };

  anneal.test = function() {
      console.log('hi');
      mcrotate(1.0);
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

