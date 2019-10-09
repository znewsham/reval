import sass from "node-sass";
import Plugins from './plugins.js';


Plugins.add('SCSS', {

  extensions: ['scss'],
  locations: ['client'],

  compile({filePath, code}) {
    console.log(require("node-sass"));
    const css = String(sass.renderSync({ data: code }).css);
    return `
      var filePath = \`${filePath}\`,
          existingCSS = document.getElementById(filePath),
          css = document.createElement("style");

      if (existingCSS) {
        existingCSS.outerHTML = "";
      }

      css.id = filePath;
      css.type = "text/css";
      css.innerHTML = \`${css}\`;
      document.body.appendChild(css);
    `;
  },

});
