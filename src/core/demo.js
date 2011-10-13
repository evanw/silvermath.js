function loadDemo() {
	var container = new Container();

	container.children.push(new Character('s', SERIF | ITALIC));
	container.children.push(new Character('i', SERIF | ITALIC));
	container.children.push(new Character('n', SERIF | ITALIC));
	container.children.push(new Character('(', SANS_SERIF));
	container.children.push(new Character('x', SERIF | ITALIC));
	container.children.push(new Character(')', SANS_SERIF));
	container.children.push(new Character('+', SANS_SERIF));
	container.children.push(new Character('{', SANS_SERIF));
	container.children.push(new Character(Symbol.minus, SANS_SERIF));
	container.children.push(new Character('2', SANS_SERIF));
	container.children.push(new Character(Symbol.cdot, SANS_SERIF));
	container.children.push(new Character('x', SERIF | ITALIC));
	container.children.push(new Character(',', SANS_SERIF));
	container.children.push(new Character(Symbol.minus, SANS_SERIF));
	container.children.push(new Character('3', SANS_SERIF));
	container.children.push(new Character(Symbol.cdot, SANS_SERIF));
	container.children.push(new Character('y', SERIF | ITALIC));
	container.children.push(new Character('}', SANS_SERIF));

	container.children.push(new Character('=', SANS_SERIF));
	container.children.push(new Character('{', SANS_SERIF));
	container.children.push(new Character('1', SANS_SERIF));
	container.children.push(new Character(Symbol.minus, SANS_SERIF));
	container.children.push(new Character('(', SANS_SERIF));
	container.children.push(new Character('1', SANS_SERIF));
	container.children.push(new Character('+', SANS_SERIF));
	
	var frac = new Fraction();
	frac.top.children.push(new Character(Symbol.minus, SANS_SERIF));
	frac.top.children.push(new Character('1', SANS_SERIF));
	frac.top.children.push(new Character('+', SANS_SERIF));
	frac.top.children.push(new Character('2', SANS_SERIF));
	frac.bottom.children.push(new Character('5', SANS_SERIF));
	frac.bottom.children.push(new Character(Symbol.minus, SANS_SERIF));
	frac.bottom.children.push(new Character('1', SANS_SERIF));
	container.children.push(frac);
	
	container.children.push(new Character(')', SANS_SERIF));
	container.children.push(new Character(Symbol.cdot, SANS_SERIF));
	
	frac = new Fraction();
	frac.top.children.push(new Character('4', SANS_SERIF));
	frac.top.children.push(new Character('+', SANS_SERIF));
	frac.top.children.push(new Character('7', SANS_SERIF));
	frac.top.children.push(new Character('+', SANS_SERIF));
	frac2 = new Fraction();
	frac2.top.children.push(new Character('2', SANS_SERIF));
	frac2.bottom.children.push(new Character('3', SANS_SERIF));
	frac.top.children.push(frac2);
	frac.bottom.children.push(new Character('2', SANS_SERIF));
	container.children.push(frac);

	container.children.push(new Character('}', SANS_SERIF));

	return container;
}
