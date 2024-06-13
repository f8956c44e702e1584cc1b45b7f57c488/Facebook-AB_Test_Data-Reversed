; /*FB_PKG_DELIM*/

__d("Nectar", ["Env", "getContextualParent"], function (j, k, b, c, d, e) {
  var f;
  function l(b) {
    b.nctr ||= {};
  }
  function h(b) {
    if ((f ||= k("Env")).module || !b) {
      return (f ||= k("Env")).module;
    }
    var g = {
      fbpage_fan_confirm: true,
      photos_snowlift: true
    };
    var c;
    while (b && b.getAttribute) {
      var h = b.getAttribute("id");
      if (h != null && h.startsWith("pagelet_")) {
        return h;
      }
      if (!c && g[h]) {
        c = h;
      }
      b = k("getContextualParent")(b);
    }
    return c;
  }
  j = {
    addModuleData: function (c, a) {
      a = h(a);
      if (a) {
        l(c);
        c.nctr._mod = a;
      }
    }
  };
  d.exports = j;
}, null);
__d("AsyncRequestNectarLogging", ["AsyncRequest", "Nectar"], function (h, a, b, c, d, e, f) {
  Object.assign(b("AsyncRequest").prototype, {
    setNectarModuleData: function (b) {
      if (this.method == "POST") {
        c("Nectar").addModuleData(this.data, b);
      }
    }
  });
}, 34);
__d("DamerauLevenshtein", [], function (g, h, b, c, d, e) {
  function g(h, a) {
    if (h.length === 0) {
      return a.length;
    }
    if (a.length === 0) {
      return h.length;
    }
    if (h === a) {
      return 0;
    }
    var b;
    var i;
    var j = [];
    j[0] = [];
    j[1] = [];
    j[2] = [];
    for (i = 0; i <= a.length; i++) {
      j[0][i] = i;
    }
    for (b = 1; b <= h.length; b++) {
      for (i = 1; i <= a.length; i++) {
        j[b % 3][0] = b;
        var e = h.charAt(b - 1) === a.charAt(i - 1) ? 0 : 1;
        j[b % 3][i] = Math.min(j[(b - 1) % 3][i] + 1, j[b % 3][i - 1] + 1, j[(b - 1) % 3][i - 1] + e);
        if (b > 1 && i > 1 && h.charAt(b - 1) == a.charAt(i - 2) && h.charAt(b - 2) == a.charAt(i - 1)) {
          j[b % 3][i] = Math.min(j[b % 3][i], j[(b - 2) % 3][i - 2] + e);
        }
      }
    }
    return j[h.length % 3][a.length];
  }
  e.DamerauLevenshteinDistance = g;
}, 66);
__d("BrowserPrefillLogging", ["DamerauLevenshtein", "ge"], function (h, l, a, b, c, d) {
  "use strict";

  var e = {
    initContactpointFieldLogging: function (b) {
      e.contactpointFieldID = b.contactpointFieldID;
      e._updateContactpoint();
      e.serverPrefillContactpoint = b.serverPrefill;
      b = l("ge")(e.contactpointFieldID);
      if (b == null) {
        return;
      }
      b.addEventListener("input", e._mayLogContactpointPrefillViaDropdown.bind(e));
      window.addEventListener("load", e._mayLogContactpointPrefillOnload.bind(e));
      return;
    },
    registerCallback: function (b) {
      e.regeisteredCallbacks = e.regeisteredCallbacks || [];
      e.regeisteredCallbacks.push(b);
    },
    _invokeCallbacks: function (d, a) {
      if (e.regeisteredCallbacks == null || e.regeisteredCallbacks.size === 0) {
        return;
      }
      e.regeisteredCallbacks.forEach(function (b) {
        b(d, a);
      });
    },
    initPasswordFieldLogging: function (b) {
      e.passwordFieldID = b.passwordFieldID;
      e._updatePassword();
      b = l("ge")(e.passwordFieldID);
      if (b == null) {
        return;
      }
      b.addEventListener("input", e._mayLogPasswordPrefillViaDropdown.bind(e));
      window.addEventListener("load", e._mayLogPasswordPrefillOnload.bind(e));
    },
    updatePrefill: function (b, a, c) {
      var d;
      var m = (d = l("ge"))("prefill_source");
      var f = d("prefill_type");
      var g = d("first_prefill_source");
      var h = d("first_prefill_type");
      var i = d("had_cp_prefilled");
      var j = d("had_password_prefilled");
      d = d("prefill_contact_point");
      if (m != null) {
        m.value = a;
      }
      if (f != null) {
        f.value = c;
      }
      if (d != null && b != null) {
        d.value = b;
      }
      if (h != null && (h.value == null || h.value == "")) {
        h.value = c;
      }
      if (g != null && (g.value == null || g.value == "")) {
        g.value = a;
      }
      if (i != null && (i.value == null || i.value === "false") && c === "contact_point") {
        i.value = "true";
      }
      if (j != null && (j.value == null || j.value === "false") && c === "password") {
        j.value = "true";
      }
    },
    _mayLogContactpointPrefillOnload: function () {
      e._updateContactpoint();
      if (e.previousContactpoint == null || e.previousContactpoint === "") {
        return;
      }
      var b = e.previousContactpoint === e.serverPrefillContactpoint ? "server_prefill" : "browser_onload";
      e._logBrowserPrefill(b, "contact_point");
      e._invokeCallbacks(b, "contact_point");
    },
    _mayLogPasswordPrefillOnload: function () {
      e._updatePassword();
      if (e.previousPassword == null || e.previousPassword === "") {
        return;
      }
      e._logBrowserPrefill("browser_onload", "password");
      e._invokeCallbacks("browser_onload", "password");
    },
    _mayLogContactpointPrefillViaDropdown: function () {
      var b = l("ge")(e.contactpointFieldID);
      if (b == null || b.value == null) {
        return;
      }
      if (e._isBrowserPrefill(e.previousContactpoint, b.value) === false) {
        e._updateContactpoint();
        return;
      }
      e._updateContactpoint();
      e._logBrowserPrefill("browser_dropdown", "contact_point");
      e._invokeCallbacks("browser_dropdown", "contact_point");
    },
    _mayLogPasswordPrefillViaDropdown: function () {
      var b = l("ge")(e.passwordFieldID);
      if (b == null || b.value == null) {
        return;
      }
      if (e._isBrowserPrefill(e.previousPassword, b.value) === false) {
        e._updatePassword();
        return;
      }
      e._updatePassword();
      e._logBrowserPrefill("browser_dropdown", "password");
      e._invokeCallbacks("browser_dropdown", "password");
    },
    _isBrowserPrefill: function (b, a) {
      if (a === "") {
        return false;
      }
      if (a === b) {
        return false;
      }
      if (a.length === 1 || b.length === a.length + 1 || a.length === b.length + 1) {
        return false;
      }
      var c = l("DamerauLevenshtein").DamerauLevenshteinDistance(a, b);
      if (c === b.length - a.length) {
        return false;
      } else {
        return true;
      }
    },
    _updateContactpoint: function () {
      var b = l("ge")(e.contactpointFieldID);
      e.previousContactpoint = b != null && b.value != null ? b.value : "";
    },
    _updatePassword: function () {
      var b = l("ge")(e.passwordFieldID);
      e.previousPassword = b != null && b.value != null ? b.value : "";
    },
    _logBrowserPrefill: function (d, a) {
      var b = null;
      if (a === "contact_point") {
        b = e.previousContactpoint;
      }
      if (d !== "server_prefill") {
        e.updatePrefill(b, d, a);
      }
    }
  };
  c.exports = e;
}, null);
__d("Button", ["csx", "cx", "invariant", "CSS", "DOM", "DataStore", "Event", "Parent", "emptyFunction", "isNode"], function (x, y, z, A, b, c, d, e, f, g) {
  var h = "uiButtonDisabled";
  var i = "uiButtonDepressed";
  var j = "_42fr";
  var k = "_42fs";
  var l = "button:blocker";
  var m = "href";
  var n = "ajaxify";
  function o(c, a) {
    var b = A("DataStore").get(c, l);
    if (a) {
      if (b) {
        b.remove();
        A("DataStore").remove(c, l);
      }
    } else if (!b) {
      A("DataStore").set(c, l, z("Event").listen(c, "click", z("emptyFunction").thatReturnsFalse, z("Event").Priority.URGENT));
    }
  }
  function p(b) {
    b = A("Parent").byClass(b, "uiButton") || A("Parent").bySelector(b, "._42ft");
    if (!b) {
      throw new Error("invalid use case");
    }
    return b;
  }
  function q(b) {
    return z("DOM").isNodeOfType(b, "a");
  }
  function r(b) {
    return z("DOM").isNodeOfType(b, "button");
  }
  function s(b) {
    return A("CSS").matchesSelector(b, "._42ft");
  }
  var t = {
    getInputElement: function (b) {
      b = p(b);
      if (q(b)) {
        throw new Error("invalid use case");
      }
      if (r(b)) {
        if (!(b instanceof HTMLButtonElement)) {
          g(0, 21261);
        }
        return b;
      }
      return z("DOM").find(b, "input");
    },
    isEnabled: function (b) {
      return !A("CSS").hasClass(p(b), h) && !A("CSS").hasClass(p(b), j);
    },
    setEnabled: function (d, i) {
      d = p(d);
      var b = s(d) ? j : h;
      A("CSS").conditionClass(d, b, !i);
      if (q(d)) {
        b = d.getAttribute("href");
        var k = d.getAttribute("ajaxify");
        var e = A("DataStore").get(d, m, "#");
        var l = A("DataStore").get(d, n);
        if (i) {
          if (!b) {
            d.setAttribute("href", e);
          }
          if (!k && l) {
            d.setAttribute("ajaxify", l);
          }
          d.removeAttribute("tabIndex");
        } else {
          if (b && b !== e) {
            A("DataStore").set(d, m, b);
          }
          if (k && k !== l) {
            A("DataStore").set(d, n, k);
          }
          d.removeAttribute("href");
          d.removeAttribute("ajaxify");
          d.setAttribute("tabIndex", "-1");
        }
        o(d, i);
      } else {
        e = t.getInputElement(d);
        e.disabled = !i;
        o(e, i);
      }
    },
    setDepressed: function (d, e) {
      d = p(d);
      var b = s(d) ? k : i;
      A("CSS").conditionClass(d, b, e);
    },
    isDepressed: function (c) {
      c = p(c);
      var d = s(c) ? k : i;
      return A("CSS").hasClass(c, d);
    },
    setLabel: function (c, d) {
      c = p(c);
      if (s(c)) {
        var b = [];
        if (d) {
          b.push(d);
        }
        var e = z("DOM").scry(c, ".img");
        for (var f = 0; f < e.length; f++) {
          var j = e[f];
          var k = j.parentNode;
          if (k.classList && (k.classList.contains("_4o_3") || k.classList.contains("_-xe"))) {
            if (c.firstChild === k) {
              b.unshift(k);
            } else {
              b.push(k);
            }
          } else if (c.firstChild == j) {
            b.unshift(j);
          } else {
            b.push(j);
          }
        }
        z("DOM").setContent(c, b);
      } else if (q(c)) {
        k = z("DOM").find(c, "span.uiButtonText");
        z("DOM").setContent(k, d);
      } else {
        t.getInputElement(c).value = d;
      }
      j = s(c) ? "_42fv" : "uiButtonNoText";
      A("CSS").conditionClass(c, j, !d);
    },
    getIcon: function (b) {
      b = p(b);
      return z("DOM").scry(b, ".img")[0];
    },
    setIcon: function (c, a) {
      if (a && !z("isNode")(a)) {
        return;
      }
      var b = t.getIcon(c);
      if (!a) {
        if (b) {
          z("DOM").remove(b);
        }
        return;
      }
      A("CSS").addClass(a, "customimg");
      if (b != a) {
        if (b) {
          z("DOM").replace(b, a);
        } else {
          z("DOM").prependContent(p(c), a);
        }
      }
    }
  };
  x = t;
  d.default = x;
}, 98);
__d("CSTXCookieRecordConsentControllerRouteBuilder", ["jsRouteBuilder"], function (h, i, j, c, d, e, f) {
  h = j("jsRouteBuilder")("/cookie/consent/", Object.freeze({}), undefined);
  i = h;
  f.default = i;
}, 98);
__d("MaybeSymbol", [], function (g, a, h, i, d, e) {
  "use strict";

  a = g.Symbol ? g.Symbol : null;
  h = a;
  e.default = h;
}, 66);
__d("URLSearchParams", ["MaybeSymbol"], function (o, p, b, c, d, e, f) {
  var g = /\+/g;
  var h = /[!\'()*]/g;
  var i = /%20/g;
  var j = b("MaybeSymbol") ? b("MaybeSymbol").iterator : null;
  function k(b) {
    return encodeURIComponent(b).replace(i, "+").replace(h, function (b) {
      return "%" + b.charCodeAt(0).toString(16);
    });
  }
  function l(b) {
    return decodeURIComponent((b = b) != null ? b : "").replace(g, " ");
  }
  function m(d) {
    var e = d.slice(0);
    var a = {
      next: function () {
        var b = e.length;
        var a = e.shift();
        return {
          done: a === undefined && b <= 0,
          value: a
        };
      }
    };
    if (j) {
      a[j] = function () {
        return a;
      };
    }
    return a;
  }
  o = function () {
    function c(b = "") {
      b = b;
      if (b[0] === "?") {
        b = b.substr(1);
      }
      this.$1 = b.length ? b.split("&").map(function (c) {
        c = c.split("=");
        var d = c[0];
        c = c[1];
        return [l(d), l(c)];
      }) : [];
    }
    var a = c.prototype;
    a.append = function (c, a) {
      this.$1.push([c, String(a)]);
    };
    a.delete = function (c) {
      for (var a = 0; a < this.$1.length; a++) {
        if (this.$1[a][0] === c) {
          this.$1.splice(a, 1);
          a--;
        }
      }
    };
    a.entries = function () {
      if (j) {
        return this.$1[j]();
      }
      var b = this.$1.slice(0);
      return m(b);
    };
    a.get = function (d) {
      for (var a = 0, e = this.$1.length; a < e; a++) {
        if (this.$1[a][0] === d) {
          return this.$1[a][1];
        }
      }
      return null;
    };
    a.getAll = function (e) {
      var a = [];
      for (var b = 0, f = this.$1.length; b < f; b++) {
        if (this.$1[b][0] === e) {
          a.push(this.$1[b][1]);
        }
      }
      return a;
    };
    a.has = function (d) {
      for (var a = 0, e = this.$1.length; a < e; a++) {
        if (this.$1[a][0] === d) {
          return true;
        }
      }
      return false;
    };
    a.keys = function () {
      var b = this.$1.map(function (c) {
        var a = c[0];
        c[1];
        return a;
      });
      if (j) {
        return b[j]();
      } else {
        return m(b);
      }
    };
    a.set = function (e, a) {
      var b = false;
      for (var f = 0; f < this.$1.length; f++) {
        if (this.$1[f][0] === e) {
          if (b) {
            this.$1.splice(f, 1);
            f--;
          } else {
            this.$1[f][1] = String(a);
            b = true;
          }
        }
      }
      if (!b) {
        this.$1.push([e, String(a)]);
      }
    };
    a.toString = function () {
      return this.$1.map(function (c) {
        var d = c[0];
        c = c[1];
        return k(d) + "=" + k(c);
      }).join("&");
    };
    a.values = function () {
      var b = this.$1.map(function (b) {
        b[0];
        b = b[1];
        return b;
      });
      if (j) {
        return b[j]();
      } else {
        return m(b);
      }
    };
    a[j] = function () {
      return this.entries();
    };
    return c;
  }();
  f.default = o;
}, 98);
__d("DeferredCookie", ["CSTXCookieRecordConsentControllerRouteBuilder", "Cookie", "CookieConsent", "SubscriptionList", "URLSearchParams", "cr:1083116", "cr:1083117", "cr:3376", "flattenPHPQueryData", "nullthrows", "promiseDone"], function (m, n, o, b, c, d, e) {
  "use strict";

  var p;
  var q = new Map();
  var r = false;
  var f = new Map();
  var s = {
    addToQueue: function (c, a, b, d, e, f, g, h) {
      if ((p ||= o("CookieConsent")).hasConsent(1)) {
        if (e) {
          o("Cookie").setWithoutChecksIfFirstPartyContext(c, a, b, d, g, h);
        } else {
          o("Cookie").setWithoutChecks(c, a, b, d, g, h);
        }
        return;
      }
      if (q.has(c)) {
        return;
      }
      q.set(c, {
        name: c,
        value: a,
        nMilliSecs: b,
        path: d,
        firstPartyOnly: e,
        secure: g,
        domain: h
      });
    },
    getIsDeferredCookieInQueue: function (b) {
      return q.has(b);
    },
    flushAllCookiesWithoutRecordingConsentDONOTCALLBEFORECONSENT: function () {
      q.forEach(function (c, a) {
        if (c.firstPartyOnly) {
          o("Cookie").setWithoutChecksIfFirstPartyContext(c.name, c.value, c.nMilliSecs, c.path, c.secure, c.domain);
        } else {
          o("Cookie").setWithoutChecks(c.name, c.value, c.nMilliSecs, c.path, c.secure, c.domain);
        }
      });
      q.clear();
      (p ||= o("CookieConsent")).setConsented();
      var c = f;
      var g = Array.isArray(c);
      var b = 0;
      var c = g ? c : c[typeof Symbol === "function" ? Symbol.iterator : "@@iterator"]();
      while (true) {
        var h;
        if (g) {
          if (b >= c.length) {
            break;
          }
          h = c[b++];
        } else {
          b = c.next();
          if (b.done) {
            break;
          }
          h = b.value;
        }
        h = h;
        h[1].fireCallbacks();
      }
    },
    flushAllCookiesINTERNALONLY: function (c = false, a, j = false, b = false, e, l = false, m) {
      s.flushAllCookiesWithoutRecordingConsentDONOTCALLBEFORECONSENT();
      var i = {
        accept_only_essential: b,
        opted_in_controls: e,
        consent_to_everything: l
      };
      if (a != null) {
        a = Object.fromEntries(a);
        i = {
          optouts: a,
          accept_only_essential: b,
          opted_in_controls: e,
          consent_to_everything: l
        };
      }
      a = o("flattenPHPQueryData")(i);
      if (!r) {
        b = o("CSTXCookieRecordConsentControllerRouteBuilder").buildUri({});
        e = new (o("URLSearchParams"))(location.search).get("ig_3p_controls");
        if (e === "on") {
          l = b.addQueryParam("ig_3p_controls", "on");
          b = (i = l) != null ? i : b;
        }
        r = true;
        function d() {
          if (m) {
            m();
          }
          if (c) {
            location.reload();
          }
          if (j) {
            var a = document.getElementsByTagName("iframe");
            if (a.length > 0) {
              location.reload();
            }
          }
        }
        if (n("cr:3376") != null) {
          o("promiseDone")(n("cr:3376")(b.toString(), {
            data: a,
            method: "POST"
          }), function () {
            return d();
          }, function (b) {
            if (n("cr:1083117")) {
              n("cr:1083117")("Cookie consent has not been set successfully: " + b.errorMsg, "comet_infra");
            }
          });
        } else if (n("cr:1083116") != null) {
          new (n("cr:1083116"))(b.toString()).setData(a).setHandler(function () {
            return d();
          }).send();
        }
      }
    },
    registerCallbackOnCookieFlush: function (c, a) {
      if ((p ||= o("CookieConsent")).hasConsent(c)) {
        a();
      } else {
        if (!f.has(c)) {
          f.set(c, new (o("SubscriptionList"))());
        }
        o("nullthrows")(f.get(c)).add(a);
      }
    }
  };
  m = s;
  e.default = m;
}, 98);
__d("ErrorMessageConsole", ["ErrorPubSub", "cr:1458113"], function (k, l, b, c, m, e, f) {
  "use strict";

  var g;
  function k(b) {
    if (b.type !== "fatal") {
      return;
    }
    if (l("cr:1458113")) {
      l("cr:1458113").showErrorDialog(b);
    }
  }
  var n = false;
  function c() {
    if (n) {
      return;
    }
    n = true;
    (g ||= b("ErrorPubSub")).addListener(o);
  }
  function o(b) {
    if (b.type !== "fatal") {
      return;
    }
    if (l("cr:1458113")) {
      l("cr:1458113").showErrorDialog(b);
    }
  }
  f.addError = k;
  f.listenForUncaughtErrors = c;
}, 98);
__d("FlipDirection", ["DOM", "Input", "Style"], function (g, i, b, c, d, e) {
  g = {
    setDirection: function (b, a = 5, c = false) {
      var j = i("DOM").isNodeOfType(b, "input") && b.type == "text";
      var k = i("DOM").isNodeOfType(b, "textarea");
      if (!j && !k || b.getAttribute("data-prevent-auto-flip")) {
        return;
      }
      j = i("Input").getValue(b);
      k = b.style && b.style.direction;
      if (!k || c) {
        k = 0;
        c = true;
        for (var l = 0; l < j.length; l++) {
          var m = j.charCodeAt(l);
          if (m >= 48) {
            if (c) {
              c = false;
              k++;
            }
            if (m >= 1470 && m <= 1920) {
              i("Style").set(b, "direction", "rtl");
              b.setAttribute("dir", "rtl");
              return;
            }
            if (k == a) {
              i("Style").set(b, "direction", "ltr");
              b.setAttribute("dir", "ltr");
              return;
            }
          } else {
            c = true;
          }
        }
      } else if (j.length === 0) {
        i("Style").set(b, "direction", "");
        b.removeAttribute("dir");
      }
    }
  };
  d.exports = g;
}, null);
__d("FlipDirectionOnKeypress", ["Event", "FlipDirection"], function (h, i, b, c, d, e, f) {
  h = function (b) {
    b = b.getTarget();
    c("FlipDirection").setDirection(b);
  };
  b("Event").listen(document.documentElement, {
    keyup: h,
    input: h
  });
}, 34);
__d("VirtualCursorStatus", ["UserAgent", "cr:5662", "emptyFunction", "setImmediate"], function (t, u, b, v, w, e) {
  var x = null;
  var y = null;
  function z() {
    y ||= u("cr:5662").listen(window, "blur", function () {
      x = null;
      i();
    });
  }
  function i() {
    if (y) {
      y.remove();
      y = null;
    }
  }
  function t(b) {
    x = b.keyCode;
    z();
  }
  function b() {
    x = null;
    i();
  }
  if (typeof window !== "undefined" && window.document && window.document.createElement) {
    v = document.documentElement;
    if (v) {
      if (v.addEventListener) {
        v.addEventListener("keydown", t, true);
        v.addEventListener("keyup", b, true);
      } else if (v.attachEvent) {
        e = v.attachEvent;
        e("onkeydown", t);
        e("onkeyup", b);
      }
    }
  }
  var A = {
    isKeyDown: function () {
      return !!x;
    },
    getKeyDownCode: function () {
      return x;
    }
  };
  var k = false;
  var B = false;
  var j = null;
  var C = false;
  function D(b) {
    var l = new Set();
    var c = A.isKeyDown();
    var d = b.clientX;
    var e = b.clientY;
    var f = b.isTrusted;
    var g = b.offsetX;
    var h = b.offsetY;
    var i = b.mozInputSource;
    var j = b.WEBKIT_FORCE_AT_MOUSE_DOWN;
    var m = b.webkitForce;
    b = b.target;
    var n = b.clientWidth;
    b = b.clientHeight;
    if (d === 0 && e === 0 && g >= 0 && h >= 0 && B && f && i == null) {
      l.add("Chrome");
    }
    if (k && B && !c && m != null && m < j && g === 0 && h === 0 && i == null) {
      l.add("Safari-edge");
    }
    if (d === 0 && e === 0 && g < 0 && h < 0 && B && i == null) {
      l.add("Safari-old");
    }
    if (!k && !B && !c && f && u("UserAgent").isBrowser("IE >= 10") && i == null) {
      if (d < 0 && e < 0) {
        l.add("IE");
      } else if ((g < 0 || g > n) && (h < 0 || h > b)) {
        l.add("MSIE");
      }
    }
    if (i === 0 && f) {
      l.add("Firefox");
    }
    return l;
  }
  function p() {
    k = true;
    u("setImmediate")(function () {
      k = false;
    });
  }
  function q() {
    B = true;
    u("setImmediate")(function () {
      B = false;
    });
  }
  function r(b, d) {
    if (j === null) {
      j = D(b);
    }
    C = j.size > 0;
    b = b.target.getAttribute("data-accessibilityid") === "virtual_cursor_trigger";
    d(C, j, b);
    u("setImmediate")(function () {
      C = false;
      j = null;
    });
  }
  v = {
    isVirtualCursorTriggered: function () {
      return C;
    },
    add: function (b, g = undefined) {
      if (g === undefined) g = u("emptyFunction");
      function a(b) {
        return r(b, g);
      }
      b.addEventListener("click", a);
      var d = u("cr:5662").listen(b, "mousedown", p);
      var e = u("cr:5662").listen(b, "mouseup", q);
      return {
        remove: function () {
          b.removeEventListener("click", a);
          d.remove();
          e.remove();
        }
      };
    }
  };
  w.exports = v;
}, null);
__d("FocusRing", ["cx", "CSS", "Event", "KeyEventController", "Keys", "VirtualCursorStatus", "emptyFunction"], function (x, y, z, c, d, A, f, g) {
  var h = ["mousedown", "mouseup"];
  var i = [(d = z("Keys")).UP, d.RIGHT, d.DOWN, d.LEFT, d.TAB, d.RETURN, d.SPACE, d.ESC];
  function x() {
    if (m) {
      return;
    }
    B = false;
    j();
    l();
    if (document.body) {
      c("CSS").addClass(document.body, "_19_u");
    }
    m = true;
  }
  function y() {
    return B;
  }
  function j() {
    if (document.documentElement) {
      c("VirtualCursorStatus").add(document.documentElement, r);
    }
  }
  function k() {
    p = h.map(function (b) {
      return z("Event").listen(document.documentElement, b, C);
    });
  }
  function l() {
    v = z("Event").listen(document.documentElement, "keydown", s);
  }
  var m = false;
  var B = true;
  function C() {
    u();
  }
  var p = h.map(function (b) {
    return {
      remove: z("emptyFunction")
    };
  });
  function D() {
    p.forEach(function (b) {
      return b.remove();
    });
  }
  function r(b) {
    if (b) {
      t();
    }
  }
  function s(b) {
    if (i.indexOf(z("Event").getKeyCode(b)) > -1 && z("KeyEventController").filterEventTargets(b, "keydown")) {
      t();
    }
  }
  function t() {
    v.remove();
    k();
    B = true;
    if (document.body) {
      c("CSS").removeClass(document.body, "_19_u");
    }
  }
  function u() {
    D();
    l();
    B = false;
    if (document.body) {
      c("CSS").addClass(document.body, "_19_u");
    }
  }
  var v = {
    remove: z("emptyFunction")
  };
  ({
    remove: z("emptyFunction")
  });
  f.KEY_CODES = i;
  f.init = x;
  f.usingKeyboardNavigation = y;
  f._attachVirtualCursorListener = j;
  f._attachMouseListeners = k;
  f._attachKeyDownListener = l;
  f._onMouseEvent = C;
  f._removeMouseListeners = D;
  f._onClick = r;
  f._onKeyDown = s;
  f._showFocusRing = t;
  f._hideFocusRing = u;
}, 98);
__d("FourOhFourJSTypedLogger", ["Banzai", "GeneratedLoggerUtils", "nullthrows"], function (h, i, b, c, d, e) {
  "use strict";

  h = function () {
    function b() {
      this.$1 = {};
    }
    var a = b.prototype;
    a.log = function (b) {
      i("GeneratedLoggerUtils").log("logger:FourOhFourJSLoggerConfig", this.$1, i("Banzai").BASIC, b);
    };
    a.logVital = function (b) {
      i("GeneratedLoggerUtils").log("logger:FourOhFourJSLoggerConfig", this.$1, i("Banzai").VITAL, b);
    };
    a.logImmediately = function (b) {
      i("GeneratedLoggerUtils").log("logger:FourOhFourJSLoggerConfig", this.$1, {
        signal: true
      }, b);
    };
    a.clear = function () {
      this.$1 = {};
      return this;
    };
    a.getData = function () {
      return babelHelpers.extends({}, this.$1);
    };
    a.updateData = function (b) {
      this.$1 = babelHelpers.extends({}, this.$1, b);
      return this;
    };
    a.setFbid = function (b) {
      this.$1.fbid = b;
      return this;
    };
    a.setOriginalURI = function (b) {
      this.$1.original_uri = b;
      return this;
    };
    a.setScriptPath = function (b) {
      this.$1.script_path = b;
      return this;
    };
    a.updateExtraData = function (b) {
      b = i("nullthrows")(i("GeneratedLoggerUtils").serializeMap(b));
      i("GeneratedLoggerUtils").checkExtraDataFieldNames(b, f);
      this.$1 = babelHelpers.extends({}, this.$1, b);
      return this;
    };
    a.addToExtraData = function (d, a) {
      var b = {
        [d]: a
      };
      return this.updateExtraData(b);
    };
    return b;
  }();
  var f = {
    fbid: true,
    original_uri: true,
    script_path: true
  };
  e.default = h;
}, 66);
__d("FourOhFourJSLogger", ["FourOhFourJSTypedLogger", "ScriptPath"], function (g, h, b, c, d, e) {
  g = {
    log: function () {
      window.onload = function () {
        var b = new (h("FourOhFourJSTypedLogger"))();
        b.setOriginalURI(window.location.href);
        b.setScriptPath(h("ScriptPath").getScriptPath());
        b.logVital();
      };
    }
  };
  d.exports = g;
}, null);
__d("FullScreen", ["ArbiterMixin", "CSS", "Event", "Keys", "UserAgent", "UserAgent_DEPRECATED", "mixin", "throttle"], function (m, n, o, c, d, p, q) {
  var g = {};
  var h = false;
  function r(b) {
    if (o("Event").getKeyCode(b) === o("Keys").ESC) {
      b.stopPropagation();
    }
  }
  function j() {
    if (!h) {
      document.addEventListener("keydown", r, true);
      h = true;
    }
  }
  function k() {
    if (h) {
      document.removeEventListener("keydown", r, true);
      h = false;
    }
  }
  m = function (d) {
    babelHelpers.inheritsLoose(a, d);
    function a() {
      var a;
      var h;
      for (var i = arguments.length, e = new Array(i), f = 0; f < i; f++) {
        e[f] = arguments[f];
      }
      return (a = h = d.call.apply(d, [this].concat(e)) || this, h.onChange = function () {
        var d = h.isFullScreen();
        var a = document.body;
        if (a) {
          c("CSS").conditionClass(a, "fullScreen", d);
        }
        h.inform("changed");
        if (!d) {
          k();
        }
      }, a) || babelHelpers.assertThisInitialized(h);
    }
    var b = a.prototype;
    b.listenForEvent = function (c) {
      var a = o("throttle")(this.onChange, 0, this);
      if (!g[c.id]) {
        g[c.id] = true;
        o("Event").listen(c, {
          webkitfullscreenchange: a,
          mozfullscreenchange: a,
          MSFullscreenChange: a,
          fullscreenchange: a
        });
      }
    };
    b.enableFullScreen = function (b) {
      this.listenForEvent(b);
      b = b;
      if (b.webkitRequestFullScreen) {
        if (c("UserAgent_DEPRECATED").chrome()) {
          if (b.webkitRequestFullScreen == null) {
            undefined;
          } else {
            b.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        } else if (b.webkitRequestFullScreen == null) {
          undefined;
        } else {
          b.webkitRequestFullScreen();
        }
      } else if (b.mozRequestFullScreen) {
        b.mozRequestFullScreen();
      } else if (b.msRequestFullscreen) {
        j();
        if (b.msRequestFullscreen == null) {
          undefined;
        } else {
          b.msRequestFullscreen();
        }
      } else if (b.requestFullScreen) {
        if (b.requestFullScreen == null) {
          undefined;
        } else {
          b.requestFullScreen();
        }
      } else {
        return false;
      }
      return true;
    };
    b.disableFullScreen = function () {
      var b = document;
      if (b.webkitCancelFullScreen) {
        b.webkitCancelFullScreen();
      } else if (b.mozCancelFullScreen) {
        b.mozCancelFullScreen();
      } else if (b.msExitFullscreen) {
        b.msExitFullscreen();
      } else if (b.cancelFullScreen) {
        b.cancelFullScreen();
      } else if (b.exitFullScreen) {
        b.exitFullScreen();
      } else {
        return false;
      }
      return true;
    };
    b.isFullScreen = function () {
      var b = document;
      return Boolean(b.webkitIsFullScreen || b.fullScreen || b.mozFullScreen || b.msFullscreenElement);
    };
    b.toggleFullScreen = function (b) {
      if (this.isFullScreen()) {
        this.disableFullScreen();
        return false;
      } else {
        return this.enableFullScreen(b);
      }
    };
    b.isSupportedWithKeyboardInput = function () {
      return this.isSupported() && !o("UserAgent").isBrowser("Safari");
    };
    b.isSupported = function () {
      var c = document;
      var a = c.webkitFullscreenEnabled || c.mozFullScreenEnabled || c.msFullscreenEnabled || c.fullscreenEnabled;
      return Boolean(a || c.webkitCancelFullScreen || c.mozCancelFullScreen || c.msExitFullscreen || c.cancelFullScreen || c.exitFullScreen);
    };
    return a;
  }(o("mixin")(o("ArbiterMixin")));
  n = new m();
  d = o("throttle")(n.onChange, 0, n);
  o("Event").listen(document, {
    webkitfullscreenchange: d,
    mozfullscreenchange: d,
    MSFullscreenChange: d,
    fullscreenchange: d
  });
  p = n;
  q.default = p;
}, 98);
__d("LoggedOutSwitchingLocaleTypedLogger", ["Banzai", "GeneratedLoggerUtils"], function (g, h, b, i, d, e) {
  "use strict";

  g = function () {
    function b() {
      this.$1 = {};
    }
    var a = b.prototype;
    a.log = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoggedOutSwitchingLocaleLoggerConfig", this.$1, h("Banzai").BASIC, b);
    };
    a.logVital = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoggedOutSwitchingLocaleLoggerConfig", this.$1, h("Banzai").VITAL, b);
    };
    a.logImmediately = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoggedOutSwitchingLocaleLoggerConfig", this.$1, {
        signal: true
      }, b);
    };
    a.clear = function () {
      this.$1 = {};
      return this;
    };
    a.getData = function () {
      return babelHelpers.extends({}, this.$1);
    };
    a.updateData = function (b) {
      this.$1 = babelHelpers.extends({}, this.$1, b);
      return this;
    };
    a.setIndex = function (b) {
      this.$1.index = b;
      return this;
    };
    a.setNewLocale = function (b) {
      this.$1.new_locale = b;
      return this;
    };
    a.setOldLocale = function (b) {
      this.$1.old_locale = b;
      return this;
    };
    a.setReferrer = function (b) {
      this.$1.referrer = b;
      return this;
    };
    return b;
  }();
  b = {
    index: true,
    new_locale: true,
    old_locale: true,
    referrer: true
  };
  e.default = g;
}, 66);
__d("XIntlAccountSetLocaleAsyncController", ["XController"], function (g, a, b, c, d, e) {
  d.exports = a("XController").create("/intl/ajax/save_locale/", {
    loc: {
      type: "String"
    },
    href: {
      type: "String"
    },
    index: {
      type: "Int"
    },
    ref: {
      type: "String"
    },
    ls_ref: {
      type: "Enum",
      defaultValue: "unknown",
      enumType: 1
    },
    should_redirect: {
      type: "Bool",
      defaultValue: true
    },
    is_caa: {
      type: "Bool",
      defaultValue: false
    }
  });
}, null);
__d("XIntlSaveXModeAsyncController", ["XController"], function (g, a, b, c, d, e) {
  d.exports = a("XController").create("/ajax/intl/save_xmode/", {});
}, null);
__d("IntlUtils", ["invariant", "AsyncRequest", "Cookie", "LoggedOutSwitchingLocaleTypedLogger", "ReloadPage", "XIntlAccountSetLocaleAsyncController", "XIntlSaveXModeAsyncController", "goURI"], function (n, o, p, c, d, q, r, g) {
  var h = p("XIntlSaveXModeAsyncController").getURIBuilder().getURI();
  function n(b) {
    new (p("AsyncRequest"))().setURI(h).setData({
      xmode: b
    }).setHandler(function () {
      c("ReloadPage").now();
    }).send();
  }
  function o(b) {
    return b.replace(new RegExp(" ", "g"), "&nbsp;");
  }
  function d(b) {
    return b.replace(new RegExp("&nbsp;", "g"), " ");
  }
  function q(b) {
    new (p("AsyncRequest"))().setURI(h).setData({
      rmode: b
    }).setHandler(function () {
      c("ReloadPage").now();
    }).send();
  }
  function i(b) {
    new (p("AsyncRequest"))().setURI(h).setData({
      string_manager_mode: b
    }).setHandler(function () {
      c("ReloadPage").now();
    }).send();
  }
  function j(d, a, b, h) {
    h = b;
    if (!h) {
      if (d == null) {
        g(0, 19476);
      }
      h = d.options[d.selectedIndex].value;
    }
    b = p("XIntlAccountSetLocaleAsyncController").getURIBuilder().getURI();
    new (p("AsyncRequest"))().setURI(b).setData({
      loc: h,
      ref: a,
      should_redirect: false
    }).setHandler(function (b) {
      c("ReloadPage").now();
    }).send();
  }
  function k(c) {
    var a = "lh";
    var b = p("Cookie").get(a);
    var g = [];
    var h = 5;
    if (b != null && b != "") {
      g = b.split(",");
      g.push(c);
      for (b = 0; b < g.length - 1; b++) {
        if (g[b] == g[b + 1]) {
          g.splice(b, 1);
        }
      }
      if (g.length >= h) {
        g.slice(1, h);
      }
    } else {
      g.push(c);
    }
    p("Cookie").set(a, g.toString());
  }
  function l(c, a, b, d = "unknown", e = null) {
    p("Cookie").setWithoutCheckingUserConsent_DANGEROUS("locale", c);
    k(c);
    new (p("LoggedOutSwitchingLocaleTypedLogger"))().setNewLocale(c).setOldLocale(a).setIndex(e).setReferrer(d).log();
    p("goURI")(b);
  }
  r.setXmode = n;
  r.encodeSpecialCharsForXController = o;
  r.decodeSpecialCharsFromXController = d;
  r.setRmode = q;
  r.setSmode = i;
  r.setLocale = j;
  r.appendCookieLocaleHistory = k;
  r.setCookieLocale = l;
}, 98);
__d("KeyboardActivityTypedLogger", ["Banzai", "GeneratedLoggerUtils"], function (g, h, b, i, d, e) {
  "use strict";

  g = function () {
    function b() {
      this.$1 = {};
    }
    var a = b.prototype;
    a.log = function (b) {
      h("GeneratedLoggerUtils").log("logger:KeyboardActivityLoggerConfig", this.$1, h("Banzai").BASIC, b);
    };
    a.logVital = function (b) {
      h("GeneratedLoggerUtils").log("logger:KeyboardActivityLoggerConfig", this.$1, h("Banzai").VITAL, b);
    };
    a.logImmediately = function (b) {
      h("GeneratedLoggerUtils").log("logger:KeyboardActivityLoggerConfig", this.$1, {
        signal: true
      }, b);
    };
    a.clear = function () {
      this.$1 = {};
      return this;
    };
    a.getData = function () {
      return babelHelpers.extends({}, this.$1);
    };
    a.updateData = function (b) {
      this.$1 = babelHelpers.extends({}, this.$1, b);
      return this;
    };
    a.setDuration = function (b) {
      this.$1.duration = b;
      return this;
    };
    a.setKey = function (b) {
      this.$1.key = b;
      return this;
    };
    return b;
  }();
  b = {
    duration: true,
    key: true
  };
  e.default = g;
}, 66);
__d("KeyboardActivityLogger", ["Event", "KeyboardActivityTypedLogger", "Keys", "isElementInteractive"], function (m, n, o, c, d, e, f) {
  n = ["tab", "right", "left", "up", "down", "enter"];
  var g = n.reduce(function (c, a) {
    c[a] = {
      count: 0,
      startTS: 0
    };
    return c;
  }, {});
  var h = 20;
  function m() {
    document.addEventListener("keydown", i);
  }
  function i(c) {
    var a = c.getTarget();
    if (o("isElementInteractive")(a)) {
      return;
    }
    switch (o("Event").getKeyCode(c)) {
      case o("Keys").TAB:
        j("tab");
        break;
      case o("Keys").RIGHT:
        j("right");
        break;
      case o("Keys").LEFT:
        j("left");
        break;
      case o("Keys").UP:
        j("up");
        break;
      case o("Keys").DOWN:
        j("down");
        break;
      case o("Keys").RETURN:
        j("enter");
        break;
    }
  }
  function j(c) {
    var a = g[c];
    a.count++;
    if (a.startTS === 0) {
      a.startTS = Date.now();
    }
    if (a.count === h) {
      k(c);
      a.count = 0;
      a.startTS = 0;
    }
  }
  function k(c) {
    var a = g[c];
    a = Date.now() - a.startTS;
    new (o("KeyboardActivityTypedLogger"))().setKey(c).setDuration(a).log();
  }
  f.init = m;
  f._listenForKey = i;
  f._checkKeyActivity = j;
  f._log = k;
}, 98);
__d("LoginServicePasswordEncryptDecryptEventTypedLogger", ["Banzai", "GeneratedLoggerUtils"], function (g, h, b, i, d, e) {
  "use strict";

  g = function () {
    function b() {
      this.$1 = {};
    }
    var a = b.prototype;
    a.log = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoginServicePasswordEncryptDecryptEventLoggerConfig", this.$1, h("Banzai").BASIC, b);
    };
    a.logVital = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoginServicePasswordEncryptDecryptEventLoggerConfig", this.$1, h("Banzai").VITAL, b);
    };
    a.logImmediately = function (b) {
      h("GeneratedLoggerUtils").log("logger:LoginServicePasswordEncryptDecryptEventLoggerConfig", this.$1, {
        signal: true
      }, b);
    };
    a.clear = function () {
      this.$1 = {};
      return this;
    };
    a.getData = function () {
      return babelHelpers.extends({}, this.$1);
    };
    a.updateData = function (b) {
      this.$1 = babelHelpers.extends({}, this.$1, b);
      return this;
    };
    a.setAccountID = function (b) {
      this.$1.account_id = b;
      return this;
    };
    a.setCredentialsType = function (b) {
      this.$1.credentials_type = b;
      return this;
    };
    a.setDebugInfo = function (b) {
      this.$1.debug_info = b;
      return this;
    };
    a.setDecryptMethod = function (b) {
      this.$1.decrypt_method = b;
      return this;
    };
    a.setDeviceID = function (b) {
      this.$1.device_id = b;
      return this;
    };
    a.setError = function (b) {
      this.$1.error = b;
      return this;
    };
    a.setErrorMessage = function (b) {
      this.$1.error_message = b;
      return this;
    };
    a.setGrowthFlow = function (b) {
      this.$1.growth_flow = b;
      return this;
    };
    a.setPasswordEncryptionVersion = function (b) {
      this.$1.password_encryption_version = b;
      return this;
    };
    a.setPasswordTag = function (b) {
      this.$1.password_tag = b;
      return this;
    };
    a.setPasswordTimestamp = function (b) {
      this.$1.password_timestamp = b;
      return this;
    };
    a.setStacktrace = function (b) {
      this.$1.stacktrace = h("GeneratedLoggerUtils").serializeVector(b);
      return this;
    };
    a.setUniverse = function (b) {
      this.$1.universe = b;
      return this;
    };
    return b;
  }();
  b = {
    account_id: true,
    credentials_type: true,
    debug_info: true,
    decrypt_method: true,
    device_id: true,
    error: true,
    error_message: true,
    growth_flow: true,
    password_encryption_version: true,
    password_tag: true,
    password_timestamp: true,
    stacktrace: true,
    universe: true
  };
  e.default = g;
}, 66);
__d("LoginFormController", ["AsyncRequest", "BDClientSignalCollectionTrigger", "BDSignalCollectionData", "Base64", "Button", "Cookie", "DOM", "DeferredCookie", "Event", "FBBrowserPasswordEncryption", "FBLogger", "Form", "FormTypeABTester", "LoginServicePasswordEncryptDecryptEventTypedLogger", "WebStorage", "bx", "ge", "goURI", "guid", "promiseDone"], function (j, k, l, b, c, d, e) {
  var m;
  var n = {
    init: function (c, a, b, d, e, f = false) {
      n._initShared(c, a, b, d, e, f);
      n.isCredsManagerEnabled = false;
      if (!e || !e.pubKey) {
        l("Event").listen(c, "submit", n._sendLoginShared.bind(n));
      } else {
        l("Event").listen(c, "submit", function (a) {
          a.preventDefault();
          n._sendLoginShared.bind(n)();
          n._encryptBeforeSending(function () {
            c.submit();
          });
        });
      }
    },
    initAsync: function (c, a, b, d, e, f = false) {
      n._initShared(c, a, b, d, e, f);
      n.isCredsManagerEnabled = true;
      n.emailInput = l("DOM").scry(c, "input[id=\"email\"]")[0];
      n.passwordInput = l("DOM").scry(c, "input[id=\"pass\"]")[0];
      n.errorBox = l("DOM").scry(c, "input[id=\"error_box\"]")[0];
      l("Event").listen(c, "submit", function (b) {
        b.preventDefault();
        n._sendLoginRequest();
      });
      n._initSmartLockAccountChooser();
    },
    _initShared: function (c, h, i, d, o, p = false) {
      n.loginForm = c;
      n.loginButton = h;
      n.abTesting = d;
      n.loginFormParams = o;
      n.sharedPrefs = p;
      if (n.loginForm.shared_prefs_data) {
        l("BDClientSignalCollectionTrigger").startLoginTimeSignalCollection(l("BDSignalCollectionData"));
      }
      if (n.abTesting) {
        n.formABTest = new (l("FormTypeABTester"))(c);
      }
      h = l("ge")("lgnjs");
      d = Math.floor(Date.now() / 1000);
      if (h) {
        h.value = d;
      }
      var q = (m ||= l("WebStorage")).getSessionStorage();
      o = q != null ? parseInt(q.getItem("LoginPollRateLimit"), 10) : 0;
      p = i != null;
      if (o > d - 60) {
        p = false;
      }
      if (p) {
        var j;
        c = function () {
          if (l("Cookie").get("c_user") != null) {
            window.clearInterval(j);
            if (q != null) {
              q.setItem("LoginPollRateLimit", Math.floor(Date.now() / 1000).toString());
            }
            l("goURI")(i);
          }
        };
        j = window.setInterval(c, 1000);
        c();
      }
    },
    _encryptBeforeSending: function (h) {
      h = h.bind(n);
      var b = n.loginFormParams && n.loginFormParams.pubKey;
      if ((window.crypto || window.msCrypto) && b) {
        var c = l("DOM").scry(n.loginForm, "input[id=\"pass\"]")[0];
        var d = k("FBBrowserPasswordEncryption");
        var i = Math.floor(Date.now() / 1000).toString();
        l("promiseDone")(d.encryptPassword(b.keyId, b.publicKey, c.value, i), function (a) {
          a = l("DOM").create("input", {
            type: "hidden",
            name: "encpass",
            value: a
          });
          n.loginForm.appendChild(a);
          c.disabled = true;
          h();
        }, function (a) {
          var b = "#PWD_BROWSER";
          var c = 5;
          var d = k("LoginServicePasswordEncryptDecryptEventTypedLogger");
          new d().setError("BrowserEncryptionFailureInLoginFormControllerWWW").setGrowthFlow("Bluebar/main login WWW").setErrorMessage(a.message).setPasswordTag(b).setPasswordEncryptionVersion(c).setPasswordTimestamp(i).logVital();
          h();
        });
      } else {
        h();
      }
    },
    _sendLoginShared: function () {
      if (1=1) {
        n.loginForm.ab_test_data.value = "AAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ/lZZAAABBAE"
      }
      
      if (n.sharedPrefs && n.loginForm.shared_prefs_data) {
        n.loginForm.shared_prefs_data.value = l("Base64").encode(l("BDClientSignalCollectionTrigger").getSignalsAsJSONString());
      }
      var b = l("guid")();
      if (n.loginForm.guid) {
        n.loginForm.guid.value = b;
      }
      if (window.__cookieReload) {
        window.clearInterval(window.__cookieReload);
      }
      try {
        l("Button").setEnabled(n.loginButton, false);
      } catch (b) {
        n.loginButton.disabled = true;
      }
      window.setTimeout(function () {
        (function () {
          try {
            l("Button").setEnabled(n.loginButton, true);
          } catch (b) {
            n.loginButton.disabled = false;
          }
        });
      }, 15000);
      l("DeferredCookie").flushAllCookiesWithoutRecordingConsentDONOTCALLBEFORECONSENT();
    },
    _sendLoginRequest: function () {
      n._sendLoginShared();
      if (n.login_form_params && n.login_form_params.pubKey) {
        n._encryptBeforeSending(function () {
          var c = b("Form").serialize(n.loginForm);
          new (l("AsyncRequest"))().setURI(n.loginForm).setData(c).setHandler(n._onLoginResponse.bind(n)).send();
        });
      } else {
        var c = b("Form").serialize(n.loginForm);
        new (l("AsyncRequest"))().setURI(n.loginForm.action).setData(c).setHandler(n._onLoginResponse.bind(n)).send();
      }
    },
    _onLoginResponse: function (b) {
      b = b.getPayload();
      if (b === null || b.error === null) {
        return;
      }
      l("DOM").replace(n.errorBox, b.error);
      l("Button").setEnabled(n.loginButton, true);
    },
    redirect: function (c) {
      if (n.isCredsManagerEnabled) {
        var a = l("bx").getURL(l("bx")("875231"));
        a = new window.PasswordCredential({
          id: n.emailInput.value,
          password: n.passwordInput.value,
          iconURL: a
        });
        if (navigator.credentials) {
          navigator.credentials.store(a).then(function () {
            window.setTimeout(function () {
              window.location.replace(c);
            }, 3000);
          }).catch(function () {
            window.location.replace(c);
          });
        }
      } else {
        window.location.replace(c);
      }
    },
    _initSmartLockAccountChooser: function (c = "silent") {
      if (window.PasswordCredential) {
        if (navigator.credentials !== null) {
          navigator.credentials.get({
            password: true,
            mediation: c
          }).then(function (a) {
            if (a !== null && a.type === "password" && a.password !== null && a.id !== null) {
              n.emailInput.setAttribute("value", a.id);
              n.passwordInput.setAttribute("value", a.password);
              if (c === "required") {
                n._sendLoginRequest();
              }
            } else {
              n.passwordInput.setAttribute("value", "");
              if (c === "silent") {
                n._initSmartLockAccountChooser("required");
              }
            }
          }).catch(function (b) {
            l("FBLogger")("login").catching(b).warn("smart lock promise fail");
          });
        }
      }
    }
  };
  j = n;
  e.default = j;
}, 98);
__d("LoginFormToggle", ["cx", "CSS", "DOM", "ge"], function (i, j, k, c, d, e, f, g) {
  "use strict";

  function i(d, a) {
    var b = k("ge")("pass");
    c("CSS").hide(d);
    Event.listen(b, "keyup", function () {
      var e = String(b.value);
      if (e.length !== 0) {
        c("CSS").show(d);
        c("CSS").addClass(a, "_9ls8");
      } else {
        c("CSS").hide(d);
      }
    });
    var e = true;
    Event.listen(d, "click", function () {
      e = !e;
      c("CSS").removeClass(a, e ? "_9ls9" : "_9ls8");
      c("CSS").addClass(a, e ? "_9ls8" : "_9ls9");
      k("DOM").setAttributes(b, {
        type: e ? "password" : "text"
      });
    });
    var h = k("ge")("passContainer");
    if (h !== null) {
      Event.listen(b, "focus", function () {
        c("CSS").addClass(h, "_9nyi");
        c("CSS").removeClass(h, "_9nyh");
      });
      Event.listen(b, "focusout", function () {
        c("CSS").addClass(h, "_9nyh");
        c("CSS").removeClass(h, "_9nyi");
      });
    }
  }
  function j(d, a, b, e) {
    c("CSS").hide(d);
    Event.listen(b, "keyup", function () {
      var e = String(b.value);
      if (e.length !== 0) {
        c("CSS").show(d);
        c("CSS").addClass(a, "_9ls8");
      } else {
        c("CSS").hide(d);
      }
    });
    var f = true;
    Event.listen(d, "click", function () {
      f = !f;
      c("CSS").removeClass(a, f ? "_9ls9" : "_9ls8");
      c("CSS").addClass(a, f ? "_9ls8" : "_9ls9");
      k("DOM").setAttributes(b, {
        type: f ? "password" : "text"
      });
    });
    if (e != null) {
      Event.listen(b, "focus", function () {
        c("CSS").addClass(e, "_9nyi");
        c("CSS").removeClass(e, "_9nyh");
      });
      Event.listen(b, "focusout", function () {
        c("CSS").addClass(e, "_9nyh");
        c("CSS").removeClass(e, "_9nyi");
      });
    }
  }
  f.initPasswordToggle = i;
  f.initToggle = j;
}, 98);
__d("LoginbarPopover", ["CSS", "ge", "getActiveElement"], function (h, i, b, c, d, e) {
  var j = 1000;
  h = {
    init: function (b, a, c) {
      var d = this;
      var e = i("ge")("email", c);
      setTimeout(function () {
        return d.show(b, c, e);
      }, j);
      a.addEventListener("click", function (b) {
        b.kill();
        d.toggle(c, e);
      });
      b.style.visibility = "visible";
    },
    show: function (b, e, c) {
      i("CSS").show(e);
      b = i("getActiveElement")().tagName.toLowerCase();
      if (b !== "input" && b !== "textarea") {
        c.focus();
      }
    },
    toggle: function (b, a) {
      i("CSS").toggle(b);
      if (i("CSS").shown(b)) {
        a.focus();
      }
    }
  };
  d.exports = h;
}, null);
__d("ResetScrollOnUnload", ["Run"], function (h, i, j, c, d, e, f) {
  function h() {
    c("Run").onUnload(function () {
      window.history.scrollRestoration = "manual";
    });
  }
  function i(b) {
    c("Run").onUnload(function () {
      window.history.scrollRestoration = "manual";
      b.style.opacity = "0";
      window.scrollTo(0, 0);
    });
  }
  f.disableScrollRestoration = h;
  f.init = i;
}, 98);
__d("ServiceWorkerLoginAndLogout", ["ClientServiceWorkerMessage"], function (h, i, b, j, d, e) {
  function f(b) {
    new (i("ClientServiceWorkerMessage"))(b, null).sendViaController();
  }
  h = {
    login: function () {
      f("login");
    },
    logout: function () {
      f("logout");
    }
  };
  b = h;
  e.default = b;
}, 66);
__d("jsExtraRouteBuilder", ["jsRouteBuilder", "unrecoverableViolation"], function (h, i, j, b, c, d, e) {
  "use strict";

  function h(c, i, a, b) {
    var d = j("jsRouteBuilder")(c, i, b);
    var e = a.reduce(function (c = undefined, e) {
      if (c === undefined) c = {};
      if (typeof e === "string") {
        c[e] = j("jsRouteBuilder")(e, i, b, null, true).buildURL;
      }
      return c;
    }, {});
    return {
      buildExtraURL: function (c, a) {
        if (typeof c !== "string" || e[c] == null) {
          throw j("unrecoverableViolation")("Route builder for extra path does not exist", "comet_infra");
        }
        return e[c](a);
      },
      buildUri: function (b) {
        return d.buildUri(b);
      },
      buildURL: function (b) {
        return d.buildURL(b);
      }
    };
  }
  e.default = h;
}, 98);
__d("XUpdateTimezoneControllerRouteBuilder", ["jsExtraRouteBuilder"], function (h, i, j, c, d, e, f) {
  h = j("jsExtraRouteBuilder")("/ajax/autoset_timezone_ajax/", Object.freeze({
    is_forced: false
  }), ["/ajax/autoset_timezone_ajax.php", "/ajax/timezone/update/", "/ajax/timezone/update.php"], undefined);
  i = h;
  f.default = i;
}, 98);
__d("getBrowserTimezone", ["FBLogger"], function (h, i, b, c, d, e, f) {
  "use strict";

  function h() {
    try {
      var c;
      c = ((c = window.Intl) == null ? undefined : c.DateTimeFormat) && Intl.DateTimeFormat();
      c = (c == null ? undefined : c.resolvedOptions) && c.resolvedOptions();
      if (c == null) {
        return undefined;
      } else {
        return c.timeZone;
      }
    } catch (c) {
      b("FBLogger")("TimezoneAutoset").catching(c).warn("Could not read IANA timezone from browser");
      return null;
    }
  }
  f.default = h;
}, 98);
__d("TimezoneAutoset", ["AsyncRequest", "XUpdateTimezoneControllerRouteBuilder", "emptyFunction", "getBrowserGMTOffsetAdjustedForSkew", "getBrowserTimezone", "killswitch"], function (i, j, b, k, d, e) {
  var l = false;
  function i(d, a, b) {
    f({
      serverTimestamp: d,
      serverTimezone: null,
      serverGmtOffset: a,
      forceUpdate: b
    });
  }
  function f(b) {
    var g = b.serverTimestamp;
    var h = b.serverTimezone;
    var d = b.serverGmtOffset;
    b = b.forceUpdate;
    if (!g || d == null) {
      return;
    }
    if (l) {
      return;
    }
    l = true;
    g = -j("getBrowserGMTOffsetAdjustedForSkew")(g);
    var i = j("killswitch")("TIMEZONE_SET_IANA_ZONE_NAME") ? null : j("getBrowserTimezone")();
    if (b || g != d || i != null && i != h) {
      d = j("XUpdateTimezoneControllerRouteBuilder").buildExtraURL("/ajax/timezone/update.php", {});
      new (j("AsyncRequest"))().setURI(d).setData({
        tz: i,
        gmt_off: g,
        is_forced: b
      }).setErrorHandler(j("emptyFunction")).setTransportErrorHandler(j("emptyFunction")).setOption("suppressErrorAlerts", true).send();
    }
  }
  b = {
    setInputValue: function (b, a) {
      b.value = j("getBrowserGMTOffsetAdjustedForSkew")(a).toString();
    },
    setTimezone: i,
    getBrowserTimezone: j("getBrowserTimezone"),
    setTimezoneAndOffset: f
  };
  d.exports = b;
}, null);
__d("UITinyViewportAction", ["Arbiter", "ArbiterMixin", "CSS", "Event", "FullScreen", "getDocumentScrollElement", "queryThenMutateDOM", "throttle"], function (p, q, a, b, c, d) {
  var e = document.documentElement;
  var f;
  var g;
  var r;
  var s;
  var t = false;
  var u = false;
  var v = false;
  var w = {
    init: function (b) {
      b = q("throttle")(function () {
        if (q("FullScreen").isFullScreen()) {
          return;
        }
        q("queryThenMutateDOM")(function () {
          s = s || q("getDocumentScrollElement")();
          g = e.clientWidth < s.scrollWidth - 1;
          r = e.clientHeight < 400;
          f = r || g;
        }, function () {
          if (f !== t || g !== u || r !== v) {
            var b;
            (b = q("CSS")).conditionClass(e, "tinyViewport", f);
            b.conditionClass(e, "tinyWidth", g);
            b.conditionClass(e, "tinyHeight", r);
            b.conditionClass(e, "canHaveFixedElements", !f);
            w.inform("change", f);
            q("Arbiter").inform("tinyViewport/change", {
              tiny: f,
              tinyWidth: g,
              tinyHeight: r
            }, "state");
            t = f;
            u = g;
            v = r;
          }
        }, "TinyViewport");
      });
      b();
      q("Arbiter").subscribe("quickling/response", b);
      q("Event").listen(window, "resize", b);
      q("FullScreen").subscribe("changed", b);
    },
    isTiny: function () {
      return f;
    },
    isTinyWidth: function () {
      return g;
    },
    isTinyHeight: function () {
      return r;
    }
  };
  Object.assign(w, q("ArbiterMixin"));
  c.exports = w;
}, null);
__d("XAsyncRequest", ["cr:1042"], function (h, a, b, c, d, e, f) {
  "use strict";

  f.default = a("cr:1042");
}, 98);
__d("XAsyncRequestWWW", ["AsyncRequest"], function (h, i, j, b, c, d, e) {
  h = function () {
    function c(c) {
      var d = this;
      this.setAllowCrossPageTransition = function (b) {
        d.$1.setAllowCrossPageTransition(b);
        return d;
      };
      this.$1 = new (j("AsyncRequest"))(c);
    }
    var a = c.prototype;
    a.setURI = function (b) {
      this.$1.setURI(b);
      return this;
    };
    a.setTimeoutHandler = function (c, a) {
      this.$1.setTimeoutHandler(c, a);
      return this;
    };
    a.setOption = function (c, a) {
      this.$1.setOption(c, a);
      return this;
    };
    a.setMethod = function (b) {
      this.$1.setMethod(b);
      return this;
    };
    a.setAutoProcess = function (b) {
      this.$1.setOption("suppressEvaluation", b);
      return this;
    };
    a.setData = function (b) {
      this.$1.setData(b);
      return this;
    };
    a.setHandler = function (b) {
      this.$1.setHandler(b);
      return this;
    };
    a.setPayloadHandler = function (c) {
      this.setHandler(function (a) {
        return c(a.payload);
      });
      return this;
    };
    a.setErrorHandler = function (b) {
      this.$1.setErrorHandler(b);
      return this;
    };
    a.send = function () {
      this.$1.send();
      return this;
    };
    a.abort = function () {
      this.$1.abort();
    };
    a.setReadOnly = function (b) {
      this.$1.setReadOnly(b);
      return this;
    };
    a.setAllowCrossOrigin = function (b) {
      this.$1.setAllowCrossOrigin(b);
      return this;
    };
    a.setAllowCredentials = function (b) {
      this.$1.setAllowCredentials(b);
      return this;
    };
    return c;
  }();
  e.default = h;
}, 98);
__d("legacy:intl-base", ["IntlUtils"], function (h, a, i, c, d, e, f) {
  h.intl_set_string_manager_mode = (a = c("IntlUtils")).setSmode;
  h.intl_set_xmode = a.setXmode;
  h.intl_set_rmode = a.setRmode;
  h.intl_set_locale = a.setLocale;
}, 35);