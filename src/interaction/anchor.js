function createAnchor(node) {
	if (node instanceof Container) {
		return new ContainerAnchor(node);
	} else if (node instanceof Fraction) {
		return new FractionAnchor(node);
	} else {
		return null;
	}
}

function getSelectionAroundAnchors(a, b) {
	// Move down the anchor chain until the anchors diverge
	while (a.childAnchor && b.childAnchor && a.depthEquals(b)) {
		a = a.childAnchor;
		b = b.childAnchor;
	}

	// Cursors are in the same container but at different indices
	var boxA = a.childAnchor ? a.childAnchor.node.box : a.getBox();
	var boxB = b.childAnchor ? b.childAnchor.node.box : b.getBox();
	var minX = Math.min(boxA.x, boxB.x);
	var maxX = Math.max(boxA.x + boxA.width, boxB.x + boxB.width);
	return new Box(minX, a.node.box.y, maxX - minX, a.node.box.heightAboveMidline, a.node.box.heightBelowMidline);
}
