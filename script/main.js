(function () {

	"use strict";

	var main = {

		init: function () {

			this.canvas = document.querySelector("#board");
			this.ctx = this.canvas.getContext("2d");
			this.w = this.canvas.width;
			this.h = this.canvas.height;
			this.imgData = this.ctx.createImageData(this.w, this.h);

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

			img[idx] = col;
			img[idx + 1] = col;
			img[idx + 2] = col;
			img[idx + 3] = 255;

		},

		update: function () {

			// Set up the field
			for (var i = 0; i < this.h; i++) {
				for (var j = 0; j < this.w; j++) {
					var index = (j + (i * this.w)) * 4;
					this.putPixel(i * ((index + (Date.now() / 100 | 0)) % 10) + j, j, i);
				}
			}

			// Set up the man
			this.putPixel(255, Date.now() / 100 % 32 | 0, 16 + Math.sin(Date.now() / 200) * 8 | 0);
		},

		render: function () {

			this.ctx.putImageData(this.imgData, 0, 0);

		}

	};

	main.init();

}());
