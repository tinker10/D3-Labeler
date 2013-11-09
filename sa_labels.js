
(function() {

d3.sa_labels = function() {

    var sa_labels = {},
    event = d3.dispatch("start", "tick", "end"),
    label = [],
    source = [];

    // basically a MC sweep
    sa_labels.tick = function() {
      // simulated annealing, basically
      if ((alpha *= .99) < .005) {
        event.end({type: "end", alpha: alpha = 0});
        return true;
      }

      var n = nodes.length,
          m = links.length,
          q,
          i, // current index
          o, // current object
          s, // current source
          t, // current target
          l, // current distance
          k, // current force
          x, // x-distance
          y; // y-distance

      // gauss-seidel relaxation for links
      for (i = 0; i < m; ++i) {
        label[i].x += Math.random() * 10;
        label[i].y += Math.random() * 10;
        // o = links[i];
        // s = o.source;
        // t = o.target;
        // x = t.x - s.x;
        // y = t.y - s.y;
      }

      event.tick({type: "tick"});
    };

  sa_labels.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return force;
  };

  sa_labels.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return force;
  };
}

})();