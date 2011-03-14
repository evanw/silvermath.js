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
