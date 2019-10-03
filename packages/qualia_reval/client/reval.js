import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Blaze} from 'meteor/blaze';
import {ReactiveVar} from 'meteor/reactive-var';

import {reloadPage} from './blaze.js';

Reval = {

  initialize() {
    window.revalFiles = this.revalFiles = new Mongo.Collection('reval_files');
    Meteor.subscribe('revalFiles');

    this.reloadPage = _.throttle(reloadPage, 1000);

    this.watchCode();
    this.renderUI();

    return this;
  },

  editURL: new ReactiveVar(''),
  baseElem: '',
  toggleConnection: false,

  renderUI() {
    Meteor.startup(() => {
      let view = Blaze.render(Template.revalUI, $('head')[0]);
      this.UI = view._templateInstance;
    });
  },

  getFiles() {
    return this.revalFiles.find({cleared: false}).fetch();
  },

  save(files=[]) {
    $.post(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX +  + '/reval/save', JSON.stringify(files));
  },

  clear(files=[]) {
    $.post(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/clear', JSON.stringify(files));
  },

  publish() {
    return new Promise(resolve => {
      $.get(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/reval/publish', url => resolve(url));
    });
  },

  watchCode() {
    let reload = revalFile => {
      if (revalFile.client) {
        try {
          Function(revalFile.clientEval)();
          if (this.toggleConnection) {
            Meteor.connection.disconnect();
            Meteor.connection.reconnect();
          }
        }
        catch(e) {
          console.error(e);
        }

        let baseElem = this.baseElem || (revalFile.path.includes('qualia_reval')
            ? 'html'
            : 'body'
        );
        let baseElemData;
        const $elem = $(`#${revalFile.templateName}`);
        if (revalFile.templateName && $elem.length === 1) {
          const view = Blaze.getView($elem[0])
          if (view.name == `Template.${revalFile.templateName}`) {
            baseElem = `#${revalFile.templateName}`;
            baseElemData = $elem.data();
          }
        }
        this.reloadPage(baseElem, baseElemData);
      }
    };

    Meteor.startup(() => {
      let cursor = this.revalFiles.find({client: true}, {
        fields: {
          templateName: 1,
          path: 1,
          client: 1,
          clientEval: 1,
        },
      });
      cursor.observe({added: reload, changed: reload});
    });
  },

  getEditURL({templateName, sourceType, filePath}) {
    if (filePath) {
      sourceType = filePath.split('.').pop();
      return __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + `/reval/edit?filePath=${filePath}&sourceType=${sourceType}`;
    }
    else {
      return __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + `/reval/edit?templateName=${templateName}&sourceType=${sourceType}`;
    }
  },

  getReadURL({templateName, sourceType, filePath}) {
    if (filePath) {
      sourceType = filePath.split('.').pop();
      return __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + `/reval/read?filePath=${filePath}&sourceType=${sourceType}`;
    }
    else {
      return __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + `/reval/read?templateName=${templateName}&sourceType=${sourceType}`;
    }
  },

  getTemplate(view) {
    while (view && !(view.name.startsWith('Template.') || view.name.startsWith('BlazeComponent.'))) {
      view = view.parentView;
    }

    return view
      ? view.name.split('.')[1]
      : ''
    ;
  },

  editData(view) {
    let theWith = view.name === 'with'
        ? view
      : Blaze.getView(view, 'with'),
        newData = {}
    ;

    window.RevalData = _.extend(newData, theWith.dataVar.curValue);
    console.log(newData);

    let intervalID = Meteor.setInterval(() => {
      if (view.isDestroyed) {
        Meteor.clearInterval(intervalID);
      }

      _.extend(theWith.dataVar.curValue, newData);
      theWith.dataVar.dep.changed();
    }, 200);
  },

}.initialize();

export default Reval;
