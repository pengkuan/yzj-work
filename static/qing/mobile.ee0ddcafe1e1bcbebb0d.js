/* generated @ 2018-4-26 20:59:15*/
qingJsonpFunction([0],{5:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});t(0);!function(e,n,t){if(!n.__hasQingMobile){n.__hasQingMobile=!0;var r="鉴权失败",o="config方法需要参数",i="鉴权失败（无法获取签名信息）",c=function(e,n){var t=document.createEvent("HTMLEvents");Object.assign(t,n),t.initEvent(e),document.dispatchEvent(t)},a=function(e){var n=new XMLHttpRequest,t=/^(2\d{2}|304)$/;e.method||(e.method="GET"),e.error||(e.error=function(){}),e.success||(e.success=function(){}),n.open(e.method,e.url),n.onreadystatechange=function(){if(4===n.readyState)if(t.test(n.status))try{e.success(JSON.parse(n.responseText),n)}catch(r){e.error("JSON解析失败")}else e.error(n.responseText)},n.setRequestHeader("Content-type","application/x-www-form-urlencoded"),n.send(function(e){var n=encodeURIComponent;return"string"!=typeof e&&e?Object.keys(e).map(function(t){return n(t)+"="+n(e[t])}).join("&"):e}(e.data))},s={map:{},index:1,indexStep:2,register:function(e){this.index+=this.indexStep;var n=""+this.index;return"function"==typeof e&&(this.map[n]=function(e){this.cb.call(null,e)}.bind({map:this.map,id:n,cb:e})),n},invoke:function(e,n){var t=this.map[e+""];"function"==typeof t&&t(n)}},u={call:function(e,n,t){var r;r="xuntong:"+e+":"+s.register(t)+":"+(n=void 0===n?"":encodeURIComponent(JSON.stringify(n)));var o=!!navigator.userAgent.match(/Qing\/.*;(Android).*/),i=function(){var e=navigator.userAgent.split(";")[0],n=e.slice(e.indexOf("Qing/")+5);return parseFloat(n.slice(2))}();if(o&&i>=9.59)window.prompt(r);else{var c=window.XTBridgeIframes=window.XTBridgeIframes||function(){var e,n,t=[];for(n=0;n<9;n++)(e=document.createElement("IFRAME")).setAttribute("height","1px"),e.setAttribute("width","1px"),e.style.display="none",document.documentElement.appendChild(e),t.push(e);return t}();u.callbackIndex=u.callbackIndex||0;var a=u.callbackIndex;u.callbackIndex+=1;c[a%9].setAttribute("src",r)}},handleMessageFromXT:function(e,n){if("string"==typeof n&&n.match(/^\s*\{/))try{n=JSON.parse(n)}catch(t){console.error(t)}s.invoke(e,n)}},d=["cloudoffice.request","cloudoffice.showCardNotify","cloudoffice.clearCardNotify","cloudoffice.getRoleType","cloudoffice.checkAppAuth","cloudoffice.shareText","cloudoffice.downloadPic","cloudoffice.checkWorkbenchUpdate","ui.changeNavBarStyle","ui.toast","runtime.jsReady","cloudoffice.textShareClosed","cloudoffice.dataReport","ui.webViewScrollTo","runtime.auth"],l=window.CloudHubJSBridge;l&&l.isReady?f(l):window.__onJSBridgeReady=f}function f(e){var s={call:function(n){d.includes(n)?e.invoke.apply(null,arguments):u.call.apply(null,arguments)},on:e.on,handleMessageFromXT:u.handleMessageFromXT};s.invoke=s.call,n.XuntongJSBridge=s;var l=function(e){if(!e)return e.error(r);if(!e.signUrl)return e.error(r+"：缺少参数 signUrl");if("function"==typeof e.success){var n=encodeURIComponent(location.href.split("#")[0]),t=e.signUrl.replace(/\?|$/,"?url="+n+"&").replace(/\&$/,"");a({url:t,method:"post",success:function(n){var t=n.data;return"function"==typeof e.signFormat&&(t=e.signFormat(t)),t?t.appId?t.timeStamp?t.nonceStr?t.signature?void function(e,n){if(!e)return alert(o);s.call("runtime.auth",e,function(e){e.success?n("",e.data):n(e.error||r,e.data),e=null})}(t,function(n,t){n||!t?"function"==typeof e.error&&e.error(r+"："+n):e.success(t.ticket)}):e.error(i+"：缺少 signature"):e.error(i+"：缺少 nonceStr"):e.error(i+"：缺少 timeStamp"):e.error(i+"：缺少 appId"):e.error(i)},error:function(n){"function"==typeof e.error&&e.error(r+"："+n)}})}};t._bridge={call:function(e,n){if("getTicket"===e){var t=n.signUrl,r=n.signFormat,o=n.success,i=n.error;l({signUrl:t,signFormat:r,success:o,error:i})}else{var c=n.success;delete n.success,delete n.error,delete n.complete,s.call(e,n,c)}},on:function(e,n){document.addEventListener(e,n)},off:function(e,n){document.removeEventListener(e,n)},checkJsApi:function(e){return d.includes(e)},config:function(e){if(!e)throw new Error;Array.isArray(e.jsEventList)&&e.jsEventList.forEach(function(e){s.on(e,function(n){c(e,{data:n})})})},trigger:function(n,t){e.trigger(n,t)}},c("QingReady",t._bridge)}}(document,window,window.qing||(window.qing={}))}});