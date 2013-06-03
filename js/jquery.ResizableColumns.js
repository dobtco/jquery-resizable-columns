var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

(function($, window) {
  var ResizableColumns;

  ResizableColumns = (function() {
    ResizableColumns.prototype.defaults = {
      store: window.store,
      rigidSizing: false
    };

    function ResizableColumns($table, options) {
      this.mousedown = __bind(this.mousedown, this);
      var _this = this;

      this.options = $.extend({}, this.defaults, options);
      this.$table = $table;
      this.tableId = this.$table.data('resizable-columns-id');
      this.createHandles();
      this.restoreColumnWidths();
      this.syncHandleWidths();
      $(window).on('resize.rc', (function() {
        return _this.syncHandleWidths();
      }));
    }

    ResizableColumns.prototype.destroy = function() {
      this.$handleContainer.remove();
      this.$table.removeData('resizableColumns');
      return $(window).off('.rc');
    };

    ResizableColumns.prototype.createHandles = function() {
      var _this = this;

      this.$table.before((this.$handleContainer = $("<div class='rc-handle-container' />")));
      this.$table.find('tr th').each(function(i, el) {
        var $handle;

        if (_this.$table.find('tr th').eq(i + 1).length === 0 || (_this.$table.find('tr th').eq(i).attr('data-noresize') != null) || (_this.$table.find('tr th').eq(i + 1).attr('data-noresize') != null)) {
          return;
        }
        $handle = $("<div class='rc-handle' />");
        $handle.data('th', $(el));
        return $handle.appendTo(_this.$handleContainer);
      });
      return this.$handleContainer.on('mousedown', '.rc-handle', this.mousedown);
    };

    ResizableColumns.prototype.syncHandleWidths = function() {
      var _this = this;

      this.$handleContainer.width(this.$table.width());
      return this.$handleContainer.find('.rc-handle').each(function(_, el) {
        return $(el).css({
          left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - _this.$handleContainer.offset().left),
          height: _this.$table.height()
        });
      });
    };

    ResizableColumns.prototype.saveColumnWidths = function() {
      var _this = this;

      return this.$table.find('tr th').each(function(_, el) {
        var id;

        if ($(el).attr('data-noresize') == null) {
          id = _this.tableId + '-' + $(el).data('resizable-column-id');
          if (_this.options.store != null) {
            return store.set(id, $(el).width());
          }
        }
      });
    };

    ResizableColumns.prototype.restoreColumnWidths = function() {
      var _this = this;

      return this.$table.find('tr th').each(function(_, el) {
        var id, width;

        id = _this.tableId + '-' + $(el).data('resizable-column-id');
        if ((_this.options.store != null) && (width = store.get(id))) {
          return $(el).width(width);
        }
      });
    };

    ResizableColumns.prototype.mousedown = function(e) {
      var $currentGrip, $leftColumn, $rightColumn, idx, leftColumnStartWidth, rightColumnStartWidth,
        _this = this;

      e.preventDefault();
      this.startPosition = e.pageX;
      $currentGrip = $(e.currentTarget);
      $leftColumn = $currentGrip.data('th');
      leftColumnStartWidth = $leftColumn.width();
      idx = this.$table.find('tr th').index($currentGrip.data('th'));
      $rightColumn = this.$table.find('tr th').eq(idx + 1);
      rightColumnStartWidth = $rightColumn.width();
      $(document).on('mousemove.rc', function(e) {
        var difference, newLeftColumnWidth, newRightColumnWidth;

        difference = e.pageX - _this.startPosition;
        newRightColumnWidth = rightColumnStartWidth - difference;
        newLeftColumnWidth = leftColumnStartWidth + difference;
        if (_this.options.rigidSizing && ((parseInt($rightColumn[0].style.width) < $rightColumn.width()) && (newRightColumnWidth < $rightColumn.width())) || ((parseInt($leftColumn[0].style.width) < $leftColumn.width()) && (newLeftColumnWidth < $leftColumn.width()))) {
          return;
        }
        $leftColumn.width(newLeftColumnWidth);
        $rightColumn.width(newRightColumnWidth);
        return _this.syncHandleWidths();
      });
      return $(document).one('mouseup', function() {
        $(document).off('mousemove.rc');
        return _this.saveColumnWidths();
      });
    };

    return ResizableColumns;

  })();
  return $.fn.extend({
    resizableColumns: function() {
      var args, option;

      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.each(function() {
        var $table, data;

        $table = $(this);
        data = $table.data('resizableColumns');
        if (!data) {
          $table.data('resizableColumns', (data = new ResizableColumns($table, option)));
        }
        if (typeof option === 'string') {
          return data[option].apply(data, args);
        }
      });
    }
  });
})(window.jQuery, window);
