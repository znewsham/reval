import './plugins.js';

import './ecmascript.js';
import './methods.js';
import './publications.js';
import './blaze_html.js';
import './blaze_js.js';
import './blaze_components.js';
import './blaze_component.js';
import './css.js';

if (require.resolve('meteor/mquandalle:jade-compiler').endsWith('.js')) {
  import './jade.js';
}
