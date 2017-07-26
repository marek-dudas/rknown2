String.fromCodePoint || !function () {
    var e = function () {
        try {
            var e = {}, n = Object.defineProperty, t = n(e, e, e) && n
        } catch (o) {
        }
        return t
    }(), n = String.fromCharCode, t = Math.floor, o = function (e) {
        var o, c, r = 16384, a = [], i = -1, u = arguments.length;
        if (!u)return "";
        for (var s = ""; ++i < u;) {
            var l = Number(arguments[i]);
            if (!isFinite(l) || 0 > l || l > 1114111 || t(l) != l)throw RangeError("Invalid code point: " + l);
            65535 >= l ? a.push(l) : (l -= 65536, o = (l >> 10) + 55296, c = l % 1024 + 56320, a.push(o, c)), (i + 1 == u || a.length > r) && (s += n.apply(null, a), a.length = 0)
        }
        return s
    };
    e ? e(String, "fromCodePoint", {value: o, configurable: !0, writable: !0}) : String.fromCodePoint = o
}(), function (e) {
    var n = "object" == typeof exports && exports, t = "object" == typeof module && module && module.exports == n && module, o = "object" == typeof global && global;
    (o.global === o || o.window === o) && (e = o);
    var c = {}, r = c.hasOwnProperty, a = function (e, n) {
        var t;
        for (t in e)r.call(e, t) && n(t, e[t])
    }, i = function (e, n) {
        return n ? (a(n, function (n, t) {
                e[n] = t
            }), e) : e
    }, u = function (e, n) {
        for (var t = e.length, o = -1; ++o < t;)n(e[o])
    }, s = c.toString, l = function (e) {
        return "[object Array]" == s.call(e)
    }, f = function (e) {
        return "[object Object]" == s.call(e)
    }, d = function (e) {
        return "string" == typeof e || "[object String]" == s.call(e)
    }, g = function (e) {
        return "function" == typeof e || "[object Function]" == s.call(e)
    }, p = {
        '"': '\\"',
        "'": "\\'",
        "\\": "\\\\",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "	": "\\t"
    }, h = /["'\\\b\f\n\r\t]/, m = /[0-9]/, v = /[ !#-&\(-\[\]-~]/, y = function (e, n) {
        var t = {
            escapeEverything: !1,
            quotes: "single",
            wrap: !1,
            es6: !1,
            json: !1,
            compact: !0,
            indent: "	",
            __indent__: ""
        }, o = n && n.json;
        o && (t.quotes = "double", t.wrap = !0), n = i(t, n), "single" != n.quotes && "double" != n.quotes && (n.quotes = "single");
        var c, r, s = "double" == n.quotes ? '"' : "'", j = n.compact, S = n.indent, b = j ? "" : "\n", _ = !0;
        if (o && e && g(e.toJSON) && (e = e.toJSON()), !d(e))return l(e) ? (r = [], n.wrap = !0, c = n.__indent__, S += c, n.__indent__ = S, u(e, function (e) {
                _ = !1, r.push((j ? "" : S) + y(e, n))
            }), _ ? "[]" : "[" + b + r.join("," + b) + b + (j ? "" : c) + "]") : f(e) ? (r = [], n.wrap = !0, c = n.__indent__, S += c, n.__indent__ = S, a(e, function (e, t) {
                    _ = !1, r.push((j ? "" : S) + y(e, n) + ":" + (j ? "" : " ") + y(t, n))
                }), _ ? "{}" : "{" + b + r.join("," + b) + b + (j ? "" : c) + "}") : o ? JSON.stringify(e) || "null" : String(e);
        var E, C, k, w = e, I = -1, x = w.length;
        for (r = ""; ++I < x;) {
            var N = w.charAt(I);
            if (n.es6 && (E = w.charCodeAt(I), E >= 55296 && 56319 >= E && x > I + 1 && (C = w.charCodeAt(I + 1), C >= 56320 && 57343 >= C))) k = 1024 * (E - 55296) + C - 56320 + 65536, r += "\\u{" + k.toString(16).toUpperCase() + "}", I++; else {
                if (!n.escapeEverything) {
                    if (v.test(N)) {
                        r += N;
                        continue
                    }
                    if ('"' == N) {
                        r += s == N ? '\\"' : N;
                        continue
                    }
                    if ("'" == N) {
                        r += s == N ? "\\'" : N;
                        continue
                    }
                }
                if ("\x00" != N || o || m.test(w.charAt(I + 1)))if (h.test(N)) r += p[N]; else {
                    var A = N.charCodeAt(0), O = A.toString(16).toUpperCase(), T = O.length > 2 || o, B = "\\" + (T ? "u" : "x") + ("0000" + O).slice(T ? -4 : -2);
                    r += B
                } else r += "\\0"
            }
        }
        return n.wrap && (r = s + r + s), r
    };
    y.version = "0.5.0", "function" == typeof define && "object" == typeof define.amd && define.amd ? define(function () {
            return y
        }) : n && !n.nodeType ? t ? t.exports = y : n.jsesc = y : e.jsesc = y
}(this), function (e, n, t) {
    function o(e) {
        return encodeURIComponent(e).replace(/['()_*]/g, function (e) {
            return "%" + e.charCodeAt().toString(16)
        })
    }
    
    function c(e, n) {
        return null == n ? e.innerText || e.textContent : (null != e.innerText && (e.innerText = n), void(null != e.textContent && (e.textContent = n)))
    }
    
    function r(e) {
        return e.replace(/\\u\{([a-fA-F0-9]{1,6})\}/g, function (e, n) {
            var t = parseInt(n, 16);
            return String.fromCodePoint(t)
        })
    }
    
    function a() {
        var e, n = s.value.replace(/\\\n/g, "");
        try {
            e = p.checked ? t('"' + r(n).replace(/[\n\u2028\u2029"']/g, function (e) {
                        return v[e]
                    }).replace(/\\v/g, "") + '"') : n, e = jsesc(e, {
                quotes: d.checked ? "double" : "single",
                wrap: !0,
                escapeEverything: !f.checked,
                json: d.checked,
                es6: g.checked && !d.checked
            }), c(u, e), i.className = ""
        } catch (a) {
            i.className = "fail"
        }
        m && (m.jsEscapeText = n, f.checked ? m.jsEscapeOnlyASCII = !0 : m.removeItem("jsEscapeOnlyASCII"), d.checked ? m.jsEscapeOutputJSON = !0 : m.removeItem("jsEscapeOutputJSON"), p.checked ? m.jsEscapeStringBody = !0 : m.removeItem("jsEscapeStringBody")), g.disabled = d.checked, h.hash = +f.checked + o(s.value)
    }
    
    var i = n.getElementsByTagName("pre")[0], u = n.getElementsByTagName("code")[0], s = n.getElementsByTagName("textarea")[0], l = n.getElementsByTagName("input"), f = l[0], d = l[1], g = l[2], p = l[3], h = n.getElementById("permalink"), m = function () {
        var n, t, o = new Date;
        try {
            return (n = e.localStorage).setItem(o, o), t = n.getItem(o) == o, n.removeItem(o), t && n
        } catch (c) {
        }
    }(), v = {"\n": "\\n", '"': '\\"', "\u2028": "\\u2028", "\u2029": "\\u2029", "'": "\\'"};
    s.onkeyup = f.onchange = d.onchange = g.onchange = p.onchange = a, s.oninput = function () {
        s.onkeyup = null, a()
    }, i.ondblclick = function () {
        var t = e.getSelection(), o = n.createRange();
        o.selectNodeContents(i), t.removeAllRanges(), t.addRange(o)
    }, m && (m.jsEscapeText && (s.value = m.jsEscapeText), m.jsEscapeOnlyASCII && (f.checked = !0), m.jsEscapeOutputJSON && (d.checked = !0), m.jsEscapeStringBody && (p.checked = !0), a()), e.onhashchange = function () {
        var e = location.hash;
        "0" == e.charAt(1) && (f.checked = !1), s.value = decodeURIComponent(e.slice(2)), a()
    }, location.hash && e.onhashchange()
}(this, document, eval), window._gaq = [["_setAccount", "UA-6065217-60"], ["_trackPageview"]], function (e, n) {
    var t = e.createElement(n), o = e.getElementsByTagName(n)[0];
    t.src = "//www.google-analytics.com/ga.js", o.parentNode.insertBefore(t, o)
}(document, "script")