import {
	DATA_API,
	DATA_COLUMNS_ID,
	DATA_COLUMN_ID,
	DATA_TH,
	CLASS_TABLE_RESIZING,
	CLASS_COLUMN_RESIZING,
	CLASS_HANDLE,
	CLASS_HANDLE_CONTAINER,
	EVENT_RESIZE_START,
	EVENT_RESIZE,
	EVENT_RESIZE_STOP,
	SELECTOR_TH,
	SELECTOR_TD,
	SELECTOR_UNRESIZABLE
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

		this.setTableProperties();
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
	 * Set table properties when initialize
	 * 
	 * @method setTableProperties
	 */
	setTableProperties() {
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
	refreshHeaders() {
		// Allow the selector to be both a regular selctor string as well as
		// a dynamic callback
		let selector = this.options.selector;
		if(typeof selector === 'function') {
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
			if ($next.length === 0 || $next.is(SELECTOR_UNRESIZABLE)) {
				return;
			}

			/**
			 * Fixed by gmo.rsdn
			 * Add attribute column-id to resize-handle element
			 */
			const columnId = $(el).attr('data-resizable-column-id')

			let $handle = $(`<div class='${CLASS_HANDLE}' column-id='${columnId}' />`)
				.data(DATA_TH, $(el))
				.appendTo(this.$handleContainer);
		});

		this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.'+CLASS_HANDLE, this.onPointerDown.bind(this));
	}

	/**
	Assigns a percentage width to all columns based on their current pixel width(s)

	@method assignPercentageWidths
	**/
	assignPercentageWidths() {
		this.$tableHeaders.each((_, el) => {
			let $el = $(el);
			$el.width(Math.max($el.outerWidth(), this.options.minWidth))
		});
	}

	/**


	@method syncHandleWidths
	**/
	syncHandleWidths() {
		let $container = this.$handleContainer

		$container.width(this.$table.width());

		$container.find('.'+CLASS_HANDLE).each((_, el) => {
			let $el = $(el);

			let height = this.options.resizeFromBody ?
				this.$table.height() :
				this.$table.find('thead').height();

			let left = $el.data(DATA_TH).outerWidth() + (
				$el.data(DATA_TH).offset().left - this.$handleContainer.offset().left
			);

			$el.css({ left, height });
		});
	}

	/**
	Persists the column widths in localStorage

	@method saveColumnWidths
	**/
	saveColumnWidths() {
		this.$tableHeaders.each((_, el) => {
			let $el = $(el);

			if (this.options.store && !$el.is(SELECTOR_UNRESIZABLE)) {
				this.options.store.set(
					this.generateColumnId($el),
					$el.width(),
				);
			}
		});
	}

	/**
	Retrieves and sets the column widths from localStorage

	@method restoreColumnWidths
	**/
	restoreColumnWidths() {
		this.$tableHeaders.each((_, el) => {
			let $el = $(el);

			if(this.options.store && !$el.is(SELECTOR_UNRESIZABLE)) {
				let width = this.options.store.get(
					this.generateColumnId($el)
				);

				if(width != null) {
					$el.width(Math.max(width, this.options.minWidth));
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
		/**
		 * Fixed by gmo.rsdn
		 * changed logic find element leftColumn and rightColumn with column-id
		 */
		const columnId = $(event.currentTarget).attr('column-id')
		const selector = '[data-resizable-column-id="' + columnId + '"]'
		let $leftColumn = this.$table.find(selector)
		let $rightColumn = this.$table.find(selector).next()
		// let leftWidth = this.parseWidth($leftColumn[0]);
		// let rightWidth = this.parseWidth($rightColumn[0]);
		let leftWidth = $leftColumn.width()
		let rightWidth = $rightColumn.width()

		this.operation = {
			$leftColumn, $rightColumn, $currentGrip,

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
		// let difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
		let difference = event.pageX - op.pointerDownEvent.pageX
		if(difference === 0) {
			return;
		}


		let leftColumn = op.$leftColumn[0];
		let rightColumn = op.$rightColumn[0];
		const totalWidth = op.$leftColumn.width() + op.$rightColumn.width();
		let widthLeft, widthRight;
		if(difference > 0) {
			// widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
			// widthRight = this.constrainWidth(op.widths.right - difference);
			widthRight = op.widths.right - difference;
			widthLeft = totalWidth - widthRight;
		}
		else if(difference < 0) {
			// widthLeft = this.constrainWidth(op.widths.left + difference);
			// widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
			widthLeft = op.widths.left + difference;
			widthRight = totalWidth - widthLeft;
		}
		widthLeft = Math.max(this.options.minWidth, widthLeft);
		widthRight = Math.max(this.options.minWidth, widthRight);

		const maxWidth = totalWidth - this.options.minWidth;

		if (widthLeft > maxWidth) {
			widthLeft = maxWidth;
		}

		if (widthRight > maxWidth) {
			widthRight = maxWidth;
		}

		if(leftColumn) {
			// this.setWidth(leftColumn, widthLeft);
			op.$leftColumn.width(widthLeft);
		}
		if(rightColumn) {
			// this.setWidth(rightColumn, widthRight);
			op.$rightColumn.width(widthRight);
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

		$handles.removeData(DATA_TH);
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
		return this.$table.data(DATA_COLUMNS_ID) + '-' + $el.data(DATA_COLUMN_ID);
	}

	/**
	Parses a given DOMElement's width into a float

	@private
	@method parseWidth
	@param element {DOMElement} Element to get width of
	@return {Number} Element's width as a float
	**/
	parseWidth(element) {
		return element ? parseFloat(element.style.width.replace('%', '')) : 0;
	}

	/**
	Sets the percentage width of a given DOMElement

	@private
	@method setWidth
	@param element {DOMElement} Element to set width on
	@param width {Number} Width, as a percentage, to set
	**/
	setWidth(element, width) {
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
	constrainWidth(width) {
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
	minWidth: 0.01
};

ResizableColumns.count = 0;
