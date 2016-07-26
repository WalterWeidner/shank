'use strict';

import {assign, assignIn} from 'lodash';
import Positioner from './positioner';
import Utils from './utils';

const DEFAULT_SETTINGS = {};

class AutoPositioner extends Positioner {
	constructor(anchor, vessel, settings) {
		super(anchor, vessel, settings);
		
		this.reposition();

		if(!this._settings.noWatch) {
			this.startWatching();
		}
	}

	/**
	 * Returns the current placement of the vessel
	 * @return {object} Current placement of the vessel
	 */
	get placement() {
		return this._settings.placement;
	}
	
	/**
	 * Enables auto repositioning of the vessel (useful for when the anchor moves)
	 */
	startWatching() {
		this._watching = true;
		this._watch(this.reposition);
	}

	/**
	 * Disables auto repositioning of the vessel
	 * @return {[type]} [description]
	 */
	stopWatching() {
		this._watching = false;
	}

	/**
	 * Forces the vessel to reposition immediately
	 */
	reposition() {
		if(this._anchor && this._anchor.offsetParent) {
			this.position();
		}
	}

	_watch(callback) {
		if(this._settings.watchWithAnimationFrame) {
			this._watchWithAnimationFrame(callback);
		}
	}
	
	_watchWithAnimationFrame(callback) {
		let self = this;
		let shimmedAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000 / 60); };
		
		if(!this._watching) {
			return;
		}

		shimmedAnimationFrame(() => {
			callback.call(self);
			self._watchWithAnimationFrame(callback);
		});
	}
}

window.Shank = {
	AutoPositioner: AutoPositioner,
	Positioner: Positioner
};

export default AutoPositioner;