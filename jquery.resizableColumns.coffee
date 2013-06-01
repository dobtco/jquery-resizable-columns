$ = jQuery

$.fn.extend
  resizableColumns: (method_or_opts = {}) ->
    makeResizable = ($table) ->
      tableId = $table.data('resizable-columns-id')
      $handleContainer = undefined
      startPosition = undefined
      startWidth = undefined
      $currentGrip = undefined

      mouseup = ->
        console.log 'mouseup\'d'
        $(document).off 'mousemove.rc'

      mousemove = (e) ->
        console.log $currentGrip
        newWidth = startWidth + (e.pageX - startPosition)
        console.log 'nw', newWidth
        unless newWidth < 1
          $currentGrip.data('th').width(newWidth)
        syncHandleWidths()
        # console.log e.pageX - startPosition

      mousedown = (e) ->
        startPosition = e.pageX
        $currentGrip = $(e.currentTarget)
        startWidth = $currentGrip.data('th').width()
        console.log('started drag', e.pageX)
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

      syncHandle = ($handle) ->
        $handle.css
          left: $handle.data('th').outerWidth() + ($handle.data('th').offset().left - $handleContainer.offset().left)
          height: $table.height()

      createHandles()
      syncHandleWidths()

    $(@).each ->
      if typeof method_or_opts == 'string'
        $(@).resizable method_or_opts
      else
        makeResizable $(@)