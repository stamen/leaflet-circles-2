(function() {
  "use strict";

  function CircleLayer(options) {

    var that = this;

    options = options || {};

    options.color  = options.color || function(d) { return "#444"; };
    options.radius = options.radius || function(d) { return 2; };
    options.width  = options.width || 1280;
    options.height = options.height || 800;

    var projection = d3.geo.albers()
    .translate([110, 100])
    .scale(1650);

    var radius = d3.scale.sqrt()
    .domain([0, 1, 1200])
    .range([0, 0.5, 4]);

    var color = d3.scale.sqrt()
    .domain([1300, 1, 0, -1, -1200])
    .interpolate(d3.interpolateLab);

    var ease = d3.ease("cubic");

    var colors = colorbrewer["RdBu"][5];
    color.range([colors[0], colors[0], colors[2], colors[4], colors[4]]);

    var out = new (L.CanvasLayer.extend({
        _data: [],

    options: options,

		data: function(data) {
			this._data = (null != data) ? data : [];
			return this;
		},

		color: function(colorFn) {
			this.options.color = colorFn;
			return this;
		},

		radius: function(radiusFn) {
			this.options.radius = radiusFn;
			return this;
		},

    render: function(value) {

      var canvas  = this.getCanvas(),
          context = canvas.getContext('2d'),
          that    = this;

      var data = this._data
      .filter(function(d) {
        return d.properties.pop_1860 > 10;
      })
      .map(function(d) {
        var point = that._project(d);
        d.x = point[0];
        d.y = point[1];
        return d;
      });

    /*
    d3.timer(function(t) {

      if (t < 1500) return false;
      t = (t-1500) % 24000;

      if (t > 22000) return false;
      if (t > 10000 && t < 12000) return false;
      if (t > 12000) t = 22000 - t;

      var frame = Math.floor(t/2500);

      context.clearRect(0,0,that._map._container.offsetWidth,that._map._container.offsetHeight);

      d3.select("#year").text(1820 + Math.round(ease(t%2500/2500)*10 + Math.floor(t/2500)*10));

      // avoid bug
      if (frame > 3 || frame < 0) return false;

      transitions[frame](ease((t%2500)/2500)).forEach(function(d,i) {
        context.fillStyle = color(d);
        context.beginPath();
        context.arc(data[i].x, data[i].y, radius(Math.abs(d)), 0, 2*Math.PI);
        context.fill();
      });
    });
    */

    context.clearRect(0,0,that._map._container.offsetWidth,that._map._container.offsetHeight);

    data.forEach(function(d) {
      context.fillStyle = color(d.value);
      context.beginPath();
      context.arc(d.x, d.y, radius(Math.abs(d.value)), 0, 2*Math.PI);
      context.fill();
    });

  },

  // Copied from leaflet.js, and modified to remove rounding.
  // This will generate floating point screen coordinates, instead of integers.
  latLngToLayerPoint: function (latlng) {
    //var projectedPoint = this.project(L.latLng(latlng))._round();
    var projectedPoint = this._map.project(L.latLng(latlng));
    return projectedPoint._subtract(this._map.getPixelOrigin());
  },

  // Copied from leaflet.js, but unchanged.
  latLngToContainerPoint: function (latlng) {
    return this._map.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
  },

  _project : function(obj) {
    // Calling locally modified function to return floating point screen coords.
    var point = this.latLngToContainerPoint([obj.properties.lat, obj.properties.long]);
    //var point = this._map.latLngToContainerPoint([obj.lat, obj.long]);
    return [point.x, point.y];
  }
  
}))(arguments[0]);

    return out;
  };

  //
  // If none of those, add it to Window
  //
  if (typeof define !== "function" && typeof window === "object") {
    if (!window.STMN) {
      window.STMN = {};
    }
    window.STMN.CircleLayer = CircleLayer;
  }

}());
