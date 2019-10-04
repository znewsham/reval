export default {

  plugins: [],

  add(name, plugin) {
    _.defaults(plugin, {
      name,
      extensions: [],
      locations: ['client', 'server'],
    });

    this.plugins.unshift(plugin);
  },

  compile({filePath, code, location, projectRoot}) {
    let extension = filePath.split('.').pop();

    let ret = {
      code
    };
    this.plugins.forEach(plugin => {
      let hasExtension = _.include(plugin.extensions, extension),
          hasLocation = _.include(plugin.locations, location);
      if (!hasExtension || !hasLocation) {
        return;
      }

      try {
        let newCode = plugin.compile({filePath, code: ret.code, location, projectRoot});
        if (newCode !== undefined) {
          if (_.isObject(newCode)) {
            _.extend(ret, newCode);
          }
          else {
            ret.code = newCode;
          }
        }
      }
      catch(e) {
        console.error(e.message);
        console.error(e.stack);
        // code = `console.error(\`Can't eval invalid ${e.stack}\`)`;
        ret.code = '';
      }

    });

    return ret;
  },

};
