(function() {
  d3.sa_labels = function sa_labels() {  

    var force = {},
    event = d3.dispatch("start", "tick", "end"),
    size = [1, 1],
    nodes = [],
    links = [];

    // basically a MC sweep
    force.tick = function() {
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
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = (x * x + y * y)) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }

      // apply gravity forces
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1; if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }

      // compute quadtree center of mass and apply charge forces
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1; while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }

      // position verlet integration
      i = -1; while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }

      event.tick({type: "tick", alpha: alpha});
    };




    force.start();
    for (var i = 0; i < n; ++i) force.tick();
    force.stop();

  };
})();
