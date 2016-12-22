'use babel';

import { CompositeDisposable } from 'atom';
import { allowUnsafeEval } from 'loophole';

export default {
  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'from-and-to-json:toJSON' : () => allowUnsafeEval(this.toJSON),
      'from-and-to-json:toJS'   : () => this.toJS()
    }))
  },
  toJSON() {
    let editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      const selected = editor.getSelectedText();
      const bufferRange = editor.getSelectedBufferRange();
      try {
        eval(`var object = ${selected}`)
        const json = Object.keys(object)
          .reduce((json, key) => treeReduce(json, key, object), {});

        editor.setTextInBufferRange(bufferRange, JSON.stringify(json))
      }
      catch (error) {
        throw error;
      }
    }
  },
  toJS() {
    let editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      const selected = editor.getSelectedText();
      const bufferRange = editor.getSelectedBufferRange();
      try {
        editor.setTextInBufferRange(bufferRange, JSON.parse(selected))
      }
      catch (error) {}
    }
  }
};

function treeReduce(json, key, obj) {
  const value = obj[key];
  if(typeof value === 'object' && value !== null) {
    json[key] = Object.keys(value).reduce((prev, curr) => treeReduce(prev, curr, value), {});
  } else if (Array.isArray(value)) {
    json[key] = value.map(toJsonItem);
  } else {
    json[key] = value;
  }
  return json;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function toJsonItem(item) {
  if(typeof item === 'object' && item !== null) {
    return Object.keys(value).reduce((prev, curr) => treeReduce(prev, curr, value), {});
  } else if (Array.isArray(value)) {
    return value.map(toJsonItem);
  }
  return item;
}
