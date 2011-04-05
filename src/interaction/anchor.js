function createAnchor(node) {
	if (node instanceof Container) {
		return new ContainerAnchor(node);
	} else if (node instanceof Fraction) {
		return new FractionAnchor(node);
	} else {
		return null;
	}
}
