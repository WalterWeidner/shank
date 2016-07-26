'use strict';
import {assignIn, clone, cloneDeep} from 'lodash';
import Utils from './utils';

export const DEFAULT_SETTINGS = {
	placement: {
		anchor: {
			vertical: 'bottom',
			horizontal: 'left'
		},
		vessel: {
			vertical: 'top',
			horizontal: 'left'
		}
	},
	collisionContainer: 'window',
	collisionStrategy: [
		'flip',
		'slide',
		'hide'
	]
};

class Positioner {
	constructor(anchor, vessel, settings) {
		if(!anchor) {
			throw new Error('Missing argument \'anchor\'. Anchor must be supplied for Shank to work properly');
		}

		if(!vessel) {
			throw new Error('Missing argument \'vessel\'. Vessel must be supplied for Shank to work properly');
		}
		
		this._settings = assignIn({}, DEFAULT_SETTINGS, settings);
		
		this._anchor = Utils.getElement(anchor);
		this._vessel = Utils.getElement(vessel);
		this._collisionContainer = (this._settings.collisionContainer) ? Utils.getElement(this._settings.collisionContainer) : undefined;
	}
	
	position() {
		this._vessel.style.position = 'fixed';
		
		var offsets = this._getCurrentOffsets();
		var vesselOffsets = this._getNewOffsets(offsets.anchor, this._settings.placement);
		
		var collisions = this.detectCollisions(vesselOffsets);
		if(collisions) {
			vesselOffsets = this.fixCollisions(offsets, collisions, this._settings.collisionStrategy);
		}
		
		this._vessel.style.left = vesselOffsets.left + 'px';
		this._vessel.style.top = vesselOffsets.top + 'px';
	}
	
	_getCurrentOffsets() {
		return {
			anchor: Utils.getOffsets(this._anchor),
			collisionContainer: (this._collisionContainer) ? Utils.getOffsets(this._collisionContainer) : null,
			vessel: Utils.getOffsets(this._vessel)
		};
	}
	
	_getNewOffsets(anchorOffsets, placement) {
		var {bottom, left, right, top} = anchorOffsets;
		var newOffsets = {bottom, left, right, top};
		
		if(placement.anchor.vertical === 'bottom') {
			newOffsets.top = newOffsets.bottom;
		}
		
		if(placement.anchor.horizontal === 'right') {
			newOffsets.left = newOffsets.right;
		}
		
		if(placement.vessel.vertical === 'bottom') {
			newOffsets.top -= this._vessel.offsetHeight;
		}
		
		if(placement.vessel.horizontal === 'right') {
			newOffsets.left -= this._vessel.offsetWidth;
		}
		
		newOffsets.bottom = newOffsets.top + this._vessel.offsetHeight;
		newOffsets.right = newOffsets.left + this._vessel.offsetWidth;
		
		return newOffsets;
	}
		
	detectCollisions(vesselOffsets) {
		var containerOffset = Utils.getOffsets(this._collisionContainer);
		
		var collisions = {
			bottom: containerOffset.bottom < vesselOffsets.bottom || containerOffset.bottom < vesselOffsets.top,
			left: containerOffset.left > vesselOffsets.left || containerOffset.left > vesselOffsets.right,
			right: containerOffset.right < vesselOffsets.right || containerOffset.right < vesselOffsets.left,
			top: containerOffset.top > vesselOffsets.top || containerOffset.top > vesselOffsets.bottom
		};
	
		return (collisions.bottom || collisions.left || collisions.right || collisions.top) ? collisions : undefined;
	}
	
	fixCollisions(offsets, collisions, collisionStrategy) {
		var adjustedCollisionStrategy = clone(collisionStrategy);
		
		var collisionFixers = {
			flip: this.flip,
			slide: this.slide
		};
		
		var method = adjustedCollisionStrategy.shift();
		if(!method || typeof collisionFixers[method] !== 'function') {
			throw new Error(`Collision strategy ${method} not found`);
		}
		
		var placement = this._settings.placement;
		var newOffsets = cloneDeep(offsets);
		
		var newVesselOffsets = collisionFixers[method].call(this, offsets, placement, collisions);
		
		var collisions = this.detectCollisions(newVesselOffsets);
		if(collisions) {
			return this.fixCollisions(offsets, collisions, adjustedCollisionStrategy);
		}
		
		return newVesselOffsets;
	}
	
	flip(offsets, placement, collisions) {
		var adjustedPlacement = cloneDeep(placement);
		
		var flipHorizontally = collisions.right && !collisions.left || collisions.left && !collisions.right;
		var flipVertically = collisions.bottom && !collisions.top || collisions.top && !collisions.bottom;
		
		var opposites = {
			bottom: 'top',
			center: 'center',
			left: 'right',
			right: 'left',
			top: 'bottom'
		};
		
		if(flipHorizontally) {
			adjustedPlacement.anchor.horizontal = opposites[adjustedPlacement.anchor.horizontal];
		 	adjustedPlacement.vessel.horizontal = opposites[adjustedPlacement.vessel.horizontal];
		}
		
		if(flipVertically) {
			adjustedPlacement.anchor.vertical = opposites[adjustedPlacement.anchor.vertical];
			adjustedPlacement.vessel.vertical = opposites[adjustedPlacement.vessel.vertical];
		}
		
		return this._getNewOffsets(offsets.anchor, adjustedPlacement);
	}
	
	slide(offsets, placement, collisions) {
		var newVesselOffsets = cloneDeep(offsets.vessel);
		
		if(collisions.left && !collisions.right) {
			newVesselOffsets.left = offsets.collisionContainer.left;
			newVesselOffsets.right = newVesselOffsets.left + newVesselOffsets.width;
		}
		else if(collisions.right && !collisions.left) {
			newVesselOffsets.left = offsets.collisionContainer.right - offsets.vessel.width;
			newVesselOffsets.right = newVesselOffsets.right;
		}
		
		if(collisions.top && !collisions.bottom) {
			newVesselOffsets.top = offsets.collisionContainer.top;
			newVesselOffsets.bottom = newVesselOffsets.top + newVesselOffsets.height;
		}
		else if(collisions.bottom && !collisions.top) {
			newVesselOffsets.bottom = offsets.collisionContainer.bottom;
			newVesselOffsets.top = newVesselOffsets.top - newVesselOffsets.height;
		}
		
		return newVesselOffsets;
	}
}

export default Positioner;
