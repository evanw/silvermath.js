function Symbol(text, fontStyle) {
	this.box = new Box();
	this.text = text;
	this.fontStyle = fontStyle;
}

Symbol.prototype.anchorCount = 0;

Symbol.prototype.updateAnchorCount = function() {
};

Symbol.prototype.calculateSize = function(renderer) {
	renderer.fontStyle = this.fontStyle;
	var size = renderer.measureText(this.text);
	this.box.width = size.width;
	this.box.heightAboveMidline = size.heightAboveMidline;
	this.box.heightBelowMidline = size.heightBelowMidline;
};

Symbol.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
};

Symbol.prototype.render = function(renderer) {
	renderer.fontStyle = this.fontStyle;
	renderer.drawText(this.text, this.box.x, this.box.y);
};
