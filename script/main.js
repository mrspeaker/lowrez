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
				(val, p) => 0,

				// Sin/cos swishy
				(val, p, e) => {
					let {t} = e
					let s = val
					s += (p.x * (Math.sin(t / 30) * 3)) + (p.y * (Math.cos(t / 50) * 2));
					s += (p.x * (Math.sin(t / 50) * 3)) + (p.y * (Math.cos(t / 100) * 2))
					return s;
				},

				// Circles
				(val, p, e) => {
					let xo = (e.w / 2) - p.x + (Math.sin(e.t / 100) * 7),
						yo = (e.h / 2) - p.y + (Math.cos(e.t / 100) * 7),
						dist = Math.hypot(xo, yo);

					let outer = dist > (Math.abs(Math.sin(e.t / 100))) * 15 ? 60 : 0;
					let inner = dist * 1.5 > (Math.abs(Math.sin(e.t / 150))) * 30 ? 60 : 0;

					return val + ((outer + inner) / 2);
				},

				// Waves
				(val, p, e) => val + (p.x * ((p.idx + (e.t / 3 | 0)) % 10) + p.y) * 0.1,

				// Sine dot
				(val, p, e) => (
					(p.x == (e.t / 5 % e.w | 0)) &&
					(p.y == 16 + (Math.sin(e.t / 8) * 8 | 0))
					? 255 : val),

				// Sine dot stalker
				(val, p, e) => (
					(p.x == ((e.t - 4) / 5 % e.w | 0)) &&
					(p.y == 16 + (Math.sin((e.t - 4) / 8) * 8 | 0))
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
