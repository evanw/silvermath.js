function FractionAnchor(node) {
	this.node = node;
	this.index = null;
	this.childAnchor = null;
}

FractionAnchor.prototype.setIndex = function(index) {
	this.index = index;
	
	if (index < this.node.top.anchorCount) {
		this.childAnchor = createAnchor(this.node.top).setIndex(index);
	} else {
		this.childAnchor = createAnchor(this.node.bottom).setIndex(index - this.node.top.anchorCount);
	}

	// Allow chaining
	return this;
};

FractionAnchor.prototype.setIndexFromPoint = function(x, y) {
	if (y < this.node.box.y + this.node.box.heightAboveMidline) {
		this.childAnchor = createAnchor(this.node.top);
		this.childAnchor.setIndexFromPoint(x, y);
		this.index = this.childAnchor.index;
	} else {
		this.childAnchor = createAnchor(this.node.bottom);
		this.childAnchor.setIndexFromPoint(x, y);
		this.index = this.node.top.anchorCount + this.childAnchor.index;
	}
};

FractionAnchor.prototype.depthEquals = function(other) {
	return other instanceof FractionAnchor && this.childAnchor.node == other.childAnchor.node;
};
