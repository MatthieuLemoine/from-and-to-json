'use babel';

import { CompositeDisposable } from 'atom';
import PrettyJSON from 'pretty-json';

export default {
  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'from-and-to-json:toJSON' : this.toJSON,
      'from-and-to-json:toJS'   : this.toJS
    }))
  },
  toJSON() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      PrettyJSON.jsonify(editor, {
        selected : true,
        sorted   : true,
        entire   : false
      });
    }
  },
  toJS() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const selected = editor.getSelectedText();
      const bufferRange = editor.getSelectedBufferRange();
      try {
        editor.setTextInBufferRange(bufferRange, stringifyJS(JSON.parse(selected), 0))
      }
      catch (error) {
        throw error;
      }
    }
  }
};

function stringifyJS(object, level) {
  const rootComma = level === 0 ? '' : ',';
  const rootTabs = ' '.repeat(level * 2);
  return Object.keys(object).reduce((string, key, index, array) => {
    const comma = index < (array.length - 1) ? ',' : '';
    const tabs = ' '.repeat((level + 1) * 2);
    return `${string}\n${tabs}${key} : ${toStringItem(object[key], level + 1, true)}${comma}`;
  }, `{`)+ `\n${rootTabs}}`;
}

function toStringItem(item, level, hasKey) {
  const tabs = ' '.repeat(level * 2);
  if (Array.isArray(item)) {
    const lineBreak = hasKey ? '' : `\n${tabs}`;
    return `${lineBreak}[\n${tabs}${item.map(value => toStringItem(value, level + 1, false))}\n${tabs}]`;
  } else if(isObject(item)) {
    const lineBreak = hasKey ? '' : `\n${tabs}`;
    return `${lineBreak}${stringifyJS(item, level)}`;
  } else if (isNumber(item)) {
    return `${hasKey ? '' : '  '}${item}`;
  }
  return `${hasKey ? '' : '  '}'${item}'`;
}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
