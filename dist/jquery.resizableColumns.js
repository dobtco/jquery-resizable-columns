/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sun Sep 25 2016 00:13:34 GMT+0300 (GTB Summer Time)
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
		this.lastPointerDown = null;
		this.isDoubleClick = false;

		this.wrapTable();
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
 Wrap the table DOMElement in a div
 
 @private
 @method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'wrapTable',
		value: function wrapTable() {
			if (!this.options.wrappTable) {
				return;
			}

			this.$table.wrap('<div class="' + _constants.CLASS_TABLE_WRAPPER + '"></div>').width(this.$table.innerWidth());
		}

		/**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns widths.
  
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
			if (this.options.absoluteWidths) {
				this.$handleContainer.addClass(_constants.CLASS_ABSOLUTE);
			}
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

			this.isDoubleClick = this.lastPointerDown != null && new Date() - this.lastPointerDown < this.options.doubleClickDelay;
			this.lastPointerDown = new Date();
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
  Pointer/mouse double click
  
  @method onDoubleClick
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onDoubleClick',
		value: function onDoubleClick(event) {
			var _this9 = this;

			if (!this.operation) return;

			var $currentGrip = this.operation.$currentGrip;
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var left = $leftColumn.get(0);
			if (!left) {
				return;
			}

			var $fakeEl = $('<span>').css({
				'position': 'absolute',
				'visibility': 'hidden',
				'left': '-99999px',
				'top': '-99999px'
			});
			$('body').append($fakeEl);
			var maxWidth = 0;
			this.$table.find('tr').each(function (iTr, tr) {
				var pos = 0;
				$(tr).find('td, th').each(function (iTd, td) {
					var $td = $(td);
					if (pos === gripIndex) {
						maxWidth = Math.max(maxWidth, _this9.getTextWidth($td, $fakeEl));
						return false;
					}
					pos += $td.prop('colspan') || 1;
				});
			});
			$fakeEl.remove();
			if (!this.options.absoluteWidths) {
				maxWidth = maxWidth / this.$table.width() * 100;
			}
			this.setWidth(left, maxWidth);
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

			if (this.isDoubleClick) {
				this.onDoubleClick(event);
			}

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

		/**
  Gets the text width of an element
  
  @private
  @method getTextWidth
  @param $el {jQuery} jQuery-wrapped DOMElement that contains the text
  @param $fakeEl {jQuery} jQuery-wrapped DOMElement that will be used to measure the width
  @return {Number} Text width
  **/
	}, {
		key: 'getTextWidth',
		value: function getTextWidth($el, $fakeEl) {
			return $fakeEl.css({
				'fontFamily': $el.css('fontFamily'),
				'fontSize': $el.css('fontSize'),
				'fontWeight': $el.css('fontWeight'),
				'paddingLeft': $el.css('paddingLeft'),
				'paddingRight': $el.css('paddingRight'),
				'border': $el.css('border')
			}).text($el.text()).outerWidth(true);
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
	absoluteWidths: false,
	doubleClickDelay: 500,
	wrappTable: false
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
var CLASS_ABSOLUTE = 'rc-absolute';
exports.CLASS_ABSOLUTE = CLASS_ABSOLUTE;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';
exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var CLASS_TABLE_WRAPPER = 'rc-table-wrapper';

exports.CLASS_TABLE_WRAPPER = CLASS_TABLE_WRAPPER;
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0NqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QXNCLENBQUM7O0FBQy9DLElBQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDOztBQUM3QyxJQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQzs7QUFDekMsSUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUM7OztBQUV6QyxJQUFNLGNBQWMsR0FBRyxhQUFhLENBQUM7O0FBQ3JDLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7O0FBQ2pELElBQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7O0FBQ25ELElBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQzs7QUFDakMsSUFBTSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDckQsSUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQzs7O0FBRS9DLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7O0FBQ2pELElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQzs7QUFDckMsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxvQkFBb0Isb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ3JCeEIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xyXG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcclxuXHJcblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xyXG5cdFx0aWYgKCFhcGkpIHtcclxuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xyXG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xyXG4iLCJpbXBvcnQge1xyXG5cdEFUVFJJQlVURV9VTlJFU0laQUJMRSxcclxuXHREQVRBX0FQSSxcclxuXHREQVRBX0NPTFVNTlNfSUQsXHJcblx0REFUQV9DT0xVTU5fSUQsXHJcblx0REFUQV9DU1NfTUlOX1dJRFRILFxyXG5cdERBVEFfQ1NTX01BWF9XSURUSCxcclxuXHRDTEFTU19BQlNPTFVURSxcclxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcclxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXHJcblx0Q0xBU1NfSEFORExFLFxyXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXHJcblx0Q0xBU1NfVEFCTEVfV1JBUFBFUixcclxuXHRFVkVOVF9SRVNJWkVfU1RBUlQsXHJcblx0RVZFTlRfUkVTSVpFLFxyXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxyXG5cdFNFTEVDVE9SX1RILFxyXG5cdFNFTEVDVE9SX1RELFxyXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFXHJcbn1cclxuZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcclxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXHJcblxyXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xyXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxyXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxyXG4qKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XHJcblx0Y29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHRcdHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZVswXS5vd25lckRvY3VtZW50KTtcclxuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xyXG5cdFx0dGhpcy5sYXN0UG9pbnRlckRvd24gPSBudWxsO1xyXG5cdFx0dGhpcy5pc0RvdWJsZUNsaWNrID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy53cmFwVGFibGUoKTtcclxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcclxuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFdyYXAgdGhlIHRhYmxlIERPTUVsZW1lbnQgaW4gYSBkaXZcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXHJcblx0KiovXHJcblx0d3JhcFRhYmxlKCkge1xyXG5cdFx0aWYoIXRoaXMub3B0aW9ucy53cmFwcFRhYmxlKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiR0YWJsZVxyXG5cdFx0XHQud3JhcChgPGRpdiBjbGFzcz1cIiR7Q0xBU1NfVEFCTEVfV1JBUFBFUn1cIj48L2Rpdj5gKVxyXG5cdFx0XHQud2lkdGgodGhpcy4kdGFibGUuaW5uZXJXaWR0aCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcclxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHdpZHRocy5cclxuXHJcblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xyXG5cdCoqL1xyXG5cdHJlZnJlc2hIZWFkZXJzKCkge1xyXG5cdFx0Ly8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcclxuXHRcdC8vIGEgZHluYW1pYyBjYWxsYmFja1xyXG5cdFx0bGV0IHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xyXG5cdFx0aWYodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IuY2FsbCh0aGlzLCB0aGlzLiR0YWJsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2VsZWN0IGFsbCB0YWJsZSBoZWFkZXJzXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcclxuXHJcblx0XHQvLyBBc3NpZ24gd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25BYnNvbHV0ZVdpZHRocygpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENyZWF0ZXMgZHVtbXkgaGFuZGxlIGVsZW1lbnRzIGZvciBhbGwgdGFibGUgaGVhZGVyIGNvbHVtbnNcclxuXHJcblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXHJcblx0KiovXHJcblx0Y3JlYXRlSGFuZGxlcygpIHtcclxuXHRcdGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XHJcblx0XHRpZiAocmVmICE9IG51bGwpIHtcclxuXHRcdFx0cmVmLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLmFkZENsYXNzKENMQVNTX0FCU09MVVRFKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XHJcblx0XHRcdGxldCAkbmV4dCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpICsgMSk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKXtcclxuXHRcdFx0XHRpZiAoJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICgkbmV4dC5sZW5ndGggPT09IDAgfHwgJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcclxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIGFic29sdXRlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgd2lkdGgocylcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGFzc2lnbkFic29sdXRlV2lkdGhzXHJcblx0KiovXHJcblx0YXNzaWduQWJzb2x1dGVXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR0YWJsZVdpZHRoID0gdGhpcy4kdGFibGUud2lkdGgoKSxcclxuXHRcdFx0XHRwYWRkaW5nTGVmdCA9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKSxcclxuXHRcdFx0XHRwYWRkaW5nUmlnaHQgPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpLFxyXG5cdFx0XHRcdHdpZHRoID0gKCRlbC5vdXRlcldpZHRoKCkgLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIHRhYmxlV2lkdGgpO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlIHRoZSB2YWx1ZSBvZiBhIHN0cmluZyBieSByZW1vdmluZyAncHgnXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBwYXJzZVBpeGVsU3RyaW5nXHJcblx0QHBhcmFtIHZhbHVlIHtTdHJpbmd9XHJcblx0QHJldHVybiB7TnVtYmVyfSBQYXJzZWQgdmFsdWUgb3IgMFxyXG5cdCoqL1xyXG5cdHN0YXRpYyBwYXJzZVBpeGVsU3RyaW5nKHZhbHVlKSB7XHJcblx0XHRsZXQgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cdFx0XHJcblx0XHRpZiAodmFsdWVUeXBlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRsZXQgdiA9IHZhbHVlLnJlcGxhY2UoJ3B4JywgJycpLFxyXG5cdFx0XHRcdG4gPSBwYXJzZUZsb2F0KHYpO1xyXG5cdFx0XHRpZiAoIWlzTmFOKG4pKSB7XHJcblx0XHRcdFx0cmV0dXJuIG47XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSkgKiAxMDA7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIDEwMCk7XHJcblxyXG5cdFx0XHRsZXQgbWluV2lkdGggPSB0aGlzLmNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1pbldpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIG1pbldpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWF4KG1pbldpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgbWF4V2lkdGggPSB0aGlzLmNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1heFdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIG1heFdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbFswXSwgd2lkdGgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb21wdXRlTWluQ3NzV2lkdGhzXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IGZvciB3aGljaCB3ZSBjb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoXHJcblx0KiovXHJcblx0Y29tcHV0ZU1pbkNzc1dpZHRocygkZWwpIHtcclxuXHRcdGxldCBlbCwgbWluV2lkdGg7XHJcblx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRlbCA9ICRlbFswXTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMub2JleUNzc01pbldpZHRoKSB7XHJcblx0XHRcdGlmIChlbC5zdHlsZS5taW5XaWR0aC5zbGljZSgtMikgPT09ICdweCcpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0XHRtaW5XaWR0aCA9IChtaW5XaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc05hTihtaW5XaWR0aCkpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBtaW5XaWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbXB1dGUgdGhlIG1heGltdW0gd2lkdGggdGFraW5nIGludG8gYWNjb3VudCBDU1NcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNvbXB1dGVNYXhDc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1heGltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtYXhXaWR0aDtcclxuXHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsWzBdO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1heFdpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0XHRcdG1heFdpZHRoID0gKG1heFdpZHRoIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1heFdpZHRoKSkge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1heFdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNBYnNvbHV0ZSgpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGVcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cclxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSkuY3NzKCdtaW5XaWR0aCcsIHRoaXMudG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpKTtcclxuXHJcblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XHJcblxyXG5cdFx0XHRsZXQgJHRoID0gdGhpcy4kdGFibGVIZWFkZXJzLmZpbHRlcihgOm5vdCgke1NFTEVDVE9SX1VOUkVTSVpBQkxFfSlgKS5lcShfKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJHRoLm91dGVyV2lkdGgoKVxyXG5cdFx0XHRsZWZ0IC09IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0bGVmdCAtPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpO1xyXG5cdFx0XHRsZWZ0ICs9ICR0aC5vZmZzZXQoKS5sZWZ0O1xyXG5cdFx0XHRsZWZ0IC09IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XHJcblxyXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZVxyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCAkdGggPSB0aGlzLiR0YWJsZUhlYWRlcnMuZmlsdGVyKGA6bm90KCR7U0VMRUNUT1JfVU5SRVNJWkFCTEV9KWApLmVxKF8pO1xyXG5cclxuXHRcdFx0bGV0IGxlZnQgPSAkdGgub3V0ZXJXaWR0aCgpICsgKCR0aC5vZmZzZXQoKS5sZWZ0IC0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnQpO1xyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzXHJcblx0XHRcdD8gdGhpcy50b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKClcclxuXHRcdFx0OiB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzUGVyY2VudGFnZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZVxyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwud2lkdGgoKSk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0dG90YWwgKz0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdG90YWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2VcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2UoKSB7XHJcblx0XHQvL3Nob3VsZCBiZSAxMDAlIDpEXHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHR0b3RhbCArPSB0aGlzLnBhcnNlV2lkdGgoZWwpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0b3RhbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHNhdmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRzYXZlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuc3RvcmUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KHRoaXMuZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSwgdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzICsgJycpO1xyXG5cdFx0XHRcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZiAoISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxyXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbCksXHJcblx0XHRcdFx0XHR0aGlzLnBhcnNlV2lkdGgoZWwpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0cmVzdG9yZUNvbHVtbldpZHRocygpIHtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnN0b3JlKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZS5nZXQodGhpcy5nZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpKSAhPT0gKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyArICcnKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZighJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMub3B0aW9ucy5zdG9yZS5nZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyRG93bihldmVudCkge1xyXG5cdFx0Ly8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcclxuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxyXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXHJcblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XHJcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xyXG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaXNEb3VibGVDbGljayA9IHRoaXMubGFzdFBvaW50ZXJEb3duICE9IG51bGwgJiYgKChuZXcgRGF0ZSgpIC0gdGhpcy5sYXN0UG9pbnRlckRvd24pIDwgdGhpcy5vcHRpb25zLmRvdWJsZUNsaWNrRGVsYXkpO1xyXG5cdFx0dGhpcy5sYXN0UG9pbnRlckRvd24gPSBuZXcgRGF0ZSgpO1xyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4ICsgMSkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHJcblx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcclxuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSB7XHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcclxuXHJcblx0XHRcdHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXHJcblxyXG5cdFx0XHR3aWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcclxuXHRcdFx0fSxcclxuXHRcdFx0bmV3V2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0JGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcclxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1x0XHRcclxuXHRcdFxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgZG91YmxlIGNsaWNrXHJcblxyXG5cdEBtZXRob2Qgb25Eb3VibGVDbGlja1xyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uRG91YmxlQ2xpY2soZXZlbnQpIHtcclxuXHRcdGlmICghdGhpcy5vcGVyYXRpb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gdGhpcy5vcGVyYXRpb24uJGN1cnJlbnRHcmlwO1xyXG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHRcdGxldCBsZWZ0ID0gJGxlZnRDb2x1bW4uZ2V0KDApO1xyXG5cdFx0aWYgKCFsZWZ0KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0bGV0ICRmYWtlRWwgPSAkKCc8c3Bhbj4nKS5jc3Moe1xyXG5cdFx0XHQncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxyXG5cdFx0XHQndmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxyXG5cdFx0XHQnbGVmdCc6ICctOTk5OTlweCcsXHJcblx0XHRcdCd0b3AnOiAnLTk5OTk5cHgnXHJcblx0XHR9KTtcclxuXHRcdCQoJ2JvZHknKS5hcHBlbmQoJGZha2VFbCk7XHJcblx0XHRsZXQgbWF4V2lkdGggPSAwO1xyXG5cdFx0dGhpcy4kdGFibGUuZmluZCgndHInKS5lYWNoKChpVHIsIHRyKSA9PiB7XHJcblx0XHRcdGxldCBwb3MgPSAwO1xyXG5cdFx0XHQkKHRyKS5maW5kKCd0ZCwgdGgnKS5lYWNoKChpVGQsIHRkKSA9PiB7XHJcblx0XHRcdFx0bGV0ICR0ZCA9ICQodGQpO1xyXG5cdFx0XHRcdGlmIChwb3MgPT09IGdyaXBJbmRleCkge1xyXG5cdFx0XHRcdFx0bWF4V2lkdGggPSBNYXRoLm1heChtYXhXaWR0aCwgdGhpcy5nZXRUZXh0V2lkdGgoJHRkLCAkZmFrZUVsKSlcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cG9zICs9ICgkdGQucHJvcCgnY29sc3BhbicpIHx8IDEpO1x0XHRcdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0JGZha2VFbC5yZW1vdmUoKTtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdG1heFdpZHRoID0gbWF4V2lkdGggLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zZXRXaWR0aChsZWZ0LCBtYXhXaWR0aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJNb3ZlXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyTW92ZShldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBkZWx0YSBjaGFuZ2UgYmV0d2VlbiBzdGFydCBhbmQgbmV3IG1vdXNlIHBvc2l0aW9uLCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRhYmxlIHdpZHRoXHJcblx0XHRsZXQgZGlmZmVyZW5jZSA9IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpIC0gb3Auc3RhcnRYO1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0ZGlmZmVyZW5jZSA9IChkaWZmZXJlbmNlKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoZGlmZmVyZW5jZSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGxlZnRDb2x1bW4gPSBvcC4kbGVmdENvbHVtblswXTtcclxuXHRcdGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcclxuXHRcdGxldCB3aWR0aExlZnQsIHdpZHRoUmlnaHQ7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHQvL1RPRE8gTmVlZCB0byBpbnZlc3RpZ2F0ZSB0aGlzXHJcblx0XHRcdGlmKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKHJpZ2h0Q29sdW1uKSwgb3Aud2lkdGhzLnJpZ2h0IC0gZGlmZmVyZW5jZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xyXG5cdFx0XHRcdC8vX3RoaXMuc2V0V2lkdGgoJGxlZnRDb2x1bW5bMF0sIF90aGlzLmNvbnN0cmFpbldpZHRoKHdpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSkpO1xyXG5cdFx0XHRcdC8vX3RoaXMuc2V0V2lkdGgoJGxlZnRDb2x1bW5bMF0sIG5ld1dpZHRocy5sZWZ0ID0gJGxlZnRDb2x1bW4ub3V0ZXJXaWR0aCgpKTtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQobGVmdENvbHVtbiksIG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChyaWdodENvbHVtbiksIG9wLndpZHRocy5yaWdodCArIChvcC53aWR0aHMubGVmdCAtIG9wLm5ld1dpZHRocy5sZWZ0KSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKHJpZ2h0Q29sdW1uKSwgb3Aud2lkdGhzLnJpZ2h0IC0gZGlmZmVyZW5jZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChsZWZ0Q29sdW1uKSwgb3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKHJpZ2h0Q29sdW1uKSwgb3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGxlZnRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChsZWZ0Q29sdW1uLCB3aWR0aExlZnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYocmlnaHRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XHJcblx0XHR9XHJcblxyXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XHJcblx0XHRvcC5uZXdXaWR0aHMucmlnaHQgPSB3aWR0aFJpZ2h0O1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcclxuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcclxuXHRcdFx0d2lkdGhMZWZ0LCB3aWR0aFJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSByZWxlYXNlIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJVcFxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlclVwKGV2ZW50KSB7XHJcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcclxuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddKTtcclxuXHJcblx0XHRpZiAodGhpcy5pc0RvdWJsZUNsaWNrKXtcclxuXHRcdFx0dGhpcy5vbkRvdWJsZUNsaWNrKGV2ZW50KVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdG9wLiRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXHJcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxyXG5cclxuXHRAbWV0aG9kIGRlc3Ryb3lcclxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxyXG5cdCoqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XHJcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcclxuXHRcdFx0dGhpcy4kd2luZG93XHJcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxyXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcclxuXHRcdCk7XHJcblxyXG5cdFx0JHRhYmxlLnJlbW92ZURhdGEoREFUQV9BUEkpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGUgPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiAkdGFibGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBiaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIGJpbmQgZXZlbnRzIHRvXHJcblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxyXG5cdEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXHJcblx0QHBhcmFtIFtjYWxsYmFja10ge0Z1bmN0aW9ufSBDYWxsYmFjayBtZXRob2RcclxuXHQqKi9cclxuXHRiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xyXG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcclxuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdW5iaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIHVuYmluZFxyXG5cdCoqL1xyXG5cdHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKGV2ZW50cyAhPSBudWxsKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdCR0YXJnZXQub2ZmKGV2ZW50cyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRUcmlnZ2VycyBhbiBldmVudCBvbiB0aGUgPHRhYmxlLz4gZWxlbWVudCBmb3IgYSBnaXZlbiB0eXBlIHdpdGggZ2l2ZW5cclxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXHJcblx0Z2l2ZW4uIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgdHJpZ2dlcmVkIGV2ZW50LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdHJpZ2dlckV2ZW50XHJcblx0QHBhcmFtIHR5cGUge1N0cmluZ30gRXZlbnQgbmFtZVxyXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxyXG5cdEBwYXJhbSBbb3JpZ2luYWxFdmVudF0gSWYgZ2l2ZW4sIGlzIHNldCBvbiB0aGUgZXZlbnQgb2JqZWN0XHJcblx0QHJldHVybiB7TWl4ZWR9IFJlc3VsdCBvZiB0aGUgZXZlbnQgdHJpZ2dlciBhY3Rpb25cclxuXHQqKi9cclxuXHR0cmlnZ2VyRXZlbnQodHlwZSwgYXJncywgb3JpZ2luYWxFdmVudCkge1xyXG5cdFx0bGV0IGV2ZW50ID0gJC5FdmVudCh0eXBlKTtcclxuXHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudCA9ICQuZXh0ZW5kKHt9LCBvcmlnaW5hbEV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUudHJpZ2dlcihldmVudCwgW3RoaXNdLmNvbmNhdChhcmdzIHx8IFtdKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgY29sdW1uIGVsZW1lbnRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IENvbHVtbiBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlQ29sdW1uSWQoJGVsKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVRhYmxlSWQoKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgSUQgZm9yIGEgdGFibGUncyAoRE9NRWxlbWVudCkgJ2Fic29sdXRlV2lkdGhzJyBvcHRpb25cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkXHJcblx0QHJldHVybiB7U3RyaW5nfSBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKSArICctLWFic29sdXRlLXdpZHRocyc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIElEIGZvciBhIGdpdmVuIHRhYmxlIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVJZFxyXG5cdEByZXR1cm4ge1N0cmluZ30gVGFibGUgSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZVRhYmxlSWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpLnJlcGxhY2UoL1xcLi9nLCAnXycpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxyXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIGdldCB3aWR0aCBvZlxyXG5cdEByZXR1cm4ge051bWJlcn0gRWxlbWVudCdzIHdpZHRoIGFzIGEgZmxvYXRcclxuXHQqKi9cclxuXHRwYXJzZVdpZHRoKGVsZW1lbnQpIHtcclxuXHRcdHJldHVybiBlbGVtZW50ID8gcGFyc2VGbG9hdChlbGVtZW50LnN0eWxlLndpZHRoLnJlcGxhY2UoKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpLCAnJykpIDogMDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFNldHMgdGhlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc2V0V2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gc2V0XHJcblx0KiovXHJcblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcclxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcclxuXHRcdHdpZHRoID0gd2lkdGggPiAwID8gd2lkdGggOiAwO1xyXG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXHJcblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudFxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXHJcblx0KiovXHJcblx0Y29uc3RyYWluV2lkdGgoJGVsLCB3aWR0aCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5taW5XaWR0aCAhPSB1bmRlZmluZWQgfHwgdGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGgsICRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWF4V2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHR3aWR0aCA9IE1hdGgubWF4KDAsIHdpZHRoKTtcclxuIFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/IHRoaXMuJHRhYmxlLndpZHRoKCkgOiAxMDAsIHdpZHRoKTtcclxuXHJcblx0XHRyZXR1cm4gd2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcclxuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcclxuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcclxuXHQqKi9cclxuXHRnZXRQb2ludGVyWChldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEdldHMgdGhlIHRleHQgd2lkdGggb2YgYW4gZWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0VGV4dFdpZHRoXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHRleHRcclxuXHRAcGFyYW0gJGZha2VFbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1lYXN1cmUgdGhlIHdpZHRoXHJcblx0QHJldHVybiB7TnVtYmVyfSBUZXh0IHdpZHRoXHJcblx0KiovXHJcblx0Z2V0VGV4dFdpZHRoKCRlbCwgJGZha2VFbCkge1x0XHRcclxuXHRcdHJldHVybiAkZmFrZUVsXHJcblx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdCdmb250RmFtaWx5JzogJGVsLmNzcygnZm9udEZhbWlseScpLFxyXG5cdFx0XHRcdCdmb250U2l6ZSc6ICRlbC5jc3MoJ2ZvbnRTaXplJyksXHJcblx0XHRcdFx0J2ZvbnRXZWlnaHQnOiAkZWwuY3NzKCdmb250V2VpZ2h0JyksXHJcblx0XHRcdFx0J3BhZGRpbmdMZWZ0JzogJGVsLmNzcygncGFkZGluZ0xlZnQnKSxcclxuXHRcdFx0XHQncGFkZGluZ1JpZ2h0JzogJGVsLmNzcygncGFkZGluZ1JpZ2h0JyksXHJcblx0XHRcdFx0J2JvcmRlcic6ICRlbC5jc3MoJ2JvcmRlcicpXHJcblx0XHRcdH0pXHJcblx0XHRcdC50ZXh0KCRlbC50ZXh0KCkpXHJcblx0XHRcdC5vdXRlcldpZHRoKHRydWUpO1xyXG5cdH1cclxufVxyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cyA9IHtcclxuXHRzZWxlY3RvcjogZnVuY3Rpb24oJHRhYmxlKSB7XHJcblx0XHRpZigkdGFibGUuZmluZCgndGhlYWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFNFTEVDVE9SX1RIO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBTRUxFQ1RPUl9URDtcclxuXHR9LFxyXG5cdHN0b3JlOiB3aW5kb3cuc3RvcmUsXHJcblx0c3luY0hhbmRsZXJzOiB0cnVlLFxyXG5cdHJlc2l6ZUZyb21Cb2R5OiB0cnVlLFxyXG5cdG1heFdpZHRoOiBudWxsLFxyXG5cdG1pbldpZHRoOiAwLjAxLFxyXG5cdG9iZXlDc3NNaW5XaWR0aDogZmFsc2UsXHJcbiBcdG9iZXlDc3NNYXhXaWR0aDogZmFsc2UsXHJcblx0YWJzb2x1dGVXaWR0aHM6IGZhbHNlLFxyXG5cdGRvdWJsZUNsaWNrRGVsYXk6IDUwMCxcclxuXHR3cmFwcFRhYmxlOiBmYWxzZVxyXG59O1xyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XHJcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OU19JRCA9ICdyZXNpemFibGUtY29sdW1ucy1pZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ1NTX01JTl9XSURUSCA9ICdjc3NNaW5XaWR0aCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NQVhfV0lEVEggPSAnY3NzTWF4V2lkdGgnO1xyXG5cclxuZXhwb3J0IGNvbnN0IENMQVNTX0FCU09MVVRFID0gJ3JjLWFic29sdXRlJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0NPTFVNTl9SRVNJWklORyA9ICdyYy1jb2x1bW4tcmVzaXppbmcnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFID0gJ3JjLWhhbmRsZSc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfVEFCTEVfV1JBUFBFUiA9ICdyYy10YWJsZS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RBUlQgPSAnY29sdW1uOnJlc2l6ZTpzdGFydCc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkUgPSAnY29sdW1uOnJlc2l6ZSc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1RIID0gJ3RyOmZpcnN0ID4gdGg6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVU5SRVNJWkFCTEUgPSBgW2RhdGEtbm9yZXNpemVdYDtcclxuXHJcbmV4cG9ydCBjb25zdCBBVFRSSUJVVEVfVU5SRVNJWkFCTEUgPSAnZGF0YS1ub3Jlc2l6ZSc7XHJcbiIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xyXG5pbXBvcnQgYWRhcHRlciBmcm9tICcuL2FkYXB0ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzaXphYmxlQ29sdW1uczsiXX0=
