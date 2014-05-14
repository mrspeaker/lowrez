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
			let shaders = [

				// Clear
				() => 0,

				// Noise
				// (val) => val + Math.random() * 0.4,

				// Sin/cos swishy
				(val, {xr, yr}, {t}) => {
					let {sin, cos} = Math,
						s = val;
					s += sin(xr * cos(t / 300) * 80) + cos(yr * cos(t / 300) * 10);
					s += sin(yr * sin(t / 200) * 40) + cos(xr * sin(t / 500) * 40);
					s += sin(xr * sin(t / 100) * 10) + sin(yr * sin(t / 600) * 80);
					s *= sin(t / 200) * 0.5;
					return s;
				},

				// Waves
				(val, {x, y, idx}, {t}) => val + (x * ((idx + (t / 3 | 0)) % 10) + y) * 0.0002,

				// Circles
				(val, {xr, yr}, {t}) => {
					let {sin, cos, abs, hypot} = Math,
						xo = 0.5 - xr + (sin(t / 100) / 3),
						yo = 0.5 - yr + (cos(t / 80) / 3),
						dist = hypot(xo, yo);

					let outer = dist * 2.3 < (abs(sin(t / 100))) * 0.7 ? 0.3 : 0;
					let inner = dist * 2.7 < (abs(sin(t / 100))) * 0.6 ? 0.8 : 0;

					return val + ((outer + inner) / 2);
				},

				// Sine dot
				(val, {x, y}, {w, t}) => (
					(x == (t / 5 % (w * 2) | 0)) &&
					(y == 16 + (Math.sin(t / 8) * 8 | 0))
					? 1 : val),

				// Sine dot stalker
				(val, {x, y}, {w, t}) => (
					(x == ((t - 4) / 5 % (w * 2) | 0)) &&
					(y == 16 + (Math.sin((t - 4) / 8) * 8 | 0))
					? 0.8 : val)

			];

			this.funcs.push(...shaders);

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

		putPixel: function (col = 0, x = 0, y = 0) {
			let idx = (y * this.w + x) * 4,
				img = this.imgData.data;

			img[idx] = col * 0.5;
			img[idx + 1] = col;
			img[idx + 2] = col * 0.5;
			img[idx + 3] = 255;
		},

		update: function () {
			let {imgData, env, w, h} = this,
				img = imgData.data,
				clamp = (v) => Math.min(1, Math.max(0, v));

			for (let {x, y} of matrix(w, h)) {

				let idx = (x + (y * w)) * 4,
					pos = { idx: idx, x: x, y: y, xr: x / w, yr: y / h };

				let mixed = this.funcs.slice(0, 2).reduce((ac, f) => f(
					clamp(ac),
					pos,
					env
				), img[idx]);

				this.putPixel(clamp(mixed) * 255, x, y);

			}

			env.t++;
		},

		render: function () {
			this.ctx.putImageData(this.imgData, 0, 0);
		}

	};

	window.main = main;

	function* range(from, to) {
		let i = from;
		while (i < to) {
			yield i++;
		}
	}

	function* matrix(w, h) {
		for (let y of range(0, h))
			for (let x of range(0, w))
				yield {x: x, y: y};
	}

}());

// Possibly - matrix of any dimenstions? with ...dimestions param

//let matrix = (w, h) => (for (y of range(0, h)) for (x of range(0, w)) {x: x, y: y});
