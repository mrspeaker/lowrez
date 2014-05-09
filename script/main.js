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

			// "Shader"
			this.funcs.push(function (val, p) {
				var xo = (env.w / 2) - p.x,
					yo = (env.h / 2) - p.y,
					dist = Math.sqrt(xo * xo + yo * yo);

				var outer = dist > (env.time / 4 % 32) ? 60 : 0;
				var inner = dist < (((env.time / 4 + 9)) % 32) ? 30 : 0;
				var waves = (p.x * ((p.idx + (env.time / 3 | 0)) % 10) + p.y) * 0.5;

				return waves - outer + inner;
			});

			this.run();

		},

		run: function () {
			this.update();
			this.render();
			setTimeout(function () {
				this.run();
			}.bind(this), 16);
		},

		putPix: function (col, x, y) {

			var xx = x * 32,
				yy = y * 32,
				idx = Math.round(yy * this.w + xx) * 4,
				img = this.imgData.data;

			img[idx] = col;
			img[idx + 1] = col;
			img[idx + 2] = col;
			img[idx + 3] = 255;

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
				data = this.imgData.data;

			// Set up the field
			for (var i = 0; i < this.h; i++) {
				for (var j = 0; j < this.w; j++) {
					var index = (j + (i * this.w)) * 4,
						val;

					this.funcs.forEach(function (f) {
						self.putPixel(f(val, {idx: index, x: j, y: i, xr: j / 32, yr: j / 32}), j, i);
					});

					//val = data[index];
				}
			}

			// Set up the man
			this.putPixel(255, Date.now() / 100 % 32 | 0, 16 + Math.sin(Date.now() / 200) * 8 | 0);

			this.env.time++;
		},

		render: function () {

			this.ctx.putImageData(this.imgData, 0, 0);

		}

	};

	window.main = main;

}());
