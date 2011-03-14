var eq = (function() {
var exports = {};

// src/core/anchor.js
function Anchor(equation, index) {
	this.equation = equation;
	this.index = index;
}

Anchor.prototype.render = function(renderer) {
	if (this.index < 0 || this.index >= this.equation.container.anchorCount) {
		return;
	}
	
	var index = 0;
	var node = this.equation.container;
	
	while (index <= this.index) {
		if (node instanceof Container) {
			var x = node.box.x;
			
			// check the spot before the first child
			if (this.index == index++) {
				renderer.drawLine(x, node.box.y, x, node.box.y + node.box.getHeight());
				return;
			}
			
			for (var i = 0; i < node.children.length; i++) {
				// check in this child
				var child = node.children[i];
				if (this.index < index + child.anchorCount) {
					node = node.children[i];
					break;
				}
				x += child.box.width;
				index += child.anchorCount;
				
				// check the spot after this child
				if (this.index == index++) {
					renderer.drawLine(x, node.box.y, x, node.box.y + node.box.getHeight());
					return;
				}
			}
		} else if (node instanceof Fraction) {
			if (this.index < index + node.top.anchorCount) {
				node = node.top;
			} else {
				index += node.top.anchorCount;
				node = node.bottom;
			}
		} else {
			break;
		}
	}
};

// src/core/box.js
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

// src/core/container.js
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

// src/core/equation.js
function Equation() {
	this.container = new Container();
	this.container.children.push(new Symbol('2', SANS_SERIF));
	this.container.children.push(new Symbol('x', SERIF | ITALIC));
	this.container.children.push(new Symbol('  +  ', SANS_SERIF));
	this.container.children.push(new Symbol('3', SANS_SERIF));
	this.container.children.push(new Symbol('y', SERIF | ITALIC));
	this.container.children.push(new Symbol('  =  ', SANS_SERIF));
	this.container.children.push(new Symbol('0', SANS_SERIF));
	this.container.children.push(new Symbol('  \u2212  ', SANS_SERIF));
	
	var frac = new Fraction();
	frac.top.children.push(new Symbol('1', SANS_SERIF));
	frac.top.children.push(new Symbol('  +  ', SANS_SERIF));
	frac.top.children.push(new Symbol('2', SANS_SERIF));
	frac.bottom.children.push(new Symbol('5', SANS_SERIF));
	this.container.children.push(frac);
	
	this.container.children.push(new Symbol('  +  ', SANS_SERIF));
	
	frac = new Fraction();
	frac.top.children.push(new Symbol('4', SANS_SERIF));
	frac.top.children.push(new Symbol('  +  ', SANS_SERIF));
	frac.top.children.push(new Symbol('7', SANS_SERIF));
	frac.bottom.children.push(new Symbol('2', SANS_SERIF));
	this.container.children.push(frac);
	
	this.cursorIndex = 0;
	this.container.updateAnchorCount();
}

Equation.prototype.render = function(renderer, shouldRenderCursor) {
	this.container.calculateSize(renderer);
	this.container.layout(2, 2);
	renderer.begin(this.container.box.width + 4, this.container.box.getHeight() + 4);
	this.container.render(renderer);
	if (shouldRenderCursor) new Anchor(this, this.cursorIndex).render(renderer);
	renderer.end();
};

exports['Equation'] = Equation;

// src/core/fraction.js
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
	renderer.drawLine(this.box.x, this.box.y + this.box.heightAboveMidline, this.box.x + this.box.width, this.box.y + this.box.heightAboveMidline);
};

// src/core/symbol.js
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
	this._context.strokeStyle = 'black';
	this._context.beginPath();
	this._context.lineTo(x1 + 0.5, y1 + 0.5);
	this._context.lineTo(x2 + 0.5, y2 + 0.5);
	this._context.stroke();
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
