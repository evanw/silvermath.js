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
