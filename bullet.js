(function() {

d3.anneal = function() {
  var a = 380,
      b = 30,
      label_array = [],
      w = 1, // box width
      h = 1, // box width
      anneal = {};

  energy = function(index) {
      var m = label_array.length, 
          ener = 0;

      for (var i = 0; i < m; i++) {
        if (i != index) {
          var dx = label_array[i].x - label_array[index].x;
          var dy = label_array[i].y - label_array[index].y;
          var dist = Math.sqrt(dz * dx + dy * dy);
          ener += 5;
        }
      }
  };

  anneal.mcmove = function() {

      // random number between 0 and 
      var i = Math.floor((Math.random()*label_array.length)); 

      // console.log(label_array[i].name)

      var x_old = label_array[i].x;
      var y_old = label_array[i].y;

      var old_energy, new_energy;

      label_array[i].x += (Math.random() - 0.5) * 50;
      label_array[i].y += (Math.random() - 0.5) * 50;

      // hard wall boundaries
      if (label_array[i].x > w) label_array[i].x = x_old;
      if (label_array[i].x < 0) label_array[i].x = x_old;
      if (label_array[i].y > h) label_array[i].y = y_old;
      if (label_array[i].y < 0) label_array[i].y = y_old;
  };

  anneal.sweep = function() {
      var m = label_array.length;
      for (var i = 0; i < m; i++) { anneal.mcmove(); }
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
    if (!arguments.length) return label_array;
    label_array = x;
    return anneal;
  };

  return anneal;
};

})();

