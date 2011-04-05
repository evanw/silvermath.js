function Range(container, indexA, indexB) {
	var a = createAnchor(container).setIndex(indexA);
	var b = createAnchor(container).setIndex(indexB);

	// Move down the anchor chain until the anchors diverge
	while (a.childAnchor && b.childAnchor && a.depthEquals(b)) {
		a = a.childAnchor;
		b = b.childAnchor;
	}

	// Remember the root container so we can update the anchor count when things change
	this.root = container;

	// Cursors are both in the same Container (which should be pointed to by both a.node and b.node because of a.depthEquals(b))
	this.container = a.node;

	// Make sure a comes before b
	if (a.index > b.index) {
		var temp;
		temp = a; a = b; b = temp;
		temp = indexA; indexA = indexB; indexB = temp;
	}

	// Calculate the bounds of the range as indices into this.container.children
	this.lo = a.betweenIndex;
	this.hi = b.betweenIndex + (b.childAnchor ? 1 : 0);

	// Remember the indices so they can be queried later when they change
	this.minIndex = indexA - a.index + totalAnchorCount(this.container, 0, this.lo);
	this.maxIndex = this.minIndex + totalAnchorCount(this.container, this.lo, this.hi);
}

Range.prototype.equals = function(other) {
	return this.container == other.container && this.lo == other.lo && this.hi == other.hi;
};

Range.prototype.getBox = function() {
	var box = this.container.box;
	var loX = (this.lo < this.container.children.length) ? this.container.children[this.lo].box.x : box.x + box.width;
	var hiX = (this.hi < this.container.children.length) ? this.container.children[this.hi].box.x : box.x + box.width;
	return new Box(loX, box.y, hiX - loX, box.heightAboveMidline, box.heightBelowMidline);
};

Range.prototype.replaceNodes = function(nodes) {
	var lo = this.container.children.slice(0, this.lo);
	var hi = this.container.children.slice(this.hi);
	this.container.children = lo.concat(nodes, hi);
	this.hi = this.lo + nodes.length;
	this.root.updateAnchorCount();
	this.maxIndex = this.minIndex + totalAnchorCount(this.container, this.lo, this.hi);
};

function totalAnchorCount(container, lo, hi) {
	var total = 0;
	for (var i = lo; i < hi; i++) {
		total += container.children[i].anchorCount + 1;
	}
	return total;
}
