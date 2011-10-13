function Container() {
	this.box = new Box();
	this.children = [];
	this.anchorCount = 0;
}

Container.prototype.updateAnchorCount = function() {
	this.anchorCount = this.children.length + 1;
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].updateAnchorCount();
		this.anchorCount += this.children[i].anchorCount;
	}
};

Container.prototype.calculateSize = function(renderer) {
	this.box.width = 0;
	this.box.heightAboveMidline = 0;
	this.box.heightBelowMidline = 0;
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		child.calculateSize(renderer, this, i);
		this.box.width += child.box.width;
		this.box.heightAboveMidline = Math.max(this.box.heightAboveMidline, child.box.heightAboveMidline);
		this.box.heightBelowMidline = Math.max(this.box.heightBelowMidline, child.box.heightBelowMidline);
	}
	
	// If the container is empty, leave some height for the cursor
	if (this.children.length == 0) {
		var size = renderer.measureText(' ');
		this.box.heightAboveMidline = size.heightAboveMidline;
		this.box.heightBelowMidline = size.heightBelowMidline;
	}
};

Container.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		child.layout(x, y + this.box.heightAboveMidline - child.box.heightAboveMidline);
		x += child.box.width;
	}
};

Container.prototype.render = function(renderer) {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].render(renderer);
	}
};
