import {Blaze} from 'meteor/blaze';

let createView = Blaze._createView;
Blaze._createView = function(view, parentView, forExpansion) {
  view._dep = new Tracker.Dependency();

  let render = view._render;
  //let jQueryData;
  view._render = function() {
    view._dep.depend();
    const newView = render.apply(view, arguments);
    Tracker.afterFlush(() => {
      if (jQueryData && newView && newView._domrange) {
        const actual = newView._domrange.members.filter(elem => elem.constructor !== Text);
        if (actual.length === 1) {
          $(actual[0]).data(jQueryData);
        }
      }
    });
    return newView;
  };
  view.rerender = (baseData) => {
    jQueryData = baseData;
    view._dep.changed();
  };

  return createView.call(this, view, parentView, forExpansion);
};

let getRoot = function(elem, baseView) {
  let view = Blaze.getView(elem);
  if (!elem) {
    return;
  }

  while (view && view.parentView && view !== baseView) {
    view = view.originalParentView || view.parentView;
  }

  return view;
};

let getRoots = function(base) {
  let roots = new Set(),
      baseElem = $(base)[0],
      baseView = Blaze.getView(baseElem)
  ;
  if (baseView && baseView.name.startsWith("Template.")) {
    baseView = baseView.parentView;
  }
  $(base + ' *').each((i, e) => {
    let root = getRoot(e, baseView);
    if (root) {
      roots.add(root);
    }
  });

  return Array.from(roots);
};

let reloadPage = function(base='body', baseData) {
  getRoots(base).forEach(view => view.rerender(baseData));
};

export {reloadPage};
