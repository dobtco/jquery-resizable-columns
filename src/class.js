import {
	DATA_API,
	DATA_COLUMNS_ID,
	DATA_COLUMN_ID,
	DATA_CSS_MIN_WIDTH,
	DATA_CSS_MAX_WIDTH,
	CLASS_TABLE_RESIZING,
	CLASS_COLUMN_RESIZING,
	CLASS_HANDLE,
	CLASS_HANDLE_CONTAINER,
	EVENT_RESIZE_START,
	EVENT_RESIZE,
	EVENT_RESIZE_STOP,
	SELECTOR_TH,
	SELECTOR_TD,
	SELECTOR_UNRESIZABLE,
	ATTRIBUTE_UNRESIZABLE
}
from './constants';

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/
export default class ResizableColumns {
	constructor($table, options) {
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
			this.bindEvents(this.$table, EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
	Refreshes the headers associated with this instances <table/> element and
	generates handles for them. Also assigns widths.

	@method refreshHeaders
	**/
	refreshHeaders() {
		// Allow the selector to be both a regular selctor string as well as
		// a dynamic callback
		let selector = this.options.selector;
		if(typeof selector === 'function') {
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
	createHandles() {
		let ref = this.$handleContainer;
		if (ref != null) {
			ref.remove();
		}

		this.$handleContainer = $(`<div class='${CLASS_HANDLE_CONTAINER}' />`)
		this.$table.before(this.$handleContainer);

		this.$tableHeaders.each((i, el) => {
			let $current = this.$tableHeaders.eq(i);
			let $next = this.$tableHeaders.eq(i + 1);

			if (this.options.absoluteWidths){
				if ($current.is(SELECTOR_UNRESIZABLE)) {
					return;
				}
			} else {
				if ($next.length === 0 || $current.is(SELECTOR_UNRESIZABLE) || $next.is(SELECTOR_UNRESIZABLE)) {
					return;
				}
			}

			let $handle = $(`<div class='${CLASS_HANDLE}' />`)
				.appendTo(this.$handleContainer);
		});

		this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.'+CLASS_HANDLE, this.onPointerDown.bind(this));
	}

	/**
	Assigns a absolute width to all columns based on their current width(s)

	@private
	@method assignAbsoluteWidths
	**/
	assignAbsoluteWidths() {
		this.$tableHeaders.each((_, el) => {
			// do not assign width if the column is not resizable
			if (el.hasAttribute(ATTRIBUTE_UNRESIZABLE))
				return;

			let $el = $(el),
				tableWidth = this.$table.width(),
				paddingLeft = ResizableColumns.parsePixelString($el.css('paddingLeft')),
				paddingRight = ResizableColumns.parsePixelString($el.css('paddingRight')),
				width = ($el.outerWidth() - paddingLeft - paddingRight);
			
			$el.data(DATA_CSS_MIN_WIDTH, 0);
			$el.data(DATA_CSS_MAX_WIDTH, tableWidth);

			let minWidth = this.computeMinCssWidths($el);
			if (minWidth != null) {
				$el.data(DATA_CSS_MIN_WIDTH, minWidth);
				width = Math.max(minWidth, width); 
			}
			
			let maxWidth = this.computeMaxCssWidths($el);
			if (maxWidth != null) {
				$el.data(DATA_CSS_MAX_WIDTH, maxWidth);
				width = Math.min(maxWidth, width); 
			}

			this.setWidth($el[0], width);
		});
	}


	/**
	Parse the value of a string by removing 'px'

	@private
	@method parsePixelString
	@param value {String}
	@return {Number} Parsed value or 0
	**/
	static parsePixelString(value) {
		let valueType = typeof value;
		
		if (valueType === 'string') {
			let v = value.replace('px', ''),
				n = parseFloat(v);
			if (!isNaN(n)) {
				return n;
			}

		} else if (valueType === 'number') {
			return value;
		}

		return 0;
	}

	/**
	Assigns a percentage width to all columns based on their current pixel width(s)

	@private
	@method assignPercentageWidths
	**/
	assignPercentageWidths() {
		this.$tableHeaders.each((_, el) => {
			// do not assign width if the column is not resizable
			if (el.hasAttribute(ATTRIBUTE_UNRESIZABLE))
				return;

			let $el = $(el),
				width = ($el.outerWidth() / this.$table.width()) * 100;
			
			$el.data(DATA_CSS_MIN_WIDTH, 0);
			$el.data(DATA_CSS_MAX_WIDTH, 100);

			let minWidth = this.computeMinCssWidths($el);
			if (minWidth != null) {
				$el.data(DATA_CSS_MIN_WIDTH, minWidth);
				width = Math.max(minWidth, width); 
			}
			
			let maxWidth = this.computeMaxCssWidths($el);
			if (maxWidth != null) {
				$el.data(DATA_CSS_MAX_WIDTH, maxWidth);
				width = Math.min(maxWidth, width); 
			}

			this.setWidth($el[0], width);
		});
	}

	/**
	Compute the minimum width taking into account CSS

	@private
	@method computeMinCssWidths
	@param $el {jQuery} jQuery-wrapped DOMElement for which we compute the minimum width
	**/
	computeMinCssWidths($el) {
		let el, minWidth;
		minWidth = null;
		el = $el[0];
		if (this.options.obeyCssMinWidth) {
			if (el.style.minWidth.slice(-2) === 'px') {
				minWidth = parseFloat(el.style.minWidth);
				if (!this.options.absoluteWidths) {
					minWidth = (minWidth / this.$table.width() * 100);
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
	computeMaxCssWidths($el) {
		let el, maxWidth;
		maxWidth = null;
		el = $el[0];
		if (this.options.obeyCssMaxWidth) {
			if (el.style.maxWidth.slice(-2) === 'px') {
				maxWidth = parseFloat(el.style.maxWidth);
				if (!this.options.absoluteWidths) {
					maxWidth = (maxWidth / this.$table.width() * 100);
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
	syncHandleWidths() {
		if (this.options.absoluteWidths) {
			this.syncHandleWidthsAbsolute()
		} else {
			this.syncHandleWidthsPercentage();
		}
	}

	/**


	@private
	@method syncHandleWidthsAbsolute
	**/
	syncHandleWidthsAbsolute() {
		let $container = this.$handleContainer

		$container.width(this.$table.width()).css('minWidth', this.totalColumnWidthsAbsolute());

		$container.find('.'+CLASS_HANDLE).each((_, el) => {
			let $el = $(el);

			let height = this.options.resizeFromBody ?
				this.$table.height() :
				this.$table.find('thead').height();

			let $th = this.$tableHeaders.filter(`:not(${SELECTOR_UNRESIZABLE})`).eq(_);

			let left = $th.outerWidth()
			left -= ResizableColumns.parsePixelString($el.css('paddingLeft'));
			left -= ResizableColumns.parsePixelString($el.css('paddingRight'));
			left += $th.offset().left;
			left -= this.$handleContainer.offset().left

			$el.css({ left, height });
		});
	}

	/**


	@private
	@method syncHandleWidthsPercentage
	**/
	syncHandleWidthsPercentage() {
		let $container = this.$handleContainer

		$container.width(this.$table.width());

		$container.find('.'+CLASS_HANDLE).each((_, el) => {
			let $el = $(el);

			let height = this.options.resizeFromBody ?
				this.$table.height() :
				this.$table.find('thead').height();

			let $th = this.$tableHeaders.filter(`:not(${SELECTOR_UNRESIZABLE})`).eq(_);

			let left = $th.outerWidth() + ($th.offset().left - this.$handleContainer.offset().left);

			$el.css({ left, height });
		});
	}

	/**


	@method totalColumnWidths
	**/
	totalColumnWidths() {
		return this.options.absoluteWidths
			? this.totalColumnWidthsAbsolute()
			: this.totalColumnWidthsPercentage();
	}

	/**


	@private
	@method totalColumnWidthsAbsolute
	**/
	totalColumnWidthsAbsolute() {
		let total = 0;

		this.$tableHeaders.each((_, el) => {
			let $el = $(el);
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
	totalColumnWidthsPercentage() {
		//should be 100% :D
		let total = 0;

		this.$tableHeaders.each((_, el) => {
			total += this.parseWidth(el);
		});
		
		return total;
	}

	/**
	Persists the column widths in localStorage

	@method saveColumnWidths
	**/
	saveColumnWidths() {
		if (!this.options.store)
			return;

		this.options.store.set(this.generateTableAbsoluteWidthsId(), this.options.absoluteWidths + '');
			
		this.$tableHeaders.each((_, el) => {
			let $el = $(el);

			if (!$el.is(SELECTOR_UNRESIZABLE)) {
				this.options.store.set(
					this.generateColumnId($el),
					this.parseWidth(el)
				);
			}
		});
	}

	/**
	Retrieves and sets the column widths from localStorage

	@method restoreColumnWidths
	**/
	restoreColumnWidths() {
		if (!this.options.store)
			return;

		if (this.options.store.get(this.generateTableAbsoluteWidthsId()) !== (this.options.absoluteWidths + ''))
			return;

		this.$tableHeaders.each((_, el) => {
			let $el = $(el);

			if(!$el.is(SELECTOR_UNRESIZABLE)) {
				let width = this.options.store.get(
					this.generateColumnId($el)
				);

				if(width != null) {
					this.setWidth(el, width);
				}
			}
		});
	}

	/**
	Pointer/mouse down handler

	@method onPointerDown
	@param event {Object} Event object associated with the interaction
	**/
	onPointerDown(event) {
		// Only applies to left-click dragging
		if(event.which !== 1) { return; }

		// If a previous operation is defined, we missed the last mouseup.
		// Probably gobbled up by user mousing out the window then releasing.
		// We'll simulate a pointerup here prior to it
		if(this.operation) {
			this.onPointerUp(event);
		}

		// Ignore non-resizable columns
		let $currentGrip = $(event.currentTarget);
		if($currentGrip.is(SELECTOR_UNRESIZABLE)) {
			return;
		}

		let gripIndex = $currentGrip.index();
		let $leftColumn = this.$tableHeaders.eq(gripIndex).not(SELECTOR_UNRESIZABLE);
		let $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(SELECTOR_UNRESIZABLE);

		let leftWidth = this.parseWidth($leftColumn[0]);
		let rightWidth = this.parseWidth($rightColumn[0]);

		this.operation = {
			$leftColumn, $rightColumn, $currentGrip,

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

		this.$handleContainer
			.add(this.$table)
			.addClass(CLASS_TABLE_RESIZING);

		$leftColumn
			.add($rightColumn)
			.add($currentGrip)
			.addClass(CLASS_COLUMN_RESIZING);

		this.triggerEvent(EVENT_RESIZE_START, [
			$leftColumn, $rightColumn,
			leftWidth, rightWidth
		],
		event);

		event.preventDefault();
	}

	/**
	Pointer/mouse movement handler

	@method onPointerMove
	@param event {Object} Event object associated with the interaction
	**/
	onPointerMove(event) {
		let op = this.operation;
		if(!this.operation) { return; }

		// Determine the delta change between start and new mouse position, as a percentage of the table width
		let difference = this.getPointerX(event) - op.startX;
		if (!this.options.absoluteWidths) {
			difference = (difference) / this.$table.width() * 100;
		}

		if(difference === 0) {
			return;
		}

		let leftColumn = op.$leftColumn[0];
		let rightColumn = op.$rightColumn[0];
		let widthLeft, widthRight;

		if (this.options.absoluteWidths) {
			//TODO Need to investigate this
			if(difference > 0) {
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth($(rightColumn), op.widths.right - difference);
			}
			else if(difference < 0) {
				//_this.setWidth($leftColumn[0], _this.constrainWidth(widths.left + difference));
				//_this.setWidth($leftColumn[0], newWidths.left = $leftColumn.outerWidth());
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + difference);
				widthRight = this.constrainWidth($(rightColumn), op.widths.right + (op.widths.left - op.newWidths.left));
			}
		} else {
			if(difference > 0) {
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth($(rightColumn), op.widths.right - difference);
			}
			else if(difference < 0) {
				widthLeft = this.constrainWidth($(leftColumn), op.widths.left + difference);
				widthRight = this.constrainWidth($(rightColumn), op.widths.right + (op.widths.left - op.newWidths.left));
			}
		}

		if(leftColumn) {
			this.setWidth(leftColumn, widthLeft);
		}
		if(rightColumn) {
			this.setWidth(rightColumn, widthRight);
		}

		op.newWidths.left = widthLeft;
		op.newWidths.right = widthRight;

		return this.triggerEvent(EVENT_RESIZE, [
			op.$leftColumn, op.$rightColumn,
			widthLeft, widthRight
		],
		event);
	}

	/**
	Pointer/mouse release handler

	@method onPointerUp
	@param event {Object} Event object associated with the interaction
	**/
	onPointerUp(event) {
		let op = this.operation;
		if(!this.operation) { return; }

		this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

		this.$handleContainer
			.add(this.$table)
			.removeClass(CLASS_TABLE_RESIZING);

		op.$leftColumn
			.add(op.$rightColumn)
			.add(op.$currentGrip)
			.removeClass(CLASS_COLUMN_RESIZING);

		this.syncHandleWidths();
		this.saveColumnWidths();

		this.operation = null;

		return this.triggerEvent(EVENT_RESIZE_STOP, [
			op.$leftColumn, op.$rightColumn,
			op.newWidths.left, op.newWidths.right
		],
		event);
	}

	/**
	Removes all event listeners, data, and added DOM elements. Takes
	the <table/> element back to how it was, and returns it

	@method destroy
	@return {jQuery} Original jQuery-wrapped <table> element
	**/
	destroy() {
		let $table = this.$table;
		let $handles = this.$handleContainer.find('.'+CLASS_HANDLE);

		this.unbindEvents(
			this.$window
				.add(this.$ownerDocument)
				.add(this.$table)
				.add($handles)
		);

		$table.removeData(DATA_API);

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
	bindEvents($target, events, selectorOrCallback, callback) {
		if(typeof events === 'string') {
			events = events + this.ns;
		}
		else {
			events = events.join(this.ns + ' ') + this.ns;
		}

		if(arguments.length > 3) {
			$target.on(events, selectorOrCallback, callback);
		}
		else {
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
	unbindEvents($target, events) {
		if(typeof events === 'string') {
			events = events + this.ns;
		}
		else if(events != null) {
			events = events.join(this.ns + ' ') + this.ns;
		}
		else {
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
	triggerEvent(type, args, originalEvent) {
		let event = $.Event(type);
		if(event.originalEvent) {
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
	generateColumnId($el) {
		return this.generateTableId() + '-' + $el.data(DATA_COLUMN_ID).replace(/\./g, '_');
	}

	/**
	Calculates a unique ID for a table's (DOMElement) 'absoluteWidths' option

	@private
	@method generateTableAbsoluteWidthsId
	@return {String} ID
	**/
	generateTableAbsoluteWidthsId() {
		return this.$table.data(DATA_COLUMNS_ID).replace(/\./g, '_') + '--absolute-widths';
	}

	/**
	Calculates a unique ID for a given table DOMElement

	@private
	@method generateTableId
	@return {String} Table ID
	**/
	generateTableId() {
		return this.$table.data(DATA_COLUMNS_ID).replace(/\./g, '_');
	}

	/**
	Parses a given DOMElement's width into a float

	@private
	@method parseWidth
	@param element {DOMElement} Element to get width of
	@return {Number} Element's width as a float
	**/
	parseWidth(element) {
		return element ? parseFloat(element.style.width.replace((this.options.absoluteWidths ? 'px' : '%'), '')) : 0;
	}

	/**
	Sets the width of a given DOMElement

	@private
	@method setWidth
	@param element {DOMElement} Element to set width on
	@param width {Number} Width to set
	**/
	setWidth(element, width) {
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
	constrainWidth($el, width) {
		if (this.options.minWidth != undefined || this.options.obeyCssMinWidth) {
			width = Math.max(this.options.minWidth, width, $el.data(DATA_CSS_MIN_WIDTH));
		}

		if (this.options.maxWidth != undefined || this.options.obeyCssMaxWidth) {
			width = Math.min(this.options.maxWidth, width, $el.data(DATA_CSS_MAX_WIDTH));
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
	getPointerX(event) {
		if (event.type.indexOf('touch') === 0) {
			return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
		}
		return event.pageX;
	}
}

ResizableColumns.defaults = {
	selector: function($table) {
		if($table.find('thead').length) {
			return SELECTOR_TH;
		}

		return SELECTOR_TD;
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
