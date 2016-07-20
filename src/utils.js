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
	}
}