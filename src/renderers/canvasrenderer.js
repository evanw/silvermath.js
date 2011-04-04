function CanvasRenderer(canvasElement) {
	this._context = canvasElement.getContext('2d');
	this.fontStyle = 0;
	this.fontSize = 18;
	this.subpixel = false;
}

CanvasRenderer.prototype.begin = function(width, height) {
	this._context.canvas.width = this.subpixel ? width * 3 : width;
	this._context.canvas.height = height;
	this._context.save();
	if (this.subpixel) this._context.scale(3, 1);
	this._context.clearRect(0, 0, width, height);
};

CanvasRenderer.prototype.drawText = function(text, x, y) {
	this._context.font = cssFont(this.fontStyle, this.fontSize);
	this._context.textBaseline = 'middle';
	this._context.fillStyle = 'black';
	this._context.fillText(text, x, y + this.measureText(text).heightAboveMidline);
};

CanvasRenderer.prototype.measureText = function(text) {
	this._context.font = cssFont(this.fontStyle, this.fontSize);
	return {
		width: this._context.measureText(text).width,
		heightAboveMidline: this.fontSize * 0.45,
		heightBelowMidline: this.fontSize * 0.55
	};
};

CanvasRenderer.prototype.drawLine = function(x1, y1, x2, y2) {
	this._context.strokeStyle = 'black';
	this._context.beginPath();
	this._context.lineTo(x1 + 0.5, y1 + 0.5);
	this._context.lineTo(x2 + 0.5, y2 + 0.5);
	this._context.stroke();
};

CanvasRenderer.prototype.drawRect = function(x, y, w, h) {
	this._context.fillStyle = '#BFDFFF';
	this._context.fillRect(x, y, w, h);
};

CanvasRenderer.prototype.end = function() {
	if (this.subpixel) {
		var oldData = this._context.getImageData(0, 0, this._context.canvas.width, this._context.canvas.height);
		var newData = this._context.createImageData(oldData.width / 3, oldData.height);
		for (var y = 0, i = 0; y < newData.height; y++) {
			for (var x = 0; x < newData.width; x++, i++) {
				for (var c = 0; c < 3; c++) {
					var j = i * 12 + c * 4 + 3;
					newData.data[i * 4 + c] = 255 - ((x > 0 ? oldData.data[j - 4] : 0) + oldData.data[j] + (x < newData.width - 1 ? oldData.data[j + 4] : 0)) / 3;
				}
				newData.data[i * 4 + 3] = 255;
			}
		}
		this._context.restore();
		this._context.canvas.width = newData.width;
		this._context.putImageData(newData, 0, 0);
	}
};

exports['CanvasRenderer'] = CanvasRenderer;
