(function() {
  "use strict";

  //
  // If this is a CommonJS module
  //
  if (typeof module === "object" && module.exports) {
    var d3          = require("d3");
    var colorbrewer = require("colorbrewer");
  }

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

    var ease = d3.ease("cubic");

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
            that    = this,
            //[t,r,b,l]
            bounds = [-that._map._container.offsetHeight * 0.5, that._map._container.offsetWidth * 1.5, that._map._container.offsetHeight * 1.5, -that._map._container.offsetWidth * 0.5 ];
        var data = this._data
        .map(function(d) {
          var point = that._project(d);
          if (point[0] < bounds[3] || point[0] > bounds[1] || point[1] < bounds[0] || point[1] > bounds[2]) {
            return null;
          }
          d.x = point[0];
          d.y = point[1];
          return d;
        }).filter(function(d) {
          return (d === null) ? false : true;
        })

        context.clearRect(0, 0, that._map._container.offsetWidth, that._map._container.offsetHeight);
        data.forEach(function(d) {
          context.fillStyle = that.options.color(d.value);
          context.beginPath();
          context.arc(d.x, d.y, that.options.radius(Math.abs(d.value)), 0, 2*Math.PI);
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
  // If this is a CommonJS module
  //
  if (typeof module === "object" && module.exports) {
    module.exports = CircleLayer;
  }

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