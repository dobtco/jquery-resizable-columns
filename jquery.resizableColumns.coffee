$ = jQuery

$.fn.extend
  resizableColumns: (method_or_opts = {}) ->
    store = undefined

    makeResizable = ($table) ->
      tableId = $table.data('resizable-columns-id')

      restoreColumnWidths = ->
        $table.find("tr th").each ->
          columnId = tableId + '-' + $(@).data('resizable-column-id')
          $(@).width store.get(columnId)

      saveColumnWidth = ($column) ->
        columnId = tableId + '-' + $column.data('resizable-column-id')
        store.set columnId, $column[0].style.width

      $table.find('tr th').resizable
        handles: 'e'
        stop: (event, ui) ->
          saveColumnWidth $(event.target)

      restoreColumnWidths()

    $(@).each ->
      if typeof method_or_opts == 'string'
        $(@).resizable method_or_opts
      else
        store = method_or_opts.store
        makeResizable $(@)