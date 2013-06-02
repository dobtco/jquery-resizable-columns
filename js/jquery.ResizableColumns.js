var $;

$ = jQuery;

$.fn.extend({
  resizableColumns: function(method, options) {
    var makeResizable;

    if (options == null) {
      options = {};
    }
    if (method && typeof method !== 'string') {
      options = method;
    }
    makeResizable = function($table) {
      var $currentGrip, $handleContainer, $leftColumn, $rightColumn, createHandles, mousedown, mousemove, mouseup, restoreColumnWidths, saveColumnWidths, startPosition, syncHandle, syncHandleWidths, tableId;

      tableId = $table.data('resizable-columns-id');
      $handleContainer = void 0;
      startPosition = void 0;
      $currentGrip = void 0;
      $leftColumn = void 0;
      $rightColumn = void 0;
      mouseup = function() {
        $(document).off('mousemove.rc');
        return saveColumnWidths();
      };
      mousemove = function(e) {
        var difference, newLeftColumnWidth, newRightColumnWidth;

        difference = e.pageX - startPosition;
        newRightColumnWidth = $rightColumn.data('startWidth') - difference;
        newLeftColumnWidth = $leftColumn.data('startWidth') + difference;
        if (((parseInt($rightColumn[0].style.width) < $rightColumn.width()) && (newRightColumnWidth < $rightColumn.width())) || ((parseInt($leftColumn[0].style.width) < $leftColumn.width()) && (newLeftColumnWidth < $leftColumn.width()))) {
          return;
        }
        $leftColumn.width(newLeftColumnWidth);
        $rightColumn.width(newRightColumnWidth);
        return syncHandleWidths();
      };
      mousedown = function(e) {
        var handleIndex;

        e.preventDefault();
        startPosition = e.pageX;
        $currentGrip = $(e.currentTarget);
        $leftColumn = $currentGrip.data('th');
        $leftColumn.data('startWidth', $leftColumn.width());
        handleIndex = $handleContainer.find('.rc-handle').index($currentGrip);
        $rightColumn = $table.find('tr th').eq(handleIndex + 1);
        $rightColumn.data('startWidth', $rightColumn.width());
        $(document).on('mousemove.rc', mousemove);
        return $(document).one('mouseup', mouseup);
      };
      createHandles = function() {
        $table.before(($handleContainer = $("<div class='rc-handle-container' />")));
        $table.data('handleContainer', $handleContainer);
        $table.find('tr th').each(function() {
          var $handle;

          $handle = $("<div class='rc-handle' />");
          $handle.data('th', $(this));
          return $handle.appendTo($handleContainer);
        });
        return $handleContainer.on('mousedown', '.rc-handle', mousedown);
      };
      syncHandleWidths = function() {
        $handleContainer.width($table.width());
        return $handleContainer.find('.rc-handle').each(function() {
          return syncHandle($(this));
        });
      };
      saveColumnWidths = function() {
        return $table.find('tr th').each(function() {
          var id;

          id = tableId + '-' + $(this).data('resizable-column-id');
          if (options.store != null) {
            return store.set(id, $(this).width());
          }
        });
      };
      restoreColumnWidths = function() {
        return $table.find('tr th').each(function() {
          var id, width;

          id = tableId + '-' + $(this).data('resizable-column-id');
          if ((options.store != null) && (width = store.get(id))) {
            return $(this).width(width);
          }
        });
      };
      syncHandle = function($handle) {
        return $handle.css({
          left: $handle.data('th').outerWidth() + ($handle.data('th').offset().left - $handleContainer.offset().left),
          height: $table.height()
        });
      };
      createHandles();
      restoreColumnWidths();
      return syncHandleWidths();
    };
    return $(this).each(function() {
      if (method === 'destroy') {
        $(this).data('handleContainer').remove();
        $(this).removeData('handleContainer');
        return $(this).find('tr th').each(function() {
          $(this).removeData('th');
          if (options.resetWidths) {
            return $(this).width('');
          }
        });
      } else {
        return makeResizable($(this));
      }
    });
  }
});
