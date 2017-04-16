'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var basicController = {};

basicController.get = function (request, response) {
	response.json({
		message: 'Hello world'
	});
};

exports.default = basicController;
//# sourceMappingURL=basicController.js.map