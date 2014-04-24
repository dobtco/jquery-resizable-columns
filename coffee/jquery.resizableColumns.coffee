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
        setWidth $el[0], ($el.outerWidth() / @$table.width() * 100)

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

    pointerdown: (e) =>
      e.preventDefault()

      # Take into account parent frame offsets if we're inside a child document
      ownerDocument = e.currentTarget.ownerDocument;
      if ownerDocument != document
          frameOffset = $((ownerDocument.defaultView or ownerDocument.parentWindow).frameElement).offset().left;
      
      startPosition = pointerX(e) + frameOffset
      $currentGrip = $(e.currentTarget)
      $leftColumn = $currentGrip.data('th')
      $rightColumn = @$tableHeaders.eq @$tableHeaders.index($leftColumn) + 1

      widths =
        left: parseWidth($leftColumn[0])
        right: parseWidth($rightColumn[0])
      newWidths = 
        left: widths.left
        right: widths.right
        
      @$handleContainer.addClass('rc-table-resizing')
      @$table.addClass('rc-table-resizing')
      @triggerEvent 'column:resize:start', [ $leftColumn, $rightColumn ], e
      
      $(document).on 'mousemove.rc touchmove.rc', (e) =>
        difference = (pointerX(e) - startPosition) / @$table.width() * 100
        setWidth($leftColumn[0], newWidths.left = widths.left + difference)
        setWidth($rightColumn[0], newWidths.right = widths.right - difference)
        if @options.syncHandlers?
          @syncHandleWidths()
        @triggerEvent 'column:resize', [ $currentGrip, $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e
        
      $(document).one 'mouseup touchend', =>
        $(document).off 'mousemove.rc touchmove.rc'
        @$handleContainer.removeClass('rc-table-resizing')
        @$table.removeClass('rc-table-resizing')
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
