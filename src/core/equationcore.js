function EquationCore() {
	this.container = new Container();
	this.cursorIndex = 0;
	this.selectionIndex = 0;
	this.maxCursorIndex = 0;
}

EquationCore.prototype.setContainer = function(container) {
	container.updateAnchorCount();
	this.container = container;
	this.cursorIndex = 0;
	this.selectionIndex = 0;
	this.maxCursorIndex = this.container.anchorCount - 1;
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
	var useLetterFont = /^[^0-9=\+\-]+$/.test(text);
	if (text == '-') text = '  \u2212  ';
	else if (text == '+') text = '  +  ';
	else if (text == '=') text = '  =  ';

	// Replace the selection with a new symbol
	var symbol = new Symbol(text, useLetterFont ? SERIF | ITALIC : SANS_SERIF);
	var range = new Range(this.container, this.cursorIndex, this.selectionIndex);
	range.replaceNodes([ symbol ]);
	this.cursorIndex = this.selectionIndex = range.maxIndex;
};

EquationCore.prototype.moveCursorDelta = function(delta) {
	var index;
	if (this.cursorIndex == this.selectionIndex) {
		index = Math.max(0, Math.min(this.cursorIndex + delta, this.container.anchorCount - 1));
	} else if (delta < 0) {
		index = Math.min(this.cursorIndex, this.selectionIndex);
	} else {
		index = Math.max(this.cursorIndex, this.selectionIndex);
	}
	this.cursorIndex = this.selectionIndex = index;
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
	this.container.calculateSize(renderer);
	this.container.layout(2, 2);
	renderer.begin(this.container.box.width + 4, this.container.box.getHeight() + 4);

	if (shouldRenderCursor) {
		var cursorAnchor = createAnchor(this.container).setIndex(this.cursorIndex);
		var selectionAnchor = createAnchor(this.container).setIndex(this.selectionIndex);

		// Render the selection
		var sel = new Range(this.container, this.cursorIndex, this.selectionIndex);
		var box = sel.getBox();
		renderer.drawRect(box.x, box.y, box.width, box.getHeight());

		// Render the main cursor
		if (this.cursorIndex == this.selectionIndex) {
			renderer.drawLine(box.x, box.y, box.x, box.y + box.getHeight());
		}
	}

	this.container.render(renderer);
	renderer.end();
};

EquationCore.prototype.cursorIndexFromPoint = function(x, y) {
	var anchor = createAnchor(this.container);
	anchor.setIndexFromPoint(x, y);
	return anchor.index;
};
