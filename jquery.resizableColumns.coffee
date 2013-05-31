$ = jQuery

$.fn.extend
  resizableColumns: (method_or_opts = {}) ->
    store = undefined

    makeResizable = ($table) ->
      tableId = $table.data('resizable-columns-id')

      setColumnWidth = ($thisColumn, newWidth) ->
        columnId = tableId + "-" + $thisColumn.data('resizable-column-id')

        $thisColumn.css
          width: newWidth

        store.set(columnId, newWidth) if store

      resetHandles = ->
        $(".rc-draghandle").css
          left: ''
          height: ''

      setSizes = (difference, pos) ->
        $thisColumn = $table.find("tr:first th").eq(pos)
        $nextColumn = $table.find("tr:first th").eq(pos + 1)
        currentWidth = $thisColumn.width()
        newWidth = currentWidth + difference

        setColumnWidth($thisColumn, newWidth)

        couldntResize = newWidth - $thisColumn.width()

        if $nextColumn.length > 0
          newNextColumnWidth = $nextColumn.width() - couldntResize
          setColumnWidth($nextColumn, newNextColumnWidth)

        resetHandles()

      i = 0
      $table.find("tr:first th").each ->
        index = i

        columnId = tableId + "-" + $(@).data('resizable-column-id')

        $(@).css
          position: "relative"
          width: store.get(columnId) if store

        origText = $(@).text()
        $dragHandle = $("<div class='rc-draghandle'></div>")
        $wrapper = $("<div class='rc-wrapper'></div>")
        $wrapper.text(origText)

        $wrapper.css
          'padding-left': $(@).css('padding-left')
          'padding-right': $(@).css('padding-right')

        $(@).css
          'padding-left': '0'
          'padding-right': '0'

        $(@).html $wrapper
        $wrapper.append $dragHandle

        initialPos = undefined

        $dragHandle.draggable
          axis: "x"
          start: ->
            initialPos = $(@).offset().left
            $(@).addClass('dragging')
            $(@).height($table.height())
          stop: (e, ui) ->
            $(@).removeClass('dragging')
            difference = $(@).offset().left - initialPos
            setSizes(difference, index)

        i = i + 1

    $(@).each ->
      if method_or_opts == 'destroy'
        $(@).find(".rc-draghandle").remove()
        $(@).find("th").css
          position: ''
          width: ''

      else
        store = method_or_opts.store
        makeResizable $(@)