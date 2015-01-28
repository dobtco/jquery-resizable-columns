/* jQuery Resizable Columns v0.1.0 | https://github.com/woolyninja/jquery-resizable-columns | Licensed MIT | Built Wed Jan 28 2015 16:11:04 */
/* Forked from original project @ http://dobtco.github.io/jquery-resizable-columns/ */
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

(function($, window) {
  var ResizableColumns, parseWidth, pointerX, setWidth;
  parseWidth = function(node) {
    return parseFloat(node.style.width.replace('%', ''));
  };
  setWidth = function(node, width) {
    width = width.toFixed(2);
    return node.style.width = "" + width + "%";
  };
  pointerX = function(e) {
    if (e.type.indexOf('touch') === 0) {
      return (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX;
    }
    return e.pageX;
  };
  ResizableColumns = (function() {
    ResizableColumns.prototype.defaults = {
      selector: 'thead tr:eq(0) th:visible',
      noResizeAttr: 'data-noresize',
      store: window.store,
      syncHandlers: true,
      resizeFromBody: true,
      maxWidth: null,
      minWidth: null,
      obeyCssMinWidth: false,
      obeyCssMaxWidth: false
    };

    function ResizableColumns($table, options) {
      this.pointerdown = __bind(this.pointerdown, this);
      this.constrainWidth = __bind(this.constrainWidth, this);
      this.options = $.extend({}, this.defaults, options);
      this.$table = $table;
      this.setHeaders();
      this.restoreColumnWidths();
      this.syncHandleWidths();
      $(window).on('resize.rc', ((function(_this) {
        return function() {
          return _this.syncHandleWidths();
        };
      })(this)));
      if (this.options.start) {
        this.$table.bind('column:resize:start.rc', this.options.start);
      }
      if (this.options.resize) {
        this.$table.bind('column:resize.rc', this.options.resize);
      }
      if (this.options.stop) {
        this.$table.bind('column:resize:stop.rc', this.options.stop);
      }
    }

    ResizableColumns.prototype.triggerEvent = function(type, args, original) {
      var event;
      event = $.Event(type);
      event.originalEvent = $.extend({}, original);
      return this.$table.trigger(event, [this].concat(args || []));
    };

    ResizableColumns.prototype.getColumnId = function($el) {
      return this.$table.data('resizable-columns-id') + '-' + $el.data('resizable-column-id');
    };

    ResizableColumns.prototype.setHeaders = function() {
      this.$tableHeaders = this.$table.find(this.options.selector);
      this.assignPercentageWidths();
      return this.createHandles();
    };

    ResizableColumns.prototype.destroy = function() {
      this.$handleContainer.remove();
      this.$table.removeData('resizableColumns');
      return this.$table.add(window).off('.rc');
    };

    ResizableColumns.prototype.assignPercentageWidths = function() {
      return this.$tableHeaders.each((function(_this) {
        return function(_, el) {
          var $el, calcedCssMaxWidth, calcedCssMinWidth, width;
          $el = $(el);
          if (($el.attr(_this.options.noResizeAttr) != null)) {
            return;
          }
          width = $el.outerWidth() / _this.$table.width() * 100;
          $el.data('cssMinWidth', 0);
          $el.data('cssMaxWidth', 100);
          calcedCssMinWidth = _this.calcCssMinWidth($el);
          if (calcedCssMinWidth != null) {
            width = Math.max(calcedCssMinWidth, width);
          }
          calcedCssMaxWidth = _this.calcCssMinWidth($el);
          if (calcedCssMaxWidth != null) {
            width = Math.min(calcedCssMaxWidth, width);
          }
          return setWidth($el[0], width);
        };
      })(this));
    };

    ResizableColumns.prototype.calcCssMinWidth = function($el) {
      var el, minwidth;
      minwidth = null;
      el = $el[0];
      if (this.options.obeyCssMinWidth) {
        if (el.style.minWidth.slice(-2) === 'px') {
          minwidth = parseFloat(el.style.minWidth) / this.$table.width() * 100;
        } else {
          minwidth = parseFloat(el.style.minWidth);
        }
        if (!isNaN(minwidth)) {
          $el.data('cssMinWidth', minwidth);
        } else {
          minwidth = null;
        }
      }
      return minwidth;
    };

    ResizableColumns.prototype.calcCssMaxWidth = function($el) {
      var el, maxwidth;
      maxwidth = null;
      el = $el[0];
      if (this.options.obeyCssMaxWidth) {
        if (el.style.maxWidth.slice(-2) === 'px') {
          maxwidth = parseFloat(el.style.maxWidth) / this.$table.width() * 100;
        } else {
          maxwidth = parseFloat(el.style.maxWidth);
        }
        if (!isNaN(maxwidth)) {
          $el.data('cssMaxWidth', maxwidth);
        } else {
          maxwidth = null;
        }
      }
      return maxwidth;
    };

    ResizableColumns.prototype.createHandles = function() {
      var _ref;
      if ((_ref = this.$handleContainer) != null) {
        _ref.remove();
      }
      this.$table.before((this.$handleContainer = $("<div class='rc-handle-container' />")));
      this.$tableHeaders.each((function(_this) {
        return function(i, el) {
          var $handle;
          if (_this.$tableHeaders.eq(i + 1).length === 0 || (_this.$tableHeaders.eq(i).attr(_this.options.noResizeAttr) != null) || (_this.$tableHeaders.eq(i + 1).attr(_this.options.noResizeAttr) != null)) {
            return;
          }
          $handle = $("<div class='rc-handle' />");
          $handle.data('th', $(el));
          return $handle.appendTo(_this.$handleContainer);
        };
      })(this));
      return this.$handleContainer.on('mousedown touchstart', '.rc-handle', this.pointerdown);
    };

    ResizableColumns.prototype.syncHandleWidths = function() {
      return this.$handleContainer.width(this.$table.width()).find('.rc-handle').each((function(_this) {
        return function(_, el) {
          var $el, $th;
          $el = $(el);
          $th = _this.$tableHeaders.filter(':not([' + _this.options.noResizeAttr + '])').eq(_);
          return $el.css({
            left: $th.outerWidth() + ($th.offset().left - _this.$handleContainer.offset().left),
            height: _this.options.resizeFromBody ? _this.$table.height() : _this.$table.find('thead').height()
          });
        };
      })(this));
    };

    ResizableColumns.prototype.saveColumnWidths = function() {
      return this.$tableHeaders.each((function(_this) {
        return function(_, el) {
          var $el;
          $el = $(el);
          if ($el.attr(_this.options.noResizeAttr) == null) {
            if (_this.options.store != null) {
              return _this.options.store.set(_this.getColumnId($el), parseWidth($el[0]));
            }
          }
        };
      })(this));
    };

    ResizableColumns.prototype.restoreColumnWidths = function() {
      return this.$tableHeaders.each((function(_this) {
        return function(_, el) {
          var $el, width;
          $el = $(el);
          if ((_this.options.store != null) && (width = _this.options.store.get(_this.getColumnId($el)))) {
            return setWidth($el[0], width);
          }
        };
      })(this));
    };

    ResizableColumns.prototype.totalColumnWidths = function() {
      var total;
      total = 0;
      this.$tableHeaders.each((function(_this) {
        return function(_, el) {
          return total += parseFloat($(el)[0].style.width.replace('%', ''));
        };
      })(this));
      return total;
    };

    ResizableColumns.prototype.constrainWidth = function($el, width) {
      if ((this.options.minWidth != null) || this.options.obeyCssMinWidth) {
        width = Math.max($el.data('cssMinWidth'), this.options.minWidth, width);
      }
      if ((this.options.maxWidth != null) || this.options.obeyCssMaxWidth) {
        width = Math.min($el.data('cssMaxWidth'), this.options.maxWidth, width);
      }
      width = Math.max(0, width);
      width = Math.min(100, width);
      return width;
    };

    ResizableColumns.prototype.pointerdown = function(e) {
      var $currentGrip, $leftColumn, $ownerDocument, $rightColumn, gripIndex, newWidths, startPosition, widths;
      e.preventDefault();
      $ownerDocument = $(e.currentTarget.ownerDocument);
      startPosition = pointerX(e);
      $currentGrip = $(e.currentTarget);
      gripIndex = $currentGrip.index();
      $leftColumn = this.$tableHeaders.filter(':not([' + this.options.noResizeAttr + '])').eq(gripIndex);
      $rightColumn = this.$tableHeaders.filter(':not([' + this.options.noResizeAttr + '])').eq(gripIndex + 1);
      widths = {
        left: parseWidth($leftColumn[0]),
        right: parseWidth($rightColumn[0])
      };
      newWidths = {
        left: widths.left,
        right: widths.right
      };
      this.$handleContainer.add(this.$table).addClass('rc-table-resizing');
      $leftColumn.add($rightColumn).add($currentGrip).addClass('rc-column-resizing');
      this.triggerEvent('column:resize:start', [$leftColumn, $rightColumn, newWidths.left, newWidths.right], e);
      $ownerDocument.on('mousemove.rc touchmove.rc', (function(_this) {
        return function(e) {
          var difference;
          difference = (pointerX(e) - startPosition) / _this.$table.width() * 100;
          if (difference > 0) {
            setWidth($rightColumn[0], newWidths.right = _this.constrainWidth($rightColumn, widths.right - difference));
            setWidth($leftColumn[0], newWidths.left = _this.constrainWidth($leftColumn, widths.left + (widths.right - newWidths.right)));
          }
          if (difference < 0) {
            setWidth($leftColumn[0], newWidths.left = _this.constrainWidth($leftColumn, widths.left + difference));
            setWidth($rightColumn[0], newWidths.right = _this.constrainWidth($rightColumn, widths.right + (widths.left - newWidths.left)));
          }
          if (_this.options.syncHandlers != null) {
            _this.syncHandleWidths();
          }
          return _this.triggerEvent('column:resize', [$leftColumn, $rightColumn, newWidths.left, newWidths.right], e);
        };
      })(this));
      return $ownerDocument.one('mouseup touchend', (function(_this) {
        return function() {
          $ownerDocument.off('mousemove.rc touchmove.rc');
          _this.$handleContainer.add(_this.$table).removeClass('rc-table-resizing');
          $leftColumn.add($rightColumn).add($currentGrip).removeClass('rc-column-resizing');
          _this.syncHandleWidths();
          _this.saveColumnWidths();
          return _this.triggerEvent('column:resize:stop', [$leftColumn, $rightColumn, newWidths.left, newWidths.right], e);
        };
      })(this));
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
