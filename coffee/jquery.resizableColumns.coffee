(($, window) ->

  parseWidth = (node) ->
    parseFloat(node.style.width.replace('%', ''))

  setWidth = (node, width) ->
    width = width.toFixed(2)
    node.style.width = "#{width}%"

  pointerX = (e) ->
    if e.type.indexOf('touch') == 0
      return (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX

    e.pageX

  # Define the plugin class
  class ResizableColumns

    defaults:
      selector: 'thead tr:eq(0) th:visible' # determine columns using visible table headers
      noResizeAttr: 'data-noresize' # attr to determine a column is not resizable
      store: window.store
      syncHandlers: true # immediately synchronize handlers with column widths
      resizeFromBody: true # allows for resizing of columns from within tbody

      maxWidth: null # Maximum `percentage` width to allow for any column
      minWidth: null # Minimum `percentage` width to allow for any column

      obeyCssMinWidth: false
      obeyCssMaxWidth: false

    constructor: ($table, options) ->
      @options = $.extend({}, @defaults, options)
      @$table = $table
      @lastDraggableHeaderIndex = 999;

      @setHeaders()
      @restoreColumnWidths()
      @syncHandleWidths()

      $(window).on 'resize.rc', ( => @syncHandleWidths() )

      # Bind event callbacks
      if @options.start
        @$table.bind('column:resize:start.rc', @options.start)
      if @options.resize
        @$table.bind('column:resize.rc', @options.resize)
      if @options.stop
        @$table.bind('column:resize:stop.rc', @options.stop)

    triggerEvent: (type, args, original) ->
      event = $.Event type
      event.originalEvent = $.extend {}, original
      @$table.trigger event, [this].concat(args || [])

    getColumnId: ($el) ->
      @$table.data('resizable-columns-id') + '-' + $el.data('resizable-column-id')

    setHeaders: ->
      @$tableHeaders = @$table.find(@options.selector)
      @assignPercentageWidths()
      @createHandles()

    destroy: ->
      @$handleContainer.remove()
      @$table.removeData('resizableColumns')
      @$table.add(window).off '.rc'

    assignPercentageWidths: ->
      @$tableHeaders.each (_, el) =>
        $el = $(el)

        if ($el.attr(@options.noResizeAttr) == 'true')
          return;

        width = ($el.outerWidth() / @$table.width() * 100)

        $el.data('cssMinWidth', 0)
        $el.data('cssMaxWidth', 100)

        calcedCssMinWidth = @calcCssMinWidth($el)
        if calcedCssMinWidth?
          width = Math.max(calcedCssMinWidth, width)

        calcedCssMaxWidth = @calcCssMinWidth($el)
        if calcedCssMaxWidth?
          width = Math.min(calcedCssMaxWidth, width)

        setWidth $el[0], width

    calcCssMinWidth: ($el) ->
      minwidth = null

      el = $el[0]

      if @options.obeyCssMinWidth
        if (el.style.minWidth.slice(-2) == 'px')
          # pixel
          minwidth = (parseFloat(el.style.minWidth) / @$table.width() * 100)
        else
          # percent
          minwidth = parseFloat(el.style.minWidth)

        if !isNaN(minwidth)
          $el.data('cssMinWidth', minwidth)
        else
          minwidth = null;

      minwidth

    calcCssMaxWidth: ($el) ->
      maxwidth = null

      el = $el[0]

      if @options.obeyCssMaxWidth
        if (el.style.maxWidth.slice(-2) == 'px')
          # pixel
          maxwidth = (parseFloat(el.style.maxWidth) / @$table.width() * 100)
        else
          # percent
          maxwidth = parseFloat(el.style.maxWidth)

        if !isNaN(maxwidth)
          $el.data('cssMaxWidth', maxwidth)
        else
          maxwidth = null;

      maxwidth

    createHandles: ->
      @$handleContainer?.remove()
      @$table.before (@$handleContainer = $("<div class='rc-handle-container' />"))

      @$tableHeaders.each (i, el) =>
        return if @$tableHeaders.eq(i).attr(@options.noResizeAttr) == 'true'
        @lastDraggableHeaderIndex = i

      @$tableHeaders.each (i, el) =>
        return if i == @lastDraggableHeaderIndex ||
                  @$tableHeaders.eq(i + 1).length == 0 ||
                  @$tableHeaders.eq(i).attr(@options.noResizeAttr) == 'true'

        $handle = $("<div class='rc-handle' />")
        $handle.data('th', $(el))
        $handle.appendTo(@$handleContainer)

      @$handleContainer.on 'mousedown touchstart', '.rc-handle', @pointerdown

    syncHandleWidths: ->
      @$handleContainer.width(@$table.width()).find('.rc-handle').each (_, el) =>
        $el = $(el)

        $th = @$tableHeaders.filter(':not([' + @options.noResizeAttr + '=true])').eq(_);

        $el.css
          left: $th.outerWidth() + ($th.offset().left - @$handleContainer.offset().left)
          height: if @options.resizeFromBody then @$table.height() else @$table.find('thead').height()

    saveColumnWidths: ->
      @$tableHeaders.each (_, el) =>
        $el = $(el)
        unless $el.attr(@options.noResizeAttr) == 'true'
          if @options.store?
            @options.store.set @getColumnId($el), parseWidth($el[0])

    restoreColumnWidths: ->
      @$tableHeaders.each (_, el) =>
        $el = $(el)
        if @options.store? && (width = @options.store.get(@getColumnId($el)))
          setWidth $el[0], width

    totalColumnWidths: ->
      total = 0

      @$tableHeaders.each (_, el) =>
        total += parseFloat($(el)[0].style.width.replace('%', ''))

      total

    constrainWidth: ($el, width) =>
      if @options.minWidth? or @options.obeyCssMinWidth
        width = Math.max($el.data('cssMinWidth'), @options.minWidth, width)

      if @options.maxWidth? or @options.obeyCssMaxWidth
        width = Math.min($el.data('cssMaxWidth'), @options.maxWidth, width)

      width = Math.max(0, width);
      width = Math.min(100, width);

      width

    pointerdown: (e) =>
      e.preventDefault()

      $ownerDocument = $(e.currentTarget.ownerDocument);
      startPosition = pointerX(e)
      $currentGrip = $(e.currentTarget)
      gripIndex = $currentGrip.index()
      $leftColumn = @$tableHeaders.filter(':not([' + @options.noResizeAttr + '=true])').eq(gripIndex)
      $rightColumn = @$tableHeaders.filter(':not([' + @options.noResizeAttr + '=true])').eq(gripIndex + 1)

      widths =
        left: parseWidth($leftColumn[0])
        right: parseWidth($rightColumn[0])
      newWidths =
        left: widths.left
        right: widths.right

      @$handleContainer.add(@$table).addClass 'rc-table-resizing'
      $leftColumn.add($rightColumn).add($currentGrip).addClass 'rc-column-resizing'

      @triggerEvent 'column:resize:start', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right  ], e

      $ownerDocument.on 'mousemove.rc touchmove.rc', (e) =>
        difference = (pointerX(e) - startPosition) / @$table.width() * 100
        if difference > 0
          setWidth $rightColumn[0], newWidths.right = @constrainWidth($rightColumn, widths.right - difference)
          setWidth $leftColumn[0], newWidths.left = @constrainWidth($leftColumn, widths.left + (widths.right - newWidths.right))
        if difference < 0
          setWidth $leftColumn[0], newWidths.left = @constrainWidth($leftColumn, widths.left + difference)
          setWidth $rightColumn[0], newWidths.right = @constrainWidth($rightColumn, widths.right + (widths.left - newWidths.left))

        if @options.syncHandlers?
          @syncHandleWidths()
        @triggerEvent 'column:resize', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e

      $ownerDocument.one 'mouseup touchend', =>
        $ownerDocument.off 'mousemove.rc touchmove.rc'
        @$handleContainer.add(@$table).removeClass 'rc-table-resizing'
        $leftColumn.add($rightColumn).add($currentGrip).removeClass 'rc-column-resizing'
        @syncHandleWidths()
        @saveColumnWidths()
        @triggerEvent 'column:resize:stop', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e

  # Define the plugin
  $.fn.extend resizableColumns: (option, args...) ->
    @each ->
      $table = $(@)
      data = $table.data('resizableColumns')

      if !data
        $table.data 'resizableColumns', (data = new ResizableColumns($table, option))
      if typeof option == 'string'
        data[option].apply(data, args)

) window.jQuery, window
