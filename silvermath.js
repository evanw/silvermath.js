var silver = (function() {
var exports = {};

// src/core/demo.js
function loadDemo() {
	var container = new Container();

	container.children.push(new Symbol('2', SANS_SERIF));
	container.children.push(new Symbol('x', SERIF | ITALIC));
	container.children.push(new Symbol('  +  ', SANS_SERIF));
	container.children.push(new Symbol('3', SANS_SERIF));
	container.children.push(new Symbol('y', SERIF | ITALIC));
	container.children.push(new Symbol('  =  ', SANS_SERIF));
	container.children.push(new Symbol('0', SANS_SERIF));
	container.children.push(new Symbol('  \u2212  ', SANS_SERIF));
	
	var frac = new Fraction();
	frac.top.children.push(new Symbol('1', SANS_SERIF));
	frac.top.children.push(new Symbol('  +  ', SANS_SERIF));
	frac.top.children.push(new Symbol('2', SANS_SERIF));
	frac.bottom.children.push(new Symbol('5', SANS_SERIF));
	frac.bottom.children.push(new Symbol('  \u2212  ', SANS_SERIF));
	var frac2 = new Fraction();
	frac2.top.children.push(new Symbol('2', SANS_SERIF));
	frac2.bottom.children.push(new Symbol('3', SANS_SERIF));
	frac.bottom.children.push(frac2);
	frac.bottom.children.push(new Symbol('  \u2212  ', SANS_SERIF));
	frac.bottom.children.push(new Symbol('1', SANS_SERIF));
	container.children.push(frac);
	
	frac = new Fraction();
	frac.top.children.push(new Symbol('4', SANS_SERIF));
	frac.top.children.push(new Symbol('  +  ', SANS_SERIF));
	frac.top.children.push(new Symbol('7', SANS_SERIF));
	frac.top.children.push(new Symbol('  +  ', SANS_SERIF));
	frac2 = new Fraction();
	frac2.top.children.push(new Symbol('2', SANS_SERIF));
	frac2.bottom.children.push(new Symbol('3', SANS_SERIF));
	frac.top.children.push(frac2);
	frac.bottom.children.push(new Symbol('2', SANS_SERIF));
	container.children.push(frac);

	return container;
}

// src/core/equationcore.js
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
	if (text == '-') text = '  \u2212  ';
	else if (text == '+') text = '  +  ';
	else if (text == '=') text = '  =  ';
	else if (text == '*') text = '\u2219';

	// Replace the selection with a new symbol
	var symbol = new Symbol(text, useLetterFont ? SERIF | ITALIC : SANS_SERIF);
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

// src/core/main.js
var core;
var renderer;

function getOffset(element) {
	var offset = { x: 0, y: 0 };
	while (element) {
		offset.x += element.offsetLeft;
		offset.y += element.offsetTop;
		element = element.offsetParent;
	}
	return offset;
}

function getMouse(e, element) {
	var offset = getOffset(element);
	return {
		x: e.pageX - offset.x,
		y: e.pageY - offset.y
	};
}

// This is for testing, and will change into an API by the release version
function main() {
	var canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	canvas.width = 400;
	renderer = new CanvasRenderer(canvas);
	
	core = new EquationCore();
	core.setContainer(loadDemo());
	function draw() {
		core.render(renderer, true);
	}
	draw();
	
	var dragging = false;
	document.onmousedown = function(e) {
		var mouse = getMouse(e, canvas);
		if (dragging) {
			core.mouseReleased(mouse.x, mouse.y);
		}
		core.mousePressed(mouse.x, mouse.y);
		dragging = true;
		draw();
	};
	document.onmousemove = function(e) {
		if (dragging) {
			var mouse = getMouse(e, canvas);
			core.mouseDragged(mouse.x, mouse.y);
			draw();
		}
	};
	document.onmouseup = function(e) {
		if (dragging) {
			var mouse = getMouse(e, canvas);
			core.mouseReleased(mouse.x, mouse.y);
			dragging = false;
			draw();
		}
	};
	document.onkeypress = function(e) {
		core.insertSymbol(String.fromCharCode(e.charCode || e.keyCode));
		draw();
		e.preventDefault();
	};
	
	var BACKSPACE = 8;
	var DELETE = 46;
	var LEFT = 37;
	var RIGHT = 39;
	var HOME = 36;
	var END = 35;
	
	document.onkeydown = function(e) {
		var valid = true;
		if (e.shiftKey) core.isKeyboardSelect = true;
		if (e.keyCode == BACKSPACE) core.removeNodeDelta(-1);
		else if (e.keyCode == DELETE) core.removeNodeDelta(1);
		else if (e.keyCode == LEFT) core.moveCursorRelative(-1);
		else if (e.keyCode == RIGHT) core.moveCursorRelative(1);
		else if (e.keyCode == HOME) core.moveCursorAbsolute(0);
		else if (e.keyCode == END) core.moveCursorAbsolute(core.getLastIndex());
		else valid = false;
		core.isKeyboardSelect = false;
		if (valid) {
			draw();
			e.preventDefault();
		}
	};
}

exports['main'] = main;

// src/core/range.js
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

// src/interaction/anchor.js
function createAnchor(node) {
	if (node instanceof Container) {
		return new ContainerAnchor(node);
	} else if (node instanceof Fraction) {
		return new FractionAnchor(node);
	} else {
		return null;
	}
}

// src/interaction/containeranchor.js
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
			this.childAnchor = createAnchor(node).setIndex(index);
			break;
		} else {
			index -= node.anchorCount;
		}
	}
	
	// The index of the anchor if index is between two children (only relevant if childAnchor == null)
	this.betweenIndex = i;

	// Allow chaining
	return this;
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

// src/interaction/fractionanchor.js
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

// src/model/box.js
function Box(x, y, width, heightAboveMidline, heightBelowMidline) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.heightAboveMidline = heightAboveMidline;
	this.heightBelowMidline = heightBelowMidline;
}

Box.prototype.getHeight = function() {
	return this.heightAboveMidline + this.heightBelowMidline;
};

// src/model/container.js
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
		child.calculateSize(renderer);
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

// src/model/fraction.js
function Fraction() {
	this.box = new Box();
	this.top = new Container();
	this.bottom = new Container();
	this.anchorCount = 0;
}

Fraction.prototype.updateAnchorCount = function() {
	this.top.updateAnchorCount();
	this.bottom.updateAnchorCount();
	this.anchorCount = this.top.anchorCount + this.bottom.anchorCount;
};

Fraction.prototype.calculateSize = function(renderer) {
	this.top.calculateSize(renderer);
	this.bottom.calculateSize(renderer);
	this.box.width = Math.max(this.top.box.width, this.bottom.box.width) + 8;
	this.box.heightAboveMidline = this.top.box.getHeight() + 2;
	this.box.heightBelowMidline = this.bottom.box.getHeight() + 4;
};

Fraction.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
	this.top.layout(x + Math.floor(this.box.width / 2 - this.top.box.width / 2), y);
	this.bottom.layout(x + Math.floor(this.box.width / 2 - this.bottom.box.width / 2), y + this.box.heightAboveMidline + 4);
};

Fraction.prototype.render = function(renderer) {
	this.top.render(renderer);
	this.bottom.render(renderer);
	renderer.drawLine(this.box.x + 2, this.box.y + this.box.heightAboveMidline, this.box.x + this.box.width - 2, this.box.y + this.box.heightAboveMidline);
};

// src/model/symbol.js
function Symbol(text, fontStyle) {
	this.box = new Box();
	this.text = text;
	this.fontStyle = fontStyle;
}

Symbol.prototype.anchorCount = 0;

Symbol.prototype.updateAnchorCount = function() {
};

Symbol.prototype.calculateSize = function(renderer) {
	renderer.fontStyle = this.fontStyle;
	var size = renderer.measureText(this.text);
	this.box.width = size.width;
	this.box.heightAboveMidline = size.heightAboveMidline;
	this.box.heightBelowMidline = size.heightBelowMidline;
};

Symbol.prototype.layout = function(x, y) {
	this.box.x = x;
	this.box.y = y;
};

Symbol.prototype.render = function(renderer) {
	renderer.fontStyle = this.fontStyle;
	renderer.drawText(this.text, this.box.x, this.box.y);
};

// src/renderers/canvasrenderer.js
function CanvasRenderer(canvasElement) {
	this._context = canvasElement.getContext('2d');
	this.fontStyle = 0;
	this.fontSize = 18;
	this.subpixel = false;
}

CanvasRenderer.prototype.begin = function(width, height) {
	this._context.canvas.width = this.subpixel ? width * 3 : width;
	this._context.canvas.height = height;
	this._context.save();
	if (this.subpixel) this._context.scale(3, 1);
	this._context.clearRect(0, 0, width, height);
};

CanvasRenderer.prototype.drawText = function(text, x, y) {
	this._context.font = cssFont(this.fontStyle, this.fontSize);
	this._context.textBaseline = 'middle';
	this._context.fillStyle = 'black';
	this._context.fillText(text, x, y + this.measureText(text).heightAboveMidline);
};

CanvasRenderer.prototype.measureText = function(text) {
	this._context.font = cssFont(this.fontStyle, this.fontSize);
	return {
		width: this._context.measureText(text).width,
		heightAboveMidline: this.fontSize * 0.45,
		heightBelowMidline: this.fontSize * 0.55
	};
};

CanvasRenderer.prototype.drawLine = function(x1, y1, x2, y2) {
	var x = y1 - y2;
	var y = x2 - x1;
	var d = 0.5 / Math.sqrt(x * x + y * y);
	if (x + y < 0) {
		d = -d;
	}
	x1 += x * d;
	y1 += y * d;
	x2 += x * d;
	y2 += y * d;
	this._context.strokeStyle = 'black';
	this._context.beginPath();
	this._context.lineTo(x1, y1);
	this._context.lineTo(x2, y2);
	this._context.stroke();
};

CanvasRenderer.prototype.drawRect = function(x, y, w, h) {
	this._context.fillStyle = '#BFDFFF';
	this._context.fillRect(x, y, w, h);
};

CanvasRenderer.prototype.end = function() {
	if (this.subpixel) {
		var oldData = this._context.getImageData(0, 0, this._context.canvas.width, this._context.canvas.height);
		var newData = this._context.createImageData(oldData.width / 3, oldData.height);
		for (var y = 0, i = 0; y < newData.height; y++) {
			for (var x = 0; x < newData.width; x++, i++) {
				for (var c = 0; c < 3; c++) {
					var j = i * 12 + c * 4 + 3;
					newData.data[i * 4 + c] = 255 - ((x > 0 ? oldData.data[j - 4] : 0) + oldData.data[j] + (x < newData.width - 1 ? oldData.data[j + 4] : 0)) / 3;
				}
				newData.data[i * 4 + 3] = 255;
			}
		}
		this._context.restore();
		this._context.canvas.width = newData.width;
		this._context.putImageData(newData, 0, 0);
	}
};

exports['CanvasRenderer'] = CanvasRenderer;

// src/renderers/renderer.js
var SERIF = 0;
var SANS_SERIF = 1;
var ITALIC = 2;
var BOLD = 4;

function cssFont(fontStyle, fontSize) {
	return (
		(fontStyle & BOLD ? 'bold ' : '') +
		(fontStyle & ITALIC ? 'italic ' : '') +
		fontSize.toFixed() + 'px ' +
		(fontStyle & SANS_SERIF ? '\'Cambria Math\', \'DejaVu Sans\', sans-serif' : '\'DejaVu Serif\', Georgia, \'Lucida Fax\', Zapfino, \'Times New Roman\', serif')
	);
}

exports['SERIF'] = SERIF;
exports['SANS_SERIF'] = SANS_SERIF;
exports['ITALIC'] = ITALIC;
exports['BOLD'] = BOLD;

return exports;
})();
