/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat May 16 2015 17:15:18 GMT+0100 (BST)
 * @version v0.1.0
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
			return api[optionsOrMethod].apply(api, args);
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

	_createClass(ResizableColumns, [{
		key: 'refreshHeaders',

		/**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns percentage widths.
  	@method refreshHeaders
  **/
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
	}, {
		key: 'createHandles',

		/**
  Creates dummy handle elements for all table header columns
  	@method createHandles
  **/
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

				if ($next.length === 0 || $current.data(_constants.DATA_NO_RESIZE) || $next.data(_constants.DATA_NO_RESIZE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}
	}, {
		key: 'assignPercentageWidths',

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  	@method assignPercentageWidths
  **/
		value: function assignPercentageWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				_this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
			});
		}
	}, {
		key: 'syncHandleWidths',

		/**
  
  @method syncHandleWidths
  **/
		value: function syncHandleWidths() {
			var _this3 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}
	}, {
		key: 'saveColumnWidths',

		/**
  Persists the column widths in localStorage
  	@method saveColumnWidths
  **/
		value: function saveColumnWidths() {
			var _this4 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this4.options.store && $el.data(_constants.DATA_NO_RESIZE) == null) {
					_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
				}
			});
		}
	}, {
		key: 'restoreColumnWidths',

		/**
  Retrieves and sets the column widths from localStorage
  	@method restoreColumnWidths
  **/
		value: function restoreColumnWidths() {
			var _this5 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this5.options.store && $el.data(_constants.DATA_NO_RESIZE) == null) {
					var width = _this5.options.store.get(_this5.generateColumnId($el));

					if (width != null) {
						_this5.setWidth(el, width);
					}
				}
			});
		}
	}, {
		key: 'onPointerDown',

		/**
  Pointer/mouse down handler
  	@method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
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

			var $currentGrip = $(event.currentTarget);
			var $leftColumn = $currentGrip.data(_constants.DATA_TH);
			var $rightColumn = this.$tableHeaders.eq(this.$tableHeaders.index($leftColumn) + 1);

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
	}, {
		key: 'onPointerMove',

		/**
  Pointer/mouse movement handler
  	@method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			var widthLeft = this.constrainWidth(op.widths.left + difference);
			var widthRight = this.constrainWidth(op.widths.right - difference);

			this.setWidth(op.$leftColumn[0], widthLeft);
			this.setWidth(op.$rightColumn[0], widthRight);

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}
	}, {
		key: 'onPointerUp',

		/**
  Pointer/mouse release handler
  	@method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
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
	}, {
		key: 'destroy',

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  	@method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$handles.removeData(_constants.DATA_TH);
			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}
	}, {
		key: 'bindEvents',

		/**
  Binds given events for this instance to the given target DOMElement
  	@private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
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
	}, {
		key: 'unbindEvents',

		/**
  Unbinds events specific to this instance from the given target DOMElement
  	@private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
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
	}, {
		key: 'triggerEvent',

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
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}
	}, {
		key: 'generateColumnId',

		/**
  Calculates a unique column ID for a given column DOMElement
  	@private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
		value: function generateColumnId($el) {
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
		}
	}, {
		key: 'parseWidth',

		/**
  Parses a given DOMElement's width into a float
  	@private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
		value: function parseWidth(element) {
			return parseFloat(element.style.width.replace('%', ''));
		}
	}, {
		key: 'setWidth',

		/**
  Sets the percentage width of a given DOMElement
  	@private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width, as a percentage, to set
  **/
		value: function setWidth(element, width) {
			!width && console.trace();
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}
	}, {
		key: 'constrainWidth',

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  	@private
  @method constrainWidth
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
		value: function constrainWidth(width) {
			if (this.options.minWidth != null) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != null) {
				width = Math.min(this.options.maxWidth, width);
			}

			return width;
		}
	}, {
		key: 'getPointerX',

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  	@private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
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
	minWidth: 0.01
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
var DATA_NO_RESIZE = 'noresize';
exports.DATA_NO_RESIZE = DATA_NO_RESIZE;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLFlBTmYsUUFBUSxDQU1pQixDQUFDO0FBQ2hDLE1BQUksQ0FBQyxHQUFHLEVBQUU7QUFDVCxNQUFHLEdBQUcsdUJBQXFCLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNwRCxTQUFNLENBQUMsSUFBSSxZQVROLFFBQVEsRUFTUyxHQUFHLENBQUMsQ0FBQztHQUMzQixNQUVJLElBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFO0FBQzdDLFVBQU8sR0FBRyxDQUFDLGVBQWUsT0FBQyxDQUFwQixHQUFHLEVBQXFCLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJ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Ozs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XG5cblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xuXHRcdGlmICghYXBpKSB7XG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcblx0XHR9XG5cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xuIiwiaW1wb3J0IHtcblx0REFUQV9BUEksXG5cdERBVEFfTk9fUkVTSVpFLFxuXHREQVRBX0NPTFVNTlNfSUQsXG5cdERBVEFfQ09MVU1OX0lELFxuXHREQVRBX1RILFxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcblx0Q0xBU1NfQ09MVU1OX1JFU0laSU5HLFxuXHRDTEFTU19IQU5ETEUsXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXG5cdEVWRU5UX1JFU0laRV9TVEFSVCxcblx0RVZFTlRfUkVTSVpFLFxuXHRFVkVOVF9SRVNJWkVfU1RPUCxcblx0U0VMRUNUT1JfVEgsXG5cdFNFTEVDVE9SX1REXG59XG5mcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXG5cbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcbioqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xuXHRcdHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcblxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XG5cdFx0dGhpcy4kdGFibGUgPSAkdGFibGU7XG5cblx0XHR0aGlzLnJlZnJlc2hIZWFkZXJzKCk7XG5cdFx0dGhpcy5yZXN0b3JlQ29sdW1uV2lkdGhzKCk7XG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XG5cblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5zeW5jSGFuZGxlV2lkdGhzLmJpbmQodGhpcykpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdGFydCkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RBUlQsIHRoaXMub3B0aW9ucy5zdGFydCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVzaXplKSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRSwgdGhpcy5vcHRpb25zLnJlc2l6ZSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcCkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RPUCwgdGhpcy5vcHRpb25zLnN0b3ApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRSZWZyZXNoZXMgdGhlIGhlYWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2VzIDx0YWJsZS8+IGVsZW1lbnQgYW5kXG5cdGdlbmVyYXRlcyBoYW5kbGVzIGZvciB0aGVtLiBBbHNvIGFzc2lnbnMgcGVyY2VudGFnZSB3aWR0aHMuXG5cblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xuXHQqKi9cblx0cmVmcmVzaEhlYWRlcnMoKSB7XG5cdFx0Ly8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcblx0XHQvLyBhIGR5bmFtaWMgY2FsbGJhY2tcblx0XHRsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XG5cdFx0aWYodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xuXHRcdH1cblxuXHRcdC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xuXG5cdFx0Ly8gQXNzaWduIHBlcmNlbnRhZ2Ugd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcblx0XHR0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcblx0XHR0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcblx0fVxuXG5cdC8qKlxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXG5cblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXG5cdCoqL1xuXHRjcmVhdGVIYW5kbGVzKCkge1xuXHRcdGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XG5cdFx0aWYgKHJlZiAhPSBudWxsKSB7XG5cdFx0XHRyZWYucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxuXHRcdHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XG5cdFx0XHRsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xuXG5cdFx0XHRpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRjdXJyZW50LmRhdGEoREFUQV9OT19SRVNJWkUpIHx8ICRuZXh0LmRhdGEoREFUQV9OT19SRVNJWkUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcblx0XHRcdFx0LmRhdGEoREFUQV9USCwgJChlbCkpXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJGhhbmRsZUNvbnRhaW5lciwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCAnLicrQ0xBU1NfSEFORExFLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxuXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xuXHQqKi9cblx0YXNzaWduUGVyY2VudGFnZVdpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsWzBdLCAkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblxuXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1xuXHQqKi9cblx0c3luY0hhbmRsZVdpZHRocygpIHtcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcblxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xuXG5cdFx0XHRsZXQgbGVmdCA9ICRlbC5kYXRhKERBVEFfVEgpLm91dGVyV2lkdGgoKSArIChcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9USCkub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG5cdFx0XHQpO1xuXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxuXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xuXHQqKi9cblx0c2F2ZUNvbHVtbldpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAkZWwuZGF0YShEQVRBX05PX1JFU0laRSkgPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcblx0KiovXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAkZWwuZGF0YShEQVRBX05PX1JFU0laRSkgPT0gbnVsbCkge1xuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0aWYod2lkdGggIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyRG93bihldmVudCkge1xuXHRcdC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXG5cdFx0aWYoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cblx0XHQvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XG5cdFx0aWYodGhpcy5vcGVyYXRpb24pIHtcblx0XHRcdHRoaXMub25Qb2ludGVyVXAoZXZlbnQpO1xuXHRcdH1cblxuXHRcdGxldCAkY3VycmVudEdyaXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuXHRcdGxldCAkbGVmdENvbHVtbiA9ICRjdXJyZW50R3JpcC5kYXRhKERBVEFfVEgpO1xuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSAgdGhpcy4kdGFibGVIZWFkZXJzLmVxKHRoaXMuJHRhYmxlSGVhZGVycy5pbmRleCgkbGVmdENvbHVtbikgKyAxKTtcblxuXHRcdGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJGxlZnRDb2x1bW5bMF0pO1xuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IHtcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcblxuXHRcdFx0c3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcblxuXHRcdFx0d2lkdGhzOiB7XG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcblx0XHRcdH0sXG5cdFx0XHRuZXdXaWR0aHM6IHtcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10sIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xuXG5cdFx0JGxlZnRDb2x1bW5cblx0XHRcdC5hZGQoJHJpZ2h0Q29sdW1uKVxuXHRcdFx0LmFkZCgkY3VycmVudEdyaXApXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcblxuXHRcdHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVEFSVCwgW1xuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcblx0XHRcdGxlZnRXaWR0aCwgcmlnaHRXaWR0aFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlck1vdmVcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuXHRvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxuXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSAodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcblx0XHRsZXQgd2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xuXHRcdGxldCB3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcblxuXHRcdHRoaXMuc2V0V2lkdGgob3AuJGxlZnRDb2x1bW5bMF0sIHdpZHRoTGVmdCk7XG5cdFx0dGhpcy5zZXRXaWR0aChvcC4kcmlnaHRDb2x1bW5bMF0sIHdpZHRoUmlnaHQpO1xuXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcblxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXG5cdFx0XHR3aWR0aExlZnQsIHdpZHRoUmlnaHRcblx0XHRdLFxuXHRcdGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyVXBcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuXHRvblBvaW50ZXJVcChldmVudCkge1xuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuXHRcdG9wLiRsZWZ0Q29sdW1uXG5cdFx0XHQuYWRkKG9wLiRyaWdodENvbHVtbilcblx0XHRcdC5hZGQob3AuJGN1cnJlbnRHcmlwKVxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcblxuXHRcdHRoaXMub3BlcmF0aW9uID0gbnVsbDtcblxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcblx0XHRdLFxuXHRcdGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXG5cdHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcblxuXHRAbWV0aG9kIGRlc3Ryb3lcblx0QHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcblx0KiovXG5cdGRlc3Ryb3koKSB7XG5cdFx0bGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xuXHRcdGxldCAkaGFuZGxlcyA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpO1xuXG5cdFx0dGhpcy51bmJpbmRFdmVudHMoXG5cdFx0XHR0aGlzLiR3aW5kb3dcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxuXHRcdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0XHQuYWRkKCRoYW5kbGVzKVxuXHRcdCk7XG5cblx0XHQkaGFuZGxlcy5yZW1vdmVEYXRhKERBVEFfVEgpO1xuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IG51bGw7XG5cdFx0dGhpcy4kdGFibGUgPSBudWxsO1xuXG5cdFx0cmV0dXJuICR0YWJsZTtcblx0fVxuXG5cdC8qKlxuXHRCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBiaW5kRXZlbnRzXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byBiaW5kXG5cdEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXG5cdCoqL1xuXHRiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcblx0XHR9XG5cblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMykge1xuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRVbmJpbmRzIGV2ZW50cyBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCB1bmJpbmRFdmVudHNcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcblx0KiovXG5cdHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGV2ZW50cyA9IHRoaXMubnM7XG5cdFx0fVxuXG5cdFx0JHRhcmdldC5vZmYoZXZlbnRzKTtcblx0fVxuXG5cdC8qKlxuXHRUcmlnZ2VycyBhbiBldmVudCBvbiB0aGUgPHRhYmxlLz4gZWxlbWVudCBmb3IgYSBnaXZlbiB0eXBlIHdpdGggZ2l2ZW5cblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxuXHRnaXZlbi4gUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSB0cmlnZ2VyZWQgZXZlbnQuXG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCB0cmlnZ2VyRXZlbnRcblx0QHBhcmFtIHR5cGUge1N0cmluZ30gRXZlbnQgbmFtZVxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcblx0QHBhcmFtIFtvcmlnaW5hbEV2ZW50XSBJZiBnaXZlbiwgaXMgc2V0IG9uIHRoZSBldmVudCBvYmplY3Rcblx0QHJldHVybiB7TWl4ZWR9IFJlc3VsdCBvZiB0aGUgZXZlbnQgdHJpZ2dlciBhY3Rpb25cblx0KiovXG5cdHRyaWdnZXJFdmVudCh0eXBlLCBhcmdzLCBvcmlnaW5hbEV2ZW50KSB7XG5cdFx0bGV0IGV2ZW50ID0gJC5FdmVudCh0eXBlKTtcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XG5cdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcblx0fVxuXG5cdC8qKlxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XG5cdEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXG5cdCoqL1xuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCk7XG5cdH1cblxuXHQvKipcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2Zcblx0QHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxuXHQqKi9cblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCclJywgJycpKTtcblx0fVxuXG5cdC8qKlxuXHRTZXRzIHRoZSBwZXJjZW50YWdlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2Qgc2V0V2lkdGhcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gc2V0IHdpZHRoIG9uXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCwgYXMgYSBwZXJjZW50YWdlLCB0byBzZXRcblx0KiovXG5cdHNldFdpZHRoKGVsZW1lbnQsIHdpZHRoKSB7XG5cdFx0IXdpZHRoICYmIGNvbnNvbGUudHJhY2UoKVxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcblx0XHRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAnJSc7XG5cdH1cblxuXHQvKipcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXG5cdHRoZSBgbWluV2lkdGhgIGFuZCBgbWF4V2lkdGhgIGNvbmZpZ3VyYXRpb24gb3B0aW9ucywgcmVzcGVjdGl2ZWx5LlxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgY29uc3RyYWluV2lkdGhcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoIHRvIGNvbnN0cmFpblxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXG5cdCoqL1xuXHRjb25zdHJhaW5XaWR0aCh3aWR0aCkge1xuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gbnVsbCkge1xuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IG51bGwpIHtcblx0XHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heFdpZHRoLCB3aWR0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9XG5cblx0LyoqXG5cdEdpdmVuIGEgcGFydGljdWxhciBFdmVudCBvYmplY3QsIHJldHJpZXZlcyB0aGUgY3VycmVudCBwb2ludGVyIG9mZnNldCBhbG9uZ1xuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcblx0cG9pbnRlci1saWtlIHN5c3RlbXMgKG1vYmlsZXMsIHRhYmxldHMgZXRjLilcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGdldFBvaW50ZXJYXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcblx0KiovXG5cdGdldFBvaW50ZXJYKGV2ZW50KSB7XG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkucGFnZVg7XG5cdFx0fVxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcblx0fVxufVxuXG5SZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzID0ge1xuXHRzZWxlY3RvcjogZnVuY3Rpb24oJHRhYmxlKSB7XG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gU0VMRUNUT1JfVEg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFNFTEVDVE9SX1REO1xuXHR9LFxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxuXHRzeW5jSGFuZGxlcnM6IHRydWUsXG5cdHJlc2l6ZUZyb21Cb2R5OiB0cnVlLFxuXHRtYXhXaWR0aDogbnVsbCxcblx0bWluV2lkdGg6IDAuMDFcbn07XG5cblJlc2l6YWJsZUNvbHVtbnMuY291bnQgPSAwO1xuIiwiZXhwb3J0IGNvbnN0IERBVEFfQVBJID0gJ3Jlc2l6YWJsZUNvbHVtbnMnO1xuZXhwb3J0IGNvbnN0IERBVEFfTk9fUkVTSVpFID0gJ25vcmVzaXplJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTlNfSUQgPSAncmVzaXphYmxlLWNvbHVtbnMtaWQnO1xuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW4taWQnO1xuZXhwb3J0IGNvbnN0IERBVEFfVEggPSAndGgnO1xuXG5leHBvcnQgY29uc3QgQ0xBU1NfVEFCTEVfUkVTSVpJTkcgPSAncmMtdGFibGUtcmVzaXppbmcnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0NPTFVNTl9SRVNJWklORyA9ICdyYy1jb2x1bW4tcmVzaXppbmcnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRV9DT05UQUlORVIgPSAncmMtaGFuZGxlLWNvbnRhaW5lcic7XG5cbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RBUlQgPSAnY29sdW1uOnJlc2l6ZTpzdGFydCc7XG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFID0gJ2NvbHVtbjpyZXNpemUnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVE9QID0gJ2NvbHVtbjpyZXNpemU6c3RvcCc7XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9USCA9ICd0cjpmaXJzdCA+IHRoOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1REID0gJ3RyOmZpcnN0ID4gdGQ6dmlzaWJsZSc7XG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il19