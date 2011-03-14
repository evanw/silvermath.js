function Box(x, y, width, heightAboveMidline, heightBelowMidline) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.heightAboveMidline = heightAboveMidline;
	this.heightBelowMidline = heightBelowMidline;
}

Box.prototype.getHeight = function() {
	return this.heightAboveMidline + this.heightBelowMidline;
};
