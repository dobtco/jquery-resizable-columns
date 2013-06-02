(($, window) ->

  # Define the plugin class
  class ResizableColumns

    defaults:
      store: window.store

    constructor: ($table, options) ->
      @options = $.extend({}, @defaults, options)
      @$table = $table
      @tableId = @$table.data('resizable-columns-id')

      @createHandles()
      @restoreColumnWidths()
      @syncHandleWidths()

    destroy: ->
      @$handleContainer.remove()
      @$table.removeData('resizableColumns')

    createHandles: ->
      @$table.before (@$handleContainer = $("<div class='rc-handle-container' />"))
      @$table.find('tr th').each (_, el) =>
        $handle = $("<div class='rc-handle' />")
        $handle.data('th', $(el))
        $handle.appendTo(@$handleContainer)

      @$handleContainer.on 'mousedown', '.rc-handle', @mousedown

    syncHandleWidths: ->
      @$handleContainer.width(@$table.width())
      @$handleContainer.find('.rc-handle').each (_, el) =>
        $(el).css
          left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - @$handleContainer.offset().left)
          height: @$table.height()

    saveColumnWidths: ->
      @$table.find('tr th').each (_, el) =>
        id = @tableId + '-' + $(el).data('resizable-column-id') # + 'v1' for easy flush in development
        if @options.store?
          store.set id, $(el).width()

    restoreColumnWidths: ->
      @$table.find('tr th').each (_, el) =>
        id = @tableId + '-' + $(el).data('resizable-column-id') # + 'v1' for easy flush in development
        if @options.store? && (width = store.get(id))
          $(el).width(width)

    mousedown: (e) =>
      e.preventDefault()

      @startPosition = e.pageX
      $currentGrip = $(e.currentTarget)
      $leftColumn = $currentGrip.data('th')
      $leftColumn.data('startWidth', $leftColumn.width())
      handleIndex = @$handleContainer.find('.rc-handle').index($currentGrip)
      $rightColumn = @$table.find('tr th').eq(handleIndex + 1)
      $rightColumn.data('startWidth', $rightColumn.width())

      $(document).on 'mousemove.rc', (e) =>
        difference = (e.pageX - @startPosition)
        newRightColumnWidth = $rightColumn.data('startWidth') - difference
        newLeftColumnWidth = $leftColumn.data('startWidth') + difference

        return if ( (parseInt($rightColumn[0].style.width) < $rightColumn.width()) &&
                    (newRightColumnWidth < $rightColumn.width()) ) ||
                  ( (parseInt($leftColumn[0].style.width) < $leftColumn.width()) &&
                    (newLeftColumnWidth < $leftColumn.width()) )

        $leftColumn.width(newLeftColumnWidth)
        $rightColumn.width(newRightColumnWidth)

        @syncHandleWidths()

      $(document).one 'mouseup', =>
        $(document).off 'mousemove.rc'
        @saveColumnWidths()

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
