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
		
		this._anchor = Utils.getElement(anchor);
		this._vessel = Utils.getElement(vessel);
		
		this._settings = assignIn({}, DEFAULT_SETTINGS, settings);
	}
	
	position() {
		this._vessel.style.position = 'fixed';
		
		var vesselOffsets = this._getNewOffsets(this._settings.placement);
		
		var collisions = this.detectCollisions(vesselOffsets);
		if(collisions) {
			vesselOffsets = this.fixCollisions(vesselOffsets, collisions, this._settings.collisionStrategy);
		}
		
		this._vessel.style.left = vesselOffsets.left + 'px';
		this._vessel.style.top = vesselOffsets.top + 'px';
	}
	
	_getNewOffsets(placement) {
		var anchorOffsets = this._anchor.getBoundingClientRect();
		
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
		var container = Utils.getElement(this._settings.collisionContainer);
		
		var containerOffset;
		if(container === window) {
			containerOffset = {bottom: window.innerHeight, left: 0, right: window.innerWidth, top: 0};
		}
		else {
			containerOffset = container.getBoundingClientRect();
		}
		
		var collisions = {
			bottom: containerOffset.bottom < vesselOffsets.bottom || containerOffset.bottom < vesselOffsets.top,
			left: containerOffset.left > vesselOffsets.left || containerOffset.left > vesselOffsets.right,
			right: containerOffset.right < vesselOffsets.right || containerOffset.right < vesselOffsets.left,
			top: containerOffset.top > vesselOffsets.top || containerOffset.top > vesselOffsets.bottom
		};
	
		return (collisions.bottom || collisions.left || collisions.right || collisions.top) ? collisions : undefined;
	}
	
	fixCollisions(vesselOffsets, collisions, collisionStrategy) {
		var adjustedCollisionStrategy = clone(collisionStrategy);
		var method = adjustedCollisionStrategy.shift();
		if(!method) {
			return vesselOffsets;
		}
		
		var placement = this._settings.placement;
		var newVesselOffsets = vesselOffsets;
		
		placement = this.flip(placement, collisions);
		newVesselOffsets = this._getNewOffsets(placement);
		
		var collisions = this.detectCollisions(newVesselOffsets);
		if(collisions) {
			return this.fixCollisions(vesselOffsets, collisions, adjustedCollisionStrategy);
		}
		
		return newVesselOffsets;
	}
	
	flip(placement, collisions) {
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
		
		return adjustedPlacement;
	}
}

export default Positioner;
