'use strict';

import {defaults} from 'lodash';

const DEFAULT_SETTINGS = {
	placement: {
		vertical: 'top',
		horizontal: 'center'
	}
};

class Shank {
	constructor(anchor, anchored, settings) {
		if(!anchor) {
			throw new Error('Missing argument \'anchor\'. Anchor must be supplied for Shank to work properly');
		}

		if(!anchored) {
			throw new Error('Missing argument \'anchored\'. Anchored must be supplied for Shank to work properly');
		}

		this.anchor = this._getElement(anchor);
		this.anchored = this._getElement(anchored);

		this._settings = defaults(DEFAULT_SETTINGS, settings);

		this._setInitialPosition();

		if(!this._settings.noWatch) {
			this.startWatching();
		}
	}

	get placement() {
		return this._settings.placement;
	}

	startWatching() {
		this._watching = true;
		this._watch(this.reposition);
	}

	stopWatching() {
		this._watching = false;
	}

	reposition() {
		console.log('repositioning');
	}

/*
	Private Methods
 */
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
		this.anchored.style.right = '0';
		this.anchored.style.top = '0';
	}

	_watch(callback) {
		let shimmedAnimationFrame =  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};

		if(!this._watching) {
			return;
		}

		shimmedAnimationFrame(() => {
			callback();
			this._watch(callback);
		});
	}
}

window.Shank = Shank;
export default Shank;
