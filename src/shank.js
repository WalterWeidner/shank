class Shank {
	constructor(anchor, anchored, options) {
		if(!anchor) {
			throw new Error('Missing argument \'anchor\'. Anchor must be supplied for Shank to work properly');
		}

		if(!anchored) {
			throw new Error('Missing argument \'anchored\'. Anchored must be supplied for Shank to work properly');
		}

		this.anchor = this._getElement(anchor);
		this.anchored = this._getElement(anchored);

		this._setInitialPosition();
	}

	_getElement(selector) {
		if(typeof selector === 'string') {
			return document.querySelector(selector);
		}
		if(typeof selector === 'object') {
			return selector;
		}

		throw new Error('Invalid argument. Expecting CSS selector or DOM element');
	}

	_setInitialPosition() {
		document.body.appendChild(this.anchored);

		this.anchored.style.position = 'absolute';
		this.anchored.style.left = '0';
		this.anchored.style.top = '0';
	}
}

module.exports = Shank;
