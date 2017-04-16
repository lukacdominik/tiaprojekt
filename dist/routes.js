'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _basicController = require('./controllers/basicController');

var _basicController2 = _interopRequireDefault(_basicController);

var _userController = require('./controllers/userController');

var _userController2 = _interopRequireDefault(_userController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = (0, _express2.default)();

routes.get('/', _basicController2.default.get);
routes.get('/user/getInfo/:userid', _userController2.default.getInfo);
routes.get('/user/getViews/:userid/', _userController2.default.getViews);

exports.default = routes;
//# sourceMappingURL=routes.js.map