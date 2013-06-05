(($, window) ->

  # Define the plugin class
  class ResizableColumns

    defaults:
      store: window.store
      rigidSizing: false # when resizing a column, keep all other columns still
      resizeFromBody: true # allows for resizing of columns from within tbody

    constructor: ($table, options) ->
      @options = $.extend({}, @defaults, options)
      @$table = $table
      @tableId = @$table.data('resizable-columns-id')

      @createHandles()
      @restoreColumnWidths()
      @syncHandleWidths()

      $(window).on 'resize.rc', ( => @syncHandleWidths() )

    destroy: ->
      @$handleContainer.remove()
      @$table.removeData('resizableColumns')
      $(window).off '.rc'

    createHandles: ->
      @$table.before (@$handleContainer = $("<div class='rc-handle-container' />"))
      @$table.find('tr th').each (i, el) =>
        return if @$table.find('tr th').eq(i + 1).length == 0 ||
                  @$table.find('tr th').eq(i).attr('data-noresize')? ||
                  @$table.find('tr th').eq(i + 1).attr('data-noresize')?

        $handle = $("<div class='rc-handle' />")
        $handle.data('th', $(el))
        $handle.appendTo(@$handleContainer)

      @$handleContainer.on 'mousedown', '.rc-handle', @mousedown

    syncHandleWidths: ->
      @$handleContainer.width(@$table.width())
      @$handleContainer.find('.rc-handle').each (_, el) =>
        $(el).css
          left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - @$handleContainer.offset().left)
          height: if @options.resizeFromBody then @$table.height() else @$table.find('thead').height()

    saveColumnWidths: ->
      @$table.find('tr th').each (_, el) =>
        unless $(el).attr('data-noresize')?
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
      leftColumnStartWidth = $leftColumn.width()
      idx = @$table.find('tr th').index($currentGrip.data('th'))
      $rightColumn = @$table.find('tr th').eq(idx + 1)
      rightColumnStartWidth = $rightColumn.width()

      $(document).on 'mousemove.rc', (e) =>
        difference = (e.pageX - @startPosition)
        newRightColumnWidth = rightColumnStartWidth - difference
        newLeftColumnWidth = leftColumnStartWidth + difference



        if @options.rigidSizing &&
           ( (parseInt($rightColumn[0].style.width) < $rightColumn.width()) &&
             (newRightColumnWidth < $rightColumn.width()) ) ||
           ( (parseInt($leftColumn[0].style.width) < $leftColumn.width()) &&
             (newLeftColumnWidth < $leftColumn.width()) )

          # console.log '======'
          # console.log '$rightColumn.text()', $rightColumn.text()
          # console.log '$rightColumn.width()', $rightColumn.width()
          # console.log 'parseInt($rightColumn[0].style.width)', parseInt($rightColumn[0].style.width)
          # console.log 'newRightColumnWidth', newRightColumnWidth
          # console.log '---'
          # console.log '$leftColumn.text()', $leftColumn.text()
          # console.log '$leftColumn.width()', $leftColumn.width()
          # console.log 'parseInt($leftColumn[0].style.width)', parseInt($leftColumn[0].style.width)
          # console.log 'newLeftColumnWidth', newLeftColumnWidth
          # console.log '======'

          return

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
