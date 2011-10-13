function EquationCore() {
	this.container = new Container();
	this.cursorIndex = 0;
	this.selectionIndex = 0;
	this.isKeyboardSelect = false;
}

EquationCore.prototype.setContainer = function(container) {
	container.updateAnchorCount();
	this.container = container;
	this.cursorIndex = 0;
	this.selectionIndex = 0;
};

EquationCore.prototype.getLastIndex = function() {
	return this.container.anchorCount - 1;
};

EquationCore.prototype.mousePressed = function(x, y) {
	this.cursorIndex = this.selectionIndex = this.cursorIndexFromPoint(x, y);
};

EquationCore.prototype.mouseDragged = function(x, y) {
	this.cursorIndex = this.cursorIndexFromPoint(x, y);
};

EquationCore.prototype.mouseReleased = function(x, y) {
	this.cursorIndex = this.cursorIndexFromPoint(x, y);
};

EquationCore.prototype.insertSymbol = function(text) {
	// Special-case some symbols
	var useLetterFont = /^[^0-9=\+\-\*\/\(\)\{\}\[\]]+$/.test(text);
	if (text == '-') text = Symbol.minus;
	else if (text == '*') text = Symbol.cdot;

	// Replace the selection with a new symbol
	var symbol = new Character(text, useLetterFont ? SERIF | ITALIC : SANS_SERIF);
	var range = new Range(this.container, this.cursorIndex, this.selectionIndex);
	range.replaceNodes([ symbol ]);
	this.cursorIndex = this.selectionIndex = range.maxIndex;
};

EquationCore.prototype.moveCursorAbsolute = function(index) {
	// Set the cursor, which is also the end of the selection
	this.cursorIndex = index;

	// If we are selecting with the keyboard, keep the start of the selection the same
	if (!this.isKeyboardSelect) {
		this.selectionIndex = index;
	}
};

EquationCore.prototype.moveCursorRelative = function(delta) {
	var index;

	if (this.isKeyboardSelect) {
		// If we are selecting using the keyboard, repeatedly move the cursor until the
		// range changes or we hit the edge, in which case the index will stop changing
		var oldRange = new Range(this.container, this.cursorIndex, this.selectionIndex);
		index = this.cursorIndex;
		do {
			var oldIndex = index;
			index = Math.max(0, Math.min(index + delta, this.container.anchorCount - 1));
		} while (index != oldIndex && oldRange.equals(new Range(this.container, index, this.selectionIndex)));
	} else if (this.cursorIndex == this.selectionIndex) {
		// If we are just moving a single cursor, move the cursor by delta once
		index = Math.max(0, Math.min(this.cursorIndex + delta, this.container.anchorCount - 1));
	} else {
		// If we are moving with a selection, move the cursor to the negative or positive side
		var range = new Range(this.container, this.cursorIndex, this.selectionIndex);
		index = delta < 0 ? range.minIndex : range.maxIndex;
	}

	this.moveCursorAbsolute(index);
};

EquationCore.prototype.removeNodeDelta = function(delta) {
	// Create a selection if there isn't one
	if (this.cursorIndex == this.selectionIndex) {
		this.cursorIndex = Math.max(0, Math.min(this.cursorIndex + delta, this.container.anchorCount - 1));
	}

	// Remove the selection
	var range = new Range(this.container, this.cursorIndex, this.selectionIndex);
	range.replaceNodes([]);
	this.cursorIndex = this.selectionIndex = range.minIndex;
};

EquationCore.prototype.render = function(renderer, shouldRenderCursor) {
	// Layout everything now that we have the renderer
	this.container.calculateSize(renderer);
	this.container.layout(2, 2);
	renderer.begin(this.container.box.width + 4, this.container.box.getHeight() + 4);

	// Render the selection
	var sel = new Range(this.container, this.cursorIndex, this.selectionIndex);
	var box = sel.getBox();
	renderer.drawRect(box.x, box.y, box.width, box.getHeight());

	// Render the cursor
	if (shouldRenderCursor && this.cursorIndex == this.selectionIndex) {
		renderer.drawLine(box.x, box.y, box.x, box.y + box.getHeight());
	}

	// Render the equation
	this.container.render(renderer);
	renderer.end();
};

EquationCore.prototype.cursorIndexFromPoint = function(x, y) {
	var anchor = createAnchor(this.container);
	anchor.setIndexFromPoint(x, y);
	return anchor.index;
};
