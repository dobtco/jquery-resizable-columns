/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat Sep 24 2016 14:00:33 GMT+0300 (GTB Summer Time)
 * @version v0.2.3
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
	function ResizableColumns($table, options) {
		_classCallCheck(this, ResizableColumns);

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, ResizableColumns.defaults, options);

		this.$window = $(window);
		this.$ownerDocument = $($table[0].ownerDocument);
		this.$table = $table;

		this.refreshHeaders();
		this.restoreColumnWidths();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
 Refreshes the headers associated with this instances <table/> element and
 generates handles for them. Also assigns percentage widths.
 
 @method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'refreshHeaders',
		value: function refreshHeaders() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign percentage widths first, then create drag handles
			this.assignPercentageWidths();
			this.createHandles();
		}

		/**
  Creates dummy handle elements for all table header columns
  
  @method createHandles
  **/
	}, {
		key: 'createHandles',
		value: function createHandles() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  
  @method assignPercentageWidths
  **/
	}, {
		key: 'assignPercentageWidths',
		value: function assignPercentageWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				// do not assign width if the column is not resizable
				if (el.hasAttribute(_constants.ATTRIBUTE_UNRESIZABLE)) return;

				var $el = $(el),
				    width = $el.outerWidth() / _this2.$table.width() * 100;

				$el.data(_constants.DATA_CSS_MIN_WIDTH, 0);
				$el.data(_constants.DATA_CSS_MAX_WIDTH, 100);

				var minWidth = _this2.computeMinCssWidths($el);
				if (minWidth != null) {
					$el.data(_constants.DATA_CSS_MIN_WIDTH, minWidth);
					width = Math.max(minWidth, width);
				}

				var maxWidth = _this2.computeMaxCssWidths($el);
				if (maxWidth != null) {
					$el.data(_constants.DATA_CSS_MAX_WIDTH, maxWidth);
					width = Math.min(maxWidth, width);
				}

				_this2.setWidth($el[0], width);
			});
		}

		/**
  Compute the minimum width taking into account CSS
  
  @method computeMinCssWidths
  @param $el {jQuery} jQuery-wrapped DOMElement for which we compute the minimum width
  **/
	}, {
		key: 'computeMinCssWidths',
		value: function computeMinCssWidths($el) {
			var el = undefined,
			    minWidth = undefined;
			minWidth = null;
			el = $el[0];
			if (this.options.obeyCssMinWidth) {
				if (el.style.minWidth.slice(-2) === 'px') {
					minWidth = parseFloat(el.style.minWidth) / this.$table.width() * 100;
				} else {
					minWidth = parseFloat(el.style.minWidth);
				}
				if (isNaN(minWidth)) {
					minWidth = null;
				}
			}
			return minWidth;
		}

		/**
  Compute the maximum width taking into account CSS
  
  @method computeMaxCssWidths
  @param $el {jQuery} jQuery-wrapped DOMElement for which we compute the maximum width
  **/
	}, {
		key: 'computeMaxCssWidths',
		value: function computeMaxCssWidths($el) {
			var el = undefined,
			    maxWidth = undefined;
			maxWidth = null;
			el = $el[0];
			if (this.options.obeyCssMaxWidth) {
				if (el.style.maxWidth.slice(-2) === 'px') {
					maxWidth = parseFloat(el.style.maxWidth) / this.$table.width() * 100;
				} else {
					maxWidth = parseFloat(el.style.maxWidth);
				}
				if (isNaN(maxWidth)) {
					maxWidth = null;
				}
			}
			return maxWidth;
		}

		/**
  
  
  @method syncHandleWidths
  **/
	}, {
		key: 'syncHandleWidths',
		value: function syncHandleWidths() {
			var _this3 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

				var $th = _this3.$tableHeaders.filter(':not(' + _constants.SELECTOR_UNRESIZABLE + ')').eq(_);

				var left = $th.outerWidth() + ($th.offset().left - _this3.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  Persists the column widths in localStorage
  
  @method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this4 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
				}
			});
		}

		/**
  Retrieves and sets the column widths from localStorage
  
  @method restoreColumnWidths
  **/
	}, {
		key: 'restoreColumnWidths',
		value: function restoreColumnWidths() {
			var _this5 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this5.options.store.get(_this5.generateColumnId($el));

					if (width != null) {
						_this5.setWidth(el, width);
					}
				}
			});
		}

		/**
  Pointer/mouse down handler
  
  @method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerDown',
		value: function onPointerDown(event) {
			// Only applies to left-click dragging
			if (event.which !== 1) {
				return;
			}

			// If a previous operation is defined, we missed the last mouseup.
			// Probably gobbled up by user mousing out the window then releasing.
			// We'll simulate a pointerup here prior to it
			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

			var leftWidth = this.parseWidth($leftColumn[0]);
			var rightWidth = this.parseWidth($rightColumn[0]);

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		/**
  Pointer/mouse movement handler
  
  @method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerMove',
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			// Determine the delta change between start and new mouse position, as a percentage of the table width
			var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined;

			if (difference > 0) {
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth($(rightColumn), op.widths.right - difference);
			} else if (difference < 0) {
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + difference);
				widthRight = this.constrainWidth($(rightColumn), op.widths.right + (op.widths.left - op.newWidths.left));
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		/**
  Pointer/mouse release handler
  
  @method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerUp',
		value: function onPointerUp(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.syncHandleWidths();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  
  @method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
	}, {
		key: 'destroy',
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		/**
  Binds given events for this instance to the given target DOMElement
  
  @private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
	}, {
		key: 'bindEvents',
		value: function bindEvents($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		/**
  Unbinds events specific to this instance from the given target DOMElement
  
  @private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
	}, {
		key: 'unbindEvents',
		value: function unbindEvents($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		/**
  Triggers an event on the <table/> element for a given type with given
  arguments, also setting and allowing access to the originalEvent if
  given. Returns the result of the triggered event.
  
  @private
  @method triggerEvent
  @param type {String} Event name
  @param args {Array} Array of arguments to pass through
  @param [originalEvent] If given, is set on the event object
  @return {Mixed} Result of the event trigger action
  **/
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		/**
  Calculates a unique column ID for a given column DOMElement
  
  @private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
	}, {
		key: 'generateColumnId',
		value: function generateColumnId($el) {
			return this.$table.data(_constants.DATA_COLUMNS_ID).replace(/\./g, '_') + '-' + $el.data(_constants.DATA_COLUMN_ID).replace(/\./g, '_');
		}

		/**
  Parses a given DOMElement's width into a float
  
  @private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
	}, {
		key: 'parseWidth',
		value: function parseWidth(element) {
			return element ? parseFloat(element.style.width.replace('%', '')) : 0;
		}

		/**
  Sets the percentage width of a given DOMElement
  
  @private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width, as a percentage, to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  
  @private
  @method constrainWidth
  @param $el {jQuery} jQuery-wrapped DOMElement
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth($el, width) {
			if (this.options.minWidth != undefined || this.options.obeyCssMinWidth) {
				width = Math.max(this.options.minWidth, width, $el.data(_constants.DATA_CSS_MIN_WIDTH));
			}

			if (this.options.maxWidth != undefined || this.options.obeyCssMaxWidth) {
				width = Math.min(this.options.maxWidth, width, $el.data(_constants.DATA_CSS_MAX_WIDTH));
			}

			width = Math.max(0, width);
			width = Math.min(100, width);

			return width;
		}

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  
  @private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
	}, {
		key: 'getPointerX',
		value: function getPointerX(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}
	}]);

	return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
	selector: function selector($table) {
		if ($table.find('thead').length) {
			return _constants.SELECTOR_TH;
		}

		return _constants.SELECTOR_TD;
	},
	store: window.store,
	syncHandlers: true,
	resizeFromBody: true,
	maxWidth: null,
	minWidth: 0.01,
	obeyCssMinWidth: false,
	obeyCssMaxWidth: false
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_CSS_MIN_WIDTH = 'cssMinWidth';
exports.DATA_CSS_MIN_WIDTH = DATA_CSS_MIN_WIDTH;
var DATA_CSS_MAX_WIDTH = 'cssMaxWidth';

exports.DATA_CSS_MAX_WIDTH = DATA_CSS_MAX_WIDTH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';

exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;
var ATTRIBUTE_UNRESIZABLE = 'data-noresize';
exports.ATTRIBUTE_UNRESIZABLE = ATTRIBUTE_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0RqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QUFDOzs7QUFFckQsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDakQsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDOztBQUNyQyxJQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLG9CQUFvQixvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0scUJBQXFCLEdBQUcsZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7cUJDbkJ4QixTQUFTOzs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IHtEQVRBX0FQSX0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XHJcblx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdGxldCAkdGFibGUgPSAkKHRoaXMpO1xyXG5cclxuXHRcdGxldCBhcGkgPSAkdGFibGUuZGF0YShEQVRBX0FQSSk7XHJcblx0XHRpZiAoIWFwaSkge1xyXG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XHJcblx0XHRcdCR0YWJsZS5kYXRhKERBVEFfQVBJLCBhcGkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zT3JNZXRob2QgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHJldHVybiBhcGlbb3B0aW9uc09yTWV0aG9kXSguLi5hcmdzKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcbiQucmVzaXphYmxlQ29sdW1ucyA9IFJlc2l6YWJsZUNvbHVtbnM7XHJcbiIsImltcG9ydCB7XHJcblx0REFUQV9BUEksXHJcblx0REFUQV9DT0xVTU5TX0lELFxyXG5cdERBVEFfQ09MVU1OX0lELFxyXG5cdERBVEFfQ1NTX01JTl9XSURUSCxcclxuXHREQVRBX0NTU19NQVhfV0lEVEgsXHJcblx0Q0xBU1NfVEFCTEVfUkVTSVpJTkcsXHJcblx0Q0xBU1NfQ09MVU1OX1JFU0laSU5HLFxyXG5cdENMQVNTX0hBTkRMRSxcclxuXHRDTEFTU19IQU5ETEVfQ09OVEFJTkVSLFxyXG5cdEVWRU5UX1JFU0laRV9TVEFSVCxcclxuXHRFVkVOVF9SRVNJWkUsXHJcblx0RVZFTlRfUkVTSVpFX1NUT1AsXHJcblx0U0VMRUNUT1JfVEgsXHJcblx0U0VMRUNUT1JfVEQsXHJcblx0U0VMRUNUT1JfVU5SRVNJWkFCTEUsXHJcblx0QVRUUklCVVRFX1VOUkVTSVpBQkxFXHJcbn1cclxuZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcclxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXHJcblxyXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xyXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxyXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxyXG4qKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XHJcblx0Y29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHRcdHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZVswXS5vd25lckRvY3VtZW50KTtcclxuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xyXG5cclxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcclxuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcclxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHBlcmNlbnRhZ2Ugd2lkdGhzLlxyXG5cclxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXHJcblx0KiovXHJcblx0cmVmcmVzaEhlYWRlcnMoKSB7XHJcblx0XHQvLyBBbGxvdyB0aGUgc2VsZWN0b3IgdG8gYmUgYm90aCBhIHJlZ3VsYXIgc2VsY3RvciBzdHJpbmcgYXMgd2VsbCBhc1xyXG5cdFx0Ly8gYSBkeW5hbWljIGNhbGxiYWNrXHJcblx0XHRsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XHJcblx0XHRpZih0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xyXG5cclxuXHRcdC8vIEFzc2lnbiBwZXJjZW50YWdlIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXHJcblx0XHR0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcclxuXHRcdHRoaXMuY3JlYXRlSGFuZGxlcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xyXG5cclxuXHRAbWV0aG9kIGNyZWF0ZUhhbmRsZXNcclxuXHQqKi9cclxuXHRjcmVhdGVIYW5kbGVzKCkge1xyXG5cdFx0bGV0IHJlZiA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lcjtcclxuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xyXG5cdFx0XHRyZWYucmVtb3ZlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxyXG5cdFx0dGhpcy4kdGFibGUuYmVmb3JlKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkY3VycmVudCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpKTtcclxuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcclxuXHJcblx0XHRcdGlmICgkbmV4dC5sZW5ndGggPT09IDAgfHwgJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcclxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxyXG5cclxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcclxuXHQqKi9cclxuXHRhc3NpZ25QZXJjZW50YWdlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdC8vIGRvIG5vdCBhc3NpZ24gd2lkdGggaWYgdGhlIGNvbHVtbiBpcyBub3QgcmVzaXphYmxlXHJcblx0XHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoQVRUUklCVVRFX1VOUkVTSVpBQkxFKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgJGVsID0gJChlbCksXHJcblx0XHRcdFx0d2lkdGggPSAoJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkpICogMTAwO1xyXG5cdFx0XHRcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCAwKTtcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCAxMDApO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aCB0YWtpbmcgaW50byBhY2NvdW50IENTU1xyXG5cclxuXHRAbWV0aG9kIGNvbXB1dGVNaW5Dc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1pbmltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWluQ3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtaW5XaWR0aDtcclxuXHRcdG1pbldpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsWzBdO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWluV2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1pbldpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5taW5XaWR0aCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5taW5XaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1pbldpZHRoKSkge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1pbldpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29tcHV0ZSB0aGUgbWF4aW11bSB3aWR0aCB0YWtpbmcgaW50byBhY2NvdW50IENTU1xyXG5cclxuXHRAbWV0aG9kIGNvbXB1dGVNYXhDc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1heGltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtYXhXaWR0aDtcclxuXHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsWzBdO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1heFdpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1heFdpZHRoKSkge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1heFdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCAkdGggPSB0aGlzLiR0YWJsZUhlYWRlcnMuZmlsdGVyKGA6bm90KCR7U0VMRUNUT1JfVU5SRVNJWkFCTEV9KWApLmVxKF8pO1xyXG5cclxuXHRcdFx0bGV0IGxlZnQgPSAkdGgub3V0ZXJXaWR0aCgpICsgKCR0aC5vZmZzZXQoKS5sZWZ0IC0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnQpO1xyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGVyc2lzdHMgdGhlIGNvbHVtbiB3aWR0aHMgaW4gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHNhdmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5zdG9yZS5zZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKSxcclxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJldHJpZXZlcyBhbmQgc2V0cyB0aGUgY29sdW1uIHdpZHRocyBmcm9tIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMub3B0aW9ucy5zdG9yZS5nZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyRG93bihldmVudCkge1xyXG5cdFx0Ly8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcclxuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxyXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXHJcblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XHJcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xyXG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBncmlwSW5kZXggPSAkY3VycmVudEdyaXAuaW5kZXgoKTtcclxuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXgpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XHJcblx0XHRsZXQgJHJpZ2h0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCArIDEpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XHJcblxyXG5cdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkbGVmdENvbHVtblswXSk7XHJcblx0XHRsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW5bMF0pO1xyXG5cclxuXHRcdHRoaXMub3BlcmF0aW9uID0ge1xyXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLCAkY3VycmVudEdyaXAsXHJcblxyXG5cdFx0XHRzdGFydFg6IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpLFxyXG5cclxuXHRcdFx0d2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXHJcblx0XHRcdH0sXHJcblx0XHRcdG5ld1dpZHRoczoge1xyXG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcclxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSwgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdCRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQoJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKCRjdXJyZW50R3JpcClcclxuXHRcdFx0LmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUQVJULCBbXHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXHJcblx0XHRcdGxlZnRXaWR0aCwgcmlnaHRXaWR0aFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxyXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSAodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcclxuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW5bMF07XHJcblx0XHRsZXQgcmlnaHRDb2x1bW4gPSBvcC4kcmlnaHRDb2x1bW5bMF07XHJcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xyXG5cclxuXHRcdGlmKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChsZWZ0Q29sdW1uKSwgb3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XHJcblx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoZGlmZmVyZW5jZSA8IDApIHtcclxuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKHJpZ2h0Q29sdW1uKSwgb3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZihsZWZ0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgobGVmdENvbHVtbiwgd2lkdGhMZWZ0KTtcclxuXHRcdH1cclxuXHRcdGlmKHJpZ2h0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgocmlnaHRDb2x1bW4sIHdpZHRoUmlnaHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9wLm5ld1dpZHRocy5sZWZ0ID0gd2lkdGhMZWZ0O1xyXG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdHdpZHRoTGVmdCwgd2lkdGhSaWdodFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyVXBcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJVcChldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0b3AuJGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZChvcC4kcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQob3AuJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcclxuXHRcdHRoaXMuc2F2ZUNvbHVtbldpZHRocygpO1xyXG5cclxuXHRcdHRoaXMub3BlcmF0aW9uID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUT1AsIFtcclxuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcclxuXHRcdFx0b3AubmV3V2lkdGhzLmxlZnQsIG9wLm5ld1dpZHRocy5yaWdodFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycywgZGF0YSwgYW5kIGFkZGVkIERPTSBlbGVtZW50cy4gVGFrZXNcclxuXHR0aGUgPHRhYmxlLz4gZWxlbWVudCBiYWNrIHRvIGhvdyBpdCB3YXMsIGFuZCByZXR1cm5zIGl0XHJcblxyXG5cdEBtZXRob2QgZGVzdHJveVxyXG5cdEByZXR1cm4ge2pRdWVyeX0gT3JpZ2luYWwgalF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50XHJcblx0KiovXHJcblx0ZGVzdHJveSgpIHtcclxuXHRcdGxldCAkdGFibGUgPSB0aGlzLiR0YWJsZTtcclxuXHRcdGxldCAkaGFuZGxlcyA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpO1xyXG5cclxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKFxyXG5cdFx0XHR0aGlzLiR3aW5kb3dcclxuXHRcdFx0XHQuYWRkKHRoaXMuJG93bmVyRG9jdW1lbnQpXHJcblx0XHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0XHQuYWRkKCRoYW5kbGVzKVxyXG5cdFx0KTtcclxuXHJcblx0XHQkdGFibGUucmVtb3ZlRGF0YShEQVRBX0FQSSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZSA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuICR0YWJsZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEJpbmRzIGdpdmVuIGV2ZW50cyBmb3IgdGhpcyBpbnN0YW5jZSB0byB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGJpbmRFdmVudHNcclxuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byBiaW5kXHJcblx0QHBhcmFtIHNlbGVjdG9yT3JDYWxsYmFjayB7U3RyaW5nfEZ1bmN0aW9ufSBTZWxlY3RvciBzdHJpbmcgb3IgY2FsbGJhY2tcclxuXHRAcGFyYW0gW2NhbGxiYWNrXSB7RnVuY3Rpb259IENhbGxiYWNrIG1ldGhvZFxyXG5cdCoqL1xyXG5cdGJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMykge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjayk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRVbmJpbmRzIGV2ZW50cyBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB1bmJpbmRFdmVudHNcclxuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gdW5iaW5kIGV2ZW50cyBmcm9tXHJcblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gdW5iaW5kXHJcblx0KiovXHJcblx0dW5iaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cykge1xyXG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoZXZlbnRzICE9IG51bGwpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGV2ZW50cyA9IHRoaXMubnM7XHJcblx0XHR9XHJcblxyXG5cdFx0JHRhcmdldC5vZmYoZXZlbnRzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxyXG5cdGFyZ3VtZW50cywgYWxzbyBzZXR0aW5nIGFuZCBhbGxvd2luZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsRXZlbnQgaWZcclxuXHRnaXZlbi4gUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSB0cmlnZ2VyZWQgZXZlbnQuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0cmlnZ2VyRXZlbnRcclxuXHRAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXHJcblx0QHBhcmFtIGFyZ3Mge0FycmF5fSBBcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyB0aHJvdWdoXHJcblx0QHBhcmFtIFtvcmlnaW5hbEV2ZW50XSBJZiBnaXZlbiwgaXMgc2V0IG9uIHRoZSBldmVudCBvYmplY3RcclxuXHRAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxyXG5cdCoqL1xyXG5cdHRyaWdnZXJFdmVudCh0eXBlLCBhcmdzLCBvcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xyXG5cdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCkge1xyXG5cdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgY29sdW1uIElEIGZvciBhIGdpdmVuIGNvbHVtbiBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZUNvbHVtbklkXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBjb2x1bW4gZWxlbWVudFxyXG5cdEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXHJcblx0KiovXHJcblx0Z2VuZXJhdGVDb2x1bW5JZCgkZWwpIHtcclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkucmVwbGFjZSgvXFwuL2csICdfJykgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCkucmVwbGFjZSgvXFwuL2csICdfJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQYXJzZXMgYSBnaXZlbiBET01FbGVtZW50J3Mgd2lkdGggaW50byBhIGZsb2F0XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBwYXJzZVdpZHRoXHJcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gZ2V0IHdpZHRoIG9mXHJcblx0QHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxyXG5cdCoqL1xyXG5cdHBhcnNlV2lkdGgoZWxlbWVudCkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnQgPyBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgnJScsICcnKSkgOiAwO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0U2V0cyB0aGUgcGVyY2VudGFnZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHNldFdpZHRoXHJcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gc2V0IHdpZHRoIG9uXHJcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoLCBhcyBhIHBlcmNlbnRhZ2UsIHRvIHNldFxyXG5cdCoqL1xyXG5cdHNldFdpZHRoKGVsZW1lbnQsIHdpZHRoKSB7XHJcblx0XHR3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XHJcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcclxuXHRcdGVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aCArICclJztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxyXG5cdHRoZSBgbWluV2lkdGhgIGFuZCBgbWF4V2lkdGhgIGNvbmZpZ3VyYXRpb24gb3B0aW9ucywgcmVzcGVjdGl2ZWx5LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29uc3RyYWluV2lkdGhcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnRcclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gY29uc3RyYWluXHJcblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbnN0cmFpbldpZHRoKCRlbCwgd2lkdGgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWluV2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCB8fCB0aGlzLm9wdGlvbnMub2JleUNzc01heFdpZHRoKSB7XHJcblx0XHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heFdpZHRoLCB3aWR0aCwgJGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRIKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0d2lkdGggPSBNYXRoLm1heCgwLCB3aWR0aCk7XHJcbiBcdFx0d2lkdGggPSBNYXRoLm1pbigxMDAsIHdpZHRoKTtcclxuXHJcblx0XHRyZXR1cm4gd2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcclxuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcclxuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcclxuXHQqKi9cclxuXHRnZXRQb2ludGVyWChldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcclxuXHR9XHJcbn1cclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XHJcblx0c2VsZWN0b3I6IGZ1bmN0aW9uKCR0YWJsZSkge1xyXG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XHJcblx0fSxcclxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxyXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcclxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcclxuXHRtYXhXaWR0aDogbnVsbCxcclxuXHRtaW5XaWR0aDogMC4wMSxcclxuXHRvYmV5Q3NzTWluV2lkdGg6IGZhbHNlLFxyXG4gXHRvYmV5Q3NzTWF4V2lkdGg6IGZhbHNlXHJcbn07XHJcblxyXG5SZXNpemFibGVDb2x1bW5zLmNvdW50ID0gMDtcclxuIiwiZXhwb3J0IGNvbnN0IERBVEFfQVBJID0gJ3Jlc2l6YWJsZUNvbHVtbnMnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW4taWQnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUlOX1dJRFRIID0gJ2Nzc01pbldpZHRoJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ1NTX01BWF9XSURUSCA9ICdjc3NNYXhXaWR0aCc7XHJcblxyXG5leHBvcnQgY29uc3QgQ0xBU1NfVEFCTEVfUkVTSVpJTkcgPSAncmMtdGFibGUtcmVzaXppbmcnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfQ09MVU1OX1JFU0laSU5HID0gJ3JjLWNvbHVtbi1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRV9DT05UQUlORVIgPSAncmMtaGFuZGxlLWNvbnRhaW5lcic7XHJcblxyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFID0gJ2NvbHVtbjpyZXNpemUnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUT1AgPSAnY29sdW1uOnJlc2l6ZTpzdG9wJztcclxuXHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9USCA9ICd0cjpmaXJzdCA+IHRoOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEQgPSAndHI6Zmlyc3QgPiB0ZDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XHJcblxyXG5leHBvcnQgY29uc3QgQVRUUklCVVRFX1VOUkVTSVpBQkxFID0gJ2RhdGEtbm9yZXNpemUnO1xyXG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il19
