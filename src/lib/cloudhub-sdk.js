(function (root, factory) {
    // requirejs, seajs
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define([], factory);
        // commonjs
    } else if (typeof exports === 'object') {
        module.exports = factory();
        // script
    } else {
        root.cloudhub = factory();
    }
}(this, function () {
    'use strict';

    // ===============================================
    // 兼容XuntongJSBridge

    // 回调管理
    var callbacks = {
        // 序号
        index: 1,
        // 集合
        map: {},
        // 注册一个 callback 并返回它的 id（所有id为奇数）
        register: function (callback) {
            this.index += 2;
            var id = '' + this.index;

            // 被回调后从 map 中删除
            if (typeof callback == 'function') {
                this.map[id] = function (message) {
                    // delete this.map[this.id]
                    this.cb.call(null, message)
                }.bind({ map: this.map, id: id, cb: callback});
            };

            return id;
        },
        // 根据 id 触发 callback
        invoke: function (id, message) {
            var cb = this.map[id + ''];

            if (typeof cb === 'function') {
                cb(message);
            }
        }
    };

    // js桥，用于 jssdk 和 native 之间的通信
    var XTBridge = {
        // js 调用 native 方法
        invoke: function (method, message, callback) {
            var cid = callbacks.register(callback);
            var url;

            if (typeof message === 'undefined') {
                message = '';
            } else {
                message = encodeURIComponent(JSON.stringify(message));
            }

            url = "xuntong:" + method + ":" + cid + ":" + message;

            // iframe 触发协议
            var iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", url);
            iframe.setAttribute("height", "1px");
            iframe.setAttribute("width", "1px");
            iframe.style.display = 'none';
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },
        // native 回调 js
        // loadUrl("javascript:CloudHubJSBridge.callback(port,resultData)");
        callback: function (callbackid, message) {
            if (typeof message === 'string' && message.match(/^\s*\{/)) {
                try {
                    message = JSON.parse(message);
                } catch (e) {}
            };
            callbacks.invoke(callbackid, message)
        }
    };

    window.XuntongJSBridge = {
        invoke: XTBridge.invoke,
        call: XTBridge.invoke,
        handleMessageFromXT: XTBridge.callback
    };

    // ============================================================

    // 错误提示用语
    var ERR_WRONG_UA = '请在云之家客户端打开本页';
    var ERR_JSON_PARSE = 'JSON解析失败';
    var ERR_AUTH = '鉴权失败';
    var ERR_AUTH_TIMEOUT = '鉴权超时';
    var ERR_JSBRIDGE = 'JSBridge初始化失败';
    var ERR_EMPTY_CONFIG = 'config方法需要参数';

    var document = window.document;
    // 鉴权超时时间（秒）
    var AUTH_TIMEOUT = 30;
    // 拷贝对象
    var extend = function (dest, src) {
        Object.keys(src).forEach(function(key){
            dest[key] = src[key];
        });
    };
    // ns
    var namespace = function (obj, ns, value) {
        ns = ns.split('.')
        for(var i = 0; i < ns.length; i++) {
            if (i === ns.length - 1) {
                obj[ns[i]] = value;
            } else {
                obj[ns[i]] = obj[ns[i]] || {};
                obj = obj[ns[i]];
            }
        }
    }
    // 触发document事件
    var dispatchEvent = function (name, params) {
        var event = document.createEvent("HTMLEvents");
        extend(event, params);
        event.initEvent(name);
        document.dispatchEvent(event);
    };
    // 触发sdkerror事件
    var dispatchSdkErrorEvent = function (message) {
        dispatchEvent('sdkerror', { message: message });
    }
    var sdk = {
        config: function (cfg) {
            // alert(JSON.stringify(cfg))
            if (!cfg) return alert(ERR_EMPTY_CONFIG);

            if (typeof cfg.ready === 'function') {
                document.addEventListener('sdkready', cfg.ready);
            }

            if (typeof cfg.error === 'function') {
                document.addEventListener('sdkerror', cfg.error);
            }

            var ready = function (bridge) {
                if (!bridge) return alert(ERR_JSBRIDGE);

                // 全局事件监听
                (cfg.jsEventList || []).forEach(function(name) {
                    bridge.on(name, function(data) {
                        dispatchEvent(name, { data: data });
                    });
                });

                var initApi = function (api) {
                    var handler = function () {
                        var args = Array.prototype.slice.call(arguments, 0);
                        // 确保最后一个参数是回调函数
                        if (typeof args[args.length - 1] !== 'function') {
                            args.push(function () {})
                        }
                        // 最后一个参数是回调函数
                        // 倒数第二个参数是传入参数
                        var cid = bridge.invoke(
                            api,
                            args[args.length - 2],
                            args[args.length - 1]
                        );
                        // 句柄
                        return {
                            // 回调id
                            id: cid,
                            // 监听
                            listen: function (name, callback) {
                                bridge.on(name + this.id, function (e) {
                                    callback(e.data);
                                });
                            }
                        }
                    };

                    namespace(sdk, api, handler);
                };

                if (cfg.auth === false) {
                    (cfg.jsApiList || []).forEach(initApi);
                    dispatchEvent('sdkready', {});
                    return;
                }

                // 应用鉴权超时控制
                var timer = setTimeout(function(){
                    dispatchSdkErrorEvent(ERR_AUTH_TIMEOUT);
                }, (cfg.timeout || AUTH_TIMEOUT)*1000);

                // 发起应用鉴权
                bridge.invoke('runtime.auth', cfg, function (e) {
                    // 清除超时
                    clearTimeout(timer);
                    // 检查应用鉴权结果

                    // alert(JSON.stringify(cfg) + '\n\n' + JSON.stringify(e))
                    if (e.success) {
                        (cfg.jsApiList || []).forEach(initApi);
                        dispatchEvent('sdkready', { data: e.data });
                    } else {
                        dispatchSdkErrorEvent(ERR_AUTH);
                    };
                });
            }

            // 如果Bridge已经就绪，直接调用ready方法
            // 否则等待Bridge就绪
            var bridge = window.CloudHubJSBridge;
            console.log(bridge)
            if (!window.CloudHubJSBridge || !window.CloudHubJSBridge.isReady) {
                window.__onJSBridgeReady = ready;
            } else {
                ready(bridge);
            }

            return sdk;
        },
        ajax: function (opt) {
            var xhr = new XMLHttpRequest();
            var reg = /^(2\d{2}|304)$/;
            var encode = function (data) {
                var e = encodeURIComponent;
                if (typeof data === "string" || !data) return data;
                return Object.keys(data).map(function(k) {
                    return e(k) + '=' + e(data[k]);
                }).join('&');
            }

            opt.method || (opt.method = 'GET');
            opt.error || (opt.error = function(){});
            opt.success || (opt.success = function(){});

            xhr.open(opt.method, opt.url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (reg.test(xhr.status)) {
                        try{
                            opt.success(JSON.parse(xhr.responseText), xhr);
                        } catch (e) {
                            opt.error(ERR_JSON_PARSE);
                        }
                    } else {
                        opt.error(xhr.responseText);
                    }
                }
            };
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(encode(opt.data));

            return sdk;
        }
    };

    // 客户端检查
    if (!navigator.userAgent.match(/Qing\/.*;(iPhone|iOS|Android).*/)) {
        sdk = {
            config: function () { return dispatchSdkErrorEvent(ERR_WRONG_UA), sdk; },
            ajax: function () { return dispatchSdkErrorEvent(ERR_WRONG_UA), sdk; }
        }
    };

    return sdk;
}));
