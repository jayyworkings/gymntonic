/**
 * Quickview plugin
 *
 * @param {Object.<string, *>} options
 * @return {jQuery}
 */
jQuery.fn.quickview = function(options) {

	QuickView.setOptions(options);
	return this.each(function() {
		QuickView.init($(this));
	});

};
