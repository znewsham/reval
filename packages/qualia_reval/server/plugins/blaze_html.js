import Plugins from './plugins.js';
import {SpacebarsCompiler} from 'meteor/spacebars-compiler';

Plugins.add('BlazeHTML', {

  extensions: ['html'],
  locations: ['client'],

  compile({code}) {
    if (code.includes('<body>')) {
      console.warn("\x1b[91mReval\x1b[0m doesn't support reloading the <body> tag. Please move the code to a sub-template.")
    }

    let result = '',
        regex = /<\s*template\s+name\s*=\s*['"](.*?)['"]\s*>([^]*?)<\s*\/\s*template\s*>/gmi,
        match
    ;

    let templateNames = [];
    while (match = regex.exec(code)) {
      let templateName = match[1],
          html = match[2],
          compiledHTML
      ;
      templateNames.push(templateName);

      try {
        compiledHTML = SpacebarsCompiler.compile(html);
      }
      catch(e) {
        let errorMessage = `Encountered an error while compiling ${templateName}: ${e.message}\n${e.stack}`;
        console.error(errorMessage);
        // return `console.error(\`${errorMessage}\`)`;
        return '';
      }

      result += `
          if (Template['${templateName}']) {
            Template['${templateName}'].renderFunction = function() { var view=this; return ${compiledHTML}() };
        }
        `;
    }

    if (templateNames.length === 1) {
      return {
        code: result,
        templateName: templateNames[0]
      };
    }
    return result;
  },

});
