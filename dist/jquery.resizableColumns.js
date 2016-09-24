/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat Sep 24 2016 21:17:43 GMT+0300 (GTB Summer Time)
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

			if (this.options.absoluteWidths) {
				var left = $leftColumn.get(0);
				if (left) {
					(function () {
						var $fakeEl = $('<span>').css({
							'position': 'absolute',
							'visibility': 'hidden',
							'left': '-99999px',
							'top': '-99999px'
						});
						$('body').append($fakeEl);
						var maxWidth = 0,
						    targetPosition = gripIndex + 1;
						_this9.$table.find('tr').each(function (iTr, tr) {
							var pos = 0;
							$(tr).find('td, th').each(function (iTd, td) {
								var $td = $(td);
								pos++;
								if (pos === targetPosition) {
									maxWidth = Math.max(maxWidth, _this9.getTextWidth($td, $fakeEl));
									return false;
								}
								pos = pos - 1 + ($td.prop('colspan') || 1); //Remove 1 for the previous increment						
							});
						});
						$fakeEl.remove();
						_this9.setWidth(left, maxWidth);
					})();
				}
			} else {
				//TODO
			}
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
	doubleClickDelay: 500
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0RqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxvQkFBb0Isb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ25CeEIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xyXG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcclxuXHJcblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xyXG5cdFx0aWYgKCFhcGkpIHtcclxuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xyXG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xyXG4iLCJpbXBvcnQge1xyXG5cdERBVEFfQVBJLFxyXG5cdERBVEFfQ09MVU1OU19JRCxcclxuXHREQVRBX0NPTFVNTl9JRCxcclxuXHREQVRBX0NTU19NSU5fV0lEVEgsXHJcblx0REFUQV9DU1NfTUFYX1dJRFRILFxyXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxyXG5cdENMQVNTX0NPTFVNTl9SRVNJWklORyxcclxuXHRDTEFTU19IQU5ETEUsXHJcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcclxuXHRFVkVOVF9SRVNJWkVfU1RBUlQsXHJcblx0RVZFTlRfUkVTSVpFLFxyXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxyXG5cdFNFTEVDVE9SX1RILFxyXG5cdFNFTEVDVE9SX1RELFxyXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFLFxyXG5cdEFUVFJJQlVURV9VTlJFU0laQUJMRVxyXG59XHJcbmZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG5UYWtlcyBhIDx0YWJsZSAvPiBlbGVtZW50IGFuZCBtYWtlcyBpdCdzIGNvbHVtbnMgcmVzaXphYmxlIGFjcm9zcyBib3RoXHJcbm1vYmlsZSBhbmQgZGVza3RvcCBjbGllbnRzLlxyXG5cclxuQGNsYXNzIFJlc2l6YWJsZUNvbHVtbnNcclxuQHBhcmFtICR0YWJsZSB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnQgdG8gbWFrZSByZXNpemFibGVcclxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcclxuKiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZUNvbHVtbnMge1xyXG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xyXG5cdFx0dGhpcy5ucyA9ICcucmMnICsgdGhpcy5jb3VudCsrO1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XHJcblx0XHR0aGlzLiR0YWJsZSA9ICR0YWJsZTtcclxuXHRcdHRoaXMubGFzdFBvaW50ZXJEb3duID0gbnVsbDtcclxuXHRcdHRoaXMuaXNEb3VibGVDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcclxuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcclxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHdpZHRocy5cclxuXHJcblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xyXG5cdCoqL1xyXG5cdHJlZnJlc2hIZWFkZXJzKCkge1xyXG5cdFx0Ly8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcclxuXHRcdC8vIGEgZHluYW1pYyBjYWxsYmFja1xyXG5cdFx0bGV0IHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xyXG5cdFx0aWYodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IuY2FsbCh0aGlzLCB0aGlzLiR0YWJsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2VsZWN0IGFsbCB0YWJsZSBoZWFkZXJzXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcclxuXHJcblx0XHQvLyBBc3NpZ24gd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25BYnNvbHV0ZVdpZHRocygpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENyZWF0ZXMgZHVtbXkgaGFuZGxlIGVsZW1lbnRzIGZvciBhbGwgdGFibGUgaGVhZGVyIGNvbHVtbnNcclxuXHJcblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXHJcblx0KiovXHJcblx0Y3JlYXRlSGFuZGxlcygpIHtcclxuXHRcdGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XHJcblx0XHRpZiAocmVmICE9IG51bGwpIHtcclxuXHRcdFx0cmVmLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcclxuXHRcdHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XHJcblx0XHRcdGxldCAkbmV4dCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpICsgMSk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKXtcclxuXHRcdFx0XHRpZiAoJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICgkbmV4dC5sZW5ndGggPT09IDAgfHwgJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcclxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIGFic29sdXRlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgd2lkdGgocylcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGFzc2lnbkFic29sdXRlV2lkdGhzXHJcblx0KiovXHJcblx0YXNzaWduQWJzb2x1dGVXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR0YWJsZVdpZHRoID0gdGhpcy4kdGFibGUud2lkdGgoKSxcclxuXHRcdFx0XHRwYWRkaW5nTGVmdCA9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKSxcclxuXHRcdFx0XHRwYWRkaW5nUmlnaHQgPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpLFxyXG5cdFx0XHRcdHdpZHRoID0gKCRlbC5vdXRlcldpZHRoKCkgLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIHRhYmxlV2lkdGgpO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlIHRoZSB2YWx1ZSBvZiBhIHN0cmluZyBieSByZW1vdmluZyAncHgnXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBwYXJzZVBpeGVsU3RyaW5nXHJcblx0QHBhcmFtIHZhbHVlIHtTdHJpbmd9XHJcblx0QHJldHVybiB7TnVtYmVyfSBQYXJzZWQgdmFsdWUgb3IgMFxyXG5cdCoqL1xyXG5cdHN0YXRpYyBwYXJzZVBpeGVsU3RyaW5nKHZhbHVlKSB7XHJcblx0XHRsZXQgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cdFx0XHJcblx0XHRpZiAodmFsdWVUeXBlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRsZXQgdiA9IHZhbHVlLnJlcGxhY2UoJ3B4JywgJycpLFxyXG5cdFx0XHRcdG4gPSBwYXJzZUZsb2F0KHYpO1xyXG5cdFx0XHRpZiAoIWlzTmFOKG4pKSB7XHJcblx0XHRcdFx0cmV0dXJuIG47XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSkgKiAxMDA7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIDEwMCk7XHJcblxyXG5cdFx0XHRsZXQgbWluV2lkdGggPSB0aGlzLmNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1pbldpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIG1pbldpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWF4KG1pbldpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgbWF4V2lkdGggPSB0aGlzLmNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1heFdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIG1heFdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbFswXSwgd2lkdGgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb21wdXRlTWluQ3NzV2lkdGhzXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IGZvciB3aGljaCB3ZSBjb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoXHJcblx0KiovXHJcblx0Y29tcHV0ZU1pbkNzc1dpZHRocygkZWwpIHtcclxuXHRcdGxldCBlbCwgbWluV2lkdGg7XHJcblx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRlbCA9ICRlbFswXTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMub2JleUNzc01pbldpZHRoKSB7XHJcblx0XHRcdGlmIChlbC5zdHlsZS5taW5XaWR0aC5zbGljZSgtMikgPT09ICdweCcpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0XHRtaW5XaWR0aCA9IChtaW5XaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc05hTihtaW5XaWR0aCkpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBtaW5XaWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbXB1dGUgdGhlIG1heGltdW0gd2lkdGggdGFraW5nIGludG8gYWNjb3VudCBDU1NcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNvbXB1dGVNYXhDc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1heGltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtYXhXaWR0aDtcclxuXHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsWzBdO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1heFdpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0XHRcdG1heFdpZHRoID0gKG1heFdpZHRoIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1heFdpZHRoKSkge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1heFdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNBYnNvbHV0ZSgpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGVcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cclxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSkuY3NzKCdtaW5XaWR0aCcsIHRoaXMudG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpKTtcclxuXHJcblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XHJcblxyXG5cdFx0XHRsZXQgJHRoID0gdGhpcy4kdGFibGVIZWFkZXJzLmZpbHRlcihgOm5vdCgke1NFTEVDVE9SX1VOUkVTSVpBQkxFfSlgKS5lcShfKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJHRoLm91dGVyV2lkdGgoKVxyXG5cdFx0XHRsZWZ0IC09IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0bGVmdCAtPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpO1xyXG5cdFx0XHRsZWZ0ICs9ICR0aC5vZmZzZXQoKS5sZWZ0O1xyXG5cdFx0XHRsZWZ0IC09IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XHJcblxyXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZVxyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCAkdGggPSB0aGlzLiR0YWJsZUhlYWRlcnMuZmlsdGVyKGA6bm90KCR7U0VMRUNUT1JfVU5SRVNJWkFCTEV9KWApLmVxKF8pO1xyXG5cclxuXHRcdFx0bGV0IGxlZnQgPSAkdGgub3V0ZXJXaWR0aCgpICsgKCR0aC5vZmZzZXQoKS5sZWZ0IC0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnQpO1xyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzXHJcblx0XHRcdD8gdGhpcy50b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKClcclxuXHRcdFx0OiB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzUGVyY2VudGFnZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZVxyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwud2lkdGgoKSk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0dG90YWwgKz0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdG90YWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2VcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2UoKSB7XHJcblx0XHQvL3Nob3VsZCBiZSAxMDAlIDpEXHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHR0b3RhbCArPSB0aGlzLnBhcnNlV2lkdGgoZWwpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0b3RhbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHNhdmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRzYXZlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuc3RvcmUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KHRoaXMuZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSwgdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzICsgJycpO1xyXG5cdFx0XHRcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZiAoISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxyXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbCksXHJcblx0XHRcdFx0XHR0aGlzLnBhcnNlV2lkdGgoZWwpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0cmVzdG9yZUNvbHVtbldpZHRocygpIHtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnN0b3JlKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZS5nZXQodGhpcy5nZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpKSAhPT0gKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyArICcnKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZighJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMub3B0aW9ucy5zdG9yZS5nZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyRG93bihldmVudCkge1xyXG5cdFx0Ly8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcclxuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxyXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXHJcblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XHJcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xyXG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaXNEb3VibGVDbGljayA9IHRoaXMubGFzdFBvaW50ZXJEb3duICE9IG51bGwgJiYgKChuZXcgRGF0ZSgpIC0gdGhpcy5sYXN0UG9pbnRlckRvd24pIDwgdGhpcy5vcHRpb25zLmRvdWJsZUNsaWNrRGVsYXkpO1xyXG5cdFx0dGhpcy5sYXN0UG9pbnRlckRvd24gPSBuZXcgRGF0ZSgpO1xyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4ICsgMSkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHJcblx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcclxuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSB7XHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcclxuXHJcblx0XHRcdHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXHJcblxyXG5cdFx0XHR3aWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcclxuXHRcdFx0fSxcclxuXHRcdFx0bmV3V2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0JGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcclxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1x0XHRcclxuXHRcdFxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgZG91YmxlIGNsaWNrXHJcblxyXG5cdEBtZXRob2Qgb25Eb3VibGVDbGlja1xyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uRG91YmxlQ2xpY2soZXZlbnQpIHtcclxuXHRcdGlmICghdGhpcy5vcGVyYXRpb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gdGhpcy5vcGVyYXRpb24uJGN1cnJlbnRHcmlwO1xyXG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdGxldCBsZWZ0ID0gJGxlZnRDb2x1bW4uZ2V0KDApO1xyXG5cdFx0XHRpZiAobGVmdCkge1xyXG5cdFx0XHRcdGxldCAkZmFrZUVsID0gJCgnPHNwYW4+JykuY3NzKHtcclxuXHRcdFx0XHRcdCdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcblx0XHRcdFx0XHQndmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxyXG5cdFx0XHRcdFx0J2xlZnQnOiAnLTk5OTk5cHgnLFxyXG5cdFx0XHRcdFx0J3RvcCc6ICctOTk5OTlweCdcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHQkKCdib2R5JykuYXBwZW5kKCRmYWtlRWwpO1xyXG5cdFx0XHRcdGxldCBtYXhXaWR0aCA9IDAsXHJcblx0XHRcdFx0XHR0YXJnZXRQb3NpdGlvbiA9IGdyaXBJbmRleCArIDE7XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndHInKS5lYWNoKChpVHIsIHRyKSA9PiB7XHJcblx0XHRcdFx0XHRsZXQgcG9zID0gMDtcclxuXHRcdFx0XHRcdCQodHIpLmZpbmQoJ3RkLCB0aCcpLmVhY2goKGlUZCwgdGQpID0+IHtcclxuXHRcdFx0XHRcdFx0bGV0ICR0ZCA9ICQodGQpO1xyXG5cdFx0XHRcdFx0XHRwb3MgKys7XHJcblx0XHRcdFx0XHRcdGlmIChwb3MgPT09IHRhcmdldFBvc2l0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bWF4V2lkdGggPSBNYXRoLm1heChtYXhXaWR0aCwgdGhpcy5nZXRUZXh0V2lkdGgoJHRkLCAkZmFrZUVsKSlcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0cG9zID0gcG9zIC0xICsgKCR0ZC5wcm9wKCdjb2xzcGFuJykgfHwgMSk7IC8vUmVtb3ZlIDEgZm9yIHRoZSBwcmV2aW91cyBpbmNyZW1lbnRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdCRmYWtlRWwucmVtb3ZlKCk7XHJcblx0XHRcdFx0dGhpcy5zZXRXaWR0aChsZWZ0LCBtYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vVE9ET1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxyXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSAtIG9wLnN0YXJ0WDtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdGRpZmZlcmVuY2UgPSAoZGlmZmVyZW5jZSkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW5bMF07XHJcblx0XHRsZXQgcmlnaHRDb2x1bW4gPSBvcC4kcmlnaHRDb2x1bW5bMF07XHJcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0Ly9UT0RPIE5lZWQgdG8gaW52ZXN0aWdhdGUgdGhpc1xyXG5cdFx0XHRpZihkaWZmZXJlbmNlID4gMCkge1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChsZWZ0Q29sdW1uKSwgb3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChyaWdodENvbHVtbiksIG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYoZGlmZmVyZW5jZSA8IDApIHtcclxuXHRcdFx0XHQvL190aGlzLnNldFdpZHRoKCRsZWZ0Q29sdW1uWzBdLCBfdGhpcy5jb25zdHJhaW5XaWR0aCh3aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpKTtcclxuXHRcdFx0XHQvL190aGlzLnNldFdpZHRoKCRsZWZ0Q29sdW1uWzBdLCBuZXdXaWR0aHMubGVmdCA9ICRsZWZ0Q29sdW1uLm91dGVyV2lkdGgoKSk7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aCgkKGxlZnRDb2x1bW4pLCBvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQocmlnaHRDb2x1bW4pLCBvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZihkaWZmZXJlbmNlID4gMCkge1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChsZWZ0Q29sdW1uKSwgb3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChyaWdodENvbHVtbiksIG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYoZGlmZmVyZW5jZSA8IDApIHtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKCQobGVmdENvbHVtbiksIG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgoJChyaWdodENvbHVtbiksIG9wLndpZHRocy5yaWdodCArIChvcC53aWR0aHMubGVmdCAtIG9wLm5ld1dpZHRocy5sZWZ0KSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZihsZWZ0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgobGVmdENvbHVtbiwgd2lkdGhMZWZ0KTtcclxuXHRcdH1cclxuXHRcdGlmKHJpZ2h0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgocmlnaHRDb2x1bW4sIHdpZHRoUmlnaHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9wLm5ld1dpZHRocy5sZWZ0ID0gd2lkdGhMZWZ0O1xyXG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdHdpZHRoTGVmdCwgd2lkdGhSaWdodFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyVXBcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJVcChldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNEb3VibGVDbGljayl7XHJcblx0XHRcdHRoaXMub25Eb3VibGVDbGljayhldmVudClcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcclxuXHJcblx0XHRvcC4kbGVmdENvbHVtblxyXG5cdFx0XHQuYWRkKG9wLiRyaWdodENvbHVtbilcclxuXHRcdFx0LmFkZChvcC4kY3VycmVudEdyaXApXHJcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xyXG5cclxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xyXG5cdFx0dGhpcy5zYXZlQ29sdW1uV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHRvcC5uZXdXaWR0aHMubGVmdCwgb3AubmV3V2lkdGhzLnJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLCBkYXRhLCBhbmQgYWRkZWQgRE9NIGVsZW1lbnRzLiBUYWtlc1xyXG5cdHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcclxuXHJcblx0QG1ldGhvZCBkZXN0cm95XHJcblx0QHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcclxuXHQqKi9cclxuXHRkZXN0cm95KCkge1xyXG5cdFx0bGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xyXG5cdFx0bGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSk7XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHMoXHJcblx0XHRcdHRoaXMuJHdpbmRvd1xyXG5cdFx0XHRcdC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcclxuXHRcdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHRcdC5hZGQoJGhhbmRsZXMpXHJcblx0XHQpO1xyXG5cclxuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcclxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xyXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXHJcblx0KiovXHJcblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcclxuXHQqKi9cclxuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXHJcblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxyXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxyXG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcclxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcclxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxyXG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXHJcblx0KiovXHJcblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XHJcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XHJcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVUYWJsZUlkKCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCkucmVwbGFjZSgvXFwuL2csICdfJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIElEIGZvciBhIHRhYmxlJ3MgKERPTUVsZW1lbnQpICdhYnNvbHV0ZVdpZHRocycgb3B0aW9uXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZFxyXG5cdEByZXR1cm4ge1N0cmluZ30gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpIHtcclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkucmVwbGFjZSgvXFwuL2csICdfJykgKyAnLS1hYnNvbHV0ZS13aWR0aHMnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBJRCBmb3IgYSBnaXZlbiB0YWJsZSBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZVRhYmxlSWRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IFRhYmxlIElEXHJcblx0KiovXHJcblx0Z2VuZXJhdGVUYWJsZUlkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2ZcclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XHJcblx0KiovXHJcblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyAncHgnIDogJyUnKSwgJycpKSA6IDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRTZXRzIHRoZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHNldFdpZHRoXHJcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gc2V0IHdpZHRoIG9uXHJcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoIHRvIHNldFxyXG5cdCoqL1xyXG5cdHNldFdpZHRoKGVsZW1lbnQsIHdpZHRoKSB7XHJcblx0XHR3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XHJcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcclxuXHRcdGVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aCArICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyAncHgnIDogJyUnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxyXG5cdHRoZSBgbWluV2lkdGhgIGFuZCBgbWF4V2lkdGhgIGNvbmZpZ3VyYXRpb24gb3B0aW9ucywgcmVzcGVjdGl2ZWx5LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29uc3RyYWluV2lkdGhcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnRcclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gY29uc3RyYWluXHJcblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbnN0cmFpbldpZHRoKCRlbCwgd2lkdGgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWluV2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCB8fCB0aGlzLm9wdGlvbnMub2JleUNzc01heFdpZHRoKSB7XHJcblx0XHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heFdpZHRoLCB3aWR0aCwgJGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRIKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0d2lkdGggPSBNYXRoLm1heCgwLCB3aWR0aCk7XHJcbiBcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyB0aGlzLiR0YWJsZS53aWR0aCgpIDogMTAwLCB3aWR0aCk7XHJcblxyXG5cdFx0cmV0dXJuIHdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0R2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXHJcblx0dGhlIGhvcml6b250YWwgZGlyZWN0aW9uLiBBY2NvdW50cyBmb3IgYm90aCByZWd1bGFyIG1vdXNlIGNsaWNrcyBhcyB3ZWxsIGFzXHJcblx0cG9pbnRlci1saWtlIHN5c3RlbXMgKG1vYmlsZXMsIHRhYmxldHMgZXRjLilcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdldFBvaW50ZXJYXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0QHJldHVybiB7TnVtYmVyfSBIb3Jpem9udGFsIHBvaW50ZXIgb2Zmc2V0XHJcblx0KiovXHJcblx0Z2V0UG9pbnRlclgoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudC50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkucGFnZVg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZXZlbnQucGFnZVg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHZXRzIHRoZSB0ZXh0IHdpZHRoIG9mIGFuIGVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdldFRleHRXaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0ZXh0XHJcblx0QHBhcmFtICRmYWtlRWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtZWFzdXJlIHRoZSB3aWR0aFxyXG5cdEByZXR1cm4ge051bWJlcn0gVGV4dCB3aWR0aFxyXG5cdCoqL1xyXG5cdGdldFRleHRXaWR0aCgkZWwsICRmYWtlRWwpIHtcdFx0XHJcblx0XHRyZXR1cm4gJGZha2VFbFxyXG5cdFx0XHQuY3NzKHtcclxuXHRcdFx0XHQnZm9udEZhbWlseSc6ICRlbC5jc3MoJ2ZvbnRGYW1pbHknKSxcclxuXHRcdFx0XHQnZm9udFNpemUnOiAkZWwuY3NzKCdmb250U2l6ZScpLFxyXG5cdFx0XHRcdCdmb250V2VpZ2h0JzogJGVsLmNzcygnZm9udFdlaWdodCcpLFxyXG5cdFx0XHRcdCdwYWRkaW5nTGVmdCc6ICRlbC5jc3MoJ3BhZGRpbmdMZWZ0JyksXHJcblx0XHRcdFx0J3BhZGRpbmdSaWdodCc6ICRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpLFxyXG5cdFx0XHRcdCdib3JkZXInOiAkZWwuY3NzKCdib3JkZXInKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGV4dCgkZWwudGV4dCgpKVxyXG5cdFx0XHQub3V0ZXJXaWR0aCh0cnVlKTtcclxuXHR9XHJcbn1cclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XHJcblx0c2VsZWN0b3I6IGZ1bmN0aW9uKCR0YWJsZSkge1xyXG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XHJcblx0fSxcclxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxyXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcclxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcclxuXHRtYXhXaWR0aDogbnVsbCxcclxuXHRtaW5XaWR0aDogMC4wMSxcclxuXHRvYmV5Q3NzTWluV2lkdGg6IGZhbHNlLFxyXG4gXHRvYmV5Q3NzTWF4V2lkdGg6IGZhbHNlLFxyXG5cdGFic29sdXRlV2lkdGhzOiBmYWxzZSxcclxuXHRkb3VibGVDbGlja0RlbGF5OiA1MDBcclxufTtcclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuY291bnQgPSAwO1xyXG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTlNfSUQgPSAncmVzaXphYmxlLWNvbHVtbnMtaWQnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5fSUQgPSAncmVzaXphYmxlLWNvbHVtbi1pZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NSU5fV0lEVEggPSAnY3NzTWluV2lkdGgnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUFYX1dJRFRIID0gJ2Nzc01heFdpZHRoJztcclxuXHJcbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9SRVNJWklORyA9ICdyYy10YWJsZS1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFX0NPTlRBSU5FUiA9ICdyYy1oYW5kbGUtY29udGFpbmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RBUlQgPSAnY29sdW1uOnJlc2l6ZTpzdGFydCc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkUgPSAnY29sdW1uOnJlc2l6ZSc7XHJcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1RIID0gJ3RyOmZpcnN0ID4gdGg6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVU5SRVNJWkFCTEUgPSBgW2RhdGEtbm9yZXNpemVdYDtcclxuXHJcbmV4cG9ydCBjb25zdCBBVFRSSUJVVEVfVU5SRVNJWkFCTEUgPSAnZGF0YS1ub3Jlc2l6ZSc7XHJcbiIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xyXG5pbXBvcnQgYWRhcHRlciBmcm9tICcuL2FkYXB0ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzaXphYmxlQ29sdW1uczsiXX0=
