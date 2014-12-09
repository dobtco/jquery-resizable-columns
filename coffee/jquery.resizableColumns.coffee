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
      selector: 'tr th:visible' # determine columns using visible table headers
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

        if ($el.attr('data-noresize')?)
          return;

        width = ($el.outerWidth() / @$table.width() * 100)

        $el.data('cssMinWidth', 0)
        $el.data('cssMaxWidth', 100)

        if @options.obeyCssMinWidth
          minwidth = parseFloat(el.style.minWidth)
          if !isNaN(minwidth)
            $el.data('cssMinWidth', minwidth)
            width = Math.max(minwidth, width)

        if @options.obeyCssMaxWidth
          maxwidth = parseFloat(el.style.maxWidth)
          if !isNaN(maxwidth)
            $el.data('cssMaxWidth', maxwidth)
            width = Math.min(maxwidth, width)

        setWidth $el[0], width

    createHandles: ->
      @$handleContainer?.remove()
      @$table.before (@$handleContainer = $("<div class='rc-handle-container' />"))
      @$tableHeaders.each (i, el) =>
        return if @$tableHeaders.eq(i + 1).length == 0 ||
                  @$tableHeaders.eq(i).attr('data-noresize')? ||
                  @$tableHeaders.eq(i + 1).attr('data-noresize')?

        $handle = $("<div class='rc-handle' />")
        $handle.data('th', $(el))
        $handle.appendTo(@$handleContainer)

      @$handleContainer.on 'mousedown touchstart', '.rc-handle', @pointerdown

    syncHandleWidths: ->
      @$handleContainer.width(@$table.width()).find('.rc-handle').each (_, el) =>
        $el = $(el)
        $el.css
          left: $el.data('th').outerWidth() + ($el.data('th').offset().left - @$handleContainer.offset().left)
          height: if @options.resizeFromBody then @$table.height() else @$table.find('thead').height()

    saveColumnWidths: ->
      @$tableHeaders.each (_, el) =>
        $el = $(el)
        unless $el.attr('data-noresize')?
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
      $leftColumn = $currentGrip.data('th')
      $rightColumn = @$tableHeaders.eq @$tableHeaders.index($leftColumn) + 1

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
