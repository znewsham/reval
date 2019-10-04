import Plugins from './plugins.js';
import Utils from '../utils.js';

Plugins.add('ECMAScript', {

  extensions: ['js'],

  compile({ code, filePath, projectRoot }) {
    code = Package.ecmascript.ECMAScript.compileForShell(code);

    let moduleName = Utils.getModuleName(filePath);
    code = `(() => {
      var module = RevalModules.getModule('${moduleName}');
      if (!module) {
        return;
      }
      module.importSync = module.importSync || module.import; var _module = module; var require = module.require.bind(module); \n\n${code}})()`;

    return `//# sourceURL=${filePath.replace(projectRoot, "")}\n${code}`;
  },

});
