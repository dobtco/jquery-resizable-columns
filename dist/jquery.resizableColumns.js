/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sun Oct 16 2016 16:22:54 GMT+0300 (GTB Summer Time)
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
			if (!this.options.wrappTable) {
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

			if (!this.options.wrappTable) {
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0NqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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RyxXQUFXLENBQUM7O0FBQ2pDLElBQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7O0FBQ3JELElBQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7OztBQUUvQyxJQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDOztBQUNqRCxJQUFNLFlBQVksR0FBRyxlQUFlLENBQUM7O0FBQ3JDLElBQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sb0JBQW9CLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUM7Ozs7Ozs7Ozs7OztxQkNyQnhCLFNBQVM7Ozs7dUJBQ2xCLFdBQVciLCJmaWxlIjoianF1ZXJ5LnJlc2l6YWJsZUNvbHVtbnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBSZXNpemFibGVDb2x1bW5zIGZyb20gJy4vY2xhc3MnO1xyXG5pbXBvcnQge0RBVEFfQVBJfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG4kLmZuLnJlc2l6YWJsZUNvbHVtbnMgPSBmdW5jdGlvbihvcHRpb25zT3JNZXRob2QsIC4uLmFyZ3MpIHtcclxuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XHJcblxyXG5cdFx0bGV0IGFwaSA9ICR0YWJsZS5kYXRhKERBVEFfQVBJKTtcclxuXHRcdGlmICghYXBpKSB7XHJcblx0XHRcdGFwaSA9IG5ldyBSZXNpemFibGVDb2x1bW5zKCR0YWJsZSwgb3B0aW9uc09yTWV0aG9kKTtcclxuXHRcdFx0JHRhYmxlLmRhdGEoREFUQV9BUEksIGFwaSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnNPck1ldGhvZCA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG5cclxuJC5yZXNpemFibGVDb2x1bW5zID0gUmVzaXphYmxlQ29sdW1ucztcclxuIiwiaW1wb3J0IHtcclxuXHRBVFRSSUJVVEVfVU5SRVNJWkFCTEUsXHJcblx0REFUQV9BUEksXHJcblx0REFUQV9DT0xVTU5TX0lELFxyXG5cdERBVEFfQ09MVU1OX0lELFxyXG5cdERBVEFfQ1NTX01JTl9XSURUSCxcclxuXHREQVRBX0NTU19NQVhfV0lEVEgsXHJcblx0Q0xBU1NfQUJTT0xVVEUsXHJcblx0Q0xBU1NfVEFCTEVfUkVTSVpJTkcsXHJcblx0Q0xBU1NfQ09MVU1OX1JFU0laSU5HLFxyXG5cdENMQVNTX0hBTkRMRSxcclxuXHRDTEFTU19IQU5ETEVfQ09OVEFJTkVSLFxyXG5cdENMQVNTX1RBQkxFX1dSQVBQRVIsXHJcblx0RVZFTlRfUkVTSVpFX1NUQVJULFxyXG5cdEVWRU5UX1JFU0laRSxcclxuXHRFVkVOVF9SRVNJWkVfU1RPUCxcclxuXHRTRUxFQ1RPUl9USCxcclxuXHRTRUxFQ1RPUl9URCxcclxuXHRTRUxFQ1RPUl9VTlJFU0laQUJMRVxyXG59XHJcbmZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG5UYWtlcyBhIDx0YWJsZSAvPiBlbGVtZW50IGFuZCBtYWtlcyBpdCdzIGNvbHVtbnMgcmVzaXphYmxlIGFjcm9zcyBib3RoXHJcbm1vYmlsZSBhbmQgZGVza3RvcCBjbGllbnRzLlxyXG5cclxuQGNsYXNzIFJlc2l6YWJsZUNvbHVtbnNcclxuQHBhcmFtICR0YWJsZSB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnQgdG8gbWFrZSByZXNpemFibGVcclxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcclxuKiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZUNvbHVtbnMge1xyXG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xyXG5cdFx0dGhpcy5ucyA9ICcucmMnICsgdGhpcy5jb3VudCsrO1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGUuZ2V0KDApLm93bmVyRG9jdW1lbnQpO1xyXG5cdFx0dGhpcy4kdGFibGUgPSAkdGFibGU7XHJcblx0XHR0aGlzLiR0YWJsZVdyYXBwZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5sYXN0UG9pbnRlckRvd24gPSBudWxsO1xyXG5cdFx0dGhpcy5pc0RvdWJsZUNsaWNrID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy53cmFwVGFibGUoKTtcclxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcclxuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xyXG5cdFx0dGhpcy5jaGVja1RhYmxlV2lkdGgoKTtcclxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLmNoZWNrVGFibGVXaWR0aC5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLnN5bmNIYW5kbGVXaWR0aHMuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdGFydCkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVEFSVCwgdGhpcy5vcHRpb25zLnN0YXJ0KTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVzaXplKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFLCB0aGlzLm9wdGlvbnMucmVzaXplKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcCkge1xyXG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVE9QLCB0aGlzLm9wdGlvbnMuc3RvcCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRXcmFwIHRoZSB0YWJsZSBET01FbGVtZW50IGluIGEgZGl2XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xyXG5cdCoqL1xyXG5cdHdyYXBUYWJsZSgpIHtcclxuXHRcdGlmKCF0aGlzLm9wdGlvbnMud3JhcHBUYWJsZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy4kdGFibGVXcmFwcGVyID0gdGhpcy4kdGFibGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0LndyYXAoYDxkaXYgY2xhc3M9XCIke0NMQVNTX1RBQkxFX1dSQVBQRVJ9XCI+PC9kaXY+YClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LndpZHRoKHRoaXMuJHRhYmxlLmlubmVyV2lkdGgoKSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnBhcmVudCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmVmcmVzaGVzIHRoZSBoZWFkZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGluc3RhbmNlcyA8dGFibGUvPiBlbGVtZW50IGFuZFxyXG5cdGdlbmVyYXRlcyBoYW5kbGVzIGZvciB0aGVtLiBBbHNvIGFzc2lnbnMgd2lkdGhzLlxyXG5cclxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXHJcblx0KiovXHJcblx0cmVmcmVzaEhlYWRlcnMoKSB7XHJcblx0XHQvLyBBbGxvdyB0aGUgc2VsZWN0b3IgdG8gYmUgYm90aCBhIHJlZ3VsYXIgc2VsY3RvciBzdHJpbmcgYXMgd2VsbCBhc1xyXG5cdFx0Ly8gYSBkeW5hbWljIGNhbGxiYWNrXHJcblx0XHRsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XHJcblx0XHRpZih0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xyXG5cclxuXHRcdC8vIEFzc2lnbiB3aWR0aHMgZmlyc3QsIHRoZW4gY3JlYXRlIGRyYWcgaGFuZGxlc1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLmFzc2lnbkFic29sdXRlV2lkdGhzKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuY3JlYXRlSGFuZGxlcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xyXG5cclxuXHRAbWV0aG9kIGNyZWF0ZUhhbmRsZXNcclxuXHQqKi9cclxuXHRjcmVhdGVIYW5kbGVzKCkge1xyXG5cdFx0bGV0IHJlZiA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lcjtcclxuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xyXG5cdFx0XHRyZWYucmVtb3ZlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIuYWRkQ2xhc3MoQ0xBU1NfQUJTT0xVVEUpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy4kdGFibGUuYmVmb3JlKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkY3VycmVudCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpKTtcclxuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpe1xyXG5cdFx0XHRcdGlmICgkY3VycmVudC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKCRuZXh0Lmxlbmd0aCA9PT0gMCB8fCAkY3VycmVudC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkgfHwgJG5leHQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgJGhhbmRsZSA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFfScgLz5gKVxyXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJGhhbmRsZUNvbnRhaW5lciwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCAnLicrQ0xBU1NfSEFORExFLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRBc3NpZ25zIGEgYWJzb2x1dGUgd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCB3aWR0aChzKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYXNzaWduQWJzb2x1dGVXaWR0aHNcclxuXHQqKi9cclxuXHRhc3NpZ25BYnNvbHV0ZVdpZHRocygpIHtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHQvLyBkbyBub3QgYXNzaWduIHdpZHRoIGlmIHRoZSBjb2x1bW4gaXMgbm90IHJlc2l6YWJsZVxyXG5cdFx0XHRpZiAoZWwuaGFzQXR0cmlidXRlKEFUVFJJQlVURV9VTlJFU0laQUJMRSkpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpLFxyXG5cdFx0XHRcdHRhYmxlV2lkdGggPSB0aGlzLiR0YWJsZS53aWR0aCgpLFxyXG5cdFx0XHRcdHBhZGRpbmdMZWZ0ID0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdMZWZ0JykpLFxyXG5cdFx0XHRcdHBhZGRpbmdSaWdodCA9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nUmlnaHQnKSksXHJcblx0XHRcdFx0d2lkdGggPSAoJGVsLm91dGVyV2lkdGgoKSAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0KTtcclxuXHRcdFx0XHJcblx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCwgMCk7XHJcblx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCwgdGFibGVXaWR0aCk7XHJcblxyXG5cdFx0XHRsZXQgbWluV2lkdGggPSB0aGlzLmNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1pbldpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIG1pbldpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWF4KG1pbldpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgbWF4V2lkdGggPSB0aGlzLmNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1heFdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIG1heFdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbC5nZXQoMCksIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlIHRoZSB2YWx1ZSBvZiBhIHN0cmluZyBieSByZW1vdmluZyAncHgnXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBwYXJzZVBpeGVsU3RyaW5nXHJcblx0QHBhcmFtIHZhbHVlIHtTdHJpbmd9XHJcblx0QHJldHVybiB7TnVtYmVyfSBQYXJzZWQgdmFsdWUgb3IgMFxyXG5cdCoqL1xyXG5cdHN0YXRpYyBwYXJzZVBpeGVsU3RyaW5nKHZhbHVlKSB7XHJcblx0XHRsZXQgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cdFx0XHJcblx0XHRpZiAodmFsdWVUeXBlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRsZXQgdiA9IHZhbHVlLnJlcGxhY2UoJ3B4JywgJycpLFxyXG5cdFx0XHRcdG4gPSBwYXJzZUZsb2F0KHYpO1xyXG5cdFx0XHRpZiAoIWlzTmFOKG4pKSB7XHJcblx0XHRcdFx0cmV0dXJuIG47XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYgKHZhbHVlVHlwZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0Ly8gZG8gbm90IGFzc2lnbiB3aWR0aCBpZiB0aGUgY29sdW1uIGlzIG5vdCByZXNpemFibGVcclxuXHRcdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShBVFRSSUJVVEVfVU5SRVNJWkFCTEUpKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSkgKiAxMDA7XHJcblx0XHRcdFxyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIDApO1xyXG5cdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIDEwMCk7XHJcblxyXG5cdFx0XHRsZXQgbWluV2lkdGggPSB0aGlzLmNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1pbldpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgsIG1pbldpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWF4KG1pbldpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgbWF4V2lkdGggPSB0aGlzLmNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKTtcclxuXHRcdFx0aWYgKG1heFdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHQkZWwuZGF0YShEQVRBX0NTU19NQVhfV0lEVEgsIG1heFdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCB3aWR0aCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNldFdpZHRoKCRlbC5nZXQoMCksIHdpZHRoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aCB0YWtpbmcgaW50byBhY2NvdW50IENTU1xyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29tcHV0ZU1pbkNzc1dpZHRoc1xyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCBmb3Igd2hpY2ggd2UgY29tcHV0ZSB0aGUgbWluaW11bSB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbXB1dGVNaW5Dc3NXaWR0aHMoJGVsKSB7XHJcblx0XHRsZXQgZWwsIG1pbldpZHRoO1xyXG5cdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0ZWwgPSAkZWwuZ2V0KDApO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWluV2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1pbldpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5taW5XaWR0aCk7XHJcblx0XHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0XHRcdG1pbldpZHRoID0gKG1pbldpZHRoIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5taW5XaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1pbldpZHRoKSkge1xyXG5cdFx0XHRcdG1pbldpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1pbldpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29tcHV0ZSB0aGUgbWF4aW11bSB3aWR0aCB0YWtpbmcgaW50byBhY2NvdW50IENTU1xyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29tcHV0ZU1heENzc1dpZHRoc1xyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCBmb3Igd2hpY2ggd2UgY29tcHV0ZSB0aGUgbWF4aW11bSB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbXB1dGVNYXhDc3NXaWR0aHMoJGVsKSB7XHJcblx0XHRsZXQgZWwsIG1heFdpZHRoO1xyXG5cdFx0bWF4V2lkdGggPSBudWxsO1xyXG5cdFx0ZWwgPSAkZWwuZ2V0KDApO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5vYmV5Q3NzTWF4V2lkdGgpIHtcclxuXHRcdFx0aWYgKGVsLnN0eWxlLm1heFdpZHRoLnNsaWNlKC0yKSA9PT0gJ3B4Jykge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0XHRcdG1heFdpZHRoID0gKG1heFdpZHRoIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gcGFyc2VGbG9hdChlbC5zdHlsZS5tYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzTmFOKG1heFdpZHRoKSkge1xyXG5cdFx0XHRcdG1heFdpZHRoID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1heFdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIGNoZWNrVGFibGVXaWR0aFxyXG5cdCoqL1xyXG5cdGNoZWNrVGFibGVXaWR0aCgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5jaGVja1RhYmxlV2lkdGhBYnNvbHV0ZSgpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNoZWNrVGFibGVXaWR0aEFic29sdXRlXHJcblx0KiovXHJcblx0Y2hlY2tUYWJsZVdpZHRoQWJzb2x1dGUoKSB7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy53cmFwcFRhYmxlKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0bGV0IHdyYXBwcGVyV2lkdGggPSB0aGlzLiR0YWJsZVdyYXBwZXIuaW5uZXJXaWR0aCgpO1xyXG5cdFx0bGV0IHRhYmxlV2lkdGggPSB0aGlzLiR0YWJsZS5vdXRlcldpZHRoKHRydWUpO1xyXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSB3cmFwcHBlcldpZHRoIC0gdGFibGVXaWR0aDtcclxuXHRcdGlmIChkaWZmZXJlbmNlID4gMCkge1xyXG5cdFx0XHRsZXQgJGhlYWRlcnMgPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcclxuXHRcdFx0bGV0IHRvdGFsV2lkdGggPSAwO1xyXG5cdFx0XHRsZXQgYWRkZWRXaWR0aCA9IDA7XHJcblx0XHRcdGxldCB3aWR0aHMgPSBbXTtcclxuXHRcdFx0JGhlYWRlcnMuZWFjaCgoaSwgaGQpID0+IHtcclxuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoaGQpO1xyXG5cdFx0XHRcdHdpZHRocy5wdXNoKHdpZHRoKTtcclxuXHRcdFx0XHR0b3RhbFdpZHRoICs9IHdpZHRoO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuc2V0V2lkdGgodGhpcy4kdGFibGVbMF0sIHdyYXBwcGVyV2lkdGgpO1xyXG5cdFx0XHQkaGVhZGVycy5lYWNoKChqLCBjb2wpID0+IHtcclxuXHRcdFx0XHRsZXQgY3VycmVudFdpZHRoID0gd2lkdGhzLnNoaWZ0KCk7IFxyXG5cdFx0XHRcdGxldCBuZXdXaWR0aCA9IGN1cnJlbnRXaWR0aCArICgoY3VycmVudFdpZHRoIC8gdG90YWxXaWR0aCkgKiBkaWZmZXJlbmNlKTtcclxuXHRcdFx0XHRsZXQgbGVmdFRvQWRkID0gdG90YWxXaWR0aCArIGRpZmZlcmVuY2UgLSBhZGRlZFdpZHRoO1xyXG5cdFx0XHRcdHRoaXMuc2V0V2lkdGgoY29sLCBNYXRoLm1pbihuZXdXaWR0aCwgbGVmdFRvQWRkKSk7XHJcblx0XHRcdFx0YWRkZWRXaWR0aCArPSBuZXdXaWR0aDtcclxuXHRcdFx0XHRpZiAoYWRkZWRXaWR0aCA+PSB0b3RhbFdpZHRoKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzXHJcblx0KiovXHJcblx0c3luY0hhbmRsZVdpZHRocygpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGUoKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc0Fic29sdXRlXHJcblx0KiovXHJcblx0c3luY0hhbmRsZVdpZHRoc0Fic29sdXRlKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpLmNzcygnbWluV2lkdGgnLCB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKSk7XHJcblxyXG5cdFx0JGNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHkgP1xyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xyXG5cclxuXHRcdFx0bGV0ICR0aCA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpLmVxKF8pO1xyXG5cclxuXHRcdFx0bGV0IGxlZnQgPSAkdGgub3V0ZXJXaWR0aCgpXHJcblx0XHRcdGxlZnQgLT0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdMZWZ0JykpO1xyXG5cdFx0XHRsZWZ0IC09IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nUmlnaHQnKSk7XHJcblx0XHRcdGxlZnQgKz0gJHRoLm9mZnNldCgpLmxlZnQ7XHJcblx0XHRcdGxlZnQgLT0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnRcclxuXHJcblx0XHRcdCRlbC5jc3MoeyBsZWZ0LCBoZWlnaHQgfSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlXHJcblx0KiovXHJcblx0c3luY0hhbmRsZVdpZHRoc1BlcmNlbnRhZ2UoKSB7XHJcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cclxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSk7XHJcblxyXG5cdFx0JGNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHkgP1xyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xyXG5cclxuXHRcdFx0bGV0ICR0aCA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpLmVxKF8pO1xyXG5cclxuXHRcdFx0bGV0IGxlZnQgPSAkdGgub3V0ZXJXaWR0aCgpICsgKCR0aC5vZmZzZXQoKS5sZWZ0IC0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLm9mZnNldCgpLmxlZnQpO1xyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzXHJcblx0XHRcdD8gdGhpcy50b3RhbENvbHVtbldpZHRoc0Fic29sdXRlKClcclxuXHRcdFx0OiB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzUGVyY2VudGFnZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZVxyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwud2lkdGgoKSk7XHJcblx0XHRcdHRvdGFsICs9IFJlc2l6YWJsZUNvbHVtbnMucGFyc2VQaXhlbFN0cmluZygkZWwuY3NzKCdwYWRkaW5nTGVmdCcpKTtcclxuXHRcdFx0dG90YWwgKz0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdG90YWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2VcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRoc1BlcmNlbnRhZ2UoKSB7XHJcblx0XHQvL3Nob3VsZCBiZSAxMDAlIDpEXHJcblx0XHRsZXQgdG90YWwgPSAwO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHR0b3RhbCArPSB0aGlzLnBhcnNlV2lkdGgoZWwpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0b3RhbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHNhdmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRzYXZlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuc3RvcmUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KHRoaXMuZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSwgdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzICsgJycpO1xyXG5cdFx0XHRcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZiAoISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxyXG5cdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbCksXHJcblx0XHRcdFx0XHR0aGlzLnBhcnNlV2lkdGgoZWwpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcclxuXHJcblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXHJcblx0KiovXHJcblx0cmVzdG9yZUNvbHVtbldpZHRocygpIHtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnN0b3JlKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZS5nZXQodGhpcy5nZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpKSAhPT0gKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyArICcnKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRpZighJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMub3B0aW9ucy5zdG9yZS5nZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHJlZnJlc2hXcmFwcGVyU3R5bGVcclxuXHQqKi9cclxuXHRyZWZyZXNoV3JhcHBlclN0eWxlKCkge1xyXG5cdFx0aWYgKHRoaXMuJHRhYmxlV3JhcHBlciA9PSBudWxsKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdGNvbnN0IG9yaWdpbmFsU3R5bGUgPSB0aGlzLiR0YWJsZVdyYXBwZXIuYXR0cignc3R5bGUnKTsgXHJcblx0XHR0aGlzLiR0YWJsZVdyYXBwZXJcclxuXHRcdFx0LmNzcygnb3ZlcmZsb3cteCcsICdoaWRkZW47JylcclxuXHRcdFx0LmF0dHIoJ3N0eWxlJywgb3JpZ2luYWxTdHlsZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIGRvd24gaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlckRvd25cclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJEb3duKGV2ZW50KSB7XHJcblx0XHQvLyBPbmx5IGFwcGxpZXMgdG8gbGVmdC1jbGljayBkcmFnZ2luZ1xyXG5cdFx0aWYoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gSWYgYSBwcmV2aW91cyBvcGVyYXRpb24gaXMgZGVmaW5lZCwgd2UgbWlzc2VkIHRoZSBsYXN0IG1vdXNldXAuXHJcblx0XHQvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cclxuXHRcdC8vIFdlJ2xsIHNpbXVsYXRlIGEgcG9pbnRlcnVwIGhlcmUgcHJpb3IgdG8gaXRcclxuXHRcdGlmKHRoaXMub3BlcmF0aW9uKSB7XHJcblx0XHRcdHRoaXMub25Qb2ludGVyVXAoZXZlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIElnbm9yZSBub24tcmVzaXphYmxlIGNvbHVtbnNcclxuXHRcdGxldCAkY3VycmVudEdyaXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xyXG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5pc0RvdWJsZUNsaWNrID0gdGhpcy5sYXN0UG9pbnRlckRvd24gIT0gbnVsbCAmJiAoKG5ldyBEYXRlKCkgLSB0aGlzLmxhc3RQb2ludGVyRG93bikgPCB0aGlzLm9wdGlvbnMuZG91YmxlQ2xpY2tEZWxheSk7XHJcblx0XHR0aGlzLmxhc3RQb2ludGVyRG93biA9IG5ldyBEYXRlKCk7XHJcblx0XHRsZXQgZ3JpcEluZGV4ID0gJGN1cnJlbnRHcmlwLmluZGV4KCk7XHJcblx0XHRsZXQgJGxlZnRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKS5lcShncmlwSW5kZXgpO1xyXG5cdFx0bGV0ICRyaWdodENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpLmVxKGdyaXBJbmRleCArIDEpO1xyXG5cclxuXHRcdGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJGxlZnRDb2x1bW4uZ2V0KDApKTtcclxuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtbi5nZXQoMCkpO1xyXG5cdFx0bGV0IHRhYmxlV2lkdGggPSB0aGlzLnBhcnNlV2lkdGgodGhpcy4kdGFibGUuZ2V0KDApKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IHtcclxuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbiwgJGN1cnJlbnRHcmlwLFxyXG5cclxuXHRcdFx0c3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcclxuXHJcblx0XHRcdHdpZHRoczoge1xyXG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcclxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aCxcclxuXHRcdFx0XHR0YWJsZTogdGFibGVXaWR0aFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRuZXdXaWR0aHM6IHtcclxuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXHJcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGgsXHJcblx0XHRcdFx0dGFibGU6IHRhYmxlV2lkdGhcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10sIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0LmFkZENsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcclxuXHJcblx0XHQkbGVmdENvbHVtblxyXG5cdFx0XHQuYWRkKCRyaWdodENvbHVtbilcclxuXHRcdFx0LmFkZCgkY3VycmVudEdyaXApXHJcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xyXG5cclxuXHRcdHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVEFSVCwgW1xyXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHRsZWZ0V2lkdGgsIHJpZ2h0V2lkdGhcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHRcdFxyXG5cdFx0XHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3VibGUgY2xpY2tcclxuXHJcblx0QG1ldGhvZCBvbkRvdWJsZUNsaWNrXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Eb3VibGVDbGljayhldmVudCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wZXJhdGlvbilcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdGxldCAkY3VycmVudEdyaXAgPSB0aGlzLm9wZXJhdGlvbi4kY3VycmVudEdyaXA7XHJcblx0XHRpZigkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgZ3JpcEluZGV4ID0gJGN1cnJlbnRHcmlwLmluZGV4KCk7XHJcblx0XHRsZXQgJGxlZnRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKS5lcShncmlwSW5kZXgpO1xyXG5cdFx0bGV0IGxlZnQgPSAkbGVmdENvbHVtbi5nZXQoMCk7XHJcblx0XHRpZiAoIWxlZnQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRsZXQgbWF4V2lkdGggPSAwO1xyXG5cdFx0bGV0IGluZGVjZXNUb1NreXAgPSBbXTtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpZHgsIHRoKSA9PiB7XHJcblx0XHRcdGlmICgkKHRoKS5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRpbmRlY2VzVG9Ta3lwLnB1c2goaWR4KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRsZXQgJGZha2VFbCA9ICQoJzxzcGFuPicpLmNzcyh7XHJcblx0XHRcdCdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcblx0XHRcdCd2aXNpYmlsaXR5JzogJ2hpZGRlbicsXHJcblx0XHRcdCdsZWZ0JzogJy05OTk5OXB4JyxcclxuXHRcdFx0J3RvcCc6ICctOTk5OTlweCdcclxuXHRcdH0pO1xyXG5cdFx0JCgnYm9keScpLmFwcGVuZCgkZmFrZUVsKTtcclxuXHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RyJykuZWFjaCgoaVRyLCB0cikgPT4ge1xyXG5cdFx0XHRsZXQgcG9zID0gMDtcclxuXHRcdFx0JCh0cikuZmluZCgndGQsIHRoJykuZWFjaCgoaUNvbCwgY29sKSA9PiB7XHJcblx0XHRcdFx0aWYgKGluZGVjZXNUb1NreXAuaW5kZXhPZihpQ29sKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdHJldHVybjsgLy8gc2t5cCBvdmVyIG5vdCByZXNpemFibGUgY29sdW1uc1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRsZXQgJGNvbCA9ICQoY29sKTtcclxuXHRcdFx0XHRpZiAocG9zID09PSBncmlwSW5kZXgpIHtcclxuXHRcdFx0XHRcdG1heFdpZHRoID0gTWF0aC5tYXgobWF4V2lkdGgsIHRoaXMuZ2V0VGV4dFdpZHRoKCRjb2wsICRmYWtlRWwpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRwb3MgKz0gKCRjb2wucHJvcCgnY29sc3BhbicpIHx8IDEpO1x0XHRcdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0JGZha2VFbC5yZW1vdmUoKTtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0bGV0IHRhYmxlV2lkdGggPSB0aGlzLnBhcnNlV2lkdGgodGhpcy4kdGFibGVbMF0pO1xyXG5cdFx0XHRsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKGxlZnQpO1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKHRoaXMuJHRhYmxlWzBdLCB0YWJsZVdpZHRoICsgbWF4V2lkdGggLSBsZWZ0V2lkdGgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bWF4V2lkdGggPSBtYXhXaWR0aCAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XHJcblx0XHR9XHJcblx0XHR0aGlzLnNldFdpZHRoKGxlZnQsIG1heFdpZHRoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgbW92ZW1lbnQgaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlck1vdmVcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XHJcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcclxuXHRcdGlmKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIGNoYW5nZSBiZXR3ZWVuIHN0YXJ0IGFuZCBuZXcgbW91c2UgcG9zaXRpb24sIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdGFibGUgd2lkdGhcclxuXHRcdGxldCBkaWZmZXJlbmNlID0gdGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFg7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRkaWZmZXJlbmNlID0gKGRpZmZlcmVuY2UpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcclxuXHRcdH1cclxuXHJcblx0XHRpZihkaWZmZXJlbmNlID09PSAwKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uLmdldCgwKTtcclxuXHRcdGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtbi5nZXQoMCk7XHJcblx0XHRsZXQgdGFibGUgPSB0aGlzLiR0YWJsZS5nZXQoMCk7XHJcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0LCB0YWJsZVdpZHRoO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0dGFibGVXaWR0aCA9IG9wLndpZHRocy50YWJsZSArIGRpZmZlcmVuY2U7XHJcblx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3AuJGxlZnRDb2x1bW4sIG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdHdpZHRoUmlnaHQgPSBvcC53aWR0aHMucmlnaHQ7IC8vS2VlcCByaWdodCBjb2x1bW4gdW5jaGFuZ2VkIHdoZW4gaW5jcmVhc2luZyB0aGUgdGFibGUgc2l6ZVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGFibGVXaWR0aCA9IDEwMDtcclxuXHRcdFx0aWYoZGlmZmVyZW5jZSA8IDApIHtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLiRsZWZ0Q29sdW1uLCBvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLiRyaWdodENvbHVtbiwgb3Aud2lkdGhzLnJpZ2h0ICsgKG9wLndpZHRocy5sZWZ0IC0gb3AubmV3V2lkdGhzLmxlZnQpKTtcclxuXHRcdFx0fSBlbHNlIGlmKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC4kbGVmdENvbHVtbiwgb3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3AuJHJpZ2h0Q29sdW1uLCBvcC53aWR0aHMucmlnaHQgLSBkaWZmZXJlbmNlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0YWJsZSkge1xyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdFx0dGhpcy5zZXRXaWR0aCh0YWJsZSwgdGFibGVXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZihsZWZ0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgobGVmdENvbHVtbiwgd2lkdGhMZWZ0KTtcclxuXHRcdH1cclxuXHRcdGlmKHJpZ2h0Q29sdW1uKSB7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgocmlnaHRDb2x1bW4sIHdpZHRoUmlnaHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9wLm5ld1dpZHRocy5sZWZ0ID0gd2lkdGhMZWZ0O1xyXG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcclxuXHRcdG9wLm5ld1dpZHRocy50YWJsZSA9IHRhYmxlV2lkdGg7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRSwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHR3aWR0aExlZnQsIHdpZHRoUmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlclVwXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyVXAoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzRG91YmxlQ2xpY2spe1xyXG5cdFx0XHR0aGlzLm9uRG91YmxlQ2xpY2soZXZlbnQpXHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XHJcblxyXG5cdFx0b3AuJGxlZnRDb2x1bW5cclxuXHRcdFx0LmFkZChvcC4kcmlnaHRDb2x1bW4pXHJcblx0XHRcdC5hZGQob3AuJGN1cnJlbnRHcmlwKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcclxuXHJcblx0XHR0aGlzLmNoZWNrVGFibGVXaWR0aCgpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblx0XHR0aGlzLnJlZnJlc2hXcmFwcGVyU3R5bGUoKTtcclxuXHRcdHRoaXMuc2F2ZUNvbHVtbldpZHRocygpO1xyXG5cclxuXHRcdHRoaXMub3BlcmF0aW9uID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUT1AsIFtcclxuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcclxuXHRcdFx0b3AubmV3V2lkdGhzLmxlZnQsIG9wLm5ld1dpZHRocy5yaWdodFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycywgZGF0YSwgYW5kIGFkZGVkIERPTSBlbGVtZW50cy4gVGFrZXNcclxuXHR0aGUgPHRhYmxlLz4gZWxlbWVudCBiYWNrIHRvIGhvdyBpdCB3YXMsIGFuZCByZXR1cm5zIGl0XHJcblxyXG5cdEBtZXRob2QgZGVzdHJveVxyXG5cdEByZXR1cm4ge2pRdWVyeX0gT3JpZ2luYWwgalF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50XHJcblx0KiovXHJcblx0ZGVzdHJveSgpIHtcclxuXHRcdGxldCAkdGFibGUgPSB0aGlzLiR0YWJsZTtcclxuXHRcdGxldCAkaGFuZGxlcyA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5maW5kKCcuJytDTEFTU19IQU5ETEUpO1xyXG5cclxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKFxyXG5cdFx0XHR0aGlzLiR3aW5kb3dcclxuXHRcdFx0XHQuYWRkKHRoaXMuJG93bmVyRG9jdW1lbnQpXHJcblx0XHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0XHQuYWRkKCRoYW5kbGVzKVxyXG5cdFx0KTtcclxuXHJcblx0XHQkdGFibGUucmVtb3ZlRGF0YShEQVRBX0FQSSk7XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLnJlbW92ZSgpO1xyXG5cdFx0aWYgKHRoaXMuJHRhYmxlV3JhcHBlciAhPSBudWxsKSB7XHJcblx0XHRcdHRoaXMuJHRhYmxlLmluc2VydEJlZm9yZSh0aGlzLiR0YWJsZVdyYXBwZXIpO1xyXG5cdFx0XHR0aGlzLiR0YWJsZVdyYXBwZXIucmVtb3ZlKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGVXcmFwcGVyID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZSA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuICR0YWJsZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEJpbmRzIGdpdmVuIGV2ZW50cyBmb3IgdGhpcyBpbnN0YW5jZSB0byB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGJpbmRFdmVudHNcclxuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byBiaW5kXHJcblx0QHBhcmFtIHNlbGVjdG9yT3JDYWxsYmFjayB7U3RyaW5nfEZ1bmN0aW9ufSBTZWxlY3RvciBzdHJpbmcgb3IgY2FsbGJhY2tcclxuXHRAcGFyYW0gW2NhbGxiYWNrXSB7RnVuY3Rpb259IENhbGxiYWNrIG1ldGhvZFxyXG5cdCoqL1xyXG5cdGJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMykge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjayk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRVbmJpbmRzIGV2ZW50cyBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB1bmJpbmRFdmVudHNcclxuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gdW5iaW5kIGV2ZW50cyBmcm9tXHJcblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gdW5iaW5kXHJcblx0KiovXHJcblx0dW5iaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cykge1xyXG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoZXZlbnRzICE9IG51bGwpIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGV2ZW50cyA9IHRoaXMubnM7XHJcblx0XHR9XHJcblxyXG5cdFx0JHRhcmdldC5vZmYoZXZlbnRzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxyXG5cdGFyZ3VtZW50cywgYWxzbyBzZXR0aW5nIGFuZCBhbGxvd2luZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsRXZlbnQgaWZcclxuXHRnaXZlbi4gUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSB0cmlnZ2VyZWQgZXZlbnQuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0cmlnZ2VyRXZlbnRcclxuXHRAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXHJcblx0QHBhcmFtIGFyZ3Mge0FycmF5fSBBcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyB0aHJvdWdoXHJcblx0QHBhcmFtIFtvcmlnaW5hbEV2ZW50XSBJZiBnaXZlbiwgaXMgc2V0IG9uIHRoZSBldmVudCBvYmplY3RcclxuXHRAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxyXG5cdCoqL1xyXG5cdHRyaWdnZXJFdmVudCh0eXBlLCBhcmdzLCBvcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xyXG5cdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCkge1xyXG5cdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgY29sdW1uIElEIGZvciBhIGdpdmVuIGNvbHVtbiBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZUNvbHVtbklkXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBjb2x1bW4gZWxlbWVudFxyXG5cdEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXHJcblx0KiovXHJcblx0Z2VuZXJhdGVDb2x1bW5JZCgkZWwpIHtcclxuXHRcdHJldHVybiB0aGlzLmdlbmVyYXRlVGFibGVJZCgpICsgJy0nICsgJGVsLmRhdGEoREFUQV9DT0xVTU5fSUQpLnJlcGxhY2UoL1xcLi9nLCAnXycpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBJRCBmb3IgYSB0YWJsZSdzIChET01FbGVtZW50KSAnYWJzb2x1dGVXaWR0aHMnIG9wdGlvblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IElEXHJcblx0KiovXHJcblx0Z2VuZXJhdGVUYWJsZUFic29sdXRlV2lkdGhzSWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpLnJlcGxhY2UoL1xcLi9nLCAnXycpICsgJy0tYWJzb2x1dGUtd2lkdGhzJztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgSUQgZm9yIGEgZ2l2ZW4gdGFibGUgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2VuZXJhdGVUYWJsZUlkXHJcblx0QHJldHVybiB7U3RyaW5nfSBUYWJsZSBJRFxyXG5cdCoqL1xyXG5cdGdlbmVyYXRlVGFibGVJZCgpIHtcclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkucmVwbGFjZSgvXFwuL2csICdfJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQYXJzZXMgYSBnaXZlbiBET01FbGVtZW50J3Mgd2lkdGggaW50byBhIGZsb2F0XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBwYXJzZVdpZHRoXHJcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gZ2V0IHdpZHRoIG9mXHJcblx0QHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxyXG5cdCoqL1xyXG5cdHBhcnNlV2lkdGgoZWxlbWVudCkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnQgPyBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzID8gJ3B4JyA6ICclJyksICcnKSkgOiAwO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0U2V0cyB0aGUgd2lkdGggb2YgYSBnaXZlbiBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzZXRXaWR0aFxyXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIHNldCB3aWR0aCBvblxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBzZXRcclxuXHQqKi9cclxuXHRzZXRXaWR0aChlbGVtZW50LCB3aWR0aCkge1xyXG5cdFx0d2lkdGggPSB3aWR0aC50b0ZpeGVkKDIpO1xyXG5cdFx0d2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XHJcblx0XHRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzID8gJ3B4JyA6ICclJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb25zdHJhaW5zIGEgZ2l2ZW4gd2lkdGggdG8gdGhlIG1pbmltdW0gYW5kIG1heGltdW0gcmFuZ2VzIGRlZmluZWQgaW5cclxuXHR0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGNvbnN0cmFpbldpZHRoXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50XHJcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoIHRvIGNvbnN0cmFpblxyXG5cdEByZXR1cm4ge051bWJlcn0gQ29uc3RyYWluZWQgd2lkdGhcclxuXHQqKi9cclxuXHRjb25zdHJhaW5XaWR0aCgkZWwsIHdpZHRoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IHVuZGVmaW5lZCB8fCB0aGlzLm9wdGlvbnMub2JleUNzc01pbldpZHRoKSB7XHJcblx0XHRcdHdpZHRoID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbldpZHRoLCB3aWR0aCwgJGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRIKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAhPSB1bmRlZmluZWQgfHwgdGhpcy5vcHRpb25zLm9iZXlDc3NNYXhXaWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5tYXhXaWR0aCwgd2lkdGgsICRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHdpZHRoID0gTWF0aC5tYXgoMCwgd2lkdGgpO1xyXG4gXHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzID8gdGhpcy4kdGFibGUud2lkdGgoKSA6IDEwMCwgd2lkdGgpO1xyXG5cclxuXHRcdHJldHVybiB3aWR0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEdpdmVuIGEgcGFydGljdWxhciBFdmVudCBvYmplY3QsIHJldHJpZXZlcyB0aGUgY3VycmVudCBwb2ludGVyIG9mZnNldCBhbG9uZ1xyXG5cdHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xyXG5cdHBvaW50ZXItbGlrZSBzeXN0ZW1zIChtb2JpbGVzLCB0YWJsZXRzIGV0Yy4pXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZXRQb2ludGVyWFxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxyXG5cdCoqL1xyXG5cdGdldFBvaW50ZXJYKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pLnBhZ2VYO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGV2ZW50LnBhZ2VYO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0R2V0cyB0aGUgdGV4dCB3aWR0aCBvZiBhbiBlbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZXRUZXh0V2lkdGhcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdGV4dFxyXG5cdEBwYXJhbSAkZmFrZUVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWVhc3VyZSB0aGUgd2lkdGhcclxuXHRAcmV0dXJuIHtOdW1iZXJ9IFRleHQgd2lkdGhcclxuXHQqKi9cclxuXHRnZXRUZXh0V2lkdGgoJGVsLCAkZmFrZUVsKSB7XHRcdFxyXG5cdFx0cmV0dXJuICRmYWtlRWxcclxuXHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0J2ZvbnRGYW1pbHknOiAkZWwuY3NzKCdmb250RmFtaWx5JyksXHJcblx0XHRcdFx0J2ZvbnRTaXplJzogJGVsLmNzcygnZm9udFNpemUnKSxcclxuXHRcdFx0XHQnZm9udFdlaWdodCc6ICRlbC5jc3MoJ2ZvbnRXZWlnaHQnKSxcclxuXHRcdFx0XHQncGFkZGluZ0xlZnQnOiAkZWwuY3NzKCdwYWRkaW5nTGVmdCcpLFxyXG5cdFx0XHRcdCdwYWRkaW5nUmlnaHQnOiAkZWwuY3NzKCdwYWRkaW5nUmlnaHQnKSxcclxuXHRcdFx0XHQnYm9yZGVyJzogJGVsLmNzcygnYm9yZGVyJylcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRleHQoJGVsLnRleHQoKSlcclxuXHRcdFx0Lm91dGVyV2lkdGgodHJ1ZSk7XHJcblx0fVxyXG59XHJcblxyXG5SZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzID0ge1xyXG5cdHNlbGVjdG9yOiBmdW5jdGlvbigkdGFibGUpIHtcclxuXHRcdGlmKCR0YWJsZS5maW5kKCd0aGVhZCcpLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gU0VMRUNUT1JfVEg7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFNFTEVDVE9SX1REO1xyXG5cdH0sXHJcblx0c3RvcmU6IHdpbmRvdy5zdG9yZSxcclxuXHRzeW5jSGFuZGxlcnM6IHRydWUsXHJcblx0cmVzaXplRnJvbUJvZHk6IHRydWUsXHJcblx0bWF4V2lkdGg6IG51bGwsXHJcblx0bWluV2lkdGg6IDAuMDEsXHJcblx0b2JleUNzc01pbldpZHRoOiBmYWxzZSxcclxuIFx0b2JleUNzc01heFdpZHRoOiBmYWxzZSxcclxuXHRhYnNvbHV0ZVdpZHRoczogZmFsc2UsXHJcblx0ZG91YmxlQ2xpY2tEZWxheTogNTAwLFxyXG5cdHdyYXBwVGFibGU6IGZhbHNlXHJcbn07XHJcblxyXG5SZXNpemFibGVDb2x1bW5zLmNvdW50ID0gMDtcclxuIiwiZXhwb3J0IGNvbnN0IERBVEFfQVBJID0gJ3Jlc2l6YWJsZUNvbHVtbnMnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZUNvbHVtbnNJZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGVDb2x1bW5JZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NTU19NSU5fV0lEVEggPSAnY3NzTWluV2lkdGgnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUFYX1dJRFRIID0gJ2Nzc01heFdpZHRoJztcclxuXHJcbmV4cG9ydCBjb25zdCBDTEFTU19BQlNPTFVURSA9ICdyYy1hYnNvbHV0ZSc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9SRVNJWklORyA9ICdyYy10YWJsZS1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRSA9ICdyYy1oYW5kbGUnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFX0NPTlRBSU5FUiA9ICdyYy1oYW5kbGUtY29udGFpbmVyJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1dSQVBQRVIgPSAncmMtdGFibGUtd3JhcHBlcic7XHJcblxyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFID0gJ2NvbHVtbjpyZXNpemUnO1xyXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUT1AgPSAnY29sdW1uOnJlc2l6ZTpzdG9wJztcclxuXHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9USCA9ICd0cjpmaXJzdCA+IHRoOnZpc2libGUnO1xyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEQgPSAndHI6Zmlyc3QgPiB0ZDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XHJcblxyXG5leHBvcnQgY29uc3QgQVRUUklCVVRFX1VOUkVTSVpBQkxFID0gJ2RhdGEtbm9yZXNpemUnO1xyXG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il19
