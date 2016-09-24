/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat Sep 24 2016 13:41:37 GMT+0300 (GTB Summer Time)
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
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0RqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QUM7O0FBQ3JDLElBQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sb0JBQW9CLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUM7Ozs7Ozs7Ozs7OztxQkNuQnhCLFNBQVM7Ozs7dUJBQ2xCLFdBQVciLCJmaWxlIjoianF1ZXJ5LnJlc2l6YWJsZUNvbHVtbnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xyXG5pbXBvcnQge0RBVEFfQVBJfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG4kLmZuLnJlc2l6YWJsZUNvbHVtbnMgPSBmdW5jdGlvbihvcHRpb25zT3JNZXRob2QsIC4uLmFyZ3MpIHtcclxuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XHJcblxyXG5cdFx0bGV0IGFwaSA9ICR0YWJsZS5kYXRhKERBVEFfQVBJKTtcclxuXHRcdGlmICghYXBpKSB7XHJcblx0XHRcdGFwaSA9IG5ldyBSZXNpemFibGVDb2x1bW5zKCR0YWJsZSwgb3B0aW9uc09yTWV0aG9kKTtcclxuXHRcdFx0JHRhYmxlLmRhdGEoREFUQV9BUEksIGFwaSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnNPck1ldGhvZCA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG5cclxuJC5yZXNpemFibGVDb2x1bW5zID0gUmVzaXphYmxlQ29sdW1ucztcclxuIiwiaW1wb3J0IHtcclxuXHREQVRBX0FQSSxcclxuXHREQVRBX0NPTFVNTlNfSUQsXHJcblx0REFUQV9DT0xVTU5fSUQsXHJcblx0REFUQV9DU1NfTUlOX1dJRFRILFxyXG5cdERBVEFfQ1NTX01BWF9XSURUSCxcclxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcclxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXHJcblx0Q0xBU1NfSEFORExFLFxyXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXHJcblx0RVZFTlRfUkVTSVpFX1NUQVJULFxyXG5cdEVWRU5UX1JFU0laRSxcclxuXHRFVkVOVF9SRVNJWkVfU1RPUCxcclxuXHRTRUxFQ1RPUl9USCxcclxuXHRTRUxFQ1RPUl9URCxcclxuXHRTRUxFQ1RPUl9VTlJFU0laQUJMRSxcclxuXHRBVFRSSUJVVEVfVU5SRVNJWkFCTEVcclxufVxyXG5mcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG4vKipcclxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxyXG5tb2JpbGUgYW5kIGRlc2t0b3AgY2xpZW50cy5cclxuXHJcbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXHJcbkBwYXJhbSAkdGFibGUge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50IHRvIG1ha2UgcmVzaXphYmxlXHJcbkBwYXJhbSBvcHRpb25zIHtPYmplY3R9IENvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbioqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGVDb2x1bW5zIHtcclxuXHRjb25zdHJ1Y3RvcigkdGFibGUsIG9wdGlvbnMpIHtcclxuXHRcdHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy4kd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdFx0dGhpcy4kb3duZXJEb2N1bWVudCA9ICQoJHRhYmxlWzBdLm93bmVyRG9jdW1lbnQpO1xyXG5cdFx0dGhpcy4kdGFibGUgPSAkdGFibGU7XHJcblxyXG5cdFx0dGhpcy5yZWZyZXNoSGVhZGVycygpO1xyXG5cdFx0dGhpcy5yZXN0b3JlQ29sdW1uV2lkdGhzKCk7XHJcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5zeW5jSGFuZGxlV2lkdGhzLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RhcnQpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RBUlQsIHRoaXMub3B0aW9ucy5zdGFydCk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnJlc2l6ZSkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRSwgdGhpcy5vcHRpb25zLnJlc2l6ZSk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3ApIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RPUCwgdGhpcy5vcHRpb25zLnN0b3ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmVmcmVzaGVzIHRoZSBoZWFkZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGluc3RhbmNlcyA8dGFibGUvPiBlbGVtZW50IGFuZFxyXG5cdGdlbmVyYXRlcyBoYW5kbGVzIGZvciB0aGVtLiBBbHNvIGFzc2lnbnMgcGVyY2VudGFnZSB3aWR0aHMuXHJcblxyXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcclxuXHQqKi9cclxuXHRyZWZyZXNoSGVhZGVycygpIHtcclxuXHRcdC8vIEFsbG93IHRoZSBzZWxlY3RvciB0byBiZSBib3RoIGEgcmVndWxhciBzZWxjdG9yIHN0cmluZyBhcyB3ZWxsIGFzXHJcblx0XHQvLyBhIGR5bmFtaWMgY2FsbGJhY2tcclxuXHRcdGxldCBzZWxlY3RvciA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcclxuXHRcdGlmKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gdGhpcy4kdGFibGUuZmluZChzZWxlY3Rvcik7XHJcblxyXG5cdFx0Ly8gQXNzaWduIHBlcmNlbnRhZ2Ugd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcclxuXHRcdHRoaXMuYXNzaWduUGVyY2VudGFnZVdpZHRocygpO1xyXG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXHJcblxyXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xyXG5cdCoqL1xyXG5cdGNyZWF0ZUhhbmRsZXMoKSB7XHJcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xyXG5cdFx0aWYgKHJlZiAhPSBudWxsKSB7XHJcblx0XHRcdHJlZi5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRV9DT05UQUlORVJ9JyAvPmApXHJcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaSwgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xyXG5cdFx0XHRsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xyXG5cclxuXHRcdFx0aWYgKCRuZXh0Lmxlbmd0aCA9PT0gMCB8fCAkY3VycmVudC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkgfHwgJG5leHQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgJGhhbmRsZSA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFfScgLz5gKVxyXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJGhhbmRsZUNvbnRhaW5lciwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCAnLicrQ0xBU1NfSEFORExFLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRBc3NpZ25zIGEgcGVyY2VudGFnZSB3aWR0aCB0byBhbGwgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHBpeGVsIHdpZHRoKHMpXHJcblxyXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSkgKiAxMDA7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIDEwMCk7XHJcblxyXG5cdFx0XHRsZXQgbWluV2lkdGggPSB0aGlzLmNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1pbldpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIG1pbldpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWF4KG1pbldpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgbWF4V2lkdGggPSB0aGlzLmNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1heFdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIG1heFdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbFswXSwgd2lkdGgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBtZXRob2QgY29tcHV0ZU1pbkNzc1dpZHRoc1xyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCBmb3Igd2hpY2ggd2UgY29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKSB7XHJcblx0XHRsZXQgZWwsIG1pbldpZHRoO1xyXG5cdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0ZWwgPSAkZWxbMF07XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHRpZiAoZWwuc3R5bGUubWluV2lkdGguc2xpY2UoLTIpID09PSAncHgnKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNOYU4obWluV2lkdGgpKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWluV2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBtZXRob2QgY29tcHV0ZU1heENzc1dpZHRoc1xyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCBmb3Igd2hpY2ggd2UgY29tcHV0ZSB0aGUgbWF4aW11bSB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKSB7XHJcblx0XHRsZXQgZWwsIG1heFdpZHRoO1xyXG5cdFx0bWF4V2lkdGggPSBudWxsO1xyXG5cdFx0ZWwgPSAkZWxbMF07XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm9iZXlDc3NNYXhXaWR0aCkge1xyXG5cdFx0XHRpZiAoZWwuc3R5bGUubWF4V2lkdGguc2xpY2UoLTIpID09PSAncHgnKSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1heFdpZHRoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1heFdpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNOYU4obWF4V2lkdGgpKSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWF4V2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1xyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHMoKSB7XHJcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cclxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSk7XHJcblxyXG5cdFx0JGNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHkgP1xyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xyXG5cclxuXHRcdFx0bGV0ICR0aCA9IHRoaXMuJHRhYmxlSGVhZGVycy5maWx0ZXIoYDpub3QoJHtTRUxFQ1RPUl9VTlJFU0laQUJMRX0pYCkuZXEoXyk7XHJcblxyXG5cdFx0XHRsZXQgbGVmdCA9ICR0aC5vdXRlcldpZHRoKCkgKyAoJHRoLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdCk7XHJcblxyXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQZXJzaXN0cyB0aGUgY29sdW1uIHdpZHRocyBpbiBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCBzYXZlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0c2F2ZUNvbHVtbldpZHRocygpIHtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3JlICYmICEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldChcclxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxyXG5cdFx0XHRcdFx0dGhpcy5wYXJzZVdpZHRoKGVsKVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2QgcmVzdG9yZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYodGhpcy5vcHRpb25zLnN0b3JlICYmICEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcclxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0aWYod2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0dGhpcy5zZXRXaWR0aChlbCwgd2lkdGgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIGRvd24gaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlckRvd25cclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJEb3duKGV2ZW50KSB7XHJcblx0XHQvLyBPbmx5IGFwcGxpZXMgdG8gbGVmdC1jbGljayBkcmFnZ2luZ1xyXG5cdFx0aWYoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gSWYgYSBwcmV2aW91cyBvcGVyYXRpb24gaXMgZGVmaW5lZCwgd2UgbWlzc2VkIHRoZSBsYXN0IG1vdXNldXAuXHJcblx0XHQvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cclxuXHRcdC8vIFdlJ2xsIHNpbXVsYXRlIGEgcG9pbnRlcnVwIGhlcmUgcHJpb3IgdG8gaXRcclxuXHRcdGlmKHRoaXMub3BlcmF0aW9uKSB7XHJcblx0XHRcdHRoaXMub25Qb2ludGVyVXAoZXZlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIElnbm9yZSBub24tcmVzaXphYmxlIGNvbHVtbnNcclxuXHRcdGxldCAkY3VycmVudEdyaXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xyXG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4ICsgMSkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHJcblx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcclxuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSB7XHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcclxuXHJcblx0XHRcdHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXHJcblxyXG5cdFx0XHR3aWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcclxuXHRcdFx0fSxcclxuXHRcdFx0bmV3V2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0JGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcclxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJNb3ZlXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyTW92ZShldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBkZWx0YSBjaGFuZ2UgYmV0d2VlbiBzdGFydCBhbmQgbmV3IG1vdXNlIHBvc2l0aW9uLCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRhYmxlIHdpZHRoXHJcblx0XHRsZXQgZGlmZmVyZW5jZSA9ICh0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSAtIG9wLnN0YXJ0WCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0aWYoZGlmZmVyZW5jZSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGxlZnRDb2x1bW4gPSBvcC4kbGVmdENvbHVtblswXTtcclxuXHRcdGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcclxuXHRcdGxldCB3aWR0aExlZnQsIHdpZHRoUmlnaHQ7XHJcblxyXG5cdFx0aWYoZGlmZmVyZW5jZSA+IDApIHtcclxuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpKTtcclxuXHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChyaWdodENvbHVtbiksIG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xyXG5cdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQobGVmdENvbHVtbiksIG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGxlZnRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChsZWZ0Q29sdW1uLCB3aWR0aExlZnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYocmlnaHRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XHJcblx0XHR9XHJcblxyXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XHJcblx0XHRvcC5uZXdXaWR0aHMucmlnaHQgPSB3aWR0aFJpZ2h0O1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcclxuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcclxuXHRcdFx0d2lkdGhMZWZ0LCB3aWR0aFJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSByZWxlYXNlIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJVcFxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlclVwKGV2ZW50KSB7XHJcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcclxuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcclxuXHJcblx0XHRvcC4kbGVmdENvbHVtblxyXG5cdFx0XHQuYWRkKG9wLiRyaWdodENvbHVtbilcclxuXHRcdFx0LmFkZChvcC4kY3VycmVudEdyaXApXHJcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xyXG5cclxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xyXG5cdFx0dGhpcy5zYXZlQ29sdW1uV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHRvcC5uZXdXaWR0aHMubGVmdCwgb3AubmV3V2lkdGhzLnJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLCBkYXRhLCBhbmQgYWRkZWQgRE9NIGVsZW1lbnRzLiBUYWtlc1xyXG5cdHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcclxuXHJcblx0QG1ldGhvZCBkZXN0cm95XHJcblx0QHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcclxuXHQqKi9cclxuXHRkZXN0cm95KCkge1xyXG5cdFx0bGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xyXG5cdFx0bGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSk7XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHMoXHJcblx0XHRcdHRoaXMuJHdpbmRvd1xyXG5cdFx0XHRcdC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcclxuXHRcdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHRcdC5hZGQoJGhhbmRsZXMpXHJcblx0XHQpO1xyXG5cclxuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcclxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xyXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXHJcblx0KiovXHJcblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcclxuXHQqKi9cclxuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXHJcblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxyXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxyXG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcclxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcclxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxyXG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXHJcblx0KiovXHJcblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XHJcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XHJcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2ZcclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XHJcblx0KiovXHJcblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCclJywgJycpKSA6IDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRTZXRzIHRoZSBwZXJjZW50YWdlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc2V0V2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGgsIGFzIGEgcGVyY2VudGFnZSwgdG8gc2V0XHJcblx0KiovXHJcblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcclxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcclxuXHRcdHdpZHRoID0gd2lkdGggPiAwID8gd2lkdGggOiAwO1xyXG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXHJcblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudFxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXHJcblx0KiovXHJcblx0Y29uc3RyYWluV2lkdGgoJGVsLCB3aWR0aCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5taW5XaWR0aCAhPSB1bmRlZmluZWQgfHwgdGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGgsICRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWF4V2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHR3aWR0aCA9IE1hdGgubWF4KDAsIHdpZHRoKTtcclxuIFx0XHR3aWR0aCA9IE1hdGgubWluKDEwMCwgd2lkdGgpO1xyXG5cclxuXHRcdHJldHVybiB3aWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEdpdmVuIGEgcGFydGljdWxhciBFdmVudCBvYmplY3QsIHJldHJpZXZlcyB0aGUgY3VycmVudCBwb2ludGVyIG9mZnNldCBhbG9uZ1xyXG5cdHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xyXG5cdHBvaW50ZXItbGlrZSBzeXN0ZW1zIChtb2JpbGVzLCB0YWJsZXRzIGV0Yy4pXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZXRQb2ludGVyWFxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxyXG5cdCoqL1xyXG5cdGdldFBvaW50ZXJYKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pLnBhZ2VYO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGV2ZW50LnBhZ2VYO1xyXG5cdH1cclxufVxyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cyA9IHtcclxuXHRzZWxlY3RvcjogZnVuY3Rpb24oJHRhYmxlKSB7XHJcblx0XHRpZigkdGFibGUuZmluZCgndGhlYWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFNFTEVDVE9SX1RIO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBTRUxFQ1RPUl9URDtcclxuXHR9LFxyXG5cdHN0b3JlOiB3aW5kb3cuc3RvcmUsXHJcblx0c3luY0hhbmRsZXJzOiB0cnVlLFxyXG5cdHJlc2l6ZUZyb21Cb2R5OiB0cnVlLFxyXG5cdG1heFdpZHRoOiBudWxsLFxyXG5cdG1pbldpZHRoOiAwLjAxLFxyXG5cdG9iZXlDc3NNaW5XaWR0aDogZmFsc2UsXHJcbiBcdG9iZXlDc3NNYXhXaWR0aDogZmFsc2VcclxufTtcclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuY291bnQgPSAwO1xyXG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTlNfSUQgPSAncmVzaXphYmxlLWNvbHVtbnMtaWQnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5fSUQgPSAncmVzaXphYmxlLWNvbHVtbi1pZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NSU5fV0lEVEggPSAnY3NzTWluV2lkdGgnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUFYX1dJRFRIID0gJ2Nzc01heFdpZHRoJztcclxuXHJcbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9SRVNJWklORyA9ICdyYy10YWJsZS1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFX0NPTlRBSU5FUiA9ICdyYy1oYW5kbGUtY29udGFpbmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RBUlQgPSAnY29sdW1uOnJlc2l6ZTpzdGFydCc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkUgPSAnY29sdW1uOnJlc2l6ZSc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1RIID0gJ3RyOmZpcnN0ID4gdGg6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVU5SRVNJWkFCTEUgPSBgW2RhdGEtbm9yZXNpemVdYDtcclxuXHJcbmV4cG9ydCBjb25zdCBBVFRSSUJVVEVfVU5SRVNJWkFCTEUgPSAnZGF0YS1ub3Jlc2l6ZSc7XHJcbiIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xyXG5pbXBvcnQgYWRhcHRlciBmcm9tICcuL2FkYXB0ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzaXphYmxlQ29sdW1uczsiXX0=
