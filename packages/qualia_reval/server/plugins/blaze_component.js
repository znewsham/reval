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
              var oldTemplate;
              if (Template['${templateName}']) {
                if (!Template.proxies['${templateName}']) {
                  oldTemplate = Template['${templateName}'];
                  Template['${templateName}'] = new Proxy(new Template('Template.dummy', () => {}), {
                    get(target, key) {
                      return Template.proxies['${templateName}'][key];
                    },
                    set(target, key, value) {
                      Template.proxies['${templateName}'][key] = value;
                    }
                  });
                }

                Template.proxies['${templateName}'] = new Template('Template.${templateName}', (oldTemplate || Template.proxies['${templateName}']).renderFunction);
              }
            ` + code;

      code = `
      ${code}
      // HACK: handle partial re-rendering
      if (oldTemplate) {
        oldTemplate.__eventMaps = Template['${templateName}'].__eventMaps;
        oldTemplate.__helpers = Template['${templateName}'].__helpers;
        oldTemplate._callbacks = Template['${templateName}']._callbacks;
        oldTemplate.reval = ${Math.random()};
      }
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
