/**
 * 自动根据 dpr 来设置 html font-size 来实现 rem 自动匹配各设备
 * 目前是强制以 750px 宽度设计稿基准 75px -> 1rem
 * 在需要支持该特性的 sve 内：
 * oncreate: flexible()
 * ondestroy: noflexible()
 * @author linyu
 */

const dpr = window.devicePixelRatio || 1;
const docEl = document.documentElement;

// adjust body font size
function setBodyFontSize() {
  if (document.body) {
    document.body.style.fontSize =
      docEl.clientWidth <= 1024 ? 12 * dpr + 'px' : 75 + 'px';
  } else {
    document.addEventListener('DOMContentLoaded', setBodyFontSize);
  }
}

// set 1rem = viewWidth / 10
function setRemUnit() {
  const rem = docEl.clientWidth <= 1024 ? docEl.clientWidth / 10 : 75;
  docEl.style.fontSize = rem + 'px';
}

export const flexible = function() {
  setBodyFontSize();
  setRemUnit();
  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // detect 0.5px supports
  if (dpr >= 2) {
    var fakeBody = document.createElement('body');
    var testElement = document.createElement('div');
    testElement.style.border = '.5px solid transparent';
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines');
    }
    docEl.removeChild(fakeBody);
  }
};

export const noflexible = function() {
  window.removeEventListener('resize', setRemUnit);
  window.removeEventListener('pageshow', function(e) {
    if (e.persisted) {
      setRemUnit();
    }
  });
  document.body.style.fontSize = null;
  docEl.style.fontSize = null;
  document.removeEventListener('DOMContentLoaded', setBodyFontSize);
};
