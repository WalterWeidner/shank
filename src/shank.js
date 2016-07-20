'use strict';

import {assign, assignIn} from 'lodash';
import {default as Positioner, DEFAULT_SETTINGS as POSITIONER_DEFAULT_SETTINGS} from './positioner';
import Utils from './utils';

const DEFAULT_SETTINGS = assign({}, POSITIONER_DEFAULT_SETTINGS);

class Shank {
	constructor(anchor, vessel, settings) {
		if(!anchor) {
			throw new Error('Missing argument \'anchor\'. Anchor must be supplied for Shank to work properly');
		}

		if(!vessel) {
			throw new Error('Missing argument \'vessel\'. Vessel must be supplied for Shank to work properly');
		}

		this.anchor = Utils.getElement(anchor);
		this.vessel = Utils.getElement(vessel);
		
		this._settings = assignIn({}, DEFAULT_SETTINGS, settings);
		this._createPositioner();

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
		if(this.anchor && this.anchor.offsetParent) {
			this._positioner.position();
		}
	}
	
	_createPositioner() {
		var {placement, collisionContainer, collisionStrategy} = this._settings;
		var positionerSettings = {placement, collisionContainer, collisionStrategy};
		
		this._positioner = new Positioner(this.anchor, this.vessel, positionerSettings);
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

window.Shank = Shank;
export default Shank;