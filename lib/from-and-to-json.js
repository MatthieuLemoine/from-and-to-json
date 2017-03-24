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
    let editor       = atom.workspace.getActiveTextEditor();
    const indentType = getIndentType(editor);
    if (editor) {
      PrettyJSON.jsonify(editor, {
        selected : true,
        sorted   : true,
        entire   : false
      });
    }
  },
  toJS() {
    let editor   = atom.workspace.getActiveTextEditor();
    const indent = getIndentType(editor);
    if (editor) {
      const selected    = editor.getSelectedText();
      const bufferRange = editor.getSelectedBufferRange();
      try {
        editor.setTextInBufferRange(bufferRange, stringifyJS(JSON.parse(selected), 0, indent));
      }
      catch (error) {
        console.error(error);
      }
    }
  }
};

function stringifyJS(object, level, indent) {
  const rootComma = level === 0 ? '' : ',';
  const rootTabs = indent.delimiter.repeat(level * indent.size);
  return Object.keys(object).reduce((string, key, index, array) => {
    const comma = index < (array.length - 1) ? ',' : '';
    const tabs = indent.delimiter.repeat((level + 1) * indent.size);
    return `${string}\n${tabs}${key} : ${toStringItem(object[key], level + 1, true, indent)}${comma}`;
  }, `{`)+ `\n${rootTabs}}`;
}

function toStringItem(item, level, hasKey, indent, breakline) {
  const tabs = indent.delimiter.repeat(level * indent.size);
  if (Array.isArray(item)) {
    const lineBreak = hasKey ? '' : `\n${tabs}`;
    return `${lineBreak}[${item.map(value => toStringItem(value, level + 1, false, indent, true))}\n${tabs}]`;
  } else if(isObject(item)) {
    const lineBreak = hasKey ? '' : `\n${tabs}`;
    return `${lineBreak}${stringifyJS(item, level, indent)}`;
  } else if (isNumber(item)) {
    const lineBreak = breakline ? `\n${tabs}` : '';
    return `${hasKey ? '' : lineBreak}${item}`;
  }
  const lineBreak = breakline ? `\n${tabs}` : '';
  return `${hasKey ? '' : lineBreak}'${item}'`;
}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getIndentType(editor) {
  const useSoftTabs = editor.shouldUseSoftTabs();
  const delimiter   = useSoftTabs ? ' ' : '\t';
  const size        = useSoftTabs ? editor.getTabLength() : 1;
  return {
    delimiter,
    size,
  };
}
