/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Fri Oct 20 2023 16:25:03 GMT+0700 (Indochina Time)
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

		this.setTableProperties();
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
  * Set table properties when initialize
  * 
  * @method setTableProperties
  */

	_createClass(ResizableColumns, [{
		key: 'setTableProperties',
		value: function setTableProperties() {
			console.log(this.$table);
			this.$table.css('table-layout', 'fixed');
			this.$table.find('thead tr th').css('vertical-align', 'top');
			this.$table.find('th, td').css('word-break', 'break-all');
		}

		/**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns percentage widths.
  	@method refreshHeaders
  **/
	}, {
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
				if ($next.length === 0 || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				/**
     * Fixed by gmo.rsdn
     * Add attribute column-id to resize-handle element
     */
				var columnId = $(el).attr('data-resizable-column-id');

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' column-id=\'' + columnId + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
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
				var $el = $(el);
				$el.width(Math.max($el.outerWidth(), _this2.options.minWidth));
			});
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

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

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
					_this4.options.store.set(_this4.generateColumnId($el), $el.width());
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
						$el.width(Math.max(width, _this5.options.minWidth));
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
			/**
    * Fixed by gmo.rsdn
    * changed logic find element leftColumn and rightColumn with column-id
    */
			var columnId = $(event.currentTarget).attr('column-id');
			var selector = '[data-resizable-column-id="' + columnId + '"]';
			var $leftColumn = this.$table.find(selector);
			var $rightColumn = this.$table.find(selector).next();
			// let leftWidth = this.parseWidth($leftColumn[0]);
			// let rightWidth = this.parseWidth($rightColumn[0]);
			var leftWidth = $leftColumn.width();
			var rightWidth = $rightColumn.width();

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				pointerDownEvent: event,

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
			// let difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			var difference = event.pageX - op.pointerDownEvent.pageX;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var totalWidth = op.$leftColumn.width() + op.$rightColumn.width();
			var widthLeft = undefined,
			    widthRight = undefined;
			if (difference > 0) {
				// widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
				// widthRight = this.constrainWidth(op.widths.right - difference);
				widthRight = op.widths.right - difference;
				widthLeft = totalWidth - widthRight;
			} else if (difference < 0) {
				// widthLeft = this.constrainWidth(op.widths.left + difference);
				// widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
				widthLeft = op.widths.left + difference;
				widthRight = totalWidth - widthLeft;
			}
			widthLeft = Math.max(this.options.minWidth, widthLeft);
			widthRight = Math.max(this.options.minWidth, widthRight);

			var maxWidth = totalWidth - this.options.minWidth;

			if (widthLeft > maxWidth) {
				widthLeft = maxWidth;
			}

			if (widthRight > maxWidth) {
				widthRight = maxWidth;
			}

			if (leftColumn) {
				// this.setWidth(leftColumn, widthLeft);
				op.$leftColumn.width(widthLeft);
			}
			if (rightColumn) {
				// this.setWidth(rightColumn, widthRight);
				op.$rightColumn.width(widthRight);
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

			$handles.removeData(_constants.DATA_TH);
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
			// width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  	@private
  @method constrainWidth
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth(width) {
			if (this.options.minWidth != undefined) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != undefined) {
				width = Math.min(this.options.maxWidth, width);
			}

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
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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cEMsSUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUM7O0FBQy9DLElBQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDOztBQUM3QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7OztBQUVyQixJQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDOztBQUNqRCxJQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDOztBQUNuRCxJQUFNLFlBQVksR0FBRyxXQUFXLENBQUM7O0FBQ2pDLElBQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7OztBQUVyRCxJQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDOztBQUNqRCxJQUFNLFlBQVksR0FBRyxlQUFlLENBQUM7O0FBQ3JDLElBQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sb0JBQW9CLG9CQUFvQixDQUFDOzs7Ozs7Ozs7Ozs7cUJDaEJ6QixTQUFTOzs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XG5cblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xuXHRcdGlmICghYXBpKSB7XG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcblx0XHR9XG5cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xuIiwiaW1wb3J0IHtcblx0REFUQV9BUEksXG5cdERBVEFfQ09MVU1OU19JRCxcblx0REFUQV9DT0xVTU5fSUQsXG5cdERBVEFfVEgsXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXG5cdENMQVNTX0hBTkRMRSxcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcblx0RVZFTlRfUkVTSVpFX1NUQVJULFxuXHRFVkVOVF9SRVNJWkUsXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxuXHRTRUxFQ1RPUl9USCxcblx0U0VMRUNUT1JfVEQsXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFXG59XG5mcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXG5cbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcbioqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xuXHRcdHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcblxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XG5cdFx0dGhpcy4kdGFibGUgPSAkdGFibGU7XG5cblx0XHR0aGlzLnNldFRhYmxlUHJvcGVydGllcygpO1xuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5XaWR0aHMoKTtcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLnN5bmNIYW5kbGVXaWR0aHMuYmluZCh0aGlzKSk7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVEFSVCwgdGhpcy5vcHRpb25zLnN0YXJ0KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFLCB0aGlzLm9wdGlvbnMucmVzaXplKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVE9QLCB0aGlzLm9wdGlvbnMuc3RvcCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0YWJsZSBwcm9wZXJ0aWVzIHdoZW4gaW5pdGlhbGl6ZVxuXHQgKiBcblx0ICogQG1ldGhvZCBzZXRUYWJsZVByb3BlcnRpZXNcblx0ICovXG5cdHNldFRhYmxlUHJvcGVydGllcygpIHtcblx0XHRjb25zb2xlLmxvZyh0aGlzLiR0YWJsZSk7XG5cdFx0dGhpcy4kdGFibGUuY3NzKCd0YWJsZS1sYXlvdXQnLCAnZml4ZWQnKTtcblx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCB0ciB0aCcpLmNzcygndmVydGljYWwtYWxpZ24nLCAndG9wJyk7XG5cdFx0dGhpcy4kdGFibGUuZmluZCgndGgsIHRkJykuY3NzKCd3b3JkLWJyZWFrJywgJ2JyZWFrLWFsbCcpO1xuXHR9XG5cblx0LyoqXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcblx0Z2VuZXJhdGVzIGhhbmRsZXMgZm9yIHRoZW0uIEFsc28gYXNzaWducyBwZXJjZW50YWdlIHdpZHRocy5cblxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXG5cdCoqL1xuXHRyZWZyZXNoSGVhZGVycygpIHtcblx0XHQvLyBBbGxvdyB0aGUgc2VsZWN0b3IgdG8gYmUgYm90aCBhIHJlZ3VsYXIgc2VsY3RvciBzdHJpbmcgYXMgd2VsbCBhc1xuXHRcdC8vIGEgZHluYW1pYyBjYWxsYmFja1xuXHRcdGxldCBzZWxlY3RvciA9IHRoaXMub3B0aW9ucy5zZWxlY3Rvcjtcblx0XHRpZih0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IuY2FsbCh0aGlzLCB0aGlzLiR0YWJsZSk7XG5cdFx0fVxuXG5cdFx0Ly8gU2VsZWN0IGFsbCB0YWJsZSBoZWFkZXJzXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gdGhpcy4kdGFibGUuZmluZChzZWxlY3Rvcik7XG5cblx0XHQvLyBBc3NpZ24gcGVyY2VudGFnZSB3aWR0aHMgZmlyc3QsIHRoZW4gY3JlYXRlIGRyYWcgaGFuZGxlc1xuXHRcdHRoaXMuYXNzaWduUGVyY2VudGFnZVdpZHRocygpO1xuXHRcdHRoaXMuY3JlYXRlSGFuZGxlcygpO1xuXHR9XG5cblx0LyoqXG5cdENyZWF0ZXMgZHVtbXkgaGFuZGxlIGVsZW1lbnRzIGZvciBhbGwgdGFibGUgaGVhZGVyIGNvbHVtbnNcblxuXHRAbWV0aG9kIGNyZWF0ZUhhbmRsZXNcblx0KiovXG5cdGNyZWF0ZUhhbmRsZXMoKSB7XG5cdFx0bGV0IHJlZiA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lcjtcblx0XHRpZiAocmVmICE9IG51bGwpIHtcblx0XHRcdHJlZi5yZW1vdmUoKTtcblx0XHR9XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRV9DT05UQUlORVJ9JyAvPmApXG5cdFx0dGhpcy4kdGFibGUuYmVmb3JlKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XG5cblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaSwgZWwpID0+IHtcblx0XHRcdGxldCAkY3VycmVudCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpKTtcblx0XHRcdGxldCAkbmV4dCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpICsgMSk7XG5cdFx0XHRpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRml4ZWQgYnkgZ21vLnJzZG5cblx0XHRcdCAqIEFkZCBhdHRyaWJ1dGUgY29sdW1uLWlkIHRvIHJlc2l6ZS1oYW5kbGUgZWxlbWVudFxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBjb2x1bW5JZCA9ICQoZWwpLmF0dHIoJ2RhdGEtcmVzaXphYmxlLWNvbHVtbi1pZCcpXG5cblx0XHRcdGxldCAkaGFuZGxlID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEV9JyBjb2x1bW4taWQ9JyR7Y29sdW1uSWR9JyAvPmApXG5cdFx0XHRcdC5kYXRhKERBVEFfVEgsICQoZWwpKVxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xuXHR9XG5cblx0LyoqXG5cdEFzc2lnbnMgYSBwZXJjZW50YWdlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgcGl4ZWwgd2lkdGgocylcblxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcblx0KiovXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cdFx0XHQkZWwud2lkdGgoTWF0aC5tYXgoJGVsLm91dGVyV2lkdGgoKSwgdGhpcy5vcHRpb25zLm1pbldpZHRoKSlcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXG5cblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzXG5cdCoqL1xuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xuXHRcdGxldCAkY29udGFpbmVyID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyXG5cblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xuXG5cdFx0JGNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHkgP1xuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XG5cblx0XHRcdGxldCBsZWZ0ID0gJGVsLmRhdGEoREFUQV9USCkub3V0ZXJXaWR0aCgpICsgKFxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX1RIKS5vZmZzZXQoKS5sZWZ0IC0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnRcblx0XHRcdCk7XG5cblx0XHRcdCRlbC5jc3MoeyBsZWZ0LCBoZWlnaHQgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0UGVyc2lzdHMgdGhlIGNvbHVtbiB3aWR0aHMgaW4gbG9jYWxTdG9yYWdlXG5cblx0QG1ldGhvZCBzYXZlQ29sdW1uV2lkdGhzXG5cdCoqL1xuXHRzYXZlQ29sdW1uV2lkdGhzKCkge1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3JlICYmICEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG5cdFx0XHRcdHRoaXMub3B0aW9ucy5zdG9yZS5zZXQoXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbCksXG5cdFx0XHRcdFx0JGVsLndpZHRoKCksXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXG5cblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXG5cdCoqL1xuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRpZih0aGlzLm9wdGlvbnMuc3RvcmUgJiYgISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcblx0XHRcdFx0XHQkZWwud2lkdGgoTWF0aC5tYXgod2lkdGgsIHRoaXMub3B0aW9ucy5taW5XaWR0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlckRvd25cblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuXHRvblBvaW50ZXJEb3duKGV2ZW50KSB7XG5cdFx0Ly8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcblx0XHRpZihldmVudC53aGljaCAhPT0gMSkgeyByZXR1cm47IH1cblxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxuXHRcdC8vIFByb2JhYmx5IGdvYmJsZWQgdXAgYnkgdXNlciBtb3VzaW5nIG91dCB0aGUgd2luZG93IHRoZW4gcmVsZWFzaW5nLlxuXHRcdC8vIFdlJ2xsIHNpbXVsYXRlIGEgcG9pbnRlcnVwIGhlcmUgcHJpb3IgdG8gaXRcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xuXHRcdFx0dGhpcy5vblBvaW50ZXJVcChldmVudCk7XG5cdFx0fVxuXG5cdFx0Ly8gSWdub3JlIG5vbi1yZXNpemFibGUgY29sdW1uc1xuXHRcdGxldCAkY3VycmVudEdyaXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogRml4ZWQgYnkgZ21vLnJzZG5cblx0XHQgKiBjaGFuZ2VkIGxvZ2ljIGZpbmQgZWxlbWVudCBsZWZ0Q29sdW1uIGFuZCByaWdodENvbHVtbiB3aXRoIGNvbHVtbi1pZFxuXHRcdCAqL1xuXHRcdGNvbnN0IGNvbHVtbklkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKCdjb2x1bW4taWQnKVxuXHRcdGNvbnN0IHNlbGVjdG9yID0gJ1tkYXRhLXJlc2l6YWJsZS1jb2x1bW4taWQ9XCInICsgY29sdW1uSWQgKyAnXCJdJ1xuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpXG5cdFx0bGV0ICRyaWdodENvbHVtbiA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpLm5leHQoKVxuXHRcdC8vIGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJGxlZnRDb2x1bW5bMF0pO1xuXHRcdC8vIGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XG5cdFx0bGV0IGxlZnRXaWR0aCA9ICRsZWZ0Q29sdW1uLndpZHRoKClcblx0XHRsZXQgcmlnaHRXaWR0aCA9ICRyaWdodENvbHVtbi53aWR0aCgpXG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IHtcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcblxuXHRcdFx0c3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcblxuXHRcdFx0cG9pbnRlckRvd25FdmVudDogZXZlbnQsXG5cblx0XHRcdHdpZHRoczoge1xuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXG5cdFx0XHR9LFxuXHRcdFx0bmV3V2lkdGhzOiB7XG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0LmFkZENsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuXHRcdCRsZWZ0Q29sdW1uXG5cdFx0XHQuYWRkKCRyaWdodENvbHVtbilcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxuXHRcdFx0LmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXG5cdFx0XHRsZWZ0V2lkdGgsIHJpZ2h0V2lkdGhcblx0XHRdLFxuXHRcdGV2ZW50KTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJNb3ZlXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyTW92ZShldmVudCkge1xuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBkZWx0YSBjaGFuZ2UgYmV0d2VlbiBzdGFydCBhbmQgbmV3IG1vdXNlIHBvc2l0aW9uLCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRhYmxlIHdpZHRoXG5cdFx0Ly8gbGV0IGRpZmZlcmVuY2UgPSAodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcblx0XHRsZXQgZGlmZmVyZW5jZSA9IGV2ZW50LnBhZ2VYIC0gb3AucG9pbnRlckRvd25FdmVudC5wYWdlWFxuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW5bMF07XG5cdFx0bGV0IHJpZ2h0Q29sdW1uID0gb3AuJHJpZ2h0Q29sdW1uWzBdO1xuXHRcdGNvbnN0IHRvdGFsV2lkdGggPSBvcC4kbGVmdENvbHVtbi53aWR0aCgpICsgb3AuJHJpZ2h0Q29sdW1uLndpZHRoKCk7XG5cdFx0bGV0IHdpZHRoTGVmdCwgd2lkdGhSaWdodDtcblx0XHRpZihkaWZmZXJlbmNlID4gMCkge1xuXHRcdFx0Ly8gd2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpKTtcblx0XHRcdC8vIHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xuXHRcdFx0d2lkdGhSaWdodCA9IG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2U7XG5cdFx0XHR3aWR0aExlZnQgPSB0b3RhbFdpZHRoIC0gd2lkdGhSaWdodDtcblx0XHR9XG5cdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xuXHRcdFx0Ly8gd2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xuXHRcdFx0Ly8gd2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcblx0XHRcdHdpZHRoTGVmdCA9IG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZTtcblx0XHRcdHdpZHRoUmlnaHQgPSB0b3RhbFdpZHRoIC0gd2lkdGhMZWZ0O1xuXHRcdH1cblx0XHR3aWR0aExlZnQgPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoTGVmdCk7XG5cdFx0d2lkdGhSaWdodCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGhSaWdodCk7XG5cblx0XHRjb25zdCBtYXhXaWR0aCA9IHRvdGFsV2lkdGggLSB0aGlzLm9wdGlvbnMubWluV2lkdGg7XG5cblx0XHRpZiAod2lkdGhMZWZ0ID4gbWF4V2lkdGgpIHtcblx0XHRcdHdpZHRoTGVmdCA9IG1heFdpZHRoO1xuXHRcdH1cblxuXHRcdGlmICh3aWR0aFJpZ2h0ID4gbWF4V2lkdGgpIHtcblx0XHRcdHdpZHRoUmlnaHQgPSBtYXhXaWR0aDtcblx0XHR9XG5cblx0XHRpZihsZWZ0Q29sdW1uKSB7XG5cdFx0XHQvLyB0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XG5cdFx0XHRvcC4kbGVmdENvbHVtbi53aWR0aCh3aWR0aExlZnQpO1xuXHRcdH1cblx0XHRpZihyaWdodENvbHVtbikge1xuXHRcdFx0Ly8gdGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XG5cdFx0XHRvcC4kcmlnaHRDb2x1bW4ud2lkdGgod2lkdGhSaWdodCk7XG5cdFx0fVxuXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcblxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXG5cdFx0XHR3aWR0aExlZnQsIHdpZHRoUmlnaHRcblx0XHRdLFxuXHRcdGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyVXBcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuXHRvblBvaW50ZXJVcChldmVudCkge1xuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuXHRcdG9wLiRsZWZ0Q29sdW1uXG5cdFx0XHQuYWRkKG9wLiRyaWdodENvbHVtbilcblx0XHRcdC5hZGQob3AuJGN1cnJlbnRHcmlwKVxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcblxuXHRcdHRoaXMub3BlcmF0aW9uID0gbnVsbDtcblxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcblx0XHRdLFxuXHRcdGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXG5cdHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcblxuXHRAbWV0aG9kIGRlc3Ryb3lcblx0QHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcblx0KiovXG5cdGRlc3Ryb3koKSB7XG5cdFx0bGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xuXHRcdGxldCAkaGFuZGxlcyA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpO1xuXG5cdFx0dGhpcy51bmJpbmRFdmVudHMoXG5cdFx0XHR0aGlzLiR3aW5kb3dcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxuXHRcdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0XHQuYWRkKCRoYW5kbGVzKVxuXHRcdCk7XG5cblx0XHQkaGFuZGxlcy5yZW1vdmVEYXRhKERBVEFfVEgpO1xuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IG51bGw7XG5cdFx0dGhpcy4kdGFibGUgPSBudWxsO1xuXG5cdFx0cmV0dXJuICR0YWJsZTtcblx0fVxuXG5cdC8qKlxuXHRCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBiaW5kRXZlbnRzXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byBiaW5kXG5cdEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXG5cdCoqL1xuXHRiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcblx0XHR9XG5cblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMykge1xuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRVbmJpbmRzIGV2ZW50cyBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCB1bmJpbmRFdmVudHNcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcblx0KiovXG5cdHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGV2ZW50cyA9IHRoaXMubnM7XG5cdFx0fVxuXG5cdFx0JHRhcmdldC5vZmYoZXZlbnRzKTtcblx0fVxuXG5cdC8qKlxuXHRUcmlnZ2VycyBhbiBldmVudCBvbiB0aGUgPHRhYmxlLz4gZWxlbWVudCBmb3IgYSBnaXZlbiB0eXBlIHdpdGggZ2l2ZW5cblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxuXHRnaXZlbi4gUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSB0cmlnZ2VyZWQgZXZlbnQuXG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCB0cmlnZ2VyRXZlbnRcblx0QHBhcmFtIHR5cGUge1N0cmluZ30gRXZlbnQgbmFtZVxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcblx0QHBhcmFtIFtvcmlnaW5hbEV2ZW50XSBJZiBnaXZlbiwgaXMgc2V0IG9uIHRoZSBldmVudCBvYmplY3Rcblx0QHJldHVybiB7TWl4ZWR9IFJlc3VsdCBvZiB0aGUgZXZlbnQgdHJpZ2dlciBhY3Rpb25cblx0KiovXG5cdHRyaWdnZXJFdmVudCh0eXBlLCBhcmdzLCBvcmlnaW5hbEV2ZW50KSB7XG5cdFx0bGV0IGV2ZW50ID0gJC5FdmVudCh0eXBlKTtcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XG5cdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcblx0fVxuXG5cdC8qKlxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XG5cdEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXG5cdCoqL1xuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCk7XG5cdH1cblxuXHQvKipcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2Zcblx0QHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxuXHQqKi9cblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XG5cdFx0cmV0dXJuIGVsZW1lbnQgPyBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgnJScsICcnKSkgOiAwO1xuXHR9XG5cblx0LyoqXG5cdFNldHMgdGhlIHBlcmNlbnRhZ2Ugd2lkdGggb2YgYSBnaXZlbiBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBzZXRXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoLCBhcyBhIHBlcmNlbnRhZ2UsIHRvIHNldFxuXHQqKi9cblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcblx0XHQvLyB3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XG5cdFx0d2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xuXHR9XG5cblx0LyoqXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxuXHR0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGNvbnN0cmFpbldpZHRoXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxuXHQqKi9cblx0Y29uc3RyYWluV2lkdGgod2lkdGgpIHtcblx0XHRpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH1cblxuXHQvKipcblx0R2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXG5cdHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxuXHQqKi9cblx0Z2V0UG9pbnRlclgoZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcblx0XHR9XG5cdFx0cmV0dXJuIGV2ZW50LnBhZ2VYO1xuXHR9XG59XG5cblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XG5cdHNlbGVjdG9yOiBmdW5jdGlvbigkdGFibGUpIHtcblx0XHRpZigkdGFibGUuZmluZCgndGhlYWQnKS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcblx0XHR9XG5cblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XG5cdH0sXG5cdHN0b3JlOiB3aW5kb3cuc3RvcmUsXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcblx0cmVzaXplRnJvbUJvZHk6IHRydWUsXG5cdG1heFdpZHRoOiBudWxsLFxuXHRtaW5XaWR0aDogMC4wMVxufTtcblxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX1RIID0gJ3RoJztcblxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il0sInByZUV4aXN0aW5nQ29tbWVudCI6Ii8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlMWEJoWTJzdlgzQnlaV3gxWkdVdWFuTWlMQ0l2YUc5dFpTOWtkVzl1WjI1MEwzZHBiR3hpWldSbGJHVjBaUzlxY1hWbGNua3RjbVZ6YVhwaFlteGxMV052YkhWdGJuTXZjM0pqTDJGa1lYQjBaWEl1YW5NaUxDSXZhRzl0WlM5a2RXOXVaMjUwTDNkcGJHeGlaV1JsYkdWMFpTOXFjWFZsY25rdGNtVnphWHBoWW14bExXTnZiSFZ0Ym5NdmMzSmpMMk5zWVhOekxtcHpJaXdpTDJodmJXVXZaSFZ2Ym1kdWRDOTNhV3hzWW1Wa1pXeGxkR1V2YW5GMVpYSjVMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNXpMM055WXk5amIyNXpkR0Z1ZEhNdWFuTWlMQ0l2YUc5dFpTOWtkVzl1WjI1MEwzZHBiR3hpWldSbGJHVjBaUzlxY1hWbGNua3RjbVZ6YVhwaFlteGxMV052YkhWdGJuTXZjM0pqTDJsdVpHVjRMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPenR4UWtOQk5rSXNVMEZCVXpzN096dDVRa0ZEWml4aFFVRmhPenRCUVVWd1F5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMR2RDUVVGblFpeEhRVUZITEZWQlFWTXNaVUZCWlN4RlFVRlhPMjFEUVVGT0xFbEJRVWs3UVVGQlNpeE5RVUZKT3pzN1FVRkRlRVFzVVVGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZjN1FVRkRNMElzVFVGQlNTeE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE96dEJRVVZ5UWl4TlFVRkpMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeHhRa0ZCVlN4RFFVRkRPMEZCUTJoRExFMUJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdRVUZEVkN4TlFVRkhMRWRCUVVjc2RVSkJRWEZDTEUxQlFVMHNSVUZCUlN4bFFVRmxMRU5CUVVNc1EwRkJRenRCUVVOd1JDeFRRVUZOTEVOQlFVTXNTVUZCU1N4elFrRkJWeXhIUVVGSExFTkJRVU1zUTBGQlF6dEhRVU16UWl4TlFVVkpMRWxCUVVrc1QwRkJUeXhsUVVGbExFdEJRVXNzVVVGQlVTeEZRVUZGT3pzN1FVRkROME1zVlVGQlR5eFJRVUZCTEVkQlFVY3NSVUZCUXl4bFFVRmxMRTlCUVVNc1QwRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEhRVU55UXp0RlFVTkVMRU5CUVVNc1EwRkJRenREUVVOSUxFTkJRVU03TzBGQlJVWXNRMEZCUXl4RFFVRkRMR2RDUVVGblFpeHhRa0ZCYlVJc1EwRkJRenM3T3pzN096czdPenM3T3p0NVFrTklha01zWVVGQllUczdPenM3T3pzN096czdTVUZWUnl4blFrRkJaMEk3UVVGRGVrSXNWVUZFVXl4blFrRkJaMElzUTBGRGVFSXNUVUZCVFN4RlFVRkZMRTlCUVU4c1JVRkJSVHQzUWtGRVZDeG5Ra0ZCWjBJN08wRkJSVzVETEUxQlFVa3NRMEZCUXl4RlFVRkZMRWRCUVVjc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXpzN1FVRkZMMElzVFVGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUlVGQlJTeG5Ra0ZCWjBJc1EwRkJReXhSUVVGUkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdPMEZCUldoRkxFMUJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wRkJRM3BDTEUxQlFVa3NRMEZCUXl4alFVRmpMRWRCUVVjc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRCUVVOcVJDeE5RVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJRenM3UVVGRmNrSXNUVUZCU1N4RFFVRkRMR3RDUVVGclFpeEZRVUZGTEVOQlFVTTdRVUZETVVJc1RVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETzBGQlEzUkNMRTFCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlN4RFFVRkRPMEZCUXpOQ0xFMUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJSU3hEUVVGRE96dEJRVVY0UWl4TlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVVXNVVUZCVVN4RlFVRkZMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6czdRVUZGTVVVc1RVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NSVUZCUlR0QlFVTjJRaXhQUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MR2xEUVVGelFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wZEJRM0pGTzBGQlEwUXNUVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFMUJRVTBzUlVGQlJUdEJRVU40UWl4UFFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTERKQ1FVRm5RaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMGRCUTJoRk8wRkJRMFFzVFVGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1JVRkJSVHRCUVVOMFFpeFBRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxHZERRVUZ4UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBkQlEyNUZPMFZCUTBRN096czdPenM3TzJOQk1VSnRRaXhuUWtGQlowSTdPMU5CYVVOc1FpdzRRa0ZCUnp0QlFVTndRaXhWUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRCUVVONlFpeFBRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhqUVVGakxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRVUZEZWtNc1QwRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExHZENRVUZuUWl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8wRkJRemRFTEU5QlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4WlFVRlpMRVZCUVVVc1YwRkJWeXhEUVVGRExFTkJRVU03UjBGRE1VUTdPenM3T3pzN096dFRRVkZoTERCQ1FVRkhPenM3UVVGSGFFSXNUMEZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTTdRVUZEY2tNc1QwRkJSeXhQUVVGUExGRkJRVkVzUzBGQlN5eFZRVUZWTEVWQlFVVTdRVUZEYkVNc1dVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU0xUXpzN08wRkJSMFFzVDBGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXpzN08wRkJSMmhFTEU5QlFVa3NRMEZCUXl4elFrRkJjMElzUlVGQlJTeERRVUZETzBGQlF6bENMRTlCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzUTBGQlF6dEhRVU55UWpzN096czdPenM3VTBGUFdTeDVRa0ZCUnpzN08wRkJRMllzVDBGQlNTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzBGQlEyaERMRTlCUVVrc1IwRkJSeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU5vUWl4UFFVRkhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU03U1VGRFlqczdRVUZGUkN4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NRMEZCUXl3clJFRkJOa01zUTBGQlFUdEJRVU4wUlN4UFFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6czdRVUZGTVVNc1QwRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hGUVVGTE8wRkJRMnhETEZGQlFVa3NVVUZCVVN4SFFVRkhMRTFCUVVzc1lVRkJZU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTjRReXhSUVVGSkxFdEJRVXNzUjBGQlJ5eE5RVUZMTEdGQlFXRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzBGQlEzcERMRkZCUVVrc1MwRkJTeXhEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVsQlFVa3NTMEZCU3l4RFFVRkRMRVZCUVVVc2FVTkJRWE5DTEVWQlFVVTdRVUZEZWtRc1dVRkJUenRMUVVOUU96czdPenM3UVVGTlJDeFJRVUZOTEZGQlFWRXNSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETERCQ1FVRXdRaXhEUVVGRExFTkJRVUU3TzBGQlJYWkVMRkZCUVVrc1QwRkJUeXhIUVVGSExFTkJRVU1zYVVWQlFUUkRMRkZCUVZFc1YwRkJUeXhEUVVONFJTeEpRVUZKTEhGQ1FVRlZMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVU53UWl4UlFVRlJMRU5CUVVNc1RVRkJTeXhuUWtGQlowSXNRMEZCUXl4RFFVRkRPMGxCUTJ4RExFTkJRVU1zUTBGQlF6czdRVUZGU0N4UFFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeFpRVUZaTEVOQlFVTXNSVUZCUlN4SFFVRkhMREJDUVVGaExFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dEhRVU55U0RzN096czdPenM3VTBGUGNVSXNhME5CUVVjN096dEJRVU40UWl4UFFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRVZCUVVzN1FVRkRiRU1zVVVGQlNTeEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRE8wRkJRMmhDTEU5QlFVY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4RlFVRkZMRVZCUVVVc1QwRkJTeXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUVR0SlFVTTFSQ3hEUVVGRExFTkJRVU03UjBGRFNEczdPenM3T3pzN1UwRlBaU3cwUWtGQlJ6czdPMEZCUTJ4Q0xFOUJRVWtzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlFUczdRVUZGZEVNc1lVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRExFTkJRVU03TzBGQlJYUkRMR0ZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5d3dRa0ZCWVN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCU3p0QlFVTnFSQ3hSUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN08wRkJSV2hDTEZGQlFVa3NUVUZCVFN4SFFVRkhMRTlCUVVzc1QwRkJUeXhEUVVGRExHTkJRV01zUjBGRGRrTXNUMEZCU3l4TlFVRk5MRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRM0JDTEU5QlFVc3NUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXpzN1FVRkZjRU1zVVVGQlNTeEpRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWxCUVVrc2IwSkJRVk1zUTBGQlF5eFZRVUZWTEVWQlFVVXNTVUZEZUVNc1IwRkJSeXhEUVVGRExFbEJRVWtzYjBKQlFWTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhKUVVGSkxFZEJRVWNzVDBGQlN5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVRXNRVUZEY2tVc1EwRkJRenM3UVVGRlJpeFBRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGS0xFbEJRVWtzUlVGQlJTeE5RVUZOTEVWQlFVNHNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVNeFFpeERRVUZETEVOQlFVTTdSMEZEU0RzN096czdPenM3VTBGUFpTdzBRa0ZCUnpzN08wRkJRMnhDTEU5QlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCU3p0QlFVTnNReXhSUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN08wRkJSV2hDTEZGQlFVa3NUMEZCU3l4UFFVRlBMRU5CUVVNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNhVU5CUVhOQ0xFVkJRVVU3UVVGRGVFUXNXVUZCU3l4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGRGNrSXNUMEZCU3l4blFrRkJaMElzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZETVVJc1IwRkJSeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVU5ZTEVOQlFVTTdTMEZEUmp0SlFVTkVMRU5CUVVNc1EwRkJRenRIUVVOSU96czdPenM3T3p0VFFVOXJRaXdyUWtGQlJ6czdPMEZCUTNKQ0xFOUJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUlVGQlN6dEJRVU5zUXl4UlFVRkpMRWRCUVVjc1IwRkJSeXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdPMEZCUldoQ0xGRkJRVWNzVDBGQlN5eFBRVUZQTEVOQlFVTXNTMEZCU3l4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzYVVOQlFYTkNMRVZCUVVVN1FVRkRka1FzVTBGQlNTeExRVUZMTEVkQlFVY3NUMEZCU3l4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGRGFrTXNUMEZCU3l4blFrRkJaMElzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZETVVJc1EwRkJRenM3UVVGRlJpeFRRVUZITEV0QlFVc3NTVUZCU1N4SlFVRkpMRVZCUVVVN1FVRkRha0lzVTBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFdEJRVXNzUlVGQlJTeFBRVUZMTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8wMUJRMnhFTzB0QlEwUTdTVUZEUkN4RFFVRkRMRU5CUVVNN1IwRkRTRHM3T3pzN096czdPMU5CVVZrc2RVSkJRVU1zUzBGQlN5eEZRVUZGT3p0QlFVVndRaXhQUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEV0QlFVc3NRMEZCUXl4RlFVRkZPMEZCUVVVc1YwRkJUenRKUVVGRk96czdPenRCUVV0cVF5eFBRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVN1FVRkRiRUlzVVVGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVONFFqczdPMEZCUjBRc1QwRkJTU3haUVVGWkxFZEJRVWNzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRCUVVNeFF5eFBRVUZITEZsQlFWa3NRMEZCUXl4RlFVRkZMR2xEUVVGelFpeEZRVUZGTzBGQlEzcERMRmRCUVU4N1NVRkRVRHM3T3pzN1FVRkxSQ3hQUVVGTkxGRkJRVkVzUjBGQlJ5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUVR0QlFVTjZSQ3hQUVVGTkxGRkJRVkVzUjBGQlJ5dzJRa0ZCTmtJc1IwRkJSeXhSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZCTzBGQlEyaEZMRTlCUVVrc1YwRkJWeXhIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGQk8wRkJRelZETEU5QlFVa3NXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGQk96czdRVUZIY0VRc1QwRkJTU3hUUVVGVExFZEJRVWNzVjBGQlZ5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkJPMEZCUTI1RExFOUJRVWtzVlVGQlZTeEhRVUZITEZsQlFWa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRVHM3UVVGRmNrTXNUMEZCU1N4RFFVRkRMRk5CUVZNc1IwRkJSenRCUVVOb1FpeGxRVUZYTEVWQlFWZ3NWMEZCVnl4RlFVRkZMRmxCUVZrc1JVRkJXaXhaUVVGWkxFVkJRVVVzV1VGQldTeEZRVUZhTEZsQlFWazdPMEZCUlhaRExGVkJRVTBzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1EwRkJRenM3UVVGRkwwSXNiMEpCUVdkQ0xFVkJRVVVzUzBGQlN6czdRVUZGZGtJc1ZVRkJUU3hGUVVGRk8wRkJRMUFzVTBGQlNTeEZRVUZGTEZOQlFWTTdRVUZEWml4VlFVRkxMRVZCUVVVc1ZVRkJWVHRMUVVOcVFqdEJRVU5FTEdGQlFWTXNSVUZCUlR0QlFVTldMRk5CUVVrc1JVRkJSU3hUUVVGVE8wRkJRMllzVlVGQlN5eEZRVUZGTEZWQlFWVTdTMEZEYWtJN1NVRkRSQ3hEUVVGRE96dEJRVVZHTEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZkQlFWY3NSVUZCUlN4WFFVRlhMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRMmhITEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZOQlFWTXNSVUZCUlN4VlFVRlZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE96dEJRVVV6Uml4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlEyNUNMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlEyaENMRkZCUVZFc2FVTkJRWE5DTEVOQlFVTTdPMEZCUldwRExHTkJRVmNzUTBGRFZDeEhRVUZITEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUTJwQ0xFZEJRVWNzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZEYWtJc1VVRkJVU3hyUTBGQmRVSXNRMEZCUXpzN1FVRkZiRU1zVDBGQlNTeERRVUZETEZsQlFWa3NaME5CUVhGQ0xFTkJRM0pETEZkQlFWY3NSVUZCUlN4WlFVRlpMRVZCUTNwQ0xGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlEzSkNMRVZCUTBRc1MwRkJTeXhEUVVGRExFTkJRVU03TzBGQlJWQXNVVUZCU3l4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wZEJRM1pDT3pzN096czdPenM3VTBGUldTeDFRa0ZCUXl4TFFVRkxMRVZCUVVVN1FVRkRjRUlzVDBGQlNTeEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJRenRCUVVONFFpeFBRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSVHRCUVVGRkxGZEJRVTg3U1VGQlJUczdPenRCUVVzdlFpeFBRVUZKTEZWQlFWVXNSMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGSExFVkJRVVVzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhMUVVGTExFTkJRVUU3UVVGRGVFUXNUMEZCUnl4VlFVRlZMRXRCUVVzc1EwRkJReXhGUVVGRk8wRkJRM0JDTEZkQlFVODdTVUZEVURzN1FVRkhSQ3hQUVVGSkxGVkJRVlVzUjBGQlJ5eEZRVUZGTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRMjVETEU5QlFVa3NWMEZCVnl4SFFVRkhMRVZCUVVVc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEY2tNc1QwRkJUU3hWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETEZkQlFWY3NRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMEZCUTNCRkxFOUJRVWtzVTBGQlV5eFpRVUZCTzA5QlFVVXNWVUZCVlN4WlFVRkJMRU5CUVVNN1FVRkRNVUlzVDBGQlJ5eFZRVUZWTEVkQlFVY3NRMEZCUXl4RlFVRkZPenM3UVVGSGJFSXNZMEZCVlN4SFFVRkhMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXp0QlFVTXhReXhoUVVGVExFZEJRVWNzVlVGQlZTeEhRVUZITEZWQlFWVXNRMEZCUXp0SlFVTndReXhOUVVOSkxFbEJRVWNzVlVGQlZTeEhRVUZITEVOQlFVTXNSVUZCUlRzN08wRkJSM1pDTEdGQlFWTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eFZRVUZWTEVOQlFVTTdRVUZEZUVNc1kwRkJWU3hIUVVGSExGVkJRVlVzUjBGQlJ5eFRRVUZUTEVOQlFVTTdTVUZEY0VNN1FVRkRSQ3haUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUlVGQlJTeFRRVUZUTEVOQlFVTXNRMEZCUXp0QlFVTjJSQ3hoUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXpzN1FVRkZla1FzVDBGQlRTeFJRVUZSTEVkQlFVY3NWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZET3p0QlFVVndSQ3hQUVVGSkxGTkJRVk1zUjBGQlJ5eFJRVUZSTEVWQlFVVTdRVUZEZWtJc1lVRkJVeXhIUVVGSExGRkJRVkVzUTBGQlF6dEpRVU55UWpzN1FVRkZSQ3hQUVVGSkxGVkJRVlVzUjBGQlJ5eFJRVUZSTEVWQlFVVTdRVUZETVVJc1kwRkJWU3hIUVVGSExGRkJRVkVzUTBGQlF6dEpRVU4wUWpzN1FVRkZSQ3hQUVVGSExGVkJRVlVzUlVGQlJUczdRVUZGWkN4TlFVRkZMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0SlFVTm9RenRCUVVORUxFOUJRVWNzVjBGQlZ5eEZRVUZGT3p0QlFVVm1MRTFCUVVVc1EwRkJReXhaUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMGxCUTJ4RE96dEJRVVZFTEV0QlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hIUVVGSExGTkJRVk1zUTBGQlF6dEJRVU01UWl4TFFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTTdPMEZCUldoRExGVkJRVThzU1VGQlNTeERRVUZETEZsQlFWa3NNRUpCUVdVc1EwRkRkRU1zUlVGQlJTeERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1dVRkJXU3hGUVVNdlFpeFRRVUZUTEVWQlFVVXNWVUZCVlN4RFFVTnlRaXhGUVVORUxFdEJRVXNzUTBGQlF5eERRVUZETzBkQlExQTdPenM3T3pzN096dFRRVkZWTEhGQ1FVRkRMRXRCUVVzc1JVRkJSVHRCUVVOc1FpeFBRVUZKTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRE8wRkJRM2hDTEU5QlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRk8wRkJRVVVzVjBGQlR6dEpRVUZGT3p0QlFVVXZRaXhQUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJReXhUUVVGVExFVkJRVVVzVlVGQlZTeEZRVUZGTEZkQlFWY3NSVUZCUlN4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRE96dEJRVVV4Uml4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlEyNUNMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlEyaENMRmRCUVZjc2FVTkJRWE5DTEVOQlFVTTdPMEZCUlhCRExFdEJRVVVzUTBGQlF5eFhRVUZYTEVOQlExb3NSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGRGNFSXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGRGNFSXNWMEZCVnl4clEwRkJkVUlzUTBGQlF6czdRVUZGY2tNc1QwRkJTU3hEUVVGRExHZENRVUZuUWl4RlFVRkZMRU5CUVVNN1FVRkRlRUlzVDBGQlNTeERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFTkJRVU03TzBGQlJYaENMRTlCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZET3p0QlFVVjBRaXhWUVVGUExFbEJRVWtzUTBGQlF5eFpRVUZaTEN0Q1FVRnZRaXhEUVVNelF5eEZRVUZGTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1EwRkJReXhaUVVGWkxFVkJReTlDTEVWQlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RFFVTnlReXhGUVVORUxFdEJRVXNzUTBGQlF5eERRVUZETzBkQlExQTdPenM3T3pzN096czdVMEZUVFN4dFFrRkJSenRCUVVOVUxFOUJRVWtzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNN1FVRkRla0lzVDBGQlNTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMREJDUVVGaExFTkJRVU1zUTBGQlF6czdRVUZGTlVRc1QwRkJTU3hEUVVGRExGbEJRVmtzUTBGRGFFSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkRWaXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVTjRRaXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVTm9RaXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlEyWXNRMEZCUXpzN1FVRkZSaXhYUVVGUkxFTkJRVU1zVlVGQlZTeHZRa0ZCVXl4RFFVRkRPMEZCUXpkQ0xGTkJRVTBzUTBGQlF5eFZRVUZWTEhGQ1FVRlZMRU5CUVVNN08wRkJSVFZDTEU5QlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXp0QlFVTXZRaXhQUVVGSkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1NVRkJTU3hEUVVGRE8wRkJRemRDTEU5QlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRE8wRkJRekZDTEU5QlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRE96dEJRVVZ1UWl4VlFVRlBMRTFCUVUwc1EwRkJRenRIUVVOa096czdPenM3T3pzN096czdPMU5CV1ZNc2IwSkJRVU1zVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4clFrRkJhMElzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZWtRc1QwRkJSeXhQUVVGUExFMUJRVTBzUzBGQlN5eFJRVUZSTEVWQlFVVTdRVUZET1VJc1ZVRkJUU3hIUVVGSExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMGxCUXpGQ0xFMUJRMGs3UVVGRFNpeFZRVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU03U1VGRE9VTTdPMEZCUlVRc1QwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlR0QlFVTjRRaXhYUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNSVUZCUlN4clFrRkJhMElzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0SlFVTnFSQ3hOUVVOSk8wRkJRMG9zVjBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4TlFVRk5MRVZCUVVVc2EwSkJRV3RDTEVOQlFVTXNRMEZCUXp0SlFVTjJRenRIUVVORU96czdPenM3T3pzN096dFRRVlZYTEhOQ1FVRkRMRTlCUVU4c1JVRkJSU3hOUVVGTkxFVkJRVVU3UVVGRE4wSXNUMEZCUnl4UFFVRlBMRTFCUVUwc1MwRkJTeXhSUVVGUkxFVkJRVVU3UVVGRE9VSXNWVUZCVFN4SFFVRkhMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETzBsQlF6RkNMRTFCUTBrc1NVRkJSeXhOUVVGTkxFbEJRVWtzU1VGQlNTeEZRVUZGTzBGQlEzWkNMRlZCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWRCUVVjc1IwRkJSeXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXp0SlFVTTVReXhOUVVOSk8wRkJRMG9zVlVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNN1NVRkRha0k3TzBGQlJVUXNWVUZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEhRVU53UWpzN096czdPenM3T3pzN096czdPMU5CWTFjc2MwSkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NSVUZCUlN4aFFVRmhMRVZCUVVVN1FVRkRka01zVDBGQlNTeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU14UWl4UFFVRkhMRXRCUVVzc1EwRkJReXhoUVVGaExFVkJRVVU3UVVGRGRrSXNVMEZCU3l4RFFVRkRMR0ZCUVdFc1IwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNSVUZCUlN4aFFVRmhMRU5CUVVNc1EwRkJRenRKUVVOc1JEczdRVUZGUkN4VlFVRlBMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRIUVVNM1JEczdPenM3T3pzN096czdVMEZWWlN3d1FrRkJReXhIUVVGSExFVkJRVVU3UVVGRGNrSXNWVUZCVHl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzTkVKQlFXbENMRWRCUVVjc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eEpRVUZKTERKQ1FVRm5RaXhEUVVGRE8wZEJRekZGT3pzN096czdPenM3T3p0VFFWVlRMRzlDUVVGRExFOUJRVThzUlVGQlJUdEJRVU51UWl4VlFVRlBMRTlCUVU4c1IwRkJSeXhWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRIUVVOMFJUczdPenM3T3pzN096czdVMEZWVHl4clFrRkJReXhQUVVGUExFVkJRVVVzUzBGQlN5eEZRVUZGT3p0QlFVVjRRaXhSUVVGTExFZEJRVWNzUzBGQlN5eEhRVUZITEVOQlFVTXNSMEZCUnl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRemxDTEZWQlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGSExFdEJRVXNzUjBGQlJ5eEhRVUZITEVOQlFVTTdSMEZEYkVNN096czdPenM3T3pzN096dFRRVmRoTEhkQ1FVRkRMRXRCUVVzc1JVRkJSVHRCUVVOeVFpeFBRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hKUVVGSkxGTkJRVk1zUlVGQlJUdEJRVU4yUXl4VFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU12UXpzN1FVRkZSQ3hQUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4SlFVRkpMRk5CUVZNc1JVRkJSVHRCUVVOMlF5eFRRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVNdlF6czdRVUZGUkN4VlFVRlBMRXRCUVVzc1EwRkJRenRIUVVOaU96czdPenM3T3pzN096czdPMU5CV1ZVc2NVSkJRVU1zUzBGQlN5eEZRVUZGTzBGQlEyeENMRTlCUVVrc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRk8wRkJRM1JETEZkQlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4RFFVRkZMRXRCUVVzc1EwRkJRenRKUVVOMlJqdEJRVU5FTEZWQlFVOHNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJRenRIUVVOdVFqczdPMUZCZEdkQ2JVSXNaMEpCUVdkQ096czdjVUpCUVdoQ0xHZENRVUZuUWpzN1FVRjVaMEp5UXl4blFrRkJaMElzUTBGQlF5eFJRVUZSTEVkQlFVYzdRVUZETTBJc1UwRkJVU3hGUVVGRkxHdENRVUZUTEUxQlFVMHNSVUZCUlR0QlFVTXhRaXhOUVVGSExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRk8wRkJReTlDTEdsRFFVRnRRanRIUVVOdVFqczdRVUZGUkN4blEwRkJiVUk3UlVGRGJrSTdRVUZEUkN4TlFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExFdEJRVXM3UVVGRGJrSXNZVUZCV1N4RlFVRkZMRWxCUVVrN1FVRkRiRUlzWlVGQll5eEZRVUZGTEVsQlFVazdRVUZEY0VJc1UwRkJVU3hGUVVGRkxFbEJRVWs3UVVGRFpDeFRRVUZSTEVWQlFVVXNTVUZCU1R0RFFVTmtMRU5CUVVNN08wRkJSVVlzWjBKQlFXZENMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6czdPenM3T3pzN08wRkRiR3BDY0VJc1NVRkJUU3hSUVVGUkxFZEJRVWNzYTBKQlFXdENMRU5CUVVNN08wRkJRM0JETEVsQlFVMHNaVUZCWlN4SFFVRkhMSE5DUVVGelFpeERRVUZET3p0QlFVTXZReXhKUVVGTkxHTkJRV01zUjBGQlJ5eHhRa0ZCY1VJc1EwRkJRenM3UVVGRE4wTXNTVUZCVFN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE96czdRVUZGY2tJc1NVRkJUU3h2UWtGQmIwSXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF6czdRVUZEYWtRc1NVRkJUU3h4UWtGQmNVSXNSMEZCUnl4dlFrRkJiMElzUTBGQlF6czdRVUZEYmtRc1NVRkJUU3haUVVGWkxFZEJRVWNzVjBGQlZ5eERRVUZET3p0QlFVTnFReXhKUVVGTkxITkNRVUZ6UWl4SFFVRkhMSEZDUVVGeFFpeERRVUZET3pzN1FVRkZja1FzU1VGQlRTeHJRa0ZCYTBJc1IwRkJSeXh4UWtGQmNVSXNRMEZCUXpzN1FVRkRha1FzU1VGQlRTeFpRVUZaTEVkQlFVY3NaVUZCWlN4RFFVRkRPenRCUVVOeVF5eEpRVUZOTEdsQ1FVRnBRaXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRPenM3UVVGRkwwTXNTVUZCVFN4WFFVRlhMRWRCUVVjc2RVSkJRWFZDTEVOQlFVTTdPMEZCUXpWRExFbEJRVTBzVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRE96dEJRVU0xUXl4SlFVRk5MRzlDUVVGdlFpeHZRa0ZCYjBJc1EwRkJRenM3T3pzN096czdPenM3TzNGQ1EyaENla0lzVTBGQlV6czdPenQxUWtGRGJFSXNWMEZCVnlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lLR1oxYm1OMGFXOXVJR1VvZEN4dUxISXBlMloxYm1OMGFXOXVJSE1vYnl4MUtYdHBaaWdoYmx0dlhTbDdhV1lvSVhSYmIxMHBlM1poY2lCaFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdhV1lvSVhVbUptRXBjbVYwZFhKdUlHRW9ieXdoTUNrN2FXWW9hU2x5WlhSMWNtNGdhU2h2TENFd0tUdDJZWElnWmoxdVpYY2dSWEp5YjNJb1hDSkRZVzV1YjNRZ1ptbHVaQ0J0YjJSMWJHVWdKMXdpSzI4clhDSW5YQ0lwTzNSb2NtOTNJR1l1WTI5a1pUMWNJazFQUkZWTVJWOU9UMVJmUms5VlRrUmNJaXhtZlhaaGNpQnNQVzViYjEwOWUyVjRjRzl5ZEhNNmUzMTlPM1JiYjExYk1GMHVZMkZzYkNoc0xtVjRjRzl5ZEhNc1puVnVZM1JwYjI0b1pTbDdkbUZ5SUc0OWRGdHZYVnN4WFZ0bFhUdHlaWFIxY200Z2N5aHVQMjQ2WlNsOUxHd3NiQzVsZUhCdmNuUnpMR1VzZEN4dUxISXBmWEpsZEhWeWJpQnVXMjlkTG1WNGNHOXlkSE45ZG1GeUlHazlkSGx3Wlc5bUlISmxjWFZwY21VOVBWd2lablZ1WTNScGIyNWNJaVltY21WeGRXbHlaVHRtYjNJb2RtRnlJRzg5TUR0dlBISXViR1Z1WjNSb08yOHJLeWx6S0hKYmIxMHBPM0psZEhWeWJpQnpmU2tpTENKcGJYQnZjblFnVW1WemFYcGhZbXhsUTI5c2RXMXVjeUJtY205dElDY3VMMk5zWVhOekp6dGNibWx0Y0c5eWRDQjdSRUZVUVY5QlVFbDlJR1p5YjIwZ0p5NHZZMjl1YzNSaGJuUnpKenRjYmx4dUpDNW1iaTV5WlhOcGVtRmliR1ZEYjJ4MWJXNXpJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjMDl5VFdWMGFHOWtMQ0F1TGk1aGNtZHpLU0I3WEc1Y2RISmxkSFZ5YmlCMGFHbHpMbVZoWTJnb1puVnVZM1JwYjI0b0tTQjdYRzVjZEZ4MGJHVjBJQ1IwWVdKc1pTQTlJQ1FvZEdocGN5azdYRzVjYmx4MFhIUnNaWFFnWVhCcElEMGdKSFJoWW14bExtUmhkR0VvUkVGVVFWOUJVRWtwTzF4dVhIUmNkR2xtSUNnaFlYQnBLU0I3WEc1Y2RGeDBYSFJoY0drZ1BTQnVaWGNnVW1WemFYcGhZbXhsUTI5c2RXMXVjeWdrZEdGaWJHVXNJRzl3ZEdsdmJuTlBjazFsZEdodlpDazdYRzVjZEZ4MFhIUWtkR0ZpYkdVdVpHRjBZU2hFUVZSQlgwRlFTU3dnWVhCcEtUdGNibHgwWEhSOVhHNWNibHgwWEhSbGJITmxJR2xtSUNoMGVYQmxiMllnYjNCMGFXOXVjMDl5VFdWMGFHOWtJRDA5UFNBbmMzUnlhVzVuSnlrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUdGd2FWdHZjSFJwYjI1elQzSk5aWFJvYjJSZEtDNHVMbUZ5WjNNcE8xeHVYSFJjZEgxY2JseDBmU2s3WEc1OU8xeHVYRzRrTG5KbGMybDZZV0pzWlVOdmJIVnRibk1nUFNCU1pYTnBlbUZpYkdWRGIyeDFiVzV6TzF4dUlpd2lhVzF3YjNKMElIdGNibHgwUkVGVVFWOUJVRWtzWEc1Y2RFUkJWRUZmUTA5TVZVMU9VMTlKUkN4Y2JseDBSRUZVUVY5RFQweFZUVTVmU1VRc1hHNWNkRVJCVkVGZlZFZ3NYRzVjZEVOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SExGeHVYSFJEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjc1hHNWNkRU5NUVZOVFgwaEJUa1JNUlN4Y2JseDBRMHhCVTFOZlNFRk9SRXhGWDBOUFRsUkJTVTVGVWl4Y2JseDBSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVMRnh1WEhSRlZrVk9WRjlTUlZOSldrVXNYRzVjZEVWV1JVNVVYMUpGVTBsYVJWOVRWRTlRTEZ4dVhIUlRSVXhGUTFSUFVsOVVTQ3hjYmx4MFUwVk1SVU5VVDFKZlZFUXNYRzVjZEZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RlhHNTlYRzVtY205dElDY3VMMk52Ym5OMFlXNTBjeWM3WEc1Y2JpOHFLbHh1VkdGclpYTWdZU0E4ZEdGaWJHVWdMejRnWld4bGJXVnVkQ0JoYm1RZ2JXRnJaWE1nYVhRbmN5QmpiMngxYlc1eklISmxjMmw2WVdKc1pTQmhZM0p2YzNNZ1ltOTBhRnh1Ylc5aWFXeGxJR0Z1WkNCa1pYTnJkRzl3SUdOc2FXVnVkSE11WEc1Y2JrQmpiR0Z6Y3lCU1pYTnBlbUZpYkdWRGIyeDFiVzV6WEc1QWNHRnlZVzBnSkhSaFlteGxJSHRxVVhWbGNubDlJR3BSZFdWeWVTMTNjbUZ3Y0dWa0lEeDBZV0pzWlQ0Z1pXeGxiV1Z1ZENCMGJ5QnRZV3RsSUhKbGMybDZZV0pzWlZ4dVFIQmhjbUZ0SUc5d2RHbHZibk1nZTA5aWFtVmpkSDBnUTI5dVptbG5kWEpoZEdsdmJpQnZZbXBsWTNSY2Jpb3FMMXh1Wlhod2IzSjBJR1JsWm1GMWJIUWdZMnhoYzNNZ1VtVnphWHBoWW14bFEyOXNkVzF1Y3lCN1hHNWNkR052Ym5OMGNuVmpkRzl5S0NSMFlXSnNaU3dnYjNCMGFXOXVjeWtnZTF4dVhIUmNkSFJvYVhNdWJuTWdQU0FuTG5Kakp5QXJJSFJvYVhNdVkyOTFiblFyS3p0Y2JseHVYSFJjZEhSb2FYTXViM0IwYVc5dWN5QTlJQ1F1WlhoMFpXNWtLSHQ5TENCU1pYTnBlbUZpYkdWRGIyeDFiVzV6TG1SbFptRjFiSFJ6TENCdmNIUnBiMjV6S1R0Y2JseHVYSFJjZEhSb2FYTXVKSGRwYm1SdmR5QTlJQ1FvZDJsdVpHOTNLVHRjYmx4MFhIUjBhR2x6TGlSdmQyNWxja1J2WTNWdFpXNTBJRDBnSkNna2RHRmliR1ZiTUYwdWIzZHVaWEpFYjJOMWJXVnVkQ2s3WEc1Y2RGeDBkR2hwY3k0a2RHRmliR1VnUFNBa2RHRmliR1U3WEc1Y2JseDBYSFIwYUdsekxuTmxkRlJoWW14bFVISnZjR1Z5ZEdsbGN5Z3BPMXh1WEhSY2RIUm9hWE11Y21WbWNtVnphRWhsWVdSbGNuTW9LVHRjYmx4MFhIUjBhR2x6TG5KbGMzUnZjbVZEYjJ4MWJXNVhhV1IwYUhNb0tUdGNibHgwWEhSMGFHbHpMbk41Ym1OSVlXNWtiR1ZYYVdSMGFITW9LVHRjYmx4dVhIUmNkSFJvYVhNdVltbHVaRVYyWlc1MGN5aDBhR2x6TGlSM2FXNWtiM2NzSUNkeVpYTnBlbVVuTENCMGFHbHpMbk41Ym1OSVlXNWtiR1ZYYVdSMGFITXVZbWx1WkNoMGFHbHpLU2s3WEc1Y2JseDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbk4wWVhKMEtTQjdYRzVjZEZ4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrZEdGaWJHVXNJRVZXUlU1VVgxSkZVMGxhUlY5VFZFRlNWQ3dnZEdocGN5NXZjSFJwYjI1ekxuTjBZWEowS1R0Y2JseDBYSFI5WEc1Y2RGeDBhV1lnS0hSb2FYTXViM0IwYVc5dWN5NXlaWE5wZW1VcElIdGNibHgwWEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVIwWVdKc1pTd2dSVlpGVGxSZlVrVlRTVnBGTENCMGFHbHpMbTl3ZEdsdmJuTXVjbVZ6YVhwbEtUdGNibHgwWEhSOVhHNWNkRngwYVdZZ0tIUm9hWE11YjNCMGFXOXVjeTV6ZEc5d0tTQjdYRzVjZEZ4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrZEdGaWJHVXNJRVZXUlU1VVgxSkZVMGxhUlY5VFZFOVFMQ0IwYUdsekxtOXdkR2x2Ym5NdWMzUnZjQ2s3WEc1Y2RGeDBmVnh1WEhSOVhHNWNibHgwTHlvcVhHNWNkQ0FxSUZObGRDQjBZV0pzWlNCd2NtOXdaWEowYVdWeklIZG9aVzRnYVc1cGRHbGhiR2w2WlZ4dVhIUWdLaUJjYmx4MElDb2dRRzFsZEdodlpDQnpaWFJVWVdKc1pWQnliM0JsY25ScFpYTmNibHgwSUNvdlhHNWNkSE5sZEZSaFlteGxVSEp2Y0dWeWRHbGxjeWdwSUh0Y2JseDBYSFJqYjI1emIyeGxMbXh2WnloMGFHbHpMaVIwWVdKc1pTazdYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVXVZM056S0NkMFlXSnNaUzFzWVhsdmRYUW5MQ0FuWm1sNFpXUW5LVHRjYmx4MFhIUjBhR2x6TGlSMFlXSnNaUzVtYVc1a0tDZDBhR1ZoWkNCMGNpQjBhQ2NwTG1OemN5Z25kbVZ5ZEdsallXd3RZV3hwWjI0bkxDQW5kRzl3SnlrN1hHNWNkRngwZEdocGN5NGtkR0ZpYkdVdVptbHVaQ2duZEdnc0lIUmtKeWt1WTNOektDZDNiM0prTFdKeVpXRnJKeXdnSjJKeVpXRnJMV0ZzYkNjcE8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RGSmxabkpsYzJobGN5QjBhR1VnYUdWaFpHVnljeUJoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hwY3lCcGJuTjBZVzVqWlhNZ1BIUmhZbXhsTHo0Z1pXeGxiV1Z1ZENCaGJtUmNibHgwWjJWdVpYSmhkR1Z6SUdoaGJtUnNaWE1nWm05eUlIUm9aVzB1SUVGc2MyOGdZWE56YVdkdWN5QndaWEpqWlc1MFlXZGxJSGRwWkhSb2N5NWNibHh1WEhSQWJXVjBhRzlrSUhKbFpuSmxjMmhJWldGa1pYSnpYRzVjZENvcUwxeHVYSFJ5WldaeVpYTm9TR1ZoWkdWeWN5Z3BJSHRjYmx4MFhIUXZMeUJCYkd4dmR5QjBhR1VnYzJWc1pXTjBiM0lnZEc4Z1ltVWdZbTkwYUNCaElISmxaM1ZzWVhJZ2MyVnNZM1J2Y2lCemRISnBibWNnWVhNZ2QyVnNiQ0JoYzF4dVhIUmNkQzh2SUdFZ1pIbHVZVzFwWXlCallXeHNZbUZqYTF4dVhIUmNkR3hsZENCelpXeGxZM1J2Y2lBOUlIUm9hWE11YjNCMGFXOXVjeTV6Wld4bFkzUnZjanRjYmx4MFhIUnBaaWgwZVhCbGIyWWdjMlZzWldOMGIzSWdQVDA5SUNkbWRXNWpkR2x2YmljcElIdGNibHgwWEhSY2RITmxiR1ZqZEc5eUlEMGdjMlZzWldOMGIzSXVZMkZzYkNoMGFHbHpMQ0IwYUdsekxpUjBZV0pzWlNrN1hHNWNkRngwZlZ4dVhHNWNkRngwTHk4Z1UyVnNaV04wSUdGc2JDQjBZV0pzWlNCb1pXRmtaWEp6WEc1Y2RGeDBkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpJRDBnZEdocGN5NGtkR0ZpYkdVdVptbHVaQ2h6Wld4bFkzUnZjaWs3WEc1Y2JseDBYSFF2THlCQmMzTnBaMjRnY0dWeVkyVnVkR0ZuWlNCM2FXUjBhSE1nWm1seWMzUXNJSFJvWlc0Z1kzSmxZWFJsSUdSeVlXY2dhR0Z1Wkd4bGMxeHVYSFJjZEhSb2FYTXVZWE56YVdkdVVHVnlZMlZ1ZEdGblpWZHBaSFJvY3lncE8xeHVYSFJjZEhSb2FYTXVZM0psWVhSbFNHRnVaR3hsY3lncE8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RFTnlaV0YwWlhNZ1pIVnRiWGtnYUdGdVpHeGxJR1ZzWlcxbGJuUnpJR1p2Y2lCaGJHd2dkR0ZpYkdVZ2FHVmhaR1Z5SUdOdmJIVnRibk5jYmx4dVhIUkFiV1YwYUc5a0lHTnlaV0YwWlVoaGJtUnNaWE5jYmx4MEtpb3ZYRzVjZEdOeVpXRjBaVWhoYm1Sc1pYTW9LU0I3WEc1Y2RGeDBiR1YwSUhKbFppQTlJSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2p0Y2JseDBYSFJwWmlBb2NtVm1JQ0U5SUc1MWJHd3BJSHRjYmx4MFhIUmNkSEpsWmk1eVpXMXZkbVVvS1R0Y2JseDBYSFI5WEc1Y2JseDBYSFIwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJZ1BTQWtLR0E4WkdsMklHTnNZWE56UFNja2UwTk1RVk5UWDBoQlRrUk1SVjlEVDA1VVFVbE9SVko5SnlBdlBtQXBYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVXVZbVZtYjNKbEtIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaWs3WEc1Y2JseDBYSFIwYUdsekxpUjBZV0pzWlVobFlXUmxjbk11WldGamFDZ29hU3dnWld3cElEMCtJSHRjYmx4MFhIUmNkR3hsZENBa1kzVnljbVZ1ZENBOUlIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxjU2hwS1R0Y2JseDBYSFJjZEd4bGRDQWtibVY0ZENBOUlIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxjU2hwSUNzZ01TazdYRzVjZEZ4MFhIUnBaaUFvSkc1bGVIUXViR1Z1WjNSb0lEMDlQU0F3SUh4OElDUnVaWGgwTG1sektGTkZURVZEVkU5U1gxVk9Va1ZUU1ZwQlFreEZLU2tnZTF4dVhIUmNkRngwWEhSeVpYUjFjbTQ3WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEM4cUtseHVYSFJjZEZ4MElDb2dSbWw0WldRZ1lua2daMjF2TG5KelpHNWNibHgwWEhSY2RDQXFJRUZrWkNCaGRIUnlhV0oxZEdVZ1kyOXNkVzF1TFdsa0lIUnZJSEpsYzJsNlpTMW9ZVzVrYkdVZ1pXeGxiV1Z1ZEZ4dVhIUmNkRngwSUNvdlhHNWNkRngwWEhSamIyNXpkQ0JqYjJ4MWJXNUpaQ0E5SUNRb1pXd3BMbUYwZEhJb0oyUmhkR0V0Y21WemFYcGhZbXhsTFdOdmJIVnRiaTFwWkNjcFhHNWNibHgwWEhSY2RHeGxkQ0FrYUdGdVpHeGxJRDBnSkNoZ1BHUnBkaUJqYkdGemN6MG5KSHREVEVGVFUxOUlRVTVFVEVWOUp5QmpiMngxYlc0dGFXUTlKeVI3WTI5c2RXMXVTV1I5SnlBdlBtQXBYRzVjZEZ4MFhIUmNkQzVrWVhSaEtFUkJWRUZmVkVnc0lDUW9aV3dwS1Z4dVhIUmNkRngwWEhRdVlYQndaVzVrVkc4b2RHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlLVHRjYmx4MFhIUjlLVHRjYmx4dVhIUmNkSFJvYVhNdVltbHVaRVYyWlc1MGN5aDBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWElzSUZzbmJXOTFjMlZrYjNkdUp5d2dKM1J2ZFdOb2MzUmhjblFuWFN3Z0p5NG5LME5NUVZOVFgwaEJUa1JNUlN3Z2RHaHBjeTV2YmxCdmFXNTBaWEpFYjNkdUxtSnBibVFvZEdocGN5a3BPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRUZ6YzJsbmJuTWdZU0J3WlhKalpXNTBZV2RsSUhkcFpIUm9JSFJ2SUdGc2JDQmpiMngxYlc1eklHSmhjMlZrSUc5dUlIUm9aV2x5SUdOMWNuSmxiblFnY0dsNFpXd2dkMmxrZEdnb2N5bGNibHh1WEhSQWJXVjBhRzlrSUdGemMybG5ibEJsY21ObGJuUmhaMlZYYVdSMGFITmNibHgwS2lvdlhHNWNkR0Z6YzJsbmJsQmxjbU5sYm5SaFoyVlhhV1IwYUhNb0tTQjdYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVklaV0ZrWlhKekxtVmhZMmdvS0Y4c0lHVnNLU0E5UGlCN1hHNWNkRngwWEhSc1pYUWdKR1ZzSUQwZ0pDaGxiQ2s3WEc1Y2RGeDBYSFFrWld3dWQybGtkR2dvVFdGMGFDNXRZWGdvSkdWc0xtOTFkR1Z5VjJsa2RHZ29LU3dnZEdocGN5NXZjSFJwYjI1ekxtMXBibGRwWkhSb0tTbGNibHgwWEhSOUtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhHNWNibHgwUUcxbGRHaHZaQ0J6ZVc1alNHRnVaR3hsVjJsa2RHaHpYRzVjZENvcUwxeHVYSFJ6ZVc1alNHRnVaR3hsVjJsa2RHaHpLQ2tnZTF4dVhIUmNkR3hsZENBa1kyOXVkR0ZwYm1WeUlEMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5WEc1Y2JseDBYSFFrWTI5dWRHRnBibVZ5TG5kcFpIUm9LSFJvYVhNdUpIUmhZbXhsTG5kcFpIUm9LQ2twTzF4dVhHNWNkRngwSkdOdmJuUmhhVzVsY2k1bWFXNWtLQ2N1Snl0RFRFRlRVMTlJUVU1RVRFVXBMbVZoWTJnb0tGOHNJR1ZzS1NBOVBpQjdYRzVjZEZ4MFhIUnNaWFFnSkdWc0lEMGdKQ2hsYkNrN1hHNWNibHgwWEhSY2RHeGxkQ0JvWldsbmFIUWdQU0IwYUdsekxtOXdkR2x2Ym5NdWNtVnphWHBsUm5KdmJVSnZaSGtnUDF4dVhIUmNkRngwWEhSMGFHbHpMaVIwWVdKc1pTNW9aV2xuYUhRb0tTQTZYRzVjZEZ4MFhIUmNkSFJvYVhNdUpIUmhZbXhsTG1acGJtUW9KM1JvWldGa0p5a3VhR1ZwWjJoMEtDazdYRzVjYmx4MFhIUmNkR3hsZENCc1pXWjBJRDBnSkdWc0xtUmhkR0VvUkVGVVFWOVVTQ2t1YjNWMFpYSlhhV1IwYUNncElDc2dLRnh1WEhSY2RGeDBYSFFrWld3dVpHRjBZU2hFUVZSQlgxUklLUzV2Wm1aelpYUW9LUzVzWldaMElDMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5TG05bVpuTmxkQ2dwTG14bFpuUmNibHgwWEhSY2RDazdYRzVjYmx4MFhIUmNkQ1JsYkM1amMzTW9leUJzWldaMExDQm9aV2xuYUhRZ2ZTazdYRzVjZEZ4MGZTazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVR1Z5YzJsemRITWdkR2hsSUdOdmJIVnRiaUIzYVdSMGFITWdhVzRnYkc5allXeFRkRzl5WVdkbFhHNWNibHgwUUcxbGRHaHZaQ0J6WVhabFEyOXNkVzF1VjJsa2RHaHpYRzVjZENvcUwxeHVYSFJ6WVhabFEyOXNkVzF1VjJsa2RHaHpLQ2tnZTF4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeTVsWVdOb0tDaGZMQ0JsYkNrZ1BUNGdlMXh1WEhSY2RGeDBiR1YwSUNSbGJDQTlJQ1FvWld3cE8xeHVYRzVjZEZ4MFhIUnBaaUFvZEdocGN5NXZjSFJwYjI1ekxuTjBiM0psSUNZbUlDRWtaV3d1YVhNb1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVXBLU0I3WEc1Y2RGeDBYSFJjZEhSb2FYTXViM0IwYVc5dWN5NXpkRzl5WlM1elpYUW9YRzVjZEZ4MFhIUmNkRngwZEdocGN5NW5aVzVsY21GMFpVTnZiSFZ0Ymtsa0tDUmxiQ2tzWEc1Y2RGeDBYSFJjZEZ4MEpHVnNMbmRwWkhSb0tDa3NYRzVjZEZ4MFhIUmNkQ2s3WEc1Y2RGeDBYSFI5WEc1Y2RGeDBmU2s3WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwVW1WMGNtbGxkbVZ6SUdGdVpDQnpaWFJ6SUhSb1pTQmpiMngxYlc0Z2QybGtkR2h6SUdaeWIyMGdiRzlqWVd4VGRHOXlZV2RsWEc1Y2JseDBRRzFsZEdodlpDQnlaWE4wYjNKbFEyOXNkVzF1VjJsa2RHaHpYRzVjZENvcUwxeHVYSFJ5WlhOMGIzSmxRMjlzZFcxdVYybGtkR2h6S0NrZ2UxeHVYSFJjZEhSb2FYTXVKSFJoWW14bFNHVmhaR1Z5Y3k1bFlXTm9LQ2hmTENCbGJDa2dQVDRnZTF4dVhIUmNkRngwYkdWMElDUmxiQ0E5SUNRb1pXd3BPMXh1WEc1Y2RGeDBYSFJwWmloMGFHbHpMbTl3ZEdsdmJuTXVjM1J2Y21VZ0ppWWdJU1JsYkM1cGN5aFRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SU2twSUh0Y2JseDBYSFJjZEZ4MGJHVjBJSGRwWkhSb0lEMGdkR2hwY3k1dmNIUnBiMjV6TG5OMGIzSmxMbWRsZENoY2JseDBYSFJjZEZ4MFhIUjBhR2x6TG1kbGJtVnlZWFJsUTI5c2RXMXVTV1FvSkdWc0tWeHVYSFJjZEZ4MFhIUXBPMXh1WEc1Y2RGeDBYSFJjZEdsbUtIZHBaSFJvSUNFOUlHNTFiR3dwSUh0Y2JseDBYSFJjZEZ4MFhIUWtaV3d1ZDJsa2RHZ29UV0YwYUM1dFlYZ29kMmxrZEdnc0lIUm9hWE11YjNCMGFXOXVjeTV0YVc1WGFXUjBhQ2twTzF4dVhIUmNkRngwWEhSOVhHNWNkRngwWEhSOVhHNWNkRngwZlNrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFVHOXBiblJsY2k5dGIzVnpaU0JrYjNkdUlHaGhibVJzWlhKY2JseHVYSFJBYldWMGFHOWtJRzl1VUc5cGJuUmxja1J2ZDI1Y2JseDBRSEJoY21GdElHVjJaVzUwSUh0UFltcGxZM1I5SUVWMlpXNTBJRzlpYW1WamRDQmhjM052WTJsaGRHVmtJSGRwZEdnZ2RHaGxJR2x1ZEdWeVlXTjBhVzl1WEc1Y2RDb3FMMXh1WEhSdmJsQnZhVzUwWlhKRWIzZHVLR1YyWlc1MEtTQjdYRzVjZEZ4MEx5OGdUMjVzZVNCaGNIQnNhV1Z6SUhSdklHeGxablF0WTJ4cFkyc2daSEpoWjJkcGJtZGNibHgwWEhScFppaGxkbVZ1ZEM1M2FHbGphQ0FoUFQwZ01Ta2dleUJ5WlhSMWNtNDdJSDFjYmx4dVhIUmNkQzh2SUVsbUlHRWdjSEpsZG1sdmRYTWdiM0JsY21GMGFXOXVJR2x6SUdSbFptbHVaV1FzSUhkbElHMXBjM05sWkNCMGFHVWdiR0Z6ZENCdGIzVnpaWFZ3TGx4dVhIUmNkQzh2SUZCeWIySmhZbXg1SUdkdlltSnNaV1FnZFhBZ1lua2dkWE5sY2lCdGIzVnphVzVuSUc5MWRDQjBhR1VnZDJsdVpHOTNJSFJvWlc0Z2NtVnNaV0Z6YVc1bkxseHVYSFJjZEM4dklGZGxKMnhzSUhOcGJYVnNZWFJsSUdFZ2NHOXBiblJsY25Wd0lHaGxjbVVnY0hKcGIzSWdkRzhnYVhSY2JseDBYSFJwWmloMGFHbHpMbTl3WlhKaGRHbHZiaWtnZTF4dVhIUmNkRngwZEdocGN5NXZibEJ2YVc1MFpYSlZjQ2hsZG1WdWRDazdYRzVjZEZ4MGZWeHVYRzVjZEZ4MEx5OGdTV2R1YjNKbElHNXZiaTF5WlhOcGVtRmliR1VnWTI5c2RXMXVjMXh1WEhSY2RHeGxkQ0FrWTNWeWNtVnVkRWR5YVhBZ1BTQWtLR1YyWlc1MExtTjFjbkpsYm5SVVlYSm5aWFFwTzF4dVhIUmNkR2xtS0NSamRYSnlaVzUwUjNKcGNDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNibHgwWEhSY2RISmxkSFZ5Ymp0Y2JseDBYSFI5WEc1Y2RGeDBMeW9xWEc1Y2RGeDBJQ29nUm1sNFpXUWdZbmtnWjIxdkxuSnpaRzVjYmx4MFhIUWdLaUJqYUdGdVoyVmtJR3h2WjJsaklHWnBibVFnWld4bGJXVnVkQ0JzWldaMFEyOXNkVzF1SUdGdVpDQnlhV2RvZEVOdmJIVnRiaUIzYVhSb0lHTnZiSFZ0YmkxcFpGeHVYSFJjZENBcUwxeHVYSFJjZEdOdmJuTjBJR052YkhWdGJrbGtJRDBnSkNobGRtVnVkQzVqZFhKeVpXNTBWR0Z5WjJWMEtTNWhkSFJ5S0NkamIyeDFiVzR0YVdRbktWeHVYSFJjZEdOdmJuTjBJSE5sYkdWamRHOXlJRDBnSjF0a1lYUmhMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNHRhV1E5WENJbklDc2dZMjlzZFcxdVNXUWdLeUFuWENKZEoxeHVYSFJjZEd4bGRDQWtiR1ZtZEVOdmJIVnRiaUE5SUhSb2FYTXVKSFJoWW14bExtWnBibVFvYzJWc1pXTjBiM0lwWEc1Y2RGeDBiR1YwSUNSeWFXZG9kRU52YkhWdGJpQTlJSFJvYVhNdUpIUmhZbXhsTG1acGJtUW9jMlZzWldOMGIzSXBMbTVsZUhRb0tWeHVYSFJjZEM4dklHeGxkQ0JzWldaMFYybGtkR2dnUFNCMGFHbHpMbkJoY25ObFYybGtkR2dvSkd4bFpuUkRiMngxYlc1Yk1GMHBPMXh1WEhSY2RDOHZJR3hsZENCeWFXZG9kRmRwWkhSb0lEMGdkR2hwY3k1d1lYSnpaVmRwWkhSb0tDUnlhV2RvZEVOdmJIVnRibHN3WFNrN1hHNWNkRngwYkdWMElHeGxablJYYVdSMGFDQTlJQ1JzWldaMFEyOXNkVzF1TG5kcFpIUm9LQ2xjYmx4MFhIUnNaWFFnY21sbmFIUlhhV1IwYUNBOUlDUnlhV2RvZEVOdmJIVnRiaTUzYVdSMGFDZ3BYRzVjYmx4MFhIUjBhR2x6TG05d1pYSmhkR2x2YmlBOUlIdGNibHgwWEhSY2RDUnNaV1owUTI5c2RXMXVMQ0FrY21sbmFIUkRiMngxYlc0c0lDUmpkWEp5Wlc1MFIzSnBjQ3hjYmx4dVhIUmNkRngwYzNSaGNuUllPaUIwYUdsekxtZGxkRkJ2YVc1MFpYSllLR1YyWlc1MEtTeGNibHh1WEhSY2RGeDBjRzlwYm5SbGNrUnZkMjVGZG1WdWREb2daWFpsYm5Rc1hHNWNibHgwWEhSY2RIZHBaSFJvY3pvZ2UxeHVYSFJjZEZ4MFhIUnNaV1owT2lCc1pXWjBWMmxrZEdnc1hHNWNkRngwWEhSY2RISnBaMmgwT2lCeWFXZG9kRmRwWkhSb1hHNWNkRngwWEhSOUxGeHVYSFJjZEZ4MGJtVjNWMmxrZEdoek9pQjdYRzVjZEZ4MFhIUmNkR3hsWm5RNklHeGxablJYYVdSMGFDeGNibHgwWEhSY2RGeDBjbWxuYUhRNklISnBaMmgwVjJsa2RHaGNibHgwWEhSY2RIMWNibHgwWEhSOU8xeHVYRzVjZEZ4MGRHaHBjeTVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKRzkzYm1WeVJHOWpkVzFsYm5Rc0lGc25iVzkxYzJWdGIzWmxKeXdnSjNSdmRXTm9iVzkyWlNkZExDQjBhR2x6TG05dVVHOXBiblJsY2sxdmRtVXVZbWx1WkNoMGFHbHpLU2s3WEc1Y2RGeDBkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXNJRnNuYlc5MWMyVjFjQ2NzSUNkMGIzVmphR1Z1WkNkZExDQjBhR2x6TG05dVVHOXBiblJsY2xWd0xtSnBibVFvZEdocGN5a3BPMXh1WEc1Y2RGeDBkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5WEc1Y2RGeDBYSFF1WVdSa0tIUm9hWE11SkhSaFlteGxLVnh1WEhSY2RGeDBMbUZrWkVOc1lYTnpLRU5NUVZOVFgxUkJRa3hGWDFKRlUwbGFTVTVIS1R0Y2JseHVYSFJjZENSc1pXWjBRMjlzZFcxdVhHNWNkRngwWEhRdVlXUmtLQ1J5YVdkb2RFTnZiSFZ0YmlsY2JseDBYSFJjZEM1aFpHUW9KR04xY25KbGJuUkhjbWx3S1Z4dVhIUmNkRngwTG1Ga1pFTnNZWE56S0VOTVFWTlRYME5QVEZWTlRsOVNSVk5KV2tsT1J5azdYRzVjYmx4MFhIUjBhR2x6TG5SeWFXZG5aWEpGZG1WdWRDaEZWa1ZPVkY5U1JWTkpXa1ZmVTFSQlVsUXNJRnRjYmx4MFhIUmNkQ1JzWldaMFEyOXNkVzF1TENBa2NtbG5hSFJEYjJ4MWJXNHNYRzVjZEZ4MFhIUnNaV1owVjJsa2RHZ3NJSEpwWjJoMFYybGtkR2hjYmx4MFhIUmRMRnh1WEhSY2RHVjJaVzUwS1R0Y2JseHVYSFJjZEdWMlpXNTBMbkJ5WlhabGJuUkVaV1poZFd4MEtDazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVRzlwYm5SbGNpOXRiM1Z6WlNCdGIzWmxiV1Z1ZENCb1lXNWtiR1Z5WEc1Y2JseDBRRzFsZEdodlpDQnZibEJ2YVc1MFpYSk5iM1psWEc1Y2RFQndZWEpoYlNCbGRtVnVkQ0I3VDJKcVpXTjBmU0JGZG1WdWRDQnZZbXBsWTNRZ1lYTnpiMk5wWVhSbFpDQjNhWFJvSUhSb1pTQnBiblJsY21GamRHbHZibHh1WEhRcUtpOWNibHgwYjI1UWIybHVkR1Z5VFc5MlpTaGxkbVZ1ZENrZ2UxeHVYSFJjZEd4bGRDQnZjQ0E5SUhSb2FYTXViM0JsY21GMGFXOXVPMXh1WEhSY2RHbG1LQ0YwYUdsekxtOXdaWEpoZEdsdmJpa2dleUJ5WlhSMWNtNDdJSDFjYmx4dVhHNWNkRngwTHk4Z1JHVjBaWEp0YVc1bElIUm9aU0JrWld4MFlTQmphR0Z1WjJVZ1ltVjBkMlZsYmlCemRHRnlkQ0JoYm1RZ2JtVjNJRzF2ZFhObElIQnZjMmwwYVc5dUxDQmhjeUJoSUhCbGNtTmxiblJoWjJVZ2IyWWdkR2hsSUhSaFlteGxJSGRwWkhSb1hHNWNkRngwTHk4Z2JHVjBJR1JwWm1abGNtVnVZMlVnUFNBb2RHaHBjeTVuWlhSUWIybHVkR1Z5V0NobGRtVnVkQ2tnTFNCdmNDNXpkR0Z5ZEZncElDOGdkR2hwY3k0a2RHRmliR1V1ZDJsa2RHZ29LU0FxSURFd01EdGNibHgwWEhSc1pYUWdaR2xtWm1WeVpXNWpaU0E5SUdWMlpXNTBMbkJoWjJWWUlDMGdiM0F1Y0c5cGJuUmxja1J2ZDI1RmRtVnVkQzV3WVdkbFdGeHVYSFJjZEdsbUtHUnBabVpsY21WdVkyVWdQVDA5SURBcElIdGNibHgwWEhSY2RISmxkSFZ5Ymp0Y2JseDBYSFI5WEc1Y2JseHVYSFJjZEd4bGRDQnNaV1owUTI5c2RXMXVJRDBnYjNBdUpHeGxablJEYjJ4MWJXNWJNRjA3WEc1Y2RGeDBiR1YwSUhKcFoyaDBRMjlzZFcxdUlEMGdiM0F1SkhKcFoyaDBRMjlzZFcxdVd6QmRPMXh1WEhSY2RHTnZibk4wSUhSdmRHRnNWMmxrZEdnZ1BTQnZjQzRrYkdWbWRFTnZiSFZ0Ymk1M2FXUjBhQ2dwSUNzZ2IzQXVKSEpwWjJoMFEyOXNkVzF1TG5kcFpIUm9LQ2s3WEc1Y2RGeDBiR1YwSUhkcFpIUm9UR1ZtZEN3Z2QybGtkR2hTYVdkb2REdGNibHgwWEhScFppaGthV1ptWlhKbGJtTmxJRDRnTUNrZ2UxeHVYSFJjZEZ4MEx5OGdkMmxrZEdoTVpXWjBJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNodmNDNTNhV1IwYUhNdWJHVm1kQ0FySUNodmNDNTNhV1IwYUhNdWNtbG5hSFFnTFNCdmNDNXVaWGRYYVdSMGFITXVjbWxuYUhRcEtUdGNibHgwWEhSY2RDOHZJSGRwWkhSb1VtbG5hSFFnUFNCMGFHbHpMbU52Ym5OMGNtRnBibGRwWkhSb0tHOXdMbmRwWkhSb2N5NXlhV2RvZENBdElHUnBabVpsY21WdVkyVXBPMXh1WEhSY2RGeDBkMmxrZEdoU2FXZG9kQ0E5SUc5d0xuZHBaSFJvY3k1eWFXZG9kQ0F0SUdScFptWmxjbVZ1WTJVN1hHNWNkRngwWEhSM2FXUjBhRXhsWm5RZ1BTQjBiM1JoYkZkcFpIUm9JQzBnZDJsa2RHaFNhV2RvZER0Y2JseDBYSFI5WEc1Y2RGeDBaV3h6WlNCcFppaGthV1ptWlhKbGJtTmxJRHdnTUNrZ2UxeHVYSFJjZEZ4MEx5OGdkMmxrZEdoTVpXWjBJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNodmNDNTNhV1IwYUhNdWJHVm1kQ0FySUdScFptWmxjbVZ1WTJVcE8xeHVYSFJjZEZ4MEx5OGdkMmxrZEdoU2FXZG9kQ0E5SUhSb2FYTXVZMjl1YzNSeVlXbHVWMmxrZEdnb2IzQXVkMmxrZEdoekxuSnBaMmgwSUNzZ0tHOXdMbmRwWkhSb2N5NXNaV1owSUMwZ2IzQXVibVYzVjJsa2RHaHpMbXhsWm5RcEtUdGNibHgwWEhSY2RIZHBaSFJvVEdWbWRDQTlJRzl3TG5kcFpIUm9jeTVzWldaMElDc2daR2xtWm1WeVpXNWpaVHRjYmx4MFhIUmNkSGRwWkhSb1VtbG5hSFFnUFNCMGIzUmhiRmRwWkhSb0lDMGdkMmxrZEdoTVpXWjBPMXh1WEhSY2RIMWNibHgwWEhSM2FXUjBhRXhsWm5RZ1BTQk5ZWFJvTG0xaGVDaDBhR2x6TG05d2RHbHZibk11YldsdVYybGtkR2dzSUhkcFpIUm9UR1ZtZENrN1hHNWNkRngwZDJsa2RHaFNhV2RvZENBOUlFMWhkR2d1YldGNEtIUm9hWE11YjNCMGFXOXVjeTV0YVc1WGFXUjBhQ3dnZDJsa2RHaFNhV2RvZENrN1hHNWNibHgwWEhSamIyNXpkQ0J0WVhoWGFXUjBhQ0E5SUhSdmRHRnNWMmxrZEdnZ0xTQjBhR2x6TG05d2RHbHZibk11YldsdVYybGtkR2c3WEc1Y2JseDBYSFJwWmlBb2QybGtkR2hNWldaMElENGdiV0Y0VjJsa2RHZ3BJSHRjYmx4MFhIUmNkSGRwWkhSb1RHVm1kQ0E5SUcxaGVGZHBaSFJvTzF4dVhIUmNkSDFjYmx4dVhIUmNkR2xtSUNoM2FXUjBhRkpwWjJoMElENGdiV0Y0VjJsa2RHZ3BJSHRjYmx4MFhIUmNkSGRwWkhSb1VtbG5hSFFnUFNCdFlYaFhhV1IwYUR0Y2JseDBYSFI5WEc1Y2JseDBYSFJwWmloc1pXWjBRMjlzZFcxdUtTQjdYRzVjZEZ4MFhIUXZMeUIwYUdsekxuTmxkRmRwWkhSb0tHeGxablJEYjJ4MWJXNHNJSGRwWkhSb1RHVm1kQ2s3WEc1Y2RGeDBYSFJ2Y0M0a2JHVm1kRU52YkhWdGJpNTNhV1IwYUNoM2FXUjBhRXhsWm5RcE8xeHVYSFJjZEgxY2JseDBYSFJwWmloeWFXZG9kRU52YkhWdGJpa2dlMXh1WEhSY2RGeDBMeThnZEdocGN5NXpaWFJYYVdSMGFDaHlhV2RvZEVOdmJIVnRiaXdnZDJsa2RHaFNhV2RvZENrN1hHNWNkRngwWEhSdmNDNGtjbWxuYUhSRGIyeDFiVzR1ZDJsa2RHZ29kMmxrZEdoU2FXZG9kQ2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBiM0F1Ym1WM1YybGtkR2h6TG14bFpuUWdQU0IzYVdSMGFFeGxablE3WEc1Y2RGeDBiM0F1Ym1WM1YybGtkR2h6TG5KcFoyaDBJRDBnZDJsa2RHaFNhV2RvZER0Y2JseHVYSFJjZEhKbGRIVnliaUIwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tVc0lGdGNibHgwWEhSY2RHOXdMaVJzWldaMFEyOXNkVzF1TENCdmNDNGtjbWxuYUhSRGIyeDFiVzRzWEc1Y2RGeDBYSFIzYVdSMGFFeGxablFzSUhkcFpIUm9VbWxuYUhSY2JseDBYSFJkTEZ4dVhIUmNkR1YyWlc1MEtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlFiMmx1ZEdWeUwyMXZkWE5sSUhKbGJHVmhjMlVnYUdGdVpHeGxjbHh1WEc1Y2RFQnRaWFJvYjJRZ2IyNVFiMmx1ZEdWeVZYQmNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkQ29xTDF4dVhIUnZibEJ2YVc1MFpYSlZjQ2hsZG1WdWRDa2dlMXh1WEhSY2RHeGxkQ0J2Y0NBOUlIUm9hWE11YjNCbGNtRjBhVzl1TzF4dVhIUmNkR2xtS0NGMGFHbHpMbTl3WlhKaGRHbHZiaWtnZXlCeVpYUjFjbTQ3SUgxY2JseHVYSFJjZEhSb2FYTXVkVzVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKRzkzYm1WeVJHOWpkVzFsYm5Rc0lGc25iVzkxYzJWMWNDY3NJQ2QwYjNWamFHVnVaQ2NzSUNkdGIzVnpaVzF2ZG1VbkxDQW5kRzkxWTJodGIzWmxKMTBwTzF4dVhHNWNkRngwZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhHNWNkRngwWEhRdVlXUmtLSFJvYVhNdUpIUmhZbXhsS1Z4dVhIUmNkRngwTG5KbGJXOTJaVU5zWVhOektFTk1RVk5UWDFSQlFreEZYMUpGVTBsYVNVNUhLVHRjYmx4dVhIUmNkRzl3TGlSc1pXWjBRMjlzZFcxdVhHNWNkRngwWEhRdVlXUmtLRzl3TGlSeWFXZG9kRU52YkhWdGJpbGNibHgwWEhSY2RDNWhaR1FvYjNBdUpHTjFjbkpsYm5SSGNtbHdLVnh1WEhSY2RGeDBMbkpsYlc5MlpVTnNZWE56S0VOTVFWTlRYME5QVEZWTlRsOVNSVk5KV2tsT1J5azdYRzVjYmx4MFhIUjBhR2x6TG5ONWJtTklZVzVrYkdWWGFXUjBhSE1vS1R0Y2JseDBYSFIwYUdsekxuTmhkbVZEYjJ4MWJXNVhhV1IwYUhNb0tUdGNibHh1WEhSY2RIUm9hWE11YjNCbGNtRjBhVzl1SUQwZ2JuVnNiRHRjYmx4dVhIUmNkSEpsZEhWeWJpQjBhR2x6TG5SeWFXZG5aWEpGZG1WdWRDaEZWa1ZPVkY5U1JWTkpXa1ZmVTFSUFVDd2dXMXh1WEhSY2RGeDBiM0F1Skd4bFpuUkRiMngxYlc0c0lHOXdMaVJ5YVdkb2RFTnZiSFZ0Yml4Y2JseDBYSFJjZEc5d0xtNWxkMWRwWkhSb2N5NXNaV1owTENCdmNDNXVaWGRYYVdSMGFITXVjbWxuYUhSY2JseDBYSFJkTEZ4dVhIUmNkR1YyWlc1MEtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlNaVzF2ZG1WeklHRnNiQ0JsZG1WdWRDQnNhWE4wWlc1bGNuTXNJR1JoZEdFc0lHRnVaQ0JoWkdSbFpDQkVUMDBnWld4bGJXVnVkSE11SUZSaGEyVnpYRzVjZEhSb1pTQThkR0ZpYkdVdlBpQmxiR1Z0Wlc1MElHSmhZMnNnZEc4Z2FHOTNJR2wwSUhkaGN5d2dZVzVrSUhKbGRIVnlibk1nYVhSY2JseHVYSFJBYldWMGFHOWtJR1JsYzNSeWIzbGNibHgwUUhKbGRIVnliaUI3YWxGMVpYSjVmU0JQY21sbmFXNWhiQ0JxVVhWbGNua3RkM0poY0hCbFpDQThkR0ZpYkdVK0lHVnNaVzFsYm5SY2JseDBLaW92WEc1Y2RHUmxjM1J5YjNrb0tTQjdYRzVjZEZ4MGJHVjBJQ1IwWVdKc1pTQTlJSFJvYVhNdUpIUmhZbXhsTzF4dVhIUmNkR3hsZENBa2FHRnVaR3hsY3lBOUlIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaTVtYVc1a0tDY3VKeXREVEVGVFUxOUlRVTVFVEVVcE8xeHVYRzVjZEZ4MGRHaHBjeTUxYm1KcGJtUkZkbVZ1ZEhNb1hHNWNkRngwWEhSMGFHbHpMaVIzYVc1a2IzZGNibHgwWEhSY2RGeDBMbUZrWkNoMGFHbHpMaVJ2ZDI1bGNrUnZZM1Z0Wlc1MEtWeHVYSFJjZEZ4MFhIUXVZV1JrS0hSb2FYTXVKSFJoWW14bEtWeHVYSFJjZEZ4MFhIUXVZV1JrS0NSb1lXNWtiR1Z6S1Z4dVhIUmNkQ2s3WEc1Y2JseDBYSFFrYUdGdVpHeGxjeTV5WlcxdmRtVkVZWFJoS0VSQlZFRmZWRWdwTzF4dVhIUmNkQ1IwWVdKc1pTNXlaVzF2ZG1WRVlYUmhLRVJCVkVGZlFWQkpLVHRjYmx4dVhIUmNkSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2k1eVpXMXZkbVVvS1R0Y2JseDBYSFIwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJZ1BTQnVkV3hzTzF4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeUE5SUc1MWJHdzdYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVWdQU0J1ZFd4c08xeHVYRzVjZEZ4MGNtVjBkWEp1SUNSMFlXSnNaVHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJDYVc1a2N5Qm5hWFpsYmlCbGRtVnVkSE1nWm05eUlIUm9hWE1nYVc1emRHRnVZMlVnZEc4Z2RHaGxJR2RwZG1WdUlIUmhjbWRsZENCRVQwMUZiR1Z0Wlc1MFhHNWNibHgwUUhCeWFYWmhkR1ZjYmx4MFFHMWxkR2h2WkNCaWFXNWtSWFpsYm5SelhHNWNkRUJ3WVhKaGJTQjBZWEpuWlhRZ2UycFJkV1Z5ZVgwZ2FsRjFaWEo1TFhkeVlYQndaV1FnUkU5TlJXeGxiV1Z1ZENCMGJ5QmlhVzVrSUdWMlpXNTBjeUIwYjF4dVhIUkFjR0Z5WVcwZ1pYWmxiblJ6SUh0VGRISnBibWQ4UVhKeVlYbDlJRVYyWlc1MElHNWhiV1VnS0c5eUlHRnljbUY1SUc5bUtTQjBieUJpYVc1a1hHNWNkRUJ3WVhKaGJTQnpaV3hsWTNSdmNrOXlRMkZzYkdKaFkyc2dlMU4wY21sdVozeEdkVzVqZEdsdmJuMGdVMlZzWldOMGIzSWdjM1J5YVc1bklHOXlJR05oYkd4aVlXTnJYRzVjZEVCd1lYSmhiU0JiWTJGc2JHSmhZMnRkSUh0R2RXNWpkR2x2Ym4wZ1EyRnNiR0poWTJzZ2JXVjBhRzlrWEc1Y2RDb3FMMXh1WEhSaWFXNWtSWFpsYm5SektDUjBZWEpuWlhRc0lHVjJaVzUwY3l3Z2MyVnNaV04wYjNKUGNrTmhiR3hpWVdOckxDQmpZV3hzWW1GamF5a2dlMXh1WEhSY2RHbG1LSFI1Y0dWdlppQmxkbVZ1ZEhNZ1BUMDlJQ2R6ZEhKcGJtY25LU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITWdLeUIwYUdsekxtNXpPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJR1YyWlc1MGN5NXFiMmx1S0hSb2FYTXVibk1nS3lBbklDY3BJQ3NnZEdocGN5NXVjenRjYmx4MFhIUjlYRzVjYmx4MFhIUnBaaWhoY21kMWJXVnVkSE11YkdWdVozUm9JRDRnTXlrZ2UxeHVYSFJjZEZ4MEpIUmhjbWRsZEM1dmJpaGxkbVZ1ZEhNc0lITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5d2dZMkZzYkdKaFkyc3BPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkQ1IwWVhKblpYUXViMjRvWlhabGJuUnpMQ0J6Wld4bFkzUnZjazl5UTJGc2JHSmhZMnNwTzF4dVhIUmNkSDFjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJWYm1KcGJtUnpJR1YyWlc1MGN5QnpjR1ZqYVdacFl5QjBieUIwYUdseklHbHVjM1JoYm1ObElHWnliMjBnZEdobElHZHBkbVZ1SUhSaGNtZGxkQ0JFVDAxRmJHVnRaVzUwWEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0IxYm1KcGJtUkZkbVZ1ZEhOY2JseDBRSEJoY21GdElIUmhjbWRsZENCN2FsRjFaWEo1ZlNCcVVYVmxjbmt0ZDNKaGNIQmxaQ0JFVDAxRmJHVnRaVzUwSUhSdklIVnVZbWx1WkNCbGRtVnVkSE1nWm5KdmJWeHVYSFJBY0dGeVlXMGdaWFpsYm5SeklIdFRkSEpwYm1kOFFYSnlZWGw5SUVWMlpXNTBJRzVoYldVZ0tHOXlJR0Z5Y21GNUlHOW1LU0IwYnlCMWJtSnBibVJjYmx4MEtpb3ZYRzVjZEhWdVltbHVaRVYyWlc1MGN5Z2tkR0Z5WjJWMExDQmxkbVZ1ZEhNcElIdGNibHgwWEhScFppaDBlWEJsYjJZZ1pYWmxiblJ6SUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1WEhSY2RGeDBaWFpsYm5SeklEMGdaWFpsYm5SeklDc2dkR2hwY3k1dWN6dGNibHgwWEhSOVhHNWNkRngwWld4elpTQnBaaWhsZG1WdWRITWdJVDBnYm5Wc2JDa2dlMXh1WEhSY2RGeDBaWFpsYm5SeklEMGdaWFpsYm5SekxtcHZhVzRvZEdocGN5NXVjeUFySUNjZ0p5a2dLeUIwYUdsekxtNXpPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJSFJvYVhNdWJuTTdYRzVjZEZ4MGZWeHVYRzVjZEZ4MEpIUmhjbWRsZEM1dlptWW9aWFpsYm5SektUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlVjbWxuWjJWeWN5QmhiaUJsZG1WdWRDQnZiaUIwYUdVZ1BIUmhZbXhsTHo0Z1pXeGxiV1Z1ZENCbWIzSWdZU0JuYVhabGJpQjBlWEJsSUhkcGRHZ2daMmwyWlc1Y2JseDBZWEpuZFcxbGJuUnpMQ0JoYkhOdklITmxkSFJwYm1jZ1lXNWtJR0ZzYkc5M2FXNW5JR0ZqWTJWemN5QjBieUIwYUdVZ2IzSnBaMmx1WVd4RmRtVnVkQ0JwWmx4dVhIUm5hWFpsYmk0Z1VtVjBkWEp1Y3lCMGFHVWdjbVZ6ZFd4MElHOW1JSFJvWlNCMGNtbG5aMlZ5WldRZ1pYWmxiblF1WEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0IwY21sbloyVnlSWFpsYm5SY2JseDBRSEJoY21GdElIUjVjR1VnZTFOMGNtbHVaMzBnUlhabGJuUWdibUZ0WlZ4dVhIUkFjR0Z5WVcwZ1lYSm5jeUI3UVhKeVlYbDlJRUZ5Y21GNUlHOW1JR0Z5WjNWdFpXNTBjeUIwYnlCd1lYTnpJSFJvY205MVoyaGNibHgwUUhCaGNtRnRJRnR2Y21sbmFXNWhiRVYyWlc1MFhTQkpaaUJuYVhabGJpd2dhWE1nYzJWMElHOXVJSFJvWlNCbGRtVnVkQ0J2WW1wbFkzUmNibHgwUUhKbGRIVnliaUI3VFdsNFpXUjlJRkpsYzNWc2RDQnZaaUIwYUdVZ1pYWmxiblFnZEhKcFoyZGxjaUJoWTNScGIyNWNibHgwS2lvdlhHNWNkSFJ5YVdkblpYSkZkbVZ1ZENoMGVYQmxMQ0JoY21kekxDQnZjbWxuYVc1aGJFVjJaVzUwS1NCN1hHNWNkRngwYkdWMElHVjJaVzUwSUQwZ0pDNUZkbVZ1ZENoMGVYQmxLVHRjYmx4MFhIUnBaaWhsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwS1NCN1hHNWNkRngwWEhSbGRtVnVkQzV2Y21sbmFXNWhiRVYyWlc1MElEMGdKQzVsZUhSbGJtUW9lMzBzSUc5eWFXZHBibUZzUlhabGJuUXBPMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCMGFHbHpMaVIwWVdKc1pTNTBjbWxuWjJWeUtHVjJaVzUwTENCYmRHaHBjMTB1WTI5dVkyRjBLR0Z5WjNNZ2ZId2dXMTBwS1R0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSRFlXeGpkV3hoZEdWeklHRWdkVzVwY1hWbElHTnZiSFZ0YmlCSlJDQm1iM0lnWVNCbmFYWmxiaUJqYjJ4MWJXNGdSRTlOUld4bGJXVnVkRnh1WEc1Y2RFQndjbWwyWVhSbFhHNWNkRUJ0WlhSb2IyUWdaMlZ1WlhKaGRHVkRiMngxYlc1SlpGeHVYSFJBY0dGeVlXMGdKR1ZzSUh0cVVYVmxjbmw5SUdwUmRXVnllUzEzY21Gd2NHVmtJR052YkhWdGJpQmxiR1Z0Wlc1MFhHNWNkRUJ5WlhSMWNtNGdlMU4wY21sdVozMGdRMjlzZFcxdUlFbEVYRzVjZENvcUwxeHVYSFJuWlc1bGNtRjBaVU52YkhWdGJrbGtLQ1JsYkNrZ2UxeHVYSFJjZEhKbGRIVnliaUIwYUdsekxpUjBZV0pzWlM1a1lYUmhLRVJCVkVGZlEwOU1WVTFPVTE5SlJDa2dLeUFuTFNjZ0t5QWtaV3d1WkdGMFlTaEVRVlJCWDBOUFRGVk5UbDlKUkNrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFVHRnljMlZ6SUdFZ1oybDJaVzRnUkU5TlJXeGxiV1Z1ZENkeklIZHBaSFJvSUdsdWRHOGdZU0JtYkc5aGRGeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ2NHRnljMlZYYVdSMGFGeHVYSFJBY0dGeVlXMGdaV3hsYldWdWRDQjdSRTlOUld4bGJXVnVkSDBnUld4bGJXVnVkQ0IwYnlCblpYUWdkMmxrZEdnZ2IyWmNibHgwUUhKbGRIVnliaUI3VG5WdFltVnlmU0JGYkdWdFpXNTBKM01nZDJsa2RHZ2dZWE1nWVNCbWJHOWhkRnh1WEhRcUtpOWNibHgwY0dGeWMyVlhhV1IwYUNobGJHVnRaVzUwS1NCN1hHNWNkRngwY21WMGRYSnVJR1ZzWlcxbGJuUWdQeUJ3WVhKelpVWnNiMkYwS0dWc1pXMWxiblF1YzNSNWJHVXVkMmxrZEdndWNtVndiR0ZqWlNnbkpTY3NJQ2NuS1NrZ09pQXdPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRk5sZEhNZ2RHaGxJSEJsY21ObGJuUmhaMlVnZDJsa2RHZ2diMllnWVNCbmFYWmxiaUJFVDAxRmJHVnRaVzUwWEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0J6WlhSWGFXUjBhRnh1WEhSQWNHRnlZVzBnWld4bGJXVnVkQ0I3UkU5TlJXeGxiV1Z1ZEgwZ1JXeGxiV1Z1ZENCMGJ5QnpaWFFnZDJsa2RHZ2diMjVjYmx4MFFIQmhjbUZ0SUhkcFpIUm9JSHRPZFcxaVpYSjlJRmRwWkhSb0xDQmhjeUJoSUhCbGNtTmxiblJoWjJVc0lIUnZJSE5sZEZ4dVhIUXFLaTljYmx4MGMyVjBWMmxrZEdnb1pXeGxiV1Z1ZEN3Z2QybGtkR2dwSUh0Y2JseDBYSFF2THlCM2FXUjBhQ0E5SUhkcFpIUm9MblJ2Um1sNFpXUW9NaWs3WEc1Y2RGeDBkMmxrZEdnZ1BTQjNhV1IwYUNBK0lEQWdQeUIzYVdSMGFDQTZJREE3WEc1Y2RGeDBaV3hsYldWdWRDNXpkSGxzWlM1M2FXUjBhQ0E5SUhkcFpIUm9JQ3NnSnlVbk8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RFTnZibk4wY21GcGJuTWdZU0JuYVhabGJpQjNhV1IwYUNCMGJ5QjBhR1VnYldsdWFXMTFiU0JoYm1RZ2JXRjRhVzExYlNCeVlXNW5aWE1nWkdWbWFXNWxaQ0JwYmx4dVhIUjBhR1VnWUcxcGJsZHBaSFJvWUNCaGJtUWdZRzFoZUZkcFpIUm9ZQ0JqYjI1bWFXZDFjbUYwYVc5dUlHOXdkR2x2Ym5Nc0lISmxjM0JsWTNScGRtVnNlUzVjYmx4dVhIUkFjSEpwZG1GMFpWeHVYSFJBYldWMGFHOWtJR052Ym5OMGNtRnBibGRwWkhSb1hHNWNkRUJ3WVhKaGJTQjNhV1IwYUNCN1RuVnRZbVZ5ZlNCWGFXUjBhQ0IwYnlCamIyNXpkSEpoYVc1Y2JseDBRSEpsZEhWeWJpQjdUblZ0WW1WeWZTQkRiMjV6ZEhKaGFXNWxaQ0IzYVdSMGFGeHVYSFFxS2k5Y2JseDBZMjl1YzNSeVlXbHVWMmxrZEdnb2QybGtkR2dwSUh0Y2JseDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbTFwYmxkcFpIUm9JQ0U5SUhWdVpHVm1hVzVsWkNrZ2UxeHVYSFJjZEZ4MGQybGtkR2dnUFNCTllYUm9MbTFoZUNoMGFHbHpMbTl3ZEdsdmJuTXViV2x1VjJsa2RHZ3NJSGRwWkhSb0tUdGNibHgwWEhSOVhHNWNibHgwWEhScFppQW9kR2hwY3k1dmNIUnBiMjV6TG0xaGVGZHBaSFJvSUNFOUlIVnVaR1ZtYVc1bFpDa2dlMXh1WEhSY2RGeDBkMmxrZEdnZ1BTQk5ZWFJvTG0xcGJpaDBhR2x6TG05d2RHbHZibk11YldGNFYybGtkR2dzSUhkcFpIUm9LVHRjYmx4MFhIUjlYRzVjYmx4MFhIUnlaWFIxY200Z2QybGtkR2c3WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwUjJsMlpXNGdZU0J3WVhKMGFXTjFiR0Z5SUVWMlpXNTBJRzlpYW1WamRDd2djbVYwY21sbGRtVnpJSFJvWlNCamRYSnlaVzUwSUhCdmFXNTBaWElnYjJabWMyVjBJR0ZzYjI1blhHNWNkSFJvWlNCb2IzSnBlbTl1ZEdGc0lHUnBjbVZqZEdsdmJpNGdRV05qYjNWdWRITWdabTl5SUdKdmRHZ2djbVZuZFd4aGNpQnRiM1Z6WlNCamJHbGphM01nWVhNZ2QyVnNiQ0JoYzF4dVhIUndiMmx1ZEdWeUxXeHBhMlVnYzNsemRHVnRjeUFvYlc5aWFXeGxjeXdnZEdGaWJHVjBjeUJsZEdNdUtWeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ1oyVjBVRzlwYm5SbGNsaGNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkRUJ5WlhSMWNtNGdlMDUxYldKbGNuMGdTRzl5YVhwdmJuUmhiQ0J3YjJsdWRHVnlJRzltWm5ObGRGeHVYSFFxS2k5Y2JseDBaMlYwVUc5cGJuUmxjbGdvWlhabGJuUXBJSHRjYmx4MFhIUnBaaUFvWlhabGJuUXVkSGx3WlM1cGJtUmxlRTltS0NkMGIzVmphQ2NwSUQwOVBTQXdLU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdLR1YyWlc1MExtOXlhV2RwYm1Gc1JYWmxiblF1ZEc5MVkyaGxjMXN3WFNCOGZDQmxkbVZ1ZEM1dmNtbG5hVzVoYkVWMlpXNTBMbU5vWVc1blpXUlViM1ZqYUdWeld6QmRLUzV3WVdkbFdEdGNibHgwWEhSOVhHNWNkRngwY21WMGRYSnVJR1YyWlc1MExuQmhaMlZZTzF4dVhIUjlYRzU5WEc1Y2JsSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NdVpHVm1ZWFZzZEhNZ1BTQjdYRzVjZEhObGJHVmpkRzl5T2lCbWRXNWpkR2x2Ymlna2RHRmliR1VwSUh0Y2JseDBYSFJwWmlna2RHRmliR1V1Wm1sdVpDZ25kR2hsWVdRbktTNXNaVzVuZEdncElIdGNibHgwWEhSY2RISmxkSFZ5YmlCVFJVeEZRMVJQVWw5VVNEdGNibHgwWEhSOVhHNWNibHgwWEhSeVpYUjFjbTRnVTBWTVJVTlVUMUpmVkVRN1hHNWNkSDBzWEc1Y2RITjBiM0psT2lCM2FXNWtiM2N1YzNSdmNtVXNYRzVjZEhONWJtTklZVzVrYkdWeWN6b2dkSEoxWlN4Y2JseDBjbVZ6YVhwbFJuSnZiVUp2WkhrNklIUnlkV1VzWEc1Y2RHMWhlRmRwWkhSb09pQnVkV3hzTEZ4dVhIUnRhVzVYYVdSMGFEb2dNQzR3TVZ4dWZUdGNibHh1VW1WemFYcGhZbXhsUTI5c2RXMXVjeTVqYjNWdWRDQTlJREE3WEc0aUxDSmxlSEJ2Y25RZ1kyOXVjM1FnUkVGVVFWOUJVRWtnUFNBbmNtVnphWHBoWW14bFEyOXNkVzF1Y3ljN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUkVGVVFWOURUMHhWVFU1VFgwbEVJRDBnSjNKbGMybDZZV0pzWlMxamIyeDFiVzV6TFdsa0p6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRVFWUkJYME5QVEZWTlRsOUpSQ0E5SUNkeVpYTnBlbUZpYkdVdFkyOXNkVzF1TFdsa0p6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRVFWUkJYMVJJSUQwZ0ozUm9KenRjYmx4dVpYaHdiM0owSUdOdmJuTjBJRU5NUVZOVFgxUkJRa3hGWDFKRlUwbGFTVTVISUQwZ0ozSmpMWFJoWW14bExYSmxjMmw2YVc1bkp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRFRFRlRVMTlEVDB4VlRVNWZVa1ZUU1ZwSlRrY2dQU0FuY21NdFkyOXNkVzF1TFhKbGMybDZhVzVuSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JEVEVGVFUxOUlRVTVFVEVVZ1BTQW5jbU10YUdGdVpHeGxKenRjYm1WNGNHOXlkQ0JqYjI1emRDQkRURUZUVTE5SVFVNUVURVZmUTA5T1ZFRkpUa1ZTSUQwZ0ozSmpMV2hoYm1Sc1pTMWpiMjUwWVdsdVpYSW5PMXh1WEc1bGVIQnZjblFnWTI5dWMzUWdSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVJRDBnSjJOdmJIVnRianB5WlhOcGVtVTZjM1JoY25Rbk8xeHVaWGh3YjNKMElHTnZibk4wSUVWV1JVNVVYMUpGVTBsYVJTQTlJQ2RqYjJ4MWJXNDZjbVZ6YVhwbEp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRlZrVk9WRjlTUlZOSldrVmZVMVJQVUNBOUlDZGpiMngxYlc0NmNtVnphWHBsT25OMGIzQW5PMXh1WEc1bGVIQnZjblFnWTI5dWMzUWdVMFZNUlVOVVQxSmZWRWdnUFNBbmRISTZabWx5YzNRZ1BpQjBhRHAyYVhOcFlteGxKenRjYm1WNGNHOXlkQ0JqYjI1emRDQlRSVXhGUTFSUFVsOVVSQ0E5SUNkMGNqcG1hWEp6ZENBK0lIUmtPblpwYzJsaWJHVW5PMXh1Wlhod2IzSjBJR052Ym5OMElGTkZURVZEVkU5U1gxVk9Va1ZUU1ZwQlFreEZJRDBnWUZ0a1lYUmhMVzV2Y21WemFYcGxYV0E3WEc0aUxDSnBiWEJ2Y25RZ1VtVnphWHBoWW14bFEyOXNkVzF1Y3lCbWNtOXRJQ2N1TDJOc1lYTnpKenRjYm1sdGNHOXlkQ0JoWkdGd2RHVnlJR1p5YjIwZ0p5NHZZV1JoY0hSbGNpYzdYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJRkpsYzJsNllXSnNaVU52YkhWdGJuTTdJbDE5In0=
