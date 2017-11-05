
export const Test = function() {
  console.log(this);
}

export const loadScript = function(src, cb) {
  let script = document.createElement('script')
  script.src = src
  script.async = true
  script.onload = cb
  document.body.appendChild(script)
}