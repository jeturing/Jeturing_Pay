"use strict";
var __StripeExtExports = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@stripe/ui-extension-sdk/ui/manual_components.js
  var require_manual_components = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/ui/manual_components.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Inline = exports.Box = void 0;
      var react_1 = __require("@remote-ui/react");
      exports.Box = (0, react_1.createRemoteReactComponent)("Box");
      exports.Inline = (0, react_1.createRemoteReactComponent)("Inline");
    }
  });

  // node_modules/@stripe/ui-extension-sdk/ui/@sail/ui/index.js
  var require_ui = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/ui/@sail/ui/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.List = exports.ListItem = exports.TextField = exports.TextArea = exports.TabPanel = exports.Tab = exports.TableHeaderCell = exports.TableCell = exports.TableFooter = exports.TableRow = exports.TableBody = exports.TableHead = exports.Table = exports.Switch = exports.Select = exports.Radio = exports.Notice = exports.MenuTrigger = exports.MenuGroup = exports.MenuItem = exports.Menu = exports.Link = exports.FormFieldGroup = exports.Divider = exports.Checkbox = exports.ButtonGroup = exports.Button = exports.Badge = void 0;
      var react_1 = __require("@remote-ui/react");
      exports.Badge = (0, react_1.createRemoteReactComponent)("Badge");
      exports.Button = (0, react_1.createRemoteReactComponent)("Button");
      exports.ButtonGroup = (0, react_1.createRemoteReactComponent)("ButtonGroup", {
        fragmentProps: ["menuTrigger"]
      });
      exports.Checkbox = (0, react_1.createRemoteReactComponent)("Checkbox", {
        fragmentProps: ["label"]
      });
      exports.Divider = (0, react_1.createRemoteReactComponent)("Divider");
      exports.FormFieldGroup = (0, react_1.createRemoteReactComponent)("FormFieldGroup");
      exports.Link = (0, react_1.createRemoteReactComponent)("Link");
      exports.Menu = (0, react_1.createRemoteReactComponent)("Menu");
      exports.MenuItem = (0, react_1.createRemoteReactComponent)("MenuItem");
      exports.MenuGroup = (0, react_1.createRemoteReactComponent)("MenuGroup", {
        fragmentProps: ["title"]
      });
      exports.MenuTrigger = (0, react_1.createRemoteReactComponent)("MenuTrigger");
      exports.Notice = (0, react_1.createRemoteReactComponent)("Notice");
      exports.Radio = (0, react_1.createRemoteReactComponent)("Radio", {
        fragmentProps: ["label"]
      });
      exports.Select = (0, react_1.createRemoteReactComponent)("Select", {
        fragmentProps: ["label"]
      });
      exports.Switch = (0, react_1.createRemoteReactComponent)("Switch", {
        fragmentProps: ["label"]
      });
      exports.Table = (0, react_1.createRemoteReactComponent)("Table");
      exports.TableHead = (0, react_1.createRemoteReactComponent)("TableHead");
      exports.TableBody = (0, react_1.createRemoteReactComponent)("TableBody");
      exports.TableRow = (0, react_1.createRemoteReactComponent)("TableRow");
      exports.TableFooter = (0, react_1.createRemoteReactComponent)("TableFooter");
      exports.TableCell = (0, react_1.createRemoteReactComponent)("TableCell");
      exports.TableHeaderCell = (0, react_1.createRemoteReactComponent)("TableHeaderCell");
      exports.Tab = (0, react_1.createRemoteReactComponent)("Tab");
      exports.TabPanel = (0, react_1.createRemoteReactComponent)("TabPanel");
      exports.TextArea = (0, react_1.createRemoteReactComponent)("TextArea", {
        fragmentProps: ["label"]
      });
      exports.TextField = (0, react_1.createRemoteReactComponent)("TextField", {
        fragmentProps: ["label"]
      });
      exports.ListItem = (0, react_1.createRemoteReactComponent)("ListItem", {
        fragmentProps: ["value"]
      });
      exports.List = (0, react_1.createRemoteReactComponent)("List");
    }
  });

  // node_modules/@stripe/ui-extension-sdk/ui/@stripe-internal/tailor-dashboard-components/index.js
  var require_tailor_dashboard_components = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/ui/@stripe-internal/tailor-dashboard-components/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SettingsView = exports.FocusView = exports.ContextView = void 0;
      var react_1 = __require("@remote-ui/react");
      exports.ContextView = (0, react_1.createRemoteReactComponent)("ContextView", {
        fragmentProps: ["actions"]
      });
      exports.FocusView = (0, react_1.createRemoteReactComponent)("FocusView", {
        fragmentProps: ["primaryAction", "secondaryAction", "footerContent"]
      });
      exports.SettingsView = (0, react_1.createRemoteReactComponent)("SettingsView");
    }
  });

  // node_modules/@stripe/ui-extension-sdk/ui/index.js
  var require_ui2 = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/ui/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_manual_components(), exports);
      __exportStar(require_ui(), exports);
      __exportStar(require_tailor_dashboard_components(), exports);
    }
  });

  // node_modules/@stripe/ui-extension-sdk/version.js
  var require_version = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/version.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SDK_VERSION = void 0;
      exports.SDK_VERSION = "2.2.1";
    }
  });

  // .build/manifest.js
  var manifest_exports = {};
  __export(manifest_exports, {
    BUILD_TIME: () => BUILD_TIME,
    JeturingHome: () => JeturingHome_default,
    default: () => manifest_default
  });

  // src/views/JeturingHome.tsx
  var import_ui = __toESM(require_ui2());
  var import_react = __require("react");
  var import_jsx_runtime = __require("react/jsx-runtime");
  var JeturingHome = ({ userContext, environment }) => {
    const [loading, setLoading] = (0, import_react.useState)(true);
    const [stats, setStats] = (0, import_react.useState)(null);
    const [error, setError] = (0, import_react.useState)(null);
    (0, import_react.useEffect)(() => {
      loadDashboardStats();
    }, []);
    const loadDashboardStats = () => __async(void 0, null, function* () {
      try {
        setLoading(true);
        const mockStats = {
          totalPayments: 1250,
          totalRevenue: 45680.5,
          pendingPayments: 12,
          connectedDevices: 5
        };
        setStats(mockStats);
      } catch (err) {
        setError("Error al cargar estad\xEDsticas");
      } finally {
        setLoading(false);
      }
    });
    if (loading) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ContextView, {
        title: "Jeturing Pay",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
          css: { padding: "large", textAlign: "center" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Spinner, {
              size: "large"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
              children: "Cargando dashboard..."
            })
          ]
        })
      });
    }
    if (error) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ContextView, {
        title: "Jeturing Pay",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
          css: { padding: "large" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
              color: "critical",
              children: error
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
              onPress: loadDashboardStats,
              children: "Reintentar"
            })
          ]
        })
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ContextView, {
      title: "Jeturing Pay - Dashboard",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
        css: { padding: "medium" },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, {
          spacing: "medium",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Inline, {
              spacing: "small",
              alignY: "center",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Icon, {
                  name: "payment",
                  size: "medium"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                  size: "large",
                  emphasis: true,
                  children: "Panel de Control"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Divider, {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
              css: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "medium" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
                  css: { padding: "medium", backgroundColor: "container", borderRadius: "medium" },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, {
                    spacing: "xsmall",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "small",
                        color: "secondary",
                        children: "Total de Pagos"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "xlarge",
                        emphasis: true,
                        children: stats == null ? void 0 : stats.totalPayments.toLocaleString()
                      })
                    ]
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
                  css: { padding: "medium", backgroundColor: "container", borderRadius: "medium" },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, {
                    spacing: "xsmall",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "small",
                        color: "secondary",
                        children: "Ingresos Totales"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Text, {
                        size: "xlarge",
                        emphasis: true,
                        children: [
                          "$",
                          stats == null ? void 0 : stats.totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })
                        ]
                      })
                    ]
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
                  css: { padding: "medium", backgroundColor: "container", borderRadius: "medium" },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, {
                    spacing: "xsmall",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "small",
                        color: "secondary",
                        children: "Pagos Pendientes"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "xlarge",
                        emphasis: true,
                        color: "warning",
                        children: stats == null ? void 0 : stats.pendingPayments
                      })
                    ]
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
                  css: { padding: "medium", backgroundColor: "container", borderRadius: "medium" },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, {
                    spacing: "xsmall",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "small",
                        color: "secondary",
                        children: "Dispositivos Activos"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                        size: "xlarge",
                        emphasis: true,
                        color: "success",
                        children: stats == null ? void 0 : stats.connectedDevices
                      })
                    ]
                  })
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Divider, {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
              size: "medium",
              emphasis: true,
              children: "Acciones R\xE1pidas"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.List, {
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ListItem, {
                  title: "Gestionar Dispositivos",
                  secondaryTitle: "Administrar dispositivos de cobro autorizados",
                  css: { cursor: "pointer" }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ListItem, {
                  title: "Ver Transacciones",
                  secondaryTitle: "Historial completo de pagos",
                  css: { cursor: "pointer" }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ListItem, {
                  title: "Configuraci\xF3n",
                  secondaryTitle: "Ajustes de la cuenta y notificaciones",
                  css: { cursor: "pointer" }
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Divider, {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
              css: { textAlign: "center", paddingTop: "medium" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, {
                  size: "small",
                  color: "secondary",
                  children: "Jeturing Pay v1.0.0"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Link, {
                  href: "https://jeturing.com/soporte",
                  external: true,
                  children: "Soporte"
                })
              ]
            })
          ]
        })
      })
    });
  };
  var JeturingHome_default = JeturingHome;

  // .build/manifest.js
  __reExport(manifest_exports, __toESM(require_version()));
  var BUILD_TIME = "2026-01-01 03:32:27.498793 -0500 EST m=+2.379108881";
  var manifest_default = {
    "allowed_redirect_uris": [
      "https://api-001.sajet.us/stripe/callback"
    ],
    "connect_permissions": null,
    "distribution_type": "private",
    "icon": "./assets/icon.png",
    "id": "com.jeturing.pay.terminal",
    "name": "Jeturing Pay Terminal",
    "permissions": [],
    "post_install_action": {
      "type": "external",
      "url": "https://api-001.sajet.us/stripe/app/setup"
    },
    "stripe_api_access_type": "platform",
    "ui_extension": {
      "content_security_policy": {
        "connect-src": [
          "https://api-001.sajet.us/api/v1/"
        ],
        "image-src": null,
        "purpose": ""
      },
      "views": [
        {
          "component": "JeturingHome",
          "viewport": "stripe.dashboard.drawer.default"
        }
      ]
    },
    "version": "1.0.0"
  };
  return __toCommonJS(manifest_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL0BzdHJpcGUvc3JjL3VpL21hbnVhbF9jb21wb25lbnRzLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ac3RyaXBlL3NyYy91aS9Ac2FpbC91aS9pbmRleC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHN0cmlwZS9zcmMvdWkvQHN0cmlwZS1pbnRlcm5hbC90YWlsb3ItZGFzaGJvYXJkLWNvbXBvbmVudHMvaW5kZXgudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0BzdHJpcGUvc3JjL3VpL2luZGV4LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ac3RyaXBlL3NyYy92ZXJzaW9uLnRzIiwgIm1hbmlmZXN0LmpzIiwgIi4uL3NyYy92aWV3cy9KZXR1cmluZ0hvbWUudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsICIvLyBBVVRPR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuaW1wb3J0IEpldHVyaW5nSG9tZSBmcm9tICcuLi9zcmMvdmlld3MvSmV0dXJpbmdIb21lJztcblxuZXhwb3J0ICogZnJvbSAnQHN0cmlwZS91aS1leHRlbnNpb24tc2RrL3ZlcnNpb24nO1xuZXhwb3J0IGNvbnN0IEJVSUxEX1RJTUUgPSAnMjAyNi0wMS0wMSAwMzozMjoyNy40OTg3OTMgLTA1MDAgRVNUIG09KzIuMzc5MTA4ODgxJztcblxuZXhwb3J0IHsgXG4gIEpldHVyaW5nSG9tZVx0XG4gfTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBcImFsbG93ZWRfcmVkaXJlY3RfdXJpc1wiOiBbXG4gICAgXCJodHRwczovL2FwaS0wMDEuc2FqZXQudXMvc3RyaXBlL2NhbGxiYWNrXCJcbiAgXSxcbiAgXCJjb25uZWN0X3Blcm1pc3Npb25zXCI6IG51bGwsXG4gIFwiZGlzdHJpYnV0aW9uX3R5cGVcIjogXCJwcml2YXRlXCIsXG4gIFwiaWNvblwiOiBcIi4vYXNzZXRzL2ljb24ucG5nXCIsXG4gIFwiaWRcIjogXCJjb20uamV0dXJpbmcucGF5LnRlcm1pbmFsXCIsXG4gIFwibmFtZVwiOiBcIkpldHVyaW5nIFBheSBUZXJtaW5hbFwiLFxuICBcInBlcm1pc3Npb25zXCI6IFtdLFxuICBcInBvc3RfaW5zdGFsbF9hY3Rpb25cIjoge1xuICAgIFwidHlwZVwiOiBcImV4dGVybmFsXCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2FwaS0wMDEuc2FqZXQudXMvc3RyaXBlL2FwcC9zZXR1cFwiXG4gIH0sXG4gIFwic3RyaXBlX2FwaV9hY2Nlc3NfdHlwZVwiOiBcInBsYXRmb3JtXCIsXG4gIFwidWlfZXh0ZW5zaW9uXCI6IHtcbiAgICBcImNvbnRlbnRfc2VjdXJpdHlfcG9saWN5XCI6IHtcbiAgICAgIFwiY29ubmVjdC1zcmNcIjogW1xuICAgICAgICBcImh0dHBzOi8vYXBpLTAwMS5zYWpldC51cy9hcGkvdjEvXCJcbiAgICAgIF0sXG4gICAgICBcImltYWdlLXNyY1wiOiBudWxsLFxuICAgICAgXCJwdXJwb3NlXCI6IFwiXCJcbiAgICB9LFxuICAgIFwidmlld3NcIjogW1xuICAgICAge1xuICAgICAgICBcImNvbXBvbmVudFwiOiBcIkpldHVyaW5nSG9tZVwiLFxuICAgICAgICBcInZpZXdwb3J0XCI6IFwic3RyaXBlLmRhc2hib2FyZC5kcmF3ZXIuZGVmYXVsdFwiXG4gICAgICB9XG4gICAgXVxuICB9LFxuICBcInZlcnNpb25cIjogXCIxLjAuMFwiXG59O1xuIiwgImltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBDb250ZXh0VmlldyxcbiAgRGl2aWRlcixcbiAgSWNvbixcbiAgSW5saW5lLFxuICBMaW5rLFxuICBMaXN0LFxuICBMaXN0SXRlbSxcbiAgU3Bpbm5lcixcbiAgU3RhY2ssXG4gIFRleHQsXG59IGZyb20gXCJAc3RyaXBlL3VpLWV4dGVuc2lvbi1zZGsvdWlcIjtcbmltcG9ydCB0eXBlIHsgRXh0ZW5zaW9uQ29udGV4dFZhbHVlIH0gZnJvbSBcIkBzdHJpcGUvdWktZXh0ZW5zaW9uLXNkay9jb250ZXh0XCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmNvbnN0IEFQSV9VUkwgPSBcImh0dHBzOi8vYXBpLTAwMS5zYWpldC51c1wiO1xuXG5pbnRlcmZhY2UgRGFzaGJvYXJkU3RhdHMge1xuICB0b3RhbFBheW1lbnRzOiBudW1iZXI7XG4gIHRvdGFsUmV2ZW51ZTogbnVtYmVyO1xuICBwZW5kaW5nUGF5bWVudHM6IG51bWJlcjtcbiAgY29ubmVjdGVkRGV2aWNlczogbnVtYmVyO1xufVxuXG5jb25zdCBKZXR1cmluZ0hvbWUgPSAoeyB1c2VyQ29udGV4dCwgZW52aXJvbm1lbnQgfTogRXh0ZW5zaW9uQ29udGV4dFZhbHVlKSA9PiB7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9IHVzZVN0YXRlPERhc2hib2FyZFN0YXRzIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsb2FkRGFzaGJvYXJkU3RhdHMoKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGxvYWREYXNoYm9hcmRTdGF0cyA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgIC8vIFNpbXVsYWNpXHUwMEYzbiBkZSBzdGF0cyAtIGludGVncmFyIGNvbiB0dSBBUElcbiAgICAgIGNvbnN0IG1vY2tTdGF0czogRGFzaGJvYXJkU3RhdHMgPSB7XG4gICAgICAgIHRvdGFsUGF5bWVudHM6IDEyNTAsXG4gICAgICAgIHRvdGFsUmV2ZW51ZTogNDU2ODAuNTAsXG4gICAgICAgIHBlbmRpbmdQYXltZW50czogMTIsXG4gICAgICAgIGNvbm5lY3RlZERldmljZXM6IDUsXG4gICAgICB9O1xuICAgICAgc2V0U3RhdHMobW9ja1N0YXRzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNldEVycm9yKFwiRXJyb3IgYWwgY2FyZ2FyIGVzdGFkXHUwMEVEc3RpY2FzXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPENvbnRleHRWaWV3IHRpdGxlPVwiSmV0dXJpbmcgUGF5XCI+XG4gICAgICAgIDxCb3ggY3NzPXt7IHBhZGRpbmc6IFwibGFyZ2VcIiwgdGV4dEFsaWduOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgIDxTcGlubmVyIHNpemU9XCJsYXJnZVwiIC8+XG4gICAgICAgICAgPFRleHQ+Q2FyZ2FuZG8gZGFzaGJvYXJkLi4uPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQ29udGV4dFZpZXc+XG4gICAgKTtcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29udGV4dFZpZXcgdGl0bGU9XCJKZXR1cmluZyBQYXlcIj5cbiAgICAgICAgPEJveCBjc3M9e3sgcGFkZGluZzogXCJsYXJnZVwiIH19PlxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiY3JpdGljYWxcIj57ZXJyb3J9PC9UZXh0PlxuICAgICAgICAgIDxCdXR0b24gb25QcmVzcz17bG9hZERhc2hib2FyZFN0YXRzfT5SZWludGVudGFyPC9CdXR0b24+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Db250ZXh0Vmlldz5cbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGV4dFZpZXcgdGl0bGU9XCJKZXR1cmluZyBQYXkgLSBEYXNoYm9hcmRcIj5cbiAgICAgIDxCb3ggY3NzPXt7IHBhZGRpbmc6IFwibWVkaXVtXCIgfX0+XG4gICAgICAgIDxTdGFjayBzcGFjaW5nPVwibWVkaXVtXCI+XG4gICAgICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgICAgICA8SW5saW5lIHNwYWNpbmc9XCJzbWFsbFwiIGFsaWduWT1cImNlbnRlclwiPlxuICAgICAgICAgICAgPEljb24gbmFtZT1cInBheW1lbnRcIiBzaXplPVwibWVkaXVtXCIgLz5cbiAgICAgICAgICAgIDxUZXh0IHNpemU9XCJsYXJnZVwiIGVtcGhhc2lzPlxuICAgICAgICAgICAgICBQYW5lbCBkZSBDb250cm9sXG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9JbmxpbmU+XG5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuXG4gICAgICAgICAgey8qIFN0YXRzIEdyaWQgKi99XG4gICAgICAgICAgPEJveCBjc3M9e3sgZGlzcGxheTogXCJncmlkXCIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiMWZyIDFmclwiLCBnYXA6IFwibWVkaXVtXCIgfX0+XG4gICAgICAgICAgICA8Qm94IGNzcz17eyBwYWRkaW5nOiBcIm1lZGl1bVwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiY29udGFpbmVyXCIsIGJvcmRlclJhZGl1czogXCJtZWRpdW1cIiB9fT5cbiAgICAgICAgICAgICAgPFN0YWNrIHNwYWNpbmc9XCJ4c21hbGxcIj5cbiAgICAgICAgICAgICAgICA8VGV4dCBzaXplPVwic21hbGxcIiBjb2xvcj1cInNlY29uZGFyeVwiPlxuICAgICAgICAgICAgICAgICAgVG90YWwgZGUgUGFnb3NcbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQgc2l6ZT1cInhsYXJnZVwiIGVtcGhhc2lzPlxuICAgICAgICAgICAgICAgICAge3N0YXRzPy50b3RhbFBheW1lbnRzLnRvTG9jYWxlU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICA8L1N0YWNrPlxuICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgIDxCb3ggY3NzPXt7IHBhZGRpbmc6IFwibWVkaXVtXCIsIGJhY2tncm91bmRDb2xvcjogXCJjb250YWluZXJcIiwgYm9yZGVyUmFkaXVzOiBcIm1lZGl1bVwiIH19PlxuICAgICAgICAgICAgICA8U3RhY2sgc3BhY2luZz1cInhzbWFsbFwiPlxuICAgICAgICAgICAgICAgIDxUZXh0IHNpemU9XCJzbWFsbFwiIGNvbG9yPVwic2Vjb25kYXJ5XCI+XG4gICAgICAgICAgICAgICAgICBJbmdyZXNvcyBUb3RhbGVzXG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0IHNpemU9XCJ4bGFyZ2VcIiBlbXBoYXNpcz5cbiAgICAgICAgICAgICAgICAgICR7c3RhdHM/LnRvdGFsUmV2ZW51ZS50b0xvY2FsZVN0cmluZyhcImVzLU1YXCIsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgPC9TdGFjaz5cbiAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICA8Qm94IGNzcz17eyBwYWRkaW5nOiBcIm1lZGl1bVwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiY29udGFpbmVyXCIsIGJvcmRlclJhZGl1czogXCJtZWRpdW1cIiB9fT5cbiAgICAgICAgICAgICAgPFN0YWNrIHNwYWNpbmc9XCJ4c21hbGxcIj5cbiAgICAgICAgICAgICAgICA8VGV4dCBzaXplPVwic21hbGxcIiBjb2xvcj1cInNlY29uZGFyeVwiPlxuICAgICAgICAgICAgICAgICAgUGFnb3MgUGVuZGllbnRlc1xuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICA8VGV4dCBzaXplPVwieGxhcmdlXCIgZW1waGFzaXMgY29sb3I9XCJ3YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgICB7c3RhdHM/LnBlbmRpbmdQYXltZW50c31cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvU3RhY2s+XG4gICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgPEJveCBjc3M9e3sgcGFkZGluZzogXCJtZWRpdW1cIiwgYmFja2dyb3VuZENvbG9yOiBcImNvbnRhaW5lclwiLCBib3JkZXJSYWRpdXM6IFwibWVkaXVtXCIgfX0+XG4gICAgICAgICAgICAgIDxTdGFjayBzcGFjaW5nPVwieHNtYWxsXCI+XG4gICAgICAgICAgICAgICAgPFRleHQgc2l6ZT1cInNtYWxsXCIgY29sb3I9XCJzZWNvbmRhcnlcIj5cbiAgICAgICAgICAgICAgICAgIERpc3Bvc2l0aXZvcyBBY3Rpdm9zXG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0IHNpemU9XCJ4bGFyZ2VcIiBlbXBoYXNpcyBjb2xvcj1cInN1Y2Nlc3NcIj5cbiAgICAgICAgICAgICAgICAgIHtzdGF0cz8uY29ubmVjdGVkRGV2aWNlc31cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvU3RhY2s+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgIDxEaXZpZGVyIC8+XG5cbiAgICAgICAgICB7LyogUXVpY2sgQWN0aW9ucyAqL31cbiAgICAgICAgICA8VGV4dCBzaXplPVwibWVkaXVtXCIgZW1waGFzaXM+XG4gICAgICAgICAgICBBY2Npb25lcyBSXHUwMEUxcGlkYXNcbiAgICAgICAgICA8L1RleHQ+XG5cbiAgICAgICAgICA8TGlzdD5cbiAgICAgICAgICAgIDxMaXN0SXRlbVxuICAgICAgICAgICAgICB0aXRsZT1cIkdlc3Rpb25hciBEaXNwb3NpdGl2b3NcIlxuICAgICAgICAgICAgICBzZWNvbmRhcnlUaXRsZT1cIkFkbWluaXN0cmFyIGRpc3Bvc2l0aXZvcyBkZSBjb2JybyBhdXRvcml6YWRvc1wiXG4gICAgICAgICAgICAgIGNzcz17eyBjdXJzb3I6IFwicG9pbnRlclwiIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPExpc3RJdGVtXG4gICAgICAgICAgICAgIHRpdGxlPVwiVmVyIFRyYW5zYWNjaW9uZXNcIlxuICAgICAgICAgICAgICBzZWNvbmRhcnlUaXRsZT1cIkhpc3RvcmlhbCBjb21wbGV0byBkZSBwYWdvc1wiXG4gICAgICAgICAgICAgIGNzcz17eyBjdXJzb3I6IFwicG9pbnRlclwiIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPExpc3RJdGVtXG4gICAgICAgICAgICAgIHRpdGxlPVwiQ29uZmlndXJhY2lcdTAwRjNuXCJcbiAgICAgICAgICAgICAgc2Vjb25kYXJ5VGl0bGU9XCJBanVzdGVzIGRlIGxhIGN1ZW50YSB5IG5vdGlmaWNhY2lvbmVzXCJcbiAgICAgICAgICAgICAgY3NzPXt7IGN1cnNvcjogXCJwb2ludGVyXCIgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9MaXN0PlxuXG4gICAgICAgICAgPERpdmlkZXIgLz5cblxuICAgICAgICAgIHsvKiBGb290ZXIgKi99XG4gICAgICAgICAgPEJveCBjc3M9e3sgdGV4dEFsaWduOiBcImNlbnRlclwiLCBwYWRkaW5nVG9wOiBcIm1lZGl1bVwiIH19PlxuICAgICAgICAgICAgPFRleHQgc2l6ZT1cInNtYWxsXCIgY29sb3I9XCJzZWNvbmRhcnlcIj5cbiAgICAgICAgICAgICAgSmV0dXJpbmcgUGF5IHYxLjAuMFxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPExpbmsgaHJlZj1cImh0dHBzOi8vamV0dXJpbmcuY29tL3NvcG9ydGVcIiBleHRlcm5hbD5cbiAgICAgICAgICAgICAgU29wb3J0ZVxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L1N0YWNrPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Db250ZXh0Vmlldz5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEpldHVyaW5nSG9tZTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFVBQUEsVUFBQSxVQUFBO0FBS2EsY0FBQSxP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QUNDLE9BQU07QUFBQSxrQkFDTixnQkFBZTtBQUFBLGtCQUNmLEtBQUssRUFBRSxRQUFRLFVBQVU7QUFBQSxpQkFDM0I7QUFBQSxnQkFDQSw0Q0FBQztBQUFBLGtCQUNDLE9BQU07QUFBQSxrQkFDTixnQkFBZTtBQUFBLGtCQUNmLEtBQUssRUFBRSxRQUFRLFVBQVU7QUFBQSxpQkFDM0I7QUFBQSxnQkFDQSw0Q0FBQztBQUFBLGtCQUNDLE9BQU07QUFBQSxrQkFDTixnQkFBZTtBQUFBLGtCQUNmLEtBQUssRUFBRSxRQUFRLFVBQVU7QUFBQSxpQkFDM0I7QUFBQTtBQUFBLGFBQ0Y7QUFBQSxZQUVBLDRDQUFDLHFCQUFRO0FBQUEsWUFHVCw2Q0FBQztBQUFBLGNBQUksS0FBSyxFQUFFLFdBQVcsVUFBVSxZQUFZLFNBQVM7QUFBQSxjQUNwRDtBQUFBLDREQUFDO0FBQUEsa0JBQUssTUFBSztBQUFBLGtCQUFRLE9BQU07QUFBQSxrQkFBWTtBQUFBLGlCQUVyQztBQUFBLGdCQUNBLDRDQUFDO0FBQUEsa0JBQUssTUFBSztBQUFBLGtCQUErQixVQUFRO0FBQUEsa0JBQUM7QUFBQSxpQkFFbkQ7QUFBQTtBQUFBLGFBQ0Y7QUFBQTtBQUFBLFNBQ0Y7QUFBQSxPQUNGO0FBQUEsS0FDRjtBQUFBLEVBRUo7QUFFQSxNQUFPLHVCQUFROzs7QUQvS2YsK0JBQWM7QUFDUCxNQUFNLGFBQWE7QUFNMUIsTUFBTyxtQkFBUTtBQUFBLElBQ2IseUJBQXlCO0FBQUEsTUFDdkI7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxJQUN2QixxQkFBcUI7QUFBQSxJQUNyQixRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlLENBQUM7QUFBQSxJQUNoQix1QkFBdUI7QUFBQSxNQUNyQixRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsMEJBQTBCO0FBQUEsSUFDMUIsZ0JBQWdCO0FBQUEsTUFDZCwyQkFBMkI7QUFBQSxRQUN6QixlQUFlO0FBQUEsVUFDYjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7IiwKICAibmFtZXMiOiBbXQp9Cg==
