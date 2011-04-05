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
