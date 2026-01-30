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
    'note': '备注',
    'alert': '注意',
    'info': '信息',
    'tip': '提示',
    'warning': '警告',
    'error': '错误',
    'success': '成功',
    'danger': '危险'
  }
}

function getLangString(id, def) {
  return i18nMap[locale]?.[id] ?? def;
}

const i18n = {
  getLangString
}

export default i18n;
