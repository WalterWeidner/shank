'use strict';

import {assign, assignIn, debounce} from 'lodash';
import Positioner from './positioner';
import Utils from './utils';

const DEFAULT_SETTINGS = {
	watchStrategy: {
		type: 'animation-frame'
	}
};

class AutoPositioner extends Positioner {
	constructor(anchor, vessel, settings) {
		super(anchor, vessel, settings);
		
		this._settings = assignIn({}, DEFAULT_SETTINGS, this._settings);
		
		this.reposition();

		this.startWatching();
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
		this._watchCleanup = this._watch(this.reposition);
	}

	/**
	 * Disables auto repositioning of the vessel and cleans up the watch
	 */
	stopWatching() {
		this._watching = false;
		if (typeof this._watchCleanup === 'function') {
			this._watchCleanup();
		}
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
		var watchStrategy = this._settings.watchStrategy;
		
		switch(watchStrategy.type) {
			case 'interval': 
				return this._watchWithInterval(callback);
			case 'events':
				return this._watchWithEvents(callback);
			default:
				return this._watchWithAnimationFrame(callback);
		}
	}
	
	_watchWithAnimationFrame(callback) {
		let self = this;
		let shimmedAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000 / 60); };
		
		if (!this._watching) {
			return;
		}

		shimmedAnimationFrame(() => {
			callback.call(self);
			self._watchWithAnimationFrame(callback);
		});
	}
	
	_watchWithInterval(callback) {
		let delay = this._settings.watchStrategy.delay || 120;
		
		let intervalId = setInterval(() => {
			if (!this._watching) {
				clearInterval(intervalId);
				return;
			}
			
			callback.call(this);
		}, delay);
		
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		}
	}
	
	_watchWithEvents(callback) {
		let watchStrategy = this._settings.watchStrategy;
		
		let handler = () => {
			callback.call(this);
		};
		
		let debouncedHandler = debounce(handler, watchStrategy.delay || 15);
		
		window.addEventListener('resize', debouncedHandler);
		window.addEventListener('scroll', debouncedHandler);
		
		return () => {
			window.removeEventListener('resize', debouncedHandler);
			window.removeEventListener('scroll', debouncedHandler);
		};
	}
}

export default AutoPositioner;