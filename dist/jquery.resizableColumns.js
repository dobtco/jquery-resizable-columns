/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Mon Oct 17 2016 20:13:19 GMT+0300 (GTB Summer Time)
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
		this.$ownerDocument = $($table.get(0).ownerDocument);
		this.$table = $table;
		this.$tableWrapper = null;
		this.lastPointerDown = null;
		this.isDoubleClick = false;

		this.wrapTable();
		this.refreshHeaders();
		this.restoreColumnWidths();
		this.checkTableWidth();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.checkTableWidth.bind(this));
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
			if (!this.shouldWrap()) {
				return;
			}

			this.$tableWrapper = this.$table.wrap('<div class="' + _constants.CLASS_TABLE_WRAPPER + '"></div>').width(this.$table.innerWidth()).parent();
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

				_this2.setWidth($el.get(0), width);
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

				_this3.setWidth($el.get(0), width);
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
			el = $el.get(0);
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
			el = $el.get(0);
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
  
  
  @method checkTableWidth
  **/
	}, {
		key: 'checkTableWidth',
		value: function checkTableWidth() {
			if (this.options.absoluteWidths) {
				this.checkTableWidthAbsolute();
			}
		}

		/**
  
  @private
  @method checkTableWidthAbsolute
  **/
	}, {
		key: 'checkTableWidthAbsolute',
		value: function checkTableWidthAbsolute() {
			var _this4 = this;

			if (!this.shouldWrap()) {
				return;
			}

			var wrappperWidth = this.$tableWrapper.innerWidth();
			var tableWidth = this.$table.outerWidth(true);
			var difference = wrappperWidth - tableWidth;
			if (difference > 0) {
				(function () {
					var $headers = _this4.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE);
					var totalWidth = 0;
					var addedWidth = 0;
					var widths = [];
					$headers.each(function (i, hd) {
						var width = _this4.parseWidth(hd);
						widths.push(width);
						totalWidth += width;
					});

					_this4.setWidth(_this4.$table[0], wrappperWidth);
					$headers.each(function (j, col) {
						var currentWidth = widths.shift();
						var newWidth = currentWidth + currentWidth / totalWidth * difference;
						var leftToAdd = totalWidth + difference - addedWidth;
						_this4.setWidth(col, Math.min(newWidth, leftToAdd));
						addedWidth += newWidth;
						if (addedWidth >= totalWidth) return false;
					});
				})();
			}
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
			var _this5 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width()).css('minWidth', this.totalColumnWidthsAbsolute());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this5.options.resizeFromBody ? _this5.$table.height() : _this5.$table.find('thead').height();

				var $th = _this5.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(_);

				var left = $th.outerWidth();
				left -= ResizableColumns.parsePixelString($el.css('paddingLeft'));
				left -= ResizableColumns.parsePixelString($el.css('paddingRight'));
				left += $th.offset().left;
				left -= _this5.$handleContainer.offset().left;

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
			var _this6 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this6.options.resizeFromBody ? _this6.$table.height() : _this6.$table.find('thead').height();

				var $th = _this6.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(_);

				var left = $th.outerWidth() + ($th.offset().left - _this6.$handleContainer.offset().left);

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
			var _this7 = this;

			//should be 100% :D
			var total = 0;

			this.$tableHeaders.each(function (_, el) {
				total += _this7.parseWidth(el);
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
			var _this8 = this;

			if (!this.options.store) return;

			this.options.store.set(this.generateTableAbsoluteWidthsId(), this.options.absoluteWidths + '');

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this8.options.store.set(_this8.generateColumnId($el), _this8.parseWidth(el));
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
			var _this9 = this;

			if (!this.options.store) return;

			if (this.options.store.get(this.generateTableAbsoluteWidthsId()) !== this.options.absoluteWidths + '') return;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this9.options.store.get(_this9.generateColumnId($el));

					if (width != null) {
						_this9.setWidth(el, width);
					}
				}
			});
		}

		/**
  
  
  @method refreshWrapperStyle
  **/
	}, {
		key: 'refreshWrapperStyle',
		value: function refreshWrapperStyle() {
			if (this.$tableWrapper == null) return;

			var originalStyle = this.$tableWrapper.attr('style');
			this.$tableWrapper.css('overflow-x', 'hidden;').attr('style', originalStyle);
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
			var $leftColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex);
			var $rightColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex + 1);

			var leftWidth = this.parseWidth($leftColumn.get(0));
			var rightWidth = this.parseWidth($rightColumn.get(0));
			var tableWidth = this.parseWidth(this.$table.get(0));

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth,
					table: tableWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth,
					table: tableWidth
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
			var _this10 = this;

			if (!this.operation) return;

			var $currentGrip = this.operation.$currentGrip;
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex);
			var left = $leftColumn.get(0);
			if (!left) {
				return;
			}

			var maxWidth = 0;
			var indecesToSkyp = [];
			this.$tableHeaders.each(function (idx, th) {
				if ($(th).is(_constants.SELECTOR_UNRESIZABLE)) {
					indecesToSkyp.push(idx);
				}
			});
			var $fakeEl = $('<span>').css({
				'position': 'absolute',
				'visibility': 'hidden',
				'left': '-99999px',
				'top': '-99999px'
			});
			$('body').append($fakeEl);
			this.$table.find('tr').each(function (iTr, tr) {
				var pos = 0;
				$(tr).find('td, th').each(function (iCol, col) {
					if (indecesToSkyp.indexOf(iCol) !== -1) {
						return; // skyp over not resizable columns
					}
					var $col = $(col);
					if (pos === gripIndex) {
						maxWidth = Math.max(maxWidth, _this10.getTextWidth($col, $fakeEl));
						return false;
					}
					pos += $col.prop('colspan') || 1;
				});
			});
			$fakeEl.remove();
			if (this.options.absoluteWidths) {
				var tableWidth = this.parseWidth(this.$table[0]);
				var leftWidth = this.parseWidth(left);
				this.setWidth(this.$table[0], tableWidth + maxWidth - leftWidth);
			} else {
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

			var leftColumn = op.$leftColumn.get(0);
			var rightColumn = op.$rightColumn.get(0);
			var table = this.$table.get(0);
			var widthLeft = undefined,
			    widthRight = undefined,
			    tableWidth = undefined;

			if (this.options.absoluteWidths) {
				tableWidth = op.widths.table + difference;
				widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + difference);
				widthRight = op.widths.right; //Keep right column unchanged when increasing the table size
			} else {
					tableWidth = 100;
					if (difference < 0) {
						widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + difference);
						widthRight = this.constrainWidth(op.$rightColumn, op.widths.right + (op.widths.left - op.newWidths.left));
					} else if (difference > 0) {
						widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + (op.widths.right - op.newWidths.right));
						widthRight = this.constrainWidth(op.$rightColumn, op.widths.right - difference);
					}
				}

			if (table) {
				if (this.options.absoluteWidths) {
					this.setWidth(table, tableWidth);
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
			op.newWidths.table = tableWidth;

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

			this.checkTableWidth();
			this.syncHandleWidths();
			this.refreshWrapperStyle();
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
			if (this.$tableWrapper != null) {
				this.$table.insertBefore(this.$tableWrapper);
				this.$tableWrapper.remove();
			}
			this.$handleContainer = null;
			this.$tableWrapper = null;
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
				'padding': $el.css('padding'),
				'border': $el.css('border') }).html($el.text().replace(/\s/g, '&nbsp;')).outerWidth(true);
		}
	}, {
		key: 'shouldWrap',
		value: function shouldWrap() {
			return this.options.wrappTable || this.options.absoluteWidths;
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
var DATA_COLUMNS_ID = 'resizableColumnsId';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizableColumnId';
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0NqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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SyxFQUFFO0FBQ3hCLFFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUIsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUEsQUFBQyxDQUFDO0dBQ3pFOzs7Ozs7Ozs7Ozs7OztTQVlhLHdCQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDMUIsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7QUFDdkUsU0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLCtCQUFvQixDQUFDLENBQUM7SUFDN0U7O0FBRUQsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7QUFDdkUsU0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLCtCQUFvQixDQUFDLENBQUM7SUFDN0U7O0FBRUQsUUFBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFCLFFBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVsRixVQUFPLEtBQUssQ0FBQztHQUNiOzs7Ozs7Ozs7Ozs7OztTQVlVLHFCQUFDLEtB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QkFBbUIsQ0FBQzs7QUFDakQsSUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQzs7QUFDbkQsSUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDOztBQUNqQyxJQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDOztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDOzs7QUFFL0MsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDakQsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDOztBQUNyQyxJQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLG9CQUFvQixvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0scUJBQXFCLEdBQUcsZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7cUJDckJ4QixTQUFTOzs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IHtEQVRBX0FQSX0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XHJcblx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdGxldCAkdGFibGUgPSAkKHRoaXMpO1xyXG5cclxuXHRcdGxldCBhcGkgPSAkdGFibGUuZGF0YShEQVRBX0FQSSk7XHJcblx0XHRpZiAoIWFwaSkge1xyXG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XHJcblx0XHRcdCR0YWJsZS5kYXRhKERBVEFfQVBJLCBhcGkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zT3JNZXRob2QgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHJldHVybiBhcGlbb3B0aW9uc09yTWV0aG9kXSguLi5hcmdzKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcbiQucmVzaXphYmxlQ29sdW1ucyA9IFJlc2l6YWJsZUNvbHVtbnM7XHJcbiIsImltcG9ydCB7XHJcblx0QVRUUklCVVRFX1VOUkVTSVpBQkxFLFxyXG5cdERBVEFfQVBJLFxyXG5cdERBVEFfQ09MVU1OU19JRCxcclxuXHREQVRBX0NPTFVNTl9JRCxcclxuXHREQVRBX0NTU19NSU5fV0lEVEgsXHJcblx0REFUQV9DU1NfTUFYX1dJRFRILFxyXG5cdENMQVNTX0FCU09MVVRFLFxyXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxyXG5cdENMQVNTX0NPTFVNTl9SRVNJWklORyxcclxuXHRDTEFTU19IQU5ETEUsXHJcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcclxuXHRDTEFTU19UQUJMRV9XUkFQUEVSLFxyXG5cdEVWRU5UX1JFU0laRV9TVEFSVCxcclxuXHRFVkVOVF9SRVNJWkUsXHJcblx0RVZFTlRfUkVTSVpFX1NUT1AsXHJcblx0U0VMRUNUT1JfVEgsXHJcblx0U0VMRUNUT1JfVEQsXHJcblx0U0VMRUNUT1JfVU5SRVNJWkFCTEVcclxufVxyXG5mcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG4vKipcclxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxyXG5tb2JpbGUgYW5kIGRlc2t0b3AgY2xpZW50cy5cclxuXHJcbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXHJcbkBwYXJhbSAkdGFibGUge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50IHRvIG1ha2UgcmVzaXphYmxlXHJcbkBwYXJhbSBvcHRpb25zIHtPYmplY3R9IENvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbioqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGVDb2x1bW5zIHtcclxuXHRjb25zdHJ1Y3RvcigkdGFibGUsIG9wdGlvbnMpIHtcclxuXHRcdHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy4kd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdFx0dGhpcy4kb3duZXJEb2N1bWVudCA9ICQoJHRhYmxlLmdldCgwKS5vd25lckRvY3VtZW50KTtcclxuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xyXG5cdFx0dGhpcy4kdGFibGVXcmFwcGVyID0gbnVsbDtcclxuXHRcdHRoaXMubGFzdFBvaW50ZXJEb3duID0gbnVsbDtcclxuXHRcdHRoaXMuaXNEb3VibGVDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMud3JhcFRhYmxlKCk7XHJcblx0XHR0aGlzLnJlZnJlc2hIZWFkZXJzKCk7XHJcblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5XaWR0aHMoKTtcclxuXHRcdHRoaXMuY2hlY2tUYWJsZVdpZHRoKCk7XHJcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5jaGVja1RhYmxlV2lkdGguYmluZCh0aGlzKSk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5zeW5jSGFuZGxlV2lkdGhzLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RhcnQpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RBUlQsIHRoaXMub3B0aW9ucy5zdGFydCk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnJlc2l6ZSkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRSwgdGhpcy5vcHRpb25zLnJlc2l6ZSk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3ApIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RPUCwgdGhpcy5vcHRpb25zLnN0b3ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0V3JhcCB0aGUgdGFibGUgRE9NRWxlbWVudCBpbiBhIGRpdlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcclxuXHQqKi9cclxuXHR3cmFwVGFibGUoKSB7XHJcblx0XHRpZighdGhpcy5zaG91bGRXcmFwKCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJHRhYmxlV3JhcHBlciA9IHRoaXMuJHRhYmxlXHJcblx0XHRcdFx0XHRcdFx0XHRcdC53cmFwKGA8ZGl2IGNsYXNzPVwiJHtDTEFTU19UQUJMRV9XUkFQUEVSfVwiPjwvZGl2PmApXHJcblx0XHRcdFx0XHRcdFx0XHRcdC53aWR0aCh0aGlzLiR0YWJsZS5pbm5lcldpZHRoKCkpXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5wYXJlbnQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcclxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHdpZHRocy5cclxuXHJcblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xyXG5cdCoqL1xyXG5cdHJlZnJlc2hIZWFkZXJzKCkge1xyXG5cdFx0Ly8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcclxuXHRcdC8vIGEgZHluYW1pYyBjYWxsYmFja1xyXG5cdFx0bGV0IHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xyXG5cdFx0aWYodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IuY2FsbCh0aGlzLCB0aGlzLiR0YWJsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2VsZWN0IGFsbCB0YWJsZSBoZWFkZXJzXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcclxuXHJcblx0XHQvLyBBc3NpZ24gd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25BYnNvbHV0ZVdpZHRocygpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENyZWF0ZXMgZHVtbXkgaGFuZGxlIGVsZW1lbnRzIGZvciBhbGwgdGFibGUgaGVhZGVyIGNvbHVtbnNcclxuXHJcblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXHJcblx0KiovXHJcblx0Y3JlYXRlSGFuZGxlcygpIHtcclxuXHRcdGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XHJcblx0XHRpZiAocmVmICE9IG51bGwpIHtcclxuXHRcdFx0cmVmLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLmFkZENsYXNzKENMQVNTX0FCU09MVVRFKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XHJcblx0XHRcdGxldCAkbmV4dCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpICsgMSk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKXtcclxuXHRcdFx0XHRpZiAoJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICgkbmV4dC5sZW5ndGggPT09IDAgfHwgJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcclxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIGFic29sdXRlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgd2lkdGgocylcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGFzc2lnbkFic29sdXRlV2lkdGhzXHJcblx0KiovXHJcblx0YXNzaWduQWJzb2x1dGVXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR0YWJsZVdpZHRoID0gdGhpcy4kdGFibGUud2lkdGgoKSxcclxuXHRcdFx0XHRwYWRkaW5nTGVmdCA9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKSxcclxuXHRcdFx0XHRwYWRkaW5nUmlnaHQgPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpLFxyXG5cdFx0XHRcdHdpZHRoID0gKCRlbC5vdXRlcldpZHRoKCkgLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIHRhYmxlV2lkdGgpO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWwuZ2V0KDApLCB3aWR0aCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHRQYXJzZSB0aGUgdmFsdWUgb2YgYSBzdHJpbmcgYnkgcmVtb3ZpbmcgJ3B4J1xyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcGFyc2VQaXhlbFN0cmluZ1xyXG5cdEBwYXJhbSB2YWx1ZSB7U3RyaW5nfVxyXG5cdEByZXR1cm4ge051bWJlcn0gUGFyc2VkIHZhbHVlIG9yIDBcclxuXHQqKi9cclxuXHRzdGF0aWMgcGFyc2VQaXhlbFN0cmluZyh2YWx1ZSkge1xyXG5cdFx0bGV0IHZhbHVlVHlwZSA9IHR5cGVvZiB2YWx1ZTtcclxuXHRcdFxyXG5cdFx0aWYgKHZhbHVlVHlwZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0bGV0IHYgPSB2YWx1ZS5yZXBsYWNlKCdweCcsICcnKSxcclxuXHRcdFx0XHRuID0gcGFyc2VGbG9hdCh2KTtcclxuXHRcdFx0aWYgKCFpc05hTihuKSkge1xyXG5cdFx0XHRcdHJldHVybiBuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdudW1iZXInKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEFzc2lnbnMgYSBwZXJjZW50YWdlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgcGl4ZWwgd2lkdGgocylcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcclxuXHQqKi9cclxuXHRhc3NpZ25QZXJjZW50YWdlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdC8vIGRvIG5vdCBhc3NpZ24gd2lkdGggaWYgdGhlIGNvbHVtbiBpcyBub3QgcmVzaXphYmxlXHJcblx0XHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoQVRUUklCVVRFX1VOUkVTSVpBQkxFKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgJGVsID0gJChlbCksXHJcblx0XHRcdFx0d2lkdGggPSAoJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkpICogMTAwO1xyXG5cdFx0XHRcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCAwKTtcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCAxMDApO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gdGhpcy5jb21wdXRlTWluQ3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtaW5XaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCBtaW5XaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG1heFdpZHRoID0gdGhpcy5jb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCk7XHJcblx0XHRcdGlmIChtYXhXaWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCBtYXhXaWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSBNYXRoLm1pbihtYXhXaWR0aCwgd2lkdGgpOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWwuZ2V0KDApLCB3aWR0aCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbXB1dGUgdGhlIG1pbmltdW0gd2lkdGggdGFraW5nIGludG8gYWNjb3VudCBDU1NcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNvbXB1dGVNaW5Dc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1pbmltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWluQ3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtaW5XaWR0aDtcclxuXHRcdG1pbldpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsLmdldCgwKTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMub2JleUNzc01pbldpZHRoKSB7XHJcblx0XHRcdGlmIChlbC5zdHlsZS5taW5XaWR0aC5zbGljZSgtMikgPT09ICdweCcpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0XHRtaW5XaWR0aCA9IChtaW5XaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWluV2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc05hTihtaW5XaWR0aCkpIHtcclxuXHRcdFx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBtaW5XaWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbXB1dGUgdGhlIG1heGltdW0gd2lkdGggdGFraW5nIGludG8gYWNjb3VudCBDU1NcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNvbXB1dGVNYXhDc3NXaWR0aHNcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgZm9yIHdoaWNoIHdlIGNvbXB1dGUgdGhlIG1heGltdW0gd2lkdGhcclxuXHQqKi9cclxuXHRjb21wdXRlTWF4Q3NzV2lkdGhzKCRlbCkge1xyXG5cdFx0bGV0IGVsLCBtYXhXaWR0aDtcclxuXHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdGVsID0gJGVsLmdldCgwKTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMub2JleUNzc01heFdpZHRoKSB7XHJcblx0XHRcdGlmIChlbC5zdHlsZS5tYXhXaWR0aC5zbGljZSgtMikgPT09ICdweCcpIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWF4V2lkdGgpO1xyXG5cdFx0XHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0XHRtYXhXaWR0aCA9IChtYXhXaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IHBhcnNlRmxvYXQoZWwuc3R5bGUubWF4V2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc05hTihtYXhXaWR0aCkpIHtcclxuXHRcdFx0XHRtYXhXaWR0aCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBtYXhXaWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCBjaGVja1RhYmxlV2lkdGhcclxuXHQqKi9cclxuXHRjaGVja1RhYmxlV2lkdGgoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRoaXMuY2hlY2tUYWJsZVdpZHRoQWJzb2x1dGUoKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjaGVja1RhYmxlV2lkdGhBYnNvbHV0ZVxyXG5cdCoqL1xyXG5cdGNoZWNrVGFibGVXaWR0aEFic29sdXRlKCkge1xyXG5cdFx0aWYgKCF0aGlzLnNob3VsZFdyYXAoKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGxldCB3cmFwcHBlcldpZHRoID0gdGhpcy4kdGFibGVXcmFwcGVyLmlubmVyV2lkdGgoKTtcclxuXHRcdGxldCB0YWJsZVdpZHRoID0gdGhpcy4kdGFibGUub3V0ZXJXaWR0aCh0cnVlKTtcclxuXHRcdGxldCBkaWZmZXJlbmNlID0gd3JhcHBwZXJXaWR0aCAtIHRhYmxlV2lkdGg7XHJcblx0XHRpZiAoZGlmZmVyZW5jZSA+IDApIHtcclxuXHRcdFx0bGV0ICRoZWFkZXJzID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XHJcblx0XHRcdGxldCB0b3RhbFdpZHRoID0gMDtcclxuXHRcdFx0bGV0IGFkZGVkV2lkdGggPSAwO1xyXG5cdFx0XHRsZXQgd2lkdGhzID0gW107XHJcblx0XHRcdCRoZWFkZXJzLmVhY2goKGksIGhkKSA9PiB7XHJcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKGhkKTtcclxuXHRcdFx0XHR3aWR0aHMucHVzaCh3aWR0aCk7XHJcblx0XHRcdFx0dG90YWxXaWR0aCArPSB3aWR0aDtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKHRoaXMuJHRhYmxlWzBdLCB3cmFwcHBlcldpZHRoKTtcclxuXHRcdFx0JGhlYWRlcnMuZWFjaCgoaiwgY29sKSA9PiB7XHJcblx0XHRcdFx0bGV0IGN1cnJlbnRXaWR0aCA9IHdpZHRocy5zaGlmdCgpOyBcclxuXHRcdFx0XHRsZXQgbmV3V2lkdGggPSBjdXJyZW50V2lkdGggKyAoKGN1cnJlbnRXaWR0aCAvIHRvdGFsV2lkdGgpICogZGlmZmVyZW5jZSk7XHJcblx0XHRcdFx0bGV0IGxlZnRUb0FkZCA9IHRvdGFsV2lkdGggKyBkaWZmZXJlbmNlIC0gYWRkZWRXaWR0aDtcclxuXHRcdFx0XHR0aGlzLnNldFdpZHRoKGNvbCwgTWF0aC5taW4obmV3V2lkdGgsIGxlZnRUb0FkZCkpO1xyXG5cdFx0XHRcdGFkZGVkV2lkdGggKz0gbmV3V2lkdGg7XHJcblx0XHRcdFx0aWYgKGFkZGVkV2lkdGggPj0gdG90YWxXaWR0aClcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1xyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHMoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRoaXMuc3luY0hhbmRsZVdpZHRoc0Fic29sdXRlKClcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuc3luY0hhbmRsZVdpZHRoc1BlcmNlbnRhZ2UoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNBYnNvbHV0ZVxyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHNBYnNvbHV0ZSgpIHtcclxuXHRcdGxldCAkY29udGFpbmVyID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblxyXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKS5jc3MoJ21pbldpZHRoJywgdGhpcy50b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCAkdGggPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKS5lcShfKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJHRoLm91dGVyV2lkdGgoKVxyXG5cdFx0XHRsZWZ0IC09IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0bGVmdCAtPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpO1xyXG5cdFx0XHRsZWZ0ICs9ICR0aC5vZmZzZXQoKS5sZWZ0O1xyXG5cdFx0XHRsZWZ0IC09IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XHJcblxyXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZVxyXG5cdCoqL1xyXG5cdHN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCAkdGggPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKS5lcShfKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJHRoLm91dGVyV2lkdGgoKSArICgkdGgub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KTtcclxuXHJcblx0XHRcdCRlbC5jc3MoeyBsZWZ0LCBoZWlnaHQgfSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRoc1xyXG5cdFx0XHQ/IHRoaXMudG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpXHJcblx0XHRcdDogdGhpcy50b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGVcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKCkge1xyXG5cdFx0bGV0IHRvdGFsID0gMDtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cdFx0XHR0b3RhbCArPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLndpZHRoKCkpO1xyXG5cdFx0XHR0b3RhbCArPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nUmlnaHQnKSk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRvdGFsO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNQZXJjZW50YWdlXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHNQZXJjZW50YWdlKCkge1xyXG5cdFx0Ly9zaG91bGQgYmUgMTAwJSA6RFxyXG5cdFx0bGV0IHRvdGFsID0gMDtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0dG90YWwgKz0gdGhpcy5wYXJzZVdpZHRoKGVsKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdG90YWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQZXJzaXN0cyB0aGUgY29sdW1uIHdpZHRocyBpbiBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCBzYXZlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0c2F2ZUNvbHVtbldpZHRocygpIHtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnN0b3JlKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldCh0aGlzLmdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCksIHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyArICcnKTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYgKCEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldChcclxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxyXG5cdFx0XHRcdFx0dGhpcy5wYXJzZVdpZHRoKGVsKVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2QgcmVzdG9yZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5zdG9yZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KHRoaXMuZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSkgIT09ICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgKyAnJykpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYoISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KFxyXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbClcclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRpZih3aWR0aCAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKGVsLCB3aWR0aCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCByZWZyZXNoV3JhcHBlclN0eWxlXHJcblx0KiovXHJcblx0cmVmcmVzaFdyYXBwZXJTdHlsZSgpIHtcclxuXHRcdGlmICh0aGlzLiR0YWJsZVdyYXBwZXIgPT0gbnVsbClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRjb25zdCBvcmlnaW5hbFN0eWxlID0gdGhpcy4kdGFibGVXcmFwcGVyLmF0dHIoJ3N0eWxlJyk7IFxyXG5cdFx0dGhpcy4kdGFibGVXcmFwcGVyXHJcblx0XHRcdC5jc3MoJ292ZXJmbG93LXgnLCAnaGlkZGVuOycpXHJcblx0XHRcdC5hdHRyKCdzdHlsZScsIG9yaWdpbmFsU3R5bGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyRG93bihldmVudCkge1xyXG5cdFx0Ly8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcclxuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxyXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXHJcblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XHJcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xyXG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaXNEb3VibGVDbGljayA9IHRoaXMubGFzdFBvaW50ZXJEb3duICE9IG51bGwgJiYgKChuZXcgRGF0ZSgpIC0gdGhpcy5sYXN0UG9pbnRlckRvd24pIDwgdGhpcy5vcHRpb25zLmRvdWJsZUNsaWNrRGVsYXkpO1xyXG5cdFx0dGhpcy5sYXN0UG9pbnRlckRvd24gPSBuZXcgRGF0ZSgpO1xyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSkuZXEoZ3JpcEluZGV4KTtcclxuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKS5lcShncmlwSW5kZXggKyAxKTtcclxuXHJcblx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uLmdldCgwKSk7XHJcblx0XHRsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW4uZ2V0KDApKTtcclxuXHRcdGxldCB0YWJsZVdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKHRoaXMuJHRhYmxlLmdldCgwKSk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSB7XHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcclxuXHJcblx0XHRcdHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXHJcblxyXG5cdFx0XHR3aWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGgsXHJcblx0XHRcdFx0dGFibGU6IHRhYmxlV2lkdGhcclxuXHRcdFx0fSxcclxuXHRcdFx0bmV3V2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoLFxyXG5cdFx0XHRcdHRhYmxlOiB0YWJsZVdpZHRoXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0JGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQoJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcclxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1x0XHRcclxuXHRcdFxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgZG91YmxlIGNsaWNrXHJcblxyXG5cdEBtZXRob2Qgb25Eb3VibGVDbGlja1xyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uRG91YmxlQ2xpY2soZXZlbnQpIHtcclxuXHRcdGlmICghdGhpcy5vcGVyYXRpb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gdGhpcy5vcGVyYXRpb24uJGN1cnJlbnRHcmlwO1xyXG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xyXG5cdFx0bGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSkuZXEoZ3JpcEluZGV4KTtcclxuXHRcdGxldCBsZWZ0ID0gJGxlZnRDb2x1bW4uZ2V0KDApO1xyXG5cdFx0aWYgKCFsZWZ0KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0bGV0IG1heFdpZHRoID0gMDtcclxuXHRcdGxldCBpbmRlY2VzVG9Ta3lwID0gW107XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaWR4LCB0aCkgPT4ge1xyXG5cdFx0XHRpZiAoJCh0aCkuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0aW5kZWNlc1RvU2t5cC5wdXNoKGlkeCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0bGV0ICRmYWtlRWwgPSAkKCc8c3Bhbj4nKS5jc3Moe1xyXG5cdFx0XHQncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxyXG5cdFx0XHQndmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxyXG5cdFx0XHQnbGVmdCc6ICctOTk5OTlweCcsXHJcblx0XHRcdCd0b3AnOiAnLTk5OTk5cHgnXHJcblx0XHR9KTtcclxuXHRcdCQoJ2JvZHknKS5hcHBlbmQoJGZha2VFbCk7XHJcblx0XHR0aGlzLiR0YWJsZS5maW5kKCd0cicpLmVhY2goKGlUciwgdHIpID0+IHtcclxuXHRcdFx0bGV0IHBvcyA9IDA7XHJcblx0XHRcdCQodHIpLmZpbmQoJ3RkLCB0aCcpLmVhY2goKGlDb2wsIGNvbCkgPT4ge1xyXG5cdFx0XHRcdGlmIChpbmRlY2VzVG9Ta3lwLmluZGV4T2YoaUNvbCkgIT09IC0xKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47IC8vIHNreXAgb3ZlciBub3QgcmVzaXphYmxlIGNvbHVtbnNcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bGV0ICRjb2wgPSAkKGNvbCk7XHJcblx0XHRcdFx0aWYgKHBvcyA9PT0gZ3JpcEluZGV4KSB7XHJcblx0XHRcdFx0XHRtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCB0aGlzLmdldFRleHRXaWR0aCgkY29sLCAkZmFrZUVsKSlcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cG9zICs9ICgkY29sLnByb3AoJ2NvbHNwYW4nKSB8fCAxKTtcdFx0XHRcdFx0XHRcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHRcdCRmYWtlRWwucmVtb3ZlKCk7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdGxldCB0YWJsZVdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKHRoaXMuJHRhYmxlWzBdKTtcclxuXHRcdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aChsZWZ0KTtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aCh0aGlzLiR0YWJsZVswXSwgdGFibGVXaWR0aCArIG1heFdpZHRoIC0gbGVmdFdpZHRoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG1heFdpZHRoID0gbWF4V2lkdGggLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zZXRXaWR0aChsZWZ0LCBtYXhXaWR0aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJNb3ZlXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyTW92ZShldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBkZWx0YSBjaGFuZ2UgYmV0d2VlbiBzdGFydCBhbmQgbmV3IG1vdXNlIHBvc2l0aW9uLCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRhYmxlIHdpZHRoXHJcblx0XHRsZXQgZGlmZmVyZW5jZSA9IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpIC0gb3Auc3RhcnRYO1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0ZGlmZmVyZW5jZSA9IChkaWZmZXJlbmNlKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoZGlmZmVyZW5jZSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGxlZnRDb2x1bW4gPSBvcC4kbGVmdENvbHVtbi5nZXQoMCk7XHJcblx0XHRsZXQgcmlnaHRDb2x1bW4gPSBvcC4kcmlnaHRDb2x1bW4uZ2V0KDApO1xyXG5cdFx0bGV0IHRhYmxlID0gdGhpcy4kdGFibGUuZ2V0KDApO1xyXG5cdFx0bGV0IHdpZHRoTGVmdCwgd2lkdGhSaWdodCwgdGFibGVXaWR0aDtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRhYmxlV2lkdGggPSBvcC53aWR0aHMudGFibGUgKyBkaWZmZXJlbmNlO1xyXG5cdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLiRsZWZ0Q29sdW1uLCBvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHR3aWR0aFJpZ2h0ID0gb3Aud2lkdGhzLnJpZ2h0OyAvL0tlZXAgcmlnaHQgY29sdW1uIHVuY2hhbmdlZCB3aGVuIGluY3JlYXNpbmcgdGhlIHRhYmxlIHNpemVcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRhYmxlV2lkdGggPSAxMDA7XHJcblx0XHRcdGlmKGRpZmZlcmVuY2UgPCAwKSB7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC4kbGVmdENvbHVtbiwgb3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC4kcmlnaHRDb2x1bW4sIG9wLndpZHRocy5yaWdodCArIChvcC53aWR0aHMubGVmdCAtIG9wLm5ld1dpZHRocy5sZWZ0KSk7XHJcblx0XHRcdH0gZWxzZSBpZihkaWZmZXJlbmNlID4gMCkge1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3AuJGxlZnRDb2x1bW4sIG9wLndpZHRocy5sZWZ0ICsgKG9wLndpZHRocy5yaWdodCAtIG9wLm5ld1dpZHRocy5yaWdodCkpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLiRyaWdodENvbHVtbiwgb3Aud2lkdGhzLnJpZ2h0IC0gZGlmZmVyZW5jZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGFibGUpIHtcclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRcdHRoaXMuc2V0V2lkdGgodGFibGUsIHRhYmxlV2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYobGVmdENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XHJcblx0XHR9XHJcblx0XHRpZihyaWdodENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKHJpZ2h0Q29sdW1uLCB3aWR0aFJpZ2h0KTtcclxuXHRcdH1cclxuXHJcblx0XHRvcC5uZXdXaWR0aHMubGVmdCA9IHdpZHRoTGVmdDtcclxuXHRcdG9wLm5ld1dpZHRocy5yaWdodCA9IHdpZHRoUmlnaHQ7XHJcblx0XHRvcC5uZXdXaWR0aHMudGFibGUgPSB0YWJsZVdpZHRoO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcclxuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcclxuXHRcdFx0d2lkdGhMZWZ0LCB3aWR0aFJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSByZWxlYXNlIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJVcFxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlclVwKGV2ZW50KSB7XHJcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcclxuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddKTtcclxuXHJcblx0XHRpZiAodGhpcy5pc0RvdWJsZUNsaWNrKXtcclxuXHRcdFx0dGhpcy5vbkRvdWJsZUNsaWNrKGV2ZW50KVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdG9wLiRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy5jaGVja1RhYmxlV2lkdGgoKTtcclxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xyXG5cdFx0dGhpcy5yZWZyZXNoV3JhcHBlclN0eWxlKCk7XHJcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXHJcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxyXG5cclxuXHRAbWV0aG9kIGRlc3Ryb3lcclxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxyXG5cdCoqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XHJcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcclxuXHRcdFx0dGhpcy4kd2luZG93XHJcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxyXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcclxuXHRcdCk7XHJcblxyXG5cdFx0JHRhYmxlLnJlbW92ZURhdGEoREFUQV9BUEkpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdGlmICh0aGlzLiR0YWJsZVdyYXBwZXIgIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLiR0YWJsZS5pbnNlcnRCZWZvcmUodGhpcy4kdGFibGVXcmFwcGVyKTtcclxuXHRcdFx0dGhpcy4kdGFibGVXcmFwcGVyLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlV3JhcHBlciA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGUgPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiAkdGFibGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBiaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIGJpbmQgZXZlbnRzIHRvXHJcblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxyXG5cdEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXHJcblx0QHBhcmFtIFtjYWxsYmFja10ge0Z1bmN0aW9ufSBDYWxsYmFjayBtZXRob2RcclxuXHQqKi9cclxuXHRiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xyXG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcclxuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdW5iaW5kRXZlbnRzXHJcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIHVuYmluZFxyXG5cdCoqL1xyXG5cdHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKGV2ZW50cyAhPSBudWxsKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRldmVudHMgPSB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdCR0YXJnZXQub2ZmKGV2ZW50cyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRUcmlnZ2VycyBhbiBldmVudCBvbiB0aGUgPHRhYmxlLz4gZWxlbWVudCBmb3IgYSBnaXZlbiB0eXBlIHdpdGggZ2l2ZW5cclxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXHJcblx0Z2l2ZW4uIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgdHJpZ2dlcmVkIGV2ZW50LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdHJpZ2dlckV2ZW50XHJcblx0QHBhcmFtIHR5cGUge1N0cmluZ30gRXZlbnQgbmFtZVxyXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxyXG5cdEBwYXJhbSBbb3JpZ2luYWxFdmVudF0gSWYgZ2l2ZW4sIGlzIHNldCBvbiB0aGUgZXZlbnQgb2JqZWN0XHJcblx0QHJldHVybiB7TWl4ZWR9IFJlc3VsdCBvZiB0aGUgZXZlbnQgdHJpZ2dlciBhY3Rpb25cclxuXHQqKi9cclxuXHR0cmlnZ2VyRXZlbnQodHlwZSwgYXJncywgb3JpZ2luYWxFdmVudCkge1xyXG5cdFx0bGV0IGV2ZW50ID0gJC5FdmVudCh0eXBlKTtcclxuXHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudCA9ICQuZXh0ZW5kKHt9LCBvcmlnaW5hbEV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUudHJpZ2dlcihldmVudCwgW3RoaXNdLmNvbmNhdChhcmdzIHx8IFtdKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgY29sdW1uIGVsZW1lbnRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IENvbHVtbiBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlQ29sdW1uSWQoJGVsKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVRhYmxlSWQoKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgSUQgZm9yIGEgdGFibGUncyAoRE9NRWxlbWVudCkgJ2Fic29sdXRlV2lkdGhzJyBvcHRpb25cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkXHJcblx0QHJldHVybiB7U3RyaW5nfSBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKSArICctLWFic29sdXRlLXdpZHRocyc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIElEIGZvciBhIGdpdmVuIHRhYmxlIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlVGFibGVJZFxyXG5cdEByZXR1cm4ge1N0cmluZ30gVGFibGUgSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZVRhYmxlSWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpLnJlcGxhY2UoL1xcLi9nLCAnXycpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxyXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIGdldCB3aWR0aCBvZlxyXG5cdEByZXR1cm4ge051bWJlcn0gRWxlbWVudCdzIHdpZHRoIGFzIGEgZmxvYXRcclxuXHQqKi9cclxuXHRwYXJzZVdpZHRoKGVsZW1lbnQpIHtcclxuXHRcdHJldHVybiBlbGVtZW50ID8gcGFyc2VGbG9hdChlbGVtZW50LnN0eWxlLndpZHRoLnJlcGxhY2UoKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpLCAnJykpIDogMDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFNldHMgdGhlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc2V0V2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gc2V0XHJcblx0KiovXHJcblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcclxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcclxuXHRcdHdpZHRoID0gd2lkdGggPiAwID8gd2lkdGggOiAwO1xyXG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/ICdweCcgOiAnJScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXHJcblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudFxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXHJcblx0KiovXHJcblx0Y29uc3RyYWluV2lkdGgoJGVsLCB3aWR0aCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5taW5XaWR0aCAhPSB1bmRlZmluZWQgfHwgdGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5XaWR0aCwgd2lkdGgsICRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWF4V2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHR3aWR0aCA9IE1hdGgubWF4KDAsIHdpZHRoKTtcclxuIFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyA/IHRoaXMuJHRhYmxlLndpZHRoKCkgOiAxMDAsIHdpZHRoKTtcclxuXHJcblx0XHRyZXR1cm4gd2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcclxuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcclxuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcclxuXHQqKi9cclxuXHRnZXRQb2ludGVyWChldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEdldHMgdGhlIHRleHQgd2lkdGggb2YgYW4gZWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0VGV4dFdpZHRoXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHRleHRcclxuXHRAcGFyYW0gJGZha2VFbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1lYXN1cmUgdGhlIHdpZHRoXHJcblx0QHJldHVybiB7TnVtYmVyfSBUZXh0IHdpZHRoXHJcblx0KiovXHJcblx0Z2V0VGV4dFdpZHRoKCRlbCwgJGZha2VFbCkge1xyXG5cdFx0cmV0dXJuICRmYWtlRWwuY3NzKHtcclxuXHRcdFx0J2ZvbnRGYW1pbHknOiAkZWwuY3NzKCdmb250RmFtaWx5JyksXHJcblx0XHRcdCdmb250U2l6ZSc6ICRlbC5jc3MoJ2ZvbnRTaXplJyksXHJcblx0XHRcdCdmb250V2VpZ2h0JzogJGVsLmNzcygnZm9udFdlaWdodCcpLFxyXG5cdFx0XHQncGFkZGluZyc6ICRlbC5jc3MoJ3BhZGRpbmcnKSxcclxuXHRcdFx0J2JvcmRlcic6ICRlbC5jc3MoJ2JvcmRlcicpfSlcclxuXHRcdC5odG1sKCRlbC50ZXh0KCkucmVwbGFjZSgvXFxzL2csICcmbmJzcDsnKSlcclxuXHRcdC5vdXRlcldpZHRoKHRydWUpO1xyXG5cdH1cclxuXHJcblx0c2hvdWxkV3JhcCgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMud3JhcHBUYWJsZSB8fCB0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHM7XHJcblx0fVxyXG59XHJcblxyXG5SZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzID0ge1xyXG5cdHNlbGVjdG9yOiBmdW5jdGlvbigkdGFibGUpIHtcclxuXHRcdGlmKCR0YWJsZS5maW5kKCd0aGVhZCcpLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gU0VMRUNUT1JfVEg7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFNFTEVDVE9SX1REO1xyXG5cdH0sXHJcblx0c3RvcmU6IHdpbmRvdy5zdG9yZSxcclxuXHRzeW5jSGFuZGxlcnM6IHRydWUsXHJcblx0cmVzaXplRnJvbUJvZHk6IHRydWUsXHJcblx0bWF4V2lkdGg6IG51bGwsXHJcblx0bWluV2lkdGg6IDAuMDEsXHJcblx0b2JleUNzc01pbldpZHRoOiBmYWxzZSxcclxuIFx0b2JleUNzc01heFdpZHRoOiBmYWxzZSxcclxuXHRhYnNvbHV0ZVdpZHRoczogZmFsc2UsXHJcblx0ZG91YmxlQ2xpY2tEZWxheTogNTAwLFxyXG5cdHdyYXBwVGFibGU6IGZhbHNlXHJcbn07XHJcblxyXG5SZXNpemFibGVDb2x1bW5zLmNvdW50ID0gMDtcclxuIiwiZXhwb3J0IGNvbnN0IERBVEFfQVBJID0gJ3Jlc2l6YWJsZUNvbHVtbnMnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZUNvbHVtbnNJZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGVDb2x1bW5JZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NSU5fV0lEVEggPSAnY3NzTWluV2lkdGgnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUFYX1dJRFRIID0gJ2Nzc01heFdpZHRoJztcclxuXHJcbmV4cG9ydCBjb25zdCBDTEFTU19BQlNPTFVURSA9ICdyYy1hYnNvbHV0ZSc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9SRVNJWklORyA9ICdyYy10YWJsZS1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFX0NPTlRBSU5FUiA9ICdyYy1oYW5kbGUtY29udGFpbmVyJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1dSQVBQRVIgPSAncmMtdGFibGUtd3JhcHBlcic7XHJcblxyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFID0gJ2NvbHVtbjpyZXNpemUnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUT1AgPSAnY29sdW1uOnJlc2l6ZTpzdG9wJztcclxuXHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9USCA9ICd0cjpmaXJzdCA+IHRoOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEQgPSAndHI6Zmlyc3QgPiB0ZDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XHJcblxyXG5leHBvcnQgY29uc3QgQVRUUklCVVRFX1VOUkVTSVpBQkxFID0gJ2RhdGEtbm9yZXNpemUnO1xyXG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il19
