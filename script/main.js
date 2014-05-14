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

			let add = ([r,g,b], c) => [r + c, g + c, b + c];

			// "Shaders"
			let shaders = [

				// Clear
				() => [0, 0, 0],

				// Noise
				//(val) => add(val, Math.random() * 0.2),

				// Sin/cos swishy
				([r, g, b], {xr, yr}, {t}) => {
					let {sin, cos} = Math,
						s = 0;

					s += sin(xr * cos(t / 300) * 80) + cos(yr * cos(t / 300) * 10);
					s += sin(yr * sin(t / 200) * 40) + cos(xr * sin(t / 500) * 40);
					s += sin(xr * sin(t / 100) * 10) + sin(yr * sin(t / 600) * 80);
					s *= sin(t / 200) * 0.5;

					return [r + s, g + (s * 0.5), b + (sin(s + t / 30) * 0.75)];
				},

				// Waves
				// (val, {x, y, idx}, {t}) => add(val, (x * ((idx + (t / 3 | 0)) % 15) + y) * 0.0002),

				// Circles
				(val, {xr, yr}, {t}) => {
					let {sin, cos, abs, hypot} = Math,
						xo = 0.5 - xr + (sin(t / 100) / 3) * 2,
						yo = 0.5 - yr + (cos(t / 80) / 3) * 2,
						dist = hypot(xo, yo);

					let outer = dist * 2.3 < (abs(sin(t / 100))) * 0.7 ? 0.3 : 0;
					let inner = dist * 2.7 < (abs(sin(t / 100))) * 0.6 ? 0.8 : 0;

					return add(val, ((outer + inner) / 2));
				},

				/*
				// Sine dot
				(val, {x, y}, {w, h, t}) => (
					(x == (t / 5 % (w * 2) | 0)) &&
					(y == h / 2 + (Math.sin(t / 8) * 8 | 0))
					? [1, 1, 1] : val),

				// Sine dot stalker
				(val, {x, y}, {w, h, t}) => (
					(x == ((t - 4) / 5 % (w * 2) | 0)) &&
					(y == h / 2 + (Math.sin((t - 2) / 8) * 8 | 0))
					? [0.8, 0.8, 0.8] : val)
				*/

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

		putPixel: function ([r,g,b], x = 0, y = 0) {
			let idx = (y * this.w + x) * 4,
				img = this.imgData.data;

			img[idx] = r;
			img[idx + 1] = g;
			img[idx + 2] = b;
			img[idx + 3] = 255;
		},

		update: function () {
			let {imgData, env, w, h} = this,
				img = imgData.data,
				clamp = (v) => Math.min(1, Math.max(0, v)),
				scale = (v) => v * 255;

			for (let {x, y} of matrix(w, h)) {

				let idx = (x + (y * w)) * 4,
					pos = { idx: idx, x: x, y: y, xr: x / w, yr: y / h };

				let mixed = this.funcs.reduce((ac, f) => f(
					ac.map(clamp),
					pos,
					env
				), [img[idx], img[idx + 1], img[idx + 2]]);

				this.putPixel(mixed.map(clamp).map(scale), x, y);

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
