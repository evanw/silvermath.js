function ContainerAnchor(node) {
	this.node = node;
	this.index = null;
	this.childAnchor = null;
	this.betweenIndex = null;
}

ContainerAnchor.prototype.setIndex = function(index) {
	this.index = index;
	
	// An anchor instance if index is inside a child, otherwise null (in which case index is between two children)
	this.childAnchor = null;
	
	for (var i = 0; i < this.node.children.length; i++) {
		var node = this.node.children[i];
		if (index-- <= 0) {
			break;
		} else if (index < node.anchorCount) {
			this.childAnchor = createAnchor(node);
			this.childAnchor.setIndex(index);
			break;
		} else {
			index -= node.anchorCount;
		}
	}
	
	// The index of the anchor if index is between two children (only relevant if childAnchor == null)
	this.betweenIndex = i;
};

ContainerAnchor.prototype.getCursorBox = function() {
	if (this.childAnchor) {
		return this.childAnchor.getCursorBox();
	}

	var x;
	if (this.betweenIndex < this.node.children.length) {
		x = this.node.children[this.betweenIndex].box.x;
	} else {
		x = this.node.box.x + this.node.box.width;
	}
	return new Box(x, this.node.box.y, 0, this.node.box.heightAboveMidline, this.node.box.heightBelowMidline);
};

ContainerAnchor.prototype.setIndexFromPoint = function(x, y) {
	var index = 0;
	for (var i = 0; i < this.node.children.length; i++) {
		var node = this.node.children[i];
		if (x < node.box.x + node.box.width) {
			var anchor = createAnchor(node);
			if (anchor != null && x > node.box.x + 2 && x < node.box.x + node.box.width - 2) {
				anchor.setIndexFromPoint(x, y);
				index += anchor.index + 1;
			} else if (x > node.box.x + node.box.width / 2) {
				index += node.anchorCount + 1;
			}
			break;
		}
		index += node.anchorCount + 1;
	}
	this.setIndex(index);
};

ContainerAnchor.prototype.depthEquals = function(other) {
	return other instanceof ContainerAnchor && this.betweenIndex == other.betweenIndex &&
		(this.childAnchor == other.childAnchor || this.childAnchor.depthEquals(other.childAnchor));
};
