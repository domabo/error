/**
 * Module dependencies.
 */

var swig = require('swig');
var http = require('http');

/**
 * Expose `error`.
 */

module.exports = error;

/**
 * Error middleware.
 *
 *  - `template` defaults to ./error.html
 *
 * @param {Object} opts
 * @api public
 */

function error(opts) {
  opts = opts || {};

  // template
  var path = opts.template || __dirname + '/error.html';
  var render = swig.compileFile(path);

  // env
  var env = process.env.NODE_ENV || 'development';

  return function *error(next){
    try {
      yield next;
      if (null == this.status) this.throw(404);
    } catch (err) {
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      // accepted types
      switch (this.accepts('text/html', 'json', 'text')) {
        case 'text':
          if ('development' == env) this.body = err.message
          else if (err.expose) this.body = err.message
          else throw err;
          break;

        case 'json':
          if ('development' == env) this.body = { error: err.message }
          else if (err.expose) this.body = { error: err.message }
          else this.body = { error: http.STATUS_CODES[this.status] }
          break;

        case 'text/html':
          this.body = render({
            env: env,
            ctx: this,
            request: this.request,
            response: this.response,
            error: err.message,
            stack: err.stack,
            status: err.status,
            code: err.code
          });
          break;
      }
    }
  }
}
