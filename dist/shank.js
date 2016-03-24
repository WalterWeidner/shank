/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Shank = function () {
		function Shank(anchor, anchored, options) {
			_classCallCheck(this, Shank);

			if (!anchor) {
				throw new Error('Missing argument \'anchor\'. Anchor must be supplied for Shank to work properly');
			}

			if (!anchored) {
				throw new Error('Missing argument \'anchored\'. Anchored must be supplied for Shank to work properly');
			}

			this.anchor = this._getElement(anchor);
			this.anchored = this._getElement(anchored);

			this._setInitialPosition();
		}

		_createClass(Shank, [{
			key: '_getElement',
			value: function _getElement(selector) {
				if (typeof selector === 'string') {
					return document.querySelector(selector);
				}
				if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object') {
					return selector;
				}

				throw new Error('Invalid argument. Expecting CSS selector or DOM element');
			}
		}, {
			key: '_setInitialPosition',
			value: function _setInitialPosition() {
				document.body.appendChild(this.anchored);

				this.anchored.style.position = 'absolute';
				this.anchored.style.top = '0';
				this.anchored.style.left = '0';
			}
		}]);

		return Shank;
	}();

	window.Shank = Shank;
	module.exports = Shank;

/***/ }
/******/ ]);
