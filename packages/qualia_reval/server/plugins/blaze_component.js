import Plugins from './plugins.js';

Plugins.add('BlazeComponent', {

  extensions: ['js'],
  locations: ['client', 'server'],

  compile({code}) {
    let regex = /BlazeComponent\.register\(Template\.(.+?)\)/gi,
        templateNames = [],
        match
    ;

    while(match = regex.exec(code)) {
      templateNames.push(match[1].split(",")[0]);
    }

    _.unique(templateNames).forEach(templateName => {
      code = `
              if (Template['${templateName}']) {
                new Template('Template.${templateName}', (Template.proxies['Template.${templateName}']).renderFunction);
              }
            ` + code;

      code = `
      ${code}
      `;
    });


    if (templateNames.length === 1) {
      return {
        code: code,
        templateName: templateNames[0]
      };
    }
    return code;
  },

});
