'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

_app2.default.listen(process.env.SERVER_LISTEN_PORT, function () {
	console.log('Server listening on port', process.env.SERVER_LISTEN_PORT);
});
//# sourceMappingURL=index.js.map