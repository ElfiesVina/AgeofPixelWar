"use strict";
/* Binding React / ReactDOM / JSX runtime hasil bundel (nama diganti agar terbaca). */
var ReactInterop = qn(nr(), 1), ReactDOMClient = qn(Kc(), 1);
var React = qn(nr(), 1);
var ReactForJsx = qn(nr(), 1), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.element");
var hasOwn = Object.prototype.hasOwnProperty, currentOwner = ReactForJsx.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, RESERVED_PROPS = { key: true, ref: true, __self: true, __source: true };
function jsxImpl(e, n, t) {
  var r, l = {}, u = null, i = null;
  t !== void 0 && (u = "" + t), n.key !== void 0 && (u = "" + n.key), n.ref !== void 0 && (i = n.ref);
  for (r in n) hasOwn.call(n, r) && !RESERVED_PROPS.hasOwnProperty(r) && (l[r] = n[r]);
  if (e && e.defaultProps) for (r in n = e.defaultProps, n) l[r] === void 0 && (l[r] = n[r]);
  return { $$typeof: REACT_ELEMENT_TYPE, type: e, key: u, ref: i, props: l, _owner: currentOwner.current };
}
var jsx = jsxImpl, jsxs = jsxImpl;
