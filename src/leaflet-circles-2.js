(function() {
  "use strict";

  function CircleLayer() {
    var out = new (L.CanvasLayer.extend({
        _data: [],

    options: {
      color: function(d) { return "#444"; },
      radius: function(d) { return 2; },
      width: 1280,
      height: 800
    },

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

    render: function() {
      var that = this;
      var canvas = this.getCanvas();
      var ctx = canvas.getContext('2d');

      if (this._data.length < 1) return;

      var data = this._data.map(function(d) {
				var point = that._project(d);
				return {point: point, d: d};
			});

      ctx.clearRect(0,0,this._map._container.offsetWidth,this._map._container.offsetHeight);

      data.forEach(function(d) {
        ctx.fillStyle = that.options.color(d.d);
        ctx.beginPath();
        ctx.arc(d.point[0], d.point[1], that.options.radius(d.d), 0, 2*Math.PI);
        ctx.fill();
      });
    },

		_project : function(obj) {
			var point = this._map.latLngToContainerPoint([obj.lat, obj.long]);
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
