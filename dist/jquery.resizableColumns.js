/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat May 16 2015 16:57:58 GMT+0100 (BST)
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
			this.$tableHeaders = this.$table.find(this.options.selector);
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
	selector: _constants.HEADER_SELECTOR,
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
var HEADER_SELECTOR = 'tr th:visible';
exports.HEADER_SELECTOR = HEADER_SELECTOR;

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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLFlBTmYsUUFBUSxDQU1pQixDQUFDO0FBQ2hDLE1BQUksQ0FBQyxHQUFHLEVBQUU7QUFDVCxNQUFHLEdBQUcsdUJBQXFCLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNwRCxTQUFNLENBQUMsSUFBSSxZQVROLFFBQVEsRUFTUyxHQUFHLENBQUMsQ0FBQztHQUMzQixNQUVJLElBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFO0FBQzdDLFVBQU8sR0FBRyxDQUFDLGVBQWUsT0FBQyxDQUFwQixHQUFHLEVBQXFCLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0pqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJ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QWMsR0FBRyxxQkFBcUIsQ0FBQztRQUF2QyxjQUFjLEdBQWQsY0FBYztBQUNwQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7O1FBQWYsT0FBTyxHQUFQLE9BQU87QUFFYixJQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDO1FBQTNDLG9CQUFvQixHQUFwQixvQkFBb0I7QUFDMUIsSUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQztRQUE3QyxxQkFBcUIsR0FBckIscUJBQXFCO0FBQzNCLElBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUEzQixZQUFZLEdBQVosWUFBWTtBQUNsQixJQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDOztRQUEvQyxzQkFBc0IsR0FBdEIsc0JBQXNCO0FBRTVCLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7UUFBM0Msa0JBQWtCLEdBQWxCLGtCQUFrQjtBQUN4QixJQUFNLFlBQVksR0FBRyxlQUFlLENBQUM7UUFBL0IsWUFBWSxHQUFaLFlBQVk7QUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7UUFBekMsaUJBQWlCLEdBQWpCLGlCQUFpQjtBQUV2QixJQUFNLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFBbEMsZUFBZSxHQUFmLGVBQWU7Ozs7Ozs7Ozs7O3FCQ2ZDLFNBQVM7Ozs7dUJBQ2xCLFdBQVciLCJmaWxlIjoianF1ZXJ5LnJlc2l6YWJsZUNvbHVtbnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xuaW1wb3J0IHtEQVRBX0FQSX0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4kLmZuLnJlc2l6YWJsZUNvbHVtbnMgPSBmdW5jdGlvbihvcHRpb25zT3JNZXRob2QsIC4uLmFyZ3MpIHtcblx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcblxuXHRcdGxldCBhcGkgPSAkdGFibGUuZGF0YShEQVRBX0FQSSk7XG5cdFx0aWYgKCFhcGkpIHtcblx0XHRcdGFwaSA9IG5ldyBSZXNpemFibGVDb2x1bW5zKCR0YWJsZSwgb3B0aW9uc09yTWV0aG9kKTtcblx0XHRcdCR0YWJsZS5kYXRhKERBVEFfQVBJLCBhcGkpO1xuXHRcdH1cblxuXHRcdGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zT3JNZXRob2QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbiQucmVzaXphYmxlQ29sdW1ucyA9IFJlc2l6YWJsZUNvbHVtbnM7XG4iLCJpbXBvcnQge1xuXHREQVRBX0FQSSxcblx0REFUQV9OT19SRVNJWkUsXG5cdERBVEFfQ09MVU1OU19JRCxcblx0REFUQV9DT0xVTU5fSUQsXG5cdERBVEFfVEgsXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXG5cdENMQVNTX0hBTkRMRSxcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcblx0RVZFTlRfUkVTSVpFX1NUQVJULFxuXHRFVkVOVF9SRVNJWkUsXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxuXHRIRUFERVJfU0VMRUNUT1Jcbn1cbmZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG5UYWtlcyBhIDx0YWJsZSAvPiBlbGVtZW50IGFuZCBtYWtlcyBpdCdzIGNvbHVtbnMgcmVzaXphYmxlIGFjcm9zcyBib3RoXG5tb2JpbGUgYW5kIGRlc2t0b3AgY2xpZW50cy5cblxuQGNsYXNzIFJlc2l6YWJsZUNvbHVtbnNcbkBwYXJhbSAkdGFibGUge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50IHRvIG1ha2UgcmVzaXphYmxlXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxuKiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGVDb2x1bW5zIHtcblx0Y29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XG5cdFx0dGhpcy5ucyA9ICcucmMnICsgdGhpcy5jb3VudCsrO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy4kd2luZG93ID0gJCh3aW5kb3cpO1xuXHRcdHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZVswXS5vd25lckRvY3VtZW50KTtcblx0XHR0aGlzLiR0YWJsZSA9ICR0YWJsZTtcblxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5XaWR0aHMoKTtcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLnN5bmNIYW5kbGVXaWR0aHMuYmluZCh0aGlzKSk7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVEFSVCwgdGhpcy5vcHRpb25zLnN0YXJ0KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFLCB0aGlzLm9wdGlvbnMucmVzaXplKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVE9QLCB0aGlzLm9wdGlvbnMuc3RvcCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcblx0Z2VuZXJhdGVzIGhhbmRsZXMgZm9yIHRoZW0uIEFsc28gYXNzaWducyBwZXJjZW50YWdlIHdpZHRocy5cblxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXG5cdCoqL1xuXHRyZWZyZXNoSGVhZGVycygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHRoaXMub3B0aW9ucy5zZWxlY3Rvcik7XG5cdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XG5cdH1cblxuXHQvKipcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xuXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xuXHQqKi9cblx0Y3JlYXRlSGFuZGxlcygpIHtcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xuXHRcdFx0cmVmLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcblxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcblxuXHRcdFx0aWYgKCRuZXh0Lmxlbmd0aCA9PT0gMCB8fCAkY3VycmVudC5kYXRhKERBVEFfTk9fUkVTSVpFKSB8fCAkbmV4dC5kYXRhKERBVEFfTk9fUkVTSVpFKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCAkaGFuZGxlID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEV9JyAvPmApXG5cdFx0XHRcdC5kYXRhKERBVEFfVEgsICQoZWwpKVxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xuXHR9XG5cblx0LyoqXG5cdEFzc2lnbnMgYSBwZXJjZW50YWdlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgcGl4ZWwgd2lkdGgocylcblxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcblx0KiovXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbFswXSwgJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cblxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcblx0KiovXG5cdHN5bmNIYW5kbGVXaWR0aHMoKSB7XG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcblxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSk7XG5cblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcblxuXHRcdFx0bGV0IGxlZnQgPSAkZWwuZGF0YShEQVRBX1RIKS5vdXRlcldpZHRoKCkgKyAoXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfVEgpLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdFxuXHRcdFx0KTtcblxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRQZXJzaXN0cyB0aGUgY29sdW1uIHdpZHRocyBpbiBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHNhdmVDb2x1bW5XaWR0aHNcblx0KiovXG5cdHNhdmVDb2x1bW5XaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcmUgJiYgJGVsLmRhdGEoREFUQV9OT19SRVNJWkUpID09IG51bGwpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldChcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKSxcblx0XHRcdFx0XHR0aGlzLnBhcnNlV2lkdGgoZWwpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXG5cblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXG5cdCoqL1xuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRpZih0aGlzLm9wdGlvbnMuc3RvcmUgJiYgJGVsLmRhdGEoREFUQV9OT19SRVNJWkUpID09IG51bGwpIHtcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcblx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKGVsLCB3aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIGRvd24gaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyRG93blxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlckRvd24oZXZlbnQpIHtcblx0XHQvLyBPbmx5IGFwcGxpZXMgdG8gbGVmdC1jbGljayBkcmFnZ2luZ1xuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gSWYgYSBwcmV2aW91cyBvcGVyYXRpb24gaXMgZGVmaW5lZCwgd2UgbWlzc2VkIHRoZSBsYXN0IG1vdXNldXAuXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXG5cdFx0Ly8gV2UnbGwgc2ltdWxhdGUgYSBwb2ludGVydXAgaGVyZSBwcmlvciB0byBpdFxuXHRcdGlmKHRoaXMub3BlcmF0aW9uKSB7XG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcblx0XHR9XG5cblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRsZXQgJGxlZnRDb2x1bW4gPSAkY3VycmVudEdyaXAuZGF0YShEQVRBX1RIKTtcblx0XHRsZXQgJHJpZ2h0Q29sdW1uID0gIHRoaXMuJHRhYmxlSGVhZGVycy5lcSh0aGlzLiR0YWJsZUhlYWRlcnMuaW5kZXgoJGxlZnRDb2x1bW4pICsgMSk7XG5cblx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcblx0XHRsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW5bMF0pO1xuXG5cdFx0dGhpcy5vcGVyYXRpb24gPSB7XG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLCAkY3VycmVudEdyaXAsXG5cblx0XHRcdHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXG5cblx0XHRcdHdpZHRoczoge1xuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXG5cdFx0XHR9LFxuXHRcdFx0bmV3V2lkdGhzOiB7XG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxuXHRcdFx0LmFkZENsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuXHRcdCRsZWZ0Q29sdW1uXG5cdFx0XHQuYWRkKCRyaWdodENvbHVtbilcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxuXHRcdFx0LmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXG5cdFx0XHRsZWZ0V2lkdGgsIHJpZ2h0V2lkdGhcblx0XHRdLFxuXHRcdGV2ZW50KTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJNb3ZlXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyTW92ZShldmVudCkge1xuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuXHRcdGxldCBkaWZmZXJlbmNlID0gKHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpIC0gb3Auc3RhcnRYKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XG5cdFx0bGV0IHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcblx0XHRsZXQgd2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0IC0gZGlmZmVyZW5jZSk7XG5cblx0XHR0aGlzLnNldFdpZHRoKG9wLiRsZWZ0Q29sdW1uWzBdLCB3aWR0aExlZnQpO1xuXHRcdHRoaXMuc2V0V2lkdGgob3AuJHJpZ2h0Q29sdW1uWzBdLCB3aWR0aFJpZ2h0KTtcblxuXHRcdG9wLm5ld1dpZHRocy5sZWZ0ID0gd2lkdGhMZWZ0O1xuXHRcdG9wLm5ld1dpZHRocy5yaWdodCA9IHdpZHRoUmlnaHQ7XG5cblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFLCBbXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxuXHRcdFx0d2lkdGhMZWZ0LCB3aWR0aFJpZ2h0XG5cdFx0XSxcblx0XHRldmVudCk7XG5cdH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSByZWxlYXNlIGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlclVwXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyVXAoZXZlbnQpIHtcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XG5cblx0XHR0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XG5cblx0XHRvcC4kbGVmdENvbHVtblxuXHRcdFx0LmFkZChvcC4kcmlnaHRDb2x1bW4pXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xuXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XG5cdFx0dGhpcy5zYXZlQ29sdW1uV2lkdGhzKCk7XG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XG5cblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUT1AsIFtcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXG5cdFx0XHRvcC5uZXdXaWR0aHMubGVmdCwgb3AubmV3V2lkdGhzLnJpZ2h0XG5cdFx0XSxcblx0XHRldmVudCk7XG5cdH1cblxuXHQvKipcblx0UmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLCBkYXRhLCBhbmQgYWRkZWQgRE9NIGVsZW1lbnRzLiBUYWtlc1xuXHR0aGUgPHRhYmxlLz4gZWxlbWVudCBiYWNrIHRvIGhvdyBpdCB3YXMsIGFuZCByZXR1cm5zIGl0XG5cblx0QG1ldGhvZCBkZXN0cm95XG5cdEByZXR1cm4ge2pRdWVyeX0gT3JpZ2luYWwgalF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50XG5cdCoqL1xuXHRkZXN0cm95KCkge1xuXHRcdGxldCAkdGFibGUgPSB0aGlzLiR0YWJsZTtcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcblxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKFxuXHRcdFx0dGhpcy4kd2luZG93XG5cdFx0XHRcdC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcblx0XHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcblx0XHQpO1xuXG5cdFx0JGhhbmRsZXMucmVtb3ZlRGF0YShEQVRBX1RIKTtcblx0XHQkdGFibGUucmVtb3ZlRGF0YShEQVRBX0FQSSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gbnVsbDtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcblxuXHRcdHJldHVybiAkdGFibGU7XG5cdH1cblxuXHQvKipcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgYmluZEV2ZW50c1xuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xuXHRAcGFyYW0gW2NhbGxiYWNrXSB7RnVuY3Rpb259IENhbGxiYWNrIG1ldGhvZFxuXHQqKi9cblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XG5cdFx0fVxuXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0VW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgdW5iaW5kRXZlbnRzXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gdW5iaW5kXG5cdCoqL1xuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2UgaWYoZXZlbnRzICE9IG51bGwpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRldmVudHMgPSB0aGlzLm5zO1xuXHRcdH1cblxuXHRcdCR0YXJnZXQub2ZmKGV2ZW50cyk7XG5cdH1cblxuXHQvKipcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXG5cdGFyZ3VtZW50cywgYWxzbyBzZXR0aW5nIGFuZCBhbGxvd2luZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsRXZlbnQgaWZcblx0Z2l2ZW4uIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgdHJpZ2dlcmVkIGV2ZW50LlxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgdHJpZ2dlckV2ZW50XG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcblx0QHBhcmFtIGFyZ3Mge0FycmF5fSBBcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyB0aHJvdWdoXG5cdEBwYXJhbSBbb3JpZ2luYWxFdmVudF0gSWYgZ2l2ZW4sIGlzIHNldCBvbiB0aGUgZXZlbnQgb2JqZWN0XG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXG5cdCoqL1xuXHR0cmlnZ2VyRXZlbnQodHlwZSwgYXJncywgb3JpZ2luYWxFdmVudCkge1xuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XG5cdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuXHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudCA9ICQuZXh0ZW5kKHt9LCBvcmlnaW5hbEV2ZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy4kdGFibGUudHJpZ2dlcihldmVudCwgW3RoaXNdLmNvbmNhdChhcmdzIHx8IFtdKSk7XG5cdH1cblxuXHQvKipcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBjb2x1bW4gZWxlbWVudFxuXHRAcmV0dXJuIHtTdHJpbmd9IENvbHVtbiBJRFxuXHQqKi9cblx0Z2VuZXJhdGVDb2x1bW5JZCgkZWwpIHtcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpICsgJy0nICsgJGVsLmRhdGEoREFUQV9DT0xVTU5fSUQpO1xuXHR9XG5cblx0LyoqXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gZ2V0IHdpZHRoIG9mXG5cdEByZXR1cm4ge051bWJlcn0gRWxlbWVudCdzIHdpZHRoIGFzIGEgZmxvYXRcblx0KiovXG5cdHBhcnNlV2lkdGgoZWxlbWVudCkge1xuXHRcdHJldHVybiBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgnJScsICcnKSk7XG5cdH1cblxuXHQvKipcblx0U2V0cyB0aGUgcGVyY2VudGFnZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHNldFdpZHRoXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIHNldCB3aWR0aCBvblxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGgsIGFzIGEgcGVyY2VudGFnZSwgdG8gc2V0XG5cdCoqL1xuXHRzZXRXaWR0aChlbGVtZW50LCB3aWR0aCkge1xuXHRcdCF3aWR0aCAmJiBjb25zb2xlLnRyYWNlKClcblx0XHR3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XG5cdFx0d2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xuXHR9XG5cblx0LyoqXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxuXHR0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGNvbnN0cmFpbldpZHRoXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxuXHQqKi9cblx0Y29uc3RyYWluV2lkdGgod2lkdGgpIHtcblx0XHRpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IG51bGwpIHtcblx0XHRcdHdpZHRoID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbldpZHRoLCB3aWR0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAhPSBudWxsKSB7XG5cdFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5tYXhXaWR0aCwgd2lkdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aDtcblx0fVxuXG5cdC8qKlxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcblx0dGhlIGhvcml6b250YWwgZGlyZWN0aW9uLiBBY2NvdW50cyBmb3IgYm90aCByZWd1bGFyIG1vdXNlIGNsaWNrcyBhcyB3ZWxsIGFzXG5cdHBvaW50ZXItbGlrZSBzeXN0ZW1zIChtb2JpbGVzLCB0YWJsZXRzIGV0Yy4pXG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBnZXRQb2ludGVyWFxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0QHJldHVybiB7TnVtYmVyfSBIb3Jpem9udGFsIHBvaW50ZXIgb2Zmc2V0XG5cdCoqL1xuXHRnZXRQb2ludGVyWChldmVudCkge1xuXHRcdGlmIChldmVudC50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcblx0XHRcdHJldHVybiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pLnBhZ2VYO1xuXHRcdH1cblx0XHRyZXR1cm4gZXZlbnQucGFnZVg7XG5cdH1cbn1cblxuUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cyA9IHtcblx0c2VsZWN0b3I6IEhFQURFUl9TRUxFQ1RPUixcblx0c3RvcmU6IHdpbmRvdy5zdG9yZSxcblx0c3luY0hhbmRsZXJzOiB0cnVlLFxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcblx0bWF4V2lkdGg6IG51bGwsXG5cdG1pbldpZHRoOiAwLjAxXG59O1xuXG5SZXNpemFibGVDb2x1bW5zLmNvdW50ID0gMDtcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcbmV4cG9ydCBjb25zdCBEQVRBX05PX1JFU0laRSA9ICdub3Jlc2l6ZSc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX1RIID0gJ3RoJztcblxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xuXG5leHBvcnQgY29uc3QgSEVBREVSX1NFTEVDVE9SID0gJ3RyIHRoOnZpc2libGUnOyIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcblxuZXhwb3J0IGRlZmF1bHQgUmVzaXphYmxlQ29sdW1uczsiXX0=