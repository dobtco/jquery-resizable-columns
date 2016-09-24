/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat Sep 24 2016 18:11:32 GMT+0300 (GTB Summer Time)
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
 generates handles for them. Also assigns widths.
 
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

			// Assign widths first, then create drag handles
			if (this.options.absoluteWidths) {
				this.assignAbsoluteWidths();
			} else {
				this.assignPercentageWidths();
			}
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

				if (_this.options.absoluteWidths) {
					if ($current.is(_constants.SELECTOR_UNRESIZABLE)) {
						return;
					}
				} else {
					if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
						return;
					}
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a absolute width to all columns based on their current width(s)
  
  @private
  @method assignAbsoluteWidths
  **/
	}, {
		key: 'assignAbsoluteWidths',
		value: function assignAbsoluteWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				// do not assign width if the column is not resizable
				if (el.hasAttribute(_constants.ATTRIBUTE_UNRESIZABLE)) return;

				var $el = $(el),
				    tableWidth = _this2.$table.width(),
				    paddingLeft = ResizableColumns.parsePixelString($el.css('paddingLeft')),
				    paddingRight = ResizableColumns.parsePixelString($el.css('paddingRight')),
				    width = $el.outerWidth() - paddingLeft - paddingRight;

				$el.data(_constants.DATA_CSS_MIN_WIDTH, 0);
				$el.data(_constants.DATA_CSS_MAX_WIDTH, tableWidth);

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
  Parse the value of a string by removing 'px'
  
  @private
  @method parsePixelString
  @param value {String}
  @return {Number} Parsed value or 0
  **/
	}, {
		key: 'assignPercentageWidths',

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  
  @private
  @method assignPercentageWidths
  **/
		value: function assignPercentageWidths() {
			var _this3 = this;

			this.$tableHeaders.each(function (_, el) {
				// do not assign width if the column is not resizable
				if (el.hasAttribute(_constants.ATTRIBUTE_UNRESIZABLE)) return;

				var $el = $(el),
				    width = $el.outerWidth() / _this3.$table.width() * 100;

				$el.data(_constants.DATA_CSS_MIN_WIDTH, 0);
				$el.data(_constants.DATA_CSS_MAX_WIDTH, 100);

				var minWidth = _this3.computeMinCssWidths($el);
				if (minWidth != null) {
					$el.data(_constants.DATA_CSS_MIN_WIDTH, minWidth);
					width = Math.max(minWidth, width);
				}

				var maxWidth = _this3.computeMaxCssWidths($el);
				if (maxWidth != null) {
					$el.data(_constants.DATA_CSS_MAX_WIDTH, maxWidth);
					width = Math.min(maxWidth, width);
				}

				_this3.setWidth($el[0], width);
			});
		}

		/**
  Compute the minimum width taking into account CSS
  
  @private
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
					minWidth = parseFloat(el.style.minWidth);
					if (!this.options.absoluteWidths) {
						minWidth = minWidth / this.$table.width() * 100;
					}
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
  
  @private
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
					maxWidth = parseFloat(el.style.maxWidth);
					if (!this.options.absoluteWidths) {
						maxWidth = maxWidth / this.$table.width() * 100;
					}
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
			if (this.options.absoluteWidths) {
				this.syncHandleWidthsAbsolute();
			} else {
				this.syncHandleWidthsPercentage();
			}
		}

		/**
  
  
  @private
  @method syncHandleWidthsAbsolute
  **/
	}, {
		key: 'syncHandleWidthsAbsolute',
		value: function syncHandleWidthsAbsolute() {
			var _this4 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width()).css('minWidth', this.totalColumnWidthsAbsolute());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this4.options.resizeFromBody ? _this4.$table.height() : _this4.$table.find('thead').height();

				var $th = _this4.$tableHeaders.filter(':not(' + _constants.SELECTOR_UNRESIZABLE + ')').eq(_);

				var left = $th.outerWidth();
				left -= ResizableColumns.parsePixelString($el.css('paddingLeft'));
				left -= ResizableColumns.parsePixelString($el.css('paddingRight'));
				left += $th.offset().left;
				left -= _this4.$handleContainer.offset().left;

				$el.css({ left: left, height: height });
			});
		}

		/**
  
  
  @private
  @method syncHandleWidthsPercentage
  **/
	}, {
		key: 'syncHandleWidthsPercentage',
		value: function syncHandleWidthsPercentage() {
			var _this5 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this5.options.resizeFromBody ? _this5.$table.height() : _this5.$table.find('thead').height();

				var $th = _this5.$tableHeaders.filter(':not(' + _constants.SELECTOR_UNRESIZABLE + ')').eq(_);

				var left = $th.outerWidth() + ($th.offset().left - _this5.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  
  
  @method totalColumnWidths
  **/
	}, {
		key: 'totalColumnWidths',
		value: function totalColumnWidths() {
			return this.options.absoluteWidths ? this.totalColumnWidthsAbsolute() : this.totalColumnWidthsPercentage();
		}

		/**
  
  
  @private
  @method totalColumnWidthsAbsolute
  **/
	}, {
		key: 'totalColumnWidthsAbsolute',
		value: function totalColumnWidthsAbsolute() {
			var total = 0;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				total += ResizableColumns.parsePixelString($el.width());
				total += ResizableColumns.parsePixelString($el.css('paddingLeft'));
				total += ResizableColumns.parsePixelString($el.css('paddingRight'));
			});

			return total;
		}

		/**
  
  
  @private
  @method totalColumnWidthsPercentage
  **/
	}, {
		key: 'totalColumnWidthsPercentage',
		value: function totalColumnWidthsPercentage() {
			var _this6 = this;

			//should be 100% :D
			var total = 0;

			this.$tableHeaders.each(function (_, el) {
				total += _this6.parseWidth(el);
			});

			return total;
		}

		/**
  Persists the column widths in localStorage
  
  @method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this7 = this;

			if (!this.options.store) return;

			this.options.store.set(this.generateTableAbsoluteWidthsId(), this.options.absoluteWidths + '');

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this7.options.store.set(_this7.generateColumnId($el), _this7.parseWidth(el));
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
			var _this8 = this;

			if (!this.options.store) return;

			if (this.options.store.get(this.generateTableAbsoluteWidthsId()) !== this.options.absoluteWidths + '') return;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this8.options.store.get(_this8.generateColumnId($el));

					if (width != null) {
						_this8.setWidth(el, width);
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
			var difference = this.getPointerX(event) - op.startX;
			if (!this.options.absoluteWidths) {
				difference = difference / this.$table.width() * 100;
			}

			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined;

			if (this.options.absoluteWidths) {
				//TODO Need to investigate this
				if (difference > 0) {
					widthLeft = this.constrainWidth($(leftColumn), op.widths.left + (op.widths.right - op.newWidths.right));
					widthRight = this.constrainWidth($(rightColumn), op.widths.right - difference);
				} else if (difference < 0) {
					//_this.setWidth($leftColumn[0], _this.constrainWidth(widths.left + difference));
					//_this.setWidth($leftColumn[0], newWidths.left = $leftColumn.outerWidth());
					widthLeft = this.constrainWidth($(leftColumn), op.widths.left + difference);
					widthRight = this.constrainWidth($(rightColumn), op.widths.right + (op.widths.left - op.newWidths.left));
				}
			} else {
				if (difference > 0) {
					widthLeft = this.constrainWidth($(leftColumn), op.widths.left + (op.widths.right - op.newWidths.right));
					widthRight = this.constrainWidth($(rightColumn), op.widths.right - difference);
				} else if (difference < 0) {
					widthLeft = this.constrainWidth($(leftColumn), op.widths.left + difference);
					widthRight = this.constrainWidth($(rightColumn), op.widths.right + (op.widths.left - op.newWidths.left));
				}
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
			return this.generateTableId() + '-' + $el.data(_constants.DATA_COLUMN_ID).replace(/\./g, '_');
		}

		/**
  Calculates a unique ID for a table's (DOMElement) 'absoluteWidths' option
  
  @private
  @method generateTableAbsoluteWidthsId
  @return {String} ID
  **/
	}, {
		key: 'generateTableAbsoluteWidthsId',
		value: function generateTableAbsoluteWidthsId() {
			return this.$table.data(_constants.DATA_COLUMNS_ID).replace(/\./g, '_') + '--absolute-widths';
		}

		/**
  Calculates a unique ID for a given table DOMElement
  
  @private
  @method generateTableId
  @return {String} Table ID
  **/
	}, {
		key: 'generateTableId',
		value: function generateTableId() {
			return this.$table.data(_constants.DATA_COLUMNS_ID).replace(/\./g, '_');
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
			return element ? parseFloat(element.style.width.replace(this.options.absoluteWidths ? 'px' : '%', '')) : 0;
		}

		/**
  Sets the width of a given DOMElement
  
  @private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + (this.options.absoluteWidths ? 'px' : '%');
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
			width = Math.min(this.options.absoluteWidths ? this.$table.width() : 100, width);

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
	}], [{
		key: 'parsePixelString',
		value: function parsePixelString(value) {
			var valueType = typeof value;

			if (valueType === 'string') {
				var v = value.replace('px', ''),
				    n = parseFloat(v);
				if (!isNaN(n)) {
					return n;
				}
			} else if (valueType === 'number') {
				return value;
			}

			return 0;
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
	obeyCssMaxWidth: false,
	absoluteWidths: false
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0RqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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STtBQUNwQixTQUFRLEVBQUUsSUFBSTtBQUNkLFNBQVEsRUFBRSxJQUFJO0FBQ2QsZ0JBQWUsRUFBRSxLQUFLO0FBQ3JCLGdCQUFlLEVBQUUsS0FBSztBQUN2QixlQUFjLEVBQUUsS0FBSztDQUNyQixDQUFDOztBQUVGLGdCQUFnQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Ozs7Ozs7OztBQzl5QnBCLElBQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDOztBQUNwQyxJQUFNLGVBQWUsR0FBRyxzQkFBc0IsQ0FBQzs7QUFDL0MsSUFBTSxjQUFjLEdBQUcscUJBQXFCLENBQUM7O0FBQzdDLElBQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDOztBQUN6QyxJQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQzs7O0FBRXpDLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7O0FBQ2pELElBQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7O0FBQ25ELElBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQzs7QUFDakMsSUFBTSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQzs7O0FBRXJELElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7O0FBQ2pELElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQzs7QUFDckMsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxvQkFBb0Isb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ25CeEIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xyXG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcclxuXHJcblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xyXG5cdFx0aWYgKCFhcGkpIHtcclxuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xyXG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xyXG4iLCJpbXBvcnQge1xyXG5cdERBVEFfQVBJLFxyXG5cdERBVEFfQ09MVU1OU19JRCxcclxuXHREQVRBX0NPTFVNTl9JRCxcclxuXHREQVRBX0NTU19NSU5fV0lEVEgsXHJcblx0REFUQV9DU1NfTUFYX1dJRFRILFxyXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxyXG5cdENMQVNTX0NPTFVNTl9SRVNJWklORyxcclxuXHRDTEFTU19IQU5ETEUsXHJcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcclxuXHRFVkVOVF9SRVNJWkVfU1RBUlQsXHJcblx0RVZFTlRfUkVTSVpFLFxyXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxyXG5cdFNFTEVDVE9SX1RILFxyXG5cdFNFTEVDVE9SX1RELFxyXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFLFxyXG5cdEFUVFJJQlVURV9VTlJFU0laQUJMRVxyXG59XHJcbmZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG5UYWtlcyBhIDx0YWJsZSAvPiBlbGVtZW50IGFuZCBtYWtlcyBpdCdzIGNvbHVtbnMgcmVzaXphYmxlIGFjcm9zcyBib3RoXHJcbm1vYmlsZSBhbmQgZGVza3RvcCBjbGllbnRzLlxyXG5cclxuQGNsYXNzIFJlc2l6YWJsZUNvbHVtbnNcclxuQHBhcmFtICR0YWJsZSB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnQgdG8gbWFrZSByZXNpemFibGVcclxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcclxuKiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZUNvbHVtbnMge1xyXG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xyXG5cdFx0dGhpcy5ucyA9ICcucmMnICsgdGhpcy5jb3VudCsrO1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XHJcblx0XHR0aGlzLiR0YWJsZSA9ICR0YWJsZTtcclxuXHJcblx0XHR0aGlzLnJlZnJlc2hIZWFkZXJzKCk7XHJcblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5XaWR0aHMoKTtcclxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLnN5bmNIYW5kbGVXaWR0aHMuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdGFydCkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVEFSVCwgdGhpcy5vcHRpb25zLnN0YXJ0KTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVzaXplKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFLCB0aGlzLm9wdGlvbnMucmVzaXplKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcCkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVE9QLCB0aGlzLm9wdGlvbnMuc3RvcCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZWZyZXNoZXMgdGhlIGhlYWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2VzIDx0YWJsZS8+IGVsZW1lbnQgYW5kXHJcblx0Z2VuZXJhdGVzIGhhbmRsZXMgZm9yIHRoZW0uIEFsc28gYXNzaWducyB3aWR0aHMuXHJcblxyXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcclxuXHQqKi9cclxuXHRyZWZyZXNoSGVhZGVycygpIHtcclxuXHRcdC8vIEFsbG93IHRoZSBzZWxlY3RvciB0byBiZSBib3RoIGEgcmVndWxhciBzZWxjdG9yIHN0cmluZyBhcyB3ZWxsIGFzXHJcblx0XHQvLyBhIGR5bmFtaWMgY2FsbGJhY2tcclxuXHRcdGxldCBzZWxlY3RvciA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcclxuXHRcdGlmKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gdGhpcy4kdGFibGUuZmluZChzZWxlY3Rvcik7XHJcblxyXG5cdFx0Ly8gQXNzaWduIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRoaXMuYXNzaWduQWJzb2x1dGVXaWR0aHMoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuYXNzaWduUGVyY2VudGFnZVdpZHRocygpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXHJcblxyXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xyXG5cdCoqL1xyXG5cdGNyZWF0ZUhhbmRsZXMoKSB7XHJcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xyXG5cdFx0aWYgKHJlZiAhPSBudWxsKSB7XHJcblx0XHRcdHJlZi5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRV9DT05UQUlORVJ9JyAvPmApXHJcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaSwgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xyXG5cdFx0XHRsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyl7XHJcblx0XHRcdFx0aWYgKCRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSB8fCAkbmV4dC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCAkaGFuZGxlID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEV9JyAvPmApXHJcblx0XHRcdFx0LmFwcGVuZFRvKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kaGFuZGxlQ29udGFpbmVyLCBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sICcuJytDTEFTU19IQU5ETEUsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEFzc2lnbnMgYSBhYnNvbHV0ZSB3aWR0aCB0byBhbGwgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHdpZHRoKHMpXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBhc3NpZ25BYnNvbHV0ZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnbkFic29sdXRlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdC8vIGRvIG5vdCBhc3NpZ24gd2lkdGggaWYgdGhlIGNvbHVtbiBpcyBub3QgcmVzaXphYmxlXHJcblx0XHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoQVRUUklCVVRFX1VOUkVTSVpBQkxFKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgJGVsID0gJChlbCksXHJcblx0XHRcdFx0dGFibGVXaWR0aCA9IHRoaXMuJHRhYmxlLndpZHRoKCksXHJcblx0XHRcdFx0cGFkZGluZ0xlZnQgPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSksXHJcblx0XHRcdFx0cGFkZGluZ1JpZ2h0ID0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHQpO1xyXG5cdFx0XHRcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCAwKTtcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCB0YWJsZVdpZHRoKTtcclxuXHJcblx0XHRcdGxldCBtaW5XaWR0aCA9IHRoaXMuY29tcHV0ZU1pbkNzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWluV2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCwgbWluV2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5tYXgobWluV2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGxldCBtYXhXaWR0aCA9IHRoaXMuY29tcHV0ZU1heENzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWF4V2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCwgbWF4V2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5taW4obWF4V2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsWzBdLCB3aWR0aCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHRQYXJzZSB0aGUgdmFsdWUgb2YgYSBzdHJpbmcgYnkgcmVtb3ZpbmcgJ3B4J1xyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcGFyc2VQaXhlbFN0cmluZ1xyXG5cdEBwYXJhbSB2YWx1ZSB7U3RyaW5nfVxyXG5cdEByZXR1cm4ge051bWJlcn0gUGFyc2VkIHZhbHVlIG9yIDBcclxuXHQqKi9cclxuXHRzdGF0aWMgcGFyc2VQaXhlbFN0cmluZyh2YWx1ZSkge1xyXG5cdFx0bGV0IHZhbHVlVHlwZSA9IHR5cGVvZiB2YWx1ZTtcclxuXHRcdFxyXG5cdFx0aWYgKHZhbHVlVHlwZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0bGV0IHYgPSB2YWx1ZS5yZXBsYWNlKCdweCcsICcnKSxcclxuXHRcdFx0XHRuID0gcGFyc2VGbG9hdCh2KTtcclxuXHRcdFx0aWYgKCFpc05hTihuKSkge1xyXG5cdFx0XHRcdHJldHVybiBuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdudW1iZXInKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEFzc2lnbnMgYSBwZXJjZW50YWdlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgcGl4ZWwgd2lkdGgocylcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcclxuXHQqKi9cclxuXHRhc3NpZ25QZXJjZW50YWdlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdC8vIGRvIG5vdCBhc3NpZ24gd2lkdGggaWYgdGhlIGNvbHVtbiBpcyBub3QgcmVzaXphYmxlXHJcblx0XHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoQVRUUklCVVRFX1VOUkVTSVpBQkxFKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgJGVsID0gJChlbCksXHJcblx0XHRcdFx0d2lkdGggPSAoJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkpICogMTAwO1xyXG5cdFx0XHRcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCAwKTtcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCAxMDApO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aCB0YWtpbmcgaW50byBhY2NvdW50IENTU1xyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29tcHV0ZU1pbkNzc1dpZHRoc1xyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCBmb3Igd2hpY2ggd2UgY29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKSB7XHJcblx0XHRsZXQgZWwsIG1pbldpZHRoO1xyXG5cdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0ZWwgPSAkZWxbMF07XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHRpZiAoZWwuc3R5bGUubWluV2lkdGguc2xpY2UoLTIpID09PSAncHgnKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKTtcclxuXHRcdFx0XHRpZiAoIXRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRcdFx0bWluV2lkdGggPSAobWluV2lkdGggLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNOYU4obWluV2lkdGgpKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWluV2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb21wdXRlTWF4Q3NzV2lkdGhzXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IGZvciB3aGljaCB3ZSBjb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoXHJcblx0KiovXHJcblx0Y29tcHV0ZU1heENzc1dpZHRocygkZWwpIHtcclxuXHRcdGxldCBlbCwgbWF4V2lkdGg7XHJcblx0XHRtYXhXaWR0aCA9IG51bGw7XHJcblx0XHRlbCA9ICRlbFswXTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMub2JleUNzc01heFdpZHRoKSB7XHJcblx0XHRcdGlmIChlbC5zdHlsZS5tYXhXaWR0aC5zbGljZSgtMikgPT09ICdweCcpIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWF4V2lkdGgpO1xyXG5cdFx0XHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0XHRtYXhXaWR0aCA9IChtYXhXaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWF4V2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc05hTihtYXhXaWR0aCkpIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBtYXhXaWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzXHJcblx0KiovXHJcblx0c3luY0hhbmRsZVdpZHRocygpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGUoKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc0Fic29sdXRlXHJcblx0KiovXHJcblx0c3luY0hhbmRsZVdpZHRoc0Fic29sdXRlKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpLmNzcygnbWluV2lkdGgnLCB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKSk7XHJcblxyXG5cdFx0JGNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHkgP1xyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xyXG5cclxuXHRcdFx0bGV0ICR0aCA9IHRoaXMuJHRhYmxlSGVhZGVycy5maWx0ZXIoYDpub3QoJHtTRUxFQ1RPUl9VTlJFU0laQUJMRX0pYCkuZXEoXyk7XHJcblxyXG5cdFx0XHRsZXQgbGVmdCA9ICR0aC5vdXRlcldpZHRoKClcclxuXHRcdFx0bGVmdCAtPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSk7XHJcblx0XHRcdGxlZnQgLT0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKTtcclxuXHRcdFx0bGVmdCArPSAkdGgub2Zmc2V0KCkubGVmdDtcclxuXHRcdFx0bGVmdCAtPSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdFxyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1BlcmNlbnRhZ2VcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZSgpIHtcclxuXHRcdGxldCAkY29udGFpbmVyID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblxyXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcclxuXHJcblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XHJcblxyXG5cdFx0XHRsZXQgJHRoID0gdGhpcy4kdGFibGVIZWFkZXJzLmZpbHRlcihgOm5vdCgke1NFTEVDVE9SX1VOUkVTSVpBQkxFfSlgKS5lcShfKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJHRoLm91dGVyV2lkdGgoKSArICgkdGgub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KTtcclxuXHJcblx0XHRcdCRlbC5jc3MoeyBsZWZ0LCBoZWlnaHQgfSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRoc1xyXG5cdFx0XHQ/IHRoaXMudG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpXHJcblx0XHRcdDogdGhpcy50b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGVcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKCkge1xyXG5cdFx0bGV0IHRvdGFsID0gMDtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cdFx0XHR0b3RhbCArPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLndpZHRoKCkpO1xyXG5cdFx0XHR0b3RhbCArPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nUmlnaHQnKSk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRvdGFsO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNQZXJjZW50YWdlXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHNQZXJjZW50YWdlKCkge1xyXG5cdFx0Ly9zaG91bGQgYmUgMTAwJSA6RFxyXG5cdFx0bGV0IHRvdGFsID0gMDtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0dG90YWwgKz0gdGhpcy5wYXJzZVdpZHRoKGVsKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdG90YWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQZXJzaXN0cyB0aGUgY29sdW1uIHdpZHRocyBpbiBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCBzYXZlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0c2F2ZUNvbHVtbldpZHRocygpIHtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnN0b3JlKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldCh0aGlzLmdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCksIHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyArICcnKTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYgKCEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldChcclxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxyXG5cdFx0XHRcdFx0dGhpcy5wYXJzZVdpZHRoKGVsKVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2QgcmVzdG9yZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5zdG9yZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KHRoaXMuZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSkgIT09ICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgKyAnJykpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYoISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KFxyXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbClcclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRpZih3aWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKGVsLCB3aWR0aCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyRG93blxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlckRvd24oZXZlbnQpIHtcclxuXHRcdC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXHJcblx0XHRpZihldmVudC53aGljaCAhPT0gMSkgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cclxuXHRcdC8vIFByb2JhYmx5IGdvYmJsZWQgdXAgYnkgdXNlciBtb3VzaW5nIG91dCB0aGUgd2luZG93IHRoZW4gcmVsZWFzaW5nLlxyXG5cdFx0Ly8gV2UnbGwgc2ltdWxhdGUgYSBwb2ludGVydXAgaGVyZSBwcmlvciB0byBpdFxyXG5cdFx0aWYodGhpcy5vcGVyYXRpb24pIHtcclxuXHRcdFx0dGhpcy5vblBvaW50ZXJVcChldmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWdub3JlIG5vbi1yZXNpemFibGUgY29sdW1uc1xyXG5cdFx0bGV0ICRjdXJyZW50R3JpcCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XHJcblx0XHRpZigkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgZ3JpcEluZGV4ID0gJGN1cnJlbnRHcmlwLmluZGV4KCk7XHJcblx0XHRsZXQgJGxlZnRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4KS5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xyXG5cdFx0bGV0ICRyaWdodENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXggKyAxKS5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xyXG5cclxuXHRcdGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJGxlZnRDb2x1bW5bMF0pO1xyXG5cdFx0bGV0IHJpZ2h0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJHJpZ2h0Q29sdW1uWzBdKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IHtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbiwgJGN1cnJlbnRHcmlwLFxyXG5cclxuXHRcdFx0c3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcclxuXHJcblx0XHRcdHdpZHRoczoge1xyXG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcclxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRuZXdXaWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10sIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0LmFkZENsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcclxuXHJcblx0XHQkbGVmdENvbHVtblxyXG5cdFx0XHQuYWRkKCRyaWdodENvbHVtbilcclxuXHRcdFx0LmFkZCgkY3VycmVudEdyaXApXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xyXG5cclxuXHRcdHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVEFSVCwgW1xyXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHRsZWZ0V2lkdGgsIHJpZ2h0V2lkdGhcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgbW92ZW1lbnQgaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlck1vdmVcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XHJcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcclxuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIGNoYW5nZSBiZXR3ZWVuIHN0YXJ0IGFuZCBuZXcgbW91c2UgcG9zaXRpb24sIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdGFibGUgd2lkdGhcclxuXHRcdGxldCBkaWZmZXJlbmNlID0gdGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFg7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRkaWZmZXJlbmNlID0gKGRpZmZlcmVuY2UpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcclxuXHRcdH1cclxuXHJcblx0XHRpZihkaWZmZXJlbmNlID09PSAwKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uWzBdO1xyXG5cdFx0bGV0IHJpZ2h0Q29sdW1uID0gb3AuJHJpZ2h0Q29sdW1uWzBdO1xyXG5cdFx0bGV0IHdpZHRoTGVmdCwgd2lkdGhSaWdodDtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdC8vVE9ETyBOZWVkIHRvIGludmVzdGlnYXRlIHRoaXNcclxuXHRcdFx0aWYoZGlmZmVyZW5jZSA+IDApIHtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQobGVmdENvbHVtbiksIG9wLndpZHRocy5sZWZ0ICsgKG9wLndpZHRocy5yaWdodCAtIG9wLm5ld1dpZHRocy5yaWdodCkpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmKGRpZmZlcmVuY2UgPCAwKSB7XHJcblx0XHRcdFx0Ly9fdGhpcy5zZXRXaWR0aCgkbGVmdENvbHVtblswXSwgX3RoaXMuY29uc3RyYWluV2lkdGgod2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKSk7XHJcblx0XHRcdFx0Ly9fdGhpcy5zZXRXaWR0aCgkbGVmdENvbHVtblswXSwgbmV3V2lkdGhzLmxlZnQgPSAkbGVmdENvbHVtbi5vdXRlcldpZHRoKCkpO1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChsZWZ0Q29sdW1uKSwgb3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKHJpZ2h0Q29sdW1uKSwgb3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYoZGlmZmVyZW5jZSA+IDApIHtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQobGVmdENvbHVtbiksIG9wLndpZHRocy5sZWZ0ICsgKG9wLndpZHRocy5yaWdodCAtIG9wLm5ld1dpZHRocy5yaWdodCkpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmKGRpZmZlcmVuY2UgPCAwKSB7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYobGVmdENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XHJcblx0XHR9XHJcblx0XHRpZihyaWdodENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKHJpZ2h0Q29sdW1uLCB3aWR0aFJpZ2h0KTtcclxuXHRcdH1cclxuXHJcblx0XHRvcC5uZXdXaWR0aHMubGVmdCA9IHdpZHRoTGVmdDtcclxuXHRcdG9wLm5ld1dpZHRocy5yaWdodCA9IHdpZHRoUmlnaHQ7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRSwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHR3aWR0aExlZnQsIHdpZHRoUmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlclVwXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyVXAoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdG9wLiRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXHJcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxyXG5cclxuXHRAbWV0aG9kIGRlc3Ryb3lcclxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxyXG5cdCoqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XHJcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcclxuXHRcdFx0dGhpcy4kd2luZG93XHJcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxyXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcclxuXHRcdCk7XHJcblxyXG5cdFx0JHRhYmxlLnJlbW92ZURhdGEoREFUQV9BUEkpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGUgPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiAkdGFibGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBiaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIGJpbmQgZXZlbnRzIHRvXHJcblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxyXG5cdEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXHJcblx0QHBhcmFtIFtjYWxsYmFja10ge0Z1bmN0aW9ufSBDYWxsYmFjayBtZXRob2RcclxuXHQqKi9cclxuXHRiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xyXG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcclxuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdW5iaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIHVuYmluZFxyXG5cdCoqL1xyXG5cdHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKGV2ZW50cyAhPSBudWxsKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdCR0YXJnZXQub2ZmKGV2ZW50cyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRUcmlnZ2VycyBhbiBldmVudCBvbiB0aGUgPHRhYmxlLz4gZWxlbWVudCBmb3IgYSBnaXZlbiB0eXBlIHdpdGggZ2l2ZW5cclxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXHJcblx0Z2l2ZW4uIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgdHJpZ2dlcmVkIGV2ZW50LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdHJpZ2dlckV2ZW50XHJcblx0QHBhcmFtIHR5cGUge1N0cmluZ30gRXZlbnQgbmFtZVxyXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxyXG5cdEBwYXJhbSBbb3JpZ2luYWxFdmVudF0gSWYgZ2l2ZW4sIGlzIHNldCBvbiB0aGUgZXZlbnQgb2JqZWN0XHJcblx0QHJldHVybiB7TWl4ZWR9IFJlc3VsdCBvZiB0aGUgZXZlbnQgdHJpZ2dlciBhY3Rpb25cclxuXHQqKi9cclxuXHR0cmlnZ2VyRXZlbnQodHlwZSwgYXJncywgb3JpZ2luYWxFdmVudCkge1xyXG5cdFx0bGV0IGV2ZW50ID0gJC5FdmVudCh0eXBlKTtcclxuXHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudCA9ICQuZXh0ZW5kKHt9LCBvcmlnaW5hbEV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUudHJpZ2dlcihldmVudCwgW3RoaXNdLmNvbmNhdChhcmdzIHx8IFtdKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgY29sdW1uIGVsZW1lbnRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IENvbHVtbiBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlQ29sdW1uSWQoJGVsKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVRhYmxlSWQoKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgSUQgZm9yIGEgdGFibGUncyAoRE9NRWxlbWVudCkgJ2Fic29sdXRlV2lkdGhzJyBvcHRpb25cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkXHJcblx0QHJldHVybiB7U3RyaW5nfSBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKSArICctLWFic29sdXRlLXdpZHRocyc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIElEIGZvciBhIGdpdmVuIHRhYmxlIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVJZFxyXG5cdEByZXR1cm4ge1N0cmluZ30gVGFibGUgSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZVRhYmxlSWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpLnJlcGxhY2UoL1xcLi9nLCAnXycpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxyXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIGdldCB3aWR0aCBvZlxyXG5cdEByZXR1cm4ge051bWJlcn0gRWxlbWVudCdzIHdpZHRoIGFzIGEgZmxvYXRcclxuXHQqKi9cclxuXHRwYXJzZVdpZHRoKGVsZW1lbnQpIHtcclxuXHRcdHJldHVybiBlbGVtZW50ID8gcGFyc2VGbG9hdChlbGVtZW50LnN0eWxlLndpZHRoLnJlcGxhY2UoKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpLCAnJykpIDogMDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFNldHMgdGhlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc2V0V2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gc2V0XHJcblx0KiovXHJcblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcclxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcclxuXHRcdHdpZHRoID0gd2lkdGggPiAwID8gd2lkdGggOiAwO1xyXG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXHJcblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudFxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXHJcblx0KiovXHJcblx0Y29uc3RyYWluV2lkdGgoJGVsLCB3aWR0aCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5taW5XaWR0aCAhPSB1bmRlZmluZWQgfHwgdGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGgsICRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWF4V2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHR3aWR0aCA9IE1hdGgubWF4KDAsIHdpZHRoKTtcclxuIFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/IHRoaXMuJHRhYmxlLndpZHRoKCkgOiAxMDAsIHdpZHRoKTtcclxuXHJcblx0XHRyZXR1cm4gd2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcclxuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcclxuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcclxuXHQqKi9cclxuXHRnZXRQb2ludGVyWChldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcclxuXHR9XHJcbn1cclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XHJcblx0c2VsZWN0b3I6IGZ1bmN0aW9uKCR0YWJsZSkge1xyXG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XHJcblx0fSxcclxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxyXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcclxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcclxuXHRtYXhXaWR0aDogbnVsbCxcclxuXHRtaW5XaWR0aDogMC4wMSxcclxuXHRvYmV5Q3NzTWluV2lkdGg6IGZhbHNlLFxyXG4gXHRvYmV5Q3NzTWF4V2lkdGg6IGZhbHNlLFxyXG5cdGFic29sdXRlV2lkdGhzOiBmYWxzZVxyXG59O1xyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XHJcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OU19JRCA9ICdyZXNpemFibGUtY29sdW1ucy1pZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ1NTX01JTl9XSURUSCA9ICdjc3NNaW5XaWR0aCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NQVhfV0lEVEggPSAnY3NzTWF4V2lkdGgnO1xyXG5cclxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0NPTFVNTl9SRVNJWklORyA9ICdyYy1jb2x1bW4tcmVzaXppbmcnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFID0gJ3JjLWhhbmRsZSc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVEFSVCA9ICdjb2x1bW46cmVzaXplOnN0YXJ0JztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVE9QID0gJ2NvbHVtbjpyZXNpemU6c3RvcCc7XHJcblxyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1REID0gJ3RyOmZpcnN0ID4gdGQ6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9VTlJFU0laQUJMRSA9IGBbZGF0YS1ub3Jlc2l6ZV1gO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9VTlJFU0laQUJMRSA9ICdkYXRhLW5vcmVzaXplJztcclxuIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZXNpemFibGVDb2x1bW5zOyJdfQ==
