!(function(e, t) {
  function n() {
    t.body
      ? (t.body.style.fontSize = 12 * o + 'px')
      : t.addEventListener('DOMContentLoaded', n);
  }
  function d() {
    var e =
      i.clientWidth / (document.documentElement.clientWidth <= 1024 ? 10 : 30);
    i.style.fontSize = e + 'px';
  }
  var i = t.documentElement,
    o = e.devicePixelRatio || 1;
  if (
    (n(),
    d(),
    e.addEventListener('resize', d),
    e.addEventListener('pageshow', function(e) {
      e.persisted && d();
    }),
    o >= 2)
  ) {
    var a = t.createElement('body'),
      s = t.createElement('div');
    (s.style.border = '.5px solid transparent'),
      a.appendChild(s),
      i.appendChild(a),
      1 === s.offsetHeight && i.classList.add('hairlines'),
      i.removeChild(a);
  }
})(window, document);