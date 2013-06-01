$ = jQuery

$.fn.extend
  resizableColumns: (method_or_opts = {}) ->
    makeResizable = ($table) ->
      tableId = $table.data('resizable-columns-id')
      $handleContainer = undefined
      startPosition = undefined
      $currentGrip = undefined
      $leftColumn = undefined
      $rightColumn = undefined

      mouseup = ->
        $(document).off 'mousemove.rc'
        saveColumnWidths()

      mousemove = (e) ->
        difference = (e.pageX - startPosition)
        newRightColumnWidth = $rightColumn.data('startWidth') - difference
        newLeftColumnWidth = $leftColumn.data('startWidth') + difference

        return if ( (parseInt($rightColumn[0].style.width) < $rightColumn.width()) &&
                    (newRightColumnWidth < $rightColumn.width()) ) ||
                  ( (parseInt($leftColumn[0].style.width) < $leftColumn.width()) &&
                    (newLeftColumnWidth < $leftColumn.width()) )

        $leftColumn.width(newLeftColumnWidth)
        $rightColumn.width(newRightColumnWidth)

        syncHandleWidths()

      mousedown = (e) ->
        e.preventDefault()

        startPosition = e.pageX
        $currentGrip = $(e.currentTarget)
        $leftColumn = $currentGrip.data('th')
        $leftColumn.data('startWidth', $leftColumn.width())
        handleIndex = $handleContainer.find('.rc-handle').index($currentGrip)
        $rightColumn = $table.find('tr th').eq(handleIndex + 1)
        $rightColumn.data('startWidth', $rightColumn.width())
        $(document).on 'mousemove.rc', mousemove
        $(document).one 'mouseup', mouseup

      createHandles = ->
        $table.before ($handleContainer = $("<div class='rc-handle-container' />"))
        $table.find('tr th').each ->
          $handle = $("<div class='rc-handle' />")
          $handle.data('th', $(@))
          $handle.appendTo($handleContainer)

        $handleContainer.on 'mousedown', '.rc-handle', mousedown

      syncHandleWidths = ->
        $handleContainer.width($table.width())
        $handleContainer.find('.rc-handle').each ->
          syncHandle $(@)

      saveColumnWidths = ->
        $table.find('tr th').each ->
          id = tableId + '-' + $(@).data('resizable-column-id') # + 'v1' for easy flush in development
          if method_or_opts.store?
            store.set id, $(@).width()

      restoreColumnWidths = ->
        $table.find('tr th').each ->
          id = tableId + '-' + $(@).data('resizable-column-id') # + 'v1' for easy flush in development
          if method_or_opts.store? && (width = store.get(id))
            $(@).width(width)

      syncHandle = ($handle) ->
        $handle.css
          left: $handle.data('th').outerWidth() + ($handle.data('th').offset().left - $handleContainer.offset().left)
          height: $table.height()

      createHandles()
      restoreColumnWidths()
      syncHandleWidths()

    $(@).each ->
      if typeof method_or_opts == 'string'
        $(@).resizable method_or_opts
      else
        makeResizable $(@)