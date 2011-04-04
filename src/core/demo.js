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
