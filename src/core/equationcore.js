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

EquationCore.prototype.render = function(renderer, shouldRenderCursor) {
	this.container.calculateSize(renderer);
	this.container.layout(2, 2);
	renderer.begin(this.container.box.width + 4, this.container.box.getHeight() + 4);

	if (shouldRenderCursor) {
		var cursorAnchor = createAnchor(this.container).setIndex(this.cursorIndex);
		var selectionAnchor = createAnchor(this.container).setIndex(this.selectionIndex);

		// Render the selection
		var box = getSelectionAroundAnchors(cursorAnchor, selectionAnchor);
		if (box) {
			renderer.drawRect(box.x, box.y, box.width, box.getHeight());
		}

		// Render the selection anchor (for debugging)
		var box = selectionAnchor.getBox();
		renderer.drawLine(box.x, box.y, box.x, box.y + box.getHeight());

		// Render the main cursor
		var box = cursorAnchor.getBox();
		renderer.drawLine(box.x, box.y, box.x, box.y + box.getHeight());
	}

	this.container.render(renderer);
	renderer.end();
};

EquationCore.prototype.cursorIndexFromPoint = function(x, y) {
	var anchor = createAnchor(this.container);
	anchor.setIndexFromPoint(x, y);
	return anchor.index;
};
