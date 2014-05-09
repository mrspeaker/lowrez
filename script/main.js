(function () {

	"use strict";

	var main = {

		funcs: [],

		init: function () {

			this.canvas = document.querySelector("#board");
			this.ctx = this.canvas.getContext("2d");
			this.w = this.canvas.width;
			this.h = this.canvas.height;
			this.imgData = this.ctx.createImageData(this.w, this.h);

			this.env = {
				w: this.w,
				h: this.h,
				time: 0
			};

			var env = this.env;

			// "Shaders"
			this.funcs.push(

				// Clear
				function (val, p) {
					return 0;
				},

				// Circles
				function (val, p) {
					var xo = (env.w / 2) - p.x + (Math.sin(env.time / 100) * 7),
						yo = (env.h / 2) - p.y + (Math.cos(env.time / 100) * 7),
						dist = Math.sqrt(xo * xo + yo * yo);

					var outer = dist > (Math.abs(Math.sin(env.time / 100))) * 15 ? 60 : 0;
					var inner = dist * 1.5 > (Math.abs(Math.sin(env.time / 150))) * 30 ? 60 : 0;

					return val + ((outer + inner) / 2);
				},

				// Waves
				function (val, p) {
					return val + (p.x * ((p.idx + (env.time / 3 | 0)) % 10) + p.y) * 0.5;
				},

				// Sine swishy
				function (val, p) {
					var siney = (p.x * (Math.sin(env.time / 30) * 3)) + (p.y * (Math.cos(env.time / 50) * 2));
					var siney1 = siney + (p.x * (Math.sin(env.time / 50) * 3)) + (p.y * (Math.cos(env.time / 100) * 2))
					return val + siney1;
				},

				// Sine dot
				function (val, p) {
					return val + ((p.x == (env.time / 5 % 32 | 0) &&
						p.y == 16 + (Math.sin(env.time / 8) * 8 | 0)) ?
							255 : 0);
				},

				// Sine dot stalker
				function (val, p) {
					return val + ((p.x == ((env.time - 4) / 5 % 32 | 0) &&
						p.y == 16 + (Math.sin((env.time - 4) / 8) * 8 | 0)) ?
							100 : 0);
				}

			);

			this.run();

		},

		run: function () {
			this.update();
			this.render();
			setTimeout(function () {
				this.run();
			}.bind(this), 16);
		},

		putPixel: function (col, x, y) {

			var idx = (y * this.w + x) * 4,
				img = this.imgData.data;

			col = Math.min(255, Math.max(0, col));

			img[idx] = col;
			img[idx + 1] = col;
			img[idx + 2] = col;
			img[idx + 3] = 255;

		},

		update: function () {

			var self = this,
				img = this.imgData.data;

			// Set up the field
			for (var i = 0; i < this.h; i++) {
				for (var j = 0; j < this.w; j++) {
					var index = (j + (i * this.w)) * 4;

					var mixed = this.funcs.reduce(function (ac, f) {
						return f(
							ac,
							{idx: index, x: j, y: i, xr: j / 32, yr: j / 32}
						);
					}, img[index]);

					self.putPixel(mixed, j, i);

				}
			}

			this.env.time++;
		},

		render: function () {

			this.ctx.putImageData(this.imgData, 0, 0);

		}

	};

	window.main = main;

}());
