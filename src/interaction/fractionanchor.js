function FractionAnchor(fraction) {
	this.index = null;
	this.childAnchor = null;
	this.fraction = fraction;
}

FractionAnchor.prototype.setIndex = function(index) {
	this.index = index;
	
	if (index < this.fraction.top.anchorCount) {
		this.childAnchor = createAnchor(this.fraction.top);
		this.childAnchor.setIndex(index);
	} else {
		this.childAnchor = createAnchor(this.fraction.bottom);
		this.childAnchor.setIndex(index - this.fraction.top.anchorCount);
	}
};

FractionAnchor.prototype.renderCursor = function(renderer) {
	this.childAnchor.renderCursor(renderer);
};

FractionAnchor.prototype.setIndexFromPoint = function(x, y) {
	if (y < this.fraction.box.y + this.fraction.box.heightAboveMidline) {
		this.childAnchor = createAnchor(this.fraction.top);
		this.childAnchor.setIndexFromPoint(x, y);
		this.index = this.childAnchor.index;
	} else {
		this.childAnchor = createAnchor(this.fraction.bottom);
		this.childAnchor.setIndexFromPoint(x, y);
		this.index = this.fraction.top.anchorCount + this.childAnchor.index;
	}
};
