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
}

exports['main'] = main;
