let locale = 'en';

function setLocal() {
  let lang = document?.children[0].lang ?? 'en';
  lang = lang.toLowerCase();
  if (lang === 'zh-cn' || lang === 'zh-hans') {
    locale = 'zh-cn';
  } else {
    locale = 'en';
  }
}

setLocal();

const i18nMap = {
  'en': {
    'code-copy': 'Copy Code',
    'code-theme-prefix': 'Theme：',
    'code-lang-prefix': 'Lang：',
    'toc': 'Table Of Contents',
    'toc-show-title-prefix': 'Show ',
    'toc-hide-title-prefix': 'Hide ',
    'toc-toggle-prefix': 'Toggle ',
    'msg-copy-success': 'Copy success!',
    'msg-copy-failed': 'Copy failed!',
    'export-actions-title': 'Click to view actions',
    'export-svg-action': 'Save as SVG',
    'export-png-action': 'Save as PNG'
  },
  'zh-cn': {
    'code-copy': '复制代码',
    'code-theme-prefix': '主题：',
    'code-lang-prefix': '语言：',
    'toc': '目录',
    'toc-show-title-prefix': '显示',
    'toc-hide-title-prefix': '隐藏',
    'toc-toggle-prefix': '切换',
    'msg-copy-success': '复制成功！',
    'msg-copy-failed': '复制失败！',
    'export-actions-title': '点击查看操作',
    'export-svg-action': '保存为 SVG',
    'export-png-action': '保存为 PNG',
    'note': '备注',
    'alert': '注意',
    'info': '信息',
    'tip': '提示',
    'warning': '警告',
    'error': '错误',
    'success': '成功',
    'danger': '危险',
    'summary': '概要',
    'tldr': '摘要',
    'abstract': '抽象',
    'todo': '待办',
    'hint': '小窍门',
    'check': '检测',
    'done': '完成',
    'help': '帮助',
    'question': '问题',
    'faq': '问答',
    'attention': '关注',
    'caution': '提醒',
    'failure': '故障',
    'fail': '失败',
    'missing': '缺失',
    'bug': '缺陷',
    'example': '示例',
    'snippet': '片段',
    'quote': '引用',
    'cite': '引文',
    'important': '重点',
    'key': '要点'
  }
}

function getLangString(id, def) {
  return i18nMap[locale]?.[id] ?? def;
}

const i18n = {
  getLangString
}

export default i18n;
