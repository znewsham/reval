import {Blaze} from 'meteor/blaze';
import {SpacebarsCompiler} from 'meteor/spacebars-compiler';

let compiledHTML = SpacebarsCompiler.compile(Assets.getText('server/editor/editor._html')),
    Editor = new Blaze.Template('revalEditor', function() {
      var view = this;
      return eval(compiledHTML)()
    });

Editor.helpers({

  mode() {
    let extension = this.filePath
      ? this.filePath.split('.').pop()
      : 'js';

    return {
      js: 'javascript',
      html: 'handlebars',
      css: 'css',
      jade: 'jade',
    }[extension];
  },

  safeCode() {
    return Buffer.from(encodeURIComponent(this.code)).toString('base64');
  },

});

export default Editor;
