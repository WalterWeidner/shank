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
		if(element === window) {
			return {bottom: window.innerHeight, left: 0, right: window.innerWidth, top: 0};
		}
		
		let {bottom, left, right, top} = element.getBoundingClientRect();
		return {bottom, left, right, top};
	}
}