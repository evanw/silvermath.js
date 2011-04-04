function Fraction() {
	this.box = new Box();
	this.top = new Container();
	this.bottom = new Container();
	this.anchorCount = 0;
}

Fraction.prototype.updateAnchorCount = function() {
	this.top.updateAnchorCount();
	this.bottom.updateAnchorCount();
	this.anchorCount = this.top.anchorCount + this.bottom.anchorCount;
};

Fraction.prototype.calculateSize = function(renderer) {
	this.top.calculateSize(renderer);
	this.bottom.calculateSize(renderer);
	this.box.width = Math.max(this.top.box.width, this.bottom.box.width) + 8;
	this.box.heightAboveMidline = this.top.box.getHeight() + 2;
	this.box.heightBelowMidline = this.bottom.box.getHeight() + 4;
};

Fraction.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
	this.top.layout(x + Math.floor(this.box.width / 2 - this.top.box.width / 2), y);
	this.bottom.layout(x + Math.floor(this.box.width / 2 - this.bottom.box.width / 2), y + this.box.heightAboveMidline + 4);
};

Fraction.prototype.render = function(renderer) {
	this.top.render(renderer);
	this.bottom.render(renderer);
	renderer.drawLine(this.box.x + 2, this.box.y + this.box.heightAboveMidline, this.box.x + this.box.width - 2, this.box.y + this.box.heightAboveMidline);
};
