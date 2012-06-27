(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    require("0");
})({
    "0": function(require, module, exports, global) {
        require("1");
        require("2");
        window.History = require("3").History;
        window.DynamicMatcher = require("4").DynamicMatcher;
        window.EventStack = require("5").EventStack;
        require("6");
        require("7");
        require("8");
        require("9");
        require("a");
        require("b");
        require("c");
        require("d");
        require("e");
        require("f");
        require("g");
        require("h");
        require("i");
        require("j");
    },
    "1": function(require, module, exports, global) {
        Class.Binds = new Class({
            $bound: {},
            bound: function(name) {
                return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
            }
        });
        Class.Instantiate = function(klass, options) {
            var create = function(object) {
                if (object.getInstanceOf && object.getInstanceOf(klass)) return;
                new klass(object, options);
            };
            return function(objects) {
                objects.each(create);
            };
        };
        (function() {
            var storage = {
                storage: {},
                store: function(key, value) {
                    this.storage[key] = value;
                },
                retrieve: function(key) {
                    return this.storage[key] || null;
                }
            };
            Class.Singleton = function() {
                this.$className = String.uniqueID();
            };
            Class.Singleton.prototype.check = function(item) {
                if (!item) item = storage;
                var instance = item.retrieve("single:" + this.$className);
                if (!instance) item.store("single:" + this.$className, this);
                return instance;
            };
            var gIO = function(klass) {
                var name = klass.prototype.$className;
                return name ? this.retrieve("single:" + name) : null;
            };
            if ("Element" in this && Element.implement) Element.implement({
                getInstanceOf: gIO
            });
            Class.getInstanceOf = gIO.bind(storage);
        })();
        (function() {
            var setter = function(name) {
                return function(value) {
                    this[name] = value;
                    return this;
                };
            };
            var getter = function(name) {
                return function() {
                    return this[name] || null;
                };
            };
            Class.Mutators.Properties = function(properties) {
                this.implement(properties);
                for (var prop in properties) {
                    var name = prop.replace(/^_+/, "").capitalize().camelCase();
                    this.implement("set" + name, setter(prop));
                    this.implement("get" + name, getter(prop));
                }
            };
        })();
    },
    "2": function(require, module, exports, global) {
        (function() {
            [ Element, Window, Document ].invoke("implement", {
                hasEvent: function(event) {
                    var events = this.retrieve("events"), list = events && events[event] ? events[event].values : null;
                    if (list) {
                        var i = list.length;
                        while (i--) if (i in list) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            var wrap = function(custom, method, extended) {
                method = custom[method];
                extended = custom[extended];
                return function(fn, name) {
                    if (extended && !this.hasEvent(name)) extended.call(this, fn, name);
                    if (method) method.call(this, fn, name);
                };
            };
            var inherit = function(custom, base, method) {
                return function(fn, name) {
                    base[method].call(this, fn, name);
                    custom[method].call(this, fn, name);
                };
            };
            var events = Element.Events;
            Element.defineCustomEvent = function(name, custom) {
                var base = events[custom.base];
                custom.onAdd = wrap(custom, "onAdd", "onSetup");
                custom.onRemove = wrap(custom, "onRemove", "onTeardown");
                events[name] = base ? Object.append({}, custom, {
                    base: base.base,
                    condition: function(event, name) {
                        return (!base.condition || base.condition.call(this, event, name)) && (!custom.condition || custom.condition.call(this, event, name));
                    },
                    onAdd: inherit(custom, base, "onAdd"),
                    onRemove: inherit(custom, base, "onRemove")
                }) : custom;
                return this;
            };
            Element.enableCustomEvents = function() {
                Object.each(events, function(event, name) {
                    if (event.onEnable) event.onEnable.call(event, name);
                });
            };
            Element.disableCustomEvents = function() {
                Object.each(events, function(event, name) {
                    if (event.onDisable) event.onDisable.call(event, name);
                });
            };
        })();
    },
    "3": function(require, module, exports, global) {
        (function() {
            var events = Element.NativeEvents, location = window.location, base = location.pathname, history = window.history, hasPushState = "pushState" in history, event = hasPushState ? "popstate" : "hashchange";
            var History = this.History = new new Class({
                Implements: [ Class.Binds, Events ],
                initialize: hasPushState ? function() {
                    events[event] = 2;
                    window.addEvent(event, this.bound("pop"));
                } : function() {
                    events[event] = 1;
                    window.addEvent(event, this.bound("pop"));
                    this.hash = location.hash;
                    var hashchange = "onhashchange" in window;
                    if (!(hashchange && (document.documentMode === undefined || document.documentMode > 7))) this.timer = this.check.periodical(200, this);
                },
                push: hasPushState ? function(url, title, state) {
                    if (base && base != url) base = null;
                    history.pushState(state || null, title || null, url);
                    this.onChange(url, state);
                } : function(url) {
                    location.hash = url;
                },
                replace: hasPushState ? function(url, title, state) {
                    history.replaceState(state || null, title || null, url);
                } : function(url) {
                    this.hash = "#" + url;
                    this.push(url);
                },
                pop: hasPushState ? function(event) {
                    var url = location.pathname;
                    if (url == base) {
                        base = null;
                        return;
                    }
                    this.onChange(url, event.event.state);
                } : function() {
                    var hash = location.hash;
                    if (this.hash == hash) return;
                    this.hash = hash;
                    this.onChange(hash.substr(1));
                },
                onChange: function(url, state) {
                    this.fireEvent("change", [ url, state || {} ]);
                },
                back: function() {
                    history.back();
                },
                forward: function() {
                    history.forward();
                },
                getPath: function() {
                    return hasPushState ? location.pathname : location.hash.substr(1);
                },
                hasPushState: function() {
                    return hasPushState;
                },
                check: function() {
                    if (this.hash != location.hash) this.pop();
                }
            });
        }).call(this);
        (function() {
            var History = this.History;
            History.handleInitialState = function(base) {
                if (!base) base = "";
                var location = window.location, pathname = location.pathname.substr(base.length), hash = location.hash, hasPushState = History.hasPushState();
                if (!hasPushState && pathname.length > 1) {
                    window.location = (base || "/") + "#" + pathname;
                    return true;
                }
                if (!hash || hash.length <= 1) return false;
                if (hasPushState) {
                    (function() {
                        History.push(hash.substr(1));
                    }).delay(1);
                    return false;
                }
                if (!pathname || pathname == "/") return false;
                window.location = (base || "/") + hash;
                return true;
            };
        }).call(this);
    },
    "4": function(require, module, exports, global) {
        (function() {
            this.DynamicMatcher = new Class({
                Implements: Events,
                initialize: function() {
                    this.expressions = [];
                    this.handlers = [];
                },
                register: function(expression, fn) {
                    var index = this.handlers.indexOf(fn);
                    if (index != -1 && this.expressions[index] == expression) return this;
                    this.expressions.push(expression);
                    this.handlers.push(fn);
                    return this;
                }.overloadSetter(),
                unregister: function(expression, fn) {
                    var handlers = this.handlers, expressions = this.expressions;
                    for (var i = 0, l = handlers.length; i < l; i++) if (expression == expressions[i] && fn == handlers[i]) {
                        delete handlers[i];
                        delete expressions[i];
                        break;
                    }
                    return this;
                }.overloadSetter(),
                update: function(element) {
                    element = document.id(element) || document;
                    var isDocument = element == document, handlers = this.handlers, expressions = this.expressions;
                    for (var i = 0, l = handlers.length; i < l; i++) {
                        var expression = expressions[i];
                        if (!expression) continue;
                        var elements = element.getElements(expression);
                        if (!isDocument && element.match(expression)) elements.push(element);
                        if (elements.length) handlers[i](elements);
                    }
                    this.fireEvent("update", [ element ]);
                    return this;
                }
            });
        }).call(this);
    },
    "5": function(require, module, exports, global) {
        (function() {
            this.EventStack = new Class({
                Implements: [ Options, Class.Binds ],
                options: {
                    event: "keyup",
                    condition: function(event) {
                        return event.key == "esc";
                    }
                },
                initialize: function(options) {
                    this.setOptions(options);
                    this.stack = [];
                    this.data = [];
                    document.addEvent(this.options.event, this.bound("condition"));
                },
                condition: function(event) {
                    if (this.options.condition.call(this, event, this.data.getLast())) this.pop(event);
                },
                erase: function(fn) {
                    this.data.erase(this.data[this.stack.indexOf(fn)]);
                    this.stack.erase(fn);
                    return this;
                },
                push: function(fn, data) {
                    this.erase(fn);
                    this.data.push(data || null);
                    this.stack.push(fn);
                    return this;
                },
                pop: function(event) {
                    var fn = this.stack.pop(), data = this.data.pop();
                    if (fn) fn.call(this, event, data);
                    return this;
                }
            });
        }).call(this);
        (function() {
            var EventStack = this.EventStack;
            EventStack.OuterClick = new Class({
                Extends: EventStack,
                options: {
                    event: "click",
                    condition: function(event, element) {
                        return element && !element.contains(event.target);
                    }
                }
            });
        }).call(this);
    },
    "6": function(require, module, exports, global) {
        (function() {
            this.Accessor = function(singular, plural) {
                if (!singular) singular = "";
                if (!plural) plural = singular + "s";
                var accessor = {}, matchers = [], define = "define", lookup = "lookup", match = "match", each = "each";
                this[define + singular] = function(key, value) {
                    if (typeOf(key) == "regexp") matchers.push({
                        regexp: key,
                        value: value,
                        type: typeOf(value)
                    }); else accessor[key] = value;
                    return this;
                };
                this[define + plural] = function(object) {
                    for (var key in object) accessor[key] = object[key];
                    return this;
                };
                var lookupSingular = this[lookup + singular] = function(key) {
                    if (accessor.hasOwnProperty(key)) return accessor[key];
                    for (var l = matchers.length; l--; l) {
                        var matcher = matchers[l], matched = key.match(matcher.regexp);
                        if (matched && (matched = matched.slice(1))) {
                            if (matcher.type == "function") return function() {
                                return matcher.value.apply(this, Array.from(arguments).concat(matched));
                            }; else return matcher.value;
                        }
                    }
                    return null;
                };
                this[lookup + plural] = function() {
                    var results = {};
                    for (var i = 0; i < arguments.length; i++) {
                        var argument = arguments[i];
                        results[argument] = lookupSingular(argument);
                    }
                    return results;
                };
                this[each + singular] = function(fn, bind) {
                    Object.forEach(accessor, fn, bind);
                };
            };
        })();
        (function() {
            var property = "$" + String.uniqueID() + "-listener";
            var setup = function(element) {
                var listener = new Events, removeEvent = listener.removeEvent;
                listener.removeEvent = function(key, value) {
                    removeEvent.call(this, key, value);
                    element.removeEvent(key, value);
                };
                return listener;
            };
            this.Listener = new Class({
                attach: function(key, value) {
                    if (!this[property]) this[property] = setup(this.toElement());
                    this[property].addEvent(key, value);
                    this.toElement().addEvent(key, value);
                }.overloadSetter(),
                detach: function(key, value) {
                    if (this[property]) {
                        if (typeof key == "string") this[property].removeEvent(key, value); else this[property].removeEvents(key);
                    }
                    return this;
                },
                toElement: function() {
                    return this.element;
                }
            });
        })();
        (function() {
            var storage, set, get, erase;
            if ("localStorage" in this) {
                storage = this.localStorage;
                set = function(key, value) {
                    storage.setItem(key, JSON.encode(value));
                    return this;
                };
                get = function(key) {
                    return JSON.decode(storage.getItem(key));
                };
                erase = function(key) {
                    storage.removeItem(key);
                    return this;
                }.overloadGetter();
            } else {
                storage = this.Cookie;
                set = function(key, value) {
                    storage.write(key, JSON.encode(value));
                    return this;
                };
                get = function(key) {
                    return JSON.decode(storage.read(key));
                };
                erase = function(key) {
                    storage.dispose(key);
                    return this;
                }.overloadGetter();
            }
            this.LocalStorage = {
                set: set.overloadSetter(),
                get: get.overloadGetter(),
                erase: function() {
                    erase.apply(this, arguments);
                    return this;
                }
            };
        })();
        (function() {
            this.Queue = new Class({
                Extends: Chain,
                Implements: Class.Binds,
                call: function() {
                    if (this.busy || !this.$chain.length) return this;
                    this.busy = true;
                    this.callChain();
                    return this;
                },
                next: function() {
                    this.busy = false;
                    this.call();
                    return this;
                }
            });
        })();
        (function() {
            var bag = new Events;
            this.Stratcom = {
                notify: function(type, args) {
                    bag.fireEvent(type, args);
                    return this;
                },
                listen: function(type, fn) {
                    bag.addEvent(type, fn);
                    return this;
                }.overloadSetter(),
                ignore: function(type, fn) {
                    bag.removeEvent(type, fn);
                    return this;
                }.overloadSetter()
            };
        })();
    },
    "7": function(require, module, exports, global) {
        Element.NativeEvents.input = 2;
        Element.implement({
            setActive: function(className) {
                this.fireEvent("active");
                if (!className) className = "active";
                this.getSiblings().removeClass(className);
                return this.addClass(className);
            }
        });
    },
    "8": function(require, module, exports, global) {
        (function() {
            Slick.definePseudo("input", function() {
                var tag = this.tagName.toLowerCase();
                return tag == "input" || tag == "textarea" || tag == "select";
            }).definePseudo("text", function() {
                var tag = this.tagName.toLowerCase();
                return tag == "input" || tag == "textarea";
            }).definePseudo("external", function() {
                return this.hostname != location.hostname;
            }).definePseudo("internal", function() {
                return this.hostname == location.hostname;
            });
        })();
    },
    "9": function(require, module, exports, global) {
        (function() {
            this.Doppelganger = new Accessor("Setting");
        })();
    },
    a: function(require, module, exports, global) {
        (function() {
            var Matcher = this.Matcher = new DynamicMatcher;
            window.addEvent("domready", Matcher.update.bind(Matcher));
        })();
    },
    b: function(require, module, exports, global) {
        (function() {
            this.EscapeStack = new EventStack;
            this.OuterClickStack = new EventStack.OuterClick({
                event: Browser.Features.Touch ? "touchstart" : "click"
            });
        })();
    },
    c: function(require, module, exports, global) {
        (function() {
            this.RequestLoader = new Class({
                Implements: [ Class.Singleton ],
                initialize: function(element) {
                    return this.check() || this.setup(element);
                },
                setup: function(element) {
                    this.reset();
                    this.element = element;
                },
                show: function() {
                    this.stack++;
                    return this.toggle("loading", "not_loading");
                },
                hide: function() {
                    this.reduce();
                    if (!this.stack) this.toggle("not_loading", "loading");
                    return this;
                },
                reduce: function() {
                    this.stack--;
                    if (this.stack < 0) this.reset();
                    return this;
                },
                toggle: function(active, inactive) {
                    this.element.removeClass(inactive).addClass(active);
                    return this;
                },
                reset: function() {
                    this.stack = 0;
                    return this;
                }
            });
        })();
    },
    d: function(require, module, exports, global) {
        (function() {
            var global = this;
            Request.Doppelganger = new Class({
                Extends: Request.JSON,
                Implements: [ Class.Binds ],
                options: {
                    loader: true
                },
                initialize: function(options) {
                    this.parent(options);
                    this.loaderTimer = null;
                    window.addEvent("domready", this.bound("retrieveLoader"));
                    if (this.options.loader) this.addEvents({
                        request: this.bound("showLoader"),
                        cancel: this.bound("hideLoader")
                    });
                },
                setHeaders: function(object) {
                    for (var name in object) this.headers[name] = object[name];
                    return this;
                },
                onSuccess: function(json) {
                    if (json) this.fireEvent("complete", arguments).fireEvent("success", arguments).callChain();
                    this.hideLoader();
                },
                onFailure: function() {
                    this.parent();
                    this.hideLoader();
                    if (this.status == 500) window.location = "data:text/html;charset=utf-8," + encodeURIComponent(this.response.text);
                },
                showLoader: function() {
                    if (!this.loader) return;
                    var loader = this.loader;
                    if (typeOf(this.options.loader) == "number") {
                        this.loaderTimer = function() {
                            loader.show();
                        }.delay(this.options.loader);
                        return;
                    }
                    loader.show();
                },
                hideLoader: function() {
                    clearTimeout(this.loaderTimer);
                    if (this.loader) this.loader.hide();
                },
                retrieveLoader: function() {
                    this.loader = "RequestLoader" in global ? Class.getInstanceOf(RequestLoader) || new RequestLoader(document.body) : null;
                }
            });
        })();
    },
    e: function(require, module, exports, global) {
        (function() {
            var base = "applicationState:";
            this.ApplicationState = new (new Class({
                Implements: [ Events ],
                set: function(name, value) {
                    if (!navigator.standalone) return this;
                    LocalStorage.set(base + name, value);
                    return this.fireEvent("stateChange", [ name, value ]);
                }.overloadSetter(),
                get: function(name) {
                    if (!navigator.standalone) return null;
                    return LocalStorage.get(base + name);
                }
            }));
        })();
    },
    f: function(require, module, exports, global) {
        (function() {
            var Dispatcher = this.Dispatcher = new (new Class({
                Implements: [ Class.Binds, Options, Events, Queue ],
                Properties: {
                    currentObject: null,
                    currentStack: null
                },
                options: {
                    url: ApplicationState.get("URL") || History.getPath() || "/",
                    initialVariables: null,
                    selectedClassName: null,
                    hiddenClassName: null,
                    loadingClassName: "loading",
                    selectors: {
                        anchors: "a:internal:not([data-dg-noxhr])",
                        wipe: null,
                        nohistory: null
                    }
                },
                initialize: function(options) {
                    return this.setup(options);
                },
                setup: function(options) {
                    this.setOptions(options);
                    this.animates = 0;
                    this.stacks = {};
                    var url = this.options.url;
                    var self = this, pass = function(method) {
                        return function(event) {
                            method.call(self, this, event);
                        };
                    };
                    this.onClick = pass(this.onClick);
                    this.onWipe = pass(this.onWipe);
                    Matcher.register(this.getSelector("anchors"), this.bound("attach"));
                    var wipe = this.getSelector("wipe");
                    if (wipe) Matcher.register(wipe, this.bound("attachWipeEvent"));
                    this.attachHistoryChange().attachStratcom();
                    var path = location.pathname, variables = this.options.initialVariables;
                    if (variables) this.createObject(path).setData(variables).process();
                    if (url != path) (function() {
                        var object = this.createObject(url, {
                            handler: function() {
                                window.addEvent("domready", function() {
                                    self.process(object);
                                });
                            }
                        }).request();
                    }).delay(10, this);
                },
                attachStratcom: function() {
                    return Stratcom.listen("dispatcher:wipe", this.bound("wipe")).listen("dispatcher:form:request", this.bound("onFormRequest"));
                },
                detachStratcom: function() {
                    return Stratcom.ignore("dispatcher:wipe", this.bound("wipe")).ignore("dispatcher:form:request", this.bound("onFormRequest"));
                },
                onFormRequest: function(url, options) {
                    this.createObject(url, options, "form").forward().request();
                },
                attach: function(elements) {
                    elements.set("data-dg-has-dispatcher", true).addEvent("click", this.onClick);
                    return this;
                },
                detach: function(elements) {
                    elements.set("data-dg-has-dispatcher", false).removeEvent("click", this.onClick);
                    return this;
                },
                attachWipeEvent: function(elements) {
                    elements.addEvent("click", this.onWipe);
                    return this;
                },
                detachWipeEvent: function(elements) {
                    elements.removeEvent("click", this.onWipe);
                    return this;
                },
                attachHistoryChange: function() {
                    History.addEvent("change", this.bound("onChange"));
                    return this;
                },
                detachHistoryChange: function() {
                    History.removeEvent("change", this.bound("onChange"));
                    return this;
                },
                onClick: function(element, event) {
                    if (event.event.which == 2 || event.meta) return;
                    if (event) event.preventDefault();
                    var object = this.createObject(element.get("href"), {
                        handler: this.bound("process"),
                        element: element
                    });
                    var selectedClass = this.getOption("selectedClassName");
                    if (selectedClass && !element.match(this.getSelector("noselect"))) {
                        if (element.hasClass(selectedClass)) return;
                        element.setActive(selectedClass);
                    }
                    if (element.match(this.getSelector("nohistory"))) object.disableHistory();
                    this.fireEvent("click", [ object, element ]);
                    if (!this.aborting) object.request();
                    this.aborting = false;
                },
                onWipe: function(element) {
                    var stack = element.get("data-dg-wipe");
                    if (stack) this.wipe(stack, element.get("href"));
                },
                onChange: function(url, state) {
                    if (!url) return;
                    if (!state) state = {};
                    if (state.ignore) return;
                    var object = this.getCurrentObject();
                    if (url != object.getURL()) {
                        object = this.createObject(url);
                        this.setCurrentObject(object);
                    }
                    var element;
                    if (state.id) {
                        element = document.getElement("[" + state.id + "]");
                        if (element) this.fireEvent("activate", element);
                    }
                    var stack = this.getCurrentStack(), previous = stack ? stack.getCurrent() : null, previousURL = previous ? previous.getURL() : "";
                    if (stack && stack.getLength() >= 1 && previousURL.split("/").length <= url.split("/").length) object.forward();
                    this.fireEvent("change", [ object, element ]);
                    if (!this.aborting) this.request(url);
                    this.aborting = false;
                },
                abort: function() {
                    this.aborting = true;
                    return this;
                },
                request: function(url) {
                    var object = this.getCurrentObject(), replaces = false;
                    if (!object.isForward() || object.isRedirect()) replaces = true;
                    if (replaces && object.shouldUpdateState()) History.replace(url);
                    var stack = this.getCurrentStack(), previous = stack ? stack.getCurrent() : null, state = previous ? Object.toQueryString({
                        dg_state: previous.getState()
                    }) : "";
                    this.animates = 0;
                    if (state) url += (url.indexOf("?") == -1 ? "?" : "&") + state;
                    (new Request.Doppelganger(Object.append({
                        url: url,
                        method: object.getMethod(),
                        onFailure: this.bound("next"),
                        onSuccess: function(data) {
                            object.setData(data).process();
                        }
                    }, object.getRequestOptions()))).setHeaders(object.getRequestHeaders()).send({
                        data: object.getRequestData()
                    });
                    return this;
                },
                process: function(object) {
                    var data = object.getData(), isForm = object.isForm();
                    this.setCurrentObject(object);
                    this.fireEvent("process", object);
                    Stratcom.notify("dispatcher:process", object);
                    if ("redirect" in data) {
                        this.createObject(data.redirect, {
                            redirect: true
                        }).forward().setPreviousURL(object.getURL()).request();
                        return this.next();
                    }
                    if (object.hasHistory() && !History.hasPushState()) History.replace(object.getURL());
                    if (!isForm || "stack" in data) this.processStack(data);
                    for (var key in data) {
                        var value = data[key];
                        if (value == null) continue;
                        var handler = Dispatcher.lookupDataHandler(key);
                        if (handler) handler.call(this, value, data);
                    }
                    if (!this.animates) this.next();
                    return this;
                },
                processStack: function(data) {
                    var name = data.stack;
                    if (!name) return this.setCurrentStack(null);
                    var stack = this.getStack(name);
                    this.setCurrentStack(stack);
                    stack.push(this.getCurrentObject());
                    return this;
                },
                cloneElement: function(element, content) {
                    return element.clone(false, true).set("html", content);
                },
                replaceElement: function(element, newElement, options) {
                    if (!options) options = {};
                    var transition = options.transition || element.get("data-dg-transition"), direction = !this.getCurrentObject().isForward() ? ":back" : "";
                    transition = transition && Element.lookupTransition(transition);
                    if (transition) {
                        var time = transition.getTransitionTime("out" + direction);
                        if (this.animates < time) {
                            clearTimeout(this.animationTimer);
                            this.animationTimer = this.next.delay(time, this);
                            this.animates = time;
                        }
                        element.animate(transition, "out" + direction).addEvent("transitionComplete", function() {
                            this.destroyElement(element);
                        }.bind(this));
                        newElement.animate(transition, "in" + direction);
                    }
                    newElement.inject(element, "after");
                    Matcher.update(newElement);
                    if (!transition) this.destroyElement(element);
                },
                destroyElement: function(element) {
                    element.destroy();
                    Stratcom.notify("element:destroy", element);
                },
                setFactory: function(factory) {
                    if (this.factory) this.factory.setDispatcher(null);
                    factory.setDispatcher(this);
                    this.factory = factory;
                    return this;
                },
                setDefaultFactory: function() {
                    this.setFactory((new Dispatcher.ObjectFactory).defineObjects({
                        "default": Dispatcher.Object,
                        form: Dispatcher.Object.Form
                    }));
                    return this;
                },
                createObject: function(url, options, type) {
                    if (!this.factory) this.setDefaultFactory();
                    return this.factory.create(type || "default", url, options);
                },
                getStack: function(name) {
                    if (!name) return null;
                    var stacks = this.stacks;
                    return stacks[name] ? stacks[name] : stacks[name] = new Dispatcher.Stack(name, this);
                },
                wipe: function(stack, toURL) {
                    this.getStack(stack).wipe();
                    this.fireEvent("wipe", [ toURL ]);
                },
                getOption: function(name) {
                    return this.options[name] || null;
                },
                getSelector: function(name) {
                    return this.options.selectors[name] || null;
                }
            }));
            Object.merge(Dispatcher, new Accessor("DataHandler")).defineDataHandlers({
                page_title: function(title) {
                    if (title) document.title = title;
                },
                replace: function(replace) {
                    for (var selector in replace) {
                        var elements = document.getElements(selector);
                        if (!replace[selector]) {
                            elements.each(this.destroyElement, this);
                            continue;
                        }
                        elements.each(function(element) {
                            this.replaceElement(element, Elements.from(replace[selector])[0]);
                        }, this);
                    }
                },
                content: function(content) {
                    for (var selector in content) {
                        var element = document.getElement(selector);
                        if (!element) continue;
                        if (!content[selector]) {
                            element.empty();
                            continue;
                        }
                        this.replaceElement(element, this.cloneElement(element, content[selector]));
                    }
                },
                reload: function(url) {
                    window.location.href = url;
                }
            });
        })();
    },
    g: function(require, module, exports, global) {
        (function() {
            Dispatcher.ObjectFactory = new Class({
                initialize: function() {
                    Object.append(this, new Accessor("Object"));
                },
                create: function(type, url, options) {
                    var klass = this.lookupObject(type) || this.lookupObject("default");
                    return klass ? new klass(this.dispatcher, url, options) : null;
                },
                setDispatcher: function(dispatcher) {
                    this.dispatcher = dispatcher;
                    return this;
                }
            });
        })();
    },
    h: function(require, module, exports, global) {
        (function() {
            Dispatcher.Object = new Class({
                Implements: [ Options, Class.Binds ],
                Properties: {
                    data: {},
                    stack: null,
                    previousURL: ""
                },
                options: {
                    handler: null,
                    method: null,
                    requestData: null,
                    element: null,
                    isRedirect: false,
                    requestOptions: null
                },
                initialize: function(dispatcher, url, options) {
                    this.setOptions(options);
                    this.dispatcher = dispatcher;
                    this.url = url;
                    this.history = true;
                },
                request: function() {
                    this.dispatcher.chain(this.bound("_request")).call();
                    return this;
                },
                _request: function() {
                    this.time = Date.now();
                    var dispatcher = this.dispatcher, element = this.options.element;
                    if (element) element.set("data-dg-dp-id-" + this.time, 1).addClass(dispatcher.getOption("loadingClassName"));
                    dispatcher.setCurrentObject(this);
                    if (!this.shouldUpdateState()) dispatcher.request(this.url); else History.push(this.url, null, {
                        id: "data-dg-dp-id-" + this.time
                    });
                },
                process: function() {
                    var dispatcher = this.dispatcher;
                    (this.options.handler || dispatcher.process).call(dispatcher, this);
                    var data = this.getData();
                    var element = this.options.element;
                    if (element) element.removeClass(dispatcher.getOption("loadingClassName")).fireEvent("response", data);
                    if (data.url) History.push(data.url, null, {
                        ignore: true
                    });
                    dispatcher.fireEvent("processComplete", [ this, element ]);
                    return this;
                },
                backward: function() {
                    this.moveForward = false;
                    return this;
                },
                forward: function() {
                    this.moveForward = true;
                    return this;
                },
                disableHistory: function() {
                    this.history = false;
                    return this;
                },
                getURL: function() {
                    return this.url;
                },
                getPageTitle: function() {
                    var data = this.getData();
                    var title = data ? data.title : null;
                    return title && title.page || null;
                },
                getBack: function() {
                    var data = this.getData();
                    return data && data.back || null;
                },
                getState: function() {
                    var data = this.getData();
                    return JSON.encode(data && data.state);
                },
                getMethod: function() {
                    var element = this.options.element;
                    return this.options.method || element && element.get("data-dg-dispatcher-method") || "get";
                },
                getRequestData: function() {
                    var requestData = this.options.requestData;
                    if (requestData) return requestData;
                    var element = this.options.element;
                    if (!element) return null;
                    element = element.getElement("[data-dg-dispatcher-request-data]");
                    return element && JSON.decode(element.get("content")) || null;
                },
                getRequestOptions: function() {
                    return this.options.requestOptions;
                },
                getRequestHeaders: function() {
                    return null;
                },
                getTime: function() {
                    return this.time;
                },
                isRoot: function() {
                    return !this.url || this.url == "/";
                },
                hasHistory: function() {
                    return this.history && !this.isForm();
                },
                isForward: function() {
                    return !!this.moveForward;
                },
                isForm: function() {
                    return false;
                },
                isRedirect: function() {
                    return !!this.options.isRedirect;
                },
                shouldUpdateState: function() {
                    return this.hasHistory() && History.hasPushState();
                }
            });
        })();
    },
    i: function(require, module, exports, global) {
        (function() {
            Dispatcher.Object.Form = new Class({
                Extends: Dispatcher.Object,
                isForm: function() {
                    return true;
                }
            });
        })();
    },
    j: function(require, module, exports, global) {
        (function() {
            Dispatcher.Stack = new Class({
                Properties: {
                    name: null
                },
                initialize: function(name, dispatcher) {
                    this.setName(name);
                    this.dispatcher = dispatcher;
                    this.wipe();
                },
                push: function(object) {
                    if (this.current && this.current.getURL() == object.getURL()) return this;
                    object.setStack(this);
                    this.current = object;
                    this.stack.push(this.current);
                    return this;
                },
                pop: function() {
                    var stack = this.stack;
                    stack.pop();
                    this.current = stack[stack.length - 1];
                    return this;
                },
                wipe: function() {
                    this.current = null;
                    this.stack = [];
                    return this;
                },
                getLength: function() {
                    return this.stack.length;
                },
                getPrevious: function() {
                    var stack = this.stack;
                    return stack[stack.length - 2] || null;
                },
                getCurrent: function() {
                    return this.current;
                },
                goTo: function(item, options) {
                    var stack = this.stack, index = stack.indexOf(item);
                    if (index == -1) return this;
                    var object = this.dispatcher.createObject(item.getURL(), options);
                    if (index == stack.length - 1) object.forward();
                    if (!item.hasHistory()) object.disableHistory();
                    object.request();
                    this.current = item;
                    stack.splice(index + 1, stack.length - index);
                    return this;
                }
            });
        })();
    }
});