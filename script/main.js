(function () {

	"use strict";

	var main = {

		funcs: [],

		init: function () {

			this.initCanvas();

			this.env = {
				w: this.w,
				h: this.h,
				t: 0
			};

			// "Shaders"
			this.funcs.push(

				// Clear
				() => 0,

				// Sin/cos swishy
				(val, {x, y}, {t}) => {
					let {sin, cos} = Math,
						s = val;
					s += (x * (sin(t / 30) * 3)) + (y * (cos(t / 50) * 2));
					s += (x * (sin(t / 50) * 3)) + (y * (cos(t / 100) * 2))
					return s;
				},

				// Circles
				(val, p, {w, h, t}) => {
					let {sin, cos, abs, hypot} = Math,
						xo = (w / 2) - p.x + (sin(t / 100) * 7),
						yo = (h / 2) - p.y + (cos(t / 100) * 7),
						dist = hypot(xo, yo);

					let outer = dist > (abs(sin(t / 100))) * 15 ? 60 : 0;
					let inner = dist * 1.5 > (abs(sin(t / 150))) * 30 ? 60 : 0;

					return val + ((outer + inner) / 2);
				},

				// Waves
				(val, p, {t}) => val + (p.x * ((p.idx + (t / 3 | 0)) % 10) + p.y) * 0.1,

				// Sine dot
				(val, p, {w, t}) => (
					(p.x == (t / 5 % w | 0)) &&
					(p.y == 16 + (Math.sin(t / 8) * 8 | 0))
					? 255 : val),

				// Sine dot stalker
				(val, p, {w, t}) => (
					(p.x == ((t - 4) / 5 % w | 0)) &&
					(p.y == 16 + (Math.sin((t - 4) / 8) * 8 | 0))
					? 100 : val)

			);

			this.run();

		},

		initCanvas: function () {
			this.canvas = document.querySelector("#board");
			this.ctx = this.canvas.getContext("2d");
			this.w = this.canvas.width;
			this.h = this.canvas.height;
			this.imgData = this.ctx.createImageData(this.w, this.h);
		},

		run: function () {
			this.update();
			this.render();
			setTimeout(() => this.run(), 16);
		},

		putPixel: function (col, x, y) {
			let idx = (y * this.w + x) * 4,
				img = this.imgData.data;

			col = Math.min(255, Math.max(0, col));

			img[idx] = col;
			img[idx + 1] = col;
			img[idx + 2] = col;
			img[idx + 3] = 255;
		},

		update: function () {
			let {imgData, env, w, h} = this,
				img = imgData.data;

			// Set up the field
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					let idx = (x + (y * w)) * 4,
						data = { idx: idx, x: x, y: y, xr: x / w, yr: y / h };

					let mixed = this.funcs.reduce((ac, f) => f(
						Math.min(255, Math.max(0, ac)),
						data,
						env
					), img[idx]);

					this.putPixel(mixed, x, y);
				}
			}

			env.t++;
		},

		render: function () {
			this.ctx.putImageData(this.imgData, 0, 0);
		}

	};

	window.main = main;

}());
