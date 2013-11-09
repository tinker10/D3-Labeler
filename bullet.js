(function() {

d3.anneal = function() {
  var a = 380,
      b = 30,
      label_array = [],
      anneal = {};

  anneal.sweep = function() {
      var m = links.length;
      for (i = 0; i < m; ++i) {
          label_array[i].x += Math.random() * 1000;
          label_array[i].y += Math.random() * 1000;
      }
  };

  anneal.width = function(x) {
    if (!arguments.length) return a;
    a = x;
    // console.log(a)
    return anneal;
  };

  anneal.height = function(x) {
    if (!arguments.length) return b;
    b = x;    
    // console.log(b)
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

