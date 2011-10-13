function Character(text, fontStyle) {
	this.box = new Box();
	this.text = text;
	this.fontStyle = fontStyle;
	this.padding = 0;
}

Character.prototype.anchorCount = 0;

Character.prototype.updateAnchorCount = function() {
};

Character.prototype.calculateSize = function(renderer, parent, parentIndex) {
	renderer.fontStyle = this.fontStyle;
	var size = renderer.measureText(this.text);
	this.box.width = size.width;
	this.box.heightAboveMidline = size.heightAboveMidline;
	this.box.heightBelowMidline = size.heightBelowMidline;

	this.padding = 0;
	if (this.text == '+' || this.text == Symbol.minus) {
		// Search for the previous character in case it's a left bracket
		if (parentIndex > 0) {
			this.padding = 10;
			var prev = parent.children[parentIndex - 1];
			if (prev instanceof Character && (prev.text in LEFT_BRACKETS || prev.text == ',' || prev.text == '=')) {
				this.padding = 0;
			}
		}
	} else if (this.text in RIGHT_BRACKETS) {
		// Try to pair each closing bracket with its opening bracket
		var depth = 0;
		var maxHeight = Math.max(this.box.heightAboveMidline, this.box.heightBelowMidline);
		for (var i = parentIndex; i >= 0; i--) {
			var child = parent.children[i];
			maxHeight = Math.max(maxHeight, child.box.heightAboveMidline);
			maxHeight = Math.max(maxHeight, child.box.heightBelowMidline);
			if (child instanceof Character) {
				if (child.text in LEFT_BRACKETS) {
					if (--depth == 0) {
						this.box.heightAboveMidline = child.box.heightAboveMidline = maxHeight;
						this.box.heightBelowMidline = child.box.heightBelowMidline = maxHeight;
						break;
					}
				} else if (child.text in RIGHT_BRACKETS) {
					depth++;
				}
			}
		}
	} else if (this.text == '=') {
		this.padding = 10;
	} else if (this.text == ',') {
		this.box.width += 10;
	} else if (this.text == Symbol.times) {
		this.padding = 5;
	} else if (this.text == Symbol.cdot) {
		this.padding = 2;
	}
	this.box.width += 2 * this.padding;
};

Character.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
};

Character.prototype.render = function(renderer) {
	renderer.fontStyle = this.fontStyle;
	var size = renderer.measureText(this.text);
	renderer._context.save();
	renderer._context.translate(this.box.x + this.padding, this.box.y);
	renderer._context.scale(1, this.box.getHeight() / (size.heightAboveMidline + size.heightBelowMidline));
	renderer.drawText(this.text, 0, 0);
	renderer._context.restore();
};
