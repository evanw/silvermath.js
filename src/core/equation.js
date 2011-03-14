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
