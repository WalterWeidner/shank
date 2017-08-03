export default {
	getElement(selector) {
		if(typeof selector === 'string' && selector !== 'window') {
			return document.querySelector(selector);
		}
		else if(selector == 'window') {
			return window;
		}

		if(typeof selector === 'object') {
			return selector;
		}

		throw new Error('Invalid argument. Expecting CSS selector or DOM element');
	},

	getOffsets(element) {
		let scrollTop, scrollLeft;

		if(element === window) {
			scrollLeft = window.scrollX;
			scrollTop = window.scrollY;

			return {
				bottom: window.innerHeight + scrollTop,
				left: 0 + scrollLeft,
				right: window.innerWidth + scrollLeft,
				top: 0 + scrollTop
			};
		}

		const {bottom, left, right, top} = element.getBoundingClientRect();

		scrollTop = document.body.scrollTop;
		scrollLeft = document.body.scrollLeft;

		return {
			bottom: bottom + scrollTop,
			left: left + scrollLeft,
			right: right + scrollLeft,
			top: top + scrollTop
		};
	}
}
