import {Meteor} from 'meteor/meteor';
import {Picker} from 'meteor/meteorhacks:picker';

import Reval from './reval.js';
import Utils from './utils.js';

Picker.route(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/reload', function(params, request, response) {
  let code = Utils.getData(request),
      filePath = Utils.normalizePath(params.query.filePath)
  ;

  Reval.reval(filePath, code);

  response.statusCode = 200;
  response.end();
});

Picker.route(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/save', function(params, request, response) {
  let data = Utils.getData(request) || '[]',
      filePaths = JSON
      .parse(data)
      .map(path => Utils.normalizePath(path))
  ;

  Reval.save(filePaths);

  response.statusCode = 200;
  response.end();
});

Picker.route(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/clear', function(params, request, response) {
  let data = Utils.getData(request) || '[]',
      filePaths = JSON
        .parse(data)
        .map(path => Utils.normalizePath(path))
  ;

  Reval.clear(filePaths);

  response.statusCode = 200;
  response.end();
});

Picker.route(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/publish', function(params, request, response) {
  response.statusCode = 200;
  response.end(Reval.publish());
});
