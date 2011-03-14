function ContainerAnchor(container) {
	this.index = null;
	this.childAnchor = null;
	this.container = container;
	this.betweenIndex = null;
}

ContainerAnchor.prototype.setIndex = function(index) {
	this.index = index;
	
	// An anchor instance if index is inside a child, otherwise null (in which case index is between two children)
	this.childAnchor = null;
	
	for (var i = 0; i < this.container.children.length; i++) {
		var node = this.container.children[i];
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

ContainerAnchor.prototype.renderCursor = function(renderer) {
	if (this.childAnchor) {
		this.childAnchor.renderCursor(renderer);
	} else {
		var x;
		if (this.betweenIndex < this.container.children.length) {
			x = this.container.children[this.betweenIndex].box.x;
		} else {
			x = this.container.box.x + this.container.box.width;
		}
		renderer.drawLine(x, this.container.box.y, x, this.container.box.y + this.container.box.getHeight());
	}
};

ContainerAnchor.prototype.setIndexFromPoint = function(x, y) {
	var index = 0;
	for (var i = 0; i < this.container.children.length; i++) {
		var node = this.container.children[i];
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
