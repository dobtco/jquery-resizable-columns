import ResizableColumns from './class';
import {DATA_API} from './constants';

$.fn.resizableColumns = function(optionsOrMethod, ...args) {
	return this.each(function() {
		let $table = $(this);

		let api = $table.data(DATA_API);
		if (!api) {
			api = new ResizableColumns($table, optionsOrMethod);
			$table.data(DATA_API, api);
		}

		else if (typeof optionsOrMethod === 'string') {
			return api[optionsOrMethod](...args);
		}
	});
};

$.resizableColumns = ResizableColumns;
