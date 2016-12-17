'use strict';
import {assignIn, clone, cloneDeep} from 'lodash';
import Utils from './utils';

const OPPOSITES = {
	bottom: 'top',
	center: 'center',
	left: 'right',
	right: 'left',
	top: 'bottom'
};

const DEFAULT_ADJUSTMENT = {
	horizontal: 0,
	vertical: 0
};

const DEFAULT_SETTINGS = {
	anchorAdjustment: DEFAULT_ADJUSTMENT,
	collisionContainer: 'window',
	collisionStrategy: [
		'flip',
		'slide'
	],
	offsets: {
		vertical: 0,
		horizontal: 0
	},
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
	vesselAdjustment: DEFAULT_ADJUSTMENT
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
	
	get adjustments() {
		if (this._adjustments) {
			return this._adjustments;
		}
		
		this._adjustments = {
			anchorAdjustment: assignIn({}, DEFAULT_ADJUSTMENT, this._settings.anchorAdjustment),
			vesselAdjustment: assignIn({}, DEFAULT_ADJUSTMENT, this._settings.vesselAdjustment)	
		};
		
		return this._adjustments;
	}
	
	position() {
		this._vessel.style.position = 'fixed';
		
		let offsets = this._getCurrentOffsets();
		let newOffsets = this._adjustOffsets(offsets, this.adjustments);
		newOffsets = this._getNewOffsets(newOffsets, this._settings.placement);
		
		let collisions = this.detectCollisions(newOffsets.vessel);
		if(collisions) {
			newOffsets = this.fixCollisions(offsets, collisions, this._settings.collisionStrategy);
		}
		
		this._vessel.style.left = newOffsets.vessel.left + 'px';
		this._vessel.style.top = newOffsets.vessel.top + 'px';
	}
	
	_getCurrentOffsets() {
		return {
			anchor: Utils.getOffsets(this._anchor),
			collisionContainer: (this._collisionContainer) ? Utils.getOffsets(this._collisionContainer) : null,
			vessel: Utils.getOffsets(this._vessel)
		};
	}
	
	_invertAdjustments(adjustments, direction) {
		let {anchorAdjustment, vesselAdjustment} = cloneDeep(adjustments);
		
		if (direction === 'vertical') {
			anchorAdjustment.vertical = -anchorAdjustment.vertical;
			vesselAdjustment.vertical = - vesselAdjustment.vertical;
		} else if (direction === 'horizontal') {
			anchorAdjustment.horizontal = -anchorAdjustment.horizontal;	
			vesselAdjustment.horizontal = -vesselAdjustment.horizontal;
		}
		
		return {
			anchorAdjustment: anchorAdjustment,
			vesselAdjustment: vesselAdjustment
		};
	}
	
	_adjustOffsets(offsets, adjustments) {
		offsets = cloneDeep(offsets);
		
		let {anchorAdjustment, vesselAdjustment} = adjustments;
		let {bottom, left, right, top} = offsets.anchor;
		
		let netHorizontalAdjustment = anchorAdjustment.horizontal - vesselAdjustment.horizontal;
		let netVerticalAdjustment = anchorAdjustment.vertical - vesselAdjustment.vertical;
		
		offsets.anchor = {
			bottom: bottom + netVerticalAdjustment,
			left: left + netHorizontalAdjustment,
			right: right + netHorizontalAdjustment,
			top: top + netVerticalAdjustment
		};
		
		return offsets;
	}
	
	_getNewOffsets(offsets, placement) {
		offsets = cloneDeep(offsets);
		
		let {bottom, left, right, top} = offsets.anchor;
		let newVesselOffsets = {bottom, left, right, top};
		
		if(placement.anchor.vertical === 'bottom') {
			newVesselOffsets.top = newVesselOffsets.bottom;
		}
		
		if(placement.anchor.horizontal === 'right') {
			newVesselOffsets.left = newVesselOffsets.right;
		}
		
		if(placement.vessel.vertical === 'bottom') {
			newVesselOffsets.top -= this._vessel.offsetHeight;
		}
		
		if(placement.vessel.horizontal === 'right') {
			newVesselOffsets.left -= this._vessel.offsetWidth;
		}
		
		newVesselOffsets.bottom = newVesselOffsets.top + this._vessel.offsetHeight;
		newVesselOffsets.right = newVesselOffsets.left + this._vessel.offsetWidth;
		
		offsets.vessel = newVesselOffsets;
		
		return offsets;
	}
		
	detectCollisions(vesselOffsets) {
		let containerOffset = Utils.getOffsets(this._collisionContainer);
		
		let collisions = {
			bottom: containerOffset.bottom < vesselOffsets.bottom || containerOffset.bottom < vesselOffsets.top,
			left: containerOffset.left > vesselOffsets.left || containerOffset.left > vesselOffsets.right,
			right: containerOffset.right < vesselOffsets.right || containerOffset.right < vesselOffsets.left,
			top: containerOffset.top > vesselOffsets.top || containerOffset.top > vesselOffsets.bottom
		};
	
		return (collisions.bottom || collisions.left || collisions.right || collisions.top) ? collisions : undefined;
	}
	
	fixCollisions(offsets, collisions, collisionStrategy) {
		var adjustedCollisionStrategy = clone(collisionStrategy);
		var method = adjustedCollisionStrategy.shift();
		
		var collisionFixers = {
			flip: this.flip,
			slide: this.slide
		};
		
		if (!method) {
			return offsets;
		}
		
		if(typeof collisionFixers[method] !== 'function') {
			throw new Error(`Collision strategy ${method} not found`);
		}
		
		var placement = this._settings.placement;
		var newOffsets = cloneDeep(offsets);
		
		var newOffsets = collisionFixers[method].call(this, offsets, placement, collisions);
		
		var collisions = this.detectCollisions(newOffsets.vessel);
		if(collisions) {
			return this.fixCollisions(offsets, collisions, adjustedCollisionStrategy);
		}
		
		return newOffsets;
	}
	
	flip(offsets, placement, collisions) {
		let adjustments, adjustedOffsets;
		let adjustedPlacement = cloneDeep(placement);
		
		var flipHorizontally = collisions.right && !collisions.left || collisions.left && !collisions.right;
		let flipVertically = collisions.bottom && !collisions.top || collisions.top && !collisions.bottom;

		if(flipHorizontally) {
			adjustedPlacement.anchor.horizontal = OPPOSITES[adjustedPlacement.anchor.horizontal];
			adjustedPlacement.vessel.horizontal = OPPOSITES[adjustedPlacement.vessel.horizontal];
			adjustments = this._invertAdjustments(this.adjustments, 'horizontal');
		}
		
		if(flipVertically) {
			adjustedPlacement.anchor.vertical = OPPOSITES[adjustedPlacement.anchor.vertical];
			adjustedPlacement.vessel.vertical = OPPOSITES[adjustedPlacement.vessel.vertical];
			adjustments = this._invertAdjustments(this.adjustments, 'vertical');
		}

		adjustedOffsets = this._adjustOffsets(offsets, adjustments);
		adjustedOffsets = this._getNewOffsets(adjustedOffsets, adjustedPlacement);

		return adjustedOffsets;
	}
	
	slide(offsets, placement, collisions) {
		let newVesselOffsets;
		
		offsets = cloneDeep(offsets);
		newVesselOffsets = offsets.vessel;
		
		let vesselWidth = newVesselOffsets.right - newVesselOffsets.left;
		let vesselHeight = newVesselOffsets.bottom - newVesselOffsets.top;
		
		if(collisions.left && !collisions.right) {
			newVesselOffsets.left = offsets.collisionContainer.left;
			newVesselOffsets.right = newVesselOffsets.left + vesselWidth;
		}
		else if(collisions.right && !collisions.left) {
			newVesselOffsets.left = offsets.collisionContainer.right - vesselWidth;
			newVesselOffsets.right = newVesselOffsets.right;
		}
		
		if(collisions.top && !collisions.bottom) {
			newVesselOffsets.top = offsets.collisionContainer.top;
			newVesselOffsets.bottom = newVesselOffsets.top + vesselHeight;
		}
		else if(collisions.bottom && !collisions.top) {
			newVesselOffsets.bottom = offsets.collisionContainer.bottom;
			newVesselOffsets.top = newVesselOffsets.top - vesselHeight;
		}
		
		return offsets;
	}
}

export default Positioner;
export {DEFAULT_SETTINGS};