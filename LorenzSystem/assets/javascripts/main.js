/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * index.js
	 * */

	(function(global) {

	    var $ = __webpack_require__(1);
	    var THREE = __webpack_require__(3);
	    __webpack_require__(4);
	    __webpack_require__(5);
	    __webpack_require__(6);
	    __webpack_require__(7);
	    __webpack_require__(8);
	    __webpack_require__(9);
	    var dat = __webpack_require__(10);
	    var Simulation = __webpack_require__(11);
	    var TWEEN = __webpack_require__(13);

	    var app, App = function(id) {
	        app = this;
	        app.init(id);
	    };

	    App.prototype = {

	        init : function(id) {

	            app.scene = new THREE.Scene();
	            
	            app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 10000);
	            app.camera.position.z = 400;

	            app.renderer = new THREE.WebGLRenderer({
	                alpha: true,
	                antialias: true
	            });

	            app.renderer.setClearColor(0x000000);
	            app.renderer.setSize(window.innerWidth, window.innerHeight);
	            $(id).append(app.renderer.domElement);

	            var loader = new THREE.TextureLoader();

	            var size = 512;

	            app.simulation = new Simulation({
	                width : size,
	                height : size,
	                kernel : __webpack_require__(14),
	                position : __webpack_require__(15)
	            });

	            var geometry = new THREE.BufferGeometry();
	            var vertices = new Float32Array(size * size * 3);
	            var uv = new Float32Array(size * size * 2)

	            var vertIdx = 0;
	            var uvIdx = 0;

	            for(var y = 0; y < size; y++) {
	                var ry = y / size;
	                for(var x = 0; x < size; x++) {
	                    vertices[vertIdx++] = (Math.random() - 0.5);
	                    vertices[vertIdx++] = (Math.random() - 0.5);
	                    vertices[vertIdx++] = (Math.random() - 0.5);

	                    uv[uvIdx++] = x / size;
	                    uv[uvIdx++] = ry;
	                }
	            }

	            geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
	            geometry.addAttribute("uv", new THREE.BufferAttribute(uv, 2));

	            loader.load("assets/textures/particle.jpg", function(ptex) {
	                app.mesh = new THREE.Points(
	                    geometry,
	                    new THREE.RawShaderMaterial({
	                        vertexShader : __webpack_require__(16),
	                        fragmentShader : __webpack_require__(17),
	                        uniforms : {
	                            particleTex : { type : "t", value : ptex },
	                            positionTex : { type : "t", value : app.simulation.positionTex },
	                            pointSize : { type : "f", value : 2 },
	                            time : { type : "f", value : 0.0 }
	                        },
	                        depthTest : false,
	                        transparent : true,
	                        blending : THREE.AdditiveBlending
	                    })
	                );
	                app.mesh.scale.set(5, 5, 5);
	                app.mesh.rotation.set(0, 0, Math.PI);
	                app.scene.add(app.mesh);
	            });

	            var effectController = {
	                sigma : 10.2,
	                rho : 30.5,
	                beta : 8.0,
	                reset : function() {
	                    app.simulation.reset(app.renderer);
	                }
	            };

	            var matChanger = function() {
	                if(app.simulation) {
	                    app.simulation.updateLorenzProps(effectController.sigma, effectController.rho, effectController.beta);
	                }
	            };
	            matChanger();

	            var gui = new dat.GUI();
				gui.add(effectController, "sigma", 0.0, 20.0, 0.001).onChange(matChanger);
				gui.add(effectController, "rho", 0.0, 30.0, 0.0001).onChange(matChanger);
				gui.add(effectController, "beta", 0.0, 20.0, 0.001).onChange(matChanger);
				gui.add(effectController, "reset");
				gui.close();

	            app.clock = new THREE.Clock();
	            app.controls = new THREE.TrackballControls(app.camera, app.renderer.domElement);
	            app.controls.minDistance = 5;
	            app.controls.maxDistance = 500;

	            app.composer = new THREE.EffectComposer(app.renderer);
	            app.composer.addPass(new THREE.RenderPass(app.scene, app.camera));

	            app.filterPass = new THREE.ShaderPass({
	                uniforms : {
	                    "tDiffuse" : { type : "t", value : null },
	                    "tBg" : { type : "t", value : null },
	                    "tGrad" : { type : "t", value : null },

	                    "resolution" : { type : "v2", value : new THREE.Vector2(window.innerWidth, window.innerHeight) },
	                    "aspect" : { type : "f", value : window.innerWidth / window.innerHeight },
	                    "ratio" : { type : "f", value : 1 / 2 },

	                    "gamma" : { type : "f", value : 1.5 },
	                    "time" : { type : "f", value : 0.0 }
	                },
	                vertexShader : __webpack_require__(18),
	                fragmentShader : __webpack_require__(19)
	            });
	            app.filterPass.renderToScreen = true;
	            app.composer.addPass(app.filterPass);

	            loader.load("assets/textures/starmap_4k.jpg", function(tBg) {
	                loader.load("assets/textures/gradient.jpg", function(tGrad) {
	                    tBg.wrapS = tBg.wrapT = THREE.RepeatWrapping;
	                    tGrad.wrapS = tGrad.wrapT = THREE.RepeatWrapping;

	                    app.filterPass.uniforms.tBg.value = tBg;
	                    app.filterPass.uniforms.tGrad.value = tGrad;
	                    app.filterPass.uniforms.ratio.value = tBg.image.height / tBg.image.width;
	                    app.loop();
	                });
	            });

	            $(window).on('resize', function() { app.resize(); });

	        },

	        loop : function() {
	            requestAnimationFrame(function() { app.loop(); });

	            TWEEN.update();

	            var delta = app.clock.getDelta();
	            app.controls.update(delta);

	            app.simulation.simulate(app.renderer, app.clock.elapsedTime, delta);
	            if(app.mesh) {
	                app.mesh.material.uniforms.time.value = app.clock.elapsedTime;
	                app.mesh.material.uniforms.positionTex.value = app.simulation.positionTexture;
	            }

	            app.filterPass.uniforms.time.value = app.clock.elapsedTime;

	            // app.renderer.render(app.scene, app.camera);
	            app.composer.render(delta);
	        },

	        resize : function() {
	            var w = window.innerWidth;
	            var h = window.innerHeight;
	            var aspect = w / h;
	            app.camera.aspect = aspect;
	            app.camera.updateProjectionMatrix();
	            app.renderer.setSize(w, h);
	            app.filterPass.uniforms.resolution.value = new THREE.Vector2(w, h);
	            app.filterPass.uniforms.aspect.value = aspect;
	        }

	    };
	    
	    $(function() {
	        var app = new App("#viewer");
	    });

	})(this);




/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! jQuery v2.1.4 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */
	!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)+1>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b="length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,aa=/[+~]/,ba=/'|\\/g,ca=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),da=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ea=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fa){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=_.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ba,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+ra(o[l]);w=aa.test(a)&&pa(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function pa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",ea,!1):e.attachEvent&&e.attachEvent("onunload",ea)),p=!f(g),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?la(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ca,da),a[3]=(a[3]||a[4]||a[5]||"").replace(ca,da),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ca,da).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(ca,da),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return W.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(ca,da).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:oa(function(){return[0]}),last:oa(function(a,b){return[b-1]}),eq:oa(function(a,b,c){return[0>c?c+b:c]}),even:oa(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:oa(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:oa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:oa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function qa(){}qa.prototype=d.filters=d.pseudos,d.setFilters=new qa,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function ra(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function sa(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function ta(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ua(a,b,c){for(var d=0,e=b.length;e>d;d++)ga(a,b[d],c);return c}function va(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function wa(a,b,c,d,e,f){return d&&!d[u]&&(d=wa(d)),e&&!e[u]&&(e=wa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ua(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:va(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=va(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=va(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function xa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sa(function(a){return a===b},h,!0),l=sa(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[sa(ta(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return wa(i>1&&ta(m),i>1&&ra(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xa(a.slice(i,e)),f>e&&xa(a=a.slice(e)),f>e&&ra(a))}m.push(c)}return ta(m)}function ya(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=va(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&ga.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=xa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,ya(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ca,da),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ca,da),aa.test(j[0].type)&&pa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&ra(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,aa.test(a)&&pa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+K.uid++}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){
	return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var aa=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ba=/<([\w:]+)/,ca=/<|&#?\w+;/,da=/<(?:script|style|link)/i,ea=/checked\s*(?:[^=]|=\s*.checked.)/i,fa=/^$|\/(?:java|ecma)script/i,ga=/^true\/(.*)/,ha=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ia={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ia.optgroup=ia.option,ia.tbody=ia.tfoot=ia.colgroup=ia.caption=ia.thead,ia.th=ia.td;function ja(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function ka(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function la(a){var b=ga.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function ma(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function na(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function oa(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pa(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=oa(h),f=oa(a),d=0,e=f.length;e>d;d++)pa(f[d],g[d]);if(b)if(c)for(f=f||oa(a),g=g||oa(h),d=0,e=f.length;e>d;d++)na(f[d],g[d]);else na(a,h);return g=oa(h,"script"),g.length>0&&ma(g,!i&&oa(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(ca.test(e)){f=f||k.appendChild(b.createElement("div")),g=(ba.exec(e)||["",""])[1].toLowerCase(),h=ia[g]||ia._default,f.innerHTML=h[1]+e.replace(aa,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=oa(k.appendChild(e),"script"),i&&ma(f),c)){j=0;while(e=f[j++])fa.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(oa(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&ma(oa(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(oa(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!da.test(a)&&!ia[(ba.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(aa,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(oa(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(oa(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&ea.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(oa(c,"script"),ka),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,oa(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,la),j=0;g>j;j++)h=f[j],fa.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(ha,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qa,ra={};function sa(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function ta(a){var b=l,c=ra[a];return c||(c=sa(a,b),"none"!==c&&c||(qa=(qa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qa[0].contentDocument,b.write(),b.close(),c=sa(a,b),qa.detach()),ra[a]=c),c}var ua=/^margin/,va=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wa=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)};function xa(a,b,c){var d,e,f,g,h=a.style;return c=c||wa(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),va.test(g)&&ua.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function ya(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),f.removeChild(c),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var za=/^(none|table(?!-c[ea]).+)/,Aa=new RegExp("^("+Q+")(.*)$","i"),Ba=new RegExp("^([+-])=("+Q+")","i"),Ca={position:"absolute",visibility:"hidden",display:"block"},Da={letterSpacing:"0",fontWeight:"400"},Ea=["Webkit","O","Moz","ms"];function Fa(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Ea.length;while(e--)if(b=Ea[e]+c,b in a)return b;return d}function Ga(a,b,c){var d=Aa.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Ha(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ia(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wa(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xa(a,b,f),(0>e||null==e)&&(e=a.style[b]),va.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Ha(a,b,c||(g?"border":"content"),d,f)+"px"}function Ja(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",ta(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xa(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fa(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Ba.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fa(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xa(a,b,d)),"normal"===e&&b in Da&&(e=Da[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?za.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Ca,function(){return Ia(a,b,d)}):Ia(a,b,d):void 0},set:function(a,c,d){var e=d&&wa(a);return Ga(a,c,d?Ha(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=ya(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ua.test(a)||(n.cssHooks[a+b].set=Ga)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wa(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Ja(this,!0)},hide:function(){return Ja(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Ka(a,b,c,d,e){return new Ka.prototype.init(a,b,c,d,e)}n.Tween=Ka,Ka.prototype={constructor:Ka,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ka.propHooks[this.prop];return a&&a.get?a.get(this):Ka.propHooks._default.get(this)},run:function(a){var b,c=Ka.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ka.propHooks._default.set(this),this}},Ka.prototype.init.prototype=Ka.prototype,Ka.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Ka.propHooks.scrollTop=Ka.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Ka.prototype.init,n.fx.step={};var La,Ma,Na=/^(?:toggle|show|hide)$/,Oa=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pa=/queueHooks$/,Qa=[Va],Ra={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Oa.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Oa.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sa(){return setTimeout(function(){La=void 0}),La=n.now()}function Ta(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ua(a,b,c){for(var d,e=(Ra[b]||[]).concat(Ra["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Va(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||ta(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Na.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?ta(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ua(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wa(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xa(a,b,c){var d,e,f=0,g=Qa.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=La||Sa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:La||Sa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wa(k,j.opts.specialEasing);g>f;f++)if(d=Qa[f].call(j,a,k,j.opts))return d;return n.map(k,Ua,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xa,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Ra[c]=Ra[c]||[],Ra[c].unshift(b)},prefilter:function(a,b){b?Qa.unshift(a):Qa.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xa(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pa.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Ta(b,!0),a,d,e)}}),n.each({slideDown:Ta("show"),slideUp:Ta("hide"),slideToggle:Ta("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(La=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),La=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ma||(Ma=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Ma),Ma=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Ya,Za,$a=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Za:Ya)),
	void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Za={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$a[b]||n.find.attr;$a[b]=function(a,b,d){var e,f;return d||(f=$a[b],$a[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$a[b]=f),e}});var _a=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_a.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ab=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ab," ").indexOf(b)>=0)return!0;return!1}});var bb=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cb=n.now(),db=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var eb=/#.*$/,fb=/([?&])_=[^&]*/,gb=/^(.*?):[ \t]*([^\r\n]*)$/gm,hb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,ib=/^(?:GET|HEAD)$/,jb=/^\/\//,kb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,lb={},mb={},nb="*/".concat("*"),ob=a.location.href,pb=kb.exec(ob.toLowerCase())||[];function qb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function rb(a,b,c,d){var e={},f=a===mb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function sb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function tb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function ub(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:ob,type:"GET",isLocal:hb.test(pb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":nb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?sb(sb(a,n.ajaxSettings),b):sb(n.ajaxSettings,a)},ajaxPrefilter:qb(lb),ajaxTransport:qb(mb),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=gb.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||ob)+"").replace(eb,"").replace(jb,pb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=kb.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===pb[1]&&h[2]===pb[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(pb[3]||("http:"===pb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),rb(lb,k,b,v),2===t)return v;i=n.event&&k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!ib.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(db.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=fb.test(d)?d.replace(fb,"$1_="+cb++):d+(db.test(d)?"&":"?")+"_="+cb++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+nb+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=rb(mb,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=tb(k,v,f)),u=ub(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var vb=/%20/g,wb=/\[\]$/,xb=/\r?\n/g,yb=/^(?:submit|button|image|reset|file)$/i,zb=/^(?:input|select|textarea|keygen)/i;function Ab(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||wb.test(a)?d(a,e):Ab(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Ab(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Ab(c,a[c],b,e);return d.join("&").replace(vb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&zb.test(this.nodeName)&&!yb.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(xb,"\r\n")}}):{name:b.name,value:c.replace(xb,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Bb=0,Cb={},Db={0:200,1223:204},Eb=n.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Cb)Cb[a]()}),k.cors=!!Eb&&"withCredentials"in Eb,k.ajax=Eb=!!Eb,n.ajaxTransport(function(a){var b;return k.cors||Eb&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Bb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Cb[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Db[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Cb[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Fb=[],Gb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Fb.pop()||n.expando+"_"+cb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Gb.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Gb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Gb,"$1"+e):b.jsonp!==!1&&(b.url+=(db.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Fb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Hb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Hb)return Hb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Ib=a.document.documentElement;function Jb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Jb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Ib;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ib})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Jb(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=ya(k.pixelPosition,function(a,c){return c?(c=xa(a,b),va.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"=="function"&&__webpack_require__(2)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return n}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));var Kb=a.jQuery,Lb=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Lb),b&&a.jQuery===n&&(a.jQuery=Kb),n},typeof b===U&&(a.jQuery=a.$=n),n});
	//# sourceMappingURL=jquery.min.map

/***/ },
/* 2 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// threejs.org/license
	'use strict';var THREE={REVISION:"73"}; true?!(__WEBPACK_AMD_DEFINE_FACTORY__ = (THREE), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!==typeof exports&&"undefined"!==typeof module&&(module.exports=THREE);
	void 0!==self.requestAnimationFrame&&void 0!==self.cancelAnimationFrame||function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!self.requestAnimationFrame;++c)self.requestAnimationFrame=self[b[c]+"RequestAnimationFrame"],self.cancelAnimationFrame=self[b[c]+"CancelAnimationFrame"]||self[b[c]+"CancelRequestAnimationFrame"];void 0===self.requestAnimationFrame&&void 0!==self.setTimeout&&(self.requestAnimationFrame=function(b){var c=Date.now(),g=Math.max(0,16-(c-a)),f=self.setTimeout(function(){b(c+
	g)},g);a=c+g;return f});void 0===self.cancelAnimationFrame&&void 0!==self.clearTimeout&&(self.cancelAnimationFrame=function(a){self.clearTimeout(a)})}();void 0===self.performance&&(self.performance={});void 0===self.performance.now&&function(){var a=Date.now();self.performance.now=function(){return Date.now()-a}}();void 0===Number.EPSILON&&(Number.EPSILON=Math.pow(2,-52));void 0===Math.sign&&(Math.sign=function(a){return 0>a?-1:0<a?1:+a});
	void 0===Function.prototype.name&&void 0!==Object.defineProperty&&Object.defineProperty(Function.prototype,"name",{get:function(){return this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1]}});THREE.MOUSE={LEFT:0,MIDDLE:1,RIGHT:2};THREE.CullFaceNone=0;THREE.CullFaceBack=1;THREE.CullFaceFront=2;THREE.CullFaceFrontBack=3;THREE.FrontFaceDirectionCW=0;THREE.FrontFaceDirectionCCW=1;THREE.BasicShadowMap=0;THREE.PCFShadowMap=1;THREE.PCFSoftShadowMap=2;THREE.FrontSide=0;THREE.BackSide=1;
	THREE.DoubleSide=2;THREE.FlatShading=1;THREE.SmoothShading=2;THREE.NoColors=0;THREE.FaceColors=1;THREE.VertexColors=2;THREE.NoBlending=0;THREE.NormalBlending=1;THREE.AdditiveBlending=2;THREE.SubtractiveBlending=3;THREE.MultiplyBlending=4;THREE.CustomBlending=5;THREE.AddEquation=100;THREE.SubtractEquation=101;THREE.ReverseSubtractEquation=102;THREE.MinEquation=103;THREE.MaxEquation=104;THREE.ZeroFactor=200;THREE.OneFactor=201;THREE.SrcColorFactor=202;THREE.OneMinusSrcColorFactor=203;
	THREE.SrcAlphaFactor=204;THREE.OneMinusSrcAlphaFactor=205;THREE.DstAlphaFactor=206;THREE.OneMinusDstAlphaFactor=207;THREE.DstColorFactor=208;THREE.OneMinusDstColorFactor=209;THREE.SrcAlphaSaturateFactor=210;THREE.NeverDepth=0;THREE.AlwaysDepth=1;THREE.LessDepth=2;THREE.LessEqualDepth=3;THREE.EqualDepth=4;THREE.GreaterEqualDepth=5;THREE.GreaterDepth=6;THREE.NotEqualDepth=7;THREE.MultiplyOperation=0;THREE.MixOperation=1;THREE.AddOperation=2;THREE.UVMapping=300;THREE.CubeReflectionMapping=301;
	THREE.CubeRefractionMapping=302;THREE.EquirectangularReflectionMapping=303;THREE.EquirectangularRefractionMapping=304;THREE.SphericalReflectionMapping=305;THREE.RepeatWrapping=1E3;THREE.ClampToEdgeWrapping=1001;THREE.MirroredRepeatWrapping=1002;THREE.NearestFilter=1003;THREE.NearestMipMapNearestFilter=1004;THREE.NearestMipMapLinearFilter=1005;THREE.LinearFilter=1006;THREE.LinearMipMapNearestFilter=1007;THREE.LinearMipMapLinearFilter=1008;THREE.UnsignedByteType=1009;THREE.ByteType=1010;
	THREE.ShortType=1011;THREE.UnsignedShortType=1012;THREE.IntType=1013;THREE.UnsignedIntType=1014;THREE.FloatType=1015;THREE.HalfFloatType=1025;THREE.UnsignedShort4444Type=1016;THREE.UnsignedShort5551Type=1017;THREE.UnsignedShort565Type=1018;THREE.AlphaFormat=1019;THREE.RGBFormat=1020;THREE.RGBAFormat=1021;THREE.LuminanceFormat=1022;THREE.LuminanceAlphaFormat=1023;THREE.RGBEFormat=THREE.RGBAFormat;THREE.RGB_S3TC_DXT1_Format=2001;THREE.RGBA_S3TC_DXT1_Format=2002;THREE.RGBA_S3TC_DXT3_Format=2003;
	THREE.RGBA_S3TC_DXT5_Format=2004;THREE.RGB_PVRTC_4BPPV1_Format=2100;THREE.RGB_PVRTC_2BPPV1_Format=2101;THREE.RGBA_PVRTC_4BPPV1_Format=2102;THREE.RGBA_PVRTC_2BPPV1_Format=2103;THREE.LoopOnce=2200;THREE.LoopRepeat=2201;THREE.LoopPingPong=2202;
	THREE.Projector=function(){console.error("THREE.Projector has been moved to /examples/js/renderers/Projector.js.");this.projectVector=function(a,b){console.warn("THREE.Projector: .projectVector() is now vector.project().");a.project(b)};this.unprojectVector=function(a,b){console.warn("THREE.Projector: .unprojectVector() is now vector.unproject().");a.unproject(b)};this.pickingRay=function(a,b){console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().")}};
	THREE.CanvasRenderer=function(){console.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js");this.domElement=document.createElement("canvas");this.clear=function(){};this.render=function(){};this.setClearColor=function(){};this.setSize=function(){}};THREE.Color=function(a){return 3===arguments.length?this.fromArray(arguments):this.set(a)};
	THREE.Color.prototype={constructor:THREE.Color,r:1,g:1,b:1,set:function(a){a instanceof THREE.Color?this.copy(a):"number"===typeof a?this.setHex(a):"string"===typeof a&&this.setStyle(a);return this},setHex:function(a){a=Math.floor(a);this.r=(a>>16&255)/255;this.g=(a>>8&255)/255;this.b=(a&255)/255;return this},setRGB:function(a,b,c){this.r=a;this.g=b;this.b=c;return this},setHSL:function(){function a(a,c,d){0>d&&(d+=1);1<d&&(d-=1);return d<1/6?a+6*(c-a)*d:.5>d?c:d<2/3?a+6*(c-a)*(2/3-d):a}return function(b,
	c,d){b=THREE.Math.euclideanModulo(b,1);c=THREE.Math.clamp(c,0,1);d=THREE.Math.clamp(d,0,1);0===c?this.r=this.g=this.b=d:(c=.5>=d?d*(1+c):d+c-d*c,d=2*d-c,this.r=a(d,c,b+1/3),this.g=a(d,c,b),this.b=a(d,c,b-1/3));return this}}(),setStyle:function(a){function b(b){void 0!==b&&1>parseFloat(b)&&console.warn("THREE.Color: Alpha component of "+a+" will be ignored.")}var c;if(c=/^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(a)){var d=c[2];switch(c[1]){case "rgb":case "rgba":if(c=/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d))return this.r=
	Math.min(255,parseInt(c[1],10))/255,this.g=Math.min(255,parseInt(c[2],10))/255,this.b=Math.min(255,parseInt(c[3],10))/255,b(c[5]),this;if(c=/^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d))return this.r=Math.min(100,parseInt(c[1],10))/100,this.g=Math.min(100,parseInt(c[2],10))/100,this.b=Math.min(100,parseInt(c[3],10))/100,b(c[5]),this;break;case "hsl":case "hsla":if(c=/^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d)){var d=parseFloat(c[1])/
	360,e=parseInt(c[2],10)/100,g=parseInt(c[3],10)/100;b(c[5]);return this.setHSL(d,e,g)}}}else if(c=/^\#([A-Fa-f0-9]+)$/.exec(a)){c=c[1];d=c.length;if(3===d)return this.r=parseInt(c.charAt(0)+c.charAt(0),16)/255,this.g=parseInt(c.charAt(1)+c.charAt(1),16)/255,this.b=parseInt(c.charAt(2)+c.charAt(2),16)/255,this;if(6===d)return this.r=parseInt(c.charAt(0)+c.charAt(1),16)/255,this.g=parseInt(c.charAt(2)+c.charAt(3),16)/255,this.b=parseInt(c.charAt(4)+c.charAt(5),16)/255,this}a&&0<a.length&&(c=THREE.ColorKeywords[a],
	void 0!==c?this.setHex(c):console.warn("THREE.Color: Unknown color "+a));return this},clone:function(){return new this.constructor(this.r,this.g,this.b)},copy:function(a){this.r=a.r;this.g=a.g;this.b=a.b;return this},copyGammaToLinear:function(a,b){void 0===b&&(b=2);this.r=Math.pow(a.r,b);this.g=Math.pow(a.g,b);this.b=Math.pow(a.b,b);return this},copyLinearToGamma:function(a,b){void 0===b&&(b=2);var c=0<b?1/b:1;this.r=Math.pow(a.r,c);this.g=Math.pow(a.g,c);this.b=Math.pow(a.b,c);return this},convertGammaToLinear:function(){var a=
	this.r,b=this.g,c=this.b;this.r=a*a;this.g=b*b;this.b=c*c;return this},convertLinearToGamma:function(){this.r=Math.sqrt(this.r);this.g=Math.sqrt(this.g);this.b=Math.sqrt(this.b);return this},getHex:function(){return 255*this.r<<16^255*this.g<<8^255*this.b<<0},getHexString:function(){return("000000"+this.getHex().toString(16)).slice(-6)},getHSL:function(a){a=a||{h:0,s:0,l:0};var b=this.r,c=this.g,d=this.b,e=Math.max(b,c,d),g=Math.min(b,c,d),f,h=(g+e)/2;if(g===e)g=f=0;else{var l=e-g,g=.5>=h?l/(e+g):
	l/(2-e-g);switch(e){case b:f=(c-d)/l+(c<d?6:0);break;case c:f=(d-b)/l+2;break;case d:f=(b-c)/l+4}f/=6}a.h=f;a.s=g;a.l=h;return a},getStyle:function(){return"rgb("+(255*this.r|0)+","+(255*this.g|0)+","+(255*this.b|0)+")"},offsetHSL:function(a,b,c){var d=this.getHSL();d.h+=a;d.s+=b;d.l+=c;this.setHSL(d.h,d.s,d.l);return this},add:function(a){this.r+=a.r;this.g+=a.g;this.b+=a.b;return this},addColors:function(a,b){this.r=a.r+b.r;this.g=a.g+b.g;this.b=a.b+b.b;return this},addScalar:function(a){this.r+=
	a;this.g+=a;this.b+=a;return this},multiply:function(a){this.r*=a.r;this.g*=a.g;this.b*=a.b;return this},multiplyScalar:function(a){this.r*=a;this.g*=a;this.b*=a;return this},lerp:function(a,b){this.r+=(a.r-this.r)*b;this.g+=(a.g-this.g)*b;this.b+=(a.b-this.b)*b;return this},equals:function(a){return a.r===this.r&&a.g===this.g&&a.b===this.b},fromArray:function(a,b){void 0===b&&(b=0);this.r=a[b];this.g=a[b+1];this.b=a[b+2];return this},toArray:function(a,b){void 0===a&&(a=[]);void 0===b&&(b=0);a[b]=
	this.r;a[b+1]=this.g;a[b+2]=this.b;return a}};
	THREE.ColorKeywords={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,
	darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,
	grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,
	lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,
	palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,
	tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};THREE.Quaternion=function(a,b,c,d){this._x=a||0;this._y=b||0;this._z=c||0;this._w=void 0!==d?d:1};
	THREE.Quaternion.prototype={constructor:THREE.Quaternion,get x(){return this._x},set x(a){this._x=a;this.onChangeCallback()},get y(){return this._y},set y(a){this._y=a;this.onChangeCallback()},get z(){return this._z},set z(a){this._z=a;this.onChangeCallback()},get w(){return this._w},set w(a){this._w=a;this.onChangeCallback()},set:function(a,b,c,d){this._x=a;this._y=b;this._z=c;this._w=d;this.onChangeCallback();return this},clone:function(){return new this.constructor(this._x,this._y,this._z,this._w)},
	copy:function(a){this._x=a.x;this._y=a.y;this._z=a.z;this._w=a.w;this.onChangeCallback();return this},setFromEuler:function(a,b){if(!1===a instanceof THREE.Euler)throw Error("THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.");var c=Math.cos(a._x/2),d=Math.cos(a._y/2),e=Math.cos(a._z/2),g=Math.sin(a._x/2),f=Math.sin(a._y/2),h=Math.sin(a._z/2),l=a.order;"XYZ"===l?(this._x=g*d*e+c*f*h,this._y=c*f*e-g*d*h,this._z=c*d*h+g*f*e,this._w=c*d*e-g*f*h):"YXZ"===
	l?(this._x=g*d*e+c*f*h,this._y=c*f*e-g*d*h,this._z=c*d*h-g*f*e,this._w=c*d*e+g*f*h):"ZXY"===l?(this._x=g*d*e-c*f*h,this._y=c*f*e+g*d*h,this._z=c*d*h+g*f*e,this._w=c*d*e-g*f*h):"ZYX"===l?(this._x=g*d*e-c*f*h,this._y=c*f*e+g*d*h,this._z=c*d*h-g*f*e,this._w=c*d*e+g*f*h):"YZX"===l?(this._x=g*d*e+c*f*h,this._y=c*f*e+g*d*h,this._z=c*d*h-g*f*e,this._w=c*d*e-g*f*h):"XZY"===l&&(this._x=g*d*e-c*f*h,this._y=c*f*e-g*d*h,this._z=c*d*h+g*f*e,this._w=c*d*e+g*f*h);if(!1!==b)this.onChangeCallback();return this},setFromAxisAngle:function(a,
	b){var c=b/2,d=Math.sin(c);this._x=a.x*d;this._y=a.y*d;this._z=a.z*d;this._w=Math.cos(c);this.onChangeCallback();return this},setFromRotationMatrix:function(a){var b=a.elements,c=b[0];a=b[4];var d=b[8],e=b[1],g=b[5],f=b[9],h=b[2],l=b[6],b=b[10],k=c+g+b;0<k?(c=.5/Math.sqrt(k+1),this._w=.25/c,this._x=(l-f)*c,this._y=(d-h)*c,this._z=(e-a)*c):c>g&&c>b?(c=2*Math.sqrt(1+c-g-b),this._w=(l-f)/c,this._x=.25*c,this._y=(a+e)/c,this._z=(d+h)/c):g>b?(c=2*Math.sqrt(1+g-c-b),this._w=(d-h)/c,this._x=(a+e)/c,this._y=
	.25*c,this._z=(f+l)/c):(c=2*Math.sqrt(1+b-c-g),this._w=(e-a)/c,this._x=(d+h)/c,this._y=(f+l)/c,this._z=.25*c);this.onChangeCallback();return this},setFromUnitVectors:function(){var a,b;return function(c,d){void 0===a&&(a=new THREE.Vector3);b=c.dot(d)+1;1E-6>b?(b=0,Math.abs(c.x)>Math.abs(c.z)?a.set(-c.y,c.x,0):a.set(0,-c.z,c.y)):a.crossVectors(c,d);this._x=a.x;this._y=a.y;this._z=a.z;this._w=b;this.normalize();return this}}(),inverse:function(){this.conjugate().normalize();return this},conjugate:function(){this._x*=
	-1;this._y*=-1;this._z*=-1;this.onChangeCallback();return this},dot:function(a){return this._x*a._x+this._y*a._y+this._z*a._z+this._w*a._w},lengthSq:function(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w},length:function(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)},normalize:function(){var a=this.length();0===a?(this._z=this._y=this._x=0,this._w=1):(a=1/a,this._x*=a,this._y*=a,this._z*=a,this._w*=a);this.onChangeCallback();return this},
	multiply:function(a,b){return void 0!==b?(console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."),this.multiplyQuaternions(a,b)):this.multiplyQuaternions(this,a)},multiplyQuaternions:function(a,b){var c=a._x,d=a._y,e=a._z,g=a._w,f=b._x,h=b._y,l=b._z,k=b._w;this._x=c*k+g*f+d*l-e*h;this._y=d*k+g*h+e*f-c*l;this._z=e*k+g*l+c*h-d*f;this._w=g*k-c*f-d*h-e*l;this.onChangeCallback();return this},multiplyVector3:function(a){console.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.");
	return a.applyQuaternion(this)},slerp:function(a,b){if(0===b)return this;if(1===b)return this.copy(a);var c=this._x,d=this._y,e=this._z,g=this._w,f=g*a._w+c*a._x+d*a._y+e*a._z;0>f?(this._w=-a._w,this._x=-a._x,this._y=-a._y,this._z=-a._z,f=-f):this.copy(a);if(1<=f)return this._w=g,this._x=c,this._y=d,this._z=e,this;var h=Math.acos(f),l=Math.sqrt(1-f*f);if(.001>Math.abs(l))return this._w=.5*(g+this._w),this._x=.5*(c+this._x),this._y=.5*(d+this._y),this._z=.5*(e+this._z),this;f=Math.sin((1-b)*h)/l;h=
	Math.sin(b*h)/l;this._w=g*f+this._w*h;this._x=c*f+this._x*h;this._y=d*f+this._y*h;this._z=e*f+this._z*h;this.onChangeCallback();return this},equals:function(a){return a._x===this._x&&a._y===this._y&&a._z===this._z&&a._w===this._w},fromArray:function(a,b){void 0===b&&(b=0);this._x=a[b];this._y=a[b+1];this._z=a[b+2];this._w=a[b+3];this.onChangeCallback();return this},toArray:function(a,b){void 0===a&&(a=[]);void 0===b&&(b=0);a[b]=this._x;a[b+1]=this._y;a[b+2]=this._z;a[b+3]=this._w;return a},onChange:function(a){this.onChangeCallback=
	a;return this},onChangeCallback:function(){}};THREE.Quaternion.slerp=function(a,b,c,d){return c.copy(a).slerp(b,d)};THREE.Vector2=function(a,b){this.x=a||0;this.y=b||0};
	THREE.Vector2.prototype={constructor:THREE.Vector2,get width(){return this.x},set width(a){this.x=a},get height(){return this.y},set height(a){this.y=a},set:function(a,b){this.x=a;this.y=b;return this},setX:function(a){this.x=a;return this},setY:function(a){this.y=a;return this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;default:throw Error("index is out of range: "+a);}},getComponent:function(a){switch(a){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+
	a);}},clone:function(){return new this.constructor(this.x,this.y)},copy:function(a){this.x=a.x;this.y=a.y;return this},add:function(a,b){if(void 0!==b)return console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b);this.x+=a.x;this.y+=a.y;return this},addScalar:function(a){this.x+=a;this.y+=a;return this},addVectors:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;return this},addScaledVector:function(a,b){this.x+=a.x*b;this.y+=a.y*b;return this},
	sub:function(a,b){if(void 0!==b)return console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b);this.x-=a.x;this.y-=a.y;return this},subScalar:function(a){this.x-=a;this.y-=a;return this},subVectors:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;return this},multiply:function(a){this.x*=a.x;this.y*=a.y;return this},multiplyScalar:function(a){isFinite(a)?(this.x*=a,this.y*=a):this.y=this.x=0;return this},divide:function(a){this.x/=a.x;
	this.y/=a.y;return this},divideScalar:function(a){return this.multiplyScalar(1/a)},min:function(a){this.x=Math.min(this.x,a.x);this.y=Math.min(this.y,a.y);return this},max:function(a){this.x=Math.max(this.x,a.x);this.y=Math.max(this.y,a.y);return this},clamp:function(a,b){this.x=Math.max(a.x,Math.min(b.x,this.x));this.y=Math.max(a.y,Math.min(b.y,this.y));return this},clampScalar:function(){var a,b;return function(c,d){void 0===a&&(a=new THREE.Vector2,b=new THREE.Vector2);a.set(c,c);b.set(d,d);return this.clamp(a,
	b)}}(),clampLength:function(a,b){var c=this.length();this.multiplyScalar(Math.max(a,Math.min(b,c))/c);return this},floor:function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);return this},ceil:function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);return this},round:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this},roundToZero:function(){this.x=0>this.x?Math.ceil(this.x):Math.floor(this.x);this.y=0>this.y?Math.ceil(this.y):Math.floor(this.y);return this},negate:function(){this.x=
	-this.x;this.y=-this.y;return this},dot:function(a){return this.x*a.x+this.y*a.y},lengthSq:function(){return this.x*this.x+this.y*this.y},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},lengthManhattan:function(){return Math.abs(this.x)+Math.abs(this.y)},normalize:function(){return this.divideScalar(this.length())},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x;a=this.y-a.y;return b*b+a*a},setLength:function(a){return this.multiplyScalar(a/
	this.length())},lerp:function(a,b){this.x+=(a.x-this.x)*b;this.y+=(a.y-this.y)*b;return this},lerpVectors:function(a,b,c){this.subVectors(b,a).multiplyScalar(c).add(a);return this},equals:function(a){return a.x===this.x&&a.y===this.y},fromArray:function(a,b){void 0===b&&(b=0);this.x=a[b];this.y=a[b+1];return this},toArray:function(a,b){void 0===a&&(a=[]);void 0===b&&(b=0);a[b]=this.x;a[b+1]=this.y;return a},fromAttribute:function(a,b,c){void 0===c&&(c=0);b=b*a.itemSize+c;this.x=a.array[b];this.y=
	a.array[b+1];return this},rotateAround:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=this.x-a.x,g=this.y-a.y;this.x=e*c-g*d+a.x;this.y=e*d+g*c+a.y;return this}};THREE.Vector3=function(a,b,c){this.x=a||0;this.y=b||0;this.z=c||0};
	THREE.Vector3.prototype={constructor:THREE.Vector3,set:function(a,b,c){this.x=a;this.y=b;this.z=c;return this},setX:function(a){this.x=a;return this},setY:function(a){this.y=a;return this},setZ:function(a){this.z=a;return this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;case 2:this.z=b;break;default:throw Error("index is out of range: "+a);}},getComponent:function(a){switch(a){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+
	a);}},clone:function(){return new this.constructor(this.x,this.y,this.z)},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;return this},add:function(a,b){if(void 0!==b)return console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b);this.x+=a.x;this.y+=a.y;this.z+=a.z;return this},addScalar:function(a){this.x+=a;this.y+=a;this.z+=a;return this},addVectors:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this},addScaledVector:function(a,
	b){this.x+=a.x*b;this.y+=a.y*b;this.z+=a.z*b;return this},sub:function(a,b){if(void 0!==b)return console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b);this.x-=a.x;this.y-=a.y;this.z-=a.z;return this},subScalar:function(a){this.x-=a;this.y-=a;this.z-=a;return this},subVectors:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this},multiply:function(a,b){if(void 0!==b)return console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."),
	this.multiplyVectors(a,b);this.x*=a.x;this.y*=a.y;this.z*=a.z;return this},multiplyScalar:function(a){isFinite(a)?(this.x*=a,this.y*=a,this.z*=a):this.z=this.y=this.x=0;return this},multiplyVectors:function(a,b){this.x=a.x*b.x;this.y=a.y*b.y;this.z=a.z*b.z;return this},applyEuler:function(){var a;return function(b){!1===b instanceof THREE.Euler&&console.error("THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order.");void 0===a&&(a=new THREE.Quaternion);this.applyQuaternion(a.setFromEuler(b));
	return this}}(),applyAxisAngle:function(){var a;return function(b,c){void 0===a&&(a=new THREE.Quaternion);this.applyQuaternion(a.setFromAxisAngle(b,c));return this}}(),applyMatrix3:function(a){var b=this.x,c=this.y,d=this.z;a=a.elements;this.x=a[0]*b+a[3]*c+a[6]*d;this.y=a[1]*b+a[4]*c+a[7]*d;this.z=a[2]*b+a[5]*c+a[8]*d;return this},applyMatrix4:function(a){var b=this.x,c=this.y,d=this.z;a=a.elements;this.x=a[0]*b+a[4]*c+a[8]*d+a[12];this.y=a[1]*b+a[5]*c+a[9]*d+a[13];this.z=a[2]*b+a[6]*c+a[10]*d+a[14];
	return this},applyProjection:function(a){var b=this.x,c=this.y,d=this.z;a=a.elements;var e=1/(a[3]*b+a[7]*c+a[11]*d+a[15]);this.x=(a[0]*b+a[4]*c+a[8]*d+a[12])*e;this.y=(a[1]*b+a[5]*c+a[9]*d+a[13])*e;this.z=(a[2]*b+a[6]*c+a[10]*d+a[14])*e;return this},applyQuaternion:function(a){var b=this.x,c=this.y,d=this.z,e=a.x,g=a.y,f=a.z;a=a.w;var h=a*b+g*d-f*c,l=a*c+f*b-e*d,k=a*d+e*c-g*b,b=-e*b-g*c-f*d;this.x=h*a+b*-e+l*-f-k*-g;this.y=l*a+b*-g+k*-e-h*-f;this.z=k*a+b*-f+h*-g-l*-e;return this},project:function(){var a;
	return function(b){void 0===a&&(a=new THREE.Matrix4);a.multiplyMatrices(b.projectionMatrix,a.getInverse(b.matrixWorld));return this.applyProjection(a)}}(),unproject:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.multiplyMatrices(b.matrixWorld,a.getInverse(b.projectionMatrix));return this.applyProjection(a)}}(),transformDirection:function(a){var b=this.x,c=this.y,d=this.z;a=a.elements;this.x=a[0]*b+a[4]*c+a[8]*d;this.y=a[1]*b+a[5]*c+a[9]*d;this.z=a[2]*b+a[6]*c+a[10]*d;this.normalize();
	return this},divide:function(a){this.x/=a.x;this.y/=a.y;this.z/=a.z;return this},divideScalar:function(a){return this.multiplyScalar(1/a)},min:function(a){this.x=Math.min(this.x,a.x);this.y=Math.min(this.y,a.y);this.z=Math.min(this.z,a.z);return this},max:function(a){this.x=Math.max(this.x,a.x);this.y=Math.max(this.y,a.y);this.z=Math.max(this.z,a.z);return this},clamp:function(a,b){this.x=Math.max(a.x,Math.min(b.x,this.x));this.y=Math.max(a.y,Math.min(b.y,this.y));this.z=Math.max(a.z,Math.min(b.z,
	this.z));return this},clampScalar:function(){var a,b;return function(c,d){void 0===a&&(a=new THREE.Vector3,b=new THREE.Vector3);a.set(c,c,c);b.set(d,d,d);return this.clamp(a,b)}}(),clampLength:function(a,b){var c=this.length();this.multiplyScalar(Math.max(a,Math.min(b,c))/c);return this},floor:function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);this.z=Math.floor(this.z);return this},ceil:function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);this.z=Math.ceil(this.z);return this},
	round:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);this.z=Math.round(this.z);return this},roundToZero:function(){this.x=0>this.x?Math.ceil(this.x):Math.floor(this.x);this.y=0>this.y?Math.ceil(this.y):Math.floor(this.y);this.z=0>this.z?Math.ceil(this.z):Math.floor(this.z);return this},negate:function(){this.x=-this.x;this.y=-this.y;this.z=-this.z;return this},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z},
	length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)},lengthManhattan:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)},normalize:function(){return this.divideScalar(this.length())},setLength:function(a){return this.multiplyScalar(a/this.length())},lerp:function(a,b){this.x+=(a.x-this.x)*b;this.y+=(a.y-this.y)*b;this.z+=(a.z-this.z)*b;return this},lerpVectors:function(a,b,c){this.subVectors(b,a).multiplyScalar(c).add(a);return this},cross:function(a,b){if(void 0!==
	b)return console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."),this.crossVectors(a,b);var c=this.x,d=this.y,e=this.z;this.x=d*a.z-e*a.y;this.y=e*a.x-c*a.z;this.z=c*a.y-d*a.x;return this},crossVectors:function(a,b){var c=a.x,d=a.y,e=a.z,g=b.x,f=b.y,h=b.z;this.x=d*h-e*f;this.y=e*g-c*h;this.z=c*f-d*g;return this},projectOnVector:function(){var a,b;return function(c){void 0===a&&(a=new THREE.Vector3);a.copy(c).normalize();b=this.dot(a);return this.copy(a).multiplyScalar(b)}}(),
	projectOnPlane:function(){var a;return function(b){void 0===a&&(a=new THREE.Vector3);a.copy(this).projectOnVector(b);return this.sub(a)}}(),reflect:function(){var a;return function(b){void 0===a&&(a=new THREE.Vector3);return this.sub(a.copy(b).multiplyScalar(2*this.dot(b)))}}(),angleTo:function(a){a=this.dot(a)/(this.length()*a.length());return Math.acos(THREE.Math.clamp(a,-1,1))},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x,c=
	this.y-a.y;a=this.z-a.z;return b*b+c*c+a*a},setEulerFromRotationMatrix:function(a,b){console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")},setEulerFromQuaternion:function(a,b){console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")},getPositionFromMatrix:function(a){console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().");return this.setFromMatrixPosition(a)},
	getScaleFromMatrix:function(a){console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().");return this.setFromMatrixScale(a)},getColumnFromMatrix:function(a,b){console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().");return this.setFromMatrixColumn(a,b)},setFromMatrixPosition:function(a){this.x=a.elements[12];this.y=a.elements[13];this.z=a.elements[14];return this},setFromMatrixScale:function(a){var b=this.set(a.elements[0],
	a.elements[1],a.elements[2]).length(),c=this.set(a.elements[4],a.elements[5],a.elements[6]).length();a=this.set(a.elements[8],a.elements[9],a.elements[10]).length();this.x=b;this.y=c;this.z=a;return this},setFromMatrixColumn:function(a,b){var c=4*a,d=b.elements;this.x=d[c];this.y=d[c+1];this.z=d[c+2];return this},equals:function(a){return a.x===this.x&&a.y===this.y&&a.z===this.z},fromArray:function(a,b){void 0===b&&(b=0);this.x=a[b];this.y=a[b+1];this.z=a[b+2];return this},toArray:function(a,b){void 0===
	a&&(a=[]);void 0===b&&(b=0);a[b]=this.x;a[b+1]=this.y;a[b+2]=this.z;return a},fromAttribute:function(a,b,c){void 0===c&&(c=0);b=b*a.itemSize+c;this.x=a.array[b];this.y=a.array[b+1];this.z=a.array[b+2];return this}};THREE.Vector4=function(a,b,c,d){this.x=a||0;this.y=b||0;this.z=c||0;this.w=void 0!==d?d:1};
	THREE.Vector4.prototype={constructor:THREE.Vector4,set:function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;return this},setX:function(a){this.x=a;return this},setY:function(a){this.y=a;return this},setZ:function(a){this.z=a;return this},setW:function(a){this.w=a;return this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;case 2:this.z=b;break;case 3:this.w=b;break;default:throw Error("index is out of range: "+a);}},getComponent:function(a){switch(a){case 0:return this.x;
	case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+a);}},clone:function(){return new this.constructor(this.x,this.y,this.z,this.w)},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;this.w=void 0!==a.w?a.w:1;return this},add:function(a,b){if(void 0!==b)return console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b);this.x+=a.x;this.y+=a.y;this.z+=a.z;this.w+=a.w;return this},
	addScalar:function(a){this.x+=a;this.y+=a;this.z+=a;this.w+=a;return this},addVectors:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;this.w=a.w+b.w;return this},addScaledVector:function(a,b){this.x+=a.x*b;this.y+=a.y*b;this.z+=a.z*b;this.w+=a.w*b;return this},sub:function(a,b){if(void 0!==b)return console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b);this.x-=a.x;this.y-=a.y;this.z-=a.z;this.w-=a.w;return this},subScalar:function(a){this.x-=
	a;this.y-=a;this.z-=a;this.w-=a;return this},subVectors:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;this.w=a.w-b.w;return this},multiplyScalar:function(a){isFinite(a)?(this.x*=a,this.y*=a,this.z*=a,this.w*=a):this.w=this.z=this.y=this.x=0;return this},applyMatrix4:function(a){var b=this.x,c=this.y,d=this.z,e=this.w;a=a.elements;this.x=a[0]*b+a[4]*c+a[8]*d+a[12]*e;this.y=a[1]*b+a[5]*c+a[9]*d+a[13]*e;this.z=a[2]*b+a[6]*c+a[10]*d+a[14]*e;this.w=a[3]*b+a[7]*c+a[11]*d+a[15]*e;return this},
	divideScalar:function(a){return this.multiplyScalar(1/a)},setAxisAngleFromQuaternion:function(a){this.w=2*Math.acos(a.w);var b=Math.sqrt(1-a.w*a.w);1E-4>b?(this.x=1,this.z=this.y=0):(this.x=a.x/b,this.y=a.y/b,this.z=a.z/b);return this},setAxisAngleFromRotationMatrix:function(a){var b,c,d;a=a.elements;var e=a[0];d=a[4];var g=a[8],f=a[1],h=a[5],l=a[9];c=a[2];b=a[6];var k=a[10];if(.01>Math.abs(d-f)&&.01>Math.abs(g-c)&&.01>Math.abs(l-b)){if(.1>Math.abs(d+f)&&.1>Math.abs(g+c)&&.1>Math.abs(l+b)&&.1>Math.abs(e+
	h+k-3))return this.set(1,0,0,0),this;a=Math.PI;e=(e+1)/2;h=(h+1)/2;k=(k+1)/2;d=(d+f)/4;g=(g+c)/4;l=(l+b)/4;e>h&&e>k?.01>e?(b=0,d=c=.707106781):(b=Math.sqrt(e),c=d/b,d=g/b):h>k?.01>h?(b=.707106781,c=0,d=.707106781):(c=Math.sqrt(h),b=d/c,d=l/c):.01>k?(c=b=.707106781,d=0):(d=Math.sqrt(k),b=g/d,c=l/d);this.set(b,c,d,a);return this}a=Math.sqrt((b-l)*(b-l)+(g-c)*(g-c)+(f-d)*(f-d));.001>Math.abs(a)&&(a=1);this.x=(b-l)/a;this.y=(g-c)/a;this.z=(f-d)/a;this.w=Math.acos((e+h+k-1)/2);return this},min:function(a){this.x=
	Math.min(this.x,a.x);this.y=Math.min(this.y,a.y);this.z=Math.min(this.z,a.z);this.w=Math.min(this.w,a.w);return this},max:function(a){this.x=Math.max(this.x,a.x);this.y=Math.max(this.y,a.y);this.z=Math.max(this.z,a.z);this.w=Math.max(this.w,a.w);return this},clamp:function(a,b){this.x=Math.max(a.x,Math.min(b.x,this.x));this.y=Math.max(a.y,Math.min(b.y,this.y));this.z=Math.max(a.z,Math.min(b.z,this.z));this.w=Math.max(a.w,Math.min(b.w,this.w));return this},clampScalar:function(){var a,b;return function(c,
	d){void 0===a&&(a=new THREE.Vector4,b=new THREE.Vector4);a.set(c,c,c,c);b.set(d,d,d,d);return this.clamp(a,b)}}(),floor:function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);this.z=Math.floor(this.z);this.w=Math.floor(this.w);return this},ceil:function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);this.z=Math.ceil(this.z);this.w=Math.ceil(this.w);return this},round:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);this.z=Math.round(this.z);this.w=Math.round(this.w);return this},
	roundToZero:function(){this.x=0>this.x?Math.ceil(this.x):Math.floor(this.x);this.y=0>this.y?Math.ceil(this.y):Math.floor(this.y);this.z=0>this.z?Math.ceil(this.z):Math.floor(this.z);this.w=0>this.w?Math.ceil(this.w):Math.floor(this.w);return this},negate:function(){this.x=-this.x;this.y=-this.y;this.z=-this.z;this.w=-this.w;return this},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z+this.w*a.w},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w},length:function(){return Math.sqrt(this.x*
	this.x+this.y*this.y+this.z*this.z+this.w*this.w)},lengthManhattan:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)},normalize:function(){return this.divideScalar(this.length())},setLength:function(a){return this.multiplyScalar(a/this.length())},lerp:function(a,b){this.x+=(a.x-this.x)*b;this.y+=(a.y-this.y)*b;this.z+=(a.z-this.z)*b;this.w+=(a.w-this.w)*b;return this},lerpVectors:function(a,b,c){this.subVectors(b,a).multiplyScalar(c).add(a);return this},equals:function(a){return a.x===
	this.x&&a.y===this.y&&a.z===this.z&&a.w===this.w},fromArray:function(a,b){void 0===b&&(b=0);this.x=a[b];this.y=a[b+1];this.z=a[b+2];this.w=a[b+3];return this},toArray:function(a,b){void 0===a&&(a=[]);void 0===b&&(b=0);a[b]=this.x;a[b+1]=this.y;a[b+2]=this.z;a[b+3]=this.w;return a},fromAttribute:function(a,b,c){void 0===c&&(c=0);b=b*a.itemSize+c;this.x=a.array[b];this.y=a.array[b+1];this.z=a.array[b+2];this.w=a.array[b+3];return this}};
	THREE.Euler=function(a,b,c,d){this._x=a||0;this._y=b||0;this._z=c||0;this._order=d||THREE.Euler.DefaultOrder};THREE.Euler.RotationOrders="XYZ YZX ZXY XZY YXZ ZYX".split(" ");THREE.Euler.DefaultOrder="XYZ";
	THREE.Euler.prototype={constructor:THREE.Euler,get x(){return this._x},set x(a){this._x=a;this.onChangeCallback()},get y(){return this._y},set y(a){this._y=a;this.onChangeCallback()},get z(){return this._z},set z(a){this._z=a;this.onChangeCallback()},get order(){return this._order},set order(a){this._order=a;this.onChangeCallback()},set:function(a,b,c,d){this._x=a;this._y=b;this._z=c;this._order=d||this._order;this.onChangeCallback();return this},clone:function(){return new this.constructor(this._x,
	this._y,this._z,this._order)},copy:function(a){this._x=a._x;this._y=a._y;this._z=a._z;this._order=a._order;this.onChangeCallback();return this},setFromRotationMatrix:function(a,b,c){var d=THREE.Math.clamp,e=a.elements;a=e[0];var g=e[4],f=e[8],h=e[1],l=e[5],k=e[9],m=e[2],p=e[6],e=e[10];b=b||this._order;"XYZ"===b?(this._y=Math.asin(d(f,-1,1)),.99999>Math.abs(f)?(this._x=Math.atan2(-k,e),this._z=Math.atan2(-g,a)):(this._x=Math.atan2(p,l),this._z=0)):"YXZ"===b?(this._x=Math.asin(-d(k,-1,1)),.99999>Math.abs(k)?
	(this._y=Math.atan2(f,e),this._z=Math.atan2(h,l)):(this._y=Math.atan2(-m,a),this._z=0)):"ZXY"===b?(this._x=Math.asin(d(p,-1,1)),.99999>Math.abs(p)?(this._y=Math.atan2(-m,e),this._z=Math.atan2(-g,l)):(this._y=0,this._z=Math.atan2(h,a))):"ZYX"===b?(this._y=Math.asin(-d(m,-1,1)),.99999>Math.abs(m)?(this._x=Math.atan2(p,e),this._z=Math.atan2(h,a)):(this._x=0,this._z=Math.atan2(-g,l))):"YZX"===b?(this._z=Math.asin(d(h,-1,1)),.99999>Math.abs(h)?(this._x=Math.atan2(-k,l),this._y=Math.atan2(-m,a)):(this._x=
	0,this._y=Math.atan2(f,e))):"XZY"===b?(this._z=Math.asin(-d(g,-1,1)),.99999>Math.abs(g)?(this._x=Math.atan2(p,l),this._y=Math.atan2(f,a)):(this._x=Math.atan2(-k,e),this._y=0)):console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: "+b);this._order=b;if(!1!==c)this.onChangeCallback();return this},setFromQuaternion:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Matrix4);a.makeRotationFromQuaternion(b);this.setFromRotationMatrix(a,c,d);return this}}(),setFromVector3:function(a,
	b){return this.set(a.x,a.y,a.z,b||this._order)},reorder:function(){var a=new THREE.Quaternion;return function(b){a.setFromEuler(this);this.setFromQuaternion(a,b)}}(),equals:function(a){return a._x===this._x&&a._y===this._y&&a._z===this._z&&a._order===this._order},fromArray:function(a){this._x=a[0];this._y=a[1];this._z=a[2];void 0!==a[3]&&(this._order=a[3]);this.onChangeCallback();return this},toArray:function(a,b){void 0===a&&(a=[]);void 0===b&&(b=0);a[b]=this._x;a[b+1]=this._y;a[b+2]=this._z;a[b+
	3]=this._order;return a},toVector3:function(a){return a?a.set(this._x,this._y,this._z):new THREE.Vector3(this._x,this._y,this._z)},onChange:function(a){this.onChangeCallback=a;return this},onChangeCallback:function(){}};THREE.Line3=function(a,b){this.start=void 0!==a?a:new THREE.Vector3;this.end=void 0!==b?b:new THREE.Vector3};
	THREE.Line3.prototype={constructor:THREE.Line3,set:function(a,b){this.start.copy(a);this.end.copy(b);return this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.start.copy(a.start);this.end.copy(a.end);return this},center:function(a){return(a||new THREE.Vector3).addVectors(this.start,this.end).multiplyScalar(.5)},delta:function(a){return(a||new THREE.Vector3).subVectors(this.end,this.start)},distanceSq:function(){return this.start.distanceToSquared(this.end)},distance:function(){return this.start.distanceTo(this.end)},
	at:function(a,b){var c=b||new THREE.Vector3;return this.delta(c).multiplyScalar(a).add(this.start)},closestPointToPointParameter:function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(c,d){a.subVectors(c,this.start);b.subVectors(this.end,this.start);var e=b.dot(b),e=b.dot(a)/e;d&&(e=THREE.Math.clamp(e,0,1));return e}}(),closestPointToPoint:function(a,b,c){a=this.closestPointToPointParameter(a,b);c=c||new THREE.Vector3;return this.delta(c).multiplyScalar(a).add(this.start)},applyMatrix4:function(a){this.start.applyMatrix4(a);
	this.end.applyMatrix4(a);return this},equals:function(a){return a.start.equals(this.start)&&a.end.equals(this.end)}};THREE.Box2=function(a,b){this.min=void 0!==a?a:new THREE.Vector2(Infinity,Infinity);this.max=void 0!==b?b:new THREE.Vector2(-Infinity,-Infinity)};
	THREE.Box2.prototype={constructor:THREE.Box2,set:function(a,b){this.min.copy(a);this.max.copy(b);return this},setFromPoints:function(a){this.makeEmpty();for(var b=0,c=a.length;b<c;b++)this.expandByPoint(a[b]);return this},setFromCenterAndSize:function(){var a=new THREE.Vector2;return function(b,c){var d=a.copy(c).multiplyScalar(.5);this.min.copy(b).sub(d);this.max.copy(b).add(d);return this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.min.copy(a.min);this.max.copy(a.max);
	return this},makeEmpty:function(){this.min.x=this.min.y=Infinity;this.max.x=this.max.y=-Infinity;return this},empty:function(){return this.max.x<this.min.x||this.max.y<this.min.y},center:function(a){return(a||new THREE.Vector2).addVectors(this.min,this.max).multiplyScalar(.5)},size:function(a){return(a||new THREE.Vector2).subVectors(this.max,this.min)},expandByPoint:function(a){this.min.min(a);this.max.max(a);return this},expandByVector:function(a){this.min.sub(a);this.max.add(a);return this},expandByScalar:function(a){this.min.addScalar(-a);
	this.max.addScalar(a);return this},containsPoint:function(a){return a.x<this.min.x||a.x>this.max.x||a.y<this.min.y||a.y>this.max.y?!1:!0},containsBox:function(a){return this.min.x<=a.min.x&&a.max.x<=this.max.x&&this.min.y<=a.min.y&&a.max.y<=this.max.y?!0:!1},getParameter:function(a,b){return(b||new THREE.Vector2).set((a.x-this.min.x)/(this.max.x-this.min.x),(a.y-this.min.y)/(this.max.y-this.min.y))},isIntersectionBox:function(a){return a.max.x<this.min.x||a.min.x>this.max.x||a.max.y<this.min.y||a.min.y>
	this.max.y?!1:!0},clampPoint:function(a,b){return(b||new THREE.Vector2).copy(a).clamp(this.min,this.max)},distanceToPoint:function(){var a=new THREE.Vector2;return function(b){return a.copy(b).clamp(this.min,this.max).sub(b).length()}}(),intersect:function(a){this.min.max(a.min);this.max.min(a.max);return this},union:function(a){this.min.min(a.min);this.max.max(a.max);return this},translate:function(a){this.min.add(a);this.max.add(a);return this},equals:function(a){return a.min.equals(this.min)&&
	a.max.equals(this.max)}};THREE.Box3=function(a,b){this.min=void 0!==a?a:new THREE.Vector3(Infinity,Infinity,Infinity);this.max=void 0!==b?b:new THREE.Vector3(-Infinity,-Infinity,-Infinity)};
	THREE.Box3.prototype={constructor:THREE.Box3,set:function(a,b){this.min.copy(a);this.max.copy(b);return this},setFromPoints:function(a){this.makeEmpty();for(var b=0,c=a.length;b<c;b++)this.expandByPoint(a[b]);return this},setFromCenterAndSize:function(){var a=new THREE.Vector3;return function(b,c){var d=a.copy(c).multiplyScalar(.5);this.min.copy(b).sub(d);this.max.copy(b).add(d);return this}}(),setFromObject:function(){var a=new THREE.Vector3;return function(b){var c=this;b.updateMatrixWorld(!0);
	this.makeEmpty();b.traverse(function(b){var e=b.geometry;if(void 0!==e)if(e instanceof THREE.Geometry)for(var g=e.vertices,e=0,f=g.length;e<f;e++)a.copy(g[e]),a.applyMatrix4(b.matrixWorld),c.expandByPoint(a);else if(e instanceof THREE.BufferGeometry&&void 0!==e.attributes.position)for(g=e.attributes.position.array,e=0,f=g.length;e<f;e+=3)a.set(g[e],g[e+1],g[e+2]),a.applyMatrix4(b.matrixWorld),c.expandByPoint(a)});return this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.min.copy(a.min);
	this.max.copy(a.max);return this},makeEmpty:function(){this.min.x=this.min.y=this.min.z=Infinity;this.max.x=this.max.y=this.max.z=-Infinity;return this},empty:function(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z},center:function(a){return(a||new THREE.Vector3).addVectors(this.min,this.max).multiplyScalar(.5)},size:function(a){return(a||new THREE.Vector3).subVectors(this.max,this.min)},expandByPoint:function(a){this.min.min(a);this.max.max(a);return this},expandByVector:function(a){this.min.sub(a);
	this.max.add(a);return this},expandByScalar:function(a){this.min.addScalar(-a);this.max.addScalar(a);return this},containsPoint:function(a){return a.x<this.min.x||a.x>this.max.x||a.y<this.min.y||a.y>this.max.y||a.z<this.min.z||a.z>this.max.z?!1:!0},containsBox:function(a){return this.min.x<=a.min.x&&a.max.x<=this.max.x&&this.min.y<=a.min.y&&a.max.y<=this.max.y&&this.min.z<=a.min.z&&a.max.z<=this.max.z?!0:!1},getParameter:function(a,b){return(b||new THREE.Vector3).set((a.x-this.min.x)/(this.max.x-
	this.min.x),(a.y-this.min.y)/(this.max.y-this.min.y),(a.z-this.min.z)/(this.max.z-this.min.z))},isIntersectionBox:function(a){return a.max.x<this.min.x||a.min.x>this.max.x||a.max.y<this.min.y||a.min.y>this.max.y||a.max.z<this.min.z||a.min.z>this.max.z?!1:!0},clampPoint:function(a,b){return(b||new THREE.Vector3).copy(a).clamp(this.min,this.max)},distanceToPoint:function(){var a=new THREE.Vector3;return function(b){return a.copy(b).clamp(this.min,this.max).sub(b).length()}}(),getBoundingSphere:function(){var a=
	new THREE.Vector3;return function(b){b=b||new THREE.Sphere;b.center=this.center();b.radius=.5*this.size(a).length();return b}}(),intersect:function(a){this.min.max(a.min);this.max.min(a.max);return this},union:function(a){this.min.min(a.min);this.max.max(a.max);return this},applyMatrix4:function(){var a=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];return function(b){a[0].set(this.min.x,this.min.y,
	this.min.z).applyMatrix4(b);a[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(b);a[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(b);a[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(b);a[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(b);a[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(b);a[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(b);a[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(b);this.makeEmpty();this.setFromPoints(a);return this}}(),translate:function(a){this.min.add(a);
	this.max.add(a);return this},equals:function(a){return a.min.equals(this.min)&&a.max.equals(this.max)}};THREE.Matrix3=function(){this.elements=new Float32Array([1,0,0,0,1,0,0,0,1]);0<arguments.length&&console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")};
	THREE.Matrix3.prototype={constructor:THREE.Matrix3,set:function(a,b,c,d,e,g,f,h,l){var k=this.elements;k[0]=a;k[3]=b;k[6]=c;k[1]=d;k[4]=e;k[7]=g;k[2]=f;k[5]=h;k[8]=l;return this},identity:function(){this.set(1,0,0,0,1,0,0,0,1);return this},clone:function(){return(new this.constructor).fromArray(this.elements)},copy:function(a){a=a.elements;this.set(a[0],a[3],a[6],a[1],a[4],a[7],a[2],a[5],a[8]);return this},multiplyVector3:function(a){console.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.");
	return a.applyMatrix3(this)},multiplyVector3Array:function(a){console.warn("THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.");return this.applyToVector3Array(a)},applyToVector3Array:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Vector3);void 0===c&&(c=0);void 0===d&&(d=b.length);for(var e=0;e<d;e+=3,c+=3)a.fromArray(b,c),a.applyMatrix3(this),a.toArray(b,c);return b}}(),applyToBuffer:function(){var a;return function(b,c,d){void 0===
	a&&(a=new THREE.Vector3);void 0===c&&(c=0);void 0===d&&(d=b.length/b.itemSize);for(var e=0;e<d;e++,c++)a.x=b.getX(c),a.y=b.getY(c),a.z=b.getZ(c),a.applyMatrix3(this),b.setXYZ(a.x,a.y,a.z);return b}}(),multiplyScalar:function(a){var b=this.elements;b[0]*=a;b[3]*=a;b[6]*=a;b[1]*=a;b[4]*=a;b[7]*=a;b[2]*=a;b[5]*=a;b[8]*=a;return this},determinant:function(){var a=this.elements,b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],l=a[7],a=a[8];return b*g*a-b*f*l-c*e*a+c*f*h+d*e*l-d*g*h},getInverse:function(a,
	b){var c=a.elements,d=this.elements;d[0]=c[10]*c[5]-c[6]*c[9];d[1]=-c[10]*c[1]+c[2]*c[9];d[2]=c[6]*c[1]-c[2]*c[5];d[3]=-c[10]*c[4]+c[6]*c[8];d[4]=c[10]*c[0]-c[2]*c[8];d[5]=-c[6]*c[0]+c[2]*c[4];d[6]=c[9]*c[4]-c[5]*c[8];d[7]=-c[9]*c[0]+c[1]*c[8];d[8]=c[5]*c[0]-c[1]*c[4];c=c[0]*d[0]+c[1]*d[3]+c[2]*d[6];if(0===c){if(b)throw Error("Matrix3.getInverse(): can't invert matrix, determinant is 0");console.warn("Matrix3.getInverse(): can't invert matrix, determinant is 0");this.identity();return this}this.multiplyScalar(1/
	c);return this},transpose:function(){var a,b=this.elements;a=b[1];b[1]=b[3];b[3]=a;a=b[2];b[2]=b[6];b[6]=a;a=b[5];b[5]=b[7];b[7]=a;return this},flattenToArrayOffset:function(a,b){var c=this.elements;a[b]=c[0];a[b+1]=c[1];a[b+2]=c[2];a[b+3]=c[3];a[b+4]=c[4];a[b+5]=c[5];a[b+6]=c[6];a[b+7]=c[7];a[b+8]=c[8];return a},getNormalMatrix:function(a){this.getInverse(a).transpose();return this},transposeIntoArray:function(a){var b=this.elements;a[0]=b[0];a[1]=b[3];a[2]=b[6];a[3]=b[1];a[4]=b[4];a[5]=b[7];a[6]=
	b[2];a[7]=b[5];a[8]=b[8];return this},fromArray:function(a){this.elements.set(a);return this},toArray:function(){var a=this.elements;return[a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]]}};THREE.Matrix4=function(){this.elements=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);0<arguments.length&&console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")};
	THREE.Matrix4.prototype={constructor:THREE.Matrix4,set:function(a,b,c,d,e,g,f,h,l,k,m,p,n,q,s,t){var v=this.elements;v[0]=a;v[4]=b;v[8]=c;v[12]=d;v[1]=e;v[5]=g;v[9]=f;v[13]=h;v[2]=l;v[6]=k;v[10]=m;v[14]=p;v[3]=n;v[7]=q;v[11]=s;v[15]=t;return this},identity:function(){this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);return this},clone:function(){return(new THREE.Matrix4).fromArray(this.elements)},copy:function(a){this.elements.set(a.elements);return this},extractPosition:function(a){console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().");
	return this.copyPosition(a)},copyPosition:function(a){var b=this.elements;a=a.elements;b[12]=a[12];b[13]=a[13];b[14]=a[14];return this},extractBasis:function(a,b,c){var d=this.elements;a.set(d[0],d[1],d[2]);b.set(d[4],d[5],d[6]);c.set(d[8],d[9],d[10]);return this},makeBasis:function(a,b,c){this.set(a.x,b.x,c.x,0,a.y,b.y,c.y,0,a.z,b.z,c.z,0,0,0,0,1);return this},extractRotation:function(){var a;return function(b){void 0===a&&(a=new THREE.Vector3);var c=this.elements;b=b.elements;var d=1/a.set(b[0],
	b[1],b[2]).length(),e=1/a.set(b[4],b[5],b[6]).length(),g=1/a.set(b[8],b[9],b[10]).length();c[0]=b[0]*d;c[1]=b[1]*d;c[2]=b[2]*d;c[4]=b[4]*e;c[5]=b[5]*e;c[6]=b[6]*e;c[8]=b[8]*g;c[9]=b[9]*g;c[10]=b[10]*g;return this}}(),makeRotationFromEuler:function(a){!1===a instanceof THREE.Euler&&console.error("THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");var b=this.elements,c=a.x,d=a.y,e=a.z,g=Math.cos(c),c=Math.sin(c),f=Math.cos(d),d=Math.sin(d),h=Math.cos(e),
	e=Math.sin(e);if("XYZ"===a.order){a=g*h;var l=g*e,k=c*h,m=c*e;b[0]=f*h;b[4]=-f*e;b[8]=d;b[1]=l+k*d;b[5]=a-m*d;b[9]=-c*f;b[2]=m-a*d;b[6]=k+l*d;b[10]=g*f}else"YXZ"===a.order?(a=f*h,l=f*e,k=d*h,m=d*e,b[0]=a+m*c,b[4]=k*c-l,b[8]=g*d,b[1]=g*e,b[5]=g*h,b[9]=-c,b[2]=l*c-k,b[6]=m+a*c,b[10]=g*f):"ZXY"===a.order?(a=f*h,l=f*e,k=d*h,m=d*e,b[0]=a-m*c,b[4]=-g*e,b[8]=k+l*c,b[1]=l+k*c,b[5]=g*h,b[9]=m-a*c,b[2]=-g*d,b[6]=c,b[10]=g*f):"ZYX"===a.order?(a=g*h,l=g*e,k=c*h,m=c*e,b[0]=f*h,b[4]=k*d-l,b[8]=a*d+m,b[1]=f*e,b[5]=
	m*d+a,b[9]=l*d-k,b[2]=-d,b[6]=c*f,b[10]=g*f):"YZX"===a.order?(a=g*f,l=g*d,k=c*f,m=c*d,b[0]=f*h,b[4]=m-a*e,b[8]=k*e+l,b[1]=e,b[5]=g*h,b[9]=-c*h,b[2]=-d*h,b[6]=l*e+k,b[10]=a-m*e):"XZY"===a.order&&(a=g*f,l=g*d,k=c*f,m=c*d,b[0]=f*h,b[4]=-e,b[8]=d*h,b[1]=a*e+m,b[5]=g*h,b[9]=l*e-k,b[2]=k*e-l,b[6]=c*h,b[10]=m*e+a);b[3]=0;b[7]=0;b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return this},setRotationFromQuaternion:function(a){console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().");
	return this.makeRotationFromQuaternion(a)},makeRotationFromQuaternion:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,g=a.w,f=c+c,h=d+d,l=e+e;a=c*f;var k=c*h,c=c*l,m=d*h,d=d*l,e=e*l,f=g*f,h=g*h,g=g*l;b[0]=1-(m+e);b[4]=k-g;b[8]=c+h;b[1]=k+g;b[5]=1-(a+e);b[9]=d-f;b[2]=c-h;b[6]=d+f;b[10]=1-(a+m);b[3]=0;b[7]=0;b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return this},lookAt:function(){var a,b,c;return function(d,e,g){void 0===a&&(a=new THREE.Vector3);void 0===b&&(b=new THREE.Vector3);void 0===c&&(c=new THREE.Vector3);
	var f=this.elements;c.subVectors(d,e).normalize();0===c.lengthSq()&&(c.z=1);a.crossVectors(g,c).normalize();0===a.lengthSq()&&(c.x+=1E-4,a.crossVectors(g,c).normalize());b.crossVectors(c,a);f[0]=a.x;f[4]=b.x;f[8]=c.x;f[1]=a.y;f[5]=b.y;f[9]=c.y;f[2]=a.z;f[6]=b.z;f[10]=c.z;return this}}(),multiply:function(a,b){return void 0!==b?(console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."),this.multiplyMatrices(a,b)):this.multiplyMatrices(this,a)},
	multiplyMatrices:function(a,b){var c=a.elements,d=b.elements,e=this.elements,g=c[0],f=c[4],h=c[8],l=c[12],k=c[1],m=c[5],p=c[9],n=c[13],q=c[2],s=c[6],t=c[10],v=c[14],u=c[3],w=c[7],D=c[11],c=c[15],x=d[0],B=d[4],y=d[8],z=d[12],A=d[1],J=d[5],F=d[9],C=d[13],N=d[2],L=d[6],Q=d[10],M=d[14],K=d[3],E=d[7],O=d[11],d=d[15];e[0]=g*x+f*A+h*N+l*K;e[4]=g*B+f*J+h*L+l*E;e[8]=g*y+f*F+h*Q+l*O;e[12]=g*z+f*C+h*M+l*d;e[1]=k*x+m*A+p*N+n*K;e[5]=k*B+m*J+p*L+n*E;e[9]=k*y+m*F+p*Q+n*O;e[13]=k*z+m*C+p*M+n*d;e[2]=q*x+s*A+t*N+v*
	K;e[6]=q*B+s*J+t*L+v*E;e[10]=q*y+s*F+t*Q+v*O;e[14]=q*z+s*C+t*M+v*d;e[3]=u*x+w*A+D*N+c*K;e[7]=u*B+w*J+D*L+c*E;e[11]=u*y+w*F+D*Q+c*O;e[15]=u*z+w*C+D*M+c*d;return this},multiplyToArray:function(a,b,c){var d=this.elements;this.multiplyMatrices(a,b);c[0]=d[0];c[1]=d[1];c[2]=d[2];c[3]=d[3];c[4]=d[4];c[5]=d[5];c[6]=d[6];c[7]=d[7];c[8]=d[8];c[9]=d[9];c[10]=d[10];c[11]=d[11];c[12]=d[12];c[13]=d[13];c[14]=d[14];c[15]=d[15];return this},multiplyScalar:function(a){var b=this.elements;b[0]*=a;b[4]*=a;b[8]*=a;
	b[12]*=a;b[1]*=a;b[5]*=a;b[9]*=a;b[13]*=a;b[2]*=a;b[6]*=a;b[10]*=a;b[14]*=a;b[3]*=a;b[7]*=a;b[11]*=a;b[15]*=a;return this},multiplyVector3:function(a){console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead.");return a.applyProjection(this)},multiplyVector4:function(a){console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.");return a.applyMatrix4(this)},multiplyVector3Array:function(a){console.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.");
	return this.applyToVector3Array(a)},applyToVector3Array:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Vector3);void 0===c&&(c=0);void 0===d&&(d=b.length);for(var e=0;e<d;e+=3,c+=3)a.fromArray(b,c),a.applyMatrix4(this),a.toArray(b,c);return b}}(),applyToBuffer:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Vector3);void 0===c&&(c=0);void 0===d&&(d=b.length/b.itemSize);for(var e=0;e<d;e++,c++)a.x=b.getX(c),a.y=b.getY(c),a.z=b.getZ(c),a.applyMatrix4(this),b.setXYZ(a.x,
	a.y,a.z);return b}}(),rotateAxis:function(a){console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.");a.transformDirection(this)},crossVector:function(a){console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.");return a.applyMatrix4(this)},determinant:function(){var a=this.elements,b=a[0],c=a[4],d=a[8],e=a[12],g=a[1],f=a[5],h=a[9],l=a[13],k=a[2],m=a[6],p=a[10],n=a[14];return a[3]*(+e*h*m-d*l*
	m-e*f*p+c*l*p+d*f*n-c*h*n)+a[7]*(+b*h*n-b*l*p+e*g*p-d*g*n+d*l*k-e*h*k)+a[11]*(+b*l*m-b*f*n-e*g*m+c*g*n+e*f*k-c*l*k)+a[15]*(-d*f*k-b*h*m+b*f*p+d*g*m-c*g*p+c*h*k)},transpose:function(){var a=this.elements,b;b=a[1];a[1]=a[4];a[4]=b;b=a[2];a[2]=a[8];a[8]=b;b=a[6];a[6]=a[9];a[9]=b;b=a[3];a[3]=a[12];a[12]=b;b=a[7];a[7]=a[13];a[13]=b;b=a[11];a[11]=a[14];a[14]=b;return this},flattenToArrayOffset:function(a,b){var c=this.elements;a[b]=c[0];a[b+1]=c[1];a[b+2]=c[2];a[b+3]=c[3];a[b+4]=c[4];a[b+5]=c[5];a[b+6]=
	c[6];a[b+7]=c[7];a[b+8]=c[8];a[b+9]=c[9];a[b+10]=c[10];a[b+11]=c[11];a[b+12]=c[12];a[b+13]=c[13];a[b+14]=c[14];a[b+15]=c[15];return a},getPosition:function(){var a;return function(){void 0===a&&(a=new THREE.Vector3);console.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.");var b=this.elements;return a.set(b[12],b[13],b[14])}}(),setPosition:function(a){var b=this.elements;b[12]=a.x;b[13]=a.y;b[14]=a.z;return this},getInverse:function(a,b){var c=
	this.elements,d=a.elements,e=d[0],g=d[4],f=d[8],h=d[12],l=d[1],k=d[5],m=d[9],p=d[13],n=d[2],q=d[6],s=d[10],t=d[14],v=d[3],u=d[7],w=d[11],d=d[15];c[0]=m*t*u-p*s*u+p*q*w-k*t*w-m*q*d+k*s*d;c[4]=h*s*u-f*t*u-h*q*w+g*t*w+f*q*d-g*s*d;c[8]=f*p*u-h*m*u+h*k*w-g*p*w-f*k*d+g*m*d;c[12]=h*m*q-f*p*q-h*k*s+g*p*s+f*k*t-g*m*t;c[1]=p*s*v-m*t*v-p*n*w+l*t*w+m*n*d-l*s*d;c[5]=f*t*v-h*s*v+h*n*w-e*t*w-f*n*d+e*s*d;c[9]=h*m*v-f*p*v-h*l*w+e*p*w+f*l*d-e*m*d;c[13]=f*p*n-h*m*n+h*l*s-e*p*s-f*l*t+e*m*t;c[2]=k*t*v-p*q*v+p*n*u-l*t*
	u-k*n*d+l*q*d;c[6]=h*q*v-g*t*v-h*n*u+e*t*u+g*n*d-e*q*d;c[10]=g*p*v-h*k*v+h*l*u-e*p*u-g*l*d+e*k*d;c[14]=h*k*n-g*p*n-h*l*q+e*p*q+g*l*t-e*k*t;c[3]=m*q*v-k*s*v-m*n*u+l*s*u+k*n*w-l*q*w;c[7]=g*s*v-f*q*v+f*n*u-e*s*u-g*n*w+e*q*w;c[11]=f*k*v-g*m*v-f*l*u+e*m*u+g*l*w-e*k*w;c[15]=g*m*n-f*k*n+f*l*q-e*m*q-g*l*s+e*k*s;c=e*c[0]+l*c[4]+n*c[8]+v*c[12];if(0===c){if(b)throw Error("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0");console.warn("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0");
	this.identity();return this}this.multiplyScalar(1/c);return this},translate:function(a){console.error("THREE.Matrix4: .translate() has been removed.")},rotateX:function(a){console.error("THREE.Matrix4: .rotateX() has been removed.")},rotateY:function(a){console.error("THREE.Matrix4: .rotateY() has been removed.")},rotateZ:function(a){console.error("THREE.Matrix4: .rotateZ() has been removed.")},rotateByAxis:function(a,b){console.error("THREE.Matrix4: .rotateByAxis() has been removed.")},scale:function(a){var b=
	this.elements,c=a.x,d=a.y;a=a.z;b[0]*=c;b[4]*=d;b[8]*=a;b[1]*=c;b[5]*=d;b[9]*=a;b[2]*=c;b[6]*=d;b[10]*=a;b[3]*=c;b[7]*=d;b[11]*=a;return this},getMaxScaleOnAxis:function(){var a=this.elements;return Math.sqrt(Math.max(a[0]*a[0]+a[1]*a[1]+a[2]*a[2],a[4]*a[4]+a[5]*a[5]+a[6]*a[6],a[8]*a[8]+a[9]*a[9]+a[10]*a[10]))},makeTranslation:function(a,b,c){this.set(1,0,0,a,0,1,0,b,0,0,1,c,0,0,0,1);return this},makeRotationX:function(a){var b=Math.cos(a);a=Math.sin(a);this.set(1,0,0,0,0,b,-a,0,0,a,b,0,0,0,0,1);
	return this},makeRotationY:function(a){var b=Math.cos(a);a=Math.sin(a);this.set(b,0,a,0,0,1,0,0,-a,0,b,0,0,0,0,1);return this},makeRotationZ:function(a){var b=Math.cos(a);a=Math.sin(a);this.set(b,-a,0,0,a,b,0,0,0,0,1,0,0,0,0,1);return this},makeRotationAxis:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=1-c,g=a.x,f=a.y,h=a.z,l=e*g,k=e*f;this.set(l*g+c,l*f-d*h,l*h+d*f,0,l*f+d*h,k*f+c,k*h-d*g,0,l*h-d*f,k*h+d*g,e*h*h+c,0,0,0,0,1);return this},makeScale:function(a,b,c){this.set(a,0,0,0,0,b,0,0,0,0,c,
	0,0,0,0,1);return this},compose:function(a,b,c){this.makeRotationFromQuaternion(b);this.scale(c);this.setPosition(a);return this},decompose:function(){var a,b;return function(c,d,e){void 0===a&&(a=new THREE.Vector3);void 0===b&&(b=new THREE.Matrix4);var g=this.elements,f=a.set(g[0],g[1],g[2]).length(),h=a.set(g[4],g[5],g[6]).length(),l=a.set(g[8],g[9],g[10]).length();0>this.determinant()&&(f=-f);c.x=g[12];c.y=g[13];c.z=g[14];b.elements.set(this.elements);c=1/f;var g=1/h,k=1/l;b.elements[0]*=c;b.elements[1]*=
	c;b.elements[2]*=c;b.elements[4]*=g;b.elements[5]*=g;b.elements[6]*=g;b.elements[8]*=k;b.elements[9]*=k;b.elements[10]*=k;d.setFromRotationMatrix(b);e.x=f;e.y=h;e.z=l;return this}}(),makeFrustum:function(a,b,c,d,e,g){var f=this.elements;f[0]=2*e/(b-a);f[4]=0;f[8]=(b+a)/(b-a);f[12]=0;f[1]=0;f[5]=2*e/(d-c);f[9]=(d+c)/(d-c);f[13]=0;f[2]=0;f[6]=0;f[10]=-(g+e)/(g-e);f[14]=-2*g*e/(g-e);f[3]=0;f[7]=0;f[11]=-1;f[15]=0;return this},makePerspective:function(a,b,c,d){a=c*Math.tan(THREE.Math.degToRad(.5*a));
	var e=-a;return this.makeFrustum(e*b,a*b,e,a,c,d)},makeOrthographic:function(a,b,c,d,e,g){var f=this.elements,h=b-a,l=c-d,k=g-e;f[0]=2/h;f[4]=0;f[8]=0;f[12]=-((b+a)/h);f[1]=0;f[5]=2/l;f[9]=0;f[13]=-((c+d)/l);f[2]=0;f[6]=0;f[10]=-2/k;f[14]=-((g+e)/k);f[3]=0;f[7]=0;f[11]=0;f[15]=1;return this},equals:function(a){var b=this.elements;a=a.elements;for(var c=0;16>c;c++)if(b[c]!==a[c])return!1;return!0},fromArray:function(a){this.elements.set(a);return this},toArray:function(){var a=this.elements;return[a[0],
	a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],a[13],a[14],a[15]]}};THREE.Ray=function(a,b){this.origin=void 0!==a?a:new THREE.Vector3;this.direction=void 0!==b?b:new THREE.Vector3};
	THREE.Ray.prototype={constructor:THREE.Ray,set:function(a,b){this.origin.copy(a);this.direction.copy(b);return this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.origin.copy(a.origin);this.direction.copy(a.direction);return this},at:function(a,b){return(b||new THREE.Vector3).copy(this.direction).multiplyScalar(a).add(this.origin)},recast:function(){var a=new THREE.Vector3;return function(b){this.origin.copy(this.at(b,a));return this}}(),closestPointToPoint:function(a,
	b){var c=b||new THREE.Vector3;c.subVectors(a,this.origin);var d=c.dot(this.direction);return 0>d?c.copy(this.origin):c.copy(this.direction).multiplyScalar(d).add(this.origin)},distanceToPoint:function(a){return Math.sqrt(this.distanceSqToPoint(a))},distanceSqToPoint:function(){var a=new THREE.Vector3;return function(b){var c=a.subVectors(b,this.origin).dot(this.direction);if(0>c)return this.origin.distanceToSquared(b);a.copy(this.direction).multiplyScalar(c).add(this.origin);return a.distanceToSquared(b)}}(),
	distanceSqToSegment:function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Vector3;return function(d,e,g,f){a.copy(d).add(e).multiplyScalar(.5);b.copy(e).sub(d).normalize();c.copy(this.origin).sub(a);var h=.5*d.distanceTo(e),l=-this.direction.dot(b),k=c.dot(this.direction),m=-c.dot(b),p=c.lengthSq(),n=Math.abs(1-l*l),q;0<n?(d=l*m-k,e=l*k-m,q=h*n,0<=d?e>=-q?e<=q?(h=1/n,d*=h,e*=h,l=d*(d+l*e+2*k)+e*(l*d+e+2*m)+p):(e=h,d=Math.max(0,-(l*e+k)),l=-d*d+e*(e+2*m)+p):(e=-h,d=Math.max(0,-(l*e+k)),
	l=-d*d+e*(e+2*m)+p):e<=-q?(d=Math.max(0,-(-l*h+k)),e=0<d?-h:Math.min(Math.max(-h,-m),h),l=-d*d+e*(e+2*m)+p):e<=q?(d=0,e=Math.min(Math.max(-h,-m),h),l=e*(e+2*m)+p):(d=Math.max(0,-(l*h+k)),e=0<d?h:Math.min(Math.max(-h,-m),h),l=-d*d+e*(e+2*m)+p)):(e=0<l?-h:h,d=Math.max(0,-(l*e+k)),l=-d*d+e*(e+2*m)+p);g&&g.copy(this.direction).multiplyScalar(d).add(this.origin);f&&f.copy(b).multiplyScalar(e).add(a);return l}}(),isIntersectionSphere:function(a){return this.distanceToPoint(a.center)<=a.radius},intersectSphere:function(){var a=
	new THREE.Vector3;return function(b,c){a.subVectors(b.center,this.origin);var d=a.dot(this.direction),e=a.dot(a)-d*d,g=b.radius*b.radius;if(e>g)return null;g=Math.sqrt(g-e);e=d-g;d+=g;return 0>e&&0>d?null:0>e?this.at(d,c):this.at(e,c)}}(),isIntersectionPlane:function(a){var b=a.distanceToPoint(this.origin);return 0===b||0>a.normal.dot(this.direction)*b?!0:!1},distanceToPlane:function(a){var b=a.normal.dot(this.direction);if(0===b)return 0===a.distanceToPoint(this.origin)?0:null;a=-(this.origin.dot(a.normal)+
	a.constant)/b;return 0<=a?a:null},intersectPlane:function(a,b){var c=this.distanceToPlane(a);return null===c?null:this.at(c,b)},isIntersectionBox:function(){var a=new THREE.Vector3;return function(b){return null!==this.intersectBox(b,a)}}(),intersectBox:function(a,b){var c,d,e,g,f;d=1/this.direction.x;g=1/this.direction.y;f=1/this.direction.z;var h=this.origin;0<=d?(c=(a.min.x-h.x)*d,d*=a.max.x-h.x):(c=(a.max.x-h.x)*d,d*=a.min.x-h.x);0<=g?(e=(a.min.y-h.y)*g,g*=a.max.y-h.y):(e=(a.max.y-h.y)*g,g*=a.min.y-
	h.y);if(c>g||e>d)return null;if(e>c||c!==c)c=e;if(g<d||d!==d)d=g;0<=f?(e=(a.min.z-h.z)*f,f*=a.max.z-h.z):(e=(a.max.z-h.z)*f,f*=a.min.z-h.z);if(c>f||e>d)return null;if(e>c||c!==c)c=e;if(f<d||d!==d)d=f;return 0>d?null:this.at(0<=c?c:d,b)},intersectTriangle:function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Vector3,d=new THREE.Vector3;return function(e,g,f,h,l){b.subVectors(g,e);c.subVectors(f,e);d.crossVectors(b,c);g=this.direction.dot(d);if(0<g){if(h)return null;h=1}else if(0>g)h=-1,
	g=-g;else return null;a.subVectors(this.origin,e);e=h*this.direction.dot(c.crossVectors(a,c));if(0>e)return null;f=h*this.direction.dot(b.cross(a));if(0>f||e+f>g)return null;e=-h*a.dot(d);return 0>e?null:this.at(e/g,l)}}(),applyMatrix4:function(a){this.direction.add(this.origin).applyMatrix4(a);this.origin.applyMatrix4(a);this.direction.sub(this.origin);this.direction.normalize();return this},equals:function(a){return a.origin.equals(this.origin)&&a.direction.equals(this.direction)}};
	THREE.Sphere=function(a,b){this.center=void 0!==a?a:new THREE.Vector3;this.radius=void 0!==b?b:0};
	THREE.Sphere.prototype={constructor:THREE.Sphere,set:function(a,b){this.center.copy(a);this.radius=b;return this},setFromPoints:function(){var a=new THREE.Box3;return function(b,c){var d=this.center;void 0!==c?d.copy(c):a.setFromPoints(b).center(d);for(var e=0,g=0,f=b.length;g<f;g++)e=Math.max(e,d.distanceToSquared(b[g]));this.radius=Math.sqrt(e);return this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.center.copy(a.center);this.radius=a.radius;return this},
	empty:function(){return 0>=this.radius},containsPoint:function(a){return a.distanceToSquared(this.center)<=this.radius*this.radius},distanceToPoint:function(a){return a.distanceTo(this.center)-this.radius},intersectsSphere:function(a){var b=this.radius+a.radius;return a.center.distanceToSquared(this.center)<=b*b},clampPoint:function(a,b){var c=this.center.distanceToSquared(a),d=b||new THREE.Vector3;d.copy(a);c>this.radius*this.radius&&(d.sub(this.center).normalize(),d.multiplyScalar(this.radius).add(this.center));
	return d},getBoundingBox:function(a){a=a||new THREE.Box3;a.set(this.center,this.center);a.expandByScalar(this.radius);return a},applyMatrix4:function(a){this.center.applyMatrix4(a);this.radius*=a.getMaxScaleOnAxis();return this},translate:function(a){this.center.add(a);return this},equals:function(a){return a.center.equals(this.center)&&a.radius===this.radius}};
	THREE.Frustum=function(a,b,c,d,e,g){this.planes=[void 0!==a?a:new THREE.Plane,void 0!==b?b:new THREE.Plane,void 0!==c?c:new THREE.Plane,void 0!==d?d:new THREE.Plane,void 0!==e?e:new THREE.Plane,void 0!==g?g:new THREE.Plane]};
	THREE.Frustum.prototype={constructor:THREE.Frustum,set:function(a,b,c,d,e,g){var f=this.planes;f[0].copy(a);f[1].copy(b);f[2].copy(c);f[3].copy(d);f[4].copy(e);f[5].copy(g);return this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){for(var b=this.planes,c=0;6>c;c++)b[c].copy(a.planes[c]);return this},setFromMatrix:function(a){var b=this.planes,c=a.elements;a=c[0];var d=c[1],e=c[2],g=c[3],f=c[4],h=c[5],l=c[6],k=c[7],m=c[8],p=c[9],n=c[10],q=c[11],s=c[12],t=c[13],v=c[14],
	c=c[15];b[0].setComponents(g-a,k-f,q-m,c-s).normalize();b[1].setComponents(g+a,k+f,q+m,c+s).normalize();b[2].setComponents(g+d,k+h,q+p,c+t).normalize();b[3].setComponents(g-d,k-h,q-p,c-t).normalize();b[4].setComponents(g-e,k-l,q-n,c-v).normalize();b[5].setComponents(g+e,k+l,q+n,c+v).normalize();return this},intersectsObject:function(){var a=new THREE.Sphere;return function(b){var c=b.geometry;null===c.boundingSphere&&c.computeBoundingSphere();a.copy(c.boundingSphere);a.applyMatrix4(b.matrixWorld);
	return this.intersectsSphere(a)}}(),intersectsSphere:function(a){var b=this.planes,c=a.center;a=-a.radius;for(var d=0;6>d;d++)if(b[d].distanceToPoint(c)<a)return!1;return!0},intersectsBox:function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(c){for(var d=this.planes,e=0;6>e;e++){var g=d[e];a.x=0<g.normal.x?c.min.x:c.max.x;b.x=0<g.normal.x?c.max.x:c.min.x;a.y=0<g.normal.y?c.min.y:c.max.y;b.y=0<g.normal.y?c.max.y:c.min.y;a.z=0<g.normal.z?c.min.z:c.max.z;b.z=0<g.normal.z?c.max.z:c.min.z;
	var f=g.distanceToPoint(a),g=g.distanceToPoint(b);if(0>f&&0>g)return!1}return!0}}(),containsPoint:function(a){for(var b=this.planes,c=0;6>c;c++)if(0>b[c].distanceToPoint(a))return!1;return!0}};THREE.Plane=function(a,b){this.normal=void 0!==a?a:new THREE.Vector3(1,0,0);this.constant=void 0!==b?b:0};
	THREE.Plane.prototype={constructor:THREE.Plane,set:function(a,b){this.normal.copy(a);this.constant=b;return this},setComponents:function(a,b,c,d){this.normal.set(a,b,c);this.constant=d;return this},setFromNormalAndCoplanarPoint:function(a,b){this.normal.copy(a);this.constant=-b.dot(this.normal);return this},setFromCoplanarPoints:function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(c,d,e){d=a.subVectors(e,d).cross(b.subVectors(c,d)).normalize();this.setFromNormalAndCoplanarPoint(d,
	c);return this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.normal.copy(a.normal);this.constant=a.constant;return this},normalize:function(){var a=1/this.normal.length();this.normal.multiplyScalar(a);this.constant*=a;return this},negate:function(){this.constant*=-1;this.normal.negate();return this},distanceToPoint:function(a){return this.normal.dot(a)+this.constant},distanceToSphere:function(a){return this.distanceToPoint(a.center)-a.radius},projectPoint:function(a,
	b){return this.orthoPoint(a,b).sub(a).negate()},orthoPoint:function(a,b){var c=this.distanceToPoint(a);return(b||new THREE.Vector3).copy(this.normal).multiplyScalar(c)},isIntersectionLine:function(a){var b=this.distanceToPoint(a.start);a=this.distanceToPoint(a.end);return 0>b&&0<a||0>a&&0<b},intersectLine:function(){var a=new THREE.Vector3;return function(b,c){var d=c||new THREE.Vector3,e=b.delta(a),g=this.normal.dot(e);if(0===g){if(0===this.distanceToPoint(b.start))return d.copy(b.start)}else return g=
	-(b.start.dot(this.normal)+this.constant)/g,0>g||1<g?void 0:d.copy(e).multiplyScalar(g).add(b.start)}}(),coplanarPoint:function(a){return(a||new THREE.Vector3).copy(this.normal).multiplyScalar(-this.constant)},applyMatrix4:function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Matrix3;return function(d,e){var g=e||c.getNormalMatrix(d),g=a.copy(this.normal).applyMatrix3(g),f=this.coplanarPoint(b);f.applyMatrix4(d);this.setFromNormalAndCoplanarPoint(g,f);return this}}(),translate:function(a){this.constant-=
	a.dot(this.normal);return this},equals:function(a){return a.normal.equals(this.normal)&&a.constant===this.constant}};
	THREE.Math={generateUUID:function(){var a="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),b=Array(36),c=0,d;return function(){for(var e=0;36>e;e++)8===e||13===e||18===e||23===e?b[e]="-":14===e?b[e]="4":(2>=c&&(c=33554432+16777216*Math.random()|0),d=c&15,c>>=4,b[e]=a[19===e?d&3|8:d]);return b.join("")}}(),clamp:function(a,b,c){return Math.max(b,Math.min(c,a))},euclideanModulo:function(a,b){return(a%b+b)%b},mapLinear:function(a,b,c,d,e){return d+(a-b)*(e-d)/(c-b)},smoothstep:function(a,
	b,c){if(a<=b)return 0;if(a>=c)return 1;a=(a-b)/(c-b);return a*a*(3-2*a)},smootherstep:function(a,b,c){if(a<=b)return 0;if(a>=c)return 1;a=(a-b)/(c-b);return a*a*a*(a*(6*a-15)+10)},random16:function(){return(65280*Math.random()+255*Math.random())/65535},randInt:function(a,b){return a+Math.floor(Math.random()*(b-a+1))},randFloat:function(a,b){return a+Math.random()*(b-a)},randFloatSpread:function(a){return a*(.5-Math.random())},degToRad:function(){var a=Math.PI/180;return function(b){return b*a}}(),
	radToDeg:function(){var a=180/Math.PI;return function(b){return b*a}}(),isPowerOfTwo:function(a){return 0===(a&a-1)&&0!==a},nearestPowerOfTwo:function(a){return Math.pow(2,Math.round(Math.log(a)/Math.LN2))},nextPowerOfTwo:function(a){a--;a|=a>>1;a|=a>>2;a|=a>>4;a|=a>>8;a|=a>>16;a++;return a}};
	THREE.Spline=function(a){function b(a,b,c,d,e,g,f){a=.5*(c-a);d=.5*(d-b);return(2*(b-c)+a+d)*f+(-3*(b-c)-2*a-d)*g+a*e+b}this.points=a;var c=[],d={x:0,y:0,z:0},e,g,f,h,l,k,m,p,n;this.initFromArray=function(a){this.points=[];for(var b=0;b<a.length;b++)this.points[b]={x:a[b][0],y:a[b][1],z:a[b][2]}};this.getPoint=function(a){e=(this.points.length-1)*a;g=Math.floor(e);f=e-g;c[0]=0===g?g:g-1;c[1]=g;c[2]=g>this.points.length-2?this.points.length-1:g+1;c[3]=g>this.points.length-3?this.points.length-1:g+
	2;k=this.points[c[0]];m=this.points[c[1]];p=this.points[c[2]];n=this.points[c[3]];h=f*f;l=f*h;d.x=b(k.x,m.x,p.x,n.x,f,h,l);d.y=b(k.y,m.y,p.y,n.y,f,h,l);d.z=b(k.z,m.z,p.z,n.z,f,h,l);return d};this.getControlPointsArray=function(){var a,b,c=this.points.length,d=[];for(a=0;a<c;a++)b=this.points[a],d[a]=[b.x,b.y,b.z];return d};this.getLength=function(a){var b,c,d,e=b=b=0,g=new THREE.Vector3,f=new THREE.Vector3,h=[],l=0;h[0]=0;a||(a=100);c=this.points.length*a;g.copy(this.points[0]);for(a=1;a<c;a++)b=
	a/c,d=this.getPoint(b),f.copy(d),l+=f.distanceTo(g),g.copy(d),b*=this.points.length-1,b=Math.floor(b),b!==e&&(h[b]=l,e=b);h[h.length]=l;return{chunks:h,total:l}};this.reparametrizeByArcLength=function(a){var b,c,d,e,g,f,h=[],l=new THREE.Vector3,k=this.getLength();h.push(l.copy(this.points[0]).clone());for(b=1;b<this.points.length;b++){c=k.chunks[b]-k.chunks[b-1];f=Math.ceil(a*c/k.total);e=(b-1)/(this.points.length-1);g=b/(this.points.length-1);for(c=1;c<f-1;c++)d=e+1/f*c*(g-e),d=this.getPoint(d),
	h.push(l.copy(d).clone());h.push(l.copy(this.points[b]).clone())}this.points=h}};THREE.Triangle=function(a,b,c){this.a=void 0!==a?a:new THREE.Vector3;this.b=void 0!==b?b:new THREE.Vector3;this.c=void 0!==c?c:new THREE.Vector3};THREE.Triangle.normal=function(){var a=new THREE.Vector3;return function(b,c,d,e){e=e||new THREE.Vector3;e.subVectors(d,c);a.subVectors(b,c);e.cross(a);b=e.lengthSq();return 0<b?e.multiplyScalar(1/Math.sqrt(b)):e.set(0,0,0)}}();
	THREE.Triangle.barycoordFromPoint=function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Vector3;return function(d,e,g,f,h){a.subVectors(f,e);b.subVectors(g,e);c.subVectors(d,e);d=a.dot(a);e=a.dot(b);g=a.dot(c);var l=b.dot(b);f=b.dot(c);var k=d*l-e*e;h=h||new THREE.Vector3;if(0===k)return h.set(-2,-1,-1);k=1/k;l=(l*g-e*f)*k;d=(d*f-e*g)*k;return h.set(1-l-d,d,l)}}();
	THREE.Triangle.containsPoint=function(){var a=new THREE.Vector3;return function(b,c,d,e){b=THREE.Triangle.barycoordFromPoint(b,c,d,e,a);return 0<=b.x&&0<=b.y&&1>=b.x+b.y}}();
	THREE.Triangle.prototype={constructor:THREE.Triangle,set:function(a,b,c){this.a.copy(a);this.b.copy(b);this.c.copy(c);return this},setFromPointsAndIndices:function(a,b,c,d){this.a.copy(a[b]);this.b.copy(a[c]);this.c.copy(a[d]);return this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.a.copy(a.a);this.b.copy(a.b);this.c.copy(a.c);return this},area:function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(){a.subVectors(this.c,this.b);b.subVectors(this.a,
	this.b);return.5*a.cross(b).length()}}(),midpoint:function(a){return(a||new THREE.Vector3).addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)},normal:function(a){return THREE.Triangle.normal(this.a,this.b,this.c,a)},plane:function(a){return(a||new THREE.Plane).setFromCoplanarPoints(this.a,this.b,this.c)},barycoordFromPoint:function(a,b){return THREE.Triangle.barycoordFromPoint(a,this.a,this.b,this.c,b)},containsPoint:function(a){return THREE.Triangle.containsPoint(a,this.a,this.b,this.c)},
	equals:function(a){return a.a.equals(this.a)&&a.b.equals(this.b)&&a.c.equals(this.c)}};THREE.Channels=function(){this.mask=1};THREE.Channels.prototype={constructor:THREE.Channels,set:function(a){this.mask=1<<a},enable:function(a){this.mask|=1<<a},toggle:function(a){this.mask^=1<<a},disable:function(a){this.mask&=~(1<<a)}};THREE.Clock=function(a){this.autoStart=void 0!==a?a:!0;this.elapsedTime=this.oldTime=this.startTime=0;this.running=!1};
	THREE.Clock.prototype={constructor:THREE.Clock,start:function(){this.oldTime=this.startTime=self.performance.now();this.running=!0},stop:function(){this.getElapsedTime();this.running=!1},getElapsedTime:function(){this.getDelta();return this.elapsedTime},getDelta:function(){var a=0;this.autoStart&&!this.running&&this.start();if(this.running){var b=self.performance.now(),a=.001*(b-this.oldTime);this.oldTime=b;this.elapsedTime+=a}return a}};THREE.EventDispatcher=function(){};
	THREE.EventDispatcher.prototype={constructor:THREE.EventDispatcher,apply:function(a){a.addEventListener=THREE.EventDispatcher.prototype.addEventListener;a.hasEventListener=THREE.EventDispatcher.prototype.hasEventListener;a.removeEventListener=THREE.EventDispatcher.prototype.removeEventListener;a.dispatchEvent=THREE.EventDispatcher.prototype.dispatchEvent},addEventListener:function(a,b){void 0===this._listeners&&(this._listeners={});var c=this._listeners;void 0===c[a]&&(c[a]=[]);-1===c[a].indexOf(b)&&
	c[a].push(b)},hasEventListener:function(a,b){if(void 0===this._listeners)return!1;var c=this._listeners;return void 0!==c[a]&&-1!==c[a].indexOf(b)?!0:!1},removeEventListener:function(a,b){if(void 0!==this._listeners){var c=this._listeners[a];if(void 0!==c){var d=c.indexOf(b);-1!==d&&c.splice(d,1)}}},dispatchEvent:function(a){if(void 0!==this._listeners){var b=this._listeners[a.type];if(void 0!==b){a.target=this;for(var c=[],d=b.length,e=0;e<d;e++)c[e]=b[e];for(e=0;e<d;e++)c[e].call(this,a)}}}};
	(function(a){function b(a,b){return a.distance-b.distance}function c(a,b,g,f){if(!1!==a.visible&&(a.raycast(b,g),!0===f)){a=a.children;f=0;for(var h=a.length;f<h;f++)c(a[f],b,g,!0)}}a.Raycaster=function(b,c,g,f){this.ray=new a.Ray(b,c);this.near=g||0;this.far=f||Infinity;this.params={Mesh:{},Line:{},LOD:{},Points:{threshold:1},Sprite:{}};Object.defineProperties(this.params,{PointCloud:{get:function(){console.warn("THREE.Raycaster: params.PointCloud has been renamed to params.Points.");return this.Points}}})};
	a.Raycaster.prototype={constructor:a.Raycaster,linePrecision:1,set:function(a,b){this.ray.set(a,b)},setFromCamera:function(b,c){c instanceof a.PerspectiveCamera?(this.ray.origin.setFromMatrixPosition(c.matrixWorld),this.ray.direction.set(b.x,b.y,.5).unproject(c).sub(this.ray.origin).normalize()):c instanceof a.OrthographicCamera?(this.ray.origin.set(b.x,b.y,-1).unproject(c),this.ray.direction.set(0,0,-1).transformDirection(c.matrixWorld)):console.error("THREE.Raycaster: Unsupported camera type.")},
	intersectObject:function(a,e){var g=[];c(a,this,g,e);g.sort(b);return g},intersectObjects:function(a,e){var g=[];if(!1===Array.isArray(a))return console.warn("THREE.Raycaster.intersectObjects: objects is not an Array."),g;for(var f=0,h=a.length;f<h;f++)c(a[f],this,g,e);g.sort(b);return g}}})(THREE);
	THREE.Object3D=function(){Object.defineProperty(this,"id",{value:THREE.Object3DIdCount++});this.uuid=THREE.Math.generateUUID();this.name="";this.type="Object3D";this.parent=null;this.channels=new THREE.Channels;this.children=[];this.up=THREE.Object3D.DefaultUp.clone();var a=new THREE.Vector3,b=new THREE.Euler,c=new THREE.Quaternion,d=new THREE.Vector3(1,1,1);b.onChange(function(){c.setFromEuler(b,!1)});c.onChange(function(){b.setFromQuaternion(c,void 0,!1)});Object.defineProperties(this,{position:{enumerable:!0,
	value:a},rotation:{enumerable:!0,value:b},quaternion:{enumerable:!0,value:c},scale:{enumerable:!0,value:d},modelViewMatrix:{value:new THREE.Matrix4},normalMatrix:{value:new THREE.Matrix3}});this.rotationAutoUpdate=!0;this.matrix=new THREE.Matrix4;this.matrixWorld=new THREE.Matrix4;this.matrixAutoUpdate=THREE.Object3D.DefaultMatrixAutoUpdate;this.matrixWorldNeedsUpdate=!1;this.visible=!0;this.receiveShadow=this.castShadow=!1;this.frustumCulled=!0;this.renderOrder=0;this.userData={}};
	THREE.Object3D.DefaultUp=new THREE.Vector3(0,1,0);THREE.Object3D.DefaultMatrixAutoUpdate=!0;
	THREE.Object3D.prototype={constructor:THREE.Object3D,get eulerOrder(){console.warn("THREE.Object3D: .eulerOrder is now .rotation.order.");return this.rotation.order},set eulerOrder(a){console.warn("THREE.Object3D: .eulerOrder is now .rotation.order.");this.rotation.order=a},get useQuaternion(){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")},set useQuaternion(a){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")},set renderDepth(a){console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.")},
	applyMatrix:function(a){this.matrix.multiplyMatrices(a,this.matrix);this.matrix.decompose(this.position,this.quaternion,this.scale)},setRotationFromAxisAngle:function(a,b){this.quaternion.setFromAxisAngle(a,b)},setRotationFromEuler:function(a){this.quaternion.setFromEuler(a,!0)},setRotationFromMatrix:function(a){this.quaternion.setFromRotationMatrix(a)},setRotationFromQuaternion:function(a){this.quaternion.copy(a)},rotateOnAxis:function(){var a=new THREE.Quaternion;return function(b,c){a.setFromAxisAngle(b,
	c);this.quaternion.multiply(a);return this}}(),rotateX:function(){var a=new THREE.Vector3(1,0,0);return function(b){return this.rotateOnAxis(a,b)}}(),rotateY:function(){var a=new THREE.Vector3(0,1,0);return function(b){return this.rotateOnAxis(a,b)}}(),rotateZ:function(){var a=new THREE.Vector3(0,0,1);return function(b){return this.rotateOnAxis(a,b)}}(),translateOnAxis:function(){var a=new THREE.Vector3;return function(b,c){a.copy(b).applyQuaternion(this.quaternion);this.position.add(a.multiplyScalar(c));
	return this}}(),translate:function(a,b){console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.");return this.translateOnAxis(b,a)},translateX:function(){var a=new THREE.Vector3(1,0,0);return function(b){return this.translateOnAxis(a,b)}}(),translateY:function(){var a=new THREE.Vector3(0,1,0);return function(b){return this.translateOnAxis(a,b)}}(),translateZ:function(){var a=new THREE.Vector3(0,0,1);return function(b){return this.translateOnAxis(a,
	b)}}(),localToWorld:function(a){return a.applyMatrix4(this.matrixWorld)},worldToLocal:function(){var a=new THREE.Matrix4;return function(b){return b.applyMatrix4(a.getInverse(this.matrixWorld))}}(),lookAt:function(){var a=new THREE.Matrix4;return function(b){a.lookAt(b,this.position,this.up);this.quaternion.setFromRotationMatrix(a)}}(),add:function(a){if(1<arguments.length){for(var b=0;b<arguments.length;b++)this.add(arguments[b]);return this}if(a===this)return console.error("THREE.Object3D.add: object can't be added as a child of itself.",
	a),this;a instanceof THREE.Object3D?(null!==a.parent&&a.parent.remove(a),a.parent=this,a.dispatchEvent({type:"added"}),this.children.push(a)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",a);return this},remove:function(a){if(1<arguments.length)for(var b=0;b<arguments.length;b++)this.remove(arguments[b]);b=this.children.indexOf(a);-1!==b&&(a.parent=null,a.dispatchEvent({type:"removed"}),this.children.splice(b,1))},getChildByName:function(a){console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().");
	return this.getObjectByName(a)},getObjectById:function(a){return this.getObjectByProperty("id",a)},getObjectByName:function(a){return this.getObjectByProperty("name",a)},getObjectByProperty:function(a,b){if(this[a]===b)return this;for(var c=0,d=this.children.length;c<d;c++){var e=this.children[c].getObjectByProperty(a,b);if(void 0!==e)return e}},getWorldPosition:function(a){a=a||new THREE.Vector3;this.updateMatrixWorld(!0);return a.setFromMatrixPosition(this.matrixWorld)},getWorldQuaternion:function(){var a=
	new THREE.Vector3,b=new THREE.Vector3;return function(c){c=c||new THREE.Quaternion;this.updateMatrixWorld(!0);this.matrixWorld.decompose(a,c,b);return c}}(),getWorldRotation:function(){var a=new THREE.Quaternion;return function(b){b=b||new THREE.Euler;this.getWorldQuaternion(a);return b.setFromQuaternion(a,this.rotation.order,!1)}}(),getWorldScale:function(){var a=new THREE.Vector3,b=new THREE.Quaternion;return function(c){c=c||new THREE.Vector3;this.updateMatrixWorld(!0);this.matrixWorld.decompose(a,
	b,c);return c}}(),getWorldDirection:function(){var a=new THREE.Quaternion;return function(b){b=b||new THREE.Vector3;this.getWorldQuaternion(a);return b.set(0,0,1).applyQuaternion(a)}}(),raycast:function(){},traverse:function(a){a(this);for(var b=this.children,c=0,d=b.length;c<d;c++)b[c].traverse(a)},traverseVisible:function(a){if(!1!==this.visible){a(this);for(var b=this.children,c=0,d=b.length;c<d;c++)b[c].traverseVisible(a)}},traverseAncestors:function(a){var b=this.parent;null!==b&&(a(b),b.traverseAncestors(a))},
	updateMatrix:function(){this.matrix.compose(this.position,this.quaternion,this.scale);this.matrixWorldNeedsUpdate=!0},updateMatrixWorld:function(a){!0===this.matrixAutoUpdate&&this.updateMatrix();if(!0===this.matrixWorldNeedsUpdate||!0===a)null===this.parent?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,a=!0;for(var b=0,c=this.children.length;b<c;b++)this.children[b].updateMatrixWorld(a)},toJSON:function(a){function b(a){var b=
	[],c;for(c in a){var d=a[c];delete d.metadata;b.push(d)}return b}var c=void 0===a,d={};c&&(a={geometries:{},materials:{},textures:{},images:{}},d.metadata={version:4.4,type:"Object",generator:"Object3D.toJSON"});var e={};e.uuid=this.uuid;e.type=this.type;""!==this.name&&(e.name=this.name);"{}"!==JSON.stringify(this.userData)&&(e.userData=this.userData);!0===this.castShadow&&(e.castShadow=!0);!0===this.receiveShadow&&(e.receiveShadow=!0);!1===this.visible&&(e.visible=!1);e.matrix=this.matrix.toArray();
	void 0!==this.geometry&&(void 0===a.geometries[this.geometry.uuid]&&(a.geometries[this.geometry.uuid]=this.geometry.toJSON(a)),e.geometry=this.geometry.uuid);void 0!==this.material&&(void 0===a.materials[this.material.uuid]&&(a.materials[this.material.uuid]=this.material.toJSON(a)),e.material=this.material.uuid);if(0<this.children.length){e.children=[];for(var g=0;g<this.children.length;g++)e.children.push(this.children[g].toJSON(a).object)}if(c){var c=b(a.geometries),g=b(a.materials),f=b(a.textures);
	a=b(a.images);0<c.length&&(d.geometries=c);0<g.length&&(d.materials=g);0<f.length&&(d.textures=f);0<a.length&&(d.images=a)}d.object=e;return d},clone:function(a){return(new this.constructor).copy(this,a)},copy:function(a,b){void 0===b&&(b=!0);this.name=a.name;this.up.copy(a.up);this.position.copy(a.position);this.quaternion.copy(a.quaternion);this.scale.copy(a.scale);this.rotationAutoUpdate=a.rotationAutoUpdate;this.matrix.copy(a.matrix);this.matrixWorld.copy(a.matrixWorld);this.matrixAutoUpdate=
	a.matrixAutoUpdate;this.matrixWorldNeedsUpdate=a.matrixWorldNeedsUpdate;this.visible=a.visible;this.castShadow=a.castShadow;this.receiveShadow=a.receiveShadow;this.frustumCulled=a.frustumCulled;this.renderOrder=a.renderOrder;this.userData=JSON.parse(JSON.stringify(a.userData));if(!0===b)for(var c=0;c<a.children.length;c++)this.add(a.children[c].clone());return this}};THREE.EventDispatcher.prototype.apply(THREE.Object3D.prototype);THREE.Object3DIdCount=0;
	THREE.Face3=function(a,b,c,d,e,g){this.a=a;this.b=b;this.c=c;this.normal=d instanceof THREE.Vector3?d:new THREE.Vector3;this.vertexNormals=Array.isArray(d)?d:[];this.color=e instanceof THREE.Color?e:new THREE.Color;this.vertexColors=Array.isArray(e)?e:[];this.materialIndex=void 0!==g?g:0};
	THREE.Face3.prototype={constructor:THREE.Face3,clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.a=a.a;this.b=a.b;this.c=a.c;this.normal.copy(a.normal);this.color.copy(a.color);this.materialIndex=a.materialIndex;for(var b=0,c=a.vertexNormals.length;b<c;b++)this.vertexNormals[b]=a.vertexNormals[b].clone();b=0;for(c=a.vertexColors.length;b<c;b++)this.vertexColors[b]=a.vertexColors[b].clone();return this}};
	THREE.Face4=function(a,b,c,d,e,g,f){console.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead.");return new THREE.Face3(a,b,c,e,g,f)};THREE.BufferAttribute=function(a,b){this.uuid=THREE.Math.generateUUID();this.array=a;this.itemSize=b;this.dynamic=!1;this.updateRange={offset:0,count:-1};this.version=0};
	THREE.BufferAttribute.prototype={constructor:THREE.BufferAttribute,get length(){console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count.");return this.array.length},get count(){return this.array.length/this.itemSize},set needsUpdate(a){!0===a&&this.version++},setDynamic:function(a){this.dynamic=a;return this},copy:function(a){this.array=new a.array.constructor(a.array);this.itemSize=a.itemSize;this.dynamic=a.dynamic;return this},copyAt:function(a,b,c){a*=this.itemSize;
	c*=b.itemSize;for(var d=0,e=this.itemSize;d<e;d++)this.array[a+d]=b.array[c+d];return this},copyArray:function(a){this.array.set(a);return this},copyColorsArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];void 0===g&&(console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined",d),g=new THREE.Color);b[c++]=g.r;b[c++]=g.g;b[c++]=g.b}return this},copyIndicesArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];b[c++]=g.a;b[c++]=g.b;b[c++]=
	g.c}return this},copyVector2sArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];void 0===g&&(console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined",d),g=new THREE.Vector2);b[c++]=g.x;b[c++]=g.y}return this},copyVector3sArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];void 0===g&&(console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined",d),g=new THREE.Vector3);b[c++]=g.x;b[c++]=g.y;b[c++]=g.z}return this},
	copyVector4sArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];void 0===g&&(console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined",d),g=new THREE.Vector4);b[c++]=g.x;b[c++]=g.y;b[c++]=g.z;b[c++]=g.w}return this},set:function(a,b){void 0===b&&(b=0);this.array.set(a,b);return this},getX:function(a){return this.array[a*this.itemSize]},setX:function(a,b){this.array[a*this.itemSize]=b;return this},getY:function(a){return this.array[a*this.itemSize+1]},
	setY:function(a,b){this.array[a*this.itemSize+1]=b;return this},getZ:function(a){return this.array[a*this.itemSize+2]},setZ:function(a,b){this.array[a*this.itemSize+2]=b;return this},getW:function(a){return this.array[a*this.itemSize+3]},setW:function(a,b){this.array[a*this.itemSize+3]=b;return this},setXY:function(a,b,c){a*=this.itemSize;this.array[a+0]=b;this.array[a+1]=c;return this},setXYZ:function(a,b,c,d){a*=this.itemSize;this.array[a+0]=b;this.array[a+1]=c;this.array[a+2]=d;return this},setXYZW:function(a,
	b,c,d,e){a*=this.itemSize;this.array[a+0]=b;this.array[a+1]=c;this.array[a+2]=d;this.array[a+3]=e;return this},clone:function(){return(new this.constructor).copy(this)}};THREE.Int8Attribute=function(a,b){return new THREE.BufferAttribute(new Int8Array(a),b)};THREE.Uint8Attribute=function(a,b){return new THREE.BufferAttribute(new Uint8Array(a),b)};THREE.Uint8ClampedAttribute=function(a,b){return new THREE.BufferAttribute(new Uint8ClampedArray(a),b)};
	THREE.Int16Attribute=function(a,b){return new THREE.BufferAttribute(new Int16Array(a),b)};THREE.Uint16Attribute=function(a,b){return new THREE.BufferAttribute(new Uint16Array(a),b)};THREE.Int32Attribute=function(a,b){return new THREE.BufferAttribute(new Int32Array(a),b)};THREE.Uint32Attribute=function(a,b){return new THREE.BufferAttribute(new Uint32Array(a),b)};THREE.Float32Attribute=function(a,b){return new THREE.BufferAttribute(new Float32Array(a),b)};
	THREE.Float64Attribute=function(a,b){return new THREE.BufferAttribute(new Float64Array(a),b)};THREE.DynamicBufferAttribute=function(a,b){console.warn("THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.");return(new THREE.BufferAttribute(a,b)).setDynamic(!0)};THREE.InstancedBufferAttribute=function(a,b,c){THREE.BufferAttribute.call(this,a,b);this.meshPerAttribute=c||1};THREE.InstancedBufferAttribute.prototype=Object.create(THREE.BufferAttribute.prototype);
	THREE.InstancedBufferAttribute.prototype.constructor=THREE.InstancedBufferAttribute;THREE.InstancedBufferAttribute.prototype.copy=function(a){THREE.BufferAttribute.prototype.copy.call(this,a);this.meshPerAttribute=a.meshPerAttribute;return this};THREE.InterleavedBuffer=function(a,b){this.uuid=THREE.Math.generateUUID();this.array=a;this.stride=b;this.dynamic=!1;this.updateRange={offset:0,count:-1};this.version=0};
	THREE.InterleavedBuffer.prototype={constructor:THREE.InterleavedBuffer,get length(){return this.array.length},get count(){return this.array.length/this.stride},set needsUpdate(a){!0===a&&this.version++},setDynamic:function(a){this.dynamic=a;return this},copy:function(a){this.array=new a.array.constructor(a.array);this.stride=a.stride;this.dynamic=a.dynamic},copyAt:function(a,b,c){a*=this.stride;c*=b.stride;for(var d=0,e=this.stride;d<e;d++)this.array[a+d]=b.array[c+d];return this},set:function(a,
	b){void 0===b&&(b=0);this.array.set(a,b);return this},clone:function(){return(new this.constructor).copy(this)}};THREE.InstancedInterleavedBuffer=function(a,b,c){THREE.InterleavedBuffer.call(this,a,b);this.meshPerAttribute=c||1};THREE.InstancedInterleavedBuffer.prototype=Object.create(THREE.InterleavedBuffer.prototype);THREE.InstancedInterleavedBuffer.prototype.constructor=THREE.InstancedInterleavedBuffer;
	THREE.InstancedInterleavedBuffer.prototype.copy=function(a){THREE.InterleavedBuffer.prototype.copy.call(this,a);this.meshPerAttribute=a.meshPerAttribute;return this};THREE.InterleavedBufferAttribute=function(a,b,c){this.uuid=THREE.Math.generateUUID();this.data=a;this.itemSize=b;this.offset=c};
	THREE.InterleavedBufferAttribute.prototype={constructor:THREE.InterleavedBufferAttribute,get length(){console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count.");return this.array.length},get count(){return this.data.array.length/this.data.stride},setX:function(a,b){this.data.array[a*this.data.stride+this.offset]=b;return this},setY:function(a,b){this.data.array[a*this.data.stride+this.offset+1]=b;return this},setZ:function(a,b){this.data.array[a*this.data.stride+this.offset+
	2]=b;return this},setW:function(a,b){this.data.array[a*this.data.stride+this.offset+3]=b;return this},getX:function(a){return this.data.array[a*this.data.stride+this.offset]},getY:function(a){return this.data.array[a*this.data.stride+this.offset+1]},getZ:function(a){return this.data.array[a*this.data.stride+this.offset+2]},getW:function(a){return this.data.array[a*this.data.stride+this.offset+3]},setXY:function(a,b,c){a=a*this.data.stride+this.offset;this.data.array[a+0]=b;this.data.array[a+1]=c;
	return this},setXYZ:function(a,b,c,d){a=a*this.data.stride+this.offset;this.data.array[a+0]=b;this.data.array[a+1]=c;this.data.array[a+2]=d;return this},setXYZW:function(a,b,c,d,e){a=a*this.data.stride+this.offset;this.data.array[a+0]=b;this.data.array[a+1]=c;this.data.array[a+2]=d;this.data.array[a+3]=e;return this}};
	THREE.Geometry=function(){Object.defineProperty(this,"id",{value:THREE.GeometryIdCount++});this.uuid=THREE.Math.generateUUID();this.name="";this.type="Geometry";this.vertices=[];this.colors=[];this.faces=[];this.faceVertexUvs=[[]];this.morphTargets=[];this.morphNormals=[];this.skinWeights=[];this.skinIndices=[];this.lineDistances=[];this.boundingSphere=this.boundingBox=null;this.groupsNeedUpdate=this.lineDistancesNeedUpdate=this.colorsNeedUpdate=this.normalsNeedUpdate=this.uvsNeedUpdate=this.elementsNeedUpdate=
	this.verticesNeedUpdate=!1};
	THREE.Geometry.prototype={constructor:THREE.Geometry,applyMatrix:function(a){for(var b=(new THREE.Matrix3).getNormalMatrix(a),c=0,d=this.vertices.length;c<d;c++)this.vertices[c].applyMatrix4(a);c=0;for(d=this.faces.length;c<d;c++){a=this.faces[c];a.normal.applyMatrix3(b).normalize();for(var e=0,g=a.vertexNormals.length;e<g;e++)a.vertexNormals[e].applyMatrix3(b).normalize()}null!==this.boundingBox&&this.computeBoundingBox();null!==this.boundingSphere&&this.computeBoundingSphere();this.normalsNeedUpdate=
	this.verticesNeedUpdate=!0},rotateX:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationX(b);this.applyMatrix(a);return this}}(),rotateY:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationY(b);this.applyMatrix(a);return this}}(),rotateZ:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationZ(b);this.applyMatrix(a);return this}}(),translate:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Matrix4);
	a.makeTranslation(b,c,d);this.applyMatrix(a);return this}}(),scale:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Matrix4);a.makeScale(b,c,d);this.applyMatrix(a);return this}}(),lookAt:function(){var a;return function(b){void 0===a&&(a=new THREE.Object3D);a.lookAt(b);a.updateMatrix();this.applyMatrix(a.matrix)}}(),fromBufferGeometry:function(a){function b(a,b,d){var e=void 0!==f?[m[a].clone(),m[b].clone(),m[d].clone()]:[],g=void 0!==h?[c.colors[a].clone(),c.colors[b].clone(),c.colors[d].clone()]:
	[],e=new THREE.Face3(a,b,d,e,g);c.faces.push(e);void 0!==l&&c.faceVertexUvs[0].push([p[a].clone(),p[b].clone(),p[d].clone()]);void 0!==k&&c.faceVertexUvs[1].push([n[a].clone(),n[b].clone(),n[d].clone()])}var c=this,d=null!==a.index?a.index.array:void 0,e=a.attributes,g=e.position.array,f=void 0!==e.normal?e.normal.array:void 0,h=void 0!==e.color?e.color.array:void 0,l=void 0!==e.uv?e.uv.array:void 0,k=void 0!==e.uv2?e.uv2.array:void 0;void 0!==k&&(this.faceVertexUvs[1]=[]);for(var m=[],p=[],n=[],
	q=e=0;e<g.length;e+=3,q+=2)c.vertices.push(new THREE.Vector3(g[e],g[e+1],g[e+2])),void 0!==f&&m.push(new THREE.Vector3(f[e],f[e+1],f[e+2])),void 0!==h&&c.colors.push(new THREE.Color(h[e],h[e+1],h[e+2])),void 0!==l&&p.push(new THREE.Vector2(l[q],l[q+1])),void 0!==k&&n.push(new THREE.Vector2(k[q],k[q+1]));if(void 0!==d)if(g=a.groups,0<g.length)for(e=0;e<g.length;e++)for(var q=g[e],s=q.start,t=q.count,q=s,s=s+t;q<s;q+=3)b(d[q],d[q+1],d[q+2]);else for(e=0;e<d.length;e+=3)b(d[e],d[e+1],d[e+2]);else for(e=
	0;e<g.length/3;e+=3)b(e,e+1,e+2);this.computeFaceNormals();null!==a.boundingBox&&(this.boundingBox=a.boundingBox.clone());null!==a.boundingSphere&&(this.boundingSphere=a.boundingSphere.clone());return this},center:function(){this.computeBoundingBox();var a=this.boundingBox.center().negate();this.translate(a.x,a.y,a.z);return a},normalize:function(){this.computeBoundingSphere();var a=this.boundingSphere.center,b=this.boundingSphere.radius,b=0===b?1:1/b,c=new THREE.Matrix4;c.set(b,0,0,-b*a.x,0,b,0,
	-b*a.y,0,0,b,-b*a.z,0,0,0,1);this.applyMatrix(c);return this},computeFaceNormals:function(){for(var a=new THREE.Vector3,b=new THREE.Vector3,c=0,d=this.faces.length;c<d;c++){var e=this.faces[c],g=this.vertices[e.a],f=this.vertices[e.b];a.subVectors(this.vertices[e.c],f);b.subVectors(g,f);a.cross(b);a.normalize();e.normal.copy(a)}},computeVertexNormals:function(a){var b,c,d;d=Array(this.vertices.length);b=0;for(c=this.vertices.length;b<c;b++)d[b]=new THREE.Vector3;if(a){var e,g,f,h=new THREE.Vector3,
	l=new THREE.Vector3;a=0;for(b=this.faces.length;a<b;a++)c=this.faces[a],e=this.vertices[c.a],g=this.vertices[c.b],f=this.vertices[c.c],h.subVectors(f,g),l.subVectors(e,g),h.cross(l),d[c.a].add(h),d[c.b].add(h),d[c.c].add(h)}else for(a=0,b=this.faces.length;a<b;a++)c=this.faces[a],d[c.a].add(c.normal),d[c.b].add(c.normal),d[c.c].add(c.normal);b=0;for(c=this.vertices.length;b<c;b++)d[b].normalize();a=0;for(b=this.faces.length;a<b;a++)c=this.faces[a],e=c.vertexNormals,3===e.length?(e[0].copy(d[c.a]),
	e[1].copy(d[c.b]),e[2].copy(d[c.c])):(e[0]=d[c.a].clone(),e[1]=d[c.b].clone(),e[2]=d[c.c].clone())},computeMorphNormals:function(){var a,b,c,d,e;c=0;for(d=this.faces.length;c<d;c++)for(e=this.faces[c],e.__originalFaceNormal?e.__originalFaceNormal.copy(e.normal):e.__originalFaceNormal=e.normal.clone(),e.__originalVertexNormals||(e.__originalVertexNormals=[]),a=0,b=e.vertexNormals.length;a<b;a++)e.__originalVertexNormals[a]?e.__originalVertexNormals[a].copy(e.vertexNormals[a]):e.__originalVertexNormals[a]=
	e.vertexNormals[a].clone();var g=new THREE.Geometry;g.faces=this.faces;a=0;for(b=this.morphTargets.length;a<b;a++){if(!this.morphNormals[a]){this.morphNormals[a]={};this.morphNormals[a].faceNormals=[];this.morphNormals[a].vertexNormals=[];e=this.morphNormals[a].faceNormals;var f=this.morphNormals[a].vertexNormals,h,l;c=0;for(d=this.faces.length;c<d;c++)h=new THREE.Vector3,l={a:new THREE.Vector3,b:new THREE.Vector3,c:new THREE.Vector3},e.push(h),f.push(l)}f=this.morphNormals[a];g.vertices=this.morphTargets[a].vertices;
	g.computeFaceNormals();g.computeVertexNormals();c=0;for(d=this.faces.length;c<d;c++)e=this.faces[c],h=f.faceNormals[c],l=f.vertexNormals[c],h.copy(e.normal),l.a.copy(e.vertexNormals[0]),l.b.copy(e.vertexNormals[1]),l.c.copy(e.vertexNormals[2])}c=0;for(d=this.faces.length;c<d;c++)e=this.faces[c],e.normal=e.__originalFaceNormal,e.vertexNormals=e.__originalVertexNormals},computeTangents:function(){console.warn("THREE.Geometry: .computeTangents() has been removed.")},computeLineDistances:function(){for(var a=
	0,b=this.vertices,c=0,d=b.length;c<d;c++)0<c&&(a+=b[c].distanceTo(b[c-1])),this.lineDistances[c]=a},computeBoundingBox:function(){null===this.boundingBox&&(this.boundingBox=new THREE.Box3);this.boundingBox.setFromPoints(this.vertices)},computeBoundingSphere:function(){null===this.boundingSphere&&(this.boundingSphere=new THREE.Sphere);this.boundingSphere.setFromPoints(this.vertices)},merge:function(a,b,c){if(!1===a instanceof THREE.Geometry)console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.",
	a);else{var d,e=this.vertices.length,g=this.vertices,f=a.vertices,h=this.faces,l=a.faces,k=this.faceVertexUvs[0];a=a.faceVertexUvs[0];void 0===c&&(c=0);void 0!==b&&(d=(new THREE.Matrix3).getNormalMatrix(b));for(var m=0,p=f.length;m<p;m++){var n=f[m].clone();void 0!==b&&n.applyMatrix4(b);g.push(n)}m=0;for(p=l.length;m<p;m++){var f=l[m],q,s=f.vertexNormals,t=f.vertexColors,n=new THREE.Face3(f.a+e,f.b+e,f.c+e);n.normal.copy(f.normal);void 0!==d&&n.normal.applyMatrix3(d).normalize();b=0;for(g=s.length;b<
	g;b++)q=s[b].clone(),void 0!==d&&q.applyMatrix3(d).normalize(),n.vertexNormals.push(q);n.color.copy(f.color);b=0;for(g=t.length;b<g;b++)q=t[b],n.vertexColors.push(q.clone());n.materialIndex=f.materialIndex+c;h.push(n)}m=0;for(p=a.length;m<p;m++)if(c=a[m],d=[],void 0!==c){b=0;for(g=c.length;b<g;b++)d.push(c[b].clone());k.push(d)}}},mergeMesh:function(a){!1===a instanceof THREE.Mesh?console.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.",a):(a.matrixAutoUpdate&&a.updateMatrix(),
	this.merge(a.geometry,a.matrix))},mergeVertices:function(){var a={},b=[],c=[],d,e=Math.pow(10,4),g,f;g=0;for(f=this.vertices.length;g<f;g++)d=this.vertices[g],d=Math.round(d.x*e)+"_"+Math.round(d.y*e)+"_"+Math.round(d.z*e),void 0===a[d]?(a[d]=g,b.push(this.vertices[g]),c[g]=b.length-1):c[g]=c[a[d]];a=[];g=0;for(f=this.faces.length;g<f;g++)for(e=this.faces[g],e.a=c[e.a],e.b=c[e.b],e.c=c[e.c],e=[e.a,e.b,e.c],d=0;3>d;d++)if(e[d]===e[(d+1)%3]){a.push(g);break}for(g=a.length-1;0<=g;g--)for(e=a[g],this.faces.splice(e,
	1),c=0,f=this.faceVertexUvs.length;c<f;c++)this.faceVertexUvs[c].splice(e,1);g=this.vertices.length-b.length;this.vertices=b;return g},sortFacesByMaterialIndex:function(){for(var a=this.faces,b=a.length,c=0;c<b;c++)a[c]._id=c;a.sort(function(a,b){return a.materialIndex-b.materialIndex});var d=this.faceVertexUvs[0],e=this.faceVertexUvs[1],g,f;d&&d.length===b&&(g=[]);e&&e.length===b&&(f=[]);for(c=0;c<b;c++){var h=a[c]._id;g&&g.push(d[h]);f&&f.push(e[h])}g&&(this.faceVertexUvs[0]=g);f&&(this.faceVertexUvs[1]=
	f)},toJSON:function(){function a(a,b,c){return c?a|1<<b:a&~(1<<b)}function b(a){var b=a.x.toString()+a.y.toString()+a.z.toString();if(void 0!==k[b])return k[b];k[b]=l.length/3;l.push(a.x,a.y,a.z);return k[b]}function c(a){var b=a.r.toString()+a.g.toString()+a.b.toString();if(void 0!==p[b])return p[b];p[b]=m.length;m.push(a.getHex());return p[b]}function d(a){var b=a.x.toString()+a.y.toString();if(void 0!==q[b])return q[b];q[b]=n.length/2;n.push(a.x,a.y);return q[b]}var e={metadata:{version:4.4,type:"Geometry",
	generator:"Geometry.toJSON"}};e.uuid=this.uuid;e.type=this.type;""!==this.name&&(e.name=this.name);if(void 0!==this.parameters){var g=this.parameters,f;for(f in g)void 0!==g[f]&&(e[f]=g[f]);return e}g=[];for(f=0;f<this.vertices.length;f++){var h=this.vertices[f];g.push(h.x,h.y,h.z)}var h=[],l=[],k={},m=[],p={},n=[],q={};for(f=0;f<this.faces.length;f++){var s=this.faces[f],t=void 0!==this.faceVertexUvs[0][f],v=0<s.normal.length(),u=0<s.vertexNormals.length,w=1!==s.color.r||1!==s.color.g||1!==s.color.b,
	D=0<s.vertexColors.length,x=0,x=a(x,0,0),x=a(x,1,!1),x=a(x,2,!1),x=a(x,3,t),x=a(x,4,v),x=a(x,5,u),x=a(x,6,w),x=a(x,7,D);h.push(x);h.push(s.a,s.b,s.c);t&&(t=this.faceVertexUvs[0][f],h.push(d(t[0]),d(t[1]),d(t[2])));v&&h.push(b(s.normal));u&&(v=s.vertexNormals,h.push(b(v[0]),b(v[1]),b(v[2])));w&&h.push(c(s.color));D&&(s=s.vertexColors,h.push(c(s[0]),c(s[1]),c(s[2])))}e.data={};e.data.vertices=g;e.data.normals=l;0<m.length&&(e.data.colors=m);0<n.length&&(e.data.uvs=[n]);e.data.faces=h;return e},clone:function(){return(new this.constructor).copy(this)},
	copy:function(a){this.vertices=[];this.faces=[];this.faceVertexUvs=[[]];for(var b=a.vertices,c=0,d=b.length;c<d;c++)this.vertices.push(b[c].clone());b=a.faces;c=0;for(d=b.length;c<d;c++)this.faces.push(b[c].clone());c=0;for(d=a.faceVertexUvs.length;c<d;c++){b=a.faceVertexUvs[c];void 0===this.faceVertexUvs[c]&&(this.faceVertexUvs[c]=[]);for(var e=0,g=b.length;e<g;e++){for(var f=b[e],h=[],l=0,k=f.length;l<k;l++)h.push(f[l].clone());this.faceVertexUvs[c].push(h)}}return this},dispose:function(){this.dispatchEvent({type:"dispose"})}};
	THREE.EventDispatcher.prototype.apply(THREE.Geometry.prototype);THREE.GeometryIdCount=0;
	THREE.DirectGeometry=function(){Object.defineProperty(this,"id",{value:THREE.GeometryIdCount++});this.uuid=THREE.Math.generateUUID();this.name="";this.type="DirectGeometry";this.indices=[];this.vertices=[];this.normals=[];this.colors=[];this.uvs=[];this.uvs2=[];this.groups=[];this.morphTargets={};this.skinWeights=[];this.skinIndices=[];this.boundingSphere=this.boundingBox=null;this.groupsNeedUpdate=this.uvsNeedUpdate=this.colorsNeedUpdate=this.normalsNeedUpdate=this.verticesNeedUpdate=!1};
	THREE.DirectGeometry.prototype={constructor:THREE.DirectGeometry,computeBoundingBox:THREE.Geometry.prototype.computeBoundingBox,computeBoundingSphere:THREE.Geometry.prototype.computeBoundingSphere,computeFaceNormals:function(){console.warn("THREE.DirectGeometry: computeFaceNormals() is not a method of this type of geometry.")},computeVertexNormals:function(){console.warn("THREE.DirectGeometry: computeVertexNormals() is not a method of this type of geometry.")},computeGroups:function(a){var b,c=[],
	d;a=a.faces;for(var e=0;e<a.length;e++){var g=a[e];g.materialIndex!==d&&(d=g.materialIndex,void 0!==b&&(b.count=3*e-b.start,c.push(b)),b={start:3*e,materialIndex:d})}void 0!==b&&(b.count=3*e-b.start,c.push(b));this.groups=c},fromGeometry:function(a){var b=a.faces,c=a.vertices,d=a.faceVertexUvs,e=d[0]&&0<d[0].length,g=d[1]&&0<d[1].length,f=a.morphTargets,h=f.length;if(0<h){for(var l=[],k=0;k<h;k++)l[k]=[];this.morphTargets.position=l}var m=a.morphNormals,p=m.length;if(0<p){for(var n=[],k=0;k<p;k++)n[k]=
	[];this.morphTargets.normal=n}for(var q=a.skinIndices,s=a.skinWeights,t=q.length===c.length,v=s.length===c.length,k=0;k<b.length;k++){var u=b[k];this.vertices.push(c[u.a],c[u.b],c[u.c]);var w=u.vertexNormals;3===w.length?this.normals.push(w[0],w[1],w[2]):(w=u.normal,this.normals.push(w,w,w));w=u.vertexColors;3===w.length?this.colors.push(w[0],w[1],w[2]):(w=u.color,this.colors.push(w,w,w));!0===e&&(w=d[0][k],void 0!==w?this.uvs.push(w[0],w[1],w[2]):(console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ",
	k),this.uvs.push(new THREE.Vector2,new THREE.Vector2,new THREE.Vector2)));!0===g&&(w=d[1][k],void 0!==w?this.uvs2.push(w[0],w[1],w[2]):(console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ",k),this.uvs2.push(new THREE.Vector2,new THREE.Vector2,new THREE.Vector2)));for(w=0;w<h;w++){var D=f[w].vertices;l[w].push(D[u.a],D[u.b],D[u.c])}for(w=0;w<p;w++)D=m[w].vertexNormals[k],n[w].push(D.a,D.b,D.c);t&&this.skinIndices.push(q[u.a],q[u.b],q[u.c]);v&&this.skinWeights.push(s[u.a],s[u.b],
	s[u.c])}this.computeGroups(a);this.verticesNeedUpdate=a.verticesNeedUpdate;this.normalsNeedUpdate=a.normalsNeedUpdate;this.colorsNeedUpdate=a.colorsNeedUpdate;this.uvsNeedUpdate=a.uvsNeedUpdate;this.groupsNeedUpdate=a.groupsNeedUpdate;return this},dispose:function(){this.dispatchEvent({type:"dispose"})}};THREE.EventDispatcher.prototype.apply(THREE.DirectGeometry.prototype);
	THREE.BufferGeometry=function(){Object.defineProperty(this,"id",{value:THREE.GeometryIdCount++});this.uuid=THREE.Math.generateUUID();this.name="";this.type="BufferGeometry";this.index=null;this.attributes={};this.morphAttributes={};this.groups=[];this.boundingSphere=this.boundingBox=null;this.drawRange={start:0,count:Infinity}};
	THREE.BufferGeometry.prototype={constructor:THREE.BufferGeometry,addIndex:function(a){console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().");this.setIndex(a)},getIndex:function(){return this.index},setIndex:function(a){this.index=a},addAttribute:function(a,b,c){!1===b instanceof THREE.BufferAttribute&&!1===b instanceof THREE.InterleavedBufferAttribute?(console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."),this.addAttribute(a,new THREE.BufferAttribute(b,
	c))):"index"===a?(console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."),this.setIndex(b)):this.attributes[a]=b},getAttribute:function(a){return this.attributes[a]},removeAttribute:function(a){delete this.attributes[a]},get drawcalls(){console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups.");return this.groups},get offsets(){console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups.");return this.groups},addDrawCall:function(a,
	b,c){void 0!==c&&console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.");console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup().");this.addGroup(a,b)},clearDrawCalls:function(){console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().");this.clearGroups()},addGroup:function(a,b,c){this.groups.push({start:a,count:b,materialIndex:void 0!==c?c:0})},clearGroups:function(){this.groups=[]},setDrawRange:function(a,b){this.drawRange.start=a;this.drawRange.count=
	b},applyMatrix:function(a){var b=this.attributes.position;void 0!==b&&(a.applyToVector3Array(b.array),b.needsUpdate=!0);b=this.attributes.normal;void 0!==b&&((new THREE.Matrix3).getNormalMatrix(a).applyToVector3Array(b.array),b.needsUpdate=!0);null!==this.boundingBox&&this.computeBoundingBox();null!==this.boundingSphere&&this.computeBoundingSphere()},rotateX:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationX(b);this.applyMatrix(a);return this}}(),rotateY:function(){var a;
	return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationY(b);this.applyMatrix(a);return this}}(),rotateZ:function(){var a;return function(b){void 0===a&&(a=new THREE.Matrix4);a.makeRotationZ(b);this.applyMatrix(a);return this}}(),translate:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Matrix4);a.makeTranslation(b,c,d);this.applyMatrix(a);return this}}(),scale:function(){var a;return function(b,c,d){void 0===a&&(a=new THREE.Matrix4);a.makeScale(b,c,d);this.applyMatrix(a);
	return this}}(),lookAt:function(){var a;return function(b){void 0===a&&(a=new THREE.Object3D);a.lookAt(b);a.updateMatrix();this.applyMatrix(a.matrix)}}(),center:function(){this.computeBoundingBox();var a=this.boundingBox.center().negate();this.translate(a.x,a.y,a.z);return a},setFromObject:function(a){var b=a.geometry;if(a instanceof THREE.Points||a instanceof THREE.Line){a=new THREE.Float32Attribute(3*b.vertices.length,3);var c=new THREE.Float32Attribute(3*b.colors.length,3);this.addAttribute("position",
	a.copyVector3sArray(b.vertices));this.addAttribute("color",c.copyColorsArray(b.colors));b.lineDistances&&b.lineDistances.length===b.vertices.length&&(a=new THREE.Float32Attribute(b.lineDistances.length,1),this.addAttribute("lineDistance",a.copyArray(b.lineDistances)));null!==b.boundingSphere&&(this.boundingSphere=b.boundingSphere.clone());null!==b.boundingBox&&(this.boundingBox=b.boundingBox.clone())}else a instanceof THREE.Mesh&&b instanceof THREE.Geometry&&this.fromGeometry(b);return this},updateFromObject:function(a){var b=
	a.geometry;if(a instanceof THREE.Mesh){var c=b.__directGeometry;if(void 0===c)return this.fromGeometry(b);c.verticesNeedUpdate=b.verticesNeedUpdate;c.normalsNeedUpdate=b.normalsNeedUpdate;c.colorsNeedUpdate=b.colorsNeedUpdate;c.uvsNeedUpdate=b.uvsNeedUpdate;c.groupsNeedUpdate=b.groupsNeedUpdate;b.verticesNeedUpdate=!1;b.normalsNeedUpdate=!1;b.colorsNeedUpdate=!1;b.uvsNeedUpdate=!1;b.groupsNeedUpdate=!1;b=c}!0===b.verticesNeedUpdate&&(c=this.attributes.position,void 0!==c&&(c.copyVector3sArray(b.vertices),
	c.needsUpdate=!0),b.verticesNeedUpdate=!1);!0===b.normalsNeedUpdate&&(c=this.attributes.normal,void 0!==c&&(c.copyVector3sArray(b.normals),c.needsUpdate=!0),b.normalsNeedUpdate=!1);!0===b.colorsNeedUpdate&&(c=this.attributes.color,void 0!==c&&(c.copyColorsArray(b.colors),c.needsUpdate=!0),b.colorsNeedUpdate=!1);b.uvsNeedUpdate&&(c=this.attributes.uv,void 0!==c&&(c.copyVector2sArray(b.uvs),c.needsUpdate=!0),b.uvsNeedUpdate=!1);b.lineDistancesNeedUpdate&&(c=this.attributes.lineDistance,void 0!==c&&
	(c.copyArray(b.lineDistances),c.needsUpdate=!0),b.lineDistancesNeedUpdate=!1);b.groupsNeedUpdate&&(b.computeGroups(a.geometry),this.groups=b.groups,b.groupsNeedUpdate=!1);return this},fromGeometry:function(a){a.__directGeometry=(new THREE.DirectGeometry).fromGeometry(a);return this.fromDirectGeometry(a.__directGeometry)},fromDirectGeometry:function(a){var b=new Float32Array(3*a.vertices.length);this.addAttribute("position",(new THREE.BufferAttribute(b,3)).copyVector3sArray(a.vertices));0<a.normals.length&&
	(b=new Float32Array(3*a.normals.length),this.addAttribute("normal",(new THREE.BufferAttribute(b,3)).copyVector3sArray(a.normals)));0<a.colors.length&&(b=new Float32Array(3*a.colors.length),this.addAttribute("color",(new THREE.BufferAttribute(b,3)).copyColorsArray(a.colors)));0<a.uvs.length&&(b=new Float32Array(2*a.uvs.length),this.addAttribute("uv",(new THREE.BufferAttribute(b,2)).copyVector2sArray(a.uvs)));0<a.uvs2.length&&(b=new Float32Array(2*a.uvs2.length),this.addAttribute("uv2",(new THREE.BufferAttribute(b,
	2)).copyVector2sArray(a.uvs2)));0<a.indices.length&&(b=new (65535<a.vertices.length?Uint32Array:Uint16Array)(3*a.indices.length),this.setIndex((new THREE.BufferAttribute(b,1)).copyIndicesArray(a.indices)));this.groups=a.groups;for(var c in a.morphTargets){for(var b=[],d=a.morphTargets[c],e=0,g=d.length;e<g;e++){var f=d[e],h=new THREE.Float32Attribute(3*f.length,3);b.push(h.copyVector3sArray(f))}this.morphAttributes[c]=b}0<a.skinIndices.length&&(c=new THREE.Float32Attribute(4*a.skinIndices.length,
	4),this.addAttribute("skinIndex",c.copyVector4sArray(a.skinIndices)));0<a.skinWeights.length&&(c=new THREE.Float32Attribute(4*a.skinWeights.length,4),this.addAttribute("skinWeight",c.copyVector4sArray(a.skinWeights)));null!==a.boundingSphere&&(this.boundingSphere=a.boundingSphere.clone());null!==a.boundingBox&&(this.boundingBox=a.boundingBox.clone());return this},computeBoundingBox:function(){var a=new THREE.Vector3;return function(){null===this.boundingBox&&(this.boundingBox=new THREE.Box3);var b=
	this.attributes.position.array;if(b){var c=this.boundingBox;c.makeEmpty();for(var d=0,e=b.length;d<e;d+=3)a.fromArray(b,d),c.expandByPoint(a)}if(void 0===b||0===b.length)this.boundingBox.min.set(0,0,0),this.boundingBox.max.set(0,0,0);(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}}(),computeBoundingSphere:function(){var a=
	new THREE.Box3,b=new THREE.Vector3;return function(){null===this.boundingSphere&&(this.boundingSphere=new THREE.Sphere);var c=this.attributes.position.array;if(c){a.makeEmpty();for(var d=this.boundingSphere.center,e=0,g=c.length;e<g;e+=3)b.fromArray(c,e),a.expandByPoint(b);a.center(d);for(var f=0,e=0,g=c.length;e<g;e+=3)b.fromArray(c,e),f=Math.max(f,d.distanceToSquared(b));this.boundingSphere.radius=Math.sqrt(f);isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
	this)}}}(),computeFaceNormals:function(){},computeVertexNormals:function(){var a=this.index,b=this.attributes,c=this.groups;if(b.position){var d=b.position.array;if(void 0===b.normal)this.addAttribute("normal",new THREE.BufferAttribute(new Float32Array(d.length),3));else for(var e=b.normal.array,g=0,f=e.length;g<f;g++)e[g]=0;var e=b.normal.array,h,l,k,m=new THREE.Vector3,p=new THREE.Vector3,n=new THREE.Vector3,q=new THREE.Vector3,s=new THREE.Vector3;if(a){a=a.array;0===c.length&&this.addGroup(0,a.length);
	for(var t=0,v=c.length;t<v;++t)for(g=c[t],f=g.start,h=g.count,g=f,f+=h;g<f;g+=3)h=3*a[g+0],l=3*a[g+1],k=3*a[g+2],m.fromArray(d,h),p.fromArray(d,l),n.fromArray(d,k),q.subVectors(n,p),s.subVectors(m,p),q.cross(s),e[h]+=q.x,e[h+1]+=q.y,e[h+2]+=q.z,e[l]+=q.x,e[l+1]+=q.y,e[l+2]+=q.z,e[k]+=q.x,e[k+1]+=q.y,e[k+2]+=q.z}else for(g=0,f=d.length;g<f;g+=9)m.fromArray(d,g),p.fromArray(d,g+3),n.fromArray(d,g+6),q.subVectors(n,p),s.subVectors(m,p),q.cross(s),e[g]=q.x,e[g+1]=q.y,e[g+2]=q.z,e[g+3]=q.x,e[g+4]=q.y,
	e[g+5]=q.z,e[g+6]=q.x,e[g+7]=q.y,e[g+8]=q.z;this.normalizeNormals();b.normal.needsUpdate=!0}},computeTangents:function(){console.warn("THREE.BufferGeometry: .computeTangents() has been removed.")},computeOffsets:function(a){console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.")},merge:function(a,b){if(!1===a instanceof THREE.BufferGeometry)console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.",a);else{void 0===b&&(b=0);var c=this.attributes,
	d;for(d in c)if(void 0!==a.attributes[d])for(var e=c[d].array,g=a.attributes[d],f=g.array,h=0,g=g.itemSize*b;h<f.length;h++,g++)e[g]=f[h];return this}},normalizeNormals:function(){for(var a=this.attributes.normal.array,b,c,d,e=0,g=a.length;e<g;e+=3)b=a[e],c=a[e+1],d=a[e+2],b=1/Math.sqrt(b*b+c*c+d*d),a[e]*=b,a[e+1]*=b,a[e+2]*=b},toJSON:function(){var a={metadata:{version:4.4,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};a.uuid=this.uuid;a.type=this.type;""!==this.name&&(a.name=this.name);
	if(void 0!==this.parameters){var b=this.parameters,c;for(c in b)void 0!==b[c]&&(a[c]=b[c]);return a}a.data={attributes:{}};var d=this.index;null!==d&&(b=Array.prototype.slice.call(d.array),a.data.index={type:d.array.constructor.name,array:b});d=this.attributes;for(c in d){var e=d[c],b=Array.prototype.slice.call(e.array);a.data.attributes[c]={itemSize:e.itemSize,type:e.array.constructor.name,array:b}}c=this.groups;0<c.length&&(a.data.groups=JSON.parse(JSON.stringify(c)));c=this.boundingSphere;null!==
	c&&(a.data.boundingSphere={center:c.center.toArray(),radius:c.radius});return a},clone:function(){return(new this.constructor).copy(this)},copy:function(a){var b=a.index;null!==b&&this.setIndex(b.clone());var b=a.attributes,c;for(c in b)this.addAttribute(c,b[c].clone());a=a.groups;c=0;for(b=a.length;c<b;c++){var d=a[c];this.addGroup(d.start,d.count)}return this},dispose:function(){this.dispatchEvent({type:"dispose"})}};THREE.EventDispatcher.prototype.apply(THREE.BufferGeometry.prototype);
	THREE.BufferGeometry.MaxIndex=65535;THREE.InstancedBufferGeometry=function(){THREE.BufferGeometry.call(this);this.type="InstancedBufferGeometry";this.maxInstancedCount=void 0};THREE.InstancedBufferGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);THREE.InstancedBufferGeometry.prototype.constructor=THREE.InstancedBufferGeometry;THREE.InstancedBufferGeometry.prototype.addGroup=function(a,b,c){this.groups.push({start:a,count:b,instances:c})};
	THREE.InstancedBufferGeometry.prototype.copy=function(a){var b=a.index;null!==b&&this.setIndex(b.clone());var b=a.attributes,c;for(c in b)this.addAttribute(c,b[c].clone());a=a.groups;c=0;for(b=a.length;c<b;c++){var d=a[c];this.addGroup(d.start,d.count,d.instances)}return this};THREE.EventDispatcher.prototype.apply(THREE.InstancedBufferGeometry.prototype);
	THREE.AnimationAction=function(a,b,c,d,e){if(void 0===a)throw Error("clip is null");this.clip=a;this.localRoot=null;this.startTime=b||0;this.timeScale=c||1;this.weight=d||1;this.loop=e||THREE.LoopRepeat;this.loopCount=0;this.enabled=!0;this.actionTime=-this.startTime;this.clipTime=0;this.propertyBindings=[]};
	THREE.AnimationAction.prototype={constructor:THREE.AnimationAction,setLocalRoot:function(a){this.localRoot=a;return this},updateTime:function(a){var b=this.clipTime,c=this.loopCount,d=this.clip.duration;this.actionTime+=a;if(this.loop===THREE.LoopOnce)return this.loopCount=0,this.clipTime=Math.min(Math.max(this.actionTime,0),d),this.clipTime!==b&&(this.clipTime===d?this.mixer.dispatchEvent({type:"finished",action:this,direction:1}):0===this.clipTime&&this.mixer.dispatchEvent({type:"finished",action:this,
	direction:-1})),this.clipTime;this.loopCount=Math.floor(this.actionTime/d);a=this.actionTime-this.loopCount*d;a%=d;this.loop==THREE.LoopPingPong&&1===Math.abs(this.loopCount%2)&&(a=d-a);this.clipTime=a;this.loopCount!==c&&this.mixer.dispatchEvent({type:"loop",action:this,loopDelta:this.loopCount-this.loopCount});return this.clipTime},syncWith:function(a){this.actionTime=a.actionTime;this.timeScale=a.timeScale;return this},warpToDuration:function(a){this.timeScale=this.clip.duration/a;return this},
	init:function(a){this.clipTime=a-this.startTime;return this},update:function(a){this.updateTime(a);return this.clip.getAt(this.clipTime)},getTimeScaleAt:function(a){return this.timeScale.getAt?this.timeScale.getAt(a):this.timeScale},getWeightAt:function(a){return this.weight.getAt?this.weight.getAt(a):this.weight}};
	THREE.AnimationClip=function(a,b,c){this.name=a;this.tracks=c;this.duration=void 0!==b?b:-1;if(0>this.duration)for(a=0;a<this.tracks.length;a++)b=this.tracks[a],this.duration=Math.max(b.keys[b.keys.length-1].time);this.trim();this.optimize();this.results=[]};
	THREE.AnimationClip.prototype={constructor:THREE.AnimationClip,getAt:function(a){a=Math.max(0,Math.min(a,this.duration));for(var b=0;b<this.tracks.length;b++)this.results[b]=this.tracks[b].getAt(a);return this.results},trim:function(){for(var a=0;a<this.tracks.length;a++)this.tracks[a].trim(0,this.duration);return this},optimize:function(){for(var a=0;a<this.tracks.length;a++)this.tracks[a].optimize();return this}};
	THREE.AnimationClip.CreateFromMorphTargetSequence=function(a,b,c){for(var d=b.length,e=[],g=0;g<d;g++){var f=[];f.push({time:(g+d-1)%d,value:0});f.push({time:g,value:1});f.push({time:(g+1)%d,value:0});f.sort(THREE.KeyframeTrack.keyComparer);0===f[0].time&&f.push({time:d,value:f[0].value});e.push((new THREE.NumberKeyframeTrack(".morphTargetInfluences["+b[g].name+"]",f)).scale(1/c))}return new THREE.AnimationClip(a,-1,e)};
	THREE.AnimationClip.findByName=function(a,b){for(var c=0;c<a.length;c++)if(a[c].name===b)return a[c];return null};THREE.AnimationClip.CreateClipsFromMorphTargetSequences=function(a,b){for(var c={},d=/^([\w-]*?)([\d]+)$/,e=0,g=a.length;e<g;e++){var f=a[e],h=f.name.match(d);if(h&&1<h.length){var l=h[1];(h=c[l])||(c[l]=h=[]);h.push(f)}}d=[];for(l in c)d.push(THREE.AnimationClip.CreateFromMorphTargetSequence(l,c[l],b));return d};
	THREE.AnimationClip.parse=function(a){for(var b=[],c=0;c<a.tracks.length;c++)b.push(THREE.KeyframeTrack.parse(a.tracks[c]).scale(1/a.fps));return new THREE.AnimationClip(a.name,a.duration,b)};
	THREE.AnimationClip.parseAnimation=function(a,b,c){if(!a)return console.error("  no animation in JSONLoader data"),null;var d=function(a,b,c,d,e){for(var g=[],f=0;f<b.length;f++){var h=b[f];void 0!==h[c]&&g.push({time:h.time,value:e(h)})}return 0<g.length?new d(a,g):null},e=[],g=a.name||"default",f=a.length||-1,h=a.fps||30;a=a.hierarchy||[];for(var l=0;l<a.length;l++){var k=a[l].keys;if(k&&0!=k.length)if(k[0].morphTargets){for(var f={},m=0;m<k.length;m++)if(k[m].morphTargets)for(var p=0;p<k[m].morphTargets.length;p++)f[k[m].morphTargets[p]]=
	-1;for(var n in f){for(var q=[],p=0;p<k[m].morphTargets.length;p++){var s=k[m];q.push({time:s.time,value:s.morphTarget===n?1:0})}e.push(new THREE.NumberKeyframeTrack(c+".morphTargetInfluence["+n+"]",q))}f=f.length*(h||1)}else m=c+".bones["+b[l].name+"]",(p=d(m+".position",k,"pos",THREE.VectorKeyframeTrack,function(a){return(new THREE.Vector3).fromArray(a.pos)}))&&e.push(p),(p=d(m+".quaternion",k,"rot",THREE.QuaternionKeyframeTrack,function(a){return a.rot.slerp?a.rot.clone():(new THREE.Quaternion).fromArray(a.rot)}))&&
	e.push(p),(k=d(m+".scale",k,"scl",THREE.VectorKeyframeTrack,function(a){return(new THREE.Vector3).fromArray(a.scl)}))&&e.push(k)}return 0===e.length?null:new THREE.AnimationClip(g,f,e)};THREE.AnimationMixer=function(a){this.root=a;this.time=0;this.timeScale=1;this.actions=[];this.propertyBindingMap={}};
	THREE.AnimationMixer.prototype={constructor:THREE.AnimationMixer,addAction:function(a){this.actions.push(a);a.init(this.time);a.mixer=this;for(var b=a.clip.tracks,c=a.localRoot||this.root,d=0;d<b.length;d++){var e=b[d],g=c.uuid+"-"+e.name,f=this.propertyBindingMap[g];void 0===f&&(f=new THREE.PropertyBinding(c,e.name),this.propertyBindingMap[g]=f);a.propertyBindings.push(f);f.referenceCount+=1}},removeAllActions:function(){for(var a=0;a<this.actions.length;a++)this.actions[a].mixer=null;for(var b in this.propertyBindingMap)this.propertyBindingMap[b].unbind();
	this.actions=[];this.propertyBindingMap={};return this},removeAction:function(a){var b=this.actions.indexOf(a);-1!==b&&(this.actions.splice(b,1),a.mixer=null);b=a.localRoot||this.root;a=a.clip.tracks;for(var c=0;c<a.length;c++){var d=b.uuid+"-"+a[c].name,e=this.propertyBindingMap[d];e.referenceCount-=1;0>=e.referenceCount&&(e.unbind(),delete this.propertyBindingMap[d])}return this},findActionByName:function(a){for(var b=0;b<this.actions.length;b++)if(this.actions[b].name===a)return this.actions[b];
	return null},play:function(a,b){a.startTime=this.time;this.addAction(a);return this},fadeOut:function(a,b){var c=[];c.push({time:this.time,value:1});c.push({time:this.time+b,value:0});a.weight=new THREE.NumberKeyframeTrack("weight",c);return this},fadeIn:function(a,b){var c=[];c.push({time:this.time,value:0});c.push({time:this.time+b,value:1});a.weight=new THREE.NumberKeyframeTrack("weight",c);return this},warp:function(a,b,c,d){var e=[];e.push({time:this.time,value:b});e.push({time:this.time+d,value:c});
	a.timeScale=new THREE.NumberKeyframeTrack("timeScale",e);return this},crossFade:function(a,b,c,d){this.fadeOut(a,c);this.fadeIn(b,c);if(d){d=a.clip.duration/b.clip.duration;var e=1/d;this.warp(a,1,d,c);this.warp(b,e,1,c)}return this},update:function(a){a*=this.timeScale;this.time+=a;for(var b=0;b<this.actions.length;b++){var c=this.actions[b],d=c.getWeightAt(this.time),e=c.getTimeScaleAt(this.time),e=c.update(a*e);if(!(0>=c.weight)&&c.enabled)for(var g=0;g<e.length;g++)c.propertyBindings[g].accumulate(e[g],
	d)}for(var f in this.propertyBindingMap)this.propertyBindingMap[f].apply();return this}};THREE.EventDispatcher.prototype.apply(THREE.AnimationMixer.prototype);
	THREE.AnimationUtils={getEqualsFunc:function(a){return a.equals?function(a,c){return a.equals(c)}:function(a,c){return a===c}},clone:function(a){if("object"===typeof a){if(a.clone)return a.clone();console.error("can not figure out how to copy exemplarValue",a)}return a},lerp:function(a,b,c,d){return THREE.AnimationUtils.getLerpFunc(a,d)(a,b,c)},lerp_object:function(a,b,c){return a.lerp(b,c)},slerp_object:function(a,b,c){return a.slerp(b,c)},lerp_number:function(a,b,c){return a*(1-c)+b*c},lerp_boolean:function(a,
	b,c){return.5>c?a:b},lerp_boolean_immediate:function(a,b,c){return a},lerp_string:function(a,b,c){return.5>c?a:b},lerp_string_immediate:function(a,b,c){return a},getLerpFunc:function(a,b){if(void 0===a||null===a)throw Error("examplarValue is null");switch(typeof a){case "object":if(a.lerp)return THREE.AnimationUtils.lerp_object;if(a.slerp)return THREE.AnimationUtils.slerp_object;break;case "number":return THREE.AnimationUtils.lerp_number;case "boolean":return b?THREE.AnimationUtils.lerp_boolean:THREE.AnimationUtils.lerp_boolean_immediate;
	case "string":return b?THREE.AnimationUtils.lerp_string:THREE.AnimationUtils.lerp_string_immediate}}};THREE.KeyframeTrack=function(a,b){if(void 0===a)throw Error("track name is undefined");if(void 0===b||0===b.length)throw Error("no keys in track named "+a);this.name=a;this.keys=b;this.lastIndex=0;this.validate();this.optimize()};
	THREE.KeyframeTrack.prototype={constructor:THREE.KeyframeTrack,getAt:function(a){for(;this.lastIndex<this.keys.length&&a>=this.keys[this.lastIndex].time;)this.lastIndex++;for(;0<this.lastIndex&&a<this.keys[this.lastIndex-1].time;)this.lastIndex--;if(this.lastIndex>=this.keys.length)return this.setResult(this.keys[this.keys.length-1].value),this.result;if(0===this.lastIndex)return this.setResult(this.keys[0].value),this.result;var b=this.keys[this.lastIndex-1];this.setResult(b.value);if(b.constantToNext)return this.result;
	var c=this.keys[this.lastIndex];return this.result=this.lerpValues(this.result,c.value,(a-b.time)/(c.time-b.time))},shift:function(a){if(0!==a)for(var b=0;b<this.keys.length;b++)this.keys[b].time+=a;return this},scale:function(a){if(1!==a)for(var b=0;b<this.keys.length;b++)this.keys[b].time*=a;return this},trim:function(a,b){for(var c=0,d=1;d<this.keys.length;d++)this.keys[d]<=a&&c++;for(var e=0,d=this.keys.length-2;0<d;d++)if(this.keys[d]>=b)e++;else break;0<c+e&&(this.keys=this.keys.splice(c,this.keys.length-
	e-c));return this},validate:function(){var a=null;if(0===this.keys.length)console.error("  track is empty, no keys",this);else{for(var b=0;b<this.keys.length;b++){var c=this.keys[b];if(!c){console.error("  key is null in track",this,b);return}if("number"!==typeof c.time||isNaN(c.time)){console.error("  key.time is not a valid number",this,b,c);return}if(void 0===c.value||null===c.value){console.error("  key.value is null in track",this,b,c);return}if(a&&a.time>c.time){console.error("  key.time is less than previous key time, out of order keys",
	this,b,c,a);return}a=c}return this}},optimize:function(){var a=[],b=this.keys[0];a.push(b);THREE.AnimationUtils.getEqualsFunc(b.value);for(var c=1;c<this.keys.length-1;c++){var d=this.keys[c],e=this.keys[c+1];b.time===d.time||this.compareValues(b.value,d.value)&&this.compareValues(d.value,e.value)||(b.constantToNext=this.compareValues(b.value,d.value),a.push(d),b=d)}a.push(this.keys[this.keys.length-1]);this.keys=a;return this}};THREE.KeyframeTrack.keyComparer=function(a,b){return a.time-b.time};
	THREE.KeyframeTrack.parse=function(a){if(void 0===a.type)throw Error("track type undefined, can not parse");return THREE.KeyframeTrack.GetTrackTypeForTypeName(a.type).parse(a)};
	THREE.KeyframeTrack.GetTrackTypeForTypeName=function(a){switch(a.toLowerCase()){case "vector":case "vector2":case "vector3":case "vector4":return THREE.VectorKeyframeTrack;case "quaternion":return THREE.QuaternionKeyframeTrack;case "integer":case "scalar":case "double":case "float":case "number":return THREE.NumberKeyframeTrack;case "bool":case "boolean":return THREE.BooleanKeyframeTrack;case "string":return THREE.StringKeyframeTrack}throw Error("Unsupported typeName: "+a);};
	THREE.PropertyBinding=function(a,b){this.rootNode=a;this.trackName=b;this.referenceCount=0;this.originalValue=null;var c=THREE.PropertyBinding.parseTrackName(b);this.directoryName=c.directoryName;this.nodeName=c.nodeName;this.objectName=c.objectName;this.objectIndex=c.objectIndex;this.propertyName=c.propertyName;this.propertyIndex=c.propertyIndex;this.node=THREE.PropertyBinding.findNode(a,this.nodeName)||a;this.cumulativeValue=null;this.cumulativeWeight=0};
	THREE.PropertyBinding.prototype={constructor:THREE.PropertyBinding,reset:function(){this.cumulativeValue=null;this.cumulativeWeight=0},accumulate:function(a,b){this.isBound||this.bind();0===this.cumulativeWeight?0<b&&(null===this.cumulativeValue&&(this.cumulativeValue=THREE.AnimationUtils.clone(a)),this.cumulativeWeight=b):(this.cumulativeValue=this.lerpValue(this.cumulativeValue,a,b/(this.cumulativeWeight+b)),this.cumulativeWeight+=b)},unbind:function(){this.isBound&&(this.setValue(this.originalValue),
	this.triggerDirty=this.equalsValue=this.lerpValue=this.getValue=this.setValue=null,this.isBound=!1)},bind:function(){if(!this.isBound){var a=this.node;if(a){if(this.objectName){if("materials"===this.objectName){if(!a.material){console.error("  can not bind to material as node does not have a material",this);return}if(!a.material.materials){console.error("  can not bind to material.materials as node.material does not have a materials array",this);return}a=a.material.materials}else if("bones"===this.objectName){if(!a.skeleton){console.error("  can not bind to bones as node does not have a skeleton",
	this);return}for(var a=a.skeleton.bones,b=0;b<a.length;b++)if(a[b].name===this.objectIndex){this.objectIndex=b;break}}else{if(void 0===a[this.objectName]){console.error("  can not bind to objectName of node, undefined",this);return}a=a[this.objectName]}if(void 0!==this.objectIndex){if(void 0===a[this.objectIndex]){console.error("  trying to bind to objectIndex of objectName, but is undefined:",this,a);return}a=a[this.objectIndex]}}var c=a[this.propertyName];if(c){if(void 0!==this.propertyIndex){if("morphTargetInfluences"===
	this.propertyName)for(a.geometry||console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry",this),a.geometry.morphTargets||console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets",this),b=0;b<this.node.geometry.morphTargets.length;b++)if(a.geometry.morphTargets[b].name===this.propertyIndex){this.propertyIndex=b;break}this.setValue=function(a){return this.equalsValue(c[this.propertyIndex],a)?!1:(c[this.propertyIndex]=
	a,!0)};this.getValue=function(){return c[this.propertyIndex]}}else c.copy?(this.setValue=function(a){return this.equalsValue(c,a)?!1:(c.copy(a),!0)},this.getValue=function(){return c}):(this.setValue=function(b){return this.equalsValue(a[this.propertyName],b)?!1:(a[this.propertyName]=b,!0)},this.getValue=function(){return a[this.propertyName]});void 0!==a.needsUpdate?this.triggerDirty=function(){this.node.needsUpdate=!0}:void 0!==a.matrixWorldNeedsUpdate&&(this.triggerDirty=function(){a.matrixWorldNeedsUpdate=
	!0});this.originalValue=this.getValue();this.equalsValue=THREE.AnimationUtils.getEqualsFunc(this.originalValue);this.lerpValue=THREE.AnimationUtils.getLerpFunc(this.originalValue,!0);this.isBound=!0}else console.error("  trying to update property for track: "+this.nodeName+"."+this.propertyName+" but it wasn't found.",a)}else console.error("  trying to update node for track: "+this.trackName+" but it wasn't found.")}},apply:function(){this.isBound||this.bind();if(0<this.cumulativeWeight){if(1>this.cumulativeWeight){var a=
	1-this.cumulativeWeight;this.cumulativeValue=this.lerpValue(this.cumulativeValue,this.originalValue,a/(this.cumulativeWeight+a))}this.setValue(this.cumulativeValue)&&this.triggerDirty&&this.triggerDirty();this.cumulativeValue=null;this.cumulativeWeight=0}}};
	THREE.PropertyBinding.parseTrackName=function(a){var b=/^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_. ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/,c=b.exec(a);if(!c)throw Error("cannot parse trackName at all: "+a);c.index===b.lastIndex&&b.lastIndex++;b={directoryName:c[1],nodeName:c[3],objectName:c[5],objectIndex:c[7],propertyName:c[9],propertyIndex:c[11]};if(null===b.propertyName||0===b.propertyName.length)throw Error("can not parse propertyName from trackName: "+a);return b};
	THREE.PropertyBinding.findNode=function(a,b){function c(a){for(var c=0;c<a.bones.length;c++){var d=a.bones[c];if(d.name===b)return d}return null}function d(a){for(var c=0;c<a.length;c++){var e=a[c];if(e.name===b||e.uuid===b||(e=d(e.children)))return e}return null}if(!b||""===b||"root"===b||"."===b||-1===b||b===a.name||b===a.uuid)return a;if(a.skeleton){var e=c(a.skeleton);if(e)return e}return a.children&&(e=d(a.children))?e:null};
	THREE.VectorKeyframeTrack=function(a,b){THREE.KeyframeTrack.call(this,a,b);this.result=this.keys[0].value.clone()};THREE.VectorKeyframeTrack.prototype=Object.create(THREE.KeyframeTrack.prototype);THREE.VectorKeyframeTrack.prototype.constructor=THREE.VectorKeyframeTrack;THREE.VectorKeyframeTrack.prototype.setResult=function(a){this.result.copy(a)};THREE.VectorKeyframeTrack.prototype.lerpValues=function(a,b,c){return a.lerp(b,c)};THREE.VectorKeyframeTrack.prototype.compareValues=function(a,b){return a.equals(b)};
	THREE.VectorKeyframeTrack.prototype.clone=function(){for(var a=[],b=0;b<this.keys.length;b++){var c=this.keys[b];a.push({time:c.time,value:c.value.clone()})}return new THREE.VectorKeyframeTrack(this.name,a)};THREE.VectorKeyframeTrack.parse=function(a){for(var b=THREE["Vector"+a.keys[0].value.length],c=[],d=0;d<a.keys.length;d++){var e=a.keys[d];c.push({value:(new b).fromArray(e.value),time:e.time})}return new THREE.VectorKeyframeTrack(a.name,c)};
	THREE.QuaternionKeyframeTrack=function(a,b){THREE.KeyframeTrack.call(this,a,b);this.result=this.keys[0].value.clone()};THREE.QuaternionKeyframeTrack.prototype=Object.create(THREE.KeyframeTrack.prototype);THREE.QuaternionKeyframeTrack.prototype.constructor=THREE.QuaternionKeyframeTrack;THREE.QuaternionKeyframeTrack.prototype.setResult=function(a){this.result.copy(a)};THREE.QuaternionKeyframeTrack.prototype.lerpValues=function(a,b,c){return a.slerp(b,c)};
	THREE.QuaternionKeyframeTrack.prototype.compareValues=function(a,b){return a.equals(b)};THREE.QuaternionKeyframeTrack.prototype.multiply=function(a){for(var b=0;b<this.keys.length;b++)this.keys[b].value.multiply(a);return this};THREE.QuaternionKeyframeTrack.prototype.clone=function(){for(var a=[],b=0;b<this.keys.length;b++){var c=this.keys[b];a.push({time:c.time,value:c.value.clone()})}return new THREE.QuaternionKeyframeTrack(this.name,a)};
	THREE.QuaternionKeyframeTrack.parse=function(a){for(var b=[],c=0;c<a.keys.length;c++){var d=a.keys[c];b.push({value:(new THREE.Quaternion).fromArray(d.value),time:d.time})}return new THREE.QuaternionKeyframeTrack(a.name,b)};THREE.StringKeyframeTrack=function(a,b){THREE.KeyframeTrack.call(this,a,b);this.result=this.keys[0].value};THREE.StringKeyframeTrack.prototype=Object.create(THREE.KeyframeTrack.prototype);THREE.StringKeyframeTrack.prototype.constructor=THREE.StringKeyframeTrack;
	THREE.StringKeyframeTrack.prototype.setResult=function(a){this.result=a};THREE.StringKeyframeTrack.prototype.lerpValues=function(a,b,c){return 1>c?a:b};THREE.StringKeyframeTrack.prototype.compareValues=function(a,b){return a===b};THREE.StringKeyframeTrack.prototype.clone=function(){for(var a=[],b=0;b<this.keys.length;b++){var c=this.keys[b];a.push({time:c.time,value:c.value})}return new THREE.StringKeyframeTrack(this.name,a)};
	THREE.StringKeyframeTrack.parse=function(a){return new THREE.StringKeyframeTrack(a.name,a.keys)};THREE.BooleanKeyframeTrack=function(a,b){THREE.KeyframeTrack.call(this,a,b);this.result=this.keys[0].value};THREE.BooleanKeyframeTrack.prototype=Object.create(THREE.KeyframeTrack.prototype);THREE.BooleanKeyframeTrack.prototype.constructor=THREE.BooleanKeyframeTrack;THREE.BooleanKeyframeTrack.prototype.setResult=function(a){this.result=a};
	THREE.BooleanKeyframeTrack.prototype.lerpValues=function(a,b,c){return 1>c?a:b};THREE.BooleanKeyframeTrack.prototype.compareValues=function(a,b){return a===b};THREE.BooleanKeyframeTrack.prototype.clone=function(){for(var a=[],b=0;b<this.keys.length;b++){var c=this.keys[b];a.push({time:c.time,value:c.value})}return new THREE.BooleanKeyframeTrack(this.name,a)};THREE.BooleanKeyframeTrack.parse=function(a){return new THREE.BooleanKeyframeTrack(a.name,a.keys)};
	THREE.NumberKeyframeTrack=function(a,b){THREE.KeyframeTrack.call(this,a,b);this.result=this.keys[0].value};THREE.NumberKeyframeTrack.prototype=Object.create(THREE.KeyframeTrack.prototype);THREE.NumberKeyframeTrack.prototype.constructor=THREE.NumberKeyframeTrack;THREE.NumberKeyframeTrack.prototype.setResult=function(a){this.result=a};THREE.NumberKeyframeTrack.prototype.lerpValues=function(a,b,c){return a*(1-c)+b*c};THREE.NumberKeyframeTrack.prototype.compareValues=function(a,b){return a===b};
	THREE.NumberKeyframeTrack.prototype.clone=function(){for(var a=[],b=0;b<this.keys.length;b++){var c=this.keys[b];a.push({time:c.time,value:c.value})}return new THREE.NumberKeyframeTrack(this.name,a)};THREE.NumberKeyframeTrack.parse=function(a){return new THREE.NumberKeyframeTrack(a.name,a.keys)};THREE.Camera=function(){THREE.Object3D.call(this);this.type="Camera";this.matrixWorldInverse=new THREE.Matrix4;this.projectionMatrix=new THREE.Matrix4};THREE.Camera.prototype=Object.create(THREE.Object3D.prototype);
	THREE.Camera.prototype.constructor=THREE.Camera;THREE.Camera.prototype.getWorldDirection=function(){var a=new THREE.Quaternion;return function(b){b=b||new THREE.Vector3;this.getWorldQuaternion(a);return b.set(0,0,-1).applyQuaternion(a)}}();THREE.Camera.prototype.lookAt=function(){var a=new THREE.Matrix4;return function(b){a.lookAt(this.position,b,this.up);this.quaternion.setFromRotationMatrix(a)}}();THREE.Camera.prototype.clone=function(){return(new this.constructor).copy(this)};
	THREE.Camera.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a);this.matrixWorldInverse.copy(a.matrixWorldInverse);this.projectionMatrix.copy(a.projectionMatrix);return this};
	THREE.CubeCamera=function(a,b,c){THREE.Object3D.call(this);this.type="CubeCamera";var d=new THREE.PerspectiveCamera(90,1,a,b);d.up.set(0,-1,0);d.lookAt(new THREE.Vector3(1,0,0));this.add(d);var e=new THREE.PerspectiveCamera(90,1,a,b);e.up.set(0,-1,0);e.lookAt(new THREE.Vector3(-1,0,0));this.add(e);var g=new THREE.PerspectiveCamera(90,1,a,b);g.up.set(0,0,1);g.lookAt(new THREE.Vector3(0,1,0));this.add(g);var f=new THREE.PerspectiveCamera(90,1,a,b);f.up.set(0,0,-1);f.lookAt(new THREE.Vector3(0,-1,0));
	this.add(f);var h=new THREE.PerspectiveCamera(90,1,a,b);h.up.set(0,-1,0);h.lookAt(new THREE.Vector3(0,0,1));this.add(h);var l=new THREE.PerspectiveCamera(90,1,a,b);l.up.set(0,-1,0);l.lookAt(new THREE.Vector3(0,0,-1));this.add(l);this.renderTarget=new THREE.WebGLRenderTargetCube(c,c,{format:THREE.RGBFormat,magFilter:THREE.LinearFilter,minFilter:THREE.LinearFilter});this.updateCubeMap=function(a,b){null===this.parent&&this.updateMatrixWorld();var c=this.renderTarget,n=c.texture.generateMipmaps;c.texture.generateMipmaps=
	!1;c.activeCubeFace=0;a.render(b,d,c);c.activeCubeFace=1;a.render(b,e,c);c.activeCubeFace=2;a.render(b,g,c);c.activeCubeFace=3;a.render(b,f,c);c.activeCubeFace=4;a.render(b,h,c);c.texture.generateMipmaps=n;c.activeCubeFace=5;a.render(b,l,c);a.setRenderTarget(null)}};THREE.CubeCamera.prototype=Object.create(THREE.Object3D.prototype);THREE.CubeCamera.prototype.constructor=THREE.CubeCamera;
	THREE.OrthographicCamera=function(a,b,c,d,e,g){THREE.Camera.call(this);this.type="OrthographicCamera";this.zoom=1;this.left=a;this.right=b;this.top=c;this.bottom=d;this.near=void 0!==e?e:.1;this.far=void 0!==g?g:2E3;this.updateProjectionMatrix()};THREE.OrthographicCamera.prototype=Object.create(THREE.Camera.prototype);THREE.OrthographicCamera.prototype.constructor=THREE.OrthographicCamera;
	THREE.OrthographicCamera.prototype.updateProjectionMatrix=function(){var a=(this.right-this.left)/(2*this.zoom),b=(this.top-this.bottom)/(2*this.zoom),c=(this.right+this.left)/2,d=(this.top+this.bottom)/2;this.projectionMatrix.makeOrthographic(c-a,c+a,d+b,d-b,this.near,this.far)};THREE.OrthographicCamera.prototype.copy=function(a){THREE.Camera.prototype.copy.call(this,a);this.left=a.left;this.right=a.right;this.top=a.top;this.bottom=a.bottom;this.near=a.near;this.far=a.far;this.zoom=a.zoom;return this};
	THREE.OrthographicCamera.prototype.toJSON=function(a){a=THREE.Object3D.prototype.toJSON.call(this,a);a.object.zoom=this.zoom;a.object.left=this.left;a.object.right=this.right;a.object.top=this.top;a.object.bottom=this.bottom;a.object.near=this.near;a.object.far=this.far;return a};THREE.PerspectiveCamera=function(a,b,c,d){THREE.Camera.call(this);this.type="PerspectiveCamera";this.zoom=1;this.fov=void 0!==a?a:50;this.aspect=void 0!==b?b:1;this.near=void 0!==c?c:.1;this.far=void 0!==d?d:2E3;this.updateProjectionMatrix()};
	THREE.PerspectiveCamera.prototype=Object.create(THREE.Camera.prototype);THREE.PerspectiveCamera.prototype.constructor=THREE.PerspectiveCamera;THREE.PerspectiveCamera.prototype.setLens=function(a,b){void 0===b&&(b=24);this.fov=2*THREE.Math.radToDeg(Math.atan(b/(2*a)));this.updateProjectionMatrix()};THREE.PerspectiveCamera.prototype.setViewOffset=function(a,b,c,d,e,g){this.fullWidth=a;this.fullHeight=b;this.x=c;this.y=d;this.width=e;this.height=g;this.updateProjectionMatrix()};
	THREE.PerspectiveCamera.prototype.updateProjectionMatrix=function(){var a=THREE.Math.radToDeg(2*Math.atan(Math.tan(.5*THREE.Math.degToRad(this.fov))/this.zoom));if(this.fullWidth){var b=this.fullWidth/this.fullHeight,a=Math.tan(THREE.Math.degToRad(.5*a))*this.near,c=-a,d=b*c,b=Math.abs(b*a-d),c=Math.abs(a-c);this.projectionMatrix.makeFrustum(d+this.x*b/this.fullWidth,d+(this.x+this.width)*b/this.fullWidth,a-(this.y+this.height)*c/this.fullHeight,a-this.y*c/this.fullHeight,this.near,this.far)}else this.projectionMatrix.makePerspective(a,
	this.aspect,this.near,this.far)};THREE.PerspectiveCamera.prototype.copy=function(a){THREE.Camera.prototype.copy.call(this,a);this.fov=a.fov;this.aspect=a.aspect;this.near=a.near;this.far=a.far;this.zoom=a.zoom;return this};THREE.PerspectiveCamera.prototype.toJSON=function(a){a=THREE.Object3D.prototype.toJSON.call(this,a);a.object.zoom=this.zoom;a.object.fov=this.fov;a.object.aspect=this.aspect;a.object.near=this.near;a.object.far=this.far;return a};
	THREE.Light=function(a){THREE.Object3D.call(this);this.type="Light";this.color=new THREE.Color(a);this.receiveShadow=void 0};THREE.Light.prototype=Object.create(THREE.Object3D.prototype);THREE.Light.prototype.constructor=THREE.Light;
	Object.defineProperties(THREE.Light.prototype,{onlyShadow:{set:function(a){console.warn("THREE.Light: .onlyShadow has been removed.")}},shadowCameraFov:{set:function(a){this.shadow.camera.fov=a}},shadowCameraLeft:{set:function(a){this.shadow.camera.left=a}},shadowCameraRight:{set:function(a){this.shadow.camera.right=a}},shadowCameraTop:{set:function(a){this.shadow.camera.top=a}},shadowCameraBottom:{set:function(a){this.shadow.camera.bottom=a}},shadowCameraNear:{set:function(a){this.shadow.camera.near=
	a}},shadowCameraFar:{set:function(a){this.shadow.camera.far=a}},shadowCameraVisible:{set:function(a){console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow ) instead.")}},shadowBias:{set:function(a){this.shadow.bias=a}},shadowDarkness:{set:function(a){this.shadow.darkness=a}},shadowMapWidth:{set:function(a){this.shadow.mapSize.width=a}},shadowMapHeight:{set:function(a){this.shadow.mapSize.height=a}}});
	THREE.Light.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a);this.color.copy(a.color);return this};
	THREE.Light.prototype.toJSON=function(a){a=THREE.Object3D.prototype.toJSON.call(this,a);a.object.color=this.color.getHex();void 0!==this.groundColor&&(a.object.groundColor=this.groundColor.getHex());void 0!==this.intensity&&(a.object.intensity=this.intensity);void 0!==this.distance&&(a.object.distance=this.distance);void 0!==this.angle&&(a.object.angle=this.angle);void 0!==this.decay&&(a.object.decay=this.decay);void 0!==this.exponent&&(a.object.exponent=this.exponent);return a};
	THREE.LightShadow=function(a){this.camera=a;this.bias=0;this.darkness=1;this.mapSize=new THREE.Vector2(512,512);this.matrix=this.map=null};THREE.LightShadow.prototype={constructor:THREE.LightShadow,copy:function(a){this.camera=a.camera.clone();this.bias=a.bias;this.darkness=a.darkness;this.mapSize.copy(a.mapSize)},clone:function(){return(new this.constructor).copy(this)}};THREE.AmbientLight=function(a){THREE.Light.call(this,a);this.type="AmbientLight";this.castShadow=void 0};
	THREE.AmbientLight.prototype=Object.create(THREE.Light.prototype);THREE.AmbientLight.prototype.constructor=THREE.AmbientLight;THREE.DirectionalLight=function(a,b){THREE.Light.call(this,a);this.type="DirectionalLight";this.position.set(0,1,0);this.updateMatrix();this.target=new THREE.Object3D;this.intensity=void 0!==b?b:1;this.shadow=new THREE.LightShadow(new THREE.OrthographicCamera(-500,500,500,-500,50,5E3))};THREE.DirectionalLight.prototype=Object.create(THREE.Light.prototype);
	THREE.DirectionalLight.prototype.constructor=THREE.DirectionalLight;THREE.DirectionalLight.prototype.copy=function(a){THREE.Light.prototype.copy.call(this,a);this.intensity=a.intensity;this.target=a.target.clone();this.shadow=a.shadow.clone();return this};THREE.HemisphereLight=function(a,b,c){THREE.Light.call(this,a);this.type="HemisphereLight";this.castShadow=void 0;this.position.set(0,1,0);this.updateMatrix();this.groundColor=new THREE.Color(b);this.intensity=void 0!==c?c:1};
	THREE.HemisphereLight.prototype=Object.create(THREE.Light.prototype);THREE.HemisphereLight.prototype.constructor=THREE.HemisphereLight;THREE.HemisphereLight.prototype.copy=function(a){THREE.Light.prototype.copy.call(this,a);this.groundColor.copy(a.groundColor);this.intensity=a.intensity;return this};
	THREE.PointLight=function(a,b,c,d){THREE.Light.call(this,a);this.type="PointLight";this.intensity=void 0!==b?b:1;this.distance=void 0!==c?c:0;this.decay=void 0!==d?d:1;this.shadow=new THREE.LightShadow(new THREE.PerspectiveCamera(90,1,1,500))};THREE.PointLight.prototype=Object.create(THREE.Light.prototype);THREE.PointLight.prototype.constructor=THREE.PointLight;
	THREE.PointLight.prototype.copy=function(a){THREE.Light.prototype.copy.call(this,a);this.intensity=a.intensity;this.distance=a.distance;this.decay=a.decay;this.shadow=a.shadow.clone();return this};
	THREE.SpotLight=function(a,b,c,d,e,g){THREE.Light.call(this,a);this.type="SpotLight";this.position.set(0,1,0);this.updateMatrix();this.target=new THREE.Object3D;this.intensity=void 0!==b?b:1;this.distance=void 0!==c?c:0;this.angle=void 0!==d?d:Math.PI/3;this.exponent=void 0!==e?e:10;this.decay=void 0!==g?g:1;this.shadow=new THREE.LightShadow(new THREE.PerspectiveCamera(50,1,50,5E3))};THREE.SpotLight.prototype=Object.create(THREE.Light.prototype);THREE.SpotLight.prototype.constructor=THREE.SpotLight;
	THREE.SpotLight.prototype.copy=function(a){THREE.Light.prototype.copy.call(this,a);this.intensity=a.intensity;this.distance=a.distance;this.angle=a.angle;this.exponent=a.exponent;this.decay=a.decay;this.target=a.target.clone();this.shadow=a.shadow.clone();return this};THREE.Cache={enabled:!1,files:{},add:function(a,b){!1!==this.enabled&&(this.files[a]=b)},get:function(a){if(!1!==this.enabled)return this.files[a]},remove:function(a){delete this.files[a]},clear:function(){this.files={}}};
	THREE.Loader=function(){this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){}};
	THREE.Loader.prototype={constructor:THREE.Loader,crossOrigin:void 0,extractUrlBase:function(a){a=a.split("/");if(1===a.length)return"./";a.pop();return a.join("/")+"/"},initMaterials:function(a,b,c){for(var d=[],e=0;e<a.length;++e)d[e]=this.createMaterial(a[e],b,c);return d},createMaterial:function(){var a,b,c;return function(d,e,g){function f(a,c,d,f,l){a=e+a;var k=THREE.Loader.Handlers.get(a);null!==k?a=k.load(a):(b.setCrossOrigin(g),a=b.load(a));void 0!==c&&(a.repeat.fromArray(c),1!==c[0]&&(a.wrapS=
	THREE.RepeatWrapping),1!==c[1]&&(a.wrapT=THREE.RepeatWrapping));void 0!==d&&a.offset.fromArray(d);void 0!==f&&("repeat"===f[0]&&(a.wrapS=THREE.RepeatWrapping),"mirror"===f[0]&&(a.wrapS=THREE.MirroredRepeatWrapping),"repeat"===f[1]&&(a.wrapT=THREE.RepeatWrapping),"mirror"===f[1]&&(a.wrapT=THREE.MirroredRepeatWrapping));void 0!==l&&(a.anisotropy=l);c=THREE.Math.generateUUID();h[c]=a;return c}void 0===a&&(a=new THREE.Color);void 0===b&&(b=new THREE.TextureLoader);void 0===c&&(c=new THREE.MaterialLoader);
	var h={},l={uuid:THREE.Math.generateUUID(),type:"MeshLambertMaterial"},k;for(k in d){var m=d[k];switch(k){case "DbgColor":l.color=m;break;case "DbgIndex":case "opticalDensity":case "illumination":break;case "DbgName":l.name=m;break;case "blending":l.blending=THREE[m];break;case "colorDiffuse":l.color=a.fromArray(m).getHex();break;case "colorSpecular":l.specular=a.fromArray(m).getHex();break;case "colorEmissive":l.emissive=a.fromArray(m).getHex();break;case "specularCoef":l.shininess=m;break;case "shading":"basic"===
	m.toLowerCase()&&(l.type="MeshBasicMaterial");"phong"===m.toLowerCase()&&(l.type="MeshPhongMaterial");break;case "mapDiffuse":l.map=f(m,d.mapDiffuseRepeat,d.mapDiffuseOffset,d.mapDiffuseWrap,d.mapDiffuseAnisotropy);break;case "mapDiffuseRepeat":case "mapDiffuseOffset":case "mapDiffuseWrap":case "mapDiffuseAnisotropy":break;case "mapLight":l.lightMap=f(m,d.mapLightRepeat,d.mapLightOffset,d.mapLightWrap,d.mapLightAnisotropy);break;case "mapLightRepeat":case "mapLightOffset":case "mapLightWrap":case "mapLightAnisotropy":break;
	case "mapAO":l.aoMap=f(m,d.mapAORepeat,d.mapAOOffset,d.mapAOWrap,d.mapAOAnisotropy);break;case "mapAORepeat":case "mapAOOffset":case "mapAOWrap":case "mapAOAnisotropy":break;case "mapBump":l.bumpMap=f(m,d.mapBumpRepeat,d.mapBumpOffset,d.mapBumpWrap,d.mapBumpAnisotropy);break;case "mapBumpScale":l.bumpScale=m;break;case "mapBumpRepeat":case "mapBumpOffset":case "mapBumpWrap":case "mapBumpAnisotropy":break;case "mapNormal":l.normalMap=f(m,d.mapNormalRepeat,d.mapNormalOffset,d.mapNormalWrap,d.mapNormalAnisotropy);
	break;case "mapNormalFactor":l.normalScale=[m,m];break;case "mapNormalRepeat":case "mapNormalOffset":case "mapNormalWrap":case "mapNormalAnisotropy":break;case "mapSpecular":l.specularMap=f(m,d.mapSpecularRepeat,d.mapSpecularOffset,d.mapSpecularWrap,d.mapSpecularAnisotropy);break;case "mapSpecularRepeat":case "mapSpecularOffset":case "mapSpecularWrap":case "mapSpecularAnisotropy":break;case "mapAlpha":l.alphaMap=f(m,d.mapAlphaRepeat,d.mapAlphaOffset,d.mapAlphaWrap,d.mapAlphaAnisotropy);break;case "mapAlphaRepeat":case "mapAlphaOffset":case "mapAlphaWrap":case "mapAlphaAnisotropy":break;
	case "flipSided":l.side=THREE.BackSide;break;case "doubleSided":l.side=THREE.DoubleSide;break;case "transparency":console.warn("THREE.Loader: transparency has been renamed to opacity");l.opacity=m;break;case "opacity":case "transparent":case "depthTest":case "depthWrite":case "transparent":case "visible":case "wireframe":l[k]=m;break;case "vertexColors":!0===m&&(l.vertexColors=THREE.VertexColors);"face"===m&&(l.vertexColors=THREE.FaceColors);break;default:console.error("Loader.createMaterial: Unsupported",
	k,m)}}"MeshPhongMaterial"!==l.type&&delete l.specular;1>l.opacity&&(l.transparent=!0);c.setTextures(h);return c.parse(l)}}()};THREE.Loader.Handlers={handlers:[],add:function(a,b){this.handlers.push(a,b)},get:function(a){for(var b=this.handlers,c=0,d=b.length;c<d;c+=2){var e=b[c+1];if(b[c].test(a))return e}return null}};THREE.XHRLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager};
	THREE.XHRLoader.prototype={constructor:THREE.XHRLoader,load:function(a,b,c,d){var e=this,g=THREE.Cache.get(a);if(void 0!==g)return b&&setTimeout(function(){b(g)},0),g;var f=new XMLHttpRequest;f.open("GET",a,!0);f.addEventListener("load",function(c){c=c.target.response;THREE.Cache.add(a,c);b&&b(c);e.manager.itemEnd(a)},!1);void 0!==c&&f.addEventListener("progress",function(a){c(a)},!1);f.addEventListener("error",function(b){d&&d(b);e.manager.itemError(a)},!1);void 0!==this.crossOrigin&&(f.crossOrigin=
	this.crossOrigin);void 0!==this.responseType&&(f.responseType=this.responseType);void 0!==this.withCredentials&&(f.withCredentials=this.withCredentials);f.send(null);e.manager.itemStart(a);return f},setResponseType:function(a){this.responseType=a},setCrossOrigin:function(a){this.crossOrigin=a},setWithCredentials:function(a){this.withCredentials=a}};THREE.ImageLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager};
	THREE.ImageLoader.prototype={constructor:THREE.ImageLoader,load:function(a,b,c,d){var e=this,g=THREE.Cache.get(a);if(void 0!==g)return e.manager.itemStart(a),b?setTimeout(function(){b(g);e.manager.itemEnd(a)},0):e.manager.itemEnd(a),g;var f=document.createElement("img");f.addEventListener("load",function(c){THREE.Cache.add(a,this);b&&b(this);e.manager.itemEnd(a)},!1);void 0!==c&&f.addEventListener("progress",function(a){c(a)},!1);f.addEventListener("error",function(b){d&&d(b);e.manager.itemError(a)},
	!1);void 0!==this.crossOrigin&&(f.crossOrigin=this.crossOrigin);e.manager.itemStart(a);f.src=a;return f},setCrossOrigin:function(a){this.crossOrigin=a}};THREE.JSONLoader=function(a){"boolean"===typeof a&&(console.warn("THREE.JSONLoader: showStatus parameter has been removed from constructor."),a=void 0);this.manager=void 0!==a?a:THREE.DefaultLoadingManager;this.withCredentials=!1};
	THREE.JSONLoader.prototype={constructor:THREE.JSONLoader,get statusDomElement(){void 0===this._statusDomElement&&(this._statusDomElement=document.createElement("div"));console.warn("THREE.JSONLoader: .statusDomElement has been removed.");return this._statusDomElement},load:function(a,b,c,d){var e=this,g=this.texturePath&&"string"===typeof this.texturePath?this.texturePath:THREE.Loader.prototype.extractUrlBase(a);c=new THREE.XHRLoader(this.manager);c.setCrossOrigin(this.crossOrigin);c.setWithCredentials(this.withCredentials);
	c.load(a,function(c){c=JSON.parse(c);var d=c.metadata;if(void 0!==d){if("object"===d.type){console.error("THREE.JSONLoader: "+a+" should be loaded with THREE.ObjectLoader instead.");return}if("scene"===d.type){console.error("THREE.JSONLoader: "+a+" should be loaded with THREE.SceneLoader instead.");return}}c=e.parse(c,g);b(c.geometry,c.materials)})},setCrossOrigin:function(a){this.crossOrigin=a},setTexturePath:function(a){this.texturePath=a},parse:function(a,b){var c=new THREE.Geometry,d=void 0!==
	a.scale?1/a.scale:1;(function(b){var d,f,h,l,k,m,p,n,q,s,t,v,u,w=a.faces;m=a.vertices;var D=a.normals,x=a.colors,B=0;if(void 0!==a.uvs){for(d=0;d<a.uvs.length;d++)a.uvs[d].length&&B++;for(d=0;d<B;d++)c.faceVertexUvs[d]=[]}l=0;for(k=m.length;l<k;)d=new THREE.Vector3,d.x=m[l++]*b,d.y=m[l++]*b,d.z=m[l++]*b,c.vertices.push(d);l=0;for(k=w.length;l<k;)if(b=w[l++],q=b&1,h=b&2,d=b&8,p=b&16,s=b&32,m=b&64,b&=128,q){q=new THREE.Face3;q.a=w[l];q.b=w[l+1];q.c=w[l+3];t=new THREE.Face3;t.a=w[l+1];t.b=w[l+2];t.c=
	w[l+3];l+=4;h&&(h=w[l++],q.materialIndex=h,t.materialIndex=h);h=c.faces.length;if(d)for(d=0;d<B;d++)for(v=a.uvs[d],c.faceVertexUvs[d][h]=[],c.faceVertexUvs[d][h+1]=[],f=0;4>f;f++)n=w[l++],u=v[2*n],n=v[2*n+1],u=new THREE.Vector2(u,n),2!==f&&c.faceVertexUvs[d][h].push(u),0!==f&&c.faceVertexUvs[d][h+1].push(u);p&&(p=3*w[l++],q.normal.set(D[p++],D[p++],D[p]),t.normal.copy(q.normal));if(s)for(d=0;4>d;d++)p=3*w[l++],s=new THREE.Vector3(D[p++],D[p++],D[p]),2!==d&&q.vertexNormals.push(s),0!==d&&t.vertexNormals.push(s);
	m&&(m=w[l++],m=x[m],q.color.setHex(m),t.color.setHex(m));if(b)for(d=0;4>d;d++)m=w[l++],m=x[m],2!==d&&q.vertexColors.push(new THREE.Color(m)),0!==d&&t.vertexColors.push(new THREE.Color(m));c.faces.push(q);c.faces.push(t)}else{q=new THREE.Face3;q.a=w[l++];q.b=w[l++];q.c=w[l++];h&&(h=w[l++],q.materialIndex=h);h=c.faces.length;if(d)for(d=0;d<B;d++)for(v=a.uvs[d],c.faceVertexUvs[d][h]=[],f=0;3>f;f++)n=w[l++],u=v[2*n],n=v[2*n+1],u=new THREE.Vector2(u,n),c.faceVertexUvs[d][h].push(u);p&&(p=3*w[l++],q.normal.set(D[p++],
	D[p++],D[p]));if(s)for(d=0;3>d;d++)p=3*w[l++],s=new THREE.Vector3(D[p++],D[p++],D[p]),q.vertexNormals.push(s);m&&(m=w[l++],q.color.setHex(x[m]));if(b)for(d=0;3>d;d++)m=w[l++],q.vertexColors.push(new THREE.Color(x[m]));c.faces.push(q)}})(d);(function(){var b=void 0!==a.influencesPerVertex?a.influencesPerVertex:2;if(a.skinWeights)for(var d=0,f=a.skinWeights.length;d<f;d+=b)c.skinWeights.push(new THREE.Vector4(a.skinWeights[d],1<b?a.skinWeights[d+1]:0,2<b?a.skinWeights[d+2]:0,3<b?a.skinWeights[d+3]:
	0));if(a.skinIndices)for(d=0,f=a.skinIndices.length;d<f;d+=b)c.skinIndices.push(new THREE.Vector4(a.skinIndices[d],1<b?a.skinIndices[d+1]:0,2<b?a.skinIndices[d+2]:0,3<b?a.skinIndices[d+3]:0));c.bones=a.bones;c.bones&&0<c.bones.length&&(c.skinWeights.length!==c.skinIndices.length||c.skinIndices.length!==c.vertices.length)&&console.warn("When skinning, number of vertices ("+c.vertices.length+"), skinIndices ("+c.skinIndices.length+"), and skinWeights ("+c.skinWeights.length+") should match.")})();(function(b){if(void 0!==
	a.morphTargets)for(var d=0,f=a.morphTargets.length;d<f;d++){c.morphTargets[d]={};c.morphTargets[d].name=a.morphTargets[d].name;c.morphTargets[d].vertices=[];for(var h=c.morphTargets[d].vertices,l=a.morphTargets[d].vertices,k=0,m=l.length;k<m;k+=3){var p=new THREE.Vector3;p.x=l[k]*b;p.y=l[k+1]*b;p.z=l[k+2]*b;h.push(p)}}if(void 0!==a.morphColors&&0<a.morphColors.length)for(console.warn('THREE.JSONLoader: "morphColors" no longer supported. Using them as face colors.'),b=c.faces,h=a.morphColors[0].colors,
	d=0,f=b.length;d<f;d++)b[d].color.fromArray(h,3*d)})(d);(function(){var b=[],d=[];void 0!==a.animation&&d.push(a.animation);void 0!==a.animations&&(a.animations.length?d=d.concat(a.animations):d.push(a.animations));for(var f=0;f<d.length;f++){var h=THREE.AnimationClip.parseAnimation(d[f],c.bones);h&&b.push(h)}c.morphTargets&&(d=THREE.AnimationClip.CreateClipsFromMorphTargetSequences(c.morphTargets,10),b=b.concat(d));0<b.length&&(c.animations=b)})();c.computeFaceNormals();c.computeBoundingSphere();
	if(void 0===a.materials||0===a.materials.length)return{geometry:c};d=THREE.Loader.prototype.initMaterials(a.materials,b,this.crossOrigin);return{geometry:c,materials:d}}};
	THREE.LoadingManager=function(a,b,c){var d=this,e=!1,g=0,f=0;this.onStart=void 0;this.onLoad=a;this.onProgress=b;this.onError=c;this.itemStart=function(a){f++;if(!1===e&&void 0!==d.onStart)d.onStart(a,g,f);e=!0};this.itemEnd=function(a){g++;if(void 0!==d.onProgress)d.onProgress(a,g,f);if(g===f&&(e=!1,void 0!==d.onLoad))d.onLoad()};this.itemError=function(a){if(void 0!==d.onError)d.onError(a)}};THREE.DefaultLoadingManager=new THREE.LoadingManager;
	THREE.BufferGeometryLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager};
	THREE.BufferGeometryLoader.prototype={constructor:THREE.BufferGeometryLoader,load:function(a,b,c,d){var e=this,g=new THREE.XHRLoader(e.manager);g.setCrossOrigin(this.crossOrigin);g.load(a,function(a){b(e.parse(JSON.parse(a)))},c,d)},setCrossOrigin:function(a){this.crossOrigin=a},parse:function(a){var b=new THREE.BufferGeometry,c=a.data.index;void 0!==c&&(c=new self[c.type](c.array),b.setIndex(new THREE.BufferAttribute(c,1)));var d=a.data.attributes,e;for(e in d){var g=d[e],c=new self[g.type](g.array);
	b.addAttribute(e,new THREE.BufferAttribute(c,g.itemSize))}e=a.data.groups||a.data.drawcalls||a.data.offsets;if(void 0!==e)for(c=0,d=e.length;c!==d;++c)g=e[c],b.addGroup(g.start,g.count);a=a.data.boundingSphere;void 0!==a&&(e=new THREE.Vector3,void 0!==a.center&&e.fromArray(a.center),b.boundingSphere=new THREE.Sphere(e,a.radius));return b}};THREE.MaterialLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager;this.textures={}};
	THREE.MaterialLoader.prototype={constructor:THREE.MaterialLoader,load:function(a,b,c,d){var e=this,g=new THREE.XHRLoader(e.manager);g.setCrossOrigin(this.crossOrigin);g.load(a,function(a){b(e.parse(JSON.parse(a)))},c,d)},setCrossOrigin:function(a){this.crossOrigin=a},setTextures:function(a){this.textures=a},getTexture:function(a){var b=this.textures;void 0===b[a]&&console.warn("THREE.MaterialLoader: Undefined texture",a);return b[a]},parse:function(a){var b=new THREE[a.type];b.uuid=a.uuid;void 0!==
	a.name&&(b.name=a.name);void 0!==a.color&&b.color.setHex(a.color);void 0!==a.emissive&&b.emissive.setHex(a.emissive);void 0!==a.specular&&b.specular.setHex(a.specular);void 0!==a.shininess&&(b.shininess=a.shininess);void 0!==a.uniforms&&(b.uniforms=a.uniforms);void 0!==a.vertexShader&&(b.vertexShader=a.vertexShader);void 0!==a.fragmentShader&&(b.fragmentShader=a.fragmentShader);void 0!==a.vertexColors&&(b.vertexColors=a.vertexColors);void 0!==a.shading&&(b.shading=a.shading);void 0!==a.blending&&
	(b.blending=a.blending);void 0!==a.side&&(b.side=a.side);void 0!==a.opacity&&(b.opacity=a.opacity);void 0!==a.transparent&&(b.transparent=a.transparent);void 0!==a.alphaTest&&(b.alphaTest=a.alphaTest);void 0!==a.depthTest&&(b.depthTest=a.depthTest);void 0!==a.depthWrite&&(b.depthWrite=a.depthWrite);void 0!==a.wireframe&&(b.wireframe=a.wireframe);void 0!==a.wireframeLinewidth&&(b.wireframeLinewidth=a.wireframeLinewidth);void 0!==a.size&&(b.size=a.size);void 0!==a.sizeAttenuation&&(b.sizeAttenuation=
	a.sizeAttenuation);void 0!==a.map&&(b.map=this.getTexture(a.map));void 0!==a.alphaMap&&(b.alphaMap=this.getTexture(a.alphaMap),b.transparent=!0);void 0!==a.bumpMap&&(b.bumpMap=this.getTexture(a.bumpMap));void 0!==a.bumpScale&&(b.bumpScale=a.bumpScale);void 0!==a.normalMap&&(b.normalMap=this.getTexture(a.normalMap));a.normalScale&&(b.normalScale=new THREE.Vector2(a.normalScale,a.normalScale));void 0!==a.displacementMap&&(b.displacementMap=this.getTexture(a.displacementMap));void 0!==a.displacementScale&&
	(b.displacementScale=a.displacementScale);void 0!==a.displacementBias&&(b.displacementBias=a.displacementBias);void 0!==a.specularMap&&(b.specularMap=this.getTexture(a.specularMap));void 0!==a.envMap&&(b.envMap=this.getTexture(a.envMap),b.combine=THREE.MultiplyOperation);a.reflectivity&&(b.reflectivity=a.reflectivity);void 0!==a.lightMap&&(b.lightMap=this.getTexture(a.lightMap));void 0!==a.lightMapIntensity&&(b.lightMapIntensity=a.lightMapIntensity);void 0!==a.aoMap&&(b.aoMap=this.getTexture(a.aoMap));
	void 0!==a.aoMapIntensity&&(b.aoMapIntensity=a.aoMapIntensity);if(void 0!==a.materials)for(var c=0,d=a.materials.length;c<d;c++)b.materials.push(this.parse(a.materials[c]));return b}};THREE.ObjectLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager;this.texturePath=""};
	THREE.ObjectLoader.prototype={constructor:THREE.ObjectLoader,load:function(a,b,c,d){""===this.texturePath&&(this.texturePath=a.substring(0,a.lastIndexOf("/")+1));var e=this,g=new THREE.XHRLoader(e.manager);g.setCrossOrigin(this.crossOrigin);g.load(a,function(a){e.parse(JSON.parse(a),b)},c,d)},setTexturePath:function(a){this.texturePath=a},setCrossOrigin:function(a){this.crossOrigin=a},parse:function(a,b){var c=this.parseGeometries(a.geometries),d=this.parseImages(a.images,function(){void 0!==b&&b(e)}),
	d=this.parseTextures(a.textures,d),d=this.parseMaterials(a.materials,d),e=this.parseObject(a.object,c,d);a.animations&&(e.animations=this.parseAnimations(a.animations));void 0!==a.images&&0!==a.images.length||void 0===b||b(e);return e},parseGeometries:function(a){var b={};if(void 0!==a)for(var c=new THREE.JSONLoader,d=new THREE.BufferGeometryLoader,e=0,g=a.length;e<g;e++){var f,h=a[e];switch(h.type){case "PlaneGeometry":case "PlaneBufferGeometry":f=new THREE[h.type](h.width,h.height,h.widthSegments,
	h.heightSegments);break;case "BoxGeometry":case "CubeGeometry":f=new THREE.BoxGeometry(h.width,h.height,h.depth,h.widthSegments,h.heightSegments,h.depthSegments);break;case "CircleBufferGeometry":f=new THREE.CircleBufferGeometry(h.radius,h.segments,h.thetaStart,h.thetaLength);break;case "CircleGeometry":f=new THREE.CircleGeometry(h.radius,h.segments,h.thetaStart,h.thetaLength);break;case "CylinderGeometry":f=new THREE.CylinderGeometry(h.radiusTop,h.radiusBottom,h.height,h.radialSegments,h.heightSegments,
	h.openEnded,h.thetaStart,h.thetaLength);break;case "SphereGeometry":f=new THREE.SphereGeometry(h.radius,h.widthSegments,h.heightSegments,h.phiStart,h.phiLength,h.thetaStart,h.thetaLength);break;case "SphereBufferGeometry":f=new THREE.SphereBufferGeometry(h.radius,h.widthSegments,h.heightSegments,h.phiStart,h.phiLength,h.thetaStart,h.thetaLength);break;case "DodecahedronGeometry":f=new THREE.DodecahedronGeometry(h.radius,h.detail);break;case "IcosahedronGeometry":f=new THREE.IcosahedronGeometry(h.radius,
	h.detail);break;case "OctahedronGeometry":f=new THREE.OctahedronGeometry(h.radius,h.detail);break;case "TetrahedronGeometry":f=new THREE.TetrahedronGeometry(h.radius,h.detail);break;case "RingGeometry":f=new THREE.RingGeometry(h.innerRadius,h.outerRadius,h.thetaSegments,h.phiSegments,h.thetaStart,h.thetaLength);break;case "TorusGeometry":f=new THREE.TorusGeometry(h.radius,h.tube,h.radialSegments,h.tubularSegments,h.arc);break;case "TorusKnotGeometry":f=new THREE.TorusKnotGeometry(h.radius,h.tube,
	h.radialSegments,h.tubularSegments,h.p,h.q,h.heightScale);break;case "BufferGeometry":f=d.parse(h);break;case "Geometry":f=c.parse(h.data,this.texturePath).geometry;break;default:console.warn('THREE.ObjectLoader: Unsupported geometry type "'+h.type+'"');continue}f.uuid=h.uuid;void 0!==h.name&&(f.name=h.name);b[h.uuid]=f}return b},parseMaterials:function(a,b){var c={};if(void 0!==a){var d=new THREE.MaterialLoader;d.setTextures(b);for(var e=0,g=a.length;e<g;e++){var f=d.parse(a[e]);c[f.uuid]=f}}return c},
	parseAnimations:function(a){for(var b=[],c=0;c<a.length;c++){var d=THREE.AnimationClip.parse(a[c]);b.push(d)}return b},parseImages:function(a,b){function c(a){d.manager.itemStart(a);return f.load(a,function(){d.manager.itemEnd(a)})}var d=this,e={};if(void 0!==a&&0<a.length){var g=new THREE.LoadingManager(b),f=new THREE.ImageLoader(g);f.setCrossOrigin(this.crossOrigin);for(var g=0,h=a.length;g<h;g++){var l=a[g],k=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(l.url)?l.url:d.texturePath+l.url;e[l.uuid]=c(k)}}return e},
	parseTextures:function(a,b){function c(a){if("number"===typeof a)return a;console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.",a);return THREE[a]}var d={};if(void 0!==a)for(var e=0,g=a.length;e<g;e++){var f=a[e];void 0===f.image&&console.warn('THREE.ObjectLoader: No "image" specified for',f.uuid);void 0===b[f.image]&&console.warn("THREE.ObjectLoader: Undefined image",f.image);var h=new THREE.Texture(b[f.image]);h.needsUpdate=!0;h.uuid=f.uuid;void 0!==f.name&&(h.name=
	f.name);void 0!==f.mapping&&(h.mapping=c(f.mapping));void 0!==f.offset&&(h.offset=new THREE.Vector2(f.offset[0],f.offset[1]));void 0!==f.repeat&&(h.repeat=new THREE.Vector2(f.repeat[0],f.repeat[1]));void 0!==f.minFilter&&(h.minFilter=c(f.minFilter));void 0!==f.magFilter&&(h.magFilter=c(f.magFilter));void 0!==f.anisotropy&&(h.anisotropy=f.anisotropy);Array.isArray(f.wrap)&&(h.wrapS=c(f.wrap[0]),h.wrapT=c(f.wrap[1]));d[f.uuid]=h}return d},parseObject:function(){var a=new THREE.Matrix4;return function(b,
	c,d){function e(a){void 0===c[a]&&console.warn("THREE.ObjectLoader: Undefined geometry",a);return c[a]}function g(a){if(void 0!==a)return void 0===d[a]&&console.warn("THREE.ObjectLoader: Undefined material",a),d[a]}var f;switch(b.type){case "Scene":f=new THREE.Scene;break;case "PerspectiveCamera":f=new THREE.PerspectiveCamera(b.fov,b.aspect,b.near,b.far);break;case "OrthographicCamera":f=new THREE.OrthographicCamera(b.left,b.right,b.top,b.bottom,b.near,b.far);break;case "AmbientLight":f=new THREE.AmbientLight(b.color);
	break;case "DirectionalLight":f=new THREE.DirectionalLight(b.color,b.intensity);break;case "PointLight":f=new THREE.PointLight(b.color,b.intensity,b.distance,b.decay);break;case "SpotLight":f=new THREE.SpotLight(b.color,b.intensity,b.distance,b.angle,b.exponent,b.decay);break;case "HemisphereLight":f=new THREE.HemisphereLight(b.color,b.groundColor,b.intensity);break;case "Mesh":f=new THREE.Mesh(e(b.geometry),g(b.material));break;case "LOD":f=new THREE.LOD;break;case "Line":f=new THREE.Line(e(b.geometry),
	g(b.material),b.mode);break;case "PointCloud":case "Points":f=new THREE.Points(e(b.geometry),g(b.material));break;case "Sprite":f=new THREE.Sprite(g(b.material));break;case "Group":f=new THREE.Group;break;default:f=new THREE.Object3D}f.uuid=b.uuid;void 0!==b.name&&(f.name=b.name);void 0!==b.matrix?(a.fromArray(b.matrix),a.decompose(f.position,f.quaternion,f.scale)):(void 0!==b.position&&f.position.fromArray(b.position),void 0!==b.rotation&&f.rotation.fromArray(b.rotation),void 0!==b.scale&&f.scale.fromArray(b.scale));
	void 0!==b.castShadow&&(f.castShadow=b.castShadow);void 0!==b.receiveShadow&&(f.receiveShadow=b.receiveShadow);void 0!==b.visible&&(f.visible=b.visible);void 0!==b.userData&&(f.userData=b.userData);if(void 0!==b.children)for(var h in b.children)f.add(this.parseObject(b.children[h],c,d));if("LOD"===b.type){b=b.levels;for(var l=0;l<b.length;l++){var k=b[l];h=f.getObjectByProperty("uuid",k.object);void 0!==h&&f.addLevel(h,k.distance)}}return f}}()};
	THREE.TextureLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager};THREE.TextureLoader.prototype={constructor:THREE.TextureLoader,load:function(a,b,c,d){var e=new THREE.Texture,g=new THREE.ImageLoader(this.manager);g.setCrossOrigin(this.crossOrigin);g.load(a,function(a){e.image=a;e.needsUpdate=!0;void 0!==b&&b(e)},c,d);return e},setCrossOrigin:function(a){this.crossOrigin=a}};THREE.CubeTextureLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager};
	THREE.CubeTextureLoader.prototype={constructor:THREE.CubeTextureLoader,load:function(a,b,c,d){function e(c){f.load(a[c],function(a){g.images[c]=a;h++;6===h&&(g.needsUpdate=!0,b&&b(g))},void 0,d)}var g=new THREE.CubeTexture([]),f=new THREE.ImageLoader;f.setCrossOrigin(this.crossOrigin);var h=0;for(c=0;c<a.length;++c)e(c);return g},setCrossOrigin:function(a){this.crossOrigin=a}};
	THREE.DataTextureLoader=THREE.BinaryTextureLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager;this._parser=null};
	THREE.BinaryTextureLoader.prototype={constructor:THREE.BinaryTextureLoader,load:function(a,b,c,d){var e=this,g=new THREE.DataTexture,f=new THREE.XHRLoader(this.manager);f.setCrossOrigin(this.crossOrigin);f.setResponseType("arraybuffer");f.load(a,function(a){if(a=e._parser(a))void 0!==a.image?g.image=a.image:void 0!==a.data&&(g.image.width=a.width,g.image.height=a.height,g.image.data=a.data),g.wrapS=void 0!==a.wrapS?a.wrapS:THREE.ClampToEdgeWrapping,g.wrapT=void 0!==a.wrapT?a.wrapT:THREE.ClampToEdgeWrapping,
	g.magFilter=void 0!==a.magFilter?a.magFilter:THREE.LinearFilter,g.minFilter=void 0!==a.minFilter?a.minFilter:THREE.LinearMipMapLinearFilter,g.anisotropy=void 0!==a.anisotropy?a.anisotropy:1,void 0!==a.format&&(g.format=a.format),void 0!==a.type&&(g.type=a.type),void 0!==a.mipmaps&&(g.mipmaps=a.mipmaps),1===a.mipmapCount&&(g.minFilter=THREE.LinearFilter),g.needsUpdate=!0,b&&b(g,a)},c,d);return g},setCrossOrigin:function(a){this.crossOrigin=a}};
	THREE.CompressedTextureLoader=function(a){this.manager=void 0!==a?a:THREE.DefaultLoadingManager;this._parser=null};
	THREE.CompressedTextureLoader.prototype={constructor:THREE.CompressedTextureLoader,load:function(a,b,c,d){var e=this,g=[],f=new THREE.CompressedTexture;f.image=g;var h=new THREE.XHRLoader(this.manager);h.setCrossOrigin(this.crossOrigin);h.setResponseType("arraybuffer");if(Array.isArray(a))for(var l=0,k=function(k){h.load(a[k],function(a){a=e._parser(a,!0);g[k]={width:a.width,height:a.height,format:a.format,mipmaps:a.mipmaps};l+=1;6===l&&(1===a.mipmapCount&&(f.minFilter=THREE.LinearFilter),f.format=
	a.format,f.needsUpdate=!0,b&&b(f))},c,d)},m=0,p=a.length;m<p;++m)k(m);else h.load(a,function(a){a=e._parser(a,!0);if(a.isCubemap)for(var c=a.mipmaps.length/a.mipmapCount,d=0;d<c;d++){g[d]={mipmaps:[]};for(var h=0;h<a.mipmapCount;h++)g[d].mipmaps.push(a.mipmaps[d*a.mipmapCount+h]),g[d].format=a.format,g[d].width=a.width,g[d].height=a.height}else f.image.width=a.width,f.image.height=a.height,f.mipmaps=a.mipmaps;1===a.mipmapCount&&(f.minFilter=THREE.LinearFilter);f.format=a.format;f.needsUpdate=!0;b&&
	b(f)},c,d);return f},setCrossOrigin:function(a){this.crossOrigin=a}};
	THREE.Material=function(){Object.defineProperty(this,"id",{value:THREE.MaterialIdCount++});this.uuid=THREE.Math.generateUUID();this.name="";this.type="Material";this.side=THREE.FrontSide;this.opacity=1;this.transparent=!1;this.blending=THREE.NormalBlending;this.blendSrc=THREE.SrcAlphaFactor;this.blendDst=THREE.OneMinusSrcAlphaFactor;this.blendEquation=THREE.AddEquation;this.blendEquationAlpha=this.blendDstAlpha=this.blendSrcAlpha=null;this.depthFunc=THREE.LessEqualDepth;this.colorWrite=this.depthWrite=
	this.depthTest=!0;this.precision=null;this.polygonOffset=!1;this.overdraw=this.alphaTest=this.polygonOffsetUnits=this.polygonOffsetFactor=0;this._needsUpdate=this.visible=!0};
	THREE.Material.prototype={constructor:THREE.Material,get needsUpdate(){return this._needsUpdate},set needsUpdate(a){!0===a&&this.update();this._needsUpdate=a},setValues:function(a){if(void 0!==a)for(var b in a){var c=a[b];if(void 0===c)console.warn("THREE.Material: '"+b+"' parameter is undefined.");else{var d=this[b];void 0===d?console.warn("THREE."+this.type+": '"+b+"' is not a property of this material."):d instanceof THREE.Color?d.set(c):d instanceof THREE.Vector3&&c instanceof THREE.Vector3?d.copy(c):
	this[b]="overdraw"===b?Number(c):c}}},toJSON:function(a){var b={metadata:{version:4.4,type:"Material",generator:"Material.toJSON"}};b.uuid=this.uuid;b.type=this.type;""!==this.name&&(b.name=this.name);this.color instanceof THREE.Color&&(b.color=this.color.getHex());this.emissive instanceof THREE.Color&&(b.emissive=this.emissive.getHex());this.specular instanceof THREE.Color&&(b.specular=this.specular.getHex());void 0!==this.shininess&&(b.shininess=this.shininess);this.map instanceof THREE.Texture&&
	(b.map=this.map.toJSON(a).uuid);this.alphaMap instanceof THREE.Texture&&(b.alphaMap=this.alphaMap.toJSON(a).uuid);this.lightMap instanceof THREE.Texture&&(b.lightMap=this.lightMap.toJSON(a).uuid);this.bumpMap instanceof THREE.Texture&&(b.bumpMap=this.bumpMap.toJSON(a).uuid,b.bumpScale=this.bumpScale);this.normalMap instanceof THREE.Texture&&(b.normalMap=this.normalMap.toJSON(a).uuid,b.normalScale=this.normalScale);this.displacementMap instanceof THREE.Texture&&(b.displacementMap=this.displacementMap.toJSON(a).uuid,
	b.displacementScale=this.displacementScale,b.displacementBias=this.displacementBias);this.specularMap instanceof THREE.Texture&&(b.specularMap=this.specularMap.toJSON(a).uuid);this.envMap instanceof THREE.Texture&&(b.envMap=this.envMap.toJSON(a).uuid,b.reflectivity=this.reflectivity);void 0!==this.size&&(b.size=this.size);void 0!==this.sizeAttenuation&&(b.sizeAttenuation=this.sizeAttenuation);void 0!==this.vertexColors&&this.vertexColors!==THREE.NoColors&&(b.vertexColors=this.vertexColors);void 0!==
	this.shading&&this.shading!==THREE.SmoothShading&&(b.shading=this.shading);void 0!==this.blending&&this.blending!==THREE.NormalBlending&&(b.blending=this.blending);void 0!==this.side&&this.side!==THREE.FrontSide&&(b.side=this.side);1>this.opacity&&(b.opacity=this.opacity);!0===this.transparent&&(b.transparent=this.transparent);0<this.alphaTest&&(b.alphaTest=this.alphaTest);!0===this.wireframe&&(b.wireframe=this.wireframe);1<this.wireframeLinewidth&&(b.wireframeLinewidth=this.wireframeLinewidth);return b},
	clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.name=a.name;this.side=a.side;this.opacity=a.opacity;this.transparent=a.transparent;this.blending=a.blending;this.blendSrc=a.blendSrc;this.blendDst=a.blendDst;this.blendEquation=a.blendEquation;this.blendSrcAlpha=a.blendSrcAlpha;this.blendDstAlpha=a.blendDstAlpha;this.blendEquationAlpha=a.blendEquationAlpha;this.depthFunc=a.depthFunc;this.depthTest=a.depthTest;this.depthWrite=a.depthWrite;this.precision=a.precision;this.polygonOffset=
	a.polygonOffset;this.polygonOffsetFactor=a.polygonOffsetFactor;this.polygonOffsetUnits=a.polygonOffsetUnits;this.alphaTest=a.alphaTest;this.overdraw=a.overdraw;this.visible=a.visible;return this},update:function(){this.dispatchEvent({type:"update"})},dispose:function(){this.dispatchEvent({type:"dispose"})},get wrapAround(){console.warn("THREE."+this.type+": .wrapAround has been removed.")},set wrapAround(a){console.warn("THREE."+this.type+": .wrapAround has been removed.")},get wrapRGB(){console.warn("THREE."+
	this.type+": .wrapRGB has been removed.");return new THREE.Color}};THREE.EventDispatcher.prototype.apply(THREE.Material.prototype);THREE.MaterialIdCount=0;THREE.LineBasicMaterial=function(a){THREE.Material.call(this);this.type="LineBasicMaterial";this.color=new THREE.Color(16777215);this.linewidth=1;this.linejoin=this.linecap="round";this.vertexColors=THREE.NoColors;this.fog=!0;this.setValues(a)};THREE.LineBasicMaterial.prototype=Object.create(THREE.Material.prototype);
	THREE.LineBasicMaterial.prototype.constructor=THREE.LineBasicMaterial;THREE.LineBasicMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.linewidth=a.linewidth;this.linecap=a.linecap;this.linejoin=a.linejoin;this.vertexColors=a.vertexColors;this.fog=a.fog;return this};
	THREE.LineDashedMaterial=function(a){THREE.Material.call(this);this.type="LineDashedMaterial";this.color=new THREE.Color(16777215);this.scale=this.linewidth=1;this.dashSize=3;this.gapSize=1;this.vertexColors=!1;this.fog=!0;this.setValues(a)};THREE.LineDashedMaterial.prototype=Object.create(THREE.Material.prototype);THREE.LineDashedMaterial.prototype.constructor=THREE.LineDashedMaterial;
	THREE.LineDashedMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.linewidth=a.linewidth;this.scale=a.scale;this.dashSize=a.dashSize;this.gapSize=a.gapSize;this.vertexColors=a.vertexColors;this.fog=a.fog;return this};
	THREE.MeshBasicMaterial=function(a){THREE.Material.call(this);this.type="MeshBasicMaterial";this.color=new THREE.Color(16777215);this.aoMap=this.map=null;this.aoMapIntensity=1;this.envMap=this.alphaMap=this.specularMap=null;this.combine=THREE.MultiplyOperation;this.reflectivity=1;this.refractionRatio=.98;this.fog=!0;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap="round";this.vertexColors=THREE.NoColors;this.morphTargets=this.skinning=
	!1;this.setValues(a)};THREE.MeshBasicMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshBasicMaterial.prototype.constructor=THREE.MeshBasicMaterial;
	THREE.MeshBasicMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.map=a.map;this.aoMap=a.aoMap;this.aoMapIntensity=a.aoMapIntensity;this.specularMap=a.specularMap;this.alphaMap=a.alphaMap;this.envMap=a.envMap;this.combine=a.combine;this.reflectivity=a.reflectivity;this.refractionRatio=a.refractionRatio;this.fog=a.fog;this.shading=a.shading;this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;this.wireframeLinecap=a.wireframeLinecap;
	this.wireframeLinejoin=a.wireframeLinejoin;this.vertexColors=a.vertexColors;this.skinning=a.skinning;this.morphTargets=a.morphTargets;return this};
	THREE.MeshLambertMaterial=function(a){THREE.Material.call(this);this.type="MeshLambertMaterial";this.color=new THREE.Color(16777215);this.emissive=new THREE.Color(0);this.envMap=this.alphaMap=this.specularMap=this.map=null;this.combine=THREE.MultiplyOperation;this.reflectivity=1;this.refractionRatio=.98;this.fog=!0;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap="round";this.vertexColors=THREE.NoColors;this.morphNormals=this.morphTargets=this.skinning=!1;this.setValues(a)};
	THREE.MeshLambertMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshLambertMaterial.prototype.constructor=THREE.MeshLambertMaterial;
	THREE.MeshLambertMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.emissive.copy(a.emissive);this.map=a.map;this.specularMap=a.specularMap;this.alphaMap=a.alphaMap;this.envMap=a.envMap;this.combine=a.combine;this.reflectivity=a.reflectivity;this.refractionRatio=a.refractionRatio;this.fog=a.fog;this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;this.wireframeLinecap=a.wireframeLinecap;this.wireframeLinejoin=a.wireframeLinejoin;
	this.vertexColors=a.vertexColors;this.skinning=a.skinning;this.morphTargets=a.morphTargets;this.morphNormals=a.morphNormals;return this};
	THREE.MeshPhongMaterial=function(a){THREE.Material.call(this);this.type="MeshPhongMaterial";this.color=new THREE.Color(16777215);this.emissive=new THREE.Color(0);this.specular=new THREE.Color(1118481);this.shininess=30;this.metal=!1;this.lightMap=this.map=null;this.lightMapIntensity=1;this.aoMap=null;this.aoMapIntensity=1;this.bumpMap=this.emissiveMap=null;this.bumpScale=1;this.normalMap=null;this.normalScale=new THREE.Vector2(1,1);this.displacementMap=null;this.displacementScale=1;this.displacementBias=
	0;this.envMap=this.alphaMap=this.specularMap=null;this.combine=THREE.MultiplyOperation;this.reflectivity=1;this.refractionRatio=.98;this.fog=!0;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap="round";this.vertexColors=THREE.NoColors;this.morphNormals=this.morphTargets=this.skinning=!1;this.setValues(a)};THREE.MeshPhongMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshPhongMaterial.prototype.constructor=THREE.MeshPhongMaterial;
	THREE.MeshPhongMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.emissive.copy(a.emissive);this.specular.copy(a.specular);this.shininess=a.shininess;this.metal=a.metal;this.map=a.map;this.lightMap=a.lightMap;this.lightMapIntensity=a.lightMapIntensity;this.aoMap=a.aoMap;this.aoMapIntensity=a.aoMapIntensity;this.emissiveMap=a.emissiveMap;this.bumpMap=a.bumpMap;this.bumpScale=a.bumpScale;this.normalMap=a.normalMap;this.normalScale.copy(a.normalScale);
	this.displacementMap=a.displacementMap;this.displacementScale=a.displacementScale;this.displacementBias=a.displacementBias;this.specularMap=a.specularMap;this.alphaMap=a.alphaMap;this.envMap=a.envMap;this.combine=a.combine;this.reflectivity=a.reflectivity;this.refractionRatio=a.refractionRatio;this.fog=a.fog;this.shading=a.shading;this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;this.wireframeLinecap=a.wireframeLinecap;this.wireframeLinejoin=a.wireframeLinejoin;this.vertexColors=
	a.vertexColors;this.skinning=a.skinning;this.morphTargets=a.morphTargets;this.morphNormals=a.morphNormals;return this};THREE.MeshDepthMaterial=function(a){THREE.Material.call(this);this.type="MeshDepthMaterial";this.wireframe=this.morphTargets=!1;this.wireframeLinewidth=1;this.setValues(a)};THREE.MeshDepthMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshDepthMaterial.prototype.constructor=THREE.MeshDepthMaterial;
	THREE.MeshDepthMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;return this};THREE.MeshNormalMaterial=function(a){THREE.Material.call(this,a);this.type="MeshNormalMaterial";this.wireframe=!1;this.wireframeLinewidth=1;this.morphTargets=!1;this.setValues(a)};THREE.MeshNormalMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshNormalMaterial.prototype.constructor=THREE.MeshNormalMaterial;
	THREE.MeshNormalMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;return this};THREE.MultiMaterial=function(a){this.uuid=THREE.Math.generateUUID();this.type="MultiMaterial";this.materials=a instanceof Array?a:[];this.visible=!0};
	THREE.MultiMaterial.prototype={constructor:THREE.MultiMaterial,toJSON:function(){for(var a={metadata:{version:4.2,type:"material",generator:"MaterialExporter"},uuid:this.uuid,type:this.type,materials:[]},b=0,c=this.materials.length;b<c;b++)a.materials.push(this.materials[b].toJSON());a.visible=this.visible;return a},clone:function(){for(var a=new this.constructor,b=0;b<this.materials.length;b++)a.materials.push(this.materials[b].clone());a.visible=this.visible;return a}};THREE.MeshFaceMaterial=THREE.MultiMaterial;
	THREE.PointsMaterial=function(a){THREE.Material.call(this);this.type="PointsMaterial";this.color=new THREE.Color(16777215);this.map=null;this.size=1;this.sizeAttenuation=!0;this.vertexColors=THREE.NoColors;this.fog=!0;this.setValues(a)};THREE.PointsMaterial.prototype=Object.create(THREE.Material.prototype);THREE.PointsMaterial.prototype.constructor=THREE.PointsMaterial;
	THREE.PointsMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.map=a.map;this.size=a.size;this.sizeAttenuation=a.sizeAttenuation;this.vertexColors=a.vertexColors;this.fog=a.fog;return this};THREE.PointCloudMaterial=function(a){console.warn("THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.");return new THREE.PointsMaterial(a)};
	THREE.ParticleBasicMaterial=function(a){console.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.");return new THREE.PointsMaterial(a)};THREE.ParticleSystemMaterial=function(a){console.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.");return new THREE.PointsMaterial(a)};
	THREE.ShaderMaterial=function(a){THREE.Material.call(this);this.type="ShaderMaterial";this.defines={};this.uniforms={};this.vertexShader="void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";this.fragmentShader="void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}";this.shading=THREE.SmoothShading;this.linewidth=1;this.wireframe=!1;this.wireframeLinewidth=1;this.lights=this.fog=!1;this.vertexColors=THREE.NoColors;this.derivatives=this.morphNormals=
	this.morphTargets=this.skinning=!1;this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]};this.index0AttributeName=void 0;void 0!==a&&(void 0!==a.attributes&&console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."),this.setValues(a))};THREE.ShaderMaterial.prototype=Object.create(THREE.Material.prototype);THREE.ShaderMaterial.prototype.constructor=THREE.ShaderMaterial;
	THREE.ShaderMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.fragmentShader=a.fragmentShader;this.vertexShader=a.vertexShader;this.uniforms=THREE.UniformsUtils.clone(a.uniforms);this.attributes=a.attributes;this.defines=a.defines;this.shading=a.shading;this.wireframe=a.wireframe;this.wireframeLinewidth=a.wireframeLinewidth;this.fog=a.fog;this.lights=a.lights;this.vertexColors=a.vertexColors;this.skinning=a.skinning;this.morphTargets=a.morphTargets;this.morphNormals=
	a.morphNormals;this.derivatives=a.derivatives;return this};THREE.ShaderMaterial.prototype.toJSON=function(a){a=THREE.Material.prototype.toJSON.call(this,a);a.uniforms=this.uniforms;a.attributes=this.attributes;a.vertexShader=this.vertexShader;a.fragmentShader=this.fragmentShader;return a};THREE.RawShaderMaterial=function(a){THREE.ShaderMaterial.call(this,a);this.type="RawShaderMaterial"};THREE.RawShaderMaterial.prototype=Object.create(THREE.ShaderMaterial.prototype);
	THREE.RawShaderMaterial.prototype.constructor=THREE.RawShaderMaterial;THREE.SpriteMaterial=function(a){THREE.Material.call(this);this.type="SpriteMaterial";this.color=new THREE.Color(16777215);this.map=null;this.rotation=0;this.fog=!1;this.setValues(a)};THREE.SpriteMaterial.prototype=Object.create(THREE.Material.prototype);THREE.SpriteMaterial.prototype.constructor=THREE.SpriteMaterial;
	THREE.SpriteMaterial.prototype.copy=function(a){THREE.Material.prototype.copy.call(this,a);this.color.copy(a.color);this.map=a.map;this.rotation=a.rotation;this.fog=a.fog;return this};
	THREE.Texture=function(a,b,c,d,e,g,f,h,l){Object.defineProperty(this,"id",{value:THREE.TextureIdCount++});this.uuid=THREE.Math.generateUUID();this.sourceFile=this.name="";this.image=void 0!==a?a:THREE.Texture.DEFAULT_IMAGE;this.mipmaps=[];this.mapping=void 0!==b?b:THREE.Texture.DEFAULT_MAPPING;this.wrapS=void 0!==c?c:THREE.ClampToEdgeWrapping;this.wrapT=void 0!==d?d:THREE.ClampToEdgeWrapping;this.magFilter=void 0!==e?e:THREE.LinearFilter;this.minFilter=void 0!==g?g:THREE.LinearMipMapLinearFilter;
	this.anisotropy=void 0!==l?l:1;this.format=void 0!==f?f:THREE.RGBAFormat;this.type=void 0!==h?h:THREE.UnsignedByteType;this.offset=new THREE.Vector2(0,0);this.repeat=new THREE.Vector2(1,1);this.generateMipmaps=!0;this.premultiplyAlpha=!1;this.flipY=!0;this.unpackAlignment=4;this.version=0;this.onUpdate=null};THREE.Texture.DEFAULT_IMAGE=void 0;THREE.Texture.DEFAULT_MAPPING=THREE.UVMapping;
	THREE.Texture.prototype={constructor:THREE.Texture,set needsUpdate(a){!0===a&&this.version++},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.image=a.image;this.mipmaps=a.mipmaps.slice(0);this.mapping=a.mapping;this.wrapS=a.wrapS;this.wrapT=a.wrapT;this.magFilter=a.magFilter;this.minFilter=a.minFilter;this.anisotropy=a.anisotropy;this.format=a.format;this.type=a.type;this.offset.copy(a.offset);this.repeat.copy(a.repeat);this.generateMipmaps=a.generateMipmaps;this.premultiplyAlpha=
	a.premultiplyAlpha;this.flipY=a.flipY;this.unpackAlignment=a.unpackAlignment;return this},toJSON:function(a){if(void 0!==a.textures[this.uuid])return a.textures[this.uuid];var b={metadata:{version:4.4,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],wrap:[this.wrapS,this.wrapT],minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy};if(void 0!==this.image){var c=
	this.image;void 0===c.uuid&&(c.uuid=THREE.Math.generateUUID());if(void 0===a.images[c.uuid]){var d=a.images,e=c.uuid,g=c.uuid,f;void 0!==c.toDataURL?f=c:(f=document.createElement("canvas"),f.width=c.width,f.height=c.height,f.getContext("2d").drawImage(c,0,0,c.width,c.height));f=2048<f.width||2048<f.height?f.toDataURL("image/jpeg",.6):f.toDataURL("image/png");d[e]={uuid:g,url:f}}b.image=c.uuid}return a.textures[this.uuid]=b},dispose:function(){this.dispatchEvent({type:"dispose"})},transformUv:function(a){if(this.mapping===
	THREE.UVMapping){a.multiply(this.repeat);a.add(this.offset);if(0>a.x||1<a.x)switch(this.wrapS){case THREE.RepeatWrapping:a.x-=Math.floor(a.x);break;case THREE.ClampToEdgeWrapping:a.x=0>a.x?0:1;break;case THREE.MirroredRepeatWrapping:1===Math.abs(Math.floor(a.x)%2)?a.x=Math.ceil(a.x)-a.x:a.x-=Math.floor(a.x)}if(0>a.y||1<a.y)switch(this.wrapT){case THREE.RepeatWrapping:a.y-=Math.floor(a.y);break;case THREE.ClampToEdgeWrapping:a.y=0>a.y?0:1;break;case THREE.MirroredRepeatWrapping:1===Math.abs(Math.floor(a.y)%
	2)?a.y=Math.ceil(a.y)-a.y:a.y-=Math.floor(a.y)}this.flipY&&(a.y=1-a.y)}}};THREE.EventDispatcher.prototype.apply(THREE.Texture.prototype);THREE.TextureIdCount=0;THREE.CanvasTexture=function(a,b,c,d,e,g,f,h,l){THREE.Texture.call(this,a,b,c,d,e,g,f,h,l);this.needsUpdate=!0};THREE.CanvasTexture.prototype=Object.create(THREE.Texture.prototype);THREE.CanvasTexture.prototype.constructor=THREE.CanvasTexture;
	THREE.CubeTexture=function(a,b,c,d,e,g,f,h,l){b=void 0!==b?b:THREE.CubeReflectionMapping;THREE.Texture.call(this,a,b,c,d,e,g,f,h,l);this.images=a;this.flipY=!1};THREE.CubeTexture.prototype=Object.create(THREE.Texture.prototype);THREE.CubeTexture.prototype.constructor=THREE.CubeTexture;THREE.CubeTexture.prototype.copy=function(a){THREE.Texture.prototype.copy.call(this,a);this.images=a.images;return this};
	THREE.CompressedTexture=function(a,b,c,d,e,g,f,h,l,k,m){THREE.Texture.call(this,null,g,f,h,l,k,d,e,m);this.image={width:b,height:c};this.mipmaps=a;this.generateMipmaps=this.flipY=!1};THREE.CompressedTexture.prototype=Object.create(THREE.Texture.prototype);THREE.CompressedTexture.prototype.constructor=THREE.CompressedTexture;
	THREE.DataTexture=function(a,b,c,d,e,g,f,h,l,k,m){THREE.Texture.call(this,null,g,f,h,l,k,d,e,m);this.image={data:a,width:b,height:c};this.magFilter=void 0!==l?l:THREE.NearestFilter;this.minFilter=void 0!==k?k:THREE.NearestFilter;this.generateMipmaps=this.flipY=!1};THREE.DataTexture.prototype=Object.create(THREE.Texture.prototype);THREE.DataTexture.prototype.constructor=THREE.DataTexture;
	THREE.VideoTexture=function(a,b,c,d,e,g,f,h,l){function k(){requestAnimationFrame(k);a.readyState===a.HAVE_ENOUGH_DATA&&(m.needsUpdate=!0)}THREE.Texture.call(this,a,b,c,d,e,g,f,h,l);this.generateMipmaps=!1;var m=this;k()};THREE.VideoTexture.prototype=Object.create(THREE.Texture.prototype);THREE.VideoTexture.prototype.constructor=THREE.VideoTexture;THREE.Group=function(){THREE.Object3D.call(this);this.type="Group"};THREE.Group.prototype=Object.create(THREE.Object3D.prototype);
	THREE.Group.prototype.constructor=THREE.Group;THREE.Points=function(a,b){THREE.Object3D.call(this);this.type="Points";this.geometry=void 0!==a?a:new THREE.Geometry;this.material=void 0!==b?b:new THREE.PointsMaterial({color:16777215*Math.random()})};THREE.Points.prototype=Object.create(THREE.Object3D.prototype);THREE.Points.prototype.constructor=THREE.Points;
	THREE.Points.prototype.raycast=function(){var a=new THREE.Matrix4,b=new THREE.Ray;return function(c,d){function e(a,e){var f=b.distanceSqToPoint(a);if(f<l){var h=b.closestPointToPoint(a);h.applyMatrix4(g.matrixWorld);var k=c.ray.origin.distanceTo(h);k<c.near||k>c.far||d.push({distance:k,distanceToRay:Math.sqrt(f),point:h.clone(),index:e,face:null,object:g})}}var g=this,f=g.geometry,h=c.params.Points.threshold;a.getInverse(this.matrixWorld);b.copy(c.ray).applyMatrix4(a);if(null===f.boundingBox||!1!==
	b.isIntersectionBox(f.boundingBox)){var h=h/((this.scale.x+this.scale.y+this.scale.z)/3),l=h*h,h=new THREE.Vector3;if(f instanceof THREE.BufferGeometry){var k=f.index,f=f.attributes.position.array;if(null!==k)for(var m=k.array,k=0,p=m.length;k<p;k++){var n=m[k];h.fromArray(f,3*n);e(h,n)}else for(k=0,m=f.length/3;k<m;k++)h.fromArray(f,3*k),e(h,k)}else for(h=f.vertices,k=0,m=h.length;k<m;k++)e(h[k],k)}}}();THREE.Points.prototype.clone=function(){return(new this.constructor(this.geometry,this.material)).copy(this)};
	THREE.PointCloud=function(a,b){console.warn("THREE.PointCloud has been renamed to THREE.Points.");return new THREE.Points(a,b)};THREE.ParticleSystem=function(a,b){console.warn("THREE.ParticleSystem has been renamed to THREE.Points.");return new THREE.Points(a,b)};
	THREE.Line=function(a,b,c){if(1===c)return console.warn("THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead."),new THREE.LineSegments(a,b);THREE.Object3D.call(this);this.type="Line";this.geometry=void 0!==a?a:new THREE.Geometry;this.material=void 0!==b?b:new THREE.LineBasicMaterial({color:16777215*Math.random()})};THREE.Line.prototype=Object.create(THREE.Object3D.prototype);THREE.Line.prototype.constructor=THREE.Line;
	THREE.Line.prototype.raycast=function(){var a=new THREE.Matrix4,b=new THREE.Ray,c=new THREE.Sphere;return function(d,e){var g=d.linePrecision,g=g*g,f=this.geometry;null===f.boundingSphere&&f.computeBoundingSphere();c.copy(f.boundingSphere);c.applyMatrix4(this.matrixWorld);if(!1!==d.ray.isIntersectionSphere(c)){a.getInverse(this.matrixWorld);b.copy(d.ray).applyMatrix4(a);var h=new THREE.Vector3,l=new THREE.Vector3,k=new THREE.Vector3,m=new THREE.Vector3,p=this instanceof THREE.LineSegments?2:1;if(f instanceof
	THREE.BufferGeometry){var n=f.index,q=f.attributes;if(null!==n)for(var f=n.array,q=q.position.array,n=0,s=f.length-1;n<s;n+=p){var t=f[n+1];h.fromArray(q,3*f[n]);l.fromArray(q,3*t);t=b.distanceSqToSegment(h,l,m,k);t>g||(m.applyMatrix4(this.matrixWorld),t=d.ray.origin.distanceTo(m),t<d.near||t>d.far||e.push({distance:t,point:k.clone().applyMatrix4(this.matrixWorld),index:n,face:null,faceIndex:null,object:this}))}else for(q=q.position.array,n=0,s=q.length/3-1;n<s;n+=p)h.fromArray(q,3*n),l.fromArray(q,
	3*n+3),t=b.distanceSqToSegment(h,l,m,k),t>g||(m.applyMatrix4(this.matrixWorld),t=d.ray.origin.distanceTo(m),t<d.near||t>d.far||e.push({distance:t,point:k.clone().applyMatrix4(this.matrixWorld),index:n,face:null,faceIndex:null,object:this}))}else if(f instanceof THREE.Geometry)for(h=f.vertices,l=h.length,n=0;n<l-1;n+=p)t=b.distanceSqToSegment(h[n],h[n+1],m,k),t>g||(m.applyMatrix4(this.matrixWorld),t=d.ray.origin.distanceTo(m),t<d.near||t>d.far||e.push({distance:t,point:k.clone().applyMatrix4(this.matrixWorld),
	index:n,face:null,faceIndex:null,object:this}))}}}();THREE.Line.prototype.clone=function(){return(new this.constructor(this.geometry,this.material)).copy(this)};THREE.LineStrip=0;THREE.LinePieces=1;THREE.LineSegments=function(a,b){THREE.Line.call(this,a,b);this.type="LineSegments"};THREE.LineSegments.prototype=Object.create(THREE.Line.prototype);THREE.LineSegments.prototype.constructor=THREE.LineSegments;
	THREE.Mesh=function(a,b){THREE.Object3D.call(this);this.type="Mesh";this.geometry=void 0!==a?a:new THREE.Geometry;this.material=void 0!==b?b:new THREE.MeshBasicMaterial({color:16777215*Math.random()});this.updateMorphTargets()};THREE.Mesh.prototype=Object.create(THREE.Object3D.prototype);THREE.Mesh.prototype.constructor=THREE.Mesh;
	THREE.Mesh.prototype.updateMorphTargets=function(){if(void 0!==this.geometry.morphTargets&&0<this.geometry.morphTargets.length){this.morphTargetBase=-1;this.morphTargetInfluences=[];this.morphTargetDictionary={};for(var a=0,b=this.geometry.morphTargets.length;a<b;a++)this.morphTargetInfluences.push(0),this.morphTargetDictionary[this.geometry.morphTargets[a].name]=a}};
	THREE.Mesh.prototype.getMorphTargetIndexByName=function(a){if(void 0!==this.morphTargetDictionary[a])return this.morphTargetDictionary[a];console.warn("THREE.Mesh.getMorphTargetIndexByName: morph target "+a+" does not exist. Returning 0.");return 0};
	THREE.Mesh.prototype.raycast=function(){function a(a,b,c,d,e,f,g){THREE.Triangle.barycoordFromPoint(a,b,c,d,t);e.multiplyScalar(t.x);f.multiplyScalar(t.y);g.multiplyScalar(t.z);e.add(f).add(g);return e.clone()}function b(a,b,c,d,e,f,g){var h=a.material;if(null===(h.side===THREE.BackSide?c.intersectTriangle(f,e,d,!0,g):c.intersectTriangle(d,e,f,h.side!==THREE.DoubleSide,g)))return null;u.copy(g);u.applyMatrix4(a.matrixWorld);c=b.ray.origin.distanceTo(u);return c<b.near||c>b.far?null:{distance:c,point:u.clone(),
	object:a}}function c(c,d,e,g,k,m,p,u){f.fromArray(g,3*m);h.fromArray(g,3*p);l.fromArray(g,3*u);if(c=b(c,d,e,f,h,l,v))k&&(n.fromArray(k,2*m),q.fromArray(k,2*p),s.fromArray(k,2*u),c.uv=a(v,f,h,l,n,q,s)),c.face=new THREE.Face3(m,p,u,THREE.Triangle.normal(f,h,l)),c.faceIndex=m;return c}var d=new THREE.Matrix4,e=new THREE.Ray,g=new THREE.Sphere,f=new THREE.Vector3,h=new THREE.Vector3,l=new THREE.Vector3,k=new THREE.Vector3,m=new THREE.Vector3,p=new THREE.Vector3,n=new THREE.Vector2,q=new THREE.Vector2,
	s=new THREE.Vector2,t=new THREE.Vector3,v=new THREE.Vector3,u=new THREE.Vector3;return function(u,t){var x=this.geometry,B=this.material;if(void 0!==B){null===x.boundingSphere&&x.computeBoundingSphere();var y=this.matrixWorld;g.copy(x.boundingSphere);g.applyMatrix4(y);if(!1!==u.ray.isIntersectionSphere(g)&&(d.getInverse(y),e.copy(u.ray).applyMatrix4(d),null===x.boundingBox||!1!==e.isIntersectionBox(x.boundingBox))){var z,A;if(x instanceof THREE.BufferGeometry){var J,F,B=x.index,y=x.attributes,x=y.position.array;
	void 0!==y.uv&&(z=y.uv.array);if(null!==B)for(var y=B.array,C=0,N=y.length;C<N;C+=3){if(B=y[C],J=y[C+1],F=y[C+2],A=c(this,u,e,x,z,B,J,F))A.faceIndex=Math.floor(C/3),t.push(A)}else for(C=0,N=x.length;C<N;C+=9)if(B=C/3,J=B+1,F=B+2,A=c(this,u,e,x,z,B,J,F))A.index=B,t.push(A)}else if(x instanceof THREE.Geometry){var L,Q,y=B instanceof THREE.MeshFaceMaterial,C=!0===y?B.materials:null,N=x.vertices;J=x.faces;F=x.faceVertexUvs[0];0<F.length&&(z=F);for(var M=0,K=J.length;M<K;M++){var E=J[M];A=!0===y?C[E.materialIndex]:
	B;if(void 0!==A){F=N[E.a];L=N[E.b];Q=N[E.c];if(!0===A.morphTargets){A=x.morphTargets;var O=this.morphTargetInfluences;f.set(0,0,0);h.set(0,0,0);l.set(0,0,0);for(var T=0,H=A.length;T<H;T++){var R=O[T];if(0!==R){var G=A[T].vertices;f.addScaledVector(k.subVectors(G[E.a],F),R);h.addScaledVector(m.subVectors(G[E.b],L),R);l.addScaledVector(p.subVectors(G[E.c],Q),R)}}f.add(F);h.add(L);l.add(Q);F=f;L=h;Q=l}if(A=b(this,u,e,F,L,Q,v))z&&(O=z[M],n.copy(O[0]),q.copy(O[1]),s.copy(O[2]),A.uv=a(v,F,L,Q,n,q,s)),A.face=
	E,A.faceIndex=M,t.push(A)}}}}}}}();THREE.Mesh.prototype.clone=function(){return(new this.constructor(this.geometry,this.material)).copy(this)};THREE.Bone=function(a){THREE.Object3D.call(this);this.type="Bone";this.skin=a};THREE.Bone.prototype=Object.create(THREE.Object3D.prototype);THREE.Bone.prototype.constructor=THREE.Bone;THREE.Bone.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a);this.skin=a.skin;return this};
	THREE.Skeleton=function(a,b,c){this.useVertexTexture=void 0!==c?c:!0;this.identityMatrix=new THREE.Matrix4;a=a||[];this.bones=a.slice(0);this.useVertexTexture?(a=Math.sqrt(4*this.bones.length),a=THREE.Math.nextPowerOfTwo(Math.ceil(a)),this.boneTextureHeight=this.boneTextureWidth=a=Math.max(a,4),this.boneMatrices=new Float32Array(this.boneTextureWidth*this.boneTextureHeight*4),this.boneTexture=new THREE.DataTexture(this.boneMatrices,this.boneTextureWidth,this.boneTextureHeight,THREE.RGBAFormat,THREE.FloatType)):
	this.boneMatrices=new Float32Array(16*this.bones.length);if(void 0===b)this.calculateInverses();else if(this.bones.length===b.length)this.boneInverses=b.slice(0);else for(console.warn("THREE.Skeleton bonInverses is the wrong length."),this.boneInverses=[],b=0,a=this.bones.length;b<a;b++)this.boneInverses.push(new THREE.Matrix4)};
	THREE.Skeleton.prototype.calculateInverses=function(){this.boneInverses=[];for(var a=0,b=this.bones.length;a<b;a++){var c=new THREE.Matrix4;this.bones[a]&&c.getInverse(this.bones[a].matrixWorld);this.boneInverses.push(c)}};
	THREE.Skeleton.prototype.pose=function(){for(var a,b=0,c=this.bones.length;b<c;b++)(a=this.bones[b])&&a.matrixWorld.getInverse(this.boneInverses[b]);b=0;for(c=this.bones.length;b<c;b++)if(a=this.bones[b])a.parent?(a.matrix.getInverse(a.parent.matrixWorld),a.matrix.multiply(a.matrixWorld)):a.matrix.copy(a.matrixWorld),a.matrix.decompose(a.position,a.quaternion,a.scale)};
	THREE.Skeleton.prototype.update=function(){var a=new THREE.Matrix4;return function(){for(var b=0,c=this.bones.length;b<c;b++)a.multiplyMatrices(this.bones[b]?this.bones[b].matrixWorld:this.identityMatrix,this.boneInverses[b]),a.flattenToArrayOffset(this.boneMatrices,16*b);this.useVertexTexture&&(this.boneTexture.needsUpdate=!0)}}();THREE.Skeleton.prototype.clone=function(){return new THREE.Skeleton(this.bones,this.boneInverses,this.useVertexTexture)};
	THREE.SkinnedMesh=function(a,b,c){THREE.Mesh.call(this,a,b);this.type="SkinnedMesh";this.bindMode="attached";this.bindMatrix=new THREE.Matrix4;this.bindMatrixInverse=new THREE.Matrix4;a=[];if(this.geometry&&void 0!==this.geometry.bones){for(var d,e=0,g=this.geometry.bones.length;e<g;++e)d=this.geometry.bones[e],b=new THREE.Bone(this),a.push(b),b.name=d.name,b.position.fromArray(d.pos),b.quaternion.fromArray(d.rotq),void 0!==d.scl&&b.scale.fromArray(d.scl);e=0;for(g=this.geometry.bones.length;e<g;++e)d=
	this.geometry.bones[e],-1!==d.parent&&null!==d.parent?a[d.parent].add(a[e]):this.add(a[e])}this.normalizeSkinWeights();this.updateMatrixWorld(!0);this.bind(new THREE.Skeleton(a,void 0,c),this.matrixWorld)};THREE.SkinnedMesh.prototype=Object.create(THREE.Mesh.prototype);THREE.SkinnedMesh.prototype.constructor=THREE.SkinnedMesh;
	THREE.SkinnedMesh.prototype.bind=function(a,b){this.skeleton=a;void 0===b&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),b=this.matrixWorld);this.bindMatrix.copy(b);this.bindMatrixInverse.getInverse(b)};THREE.SkinnedMesh.prototype.pose=function(){this.skeleton.pose()};
	THREE.SkinnedMesh.prototype.normalizeSkinWeights=function(){if(this.geometry instanceof THREE.Geometry)for(var a=0;a<this.geometry.skinIndices.length;a++){var b=this.geometry.skinWeights[a],c=1/b.lengthManhattan();Infinity!==c?b.multiplyScalar(c):b.set(1)}};
	THREE.SkinnedMesh.prototype.updateMatrixWorld=function(a){THREE.Mesh.prototype.updateMatrixWorld.call(this,!0);"attached"===this.bindMode?this.bindMatrixInverse.getInverse(this.matrixWorld):"detached"===this.bindMode?this.bindMatrixInverse.getInverse(this.bindMatrix):console.warn("THREE.SkinnedMesh unrecognized bindMode: "+this.bindMode)};THREE.SkinnedMesh.prototype.clone=function(){return(new this.constructor(this.geometry,this.material,this.useVertexTexture)).copy(this)};
	THREE.LOD=function(){THREE.Object3D.call(this);this.type="LOD";Object.defineProperties(this,{levels:{enumerable:!0,value:[]},objects:{get:function(){console.warn("THREE.LOD: .objects has been renamed to .levels.");return this.levels}}})};THREE.LOD.prototype=Object.create(THREE.Object3D.prototype);THREE.LOD.prototype.constructor=THREE.LOD;
	THREE.LOD.prototype.addLevel=function(a,b){void 0===b&&(b=0);b=Math.abs(b);for(var c=this.levels,d=0;d<c.length&&!(b<c[d].distance);d++);c.splice(d,0,{distance:b,object:a});this.add(a)};THREE.LOD.prototype.getObjectForDistance=function(a){for(var b=this.levels,c=1,d=b.length;c<d&&!(a<b[c].distance);c++);return b[c-1].object};
	THREE.LOD.prototype.raycast=function(){var a=new THREE.Vector3;return function(b,c){a.setFromMatrixPosition(this.matrixWorld);var d=b.ray.origin.distanceTo(a);this.getObjectForDistance(d).raycast(b,c)}}();
	THREE.LOD.prototype.update=function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(c){var d=this.levels;if(1<d.length){a.setFromMatrixPosition(c.matrixWorld);b.setFromMatrixPosition(this.matrixWorld);c=a.distanceTo(b);d[0].object.visible=!0;for(var e=1,g=d.length;e<g;e++)if(c>=d[e].distance)d[e-1].object.visible=!1,d[e].object.visible=!0;else break;for(;e<g;e++)d[e].object.visible=!1}}}();
	THREE.LOD.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a,!1);a=a.levels;for(var b=0,c=a.length;b<c;b++){var d=a[b];this.addLevel(d.object.clone(),d.distance)}return this};THREE.LOD.prototype.toJSON=function(a){a=THREE.Object3D.prototype.toJSON.call(this,a);a.object.levels=[];for(var b=this.levels,c=0,d=b.length;c<d;c++){var e=b[c];a.object.levels.push({object:e.object.uuid,distance:e.distance})}return a};
	THREE.Sprite=function(){var a=new Uint16Array([0,1,2,0,2,3]),b=new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),c=new Float32Array([0,0,1,0,1,1,0,1]),d=new THREE.BufferGeometry;d.setIndex(new THREE.BufferAttribute(a,1));d.addAttribute("position",new THREE.BufferAttribute(b,3));d.addAttribute("uv",new THREE.BufferAttribute(c,2));return function(a){THREE.Object3D.call(this);this.type="Sprite";this.geometry=d;this.material=void 0!==a?a:new THREE.SpriteMaterial}}();THREE.Sprite.prototype=Object.create(THREE.Object3D.prototype);
	THREE.Sprite.prototype.constructor=THREE.Sprite;THREE.Sprite.prototype.raycast=function(){var a=new THREE.Vector3;return function(b,c){a.setFromMatrixPosition(this.matrixWorld);var d=b.ray.distanceSqToPoint(a);d>this.scale.x*this.scale.y||c.push({distance:Math.sqrt(d),point:this.position,face:null,object:this})}}();THREE.Sprite.prototype.clone=function(){return(new this.constructor(this.material)).copy(this)};THREE.Particle=THREE.Sprite;
	THREE.LensFlare=function(a,b,c,d,e){THREE.Object3D.call(this);this.lensFlares=[];this.positionScreen=new THREE.Vector3;this.customUpdateCallback=void 0;void 0!==a&&this.add(a,b,c,d,e)};THREE.LensFlare.prototype=Object.create(THREE.Object3D.prototype);THREE.LensFlare.prototype.constructor=THREE.LensFlare;
	THREE.LensFlare.prototype.add=function(a,b,c,d,e,g){void 0===b&&(b=-1);void 0===c&&(c=0);void 0===g&&(g=1);void 0===e&&(e=new THREE.Color(16777215));void 0===d&&(d=THREE.NormalBlending);c=Math.min(c,Math.max(0,c));this.lensFlares.push({texture:a,size:b,distance:c,x:0,y:0,z:0,scale:1,rotation:0,opacity:g,color:e,blending:d})};
	THREE.LensFlare.prototype.updateLensFlares=function(){var a,b=this.lensFlares.length,c,d=2*-this.positionScreen.x,e=2*-this.positionScreen.y;for(a=0;a<b;a++)c=this.lensFlares[a],c.x=this.positionScreen.x+d*c.distance,c.y=this.positionScreen.y+e*c.distance,c.wantedRotation=c.x*Math.PI*.25,c.rotation+=.25*(c.wantedRotation-c.rotation)};
	THREE.LensFlare.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a);this.positionScreen.copy(a.positionScreen);this.customUpdateCallback=a.customUpdateCallback;for(var b=0,c=a.lensFlares.length;b<c;b++)this.lensFlares.push(a.lensFlares[b]);return this};THREE.Scene=function(){THREE.Object3D.call(this);this.type="Scene";this.overrideMaterial=this.fog=null;this.autoUpdate=!0};THREE.Scene.prototype=Object.create(THREE.Object3D.prototype);THREE.Scene.prototype.constructor=THREE.Scene;
	THREE.Scene.prototype.copy=function(a){THREE.Object3D.prototype.copy.call(this,a);null!==a.fog&&(this.fog=a.fog.clone());null!==a.overrideMaterial&&(this.overrideMaterial=a.overrideMaterial.clone());this.autoUpdate=a.autoUpdate;this.matrixAutoUpdate=a.matrixAutoUpdate;return this};THREE.Fog=function(a,b,c){this.name="";this.color=new THREE.Color(a);this.near=void 0!==b?b:1;this.far=void 0!==c?c:1E3};THREE.Fog.prototype.clone=function(){return new THREE.Fog(this.color.getHex(),this.near,this.far)};
	THREE.FogExp2=function(a,b){this.name="";this.color=new THREE.Color(a);this.density=void 0!==b?b:2.5E-4};THREE.FogExp2.prototype.clone=function(){return new THREE.FogExp2(this.color.getHex(),this.density)};THREE.ShaderChunk={};THREE.ShaderChunk.alphamap_fragment="#ifdef USE_ALPHAMAP\n\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n\n#endif\n";THREE.ShaderChunk.alphamap_pars_fragment="#ifdef USE_ALPHAMAP\n\n\tuniform sampler2D alphaMap;\n\n#endif\n";THREE.ShaderChunk.alphatest_fragment="#ifdef ALPHATEST\n\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n\n#endif\n";
	THREE.ShaderChunk.aomap_fragment="#ifdef USE_AOMAP\n\n\ttotalAmbientLight *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\n#endif\n";THREE.ShaderChunk.aomap_pars_fragment="#ifdef USE_AOMAP\n\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n\n#endif";THREE.ShaderChunk.begin_vertex="\nvec3 transformed = vec3( position );\n";THREE.ShaderChunk.beginnormal_vertex="\nvec3 objectNormal = vec3( normal );\n";THREE.ShaderChunk.bumpmap_pars_fragment="#ifdef USE_BUMPMAP\n\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\n\n\n\tvec2 dHdxy_fwd() {\n\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\n\t\treturn vec2( dBx, dBy );\n\n\t}\n\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\n\t\tvec3 vSigmaX = dFdx( surf_pos );\n\t\tvec3 vSigmaY = dFdy( surf_pos );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\n\t}\n\n#endif\n";
	THREE.ShaderChunk.color_fragment="#ifdef USE_COLOR\n\n\tdiffuseColor.rgb *= vColor;\n\n#endif";THREE.ShaderChunk.color_pars_fragment="#ifdef USE_COLOR\n\n\tvarying vec3 vColor;\n\n#endif\n";THREE.ShaderChunk.color_pars_vertex="#ifdef USE_COLOR\n\n\tvarying vec3 vColor;\n\n#endif";THREE.ShaderChunk.color_vertex="#ifdef USE_COLOR\n\n\tvColor.xyz = color.xyz;\n\n#endif";THREE.ShaderChunk.common="#define PI 3.14159\n#define PI2 6.28318\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\n\nvec3 transformDirection( in vec3 normal, in mat4 matrix ) {\n\n\treturn normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );\n\n}\n\nvec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {\n\n\treturn normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );\n\n}\n\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n\tfloat distance = dot( planeNormal, point - pointOnPlane );\n\n\treturn - distance * planeNormal + point;\n\n}\n\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n\n}\n\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n\treturn lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n\n}\n\nfloat calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {\n\n\tif ( decayExponent > 0.0 ) {\n\n\t  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\n\t}\n\n\treturn 1.0;\n\n}\n\nvec3 F_Schlick( in vec3 specularColor, in float dotLH ) {\n\n\n\tfloat fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );\n\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n\n}\n\nfloat G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {\n\n\n\treturn 0.25;\n\n}\n\nfloat D_BlinnPhong( in float shininess, in float dotNH ) {\n\n\n\treturn ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n\n}\n\nvec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) {\n\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotLH = saturate( dot( lightDir, halfDir ) );\n\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\n\tfloat G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );\n\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\n\treturn F * G * D;\n\n}\n\nvec3 inputToLinear( in vec3 a ) {\n\n\t#ifdef GAMMA_INPUT\n\n\t\treturn pow( a, vec3( float( GAMMA_FACTOR ) ) );\n\n\t#else\n\n\t\treturn a;\n\n\t#endif\n\n}\n\nvec3 linearToOutput( in vec3 a ) {\n\n\t#ifdef GAMMA_OUTPUT\n\n\t\treturn pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );\n\n\t#else\n\n\t\treturn a;\n\n\t#endif\n\n}\n";
	THREE.ShaderChunk.defaultnormal_vertex="#ifdef FLIP_SIDED\n\n\tobjectNormal = -objectNormal;\n\n#endif\n\nvec3 transformedNormal = normalMatrix * objectNormal;\n";THREE.ShaderChunk.displacementmap_vertex="#ifdef USE_DISPLACEMENTMAP\n\n\ttransformed += normal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n\n#endif\n";THREE.ShaderChunk.displacementmap_pars_vertex="#ifdef USE_DISPLACEMENTMAP\n\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n\n#endif\n";
	THREE.ShaderChunk.emissivemap_fragment="#ifdef USE_EMISSIVEMAP\n\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\n\temissiveColor.rgb = inputToLinear( emissiveColor.rgb );\n\n\ttotalEmissiveLight *= emissiveColor.rgb;\n\n#endif\n";THREE.ShaderChunk.emissivemap_pars_fragment="#ifdef USE_EMISSIVEMAP\n\n\tuniform sampler2D emissiveMap;\n\n#endif\n";THREE.ShaderChunk.envmap_fragment="#ifdef USE_ENVMAP\n\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n\t\tvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\n\t\t\tvec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\n\t\t#else\n\n\t\t\tvec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\n\t\t#endif\n\n\t#else\n\n\t\tvec3 reflectVec = vReflect;\n\n\t#endif\n\n\t#ifdef DOUBLE_SIDED\n\t\tfloat flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t#else\n\t\tfloat flipNormal = 1.0;\n\t#endif\n\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\n\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\tvec2 sampleUV;\n\t\tsampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n\t\tsampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\n\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\tvec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));\n\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t#endif\n\n\tenvColor.xyz = inputToLinear( envColor.xyz );\n\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\n\t#endif\n\n#endif\n";
	THREE.ShaderChunk.envmap_pars_fragment="#ifdef USE_ENVMAP\n\n\tuniform float reflectivity;\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\tuniform float flipEnvMap;\n\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n\t\tuniform float refractionRatio;\n\n\t#else\n\n\t\tvarying vec3 vReflect;\n\n\t#endif\n\n#endif\n";THREE.ShaderChunk.envmap_pars_vertex="#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n\tvarying vec3 vReflect;\n\n\tuniform float refractionRatio;\n\n#endif\n";
	THREE.ShaderChunk.envmap_vertex="#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n\tvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\n\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\n\t#ifdef ENVMAP_MODE_REFLECTION\n\n\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\n\t#else\n\n\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\n\t#endif\n\n#endif\n";
	THREE.ShaderChunk.fog_fragment="#ifdef USE_FOG\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tfloat depth = gl_FragDepthEXT / gl_FragCoord.w;\n\n\t#else\n\n\t\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n\n\t#endif\n\n\t#ifdef FOG_EXP2\n\n\t\tfloat fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );\n\n\t#else\n\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, depth );\n\n\t#endif\n\t\n\toutgoingLight = mix( outgoingLight, fogColor, fogFactor );\n\n#endif";
	THREE.ShaderChunk.fog_pars_fragment="#ifdef USE_FOG\n\n\tuniform vec3 fogColor;\n\n\t#ifdef FOG_EXP2\n\n\t\tuniform float fogDensity;\n\n\t#else\n\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n\n#endif";THREE.ShaderChunk.hemilight_fragment="#if MAX_HEMI_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n\t\tvec3 lightDir = hemisphereLightDirection[ i ];\n\n\t\tfloat dotProduct = dot( normal, lightDir );\n\n\t\tfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n\t\tvec3 lightColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n\t\ttotalAmbientLight += lightColor;\n\n\t}\n\n#endif\n\n";
	THREE.ShaderChunk.lightmap_fragment="#ifdef USE_LIGHTMAP\n\n\ttotalAmbientLight += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\n#endif\n";THREE.ShaderChunk.lightmap_pars_fragment="#ifdef USE_LIGHTMAP\n\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n\n#endif";THREE.ShaderChunk.lights_lambert_pars_vertex="#if MAX_DIR_LIGHTS > 0\n\n\tuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n\tuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\tuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n";
	THREE.ShaderChunk.lights_lambert_vertex="vLightFront = vec3( 0.0 );\n\n#ifdef DOUBLE_SIDED\n\n\tvLightBack = vec3( 0.0 );\n\n#endif\n\nvec3 normal = normalize( transformedNormal );\n\n#if MAX_POINT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = pointLightColor[ i ];\n\n\t\tvec3 lVector = pointLightPosition[ i ] - mvPosition.xyz;\n\t\tvec3 lightDir = normalize( lVector );\n\n\n\t\tfloat attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\n\t\tfloat dotProduct = dot( normal, lightDir );\n\n\t\tvLightFront += lightColor * attenuation * saturate( dotProduct );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tvLightBack += lightColor * attenuation * saturate( - dotProduct );\n\n\t\t#endif\n\n\t}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = spotLightColor[ i ];\n\n\t\tvec3 lightPosition = spotLightPosition[ i ];\n\t\tvec3 lVector = lightPosition - mvPosition.xyz;\n\t\tvec3 lightDir = normalize( lVector );\n\n\t\tfloat spotEffect = dot( spotLightDirection[ i ], lightDir );\n\n\t\tif ( spotEffect > spotLightAngleCos[ i ] ) {\n\n\t\t\tspotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );\n\n\n\t\t\tfloat attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n\t\t\tattenuation *= spotEffect;\n\n\n\t\t\tfloat dotProduct = dot( normal, lightDir );\n\n\t\t\tvLightFront += lightColor * attenuation * saturate( dotProduct );\n\n\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\tvLightBack += lightColor * attenuation * saturate( - dotProduct );\n\n\t\t\t#endif\n\n\t\t}\n\n\t}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = directionalLightColor[ i ];\n\n\t\tvec3 lightDir = directionalLightDirection[ i ];\n\n\n\t\tfloat dotProduct = dot( normal, lightDir );\n\n\t\tvLightFront += lightColor * saturate( dotProduct );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tvLightBack += lightColor * saturate( - dotProduct );\n\n\t\t#endif\n\n\t}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n\t\tvec3 lightDir = hemisphereLightDirection[ i ];\n\n\n\t\tfloat dotProduct = dot( normal, lightDir );\n\n\t\tfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n\t\tvLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tfloat hemiDiffuseWeightBack = - 0.5 * dotProduct + 0.5;\n\n\t\t\tvLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );\n\n\t\t#endif\n\n\t}\n\n#endif\n";
	THREE.ShaderChunk.lights_phong_fragment="vec3 viewDir = normalize( vViewPosition );\n\nvec3 totalDiffuseLight = vec3( 0.0 );\nvec3 totalSpecularLight = vec3( 0.0 );\n\n#if MAX_POINT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = pointLightColor[ i ];\n\n\t\tvec3 lightPosition = pointLightPosition[ i ];\n\t\tvec3 lVector = lightPosition + vViewPosition.xyz;\n\t\tvec3 lightDir = normalize( lVector );\n\n\n\t\tfloat attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\n\t\tfloat cosineTerm = saturate( dot( normal, lightDir ) );\n\n\t\ttotalDiffuseLight += lightColor * attenuation * cosineTerm;\n\n\n\t\tvec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n\t\ttotalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;\n\n\n\t}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = spotLightColor[ i ];\n\n\t\tvec3 lightPosition = spotLightPosition[ i ];\n\t\tvec3 lVector = lightPosition + vViewPosition.xyz;\n\t\tvec3 lightDir = normalize( lVector );\n\n\t\tfloat spotEffect = dot( spotLightDirection[ i ], lightDir );\n\n\t\tif ( spotEffect > spotLightAngleCos[ i ] ) {\n\n\t\t\tspotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );\n\n\n\t\t\tfloat attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n\t\t\tattenuation *= spotEffect;\n\n\n\t\t\tfloat cosineTerm = saturate( dot( normal, lightDir ) );\n\n\t\t\ttotalDiffuseLight += lightColor * attenuation * cosineTerm;\n\n\n\t\t\tvec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n\t\t\ttotalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;\n\n\t\t}\n\n\t}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n\t\tvec3 lightColor = directionalLightColor[ i ];\n\n\t\tvec3 lightDir = directionalLightDirection[ i ];\n\n\n\t\tfloat cosineTerm = saturate( dot( normal, lightDir ) );\n\n\t\ttotalDiffuseLight += lightColor * cosineTerm;\n\n\n\t\tvec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n\t\ttotalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;\n\n\t}\n\n#endif\n";
	THREE.ShaderChunk.lights_phong_pars_fragment="uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n\tuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n\tuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\n\tuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n\tvarying vec3 vWorldPosition;\n\n#endif\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n\n\tvarying vec3 vNormal;\n\n#endif\n";
	THREE.ShaderChunk.lights_phong_pars_vertex="#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n\tvarying vec3 vWorldPosition;\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\n#endif\n";THREE.ShaderChunk.lights_phong_vertex="#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n\tvWorldPosition = worldPosition.xyz;\n\n#endif\n";THREE.ShaderChunk.linear_to_gamma_fragment="\n\toutgoingLight = linearToOutput( outgoingLight );\n";
	THREE.ShaderChunk.logdepthbuf_fragment="#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\n\tgl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n\n#endif";THREE.ShaderChunk.logdepthbuf_pars_fragment="#ifdef USE_LOGDEPTHBUF\n\n\tuniform float logDepthBufFC;\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tvarying float vFragDepth;\n\n\t#endif\n\n#endif\n";THREE.ShaderChunk.logdepthbuf_pars_vertex="#ifdef USE_LOGDEPTHBUF\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tvarying float vFragDepth;\n\n\t#endif\n\n\tuniform float logDepthBufFC;\n\n#endif";
	THREE.ShaderChunk.logdepthbuf_vertex="#ifdef USE_LOGDEPTHBUF\n\n\tgl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\n#else\n\n\t\tgl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\n\t#endif\n\n#endif";THREE.ShaderChunk.map_fragment="#ifdef USE_MAP\n\n\tvec4 texelColor = texture2D( map, vUv );\n\n\ttexelColor.xyz = inputToLinear( texelColor.xyz );\n\n\tdiffuseColor *= texelColor;\n\n#endif\n";
	THREE.ShaderChunk.map_pars_fragment="#ifdef USE_MAP\n\n\tuniform sampler2D map;\n\n#endif";THREE.ShaderChunk.map_particle_fragment="#ifdef USE_MAP\n\n\tdiffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\n#endif\n";THREE.ShaderChunk.map_particle_pars_fragment="#ifdef USE_MAP\n\n\tuniform vec4 offsetRepeat;\n\tuniform sampler2D map;\n\n#endif\n";THREE.ShaderChunk.morphnormal_vertex="#ifdef USE_MORPHNORMALS\n\n\tobjectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n\tobjectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n\tobjectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n\tobjectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n\n#endif\n";
	THREE.ShaderChunk.morphtarget_pars_vertex="#ifdef USE_MORPHTARGETS\n\n\t#ifndef USE_MORPHNORMALS\n\n\tuniform float morphTargetInfluences[ 8 ];\n\n\t#else\n\n\tuniform float morphTargetInfluences[ 4 ];\n\n\t#endif\n\n#endif";THREE.ShaderChunk.morphtarget_vertex="#ifdef USE_MORPHTARGETS\n\n\ttransformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n\ttransformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n\ttransformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n\ttransformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\n\t#ifndef USE_MORPHNORMALS\n\n\ttransformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n\ttransformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n\ttransformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n\ttransformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\n\t#endif\n\n#endif\n";
	THREE.ShaderChunk.normal_phong_fragment="#ifndef FLAT_SHADED\n\n\tvec3 normal = normalize( vNormal );\n\n\t#ifdef DOUBLE_SIDED\n\n\t\tnormal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n\n\t#endif\n\n#else\n\n\tvec3 fdx = dFdx( vViewPosition );\n\tvec3 fdy = dFdy( vViewPosition );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n\n#endif\n\n#ifdef USE_NORMALMAP\n\n\tnormal = perturbNormal2Arb( -vViewPosition, normal );\n\n#elif defined( USE_BUMPMAP )\n\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n\n#endif\n\n";
	THREE.ShaderChunk.normalmap_pars_fragment="#ifdef USE_NORMALMAP\n\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n\n\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\n\t\tvec3 q0 = dFdx( eye_pos.xyz );\n\t\tvec3 q1 = dFdy( eye_pos.xyz );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\n\t\tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\t\tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\t\tvec3 N = normalize( surf_norm );\n\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t\tmapN.xy = normalScale * mapN.xy;\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\n\t}\n\n#endif\n";
	THREE.ShaderChunk.project_vertex="#ifdef USE_SKINNING\n\n\tvec4 mvPosition = modelViewMatrix * skinned;\n\n#else\n\n\tvec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\n#endif\n\ngl_Position = projectionMatrix * mvPosition;\n";THREE.ShaderChunk.shadowmap_fragment="#ifdef USE_SHADOWMAP\n\n\tfor ( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n\t\tfloat texelSizeY =  1.0 / shadowMapSize[ i ].y;\n\n\t\tfloat shadow = 0.0;\n\n#if defined( POINT_LIGHT_SHADOWS )\n\n\t\tbool isPointLight = shadowDarkness[ i ] < 0.0;\n\n\t\tif ( isPointLight ) {\n\n\t\t\tfloat realShadowDarkness = abs( shadowDarkness[ i ] );\n\n\t\t\tvec3 lightToPosition = vShadowCoord[ i ].xyz;\n\n\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n\t\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t\tfloat dp = length( lightToPosition );\n\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow );\n\n\n\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tconst float Dr = 1.25;\n\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tconst float Dr = 2.25;\n\t#endif\n\n\t\t\tfloat os = Dr *  2.0 * texelSizeY;\n\n\t\t\tconst vec3 Gsd = vec3( - 1, 0, 1 );\n\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\n\t\t\tshadow *= realShadowDarkness * ( 1.0 / 21.0 );\n\n\t#else \n\t\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t\tfloat dp = length( lightToPosition );\n\n\t\t\tadjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow );\n\n\t\t\tshadow *= realShadowDarkness;\n\n\t#endif\n\n\t\t} else {\n\n#endif \n\t\t\tfloat texelSizeX =  1.0 / shadowMapSize[ i ].x;\n\n\t\t\tvec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n\n\t\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\t\tbool inFrustum = all( inFrustumVec );\n\n\t\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n\t\t\tbool frustumTest = all( frustumTestVec );\n\n\t\t\tif ( frustumTest ) {\n\n\t#if defined( SHADOWMAP_TYPE_PCF )\n\n\n\t\t\t\t/*\n\t\t\t\t\tfor ( float y = -1.25; y <= 1.25; y += 1.25 )\n\t\t\t\t\t\tfor ( float x = -1.25; x <= 1.25; x += 1.25 ) {\n\t\t\t\t\t\t\tvec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );\n\t\t\t\t\t\t\tfloat fDepth = unpackDepth( rgbaDepth );\n\t\t\t\t\t\t\tif ( fDepth < shadowCoord.z )\n\t\t\t\t\t\t\t\tshadow += 1.0;\n\t\t\t\t\t}\n\t\t\t\t\tshadow /= 9.0;\n\t\t\t\t*/\n\n\t\t\t\tshadowCoord.z += shadowBias[ i ];\n\n\t\t\t\tconst float ShadowDelta = 1.0 / 9.0;\n\n\t\t\t\tfloat xPixelOffset = texelSizeX;\n\t\t\t\tfloat yPixelOffset = texelSizeY;\n\n\t\t\t\tfloat dx0 = - 1.25 * xPixelOffset;\n\t\t\t\tfloat dy0 = - 1.25 * yPixelOffset;\n\t\t\t\tfloat dx1 = 1.25 * xPixelOffset;\n\t\t\t\tfloat dy1 = 1.25 * yPixelOffset;\n\n\t\t\t\tfloat fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n\t\t\t\tshadow *= shadowDarkness[ i ];\n\n\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n\n\t\t\t\tshadowCoord.z += shadowBias[ i ];\n\n\t\t\t\tfloat xPixelOffset = texelSizeX;\n\t\t\t\tfloat yPixelOffset = texelSizeY;\n\n\t\t\t\tfloat dx0 = - 1.0 * xPixelOffset;\n\t\t\t\tfloat dy0 = - 1.0 * yPixelOffset;\n\t\t\t\tfloat dx1 = 1.0 * xPixelOffset;\n\t\t\t\tfloat dy1 = 1.0 * yPixelOffset;\n\n\t\t\t\tmat3 shadowKernel;\n\t\t\t\tmat3 depthKernel;\n\n\t\t\t\tdepthKernel[ 0 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n\t\t\t\tdepthKernel[ 0 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n\t\t\t\tdepthKernel[ 0 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n\t\t\t\tdepthKernel[ 1 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n\t\t\t\tdepthKernel[ 1 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n\t\t\t\tdepthKernel[ 1 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n\t\t\t\tdepthKernel[ 2 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n\t\t\t\tdepthKernel[ 2 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n\t\t\t\tdepthKernel[ 2 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n\t\t\t\tvec3 shadowZ = vec3( shadowCoord.z );\n\t\t\t\tshadowKernel[ 0 ] = vec3( lessThan( depthKernel[ 0 ], shadowZ ) );\n\t\t\t\tshadowKernel[ 0 ] *= vec3( 0.25 );\n\n\t\t\t\tshadowKernel[ 1 ] = vec3( lessThan( depthKernel[ 1 ], shadowZ ) );\n\t\t\t\tshadowKernel[ 1 ] *= vec3( 0.25 );\n\n\t\t\t\tshadowKernel[ 2 ] = vec3( lessThan( depthKernel[ 2 ], shadowZ ) );\n\t\t\t\tshadowKernel[ 2 ] *= vec3( 0.25 );\n\n\t\t\t\tvec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[ i ].xy );\n\n\t\t\t\tshadowKernel[ 0 ] = mix( shadowKernel[ 1 ], shadowKernel[ 0 ], fractionalCoord.x );\n\t\t\t\tshadowKernel[ 1 ] = mix( shadowKernel[ 2 ], shadowKernel[ 1 ], fractionalCoord.x );\n\n\t\t\t\tvec4 shadowValues;\n\t\t\t\tshadowValues.x = mix( shadowKernel[ 0 ][ 1 ], shadowKernel[ 0 ][ 0 ], fractionalCoord.y );\n\t\t\t\tshadowValues.y = mix( shadowKernel[ 0 ][ 2 ], shadowKernel[ 0 ][ 1 ], fractionalCoord.y );\n\t\t\t\tshadowValues.z = mix( shadowKernel[ 1 ][ 1 ], shadowKernel[ 1 ][ 0 ], fractionalCoord.y );\n\t\t\t\tshadowValues.w = mix( shadowKernel[ 1 ][ 2 ], shadowKernel[ 1 ][ 1 ], fractionalCoord.y );\n\n\t\t\t\tshadow = dot( shadowValues, vec4( 1.0 ) ) * shadowDarkness[ i ];\n\n\t#else \n\t\t\t\tshadowCoord.z += shadowBias[ i ];\n\n\t\t\t\tvec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\n\t\t\t\tfloat fDepth = unpackDepth( rgbaDepth );\n\n\t\t\t\tif ( fDepth < shadowCoord.z )\n\t\t\t\t\tshadow = shadowDarkness[ i ];\n\n\t#endif\n\n\t\t\t}\n\n#ifdef SHADOWMAP_DEBUG\n\n\t\t\tif ( inFrustum ) {\n\n\t\t\t\tif ( i == 0 ) {\n\n\t\t\t\t\toutgoingLight *= vec3( 1.0, 0.5, 0.0 );\n\n\t\t\t\t} else if ( i == 1 ) {\n\n\t\t\t\t\toutgoingLight *= vec3( 0.0, 1.0, 0.8 );\n\n\t\t\t\t} else {\n\n\t\t\t\t\toutgoingLight *= vec3( 0.0, 0.5, 1.0 );\n\n\t\t\t\t}\n\n\t\t\t}\n\n#endif\n\n#if defined( POINT_LIGHT_SHADOWS )\n\n\t\t}\n\n#endif\n\n\t\tshadowMask = shadowMask * vec3( 1.0 - shadow );\n\n\t}\n\n#endif\n";
	THREE.ShaderChunk.shadowmap_pars_fragment="#ifdef USE_SHADOWMAP\n\n\tuniform sampler2D shadowMap[ MAX_SHADOWS ];\n\tuniform vec2 shadowMapSize[ MAX_SHADOWS ];\n\n\tuniform float shadowDarkness[ MAX_SHADOWS ];\n\tuniform float shadowBias[ MAX_SHADOWS ];\n\n\tvarying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n\tfloat unpackDepth( const in vec4 rgba_depth ) {\n\n\t\tconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n\t\tfloat depth = dot( rgba_depth, bit_shift );\n\t\treturn depth;\n\n\t}\n\n\t#if defined(POINT_LIGHT_SHADOWS)\n\n\n\t\tvoid adjustShadowValue1K( const float testDepth, const vec4 textureData, const float bias, inout float shadowValue ) {\n\n\t\t\tconst vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n\t\t\tif ( testDepth >= dot( textureData, bitSh ) * 1000.0 + bias )\n\t\t\t\tshadowValue += 1.0;\n\n\t\t}\n\n\n\t\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\n\n\t\t\tvec3 absV = abs( v );\n\n\n\t\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\t\tabsV *= scaleToCube;\n\n\n\t\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\n\n\n\t\t\tvec2 planar = v.xy;\n\n\t\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\t\tfloat almostOne = 1.0 - almostATexel;\n\n\t\t\tif ( absV.z >= almostOne ) {\n\n\t\t\t\tif ( v.z > 0.0 )\n\t\t\t\t\tplanar.x = 4.0 - v.x;\n\n\t\t\t} else if ( absV.x >= almostOne ) {\n\n\t\t\t\tfloat signX = sign( v.x );\n\t\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\n\t\t\t} else if ( absV.y >= almostOne ) {\n\n\t\t\t\tfloat signY = sign( v.y );\n\t\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\t\tplanar.y = v.z * signY - 2.0;\n\n\t\t\t}\n\n\n\t\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\n\t\t}\n\n\t#endif\n\n#endif\n";
	THREE.ShaderChunk.shadowmap_pars_vertex="#ifdef USE_SHADOWMAP\n\n\tuniform float shadowDarkness[ MAX_SHADOWS ];\n\tuniform mat4 shadowMatrix[ MAX_SHADOWS ];\n\tvarying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n#endif";THREE.ShaderChunk.shadowmap_vertex="#ifdef USE_SHADOWMAP\n\n\tfor ( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n\t\t\tvShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n\n\t}\n\n#endif";THREE.ShaderChunk.skinbase_vertex="#ifdef USE_SKINNING\n\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n\n#endif";
	THREE.ShaderChunk.skinning_pars_vertex="#ifdef USE_SKINNING\n\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\n\t#ifdef BONE_TEXTURE\n\n\t\tuniform sampler2D boneTexture;\n\t\tuniform int boneTextureWidth;\n\t\tuniform int boneTextureHeight;\n\n\t\tmat4 getBoneMatrix( const in float i ) {\n\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureWidth ) );\n\t\t\tfloat y = floor( j / float( boneTextureWidth ) );\n\n\t\t\tfloat dx = 1.0 / float( boneTextureWidth );\n\t\t\tfloat dy = 1.0 / float( boneTextureHeight );\n\n\t\t\ty = dy * ( y + 0.5 );\n\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\n\t\t\treturn bone;\n\n\t\t}\n\n\t#else\n\n\t\tuniform mat4 boneGlobalMatrices[ MAX_BONES ];\n\n\t\tmat4 getBoneMatrix( const in float i ) {\n\n\t\t\tmat4 bone = boneGlobalMatrices[ int(i) ];\n\t\t\treturn bone;\n\n\t\t}\n\n\t#endif\n\n#endif\n";
	THREE.ShaderChunk.skinning_vertex="#ifdef USE_SKINNING\n\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\tskinned  = bindMatrixInverse * skinned;\n\n#endif\n";THREE.ShaderChunk.skinnormal_vertex="#ifdef USE_SKINNING\n\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n\n#endif\n";
	THREE.ShaderChunk.specularmap_fragment="float specularStrength;\n\n#ifdef USE_SPECULARMAP\n\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n\n#else\n\n\tspecularStrength = 1.0;\n\n#endif";THREE.ShaderChunk.specularmap_pars_fragment="#ifdef USE_SPECULARMAP\n\n\tuniform sampler2D specularMap;\n\n#endif";THREE.ShaderChunk.uv2_pars_fragment="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n\tvarying vec2 vUv2;\n\n#endif";
	THREE.ShaderChunk.uv2_pars_vertex="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n\n#endif";THREE.ShaderChunk.uv2_vertex="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n\tvUv2 = uv2;\n\n#endif";THREE.ShaderChunk.uv_pars_fragment="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n\tvarying vec2 vUv;\n\n#endif";
	THREE.ShaderChunk.uv_pars_vertex="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n\tvarying vec2 vUv;\n\tuniform vec4 offsetRepeat;\n\n#endif\n";THREE.ShaderChunk.uv_vertex="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n\tvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n\n#endif";
	THREE.ShaderChunk.worldpos_vertex="#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\n\t#ifdef USE_SKINNING\n\n\t\tvec4 worldPosition = modelMatrix * skinned;\n\n\t#else\n\n\t\tvec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n\n\t#endif\n\n#endif\n";
	THREE.UniformsUtils={merge:function(a){for(var b={},c=0;c<a.length;c++){var d=this.clone(a[c]),e;for(e in d)b[e]=d[e]}return b},clone:function(a){var b={},c;for(c in a){b[c]={};for(var d in a[c]){var e=a[c][d];e instanceof THREE.Color||e instanceof THREE.Vector2||e instanceof THREE.Vector3||e instanceof THREE.Vector4||e instanceof THREE.Matrix3||e instanceof THREE.Matrix4||e instanceof THREE.Texture?b[c][d]=e.clone():Array.isArray(e)?b[c][d]=e.slice():b[c][d]=e}}return b}};
	THREE.UniformsLib={common:{diffuse:{type:"c",value:new THREE.Color(15658734)},opacity:{type:"f",value:1},map:{type:"t",value:null},offsetRepeat:{type:"v4",value:new THREE.Vector4(0,0,1,1)},specularMap:{type:"t",value:null},alphaMap:{type:"t",value:null},envMap:{type:"t",value:null},flipEnvMap:{type:"f",value:-1},reflectivity:{type:"f",value:1},refractionRatio:{type:"f",value:.98}},aomap:{aoMap:{type:"t",value:null},aoMapIntensity:{type:"f",value:1}},lightmap:{lightMap:{type:"t",value:null},lightMapIntensity:{type:"f",
	value:1}},emissivemap:{emissiveMap:{type:"t",value:null}},bumpmap:{bumpMap:{type:"t",value:null},bumpScale:{type:"f",value:1}},normalmap:{normalMap:{type:"t",value:null},normalScale:{type:"v2",value:new THREE.Vector2(1,1)}},displacementmap:{displacementMap:{type:"t",value:null},displacementScale:{type:"f",value:1},displacementBias:{type:"f",value:0}},fog:{fogDensity:{type:"f",value:2.5E-4},fogNear:{type:"f",value:1},fogFar:{type:"f",value:2E3},fogColor:{type:"c",value:new THREE.Color(16777215)}},
	lights:{ambientLightColor:{type:"fv",value:[]},directionalLightDirection:{type:"fv",value:[]},directionalLightColor:{type:"fv",value:[]},hemisphereLightDirection:{type:"fv",value:[]},hemisphereLightSkyColor:{type:"fv",value:[]},hemisphereLightGroundColor:{type:"fv",value:[]},pointLightColor:{type:"fv",value:[]},pointLightPosition:{type:"fv",value:[]},pointLightDistance:{type:"fv1",value:[]},pointLightDecay:{type:"fv1",value:[]},spotLightColor:{type:"fv",value:[]},spotLightPosition:{type:"fv",value:[]},
	spotLightDirection:{type:"fv",value:[]},spotLightDistance:{type:"fv1",value:[]},spotLightAngleCos:{type:"fv1",value:[]},spotLightExponent:{type:"fv1",value:[]},spotLightDecay:{type:"fv1",value:[]}},points:{psColor:{type:"c",value:new THREE.Color(15658734)},opacity:{type:"f",value:1},size:{type:"f",value:1},scale:{type:"f",value:1},map:{type:"t",value:null},offsetRepeat:{type:"v4",value:new THREE.Vector4(0,0,1,1)},fogDensity:{type:"f",value:2.5E-4},fogNear:{type:"f",value:1},fogFar:{type:"f",value:2E3},
	fogColor:{type:"c",value:new THREE.Color(16777215)}},shadowmap:{shadowMap:{type:"tv",value:[]},shadowMapSize:{type:"v2v",value:[]},shadowBias:{type:"fv1",value:[]},shadowDarkness:{type:"fv1",value:[]},shadowMatrix:{type:"m4v",value:[]}}};
	THREE.ShaderLib={basic:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.aomap,THREE.UniformsLib.fog,THREE.UniformsLib.shadowmap]),vertexShader:[THREE.ShaderChunk.common,THREE.ShaderChunk.uv_pars_vertex,THREE.ShaderChunk.uv2_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,
	"void main() {",THREE.ShaderChunk.uv_vertex,THREE.ShaderChunk.uv2_vertex,THREE.ShaderChunk.color_vertex,THREE.ShaderChunk.skinbase_vertex,"\t#ifdef USE_ENVMAP",THREE.ShaderChunk.beginnormal_vertex,THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinnormal_vertex,THREE.ShaderChunk.defaultnormal_vertex,"\t#endif",THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,THREE.ShaderChunk.worldpos_vertex,
	THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform float opacity;",THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.uv_pars_fragment,THREE.ShaderChunk.uv2_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.alphamap_pars_fragment,THREE.ShaderChunk.aomap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,
	THREE.ShaderChunk.specularmap_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tvec3 totalAmbientLight = vec3( 1.0 );\n\tvec3 shadowMask = vec3( 1.0 );",THREE.ShaderChunk.logdepthbuf_fragment,THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.alphamap_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.specularmap_fragment,THREE.ShaderChunk.aomap_fragment,
	THREE.ShaderChunk.shadowmap_fragment,"\toutgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;",THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}"].join("\n")},lambert:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{emissive:{type:"c",value:new THREE.Color(0)}}]),vertexShader:["#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif",
	THREE.ShaderChunk.common,THREE.ShaderChunk.uv_pars_vertex,THREE.ShaderChunk.uv2_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.lights_lambert_pars_vertex,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.uv_vertex,THREE.ShaderChunk.uv2_vertex,THREE.ShaderChunk.color_vertex,THREE.ShaderChunk.beginnormal_vertex,
	THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,THREE.ShaderChunk.defaultnormal_vertex,THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.lights_lambert_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nuniform vec3 ambientLightColor;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif",
	THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.uv_pars_fragment,THREE.ShaderChunk.uv2_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.alphamap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.specularmap_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tvec3 totalAmbientLight = ambientLightColor;\n\tvec3 shadowMask = vec3( 1.0 );",
	THREE.ShaderChunk.logdepthbuf_fragment,THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.alphamap_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.specularmap_fragment,THREE.ShaderChunk.shadowmap_fragment,"\t#ifdef DOUBLE_SIDED\n\t\tif ( gl_FrontFacing )\n\t\t\toutgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;\n\t\telse\n\t\t\toutgoingLight += diffuseColor.rgb * ( vLightBack * shadowMask + totalAmbientLight ) + emissive;\n\t#else\n\t\toutgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;\n\t#endif",
	THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}"].join("\n")},phong:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.aomap,THREE.UniformsLib.lightmap,THREE.UniformsLib.emissivemap,THREE.UniformsLib.bumpmap,THREE.UniformsLib.normalmap,THREE.UniformsLib.displacementmap,THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{emissive:{type:"c",
	value:new THREE.Color(0)},specular:{type:"c",value:new THREE.Color(1118481)},shininess:{type:"f",value:30}}]),vertexShader:["#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif",THREE.ShaderChunk.common,THREE.ShaderChunk.uv_pars_vertex,THREE.ShaderChunk.uv2_pars_vertex,THREE.ShaderChunk.displacementmap_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.lights_phong_pars_vertex,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.morphtarget_pars_vertex,
	THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.uv_vertex,THREE.ShaderChunk.uv2_vertex,THREE.ShaderChunk.color_vertex,THREE.ShaderChunk.beginnormal_vertex,THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,THREE.ShaderChunk.defaultnormal_vertex,"#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif",THREE.ShaderChunk.begin_vertex,
	THREE.ShaderChunk.displacementmap_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,"\tvViewPosition = - mvPosition.xyz;",THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.lights_phong_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;",
	THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.uv_pars_fragment,THREE.ShaderChunk.uv2_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.alphamap_pars_fragment,THREE.ShaderChunk.aomap_pars_fragment,THREE.ShaderChunk.lightmap_pars_fragment,THREE.ShaderChunk.emissivemap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.lights_phong_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.bumpmap_pars_fragment,
	THREE.ShaderChunk.normalmap_pars_fragment,THREE.ShaderChunk.specularmap_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tvec3 totalAmbientLight = ambientLightColor;\n\tvec3 totalEmissiveLight = emissive;\n\tvec3 shadowMask = vec3( 1.0 );",THREE.ShaderChunk.logdepthbuf_fragment,THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.alphamap_fragment,THREE.ShaderChunk.alphatest_fragment,
	THREE.ShaderChunk.specularmap_fragment,THREE.ShaderChunk.normal_phong_fragment,THREE.ShaderChunk.lightmap_fragment,THREE.ShaderChunk.hemilight_fragment,THREE.ShaderChunk.aomap_fragment,THREE.ShaderChunk.emissivemap_fragment,THREE.ShaderChunk.lights_phong_fragment,THREE.ShaderChunk.shadowmap_fragment,"totalDiffuseLight *= shadowMask;\ntotalSpecularLight *= shadowMask;\n#ifdef METAL\n\toutgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;\n#else\n\toutgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;\n#endif",
	THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}"].join("\n")},points:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.points,THREE.UniformsLib.shadowmap]),vertexShader:["uniform float size;\nuniform float scale;",THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.color_vertex,
	"\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\t#ifdef USE_SIZEATTENUATION\n\t\tgl_PointSize = size * ( scale / length( mvPosition.xyz ) );\n\t#else\n\t\tgl_PointSize = size;\n\t#endif\n\tgl_Position = projectionMatrix * mvPosition;",THREE.ShaderChunk.logdepthbuf_vertex,THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 psColor;\nuniform float opacity;",THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.map_particle_pars_fragment,
	THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( psColor, opacity );\n\tvec3 shadowMask = vec3( 1.0 );",THREE.ShaderChunk.logdepthbuf_fragment,THREE.ShaderChunk.map_particle_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.shadowmap_fragment,"\toutgoingLight = diffuseColor.rgb * shadowMask;",THREE.ShaderChunk.fog_fragment,
	"\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}"].join("\n")},dashed:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.fog,{scale:{type:"f",value:1},dashSize:{type:"f",value:1},totalSize:{type:"f",value:2}}]),vertexShader:["uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;",THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.color_vertex,"\tvLineDistance = scale * lineDistance;\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\tgl_Position = projectionMatrix * mvPosition;",
	THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;",THREE.ShaderChunk.common,THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );",
	THREE.ShaderChunk.logdepthbuf_fragment,THREE.ShaderChunk.color_fragment,"\toutgoingLight = diffuseColor.rgb;",THREE.ShaderChunk.fog_fragment,"\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}"].join("\n")},depth:{uniforms:{mNear:{type:"f",value:1},mFar:{type:"f",value:2E3},opacity:{type:"f",value:1}},vertexShader:[THREE.ShaderChunk.common,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,
	THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:["uniform float mNear;\nuniform float mFar;\nuniform float opacity;",THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {",THREE.ShaderChunk.logdepthbuf_fragment,"\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tfloat depth = gl_FragDepthEXT / gl_FragCoord.w;\n\t#else\n\t\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n\t#endif\n\tfloat color = 1.0 - smoothstep( mNear, mFar, depth );\n\tgl_FragColor = vec4( vec3( color ), opacity );\n}"].join("\n")},
	normal:{uniforms:{opacity:{type:"f",value:1}},vertexShader:["varying vec3 vNormal;",THREE.ShaderChunk.common,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {\n\tvNormal = normalize( normalMatrix * normal );",THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:["uniform float opacity;\nvarying vec3 vNormal;",THREE.ShaderChunk.common,
	THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tgl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );",THREE.ShaderChunk.logdepthbuf_fragment,"}"].join("\n")},cube:{uniforms:{tCube:{type:"t",value:null},tFlip:{type:"f",value:-1}},vertexShader:["varying vec3 vWorldPosition;",THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:["uniform samplerCube tCube;\nuniform float tFlip;\nvarying vec3 vWorldPosition;",THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\n\tgl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",THREE.ShaderChunk.logdepthbuf_fragment,"}"].join("\n")},equirect:{uniforms:{tEquirect:{type:"t",value:null},tFlip:{type:"f",value:-1}},vertexShader:["varying vec3 vWorldPosition;",
	THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:["uniform sampler2D tEquirect;\nuniform float tFlip;\nvarying vec3 vWorldPosition;",THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_fragment,"void main() {\nvec3 direction = normalize( vWorldPosition );\nvec2 sampleUV;\nsampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );\nsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\ngl_FragColor = texture2D( tEquirect, sampleUV );",
	THREE.ShaderChunk.logdepthbuf_fragment,"}"].join("\n")},depthRGBA:{uniforms:{},vertexShader:[THREE.ShaderChunk.common,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.logdepthbuf_pars_vertex,"void main() {",THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.logdepthbuf_vertex,"}"].join("\n"),fragmentShader:[THREE.ShaderChunk.common,
	THREE.ShaderChunk.logdepthbuf_pars_fragment,"vec4 pack_depth( const in float depth ) {\n\tconst vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n\tconst vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n\tvec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );\n\tres -= res.xxyz * bit_mask;\n\treturn res;\n}\nvoid main() {",THREE.ShaderChunk.logdepthbuf_fragment,"\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tgl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );\n\t#else\n\t\tgl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );\n\t#endif\n}"].join("\n")},
	distanceRGBA:{uniforms:{lightPos:{type:"v3",value:new THREE.Vector3(0,0,0)}},vertexShader:["varying vec4 vWorldPosition;",THREE.ShaderChunk.common,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,"void main() {",THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.begin_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.project_vertex,THREE.ShaderChunk.worldpos_vertex,"vWorldPosition = worldPosition;\n}"].join("\n"),fragmentShader:["uniform vec3 lightPos;\nvarying vec4 vWorldPosition;",
	THREE.ShaderChunk.common,"vec4 pack1K ( float depth ) {\n   depth /= 1000.0;\n   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n\tconst vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n\tvec4 res = fract( depth * bitSh );\n\tres -= res.xxyz * bitMsk;\n\treturn res; \n}\nfloat unpack1K ( vec4 color ) {\n\tconst vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n\treturn dot( color, bitSh ) * 1000.0;\n}\nvoid main () {\n\tgl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );\n}"].join("\n")}};
	THREE.WebGLRenderer=function(a){function b(a,b,c,d){!0===G&&(a*=d,b*=d,c*=d);r.clearColor(a,b,c,d)}function c(){I.init();r.viewport(na,oa,pa,qa);b(U.r,U.g,U.b,X)}function d(){ra=Aa=null;sa="";ta=-1;wa=!0;I.reset()}function e(a){a.preventDefault();d();c();W.clear()}function g(a){a=a.target;a.removeEventListener("dispose",g);a:{var b=W.get(a);if(a.image&&b.__image__webglTextureCube)r.deleteTexture(b.__image__webglTextureCube);else{if(void 0===b.__webglInit)break a;r.deleteTexture(b.__webglTexture)}W.delete(a)}la.textures--}
	function f(a){a=a.target;a.removeEventListener("dispose",f);var b=W.get(a),c=W.get(a.texture);if(a&&void 0!==c.__webglTexture){r.deleteTexture(c.__webglTexture);if(a instanceof THREE.WebGLRenderTargetCube)for(c=0;6>c;c++)r.deleteFramebuffer(b.__webglFramebuffer[c]),r.deleteRenderbuffer(b.__webglRenderbuffer[c]);else r.deleteFramebuffer(b.__webglFramebuffer),r.deleteRenderbuffer(b.__webglRenderbuffer);W.delete(a.texture);W.delete(a)}la.textures--}function h(a){a=a.target;a.removeEventListener("dispose",
	h);l(a);W.delete(a)}function l(a){var b=W.get(a).program;a.program=void 0;void 0!==b&&ua.releaseProgram(b)}function k(a,b){return b[0]-a[0]}function m(a,b){return a.object.renderOrder!==b.object.renderOrder?a.object.renderOrder-b.object.renderOrder:a.material.id!==b.material.id?a.material.id-b.material.id:a.z!==b.z?a.z-b.z:a.id-b.id}function p(a,b){return a.object.renderOrder!==b.object.renderOrder?a.object.renderOrder-b.object.renderOrder:a.z!==b.z?b.z-a.z:a.id-b.id}function n(a,b,c,d,e){var f;c.transparent?
	(d=Z,f=++fa):(d=ca,f=++ga);f=d[f];void 0!==f?(f.id=a.id,f.object=a,f.geometry=b,f.material=c,f.z=V.z,f.group=e):(f={id:a.id,object:a,geometry:b,material:c,z:V.z,group:e},d.push(f))}function q(a,b){if(!1!==a.visible){if(0!==(a.channels.mask&b.channels.mask))if(a instanceof THREE.Light)da.push(a);else if(a instanceof THREE.Sprite)ea.push(a);else if(a instanceof THREE.LensFlare)ja.push(a);else if(a instanceof THREE.ImmediateRenderObject)!0===aa.sortObjects&&(V.setFromMatrixPosition(a.matrixWorld),V.applyProjection(xa)),
	n(a,null,a.material,V.z,null);else if(a instanceof THREE.Mesh||a instanceof THREE.Line||a instanceof THREE.Points)if(a instanceof THREE.SkinnedMesh&&a.skeleton.update(),!1===a.frustumCulled||!0===Ba.intersectsObject(a)){var c=a.material;if(!0===c.visible){!0===aa.sortObjects&&(V.setFromMatrixPosition(a.matrixWorld),V.applyProjection(xa));var d=va.update(a);if(c instanceof THREE.MeshFaceMaterial)for(var e=d.groups,f=c.materials,c=0,g=e.length;c<g;c++){var h=e[c],l=f[h.materialIndex];!0===l.visible&&
	n(a,d,l,V.z,h)}else n(a,d,c,V.z,null)}}d=a.children;c=0;for(g=d.length;c<g;c++)q(d[c],b)}}function s(a,b,c,d,e){for(var f=0,g=a.length;f<g;f++){var h=a[f],l=h.object,k=h.geometry,n=void 0===e?h.material:e,h=h.group;l.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,l.matrixWorld);l.normalMatrix.getNormalMatrix(l.modelViewMatrix);if(l instanceof THREE.ImmediateRenderObject){t(n);var m=v(b,c,d,n,l);sa="";l.render(function(a){aa.renderBufferImmediate(a,m,n)})}else aa.renderBufferDirect(b,c,d,k,
	n,l,h)}}function t(a){a.side!==THREE.DoubleSide?I.enable(r.CULL_FACE):I.disable(r.CULL_FACE);I.setFlipSided(a.side===THREE.BackSide);!0===a.transparent?I.setBlending(a.blending,a.blendEquation,a.blendSrc,a.blendDst,a.blendEquationAlpha,a.blendSrcAlpha,a.blendDstAlpha):I.setBlending(THREE.NoBlending);I.setDepthFunc(a.depthFunc);I.setDepthTest(a.depthTest);I.setDepthWrite(a.depthWrite);I.setColorWrite(a.colorWrite);I.setPolygonOffset(a.polygonOffset,a.polygonOffsetFactor,a.polygonOffsetUnits)}function v(a,
	b,c,d,e){ya=0;var f=W.get(d);if(d.needsUpdate||!f.program){a:{var g=W.get(d),k=ua.getParameters(d,b,c,e),n=ua.getProgramCode(d,k),m=g.program,q=!0;if(void 0===m)d.addEventListener("dispose",h);else if(m.code!==n)l(d);else if(void 0!==k.shaderID)break a;else q=!1;q&&(k.shaderID?(m=THREE.ShaderLib[k.shaderID],g.__webglShader={name:d.type,uniforms:THREE.UniformsUtils.clone(m.uniforms),vertexShader:m.vertexShader,fragmentShader:m.fragmentShader}):g.__webglShader={name:d.type,uniforms:d.uniforms,vertexShader:d.vertexShader,
	fragmentShader:d.fragmentShader},d.__webglShader=g.__webglShader,m=ua.acquireProgram(d,k,n),g.program=m,d.program=m);k=m.getAttributes();if(d.morphTargets)for(n=d.numSupportedMorphTargets=0;n<aa.maxMorphTargets;n++)0<=k["morphTarget"+n]&&d.numSupportedMorphTargets++;if(d.morphNormals)for(n=d.numSupportedMorphNormals=0;n<aa.maxMorphNormals;n++)0<=k["morphNormal"+n]&&d.numSupportedMorphNormals++;g.uniformsList=[];var k=g.program.getUniforms(),p;for(p in g.__webglShader.uniforms)(n=k[p])&&g.uniformsList.push([g.__webglShader.uniforms[p],
	n])}d.needsUpdate=!1}n=m=q=!1;g=f.program;p=g.getUniforms();k=f.__webglShader.uniforms;g.id!==Aa&&(r.useProgram(g.program),Aa=g.id,n=m=q=!0);d.id!==ta&&(-1===ta&&(n=!0),ta=d.id,m=!0);if(q||a!==ra)r.uniformMatrix4fv(p.projectionMatrix,!1,a.projectionMatrix.elements),ha.logarithmicDepthBuffer&&r.uniform1f(p.logDepthBufFC,2/(Math.log(a.far+1)/Math.LN2)),a!==ra&&(ra=a),(d instanceof THREE.ShaderMaterial||d instanceof THREE.MeshPhongMaterial||d.envMap)&&void 0!==p.cameraPosition&&(V.setFromMatrixPosition(a.matrixWorld),
	r.uniform3f(p.cameraPosition,V.x,V.y,V.z)),(d instanceof THREE.MeshPhongMaterial||d instanceof THREE.MeshLambertMaterial||d instanceof THREE.MeshBasicMaterial||d instanceof THREE.ShaderMaterial||d.skinning)&&void 0!==p.viewMatrix&&r.uniformMatrix4fv(p.viewMatrix,!1,a.matrixWorldInverse.elements);d.skinning&&(e.bindMatrix&&void 0!==p.bindMatrix&&r.uniformMatrix4fv(p.bindMatrix,!1,e.bindMatrix.elements),e.bindMatrixInverse&&void 0!==p.bindMatrixInverse&&r.uniformMatrix4fv(p.bindMatrixInverse,!1,e.bindMatrixInverse.elements),
	ha.floatVertexTextures&&e.skeleton&&e.skeleton.useVertexTexture?(void 0!==p.boneTexture&&(q=w(),r.uniform1i(p.boneTexture,q),aa.setTexture(e.skeleton.boneTexture,q)),void 0!==p.boneTextureWidth&&r.uniform1i(p.boneTextureWidth,e.skeleton.boneTextureWidth),void 0!==p.boneTextureHeight&&r.uniform1i(p.boneTextureHeight,e.skeleton.boneTextureHeight)):e.skeleton&&e.skeleton.boneMatrices&&void 0!==p.boneGlobalMatrices&&r.uniformMatrix4fv(p.boneGlobalMatrices,!1,e.skeleton.boneMatrices));if(m){c&&d.fog&&
	(k.fogColor.value=c.color,c instanceof THREE.Fog?(k.fogNear.value=c.near,k.fogFar.value=c.far):c instanceof THREE.FogExp2&&(k.fogDensity.value=c.density));if(d instanceof THREE.MeshPhongMaterial||d instanceof THREE.MeshLambertMaterial||d.lights){if(wa){var n=!0,s,t=q=0,x=0,v,F,C,y=Ca,E=a.matrixWorldInverse,B=y.directional.colors,K=y.directional.positions,O=y.point.colors,N=y.point.positions,M=y.point.distances,G=y.point.decays,J=y.spot.colors,H=y.spot.positions,Q=y.spot.distances,I=y.spot.directions,
	da=y.spot.anglesCos,T=y.spot.exponents,R=y.spot.decays,Z=y.hemi.skyColors,ga=y.hemi.groundColors,S=y.hemi.positions,ca=0,U=0,ea=0,fa=0,ja=0,ma=0,X=0,$=0,ba=s=0;c=C=ba=0;for(m=b.length;c<m;c++)s=b[c],v=s.color,F=s.intensity,C=s.distance,s instanceof THREE.AmbientLight?s.visible&&(q+=v.r,t+=v.g,x+=v.b):s instanceof THREE.DirectionalLight?(ja+=1,s.visible&&(Y.setFromMatrixPosition(s.matrixWorld),V.setFromMatrixPosition(s.target.matrixWorld),Y.sub(V),Y.transformDirection(E),s=3*ca,K[s+0]=Y.x,K[s+1]=Y.y,
	K[s+2]=Y.z,D(B,s,v,F),ca+=1)):s instanceof THREE.PointLight?(ma+=1,s.visible&&(ba=3*U,D(O,ba,v,F),V.setFromMatrixPosition(s.matrixWorld),V.applyMatrix4(E),N[ba+0]=V.x,N[ba+1]=V.y,N[ba+2]=V.z,M[U]=C,G[U]=0===s.distance?0:s.decay,U+=1)):s instanceof THREE.SpotLight?(X+=1,s.visible&&(ba=3*ea,D(J,ba,v,F),Y.setFromMatrixPosition(s.matrixWorld),V.copy(Y).applyMatrix4(E),H[ba+0]=V.x,H[ba+1]=V.y,H[ba+2]=V.z,Q[ea]=C,V.setFromMatrixPosition(s.target.matrixWorld),Y.sub(V),Y.transformDirection(E),I[ba+0]=Y.x,
	I[ba+1]=Y.y,I[ba+2]=Y.z,da[ea]=Math.cos(s.angle),T[ea]=s.exponent,R[ea]=0===s.distance?0:s.decay,ea+=1)):s instanceof THREE.HemisphereLight&&($+=1,s.visible&&(Y.setFromMatrixPosition(s.matrixWorld),Y.transformDirection(E),C=3*fa,S[C+0]=Y.x,S[C+1]=Y.y,S[C+2]=Y.z,v=s.color,s=s.groundColor,D(Z,C,v,F),D(ga,C,s,F),fa+=1));c=3*ca;for(m=Math.max(B.length,3*ja);c<m;c++)B[c]=0;c=3*U;for(m=Math.max(O.length,3*ma);c<m;c++)O[c]=0;c=3*ea;for(m=Math.max(J.length,3*X);c<m;c++)J[c]=0;c=3*fa;for(m=Math.max(Z.length,
	3*$);c<m;c++)Z[c]=0;c=3*fa;for(m=Math.max(ga.length,3*$);c<m;c++)ga[c]=0;y.directional.length=ca;y.point.length=U;y.spot.length=ea;y.hemi.length=fa;y.ambient[0]=q;y.ambient[1]=t;y.ambient[2]=x;wa=!1}n?(n=Ca,k.ambientLightColor.value=n.ambient,k.directionalLightColor.value=n.directional.colors,k.directionalLightDirection.value=n.directional.positions,k.pointLightColor.value=n.point.colors,k.pointLightPosition.value=n.point.positions,k.pointLightDistance.value=n.point.distances,k.pointLightDecay.value=
	n.point.decays,k.spotLightColor.value=n.spot.colors,k.spotLightPosition.value=n.spot.positions,k.spotLightDistance.value=n.spot.distances,k.spotLightDirection.value=n.spot.directions,k.spotLightAngleCos.value=n.spot.anglesCos,k.spotLightExponent.value=n.spot.exponents,k.spotLightDecay.value=n.spot.decays,k.hemisphereLightSkyColor.value=n.hemi.skyColors,k.hemisphereLightGroundColor.value=n.hemi.groundColors,k.hemisphereLightDirection.value=n.hemi.positions,u(k,!0)):u(k,!1)}if(d instanceof THREE.MeshBasicMaterial||
	d instanceof THREE.MeshLambertMaterial||d instanceof THREE.MeshPhongMaterial){k.opacity.value=d.opacity;k.diffuse.value=d.color;d.emissive&&(k.emissive.value=d.emissive);k.map.value=d.map;k.specularMap.value=d.specularMap;k.alphaMap.value=d.alphaMap;d.aoMap&&(k.aoMap.value=d.aoMap,k.aoMapIntensity.value=d.aoMapIntensity);var P;d.map?P=d.map:d.specularMap?P=d.specularMap:d.displacementMap?P=d.displacementMap:d.normalMap?P=d.normalMap:d.bumpMap?P=d.bumpMap:d.alphaMap?P=d.alphaMap:d.emissiveMap&&(P=
	d.emissiveMap);void 0!==P&&(P instanceof THREE.WebGLRenderTarget&&(P=P.texture),n=P.offset,P=P.repeat,k.offsetRepeat.value.set(n.x,n.y,P.x,P.y));k.envMap.value=d.envMap;k.flipEnvMap.value=d.envMap instanceof THREE.WebGLRenderTargetCube?1:-1;k.reflectivity.value=d.reflectivity;k.refractionRatio.value=d.refractionRatio}d instanceof THREE.LineBasicMaterial?(k.diffuse.value=d.color,k.opacity.value=d.opacity):d instanceof THREE.LineDashedMaterial?(k.diffuse.value=d.color,k.opacity.value=d.opacity,k.dashSize.value=
	d.dashSize,k.totalSize.value=d.dashSize+d.gapSize,k.scale.value=d.scale):d instanceof THREE.PointsMaterial?(k.psColor.value=d.color,k.opacity.value=d.opacity,k.size.value=d.size,k.scale.value=L.height/2,k.map.value=d.map,null!==d.map&&(a=d.map.offset,P=d.map.repeat,k.offsetRepeat.value.set(a.x,a.y,P.x,P.y))):d instanceof THREE.MeshPhongMaterial?(k.specular.value=d.specular,k.shininess.value=Math.max(d.shininess,1E-4),d.lightMap&&(k.lightMap.value=d.lightMap,k.lightMapIntensity.value=d.lightMapIntensity),
	d.emissiveMap&&(k.emissiveMap.value=d.emissiveMap),d.bumpMap&&(k.bumpMap.value=d.bumpMap,k.bumpScale.value=d.bumpScale),d.normalMap&&(k.normalMap.value=d.normalMap,k.normalScale.value.copy(d.normalScale)),d.displacementMap&&(k.displacementMap.value=d.displacementMap,k.displacementScale.value=d.displacementScale,k.displacementBias.value=d.displacementBias)):d instanceof THREE.MeshDepthMaterial?(k.mNear.value=a.near,k.mFar.value=a.far,k.opacity.value=d.opacity):d instanceof THREE.MeshNormalMaterial&&
	(k.opacity.value=d.opacity);if(e.receiveShadow&&!d._shadowPass&&k.shadowMatrix)for(a=d=0,P=b.length;a<P;a++)n=b[a],!0===n.castShadow&&(n instanceof THREE.PointLight||n instanceof THREE.SpotLight||n instanceof THREE.DirectionalLight)&&(c=n.shadow,n instanceof THREE.PointLight?(V.setFromMatrixPosition(n.matrixWorld).negate(),c.matrix.identity().setPosition(V),k.shadowDarkness.value[d]=-c.darkness):k.shadowDarkness.value[d]=c.darkness,k.shadowMatrix.value[d]=c.matrix,k.shadowMap.value[d]=c.map,k.shadowMapSize.value[d]=
	c.mapSize,k.shadowBias.value[d]=c.bias,d++);b=f.uniformsList;f=0;for(d=b.length;f<d;f++)if(a=b[f][0],!1!==a.needsUpdate)switch(k=a.type,c=a.value,P=b[f][1],k){case "1i":r.uniform1i(P,c);break;case "1f":r.uniform1f(P,c);break;case "2f":r.uniform2f(P,c[0],c[1]);break;case "3f":r.uniform3f(P,c[0],c[1],c[2]);break;case "4f":r.uniform4f(P,c[0],c[1],c[2],c[3]);break;case "1iv":r.uniform1iv(P,c);break;case "3iv":r.uniform3iv(P,c);break;case "1fv":r.uniform1fv(P,c);break;case "2fv":r.uniform2fv(P,c);break;
	case "3fv":r.uniform3fv(P,c);break;case "4fv":r.uniform4fv(P,c);break;case "Matrix3fv":r.uniformMatrix3fv(P,!1,c);break;case "Matrix4fv":r.uniformMatrix4fv(P,!1,c);break;case "i":r.uniform1i(P,c);break;case "f":r.uniform1f(P,c);break;case "v2":r.uniform2f(P,c.x,c.y);break;case "v3":r.uniform3f(P,c.x,c.y,c.z);break;case "v4":r.uniform4f(P,c.x,c.y,c.z,c.w);break;case "c":r.uniform3f(P,c.r,c.g,c.b);break;case "iv1":r.uniform1iv(P,c);break;case "iv":r.uniform3iv(P,c);break;case "fv1":r.uniform1fv(P,c);
	break;case "fv":r.uniform3fv(P,c);break;case "v2v":void 0===a._array&&(a._array=new Float32Array(2*c.length));m=k=0;for(n=c.length;k<n;k++,m+=2)a._array[m+0]=c[k].x,a._array[m+1]=c[k].y;r.uniform2fv(P,a._array);break;case "v3v":void 0===a._array&&(a._array=new Float32Array(3*c.length));m=k=0;for(n=c.length;k<n;k++,m+=3)a._array[m+0]=c[k].x,a._array[m+1]=c[k].y,a._array[m+2]=c[k].z;r.uniform3fv(P,a._array);break;case "v4v":void 0===a._array&&(a._array=new Float32Array(4*c.length));m=k=0;for(n=c.length;k<
	n;k++,m+=4)a._array[m+0]=c[k].x,a._array[m+1]=c[k].y,a._array[m+2]=c[k].z,a._array[m+3]=c[k].w;r.uniform4fv(P,a._array);break;case "m3":r.uniformMatrix3fv(P,!1,c.elements);break;case "m3v":void 0===a._array&&(a._array=new Float32Array(9*c.length));k=0;for(n=c.length;k<n;k++)c[k].flattenToArrayOffset(a._array,9*k);r.uniformMatrix3fv(P,!1,a._array);break;case "m4":r.uniformMatrix4fv(P,!1,c.elements);break;case "m4v":void 0===a._array&&(a._array=new Float32Array(16*c.length));k=0;for(n=c.length;k<n;k++)c[k].flattenToArrayOffset(a._array,
	16*k);r.uniformMatrix4fv(P,!1,a._array);break;case "t":m=w();r.uniform1i(P,m);if(!c)continue;c instanceof THREE.CubeTexture||Array.isArray(c.image)&&6===c.image.length?z(c,m):c instanceof THREE.WebGLRenderTargetCube?A(c.texture,m):c instanceof THREE.WebGLRenderTarget?aa.setTexture(c.texture,m):aa.setTexture(c,m);break;case "tv":void 0===a._array&&(a._array=[]);k=0;for(n=a.value.length;k<n;k++)a._array[k]=w();r.uniform1iv(P,a._array);k=0;for(n=a.value.length;k<n;k++)c=a.value[k],m=a._array[k],c&&(c instanceof
	THREE.CubeTexture||c.image instanceof Array&&6===c.image.length?z(c,m):c instanceof THREE.WebGLRenderTarget?aa.setTexture(c.texture,m):c instanceof THREE.WebGLRenderTargetCube?A(c.texture,m):aa.setTexture(c,m));break;default:console.warn("THREE.WebGLRenderer: Unknown uniform type: "+k)}}r.uniformMatrix4fv(p.modelViewMatrix,!1,e.modelViewMatrix.elements);p.normalMatrix&&r.uniformMatrix3fv(p.normalMatrix,!1,e.normalMatrix.elements);void 0!==p.modelMatrix&&r.uniformMatrix4fv(p.modelMatrix,!1,e.matrixWorld.elements);
	return g}function u(a,b){a.ambientLightColor.needsUpdate=b;a.directionalLightColor.needsUpdate=b;a.directionalLightDirection.needsUpdate=b;a.pointLightColor.needsUpdate=b;a.pointLightPosition.needsUpdate=b;a.pointLightDistance.needsUpdate=b;a.pointLightDecay.needsUpdate=b;a.spotLightColor.needsUpdate=b;a.spotLightPosition.needsUpdate=b;a.spotLightDistance.needsUpdate=b;a.spotLightDirection.needsUpdate=b;a.spotLightAngleCos.needsUpdate=b;a.spotLightExponent.needsUpdate=b;a.spotLightDecay.needsUpdate=
	b;a.hemisphereLightSkyColor.needsUpdate=b;a.hemisphereLightGroundColor.needsUpdate=b;a.hemisphereLightDirection.needsUpdate=b}function w(){var a=ya;a>=ha.maxTextures&&console.warn("WebGLRenderer: trying to use "+a+" texture units while this GPU supports only "+ha.maxTextures);ya+=1;return a}function D(a,b,c,d){a[b+0]=c.r*d;a[b+1]=c.g*d;a[b+2]=c.b*d}function x(a,b,c){c?(r.texParameteri(a,r.TEXTURE_WRAP_S,N(b.wrapS)),r.texParameteri(a,r.TEXTURE_WRAP_T,N(b.wrapT)),r.texParameteri(a,r.TEXTURE_MAG_FILTER,
	N(b.magFilter)),r.texParameteri(a,r.TEXTURE_MIN_FILTER,N(b.minFilter))):(r.texParameteri(a,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(a,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),b.wrapS===THREE.ClampToEdgeWrapping&&b.wrapT===THREE.ClampToEdgeWrapping||console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.",b),r.texParameteri(a,r.TEXTURE_MAG_FILTER,C(b.magFilter)),r.texParameteri(a,r.TEXTURE_MIN_FILTER,C(b.minFilter)),
	b.minFilter!==THREE.NearestFilter&&b.minFilter!==THREE.LinearFilter&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.",b));!(c=S.get("EXT_texture_filter_anisotropic"))||b.type===THREE.FloatType&&null===S.get("OES_texture_float_linear")||b.type===THREE.HalfFloatType&&null===S.get("OES_texture_half_float_linear")||!(1<b.anisotropy||W.get(b).__currentAnisotropy)||(r.texParameterf(a,c.TEXTURE_MAX_ANISOTROPY_EXT,
	Math.min(b.anisotropy,aa.getMaxAnisotropy())),W.get(b).__currentAnisotropy=b.anisotropy)}function B(a,b){if(a.width>b||a.height>b){var c=b/Math.max(a.width,a.height),d=document.createElement("canvas");d.width=Math.floor(a.width*c);d.height=Math.floor(a.height*c);d.getContext("2d").drawImage(a,0,0,a.width,a.height,0,0,d.width,d.height);console.warn("THREE.WebGLRenderer: image is too big ("+a.width+"x"+a.height+"). Resized to "+d.width+"x"+d.height,a);return d}return a}function y(a){return THREE.Math.isPowerOfTwo(a.width)&&
	THREE.Math.isPowerOfTwo(a.height)}function z(a,b){var c=W.get(a);if(6===a.image.length)if(0<a.version&&c.__version!==a.version){c.__image__webglTextureCube||(a.addEventListener("dispose",g),c.__image__webglTextureCube=r.createTexture(),la.textures++);I.activeTexture(r.TEXTURE0+b);I.bindTexture(r.TEXTURE_CUBE_MAP,c.__image__webglTextureCube);r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,a.flipY);for(var d=a instanceof THREE.CompressedTexture,e=a.image[0]instanceof THREE.DataTexture,f=[],h=0;6>h;h++)f[h]=!aa.autoScaleCubemaps||
	d||e?e?a.image[h].image:a.image[h]:B(a.image[h],ha.maxCubemapSize);var k=y(f[0]),l=N(a.format),n=N(a.type);x(r.TEXTURE_CUBE_MAP,a,k);for(h=0;6>h;h++)if(d)for(var m,q=f[h].mipmaps,p=0,s=q.length;p<s;p++)m=q[p],a.format!==THREE.RGBAFormat&&a.format!==THREE.RGBFormat?-1<I.getCompressedTextureFormats().indexOf(l)?I.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+h,p,l,m.width,m.height,0,m.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()"):
	I.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+h,p,l,m.width,m.height,0,l,n,m.data);else e?I.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+h,0,l,f[h].width,f[h].height,0,l,n,f[h].data):I.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+h,0,l,l,n,f[h]);a.generateMipmaps&&k&&r.generateMipmap(r.TEXTURE_CUBE_MAP);c.__version=a.version;if(a.onUpdate)a.onUpdate(a)}else I.activeTexture(r.TEXTURE0+b),I.bindTexture(r.TEXTURE_CUBE_MAP,c.__image__webglTextureCube)}function A(a,b){I.activeTexture(r.TEXTURE0+b);I.bindTexture(r.TEXTURE_CUBE_MAP,
	W.get(a).__webglTexture)}function J(a,b,c){r.bindFramebuffer(r.FRAMEBUFFER,a);r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,c,W.get(b.texture).__webglTexture,0)}function F(a,b){r.bindRenderbuffer(r.RENDERBUFFER,a);b.depthBuffer&&!b.stencilBuffer?(r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_COMPONENT16,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,a)):b.depthBuffer&&b.stencilBuffer?(r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,b.width,
	b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,a)):r.renderbufferStorage(r.RENDERBUFFER,r.RGBA4,b.width,b.height)}function C(a){return a===THREE.NearestFilter||a===THREE.NearestMipMapNearestFilter||a===THREE.NearestMipMapLinearFilter?r.NEAREST:r.LINEAR}function N(a){var b;if(a===THREE.RepeatWrapping)return r.REPEAT;if(a===THREE.ClampToEdgeWrapping)return r.CLAMP_TO_EDGE;if(a===THREE.MirroredRepeatWrapping)return r.MIRRORED_REPEAT;if(a===THREE.NearestFilter)return r.NEAREST;
	if(a===THREE.NearestMipMapNearestFilter)return r.NEAREST_MIPMAP_NEAREST;if(a===THREE.NearestMipMapLinearFilter)return r.NEAREST_MIPMAP_LINEAR;if(a===THREE.LinearFilter)return r.LINEAR;if(a===THREE.LinearMipMapNearestFilter)return r.LINEAR_MIPMAP_NEAREST;if(a===THREE.LinearMipMapLinearFilter)return r.LINEAR_MIPMAP_LINEAR;if(a===THREE.UnsignedByteType)return r.UNSIGNED_BYTE;if(a===THREE.UnsignedShort4444Type)return r.UNSIGNED_SHORT_4_4_4_4;if(a===THREE.UnsignedShort5551Type)return r.UNSIGNED_SHORT_5_5_5_1;
	if(a===THREE.UnsignedShort565Type)return r.UNSIGNED_SHORT_5_6_5;if(a===THREE.ByteType)return r.BYTE;if(a===THREE.ShortType)return r.SHORT;if(a===THREE.UnsignedShortType)return r.UNSIGNED_SHORT;if(a===THREE.IntType)return r.INT;if(a===THREE.UnsignedIntType)return r.UNSIGNED_INT;if(a===THREE.FloatType)return r.FLOAT;b=S.get("OES_texture_half_float");if(null!==b&&a===THREE.HalfFloatType)return b.HALF_FLOAT_OES;if(a===THREE.AlphaFormat)return r.ALPHA;if(a===THREE.RGBFormat)return r.RGB;if(a===THREE.RGBAFormat)return r.RGBA;
	if(a===THREE.LuminanceFormat)return r.LUMINANCE;if(a===THREE.LuminanceAlphaFormat)return r.LUMINANCE_ALPHA;if(a===THREE.AddEquation)return r.FUNC_ADD;if(a===THREE.SubtractEquation)return r.FUNC_SUBTRACT;if(a===THREE.ReverseSubtractEquation)return r.FUNC_REVERSE_SUBTRACT;if(a===THREE.ZeroFactor)return r.ZERO;if(a===THREE.OneFactor)return r.ONE;if(a===THREE.SrcColorFactor)return r.SRC_COLOR;if(a===THREE.OneMinusSrcColorFactor)return r.ONE_MINUS_SRC_COLOR;if(a===THREE.SrcAlphaFactor)return r.SRC_ALPHA;
	if(a===THREE.OneMinusSrcAlphaFactor)return r.ONE_MINUS_SRC_ALPHA;if(a===THREE.DstAlphaFactor)return r.DST_ALPHA;if(a===THREE.OneMinusDstAlphaFactor)return r.ONE_MINUS_DST_ALPHA;if(a===THREE.DstColorFactor)return r.DST_COLOR;if(a===THREE.OneMinusDstColorFactor)return r.ONE_MINUS_DST_COLOR;if(a===THREE.SrcAlphaSaturateFactor)return r.SRC_ALPHA_SATURATE;b=S.get("WEBGL_compressed_texture_s3tc");if(null!==b){if(a===THREE.RGB_S3TC_DXT1_Format)return b.COMPRESSED_RGB_S3TC_DXT1_EXT;if(a===THREE.RGBA_S3TC_DXT1_Format)return b.COMPRESSED_RGBA_S3TC_DXT1_EXT;
	if(a===THREE.RGBA_S3TC_DXT3_Format)return b.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(a===THREE.RGBA_S3TC_DXT5_Format)return b.COMPRESSED_RGBA_S3TC_DXT5_EXT}b=S.get("WEBGL_compressed_texture_pvrtc");if(null!==b){if(a===THREE.RGB_PVRTC_4BPPV1_Format)return b.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(a===THREE.RGB_PVRTC_2BPPV1_Format)return b.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(a===THREE.RGBA_PVRTC_4BPPV1_Format)return b.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(a===THREE.RGBA_PVRTC_2BPPV1_Format)return b.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}b=
	S.get("EXT_blend_minmax");if(null!==b){if(a===THREE.MinEquation)return b.MIN_EXT;if(a===THREE.MaxEquation)return b.MAX_EXT}return 0}console.log("THREE.WebGLRenderer",THREE.REVISION);a=a||{};var L=void 0!==a.canvas?a.canvas:document.createElement("canvas"),Q=void 0!==a.context?a.context:null,M=L.width,K=L.height,E=1,O=void 0!==a.alpha?a.alpha:!1,T=void 0!==a.depth?a.depth:!0,H=void 0!==a.stencil?a.stencil:!0,R=void 0!==a.antialias?a.antialias:!1,G=void 0!==a.premultipliedAlpha?a.premultipliedAlpha:
	!0,ia=void 0!==a.preserveDrawingBuffer?a.preserveDrawingBuffer:!1,U=new THREE.Color(0),X=0,da=[],ca=[],ga=-1,Z=[],fa=-1,ma=new Float32Array(8),ea=[],ja=[];this.domElement=L;this.context=null;this.sortObjects=this.autoClearStencil=this.autoClearDepth=this.autoClearColor=this.autoClear=!0;this.gammaFactor=2;this.gammaOutput=this.gammaInput=!1;this.maxMorphTargets=8;this.maxMorphNormals=4;this.autoScaleCubemaps=!0;var aa=this,Aa=null,za=null,ta=-1,sa="",ra=null,ya=0,na=0,oa=0,pa=L.width,qa=L.height,
	Da=0,Ea=0,Ba=new THREE.Frustum,xa=new THREE.Matrix4,V=new THREE.Vector3,Y=new THREE.Vector3,wa=!0,Ca={ambient:[0,0,0],directional:{length:0,colors:[],positions:[]},point:{length:0,colors:[],positions:[],distances:[],decays:[]},spot:{length:0,colors:[],positions:[],distances:[],directions:[],anglesCos:[],exponents:[],decays:[]},hemi:{length:0,skyColors:[],groundColors:[],positions:[]}},la={geometries:0,textures:0},ka={calls:0,vertices:0,faces:0,points:0};this.info={render:ka,memory:la,programs:null};
	var r;try{O={alpha:O,depth:T,stencil:H,antialias:R,premultipliedAlpha:G,preserveDrawingBuffer:ia};r=Q||L.getContext("webgl",O)||L.getContext("experimental-webgl",O);if(null===r){if(null!==L.getContext("webgl"))throw"Error creating WebGL context with your selected attributes.";throw"Error creating WebGL context.";}L.addEventListener("webglcontextlost",e,!1)}catch(Fa){console.error("THREE.WebGLRenderer: "+Fa)}var S=new THREE.WebGLExtensions(r);S.get("OES_texture_float");S.get("OES_texture_float_linear");
	S.get("OES_texture_half_float");S.get("OES_texture_half_float_linear");S.get("OES_standard_derivatives");S.get("ANGLE_instanced_arrays");S.get("OES_element_index_uint")&&(THREE.BufferGeometry.MaxIndex=4294967296);var ha=new THREE.WebGLCapabilities(r,S,a),I=new THREE.WebGLState(r,S,N),W=new THREE.WebGLProperties,va=new THREE.WebGLObjects(r,W,this.info),ua=new THREE.WebGLPrograms(this,ha);this.info.programs=ua.programs;var Ga=new THREE.WebGLBufferRenderer(r,S,ka),Ha=new THREE.WebGLIndexedBufferRenderer(r,
	S,ka);c();this.context=r;this.capabilities=ha;this.extensions=S;this.state=I;var $=new THREE.WebGLShadowMap(this,da,va);this.shadowMap=$;var Ia=new THREE.SpritePlugin(this,ea),Ja=new THREE.LensFlarePlugin(this,ja);this.getContext=function(){return r};this.getContextAttributes=function(){return r.getContextAttributes()};this.forceContextLoss=function(){S.get("WEBGL_lose_context").loseContext()};this.getMaxAnisotropy=function(){var a;return function(){if(void 0!==a)return a;var b=S.get("EXT_texture_filter_anisotropic");
	return a=null!==b?r.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT):0}}();this.getPrecision=function(){return ha.precision};this.getPixelRatio=function(){return E};this.setPixelRatio=function(a){void 0!==a&&(E=a)};this.getSize=function(){return{width:M,height:K}};this.setSize=function(a,b,c){M=a;K=b;L.width=a*E;L.height=b*E;!1!==c&&(L.style.width=a+"px",L.style.height=b+"px");this.setViewport(0,0,a,b)};this.setViewport=function(a,b,c,d){na=a*E;oa=b*E;pa=c*E;qa=d*E;r.viewport(na,oa,pa,qa)};this.getViewport=
	function(a){a.x=na/E;a.y=oa/E;a.z=pa/E;a.w=qa/E};this.setScissor=function(a,b,c,d){r.scissor(a*E,b*E,c*E,d*E)};this.enableScissorTest=function(a){I.setScissorTest(a)};this.getClearColor=function(){return U};this.setClearColor=function(a,c){U.set(a);X=void 0!==c?c:1;b(U.r,U.g,U.b,X)};this.getClearAlpha=function(){return X};this.setClearAlpha=function(a){X=a;b(U.r,U.g,U.b,X)};this.clear=function(a,b,c){var d=0;if(void 0===a||a)d|=r.COLOR_BUFFER_BIT;if(void 0===b||b)d|=r.DEPTH_BUFFER_BIT;if(void 0===
	c||c)d|=r.STENCIL_BUFFER_BIT;r.clear(d)};this.clearColor=function(){r.clear(r.COLOR_BUFFER_BIT)};this.clearDepth=function(){r.clear(r.DEPTH_BUFFER_BIT)};this.clearStencil=function(){r.clear(r.STENCIL_BUFFER_BIT)};this.clearTarget=function(a,b,c,d){this.setRenderTarget(a);this.clear(b,c,d)};this.resetGLState=d;this.dispose=function(){L.removeEventListener("webglcontextlost",e,!1)};this.renderBufferImmediate=function(a,b,c){I.initAttributes();var d=W.get(a);a.hasPositions&&!d.position&&(d.position=
	r.createBuffer());a.hasNormals&&!d.normal&&(d.normal=r.createBuffer());a.hasUvs&&!d.uv&&(d.uv=r.createBuffer());a.hasColors&&!d.color&&(d.color=r.createBuffer());b=b.getAttributes();a.hasPositions&&(r.bindBuffer(r.ARRAY_BUFFER,d.position),r.bufferData(r.ARRAY_BUFFER,a.positionArray,r.DYNAMIC_DRAW),I.enableAttribute(b.position),r.vertexAttribPointer(b.position,3,r.FLOAT,!1,0,0));if(a.hasNormals){r.bindBuffer(r.ARRAY_BUFFER,d.normal);if("MeshPhongMaterial"!==c.type&&c.shading===THREE.FlatShading)for(var e=
	0,f=3*a.count;e<f;e+=9){var g=a.normalArray,h=(g[e+0]+g[e+3]+g[e+6])/3,k=(g[e+1]+g[e+4]+g[e+7])/3,l=(g[e+2]+g[e+5]+g[e+8])/3;g[e+0]=h;g[e+1]=k;g[e+2]=l;g[e+3]=h;g[e+4]=k;g[e+5]=l;g[e+6]=h;g[e+7]=k;g[e+8]=l}r.bufferData(r.ARRAY_BUFFER,a.normalArray,r.DYNAMIC_DRAW);I.enableAttribute(b.normal);r.vertexAttribPointer(b.normal,3,r.FLOAT,!1,0,0)}a.hasUvs&&c.map&&(r.bindBuffer(r.ARRAY_BUFFER,d.uv),r.bufferData(r.ARRAY_BUFFER,a.uvArray,r.DYNAMIC_DRAW),I.enableAttribute(b.uv),r.vertexAttribPointer(b.uv,2,r.FLOAT,
	!1,0,0));a.hasColors&&c.vertexColors!==THREE.NoColors&&(r.bindBuffer(r.ARRAY_BUFFER,d.color),r.bufferData(r.ARRAY_BUFFER,a.colorArray,r.DYNAMIC_DRAW),I.enableAttribute(b.color),r.vertexAttribPointer(b.color,3,r.FLOAT,!1,0,0));I.disableUnusedAttributes();r.drawArrays(r.TRIANGLES,0,a.count);a.count=0};this.renderBufferDirect=function(a,b,c,d,e,f,g){t(e);var h=v(a,b,c,e,f),l=!1;a=d.id+"_"+h.id+"_"+e.wireframe;a!==sa&&(sa=a,l=!0);b=f.morphTargetInfluences;if(void 0!==b){a=[];c=0;for(l=b.length;c<l;c++){var n=
	b[c];a.push([n,c])}a.sort(k);8<a.length&&(a.length=8);var m=d.morphAttributes;c=0;for(l=a.length;c<l;c++)n=a[c],ma[c]=n[0],0!==n[0]?(b=n[1],!0===e.morphTargets&&m.position&&d.addAttribute("morphTarget"+c,m.position[b]),!0===e.morphNormals&&m.normal&&d.addAttribute("morphNormal"+c,m.normal[b])):(!0===e.morphTargets&&d.removeAttribute("morphTarget"+c),!0===e.morphNormals&&d.removeAttribute("morphNormal"+c));a=h.getUniforms();null!==a.morphTargetInfluences&&r.uniform1fv(a.morphTargetInfluences,ma);l=
	!0}b=d.index;c=d.attributes.position;!0===e.wireframe&&(b=va.getWireframeAttribute(d));null!==b?(a=Ha,a.setIndex(b)):a=Ga;if(l){a:{var l=void 0,q;if(d instanceof THREE.InstancedBufferGeometry&&(q=S.get("ANGLE_instanced_arrays"),null===q)){console.error("THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");break a}void 0===l&&(l=0);I.initAttributes();var n=d.attributes,h=h.getAttributes(),m=e.defaultAttributeValues,
	p;for(p in h){var s=h[p];if(0<=s){var u=n[p];if(void 0!==u){var w=u.itemSize,x=va.getAttributeBuffer(u);if(u instanceof THREE.InterleavedBufferAttribute){var F=u.data,D=F.stride,u=u.offset;F instanceof THREE.InstancedInterleavedBuffer?(I.enableAttributeAndDivisor(s,F.meshPerAttribute,q),void 0===d.maxInstancedCount&&(d.maxInstancedCount=F.meshPerAttribute*F.count)):I.enableAttribute(s);r.bindBuffer(r.ARRAY_BUFFER,x);r.vertexAttribPointer(s,w,r.FLOAT,!1,D*F.array.BYTES_PER_ELEMENT,(l*D+u)*F.array.BYTES_PER_ELEMENT)}else u instanceof
	THREE.InstancedBufferAttribute?(I.enableAttributeAndDivisor(s,u.meshPerAttribute,q),void 0===d.maxInstancedCount&&(d.maxInstancedCount=u.meshPerAttribute*u.count)):I.enableAttribute(s),r.bindBuffer(r.ARRAY_BUFFER,x),r.vertexAttribPointer(s,w,r.FLOAT,!1,0,l*w*4)}else if(void 0!==m&&(w=m[p],void 0!==w))switch(w.length){case 2:r.vertexAttrib2fv(s,w);break;case 3:r.vertexAttrib3fv(s,w);break;case 4:r.vertexAttrib4fv(s,w);break;default:r.vertexAttrib1fv(s,w)}}}I.disableUnusedAttributes()}null!==b&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,
	va.getAttributeBuffer(b))}q=Infinity;null!==b?q=b.count:void 0!==c&&(q=c.count);p=d.drawRange.start;b=d.drawRange.count;c=null!==g?g.start:0;l=null!==g?g.count:Infinity;g=Math.max(0,p,c);q=Math.min(0+q,p+b,c+l)-1;q=Math.max(0,q-g+1);f instanceof THREE.Mesh?(!0===e.wireframe?(I.setLineWidth(e.wireframeLinewidth*E),a.setMode(r.LINES)):a.setMode(r.TRIANGLES),d instanceof THREE.InstancedBufferGeometry&&0<d.maxInstancedCount?a.renderInstances(d):a.render(g,q)):f instanceof THREE.Line?(d=e.linewidth,void 0===
	d&&(d=1),I.setLineWidth(d*E),f instanceof THREE.LineSegments?a.setMode(r.LINES):a.setMode(r.LINE_STRIP),a.render(g,q)):f instanceof THREE.Points&&(a.setMode(r.POINTS),a.render(g,q))};this.render=function(a,b,c,d){if(!1===b instanceof THREE.Camera)console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");else{var e=a.fog;sa="";ta=-1;ra=null;wa=!0;!0===a.autoUpdate&&a.updateMatrixWorld();null===b.parent&&b.updateMatrixWorld();b.matrixWorldInverse.getInverse(b.matrixWorld);
	xa.multiplyMatrices(b.projectionMatrix,b.matrixWorldInverse);Ba.setFromMatrix(xa);da.length=0;fa=ga=-1;ea.length=0;ja.length=0;q(a,b);ca.length=ga+1;Z.length=fa+1;!0===aa.sortObjects&&(ca.sort(m),Z.sort(p));$.render(a);ka.calls=0;ka.vertices=0;ka.faces=0;ka.points=0;this.setRenderTarget(c);(this.autoClear||d)&&this.clear(this.autoClearColor,this.autoClearDepth,this.autoClearStencil);a.overrideMaterial?(d=a.overrideMaterial,s(ca,b,da,e,d),s(Z,b,da,e,d)):(I.setBlending(THREE.NoBlending),s(ca,b,da,e),
	s(Z,b,da,e));Ia.render(a,b);Ja.render(a,b,Da,Ea);c&&(a=c.texture,b=y(c),a.generateMipmaps&&b&&a.minFilter!==THREE.NearestFilter&&a.minFilter!==THREE.LinearFilter&&(a=c instanceof THREE.WebGLRenderTargetCube?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,c=W.get(c.texture).__webglTexture,I.bindTexture(a,c),r.generateMipmap(a),I.bindTexture(a,null)));I.setDepthTest(!0);I.setDepthWrite(!0);I.setColorWrite(!0)}};this.setFaceCulling=function(a,b){a===THREE.CullFaceNone?I.disable(r.CULL_FACE):(b===THREE.FrontFaceDirectionCW?
	r.frontFace(r.CW):r.frontFace(r.CCW),a===THREE.CullFaceBack?r.cullFace(r.BACK):a===THREE.CullFaceFront?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK),I.enable(r.CULL_FACE))};this.setTexture=function(a,b){var c=W.get(a);if(0<a.version&&c.__version!==a.version){var d=a.image;if(void 0===d)console.warn("THREE.WebGLRenderer: Texture marked for update but image is undefined",a);else if(!1===d.complete)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete",a);else{void 0===
	c.__webglInit&&(c.__webglInit=!0,a.addEventListener("dispose",g),c.__webglTexture=r.createTexture(),la.textures++);I.activeTexture(r.TEXTURE0+b);I.bindTexture(r.TEXTURE_2D,c.__webglTexture);r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,a.flipY);r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha);r.pixelStorei(r.UNPACK_ALIGNMENT,a.unpackAlignment);a.image=B(a.image,ha.maxTextureSize);if((a.wrapS!==THREE.ClampToEdgeWrapping||a.wrapT!==THREE.ClampToEdgeWrapping||a.minFilter!==THREE.NearestFilter&&
	a.minFilter!==THREE.LinearFilter)&&!1===y(a.image)){d=a.image;if(d instanceof HTMLImageElement||d instanceof HTMLCanvasElement){var e=document.createElement("canvas");e.width=THREE.Math.nearestPowerOfTwo(d.width);e.height=THREE.Math.nearestPowerOfTwo(d.height);e.getContext("2d").drawImage(d,0,0,e.width,e.height);console.warn("THREE.WebGLRenderer: image is not power of two ("+d.width+"x"+d.height+"). Resized to "+e.width+"x"+e.height,d);d=e}a.image=d}var f=a.image,d=y(f),e=N(a.format),h=N(a.type);
	x(r.TEXTURE_2D,a,d);var k=a.mipmaps;if(a instanceof THREE.DataTexture)if(0<k.length&&d){for(var l=0,n=k.length;l<n;l++)f=k[l],I.texImage2D(r.TEXTURE_2D,l,e,f.width,f.height,0,e,h,f.data);a.generateMipmaps=!1}else I.texImage2D(r.TEXTURE_2D,0,e,f.width,f.height,0,e,h,f.data);else if(a instanceof THREE.CompressedTexture)for(l=0,n=k.length;l<n;l++)f=k[l],a.format!==THREE.RGBAFormat&&a.format!==THREE.RGBFormat?-1<I.getCompressedTextureFormats().indexOf(e)?I.compressedTexImage2D(r.TEXTURE_2D,l,e,f.width,
	f.height,0,f.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I.texImage2D(r.TEXTURE_2D,l,e,f.width,f.height,0,e,h,f.data);else if(0<k.length&&d){l=0;for(n=k.length;l<n;l++)f=k[l],I.texImage2D(r.TEXTURE_2D,l,e,e,h,f);a.generateMipmaps=!1}else I.texImage2D(r.TEXTURE_2D,0,e,e,h,a.image);a.generateMipmaps&&d&&r.generateMipmap(r.TEXTURE_2D);c.__version=a.version;if(a.onUpdate)a.onUpdate(a)}}else I.activeTexture(r.TEXTURE0+b),I.bindTexture(r.TEXTURE_2D,
	c.__webglTexture)};this.setRenderTarget=function(a){var b=a instanceof THREE.WebGLRenderTargetCube;if(a&&void 0===W.get(a).__webglFramebuffer){var c=W.get(a),d=W.get(a.texture);void 0===a.depthBuffer&&(a.depthBuffer=!0);void 0===a.stencilBuffer&&(a.stencilBuffer=!0);a.addEventListener("dispose",f);d.__webglTexture=r.createTexture();la.textures++;var e=y(a),g=N(a.texture.format),h=N(a.texture.type);if(b){c.__webglFramebuffer=[];c.__webglRenderbuffer=[];I.bindTexture(r.TEXTURE_CUBE_MAP,d.__webglTexture);
	x(r.TEXTURE_CUBE_MAP,a.texture,e);for(d=0;6>d;d++)c.__webglFramebuffer[d]=r.createFramebuffer(),c.__webglRenderbuffer[d]=r.createRenderbuffer(),I.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+d,0,g,a.width,a.height,0,g,h,null),J(c.__webglFramebuffer[d],a,r.TEXTURE_CUBE_MAP_POSITIVE_X+d),F(c.__webglRenderbuffer[d],a);a.texture.generateMipmaps&&e&&r.generateMipmap(r.TEXTURE_CUBE_MAP)}else c.__webglFramebuffer=r.createFramebuffer(),c.__webglRenderbuffer=a.shareDepthFrom?a.shareDepthFrom.__webglRenderbuffer:
	r.createRenderbuffer(),I.bindTexture(r.TEXTURE_2D,d.__webglTexture),x(r.TEXTURE_2D,a.texture,e),I.texImage2D(r.TEXTURE_2D,0,g,a.width,a.height,0,g,h,null),J(c.__webglFramebuffer,a,r.TEXTURE_2D),a.shareDepthFrom?a.depthBuffer&&!a.stencilBuffer?r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,c.__webglRenderbuffer):a.depthBuffer&&a.stencilBuffer&&r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,c.__webglRenderbuffer):F(c.__webglRenderbuffer,
	a),a.texture.generateMipmaps&&e&&r.generateMipmap(r.TEXTURE_2D);b?I.bindTexture(r.TEXTURE_CUBE_MAP,null):I.bindTexture(r.TEXTURE_2D,null);r.bindRenderbuffer(r.RENDERBUFFER,null);r.bindFramebuffer(r.FRAMEBUFFER,null)}a?(c=W.get(a),d=b?c.__webglFramebuffer[a.activeCubeFace]:c.__webglFramebuffer,c=a.width,e=a.height,h=g=0):(d=null,c=pa,e=qa,g=na,h=oa);d!==za&&(r.bindFramebuffer(r.FRAMEBUFFER,d),r.viewport(g,h,c,e),za=d);b&&(d=W.get(a.texture),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,
	r.TEXTURE_CUBE_MAP_POSITIVE_X+a.activeCubeFace,d.__webglTexture,0));Da=c;Ea=e};this.readRenderTargetPixels=function(a,b,c,d,e,f){if(!1===a instanceof THREE.WebGLRenderTarget)console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");else{var g=W.get(a).__webglFramebuffer;if(g){var h=!1;g!==za&&(r.bindFramebuffer(r.FRAMEBUFFER,g),h=!0);try{var k=a.texture;k.format!==THREE.RGBAFormat&&N(k.format)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)?console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format."):
	k.type===THREE.UnsignedByteType||N(k.type)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)||k.type===THREE.FloatType&&S.get("WEBGL_color_buffer_float")||k.type===THREE.HalfFloatType&&S.get("EXT_color_buffer_half_float")?r.checkFramebufferStatus(r.FRAMEBUFFER)===r.FRAMEBUFFER_COMPLETE?r.readPixels(b,c,d,e,N(k.format),N(k.type),f):console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete."):console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.")}finally{h&&
	r.bindFramebuffer(r.FRAMEBUFFER,za)}}}};this.supportsFloatTextures=function(){console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' ).");return S.get("OES_texture_float")};this.supportsHalfFloatTextures=function(){console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' ).");return S.get("OES_texture_half_float")};this.supportsStandardDerivatives=function(){console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' ).");
	return S.get("OES_standard_derivatives")};this.supportsCompressedTextureS3TC=function(){console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' ).");return S.get("WEBGL_compressed_texture_s3tc")};this.supportsCompressedTexturePVRTC=function(){console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' ).");return S.get("WEBGL_compressed_texture_pvrtc")};this.supportsBlendMinMax=
	function(){console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' ).");return S.get("EXT_blend_minmax")};this.supportsVertexTextures=function(){return ha.vertexTextures};this.supportsInstancedArrays=function(){console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' ).");return S.get("ANGLE_instanced_arrays")};this.initMaterial=function(){console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")};
	this.addPrePlugin=function(){console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")};this.addPostPlugin=function(){console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")};this.updateShadowMap=function(){console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")};Object.defineProperties(this,{shadowMapEnabled:{get:function(){return $.enabled},set:function(a){console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.");$.enabled=a}},
	shadowMapType:{get:function(){return $.type},set:function(a){console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.");$.type=a}},shadowMapCullFace:{get:function(){return $.cullFace},set:function(a){console.warn("THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.");$.cullFace=a}},shadowMapDebug:{get:function(){return $.debug},set:function(a){console.warn("THREE.WebGLRenderer: .shadowMapDebug is now .shadowMap.debug.");$.debug=a}}})};
	THREE.WebGLRenderTarget=function(a,b,c){this.uuid=THREE.Math.generateUUID();this.width=a;this.height=b;c=c||{};void 0===c.minFilter&&(c.minFilter=THREE.LinearFilter);this.texture=new THREE.Texture(void 0,void 0,c.wrapS,c.wrapT,c.magFilter,c.minFilter,c.format,c.type,c.anisotropy);this.depthBuffer=void 0!==c.depthBuffer?c.depthBuffer:!0;this.stencilBuffer=void 0!==c.stencilBuffer?c.stencilBuffer:!0;this.shareDepthFrom=void 0!==c.shareDepthFrom?c.shareDepthFrom:null};
	THREE.WebGLRenderTarget.prototype={constructor:THREE.WebGLRenderTarget,get wrapS(){console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.");return this.texture.wrapS},set wrapS(a){console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.");this.texture.wrapS=a},get wrapT(){console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.");return this.texture.wrapT},set wrapT(a){console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.");this.texture.wrapT=a},
	get magFilter(){console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.");return this.texture.magFilter},set magFilter(a){console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.");this.texture.magFilter=a},get minFilter(){console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.");return this.texture.minFilter},set minFilter(a){console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.");this.texture.minFilter=a},get anisotropy(){console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.");
	return this.texture.anisotropy},set anisotropy(a){console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.");this.texture.anisotropy=a},get offset(){console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset.");return this.texture.offset},set offset(a){console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset.");this.texture.offset=a},get repeat(){console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat.");return this.texture.repeat},set repeat(a){console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat.");
	this.texture.repeat=a},get format(){console.warn("THREE.WebGLRenderTarget: .format is now .texture.format.");return this.texture.format},set format(a){console.warn("THREE.WebGLRenderTarget: .format is now .texture.format.");this.texture.format=a},get type(){console.warn("THREE.WebGLRenderTarget: .type is now .texture.type.");return this.texture.type},set type(a){console.warn("THREE.WebGLRenderTarget: .type is now .texture.type.");this.texture.type=a},get generateMipmaps(){console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.");
	return this.texture.generateMipmaps},set generateMipmaps(a){console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.");this.texture.generateMipmaps=a},setSize:function(a,b){if(this.width!==a||this.height!==b)this.width=a,this.height=b,this.dispose()},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.width=a.width;this.height=a.height;this.texture=a.texture.clone();this.depthBuffer=a.depthBuffer;this.stencilBuffer=a.stencilBuffer;this.shareDepthFrom=
	a.shareDepthFrom;return this},dispose:function(){this.dispatchEvent({type:"dispose"})}};THREE.EventDispatcher.prototype.apply(THREE.WebGLRenderTarget.prototype);THREE.WebGLRenderTargetCube=function(a,b,c){THREE.WebGLRenderTarget.call(this,a,b,c);this.activeCubeFace=0};THREE.WebGLRenderTargetCube.prototype=Object.create(THREE.WebGLRenderTarget.prototype);THREE.WebGLRenderTargetCube.prototype.constructor=THREE.WebGLRenderTargetCube;
	THREE.WebGLBufferRenderer=function(a,b,c){var d;this.setMode=function(a){d=a};this.render=function(b,g){a.drawArrays(d,b,g);c.calls++;c.vertices+=g;d===a.TRIANGLES&&(c.faces+=g/3)};this.renderInstances=function(a){var c=b.get("ANGLE_instanced_arrays");if(null===c)console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");else{var f=a.attributes.position;f instanceof THREE.InterleavedBufferAttribute?c.drawArraysInstancedANGLE(d,
	0,f.data.count,a.maxInstancedCount):c.drawArraysInstancedANGLE(d,0,f.count,a.maxInstancedCount)}}};
	THREE.WebGLIndexedBufferRenderer=function(a,b,c){var d,e,g;this.setMode=function(a){d=a};this.setIndex=function(c){c.array instanceof Uint32Array&&b.get("OES_element_index_uint")?(e=a.UNSIGNED_INT,g=4):(e=a.UNSIGNED_SHORT,g=2)};this.render=function(b,h){a.drawElements(d,h,e,b*g);c.calls++;c.vertices+=h;d===a.TRIANGLES&&(c.faces+=h/3)};this.renderInstances=function(a){var c=b.get("ANGLE_instanced_arrays");null===c?console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."):
	c.drawElementsInstancedANGLE(d,a.index.array.length,e,0,a.maxInstancedCount)}};
	THREE.WebGLExtensions=function(a){var b={};this.get=function(c){if(void 0!==b[c])return b[c];var d;switch(c){case "EXT_texture_filter_anisotropic":d=a.getExtension("EXT_texture_filter_anisotropic")||a.getExtension("MOZ_EXT_texture_filter_anisotropic")||a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case "WEBGL_compressed_texture_s3tc":d=a.getExtension("WEBGL_compressed_texture_s3tc")||a.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
	break;case "WEBGL_compressed_texture_pvrtc":d=a.getExtension("WEBGL_compressed_texture_pvrtc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:d=a.getExtension(c)}null===d&&console.warn("THREE.WebGLRenderer: "+c+" extension not supported.");return b[c]=d}};
	THREE.WebGLCapabilities=function(a,b,c){function d(b){if("highp"===b){if(0<a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision&&0<a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision)return"highp";b="mediump"}return"mediump"===b&&0<a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision&&0<a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision?"mediump":"lowp"}this.getMaxPrecision=d;this.precision=void 0!==c.precision?c.precision:"highp";
	this.logarithmicDepthBuffer=void 0!==c.logarithmicDepthBuffer?c.logarithmicDepthBuffer:!1;this.maxTextures=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS);this.maxVertexTextures=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS);this.maxTextureSize=a.getParameter(a.MAX_TEXTURE_SIZE);this.maxCubemapSize=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE);this.maxAttributes=a.getParameter(a.MAX_VERTEX_ATTRIBS);this.maxVertexUniforms=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS);this.maxVaryings=a.getParameter(a.MAX_VARYING_VECTORS);
	this.maxFragmentUniforms=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS);this.vertexTextures=0<this.maxVertexTextures;this.floatFragmentTextures=!!b.get("OES_texture_float");this.floatVertexTextures=this.vertexTextures&&this.floatFragmentTextures;c=d(this.precision);c!==this.precision&&(console.warn("THREE.WebGLRenderer:",this.precision,"not supported, using",c,"instead."),this.precision=c);this.logarithmicDepthBuffer&&(this.logarithmicDepthBuffer=!!b.get("EXT_frag_depth"))};
	THREE.WebGLGeometries=function(a,b,c){function d(a){a=a.target;var h=g[a.id].attributes,l;for(l in h)e(h[l]);a.removeEventListener("dispose",d);delete g[a.id];l=b.get(a);l.wireframe&&e(l.wireframe);c.memory.geometries--}function e(c){var d;d=c instanceof THREE.InterleavedBufferAttribute?b.get(c.data).__webglBuffer:b.get(c).__webglBuffer;void 0!==d&&(a.deleteBuffer(d),c instanceof THREE.InterleavedBufferAttribute?b.delete(c.data):b.delete(c))}var g={};this.get=function(a){var b=a.geometry;if(void 0!==
	g[b.id])return g[b.id];b.addEventListener("dispose",d);var e;b instanceof THREE.BufferGeometry?e=b:b instanceof THREE.Geometry&&(void 0===b._bufferGeometry&&(b._bufferGeometry=(new THREE.BufferGeometry).setFromObject(a)),e=b._bufferGeometry);g[b.id]=e;c.memory.geometries++;return e}};
	THREE.WebGLObjects=function(a,b,c){function d(c,d){var e=c instanceof THREE.InterleavedBufferAttribute?c.data:c,g=b.get(e);void 0===g.__webglBuffer?(g.__webglBuffer=a.createBuffer(),a.bindBuffer(d,g.__webglBuffer),a.bufferData(d,e.array,e.dynamic?a.DYNAMIC_DRAW:a.STATIC_DRAW),g.version=e.version):g.version!==e.version&&(a.bindBuffer(d,g.__webglBuffer),!1===e.dynamic||-1===e.updateRange.count?a.bufferSubData(d,0,e.array):0===e.updateRange.count?console.error("THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually."):
	(a.bufferSubData(d,e.updateRange.offset*e.array.BYTES_PER_ELEMENT,e.array.subarray(e.updateRange.offset,e.updateRange.offset+e.updateRange.count)),e.updateRange.count=0),g.version=e.version)}function e(a,b,c){if(b>c){var d=b;b=c;c=d}d=a[b];return void 0===d?(a[b]=[c],!0):-1===d.indexOf(c)?(d.push(c),!0):!1}var g=new THREE.WebGLGeometries(a,b,c);this.getAttributeBuffer=function(a){return a instanceof THREE.InterleavedBufferAttribute?b.get(a.data).__webglBuffer:b.get(a).__webglBuffer};this.getWireframeAttribute=
	function(c){var g=b.get(c);if(void 0!==g.wireframe)return g.wireframe;var l=[],k=c.index,m=c.attributes;c=m.position;if(null!==k)for(var m={},k=k.array,p=0,n=k.length;p<n;p+=3){var q=k[p+0],s=k[p+1],t=k[p+2];e(m,q,s)&&l.push(q,s);e(m,s,t)&&l.push(s,t);e(m,t,q)&&l.push(t,q)}else for(k=m.position.array,p=0,n=k.length/3-1;p<n;p+=3)q=p+0,s=p+1,t=p+2,l.push(q,s,s,t,t,q);l=new THREE.BufferAttribute(new (65535<c.count?Uint32Array:Uint16Array)(l),1);d(l,a.ELEMENT_ARRAY_BUFFER);return g.wireframe=l};this.update=
	function(b){var c=g.get(b);b.geometry instanceof THREE.Geometry&&c.updateFromObject(b);b=c.index;var e=c.attributes;null!==b&&d(b,a.ELEMENT_ARRAY_BUFFER);for(var k in e)d(e[k],a.ARRAY_BUFFER);b=c.morphAttributes;for(k in b)for(var e=b[k],m=0,p=e.length;m<p;m++)d(e[m],a.ARRAY_BUFFER);return c}};
	THREE.WebGLProgram=function(){function a(a){var b=[],c;for(c in a){var f=a[c];!1!==f&&b.push("#define "+c+" "+f)}return b.join("\n")}function b(a){return""!==a}var c=0;return function(d,e,g,f){var h=d.context,l=g.defines,k=g.__webglShader.vertexShader,m=g.__webglShader.fragmentShader,p="SHADOWMAP_TYPE_BASIC";f.shadowMapType===THREE.PCFShadowMap?p="SHADOWMAP_TYPE_PCF":f.shadowMapType===THREE.PCFSoftShadowMap&&(p="SHADOWMAP_TYPE_PCF_SOFT");var n="ENVMAP_TYPE_CUBE",q="ENVMAP_MODE_REFLECTION",s="ENVMAP_BLENDING_MULTIPLY";
	if(f.envMap){switch(g.envMap.mapping){case THREE.CubeReflectionMapping:case THREE.CubeRefractionMapping:n="ENVMAP_TYPE_CUBE";break;case THREE.EquirectangularReflectionMapping:case THREE.EquirectangularRefractionMapping:n="ENVMAP_TYPE_EQUIREC";break;case THREE.SphericalReflectionMapping:n="ENVMAP_TYPE_SPHERE"}switch(g.envMap.mapping){case THREE.CubeRefractionMapping:case THREE.EquirectangularRefractionMapping:q="ENVMAP_MODE_REFRACTION"}switch(g.combine){case THREE.MultiplyOperation:s="ENVMAP_BLENDING_MULTIPLY";
	break;case THREE.MixOperation:s="ENVMAP_BLENDING_MIX";break;case THREE.AddOperation:s="ENVMAP_BLENDING_ADD"}}var t=0<d.gammaFactor?d.gammaFactor:1,v=a(l),u=h.createProgram();g instanceof THREE.RawShaderMaterial?d=l="":(l=["precision "+f.precision+" float;","precision "+f.precision+" int;","#define SHADER_NAME "+g.__webglShader.name,v,f.supportsVertexTextures?"#define VERTEX_TEXTURES":"",d.gammaInput?"#define GAMMA_INPUT":"",d.gammaOutput?"#define GAMMA_OUTPUT":"","#define GAMMA_FACTOR "+t,"#define MAX_DIR_LIGHTS "+
	f.maxDirLights,"#define MAX_POINT_LIGHTS "+f.maxPointLights,"#define MAX_SPOT_LIGHTS "+f.maxSpotLights,"#define MAX_HEMI_LIGHTS "+f.maxHemiLights,"#define MAX_SHADOWS "+f.maxShadows,"#define MAX_BONES "+f.maxBones,f.map?"#define USE_MAP":"",f.envMap?"#define USE_ENVMAP":"",f.envMap?"#define "+q:"",f.lightMap?"#define USE_LIGHTMAP":"",f.aoMap?"#define USE_AOMAP":"",f.emissiveMap?"#define USE_EMISSIVEMAP":"",f.bumpMap?"#define USE_BUMPMAP":"",f.normalMap?"#define USE_NORMALMAP":"",f.displacementMap&&
	f.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",f.specularMap?"#define USE_SPECULARMAP":"",f.alphaMap?"#define USE_ALPHAMAP":"",f.vertexColors?"#define USE_COLOR":"",f.flatShading?"#define FLAT_SHADED":"",f.skinning?"#define USE_SKINNING":"",f.useVertexTexture?"#define BONE_TEXTURE":"",f.morphTargets?"#define USE_MORPHTARGETS":"",f.morphNormals&&!1===f.flatShading?"#define USE_MORPHNORMALS":"",f.doubleSided?"#define DOUBLE_SIDED":"",f.flipSided?"#define FLIP_SIDED":"",f.shadowMapEnabled?
	"#define USE_SHADOWMAP":"",f.shadowMapEnabled?"#define "+p:"",f.shadowMapDebug?"#define SHADOWMAP_DEBUG":"",0<f.pointLightShadows?"#define POINT_LIGHT_SHADOWS":"",f.sizeAttenuation?"#define USE_SIZEATTENUATION":"",f.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",f.logarithmicDepthBuffer&&d.extensions.get("EXT_frag_depth")?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;",
	"uniform vec3 cameraPosition;","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_COLOR","\tattribute vec3 color;","#endif","#ifdef USE_MORPHTARGETS","\tattribute vec3 morphTarget0;","\tattribute vec3 morphTarget1;","\tattribute vec3 morphTarget2;","\tattribute vec3 morphTarget3;","\t#ifdef USE_MORPHNORMALS","\t\tattribute vec3 morphNormal0;","\t\tattribute vec3 morphNormal1;","\t\tattribute vec3 morphNormal2;","\t\tattribute vec3 morphNormal3;","\t#else","\t\tattribute vec3 morphTarget4;",
	"\t\tattribute vec3 morphTarget5;","\t\tattribute vec3 morphTarget6;","\t\tattribute vec3 morphTarget7;","\t#endif","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif","\n"].filter(b).join("\n"),d=[f.bumpMap||f.normalMap||f.flatShading||g.derivatives?"#extension GL_OES_standard_derivatives : enable":"",f.logarithmicDepthBuffer&&d.extensions.get("EXT_frag_depth")?"#extension GL_EXT_frag_depth : enable":"","precision "+f.precision+" float;","precision "+
	f.precision+" int;","#define SHADER_NAME "+g.__webglShader.name,v,"#define MAX_DIR_LIGHTS "+f.maxDirLights,"#define MAX_POINT_LIGHTS "+f.maxPointLights,"#define MAX_SPOT_LIGHTS "+f.maxSpotLights,"#define MAX_HEMI_LIGHTS "+f.maxHemiLights,"#define MAX_SHADOWS "+f.maxShadows,f.alphaTest?"#define ALPHATEST "+f.alphaTest:"",d.gammaInput?"#define GAMMA_INPUT":"",d.gammaOutput?"#define GAMMA_OUTPUT":"","#define GAMMA_FACTOR "+t,f.useFog&&f.fog?"#define USE_FOG":"",f.useFog&&f.fogExp?"#define FOG_EXP2":
	"",f.map?"#define USE_MAP":"",f.envMap?"#define USE_ENVMAP":"",f.envMap?"#define "+n:"",f.envMap?"#define "+q:"",f.envMap?"#define "+s:"",f.lightMap?"#define USE_LIGHTMAP":"",f.aoMap?"#define USE_AOMAP":"",f.emissiveMap?"#define USE_EMISSIVEMAP":"",f.bumpMap?"#define USE_BUMPMAP":"",f.normalMap?"#define USE_NORMALMAP":"",f.specularMap?"#define USE_SPECULARMAP":"",f.alphaMap?"#define USE_ALPHAMAP":"",f.vertexColors?"#define USE_COLOR":"",f.flatShading?"#define FLAT_SHADED":"",f.metal?"#define METAL":
	"",f.doubleSided?"#define DOUBLE_SIDED":"",f.flipSided?"#define FLIP_SIDED":"",f.shadowMapEnabled?"#define USE_SHADOWMAP":"",f.shadowMapEnabled?"#define "+p:"",f.shadowMapDebug?"#define SHADOWMAP_DEBUG":"",0<f.pointLightShadows?"#define POINT_LIGHT_SHADOWS":"",f.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",f.logarithmicDepthBuffer&&d.extensions.get("EXT_frag_depth")?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","\n"].filter(b).join("\n"));m=d+m;
	k=THREE.WebGLShader(h,h.VERTEX_SHADER,l+k);m=THREE.WebGLShader(h,h.FRAGMENT_SHADER,m);h.attachShader(u,k);h.attachShader(u,m);void 0!==g.index0AttributeName?h.bindAttribLocation(u,0,g.index0AttributeName):!0===f.morphTargets&&h.bindAttribLocation(u,0,"position");h.linkProgram(u);f=h.getProgramInfoLog(u);p=h.getShaderInfoLog(k);n=h.getShaderInfoLog(m);s=q=!0;if(!1===h.getProgramParameter(u,h.LINK_STATUS))q=!1,console.error("THREE.WebGLProgram: shader error: ",h.getError(),"gl.VALIDATE_STATUS",h.getProgramParameter(u,
	h.VALIDATE_STATUS),"gl.getProgramInfoLog",f,p,n);else if(""!==f)console.warn("THREE.WebGLProgram: gl.getProgramInfoLog()",f);else if(""===p||""===n)s=!1;s&&(this.diagnostics={runnable:q,material:g,programLog:f,vertexShader:{log:p,prefix:l},fragmentShader:{log:n,prefix:d}});h.deleteShader(k);h.deleteShader(m);var w;this.getUniforms=function(){if(void 0===w){for(var a={},b=h.getProgramParameter(u,h.ACTIVE_UNIFORMS),c=0;c<b;c++){var d=h.getActiveUniform(u,c).name,e=h.getUniformLocation(u,d),f=d.lastIndexOf("[0]");
	-1!==f&&f===d.length-3&&(a[d.substr(0,f)]=e);a[d]=e}w=a}return w};var D;this.getAttributes=function(){if(void 0===D){for(var a={},b=h.getProgramParameter(u,h.ACTIVE_ATTRIBUTES),c=0;c<b;c++){var d=h.getActiveAttrib(u,c).name;a[d]=h.getAttribLocation(u,d)}D=a}return D};this.destroy=function(){h.deleteProgram(u);this.program=void 0};Object.defineProperties(this,{uniforms:{get:function(){console.warn("THREE.WebGLProgram: .uniforms is now .getUniforms().");return this.getUniforms()}},attributes:{get:function(){console.warn("THREE.WebGLProgram: .attributes is now .getAttributes().");
	return this.getAttributes()}}});this.id=c++;this.code=e;this.usedTimes=1;this.program=u;this.vertexShader=k;this.fragmentShader=m;return this}}();
	THREE.WebGLPrograms=function(a,b){var c=[],d={MeshDepthMaterial:"depth",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points"},e="precision supportsVertexTextures map envMap envMapMode lightMap aoMap emissiveMap bumpMap normalMap displacementMap specularMap alphaMap combine vertexColors fog useFog fogExp flatShading sizeAttenuation logarithmicDepthBuffer skinning maxBones useVertexTexture morphTargets morphNormals maxMorphTargets maxMorphNormals maxDirLights maxPointLights maxSpotLights maxHemiLights maxShadows shadowMapEnabled pointLightShadows shadowMapType shadowMapDebug alphaTest metal doubleSided flipSided".split(" ");this.getParameters=
	function(c,e,h,l){var k,m,p,n,q,s=d[c.type];k=q=n=p=m=0;for(var t=e.length;k<t;k++){var v=e[k];!1!==v.visible&&(v instanceof THREE.DirectionalLight&&m++,v instanceof THREE.PointLight&&p++,v instanceof THREE.SpotLight&&n++,v instanceof THREE.HemisphereLight&&q++)}for(var v=k=t=0,u=e.length;v<u;v++){var w=e[v];w.castShadow&&((w instanceof THREE.SpotLight||w instanceof THREE.DirectionalLight)&&t++,w instanceof THREE.PointLight&&(t++,k++))}e=t;b.floatVertexTextures&&l&&l.skeleton&&l.skeleton.useVertexTexture?
	t=1024:(t=Math.floor((b.maxVertexUniforms-20)/4),void 0!==l&&l instanceof THREE.SkinnedMesh&&(t=Math.min(l.skeleton.bones.length,t),t<l.skeleton.bones.length&&console.warn("WebGLRenderer: too many bones - "+l.skeleton.bones.length+", this GPU supports just "+t+" (try OpenGL instead of ANGLE)")));v=a.getPrecision();null!==c.precision&&(v=b.getMaxPrecision(c.precision),v!==c.precision&&console.warn("THREE.WebGLRenderer.initMaterial:",c.precision,"not supported, using",v,"instead."));return{shaderID:s,
	precision:v,supportsVertexTextures:b.vertexTextures,map:!!c.map,envMap:!!c.envMap,envMapMode:c.envMap&&c.envMap.mapping,lightMap:!!c.lightMap,aoMap:!!c.aoMap,emissiveMap:!!c.emissiveMap,bumpMap:!!c.bumpMap,normalMap:!!c.normalMap,displacementMap:!!c.displacementMap,specularMap:!!c.specularMap,alphaMap:!!c.alphaMap,combine:c.combine,vertexColors:c.vertexColors,fog:h,useFog:c.fog,fogExp:h instanceof THREE.FogExp2,flatShading:c.shading===THREE.FlatShading,sizeAttenuation:c.sizeAttenuation,logarithmicDepthBuffer:b.logarithmicDepthBuffer,
	skinning:c.skinning,maxBones:t,useVertexTexture:b.floatVertexTextures&&l&&l.skeleton&&l.skeleton.useVertexTexture,morphTargets:c.morphTargets,morphNormals:c.morphNormals,maxMorphTargets:a.maxMorphTargets,maxMorphNormals:a.maxMorphNormals,maxDirLights:m,maxPointLights:p,maxSpotLights:n,maxHemiLights:q,maxShadows:e,pointLightShadows:k,shadowMapEnabled:a.shadowMap.enabled&&l.receiveShadow&&0<e,shadowMapType:a.shadowMap.type,shadowMapDebug:a.shadowMap.debug,alphaTest:c.alphaTest,metal:c.metal,doubleSided:c.side===
	THREE.DoubleSide,flipSided:c.side===THREE.BackSide}};this.getProgramCode=function(a,b){var c=[];b.shaderID?c.push(b.shaderID):(c.push(a.fragmentShader),c.push(a.vertexShader));if(void 0!==a.defines)for(var d in a.defines)c.push(d),c.push(a.defines[d]);for(d=0;d<e.length;d++){var k=e[d];c.push(k);c.push(b[k])}return c.join()};this.acquireProgram=function(b,d,e){for(var l,k=0,m=c.length;k<m;k++){var p=c[k];if(p.code===e){l=p;++l.usedTimes;break}}void 0===l&&(l=new THREE.WebGLProgram(a,e,b,d),c.push(l));
	return l};this.releaseProgram=function(a){if(0===--a.usedTimes){var b=c.indexOf(a);c[b]=c[c.length-1];c.pop();a.destroy()}};this.programs=c};THREE.WebGLProperties=function(){var a={};this.get=function(b){b=b.uuid;var c=a[b];void 0===c&&(c={},a[b]=c);return c};this.delete=function(b){delete a[b.uuid]};this.clear=function(){a={}}};
	THREE.WebGLShader=function(){function a(a){a=a.split("\n");for(var c=0;c<a.length;c++)a[c]=c+1+": "+a[c];return a.join("\n")}return function(b,c,d){var e=b.createShader(c);b.shaderSource(e,d);b.compileShader(e);!1===b.getShaderParameter(e,b.COMPILE_STATUS)&&console.error("THREE.WebGLShader: Shader couldn't compile.");""!==b.getShaderInfoLog(e)&&console.warn("THREE.WebGLShader: gl.getShaderInfoLog()",c===b.VERTEX_SHADER?"vertex":"fragment",b.getShaderInfoLog(e),a(d));return e}}();
	THREE.WebGLShadowMap=function(a,b,c){function d(a,b,c,d){var e=a.geometry,f=null,f=n,g=a.customDepthMaterial;c&&(f=q,g=a.customDistanceMaterial);g?f=g:(a=a instanceof THREE.SkinnedMesh&&b.skinning,g=0,void 0!==e.morphTargets&&0<e.morphTargets.length&&b.morphTargets&&(g|=1),a&&(g|=2),f=f[g]);f.visible=b.visible;f.wireframe=b.wireframe;f.wireframeLinewidth=b.wireframeLinewidth;c&&void 0!==f.uniforms.lightPos&&f.uniforms.lightPos.value.copy(d);return f}function e(a,b){if(!1!==a.visible){(a instanceof
	THREE.Mesh||a instanceof THREE.Line||a instanceof THREE.Points)&&a.castShadow&&(!1===a.frustumCulled||!0===h.intersectsObject(a))&&!0===a.material.visible&&(a.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,a.matrixWorld),p.push(a));for(var c=a.children,d=0,f=c.length;d<f;d++)e(c[d],b)}}var g=a.context,f=a.state,h=new THREE.Frustum,l=new THREE.Matrix4;new THREE.Vector3;new THREE.Vector3;for(var k=new THREE.Vector3,m=new THREE.Vector3,p=[],n=Array(4),q=Array(4),s=[new THREE.Vector3(1,0,0),new THREE.Vector3(-1,
	0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1),new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0)],t=[new THREE.Vector3(0,1,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)],v=[new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4],u=new THREE.Vector4,w=THREE.ShaderLib.depthRGBA,D=THREE.UniformsUtils.clone(w.uniforms),x=THREE.ShaderLib.distanceRGBA,B=THREE.UniformsUtils.clone(x.uniforms),
	y=0;4!==y;++y){var z=0!==(y&1),A=0!==(y&2),J=new THREE.ShaderMaterial({uniforms:D,vertexShader:w.vertexShader,fragmentShader:w.fragmentShader,morphTargets:z,skinning:A});J._shadowPass=!0;n[y]=J;z=new THREE.ShaderMaterial({uniforms:B,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader,morphTargets:z,skinning:A});z._shadowPass=!0;q[y]=z}var F=this;this.enabled=!1;this.autoUpdate=!0;this.needsUpdate=!1;this.type=THREE.PCFShadowMap;this.cullFace=THREE.CullFaceFront;this.render=function(n){var q,
	w;if(!1!==F.enabled&&(!1!==F.autoUpdate||!1!==F.needsUpdate)){g.clearColor(1,1,1,1);f.disable(g.BLEND);f.enable(g.CULL_FACE);g.frontFace(g.CCW);g.cullFace(F.cullFace===THREE.CullFaceFront?g.FRONT:g.BACK);f.setDepthTest(!0);a.getViewport(u);for(var x=0,D=b.length;x<D;x++){var y=b[x];if(!0===y.castShadow){var z=y.shadow,B=z.camera,A=z.mapSize;if(y instanceof THREE.PointLight){q=6;w=!0;var H=A.x/4,J=A.y/2;v[0].set(2*H,J,H,J);v[1].set(0,J,H,J);v[2].set(3*H,J,H,J);v[3].set(H,J,H,J);v[4].set(3*H,0,H,J);
	v[5].set(H,0,H,J)}else q=1,w=!1;null===z.map&&(H=THREE.LinearFilter,F.type===THREE.PCFSoftShadowMap&&(H=THREE.NearestFilter),z.map=new THREE.WebGLRenderTarget(A.x,A.y,{minFilter:H,magFilter:H,format:THREE.RGBAFormat}),z.matrix=new THREE.Matrix4,y instanceof THREE.SpotLight&&(B.aspect=A.x/A.y),B.updateProjectionMatrix());A=z.map;z=z.matrix;m.setFromMatrixPosition(y.matrixWorld);B.position.copy(m);a.setRenderTarget(A);a.clear();for(A=0;A<q;A++)for(w?(k.copy(B.position),k.add(s[A]),B.up.copy(t[A]),B.lookAt(k),
	H=v[A],a.setViewport(H.x,H.y,H.z,H.w)):(k.setFromMatrixPosition(y.target.matrixWorld),B.lookAt(k)),B.updateMatrixWorld(),B.matrixWorldInverse.getInverse(B.matrixWorld),z.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),z.multiply(B.projectionMatrix),z.multiply(B.matrixWorldInverse),l.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),h.setFromMatrix(l),p.length=0,e(n,B),H=0,J=p.length;H<J;H++){var G=p[H],ia=c.update(G),U=G.material;if(U instanceof THREE.MeshFaceMaterial)for(var X=ia.groups,U=U.materials,
	da=0,ca=X.length;da<ca;da++){var ga=X[da],Z=U[ga.materialIndex];!0===Z.visible&&(Z=d(G,Z,w,m),a.renderBufferDirect(B,b,null,ia,Z,G,ga))}else Z=d(G,U,w,m),a.renderBufferDirect(B,b,null,ia,Z,G,null)}a.resetGLState()}}a.setViewport(u.x,u.y,u.z,u.w);n=a.getClearColor();q=a.getClearAlpha();a.setClearColor(n,q);f.enable(g.BLEND);F.cullFace===THREE.CullFaceFront&&g.cullFace(g.BACK);a.resetGLState();F.needsUpdate=!1}}};
	THREE.WebGLState=function(a,b,c){var d=this,e=new Uint8Array(16),g=new Uint8Array(16),f=new Uint8Array(16),h={},l=null,k=null,m=null,p=null,n=null,q=null,s=null,t=null,v=null,u=null,w=null,D=null,x=null,B=null,y=null,z=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),A=void 0,J={};this.init=function(){a.clearColor(0,0,0,1);a.clearDepth(1);a.clearStencil(0);this.enable(a.DEPTH_TEST);a.depthFunc(a.LEQUAL);a.frontFace(a.CCW);a.cullFace(a.BACK);this.enable(a.CULL_FACE);this.enable(a.BLEND);a.blendEquation(a.FUNC_ADD);
	a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA)};this.initAttributes=function(){for(var a=0,b=e.length;a<b;a++)e[a]=0};this.enableAttribute=function(c){e[c]=1;0===g[c]&&(a.enableVertexAttribArray(c),g[c]=1);0!==f[c]&&(b.get("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(c,0),f[c]=0)};this.enableAttributeAndDivisor=function(b,c,d){e[b]=1;0===g[b]&&(a.enableVertexAttribArray(b),g[b]=1);f[b]!==c&&(d.vertexAttribDivisorANGLE(b,c),f[b]=c)};this.disableUnusedAttributes=function(){for(var b=0,c=g.length;b<
	c;b++)g[b]!==e[b]&&(a.disableVertexAttribArray(b),g[b]=0)};this.enable=function(b){!0!==h[b]&&(a.enable(b),h[b]=!0)};this.disable=function(b){!1!==h[b]&&(a.disable(b),h[b]=!1)};this.getCompressedTextureFormats=function(){if(null===l&&(l=[],b.get("WEBGL_compressed_texture_pvrtc")||b.get("WEBGL_compressed_texture_s3tc")))for(var c=a.getParameter(a.COMPRESSED_TEXTURE_FORMATS),d=0;d<c.length;d++)l.push(c[d]);return l};this.setBlending=function(b,d,e,f,g,h,l){b!==k&&(b===THREE.NoBlending?this.disable(a.BLEND):
	b===THREE.AdditiveBlending?(this.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.SRC_ALPHA,a.ONE)):b===THREE.SubtractiveBlending?(this.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ZERO,a.ONE_MINUS_SRC_COLOR)):b===THREE.MultiplyBlending?(this.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ZERO,a.SRC_COLOR)):b===THREE.CustomBlending?this.enable(a.BLEND):(this.enable(a.BLEND),a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,
	a.ONE,a.ONE_MINUS_SRC_ALPHA)),k=b);if(b===THREE.CustomBlending){g=g||d;h=h||e;l=l||f;if(d!==m||g!==q)a.blendEquationSeparate(c(d),c(g)),m=d,q=g;if(e!==p||f!==n||h!==s||l!==t)a.blendFuncSeparate(c(e),c(f),c(h),c(l)),p=e,n=f,s=h,t=l}else t=s=q=n=p=m=null};this.setDepthFunc=function(b){if(v!==b){if(b)switch(b){case THREE.NeverDepth:a.depthFunc(a.NEVER);break;case THREE.AlwaysDepth:a.depthFunc(a.ALWAYS);break;case THREE.LessDepth:a.depthFunc(a.LESS);break;case THREE.LessEqualDepth:a.depthFunc(a.LEQUAL);
	break;case THREE.EqualDepth:a.depthFunc(a.EQUAL);break;case THREE.GreaterEqualDepth:a.depthFunc(a.GEQUAL);break;case THREE.GreaterDepth:a.depthFunc(a.GREATER);break;case THREE.NotEqualDepth:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}else a.depthFunc(a.LEQUAL);v=b}};this.setDepthTest=function(b){b?this.enable(a.DEPTH_TEST):this.disable(a.DEPTH_TEST)};this.setDepthWrite=function(b){u!==b&&(a.depthMask(b),u=b)};this.setColorWrite=function(b){w!==b&&(a.colorMask(b,b,b,b),w=b)};this.setFlipSided=
	function(b){D!==b&&(b?a.frontFace(a.CW):a.frontFace(a.CCW),D=b)};this.setLineWidth=function(b){b!==x&&(a.lineWidth(b),x=b)};this.setPolygonOffset=function(b,c,d){b?this.enable(a.POLYGON_OFFSET_FILL):this.disable(a.POLYGON_OFFSET_FILL);!b||B===c&&y===d||(a.polygonOffset(c,d),B=c,y=d)};this.setScissorTest=function(b){b?this.enable(a.SCISSOR_TEST):this.disable(a.SCISSOR_TEST)};this.activeTexture=function(b){void 0===b&&(b=a.TEXTURE0+z-1);A!==b&&(a.activeTexture(b),A=b)};this.bindTexture=function(b,c){void 0===
	A&&d.activeTexture();var e=J[A];void 0===e&&(e={type:void 0,texture:void 0},J[A]=e);if(e.type!==b||e.texture!==c)a.bindTexture(b,c),e.type=b,e.texture=c};this.compressedTexImage2D=function(){try{a.compressedTexImage2D.apply(a,arguments)}catch(b){console.error(b)}};this.texImage2D=function(){try{a.texImage2D.apply(a,arguments)}catch(b){console.error(b)}};this.reset=function(){for(var b=0;b<g.length;b++)1===g[b]&&(a.disableVertexAttribArray(b),g[b]=0);h={};D=w=u=k=l=null}};
	THREE.LensFlarePlugin=function(a,b){var c,d,e,g,f,h,l,k,m,p,n=a.context,q=a.state,s,t,v,u,w,D;this.render=function(x,B,y,z){if(0!==b.length){x=new THREE.Vector3;var A=z/y,J=.5*y,F=.5*z,C=16/z,N=new THREE.Vector2(C*A,C),L=new THREE.Vector3(1,1,0),Q=new THREE.Vector2(1,1);if(void 0===v){var C=new Float32Array([-1,-1,0,0,1,-1,1,0,1,1,1,1,-1,1,0,1]),M=new Uint16Array([0,1,2,0,2,3]);s=n.createBuffer();t=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s);n.bufferData(n.ARRAY_BUFFER,C,n.STATIC_DRAW);n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,
	t);n.bufferData(n.ELEMENT_ARRAY_BUFFER,M,n.STATIC_DRAW);w=n.createTexture();D=n.createTexture();q.bindTexture(n.TEXTURE_2D,w);n.texImage2D(n.TEXTURE_2D,0,n.RGB,16,16,0,n.RGB,n.UNSIGNED_BYTE,null);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST);q.bindTexture(n.TEXTURE_2D,D);n.texImage2D(n.TEXTURE_2D,0,
	n.RGBA,16,16,0,n.RGBA,n.UNSIGNED_BYTE,null);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST);n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST);var C=(u=0<n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS))?{vertexShader:"uniform lowp int renderType;\nuniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif ( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility =        visibility.r / 9.0;\nvVisibility *= 1.0 - visibility.g / 9.0;\nvVisibility *=       visibility.b / 9.0;\nvVisibility *= 1.0 - visibility.a / 9.0;\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
	fragmentShader:"uniform lowp int renderType;\nuniform sampler2D map;\nuniform float opacity;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif ( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if ( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"}:{vertexShader:"uniform lowp int renderType;\nuniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif ( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
	fragmentShader:"precision mediump float;\nuniform lowp int renderType;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif ( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if ( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"},
	M=n.createProgram(),K=n.createShader(n.FRAGMENT_SHADER),E=n.createShader(n.VERTEX_SHADER),O="precision "+a.getPrecision()+" float;\n";n.shaderSource(K,O+C.fragmentShader);n.shaderSource(E,O+C.vertexShader);n.compileShader(K);n.compileShader(E);n.attachShader(M,K);n.attachShader(M,E);n.linkProgram(M);v=M;m=n.getAttribLocation(v,"position");p=n.getAttribLocation(v,"uv");c=n.getUniformLocation(v,"renderType");d=n.getUniformLocation(v,"map");e=n.getUniformLocation(v,"occlusionMap");g=n.getUniformLocation(v,
	"opacity");f=n.getUniformLocation(v,"color");h=n.getUniformLocation(v,"scale");l=n.getUniformLocation(v,"rotation");k=n.getUniformLocation(v,"screenPosition")}n.useProgram(v);q.initAttributes();q.enableAttribute(m);q.enableAttribute(p);q.disableUnusedAttributes();n.uniform1i(e,0);n.uniform1i(d,1);n.bindBuffer(n.ARRAY_BUFFER,s);n.vertexAttribPointer(m,2,n.FLOAT,!1,16,0);n.vertexAttribPointer(p,2,n.FLOAT,!1,16,8);n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t);q.disable(n.CULL_FACE);n.depthMask(!1);M=0;for(K=
	b.length;M<K;M++)if(C=16/z,N.set(C*A,C),E=b[M],x.set(E.matrixWorld.elements[12],E.matrixWorld.elements[13],E.matrixWorld.elements[14]),x.applyMatrix4(B.matrixWorldInverse),x.applyProjection(B.projectionMatrix),L.copy(x),Q.x=L.x*J+J,Q.y=L.y*F+F,u||0<Q.x&&Q.x<y&&0<Q.y&&Q.y<z){q.activeTexture(n.TEXTURE0);q.bindTexture(n.TEXTURE_2D,null);q.activeTexture(n.TEXTURE1);q.bindTexture(n.TEXTURE_2D,w);n.copyTexImage2D(n.TEXTURE_2D,0,n.RGB,Q.x-8,Q.y-8,16,16,0);n.uniform1i(c,0);n.uniform2f(h,N.x,N.y);n.uniform3f(k,
	L.x,L.y,L.z);q.disable(n.BLEND);q.enable(n.DEPTH_TEST);n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0);q.activeTexture(n.TEXTURE0);q.bindTexture(n.TEXTURE_2D,D);n.copyTexImage2D(n.TEXTURE_2D,0,n.RGBA,Q.x-8,Q.y-8,16,16,0);n.uniform1i(c,1);q.disable(n.DEPTH_TEST);q.activeTexture(n.TEXTURE1);q.bindTexture(n.TEXTURE_2D,w);n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0);E.positionScreen.copy(L);E.customUpdateCallback?E.customUpdateCallback(E):E.updateLensFlares();n.uniform1i(c,2);q.enable(n.BLEND);for(var O=
	0,T=E.lensFlares.length;O<T;O++){var H=E.lensFlares[O];.001<H.opacity&&.001<H.scale&&(L.x=H.x,L.y=H.y,L.z=H.z,C=H.size*H.scale/z,N.x=C*A,N.y=C,n.uniform3f(k,L.x,L.y,L.z),n.uniform2f(h,N.x,N.y),n.uniform1f(l,H.rotation),n.uniform1f(g,H.opacity),n.uniform3f(f,H.color.r,H.color.g,H.color.b),q.setBlending(H.blending,H.blendEquation,H.blendSrc,H.blendDst),a.setTexture(H.texture,1),n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0))}}q.enable(n.CULL_FACE);q.enable(n.DEPTH_TEST);n.depthMask(!0);a.resetGLState()}}};
	THREE.SpritePlugin=function(a,b){var c,d,e,g,f,h,l,k,m,p,n,q,s,t,v,u,w;function D(a,b){return a.z!==b.z?b.z-a.z:b.id-a.id}var x=a.context,B=a.state,y,z,A,J,F=new THREE.Vector3,C=new THREE.Quaternion,N=new THREE.Vector3;this.render=function(L,Q){if(0!==b.length){if(void 0===A){var M=new Float32Array([-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,.5,0,1]),K=new Uint16Array([0,1,2,0,2,3]);y=x.createBuffer();z=x.createBuffer();x.bindBuffer(x.ARRAY_BUFFER,y);x.bufferData(x.ARRAY_BUFFER,M,x.STATIC_DRAW);x.bindBuffer(x.ELEMENT_ARRAY_BUFFER,
	z);x.bufferData(x.ELEMENT_ARRAY_BUFFER,K,x.STATIC_DRAW);var M=x.createProgram(),K=x.createShader(x.VERTEX_SHADER),E=x.createShader(x.FRAGMENT_SHADER);x.shaderSource(K,["precision "+a.getPrecision()+" float;","uniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position * scale;\nvec2 rotatedPosition;\nrotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\nrotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\nvec4 finalPosition;\nfinalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition;\nfinalPosition = projectionMatrix * finalPosition;\ngl_Position = finalPosition;\n}"].join("\n"));
	x.shaderSource(E,["precision "+a.getPrecision()+" float;","uniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nuniform int fogType;\nuniform vec3 fogColor;\nuniform float fogDensity;\nuniform float fogNear;\nuniform float fogFar;\nuniform float alphaTest;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\nif ( texture.a < alphaTest ) discard;\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\nif ( fogType > 0 ) {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat fogFactor = 0.0;\nif ( fogType == 1 ) {\nfogFactor = smoothstep( fogNear, fogFar, depth );\n} else {\nconst float LOG2 = 1.442695;\nfogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n}\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n}\n}"].join("\n"));
	x.compileShader(K);x.compileShader(E);x.attachShader(M,K);x.attachShader(M,E);x.linkProgram(M);A=M;u=x.getAttribLocation(A,"position");w=x.getAttribLocation(A,"uv");c=x.getUniformLocation(A,"uvOffset");d=x.getUniformLocation(A,"uvScale");e=x.getUniformLocation(A,"rotation");g=x.getUniformLocation(A,"scale");f=x.getUniformLocation(A,"color");h=x.getUniformLocation(A,"map");l=x.getUniformLocation(A,"opacity");k=x.getUniformLocation(A,"modelViewMatrix");m=x.getUniformLocation(A,"projectionMatrix");p=
	x.getUniformLocation(A,"fogType");n=x.getUniformLocation(A,"fogDensity");q=x.getUniformLocation(A,"fogNear");s=x.getUniformLocation(A,"fogFar");t=x.getUniformLocation(A,"fogColor");v=x.getUniformLocation(A,"alphaTest");M=document.createElement("canvas");M.width=8;M.height=8;K=M.getContext("2d");K.fillStyle="white";K.fillRect(0,0,8,8);J=new THREE.Texture(M);J.needsUpdate=!0}x.useProgram(A);B.initAttributes();B.enableAttribute(u);B.enableAttribute(w);B.disableUnusedAttributes();B.disable(x.CULL_FACE);
	B.enable(x.BLEND);x.bindBuffer(x.ARRAY_BUFFER,y);x.vertexAttribPointer(u,2,x.FLOAT,!1,16,0);x.vertexAttribPointer(w,2,x.FLOAT,!1,16,8);x.bindBuffer(x.ELEMENT_ARRAY_BUFFER,z);x.uniformMatrix4fv(m,!1,Q.projectionMatrix.elements);B.activeTexture(x.TEXTURE0);x.uniform1i(h,0);K=M=0;(E=L.fog)?(x.uniform3f(t,E.color.r,E.color.g,E.color.b),E instanceof THREE.Fog?(x.uniform1f(q,E.near),x.uniform1f(s,E.far),x.uniform1i(p,1),K=M=1):E instanceof THREE.FogExp2&&(x.uniform1f(n,E.density),x.uniform1i(p,2),K=M=2)):
	(x.uniform1i(p,0),K=M=0);for(var E=0,O=b.length;E<O;E++){var T=b[E];T.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,T.matrixWorld);T.z=-T.modelViewMatrix.elements[14]}b.sort(D);for(var H=[],E=0,O=b.length;E<O;E++){var T=b[E],R=T.material;x.uniform1f(v,R.alphaTest);x.uniformMatrix4fv(k,!1,T.modelViewMatrix.elements);T.matrixWorld.decompose(F,C,N);H[0]=N.x;H[1]=N.y;T=0;L.fog&&R.fog&&(T=K);M!==T&&(x.uniform1i(p,T),M=T);null!==R.map?(x.uniform2f(c,R.map.offset.x,R.map.offset.y),x.uniform2f(d,
	R.map.repeat.x,R.map.repeat.y)):(x.uniform2f(c,0,0),x.uniform2f(d,1,1));x.uniform1f(l,R.opacity);x.uniform3f(f,R.color.r,R.color.g,R.color.b);x.uniform1f(e,R.rotation);x.uniform2fv(g,H);B.setBlending(R.blending,R.blendEquation,R.blendSrc,R.blendDst);B.setDepthTest(R.depthTest);B.setDepthWrite(R.depthWrite);R.map&&R.map.image&&R.map.image.width?a.setTexture(R.map,0):a.setTexture(J,0);x.drawElements(x.TRIANGLES,6,x.UNSIGNED_SHORT,0)}B.enable(x.CULL_FACE);a.resetGLState()}}};
	THREE.CurveUtils={tangentQuadraticBezier:function(a,b,c,d){return 2*(1-a)*(c-b)+2*a*(d-c)},tangentCubicBezier:function(a,b,c,d,e){return-3*b*(1-a)*(1-a)+3*c*(1-a)*(1-a)-6*a*c*(1-a)+6*a*d*(1-a)-3*a*a*d+3*a*a*e},tangentSpline:function(a,b,c,d,e){return 6*a*a-6*a+(3*a*a-4*a+1)+(-6*a*a+6*a)+(3*a*a-2*a)},interpolate:function(a,b,c,d,e){a=.5*(c-a);d=.5*(d-b);var g=e*e;return(2*b-2*c+a+d)*e*g+(-3*b+3*c-2*a-d)*g+a*e+b}};
	THREE.GeometryUtils={merge:function(a,b,c){console.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.");var d;b instanceof THREE.Mesh&&(b.matrixAutoUpdate&&b.updateMatrix(),d=b.matrix,b=b.geometry);a.merge(b,d,c)},center:function(a){console.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.");return a.center()}};
	THREE.ImageUtils={crossOrigin:void 0,loadTexture:function(a,b,c,d){console.warn("THREE.ImageUtils.loadTexture is being deprecated. Use THREE.TextureLoader() instead.");var e=new THREE.TextureLoader;e.setCrossOrigin(this.crossOrigin);a=e.load(a,c,void 0,d);b&&(a.mapping=b);return a},loadTextureCube:function(a,b,c,d){console.warn("THREE.ImageUtils.loadTextureCube is being deprecated. Use THREE.CubeTextureLoader() instead.");var e=new THREE.CubeTextureLoader;e.setCrossOrigin(this.crossOrigin);a=e.load(a,
	c,void 0,d);b&&(a.mapping=b);return a},loadCompressedTexture:function(){console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")},loadCompressedTextureCube:function(){console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")}};
	THREE.SceneUtils={createMultiMaterialObject:function(a,b){for(var c=new THREE.Group,d=0,e=b.length;d<e;d++)c.add(new THREE.Mesh(a,b[d]));return c},detach:function(a,b,c){a.applyMatrix(b.matrixWorld);b.remove(a);c.add(a)},attach:function(a,b,c){var d=new THREE.Matrix4;d.getInverse(c.matrixWorld);a.applyMatrix(d);b.remove(a);c.add(a)}};
	THREE.ShapeUtils={area:function(a){for(var b=a.length,c=0,d=b-1,e=0;e<b;d=e++)c+=a[d].x*a[e].y-a[e].x*a[d].y;return.5*c},triangulate:function(){return function(a,b){var c=a.length;if(3>c)return null;var d=[],e=[],g=[],f,h,l;if(0<THREE.ShapeUtils.area(a))for(h=0;h<c;h++)e[h]=h;else for(h=0;h<c;h++)e[h]=c-1-h;var k=2*c;for(h=c-1;2<c;){if(0>=k--){console.warn("THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()");break}f=h;c<=f&&(f=0);h=f+1;c<=h&&(h=0);l=h+1;c<=l&&(l=0);var m;a:{var p=
	m=void 0,n=void 0,q=void 0,s=void 0,t=void 0,v=void 0,u=void 0,w=void 0,p=a[e[f]].x,n=a[e[f]].y,q=a[e[h]].x,s=a[e[h]].y,t=a[e[l]].x,v=a[e[l]].y;if(Number.EPSILON>(q-p)*(v-n)-(s-n)*(t-p))m=!1;else{var D=void 0,x=void 0,B=void 0,y=void 0,z=void 0,A=void 0,J=void 0,F=void 0,C=void 0,N=void 0,C=F=J=w=u=void 0,D=t-q,x=v-s,B=p-t,y=n-v,z=q-p,A=s-n;for(m=0;m<c;m++)if(u=a[e[m]].x,w=a[e[m]].y,!(u===p&&w===n||u===q&&w===s||u===t&&w===v)&&(J=u-p,F=w-n,C=u-q,N=w-s,u-=t,w-=v,C=D*N-x*C,J=z*F-A*J,F=B*w-y*u,C>=-Number.EPSILON&&
	F>=-Number.EPSILON&&J>=-Number.EPSILON)){m=!1;break a}m=!0}}if(m){d.push([a[e[f]],a[e[h]],a[e[l]]]);g.push([e[f],e[h],e[l]]);f=h;for(l=h+1;l<c;f++,l++)e[f]=e[l];c--;k=2*c}}return b?g:d}}(),triangulateShape:function(a,b){function c(a,b,c){return a.x!==b.x?a.x<b.x?a.x<=c.x&&c.x<=b.x:b.x<=c.x&&c.x<=a.x:a.y<b.y?a.y<=c.y&&c.y<=b.y:b.y<=c.y&&c.y<=a.y}function d(a,b,d,e,f){var g=b.x-a.x,h=b.y-a.y,k=e.x-d.x,l=e.y-d.y,m=a.x-d.x,p=a.y-d.y,z=h*k-g*l,A=h*m-g*p;if(Math.abs(z)>Number.EPSILON){if(0<z){if(0>A||A>
	z)return[];k=l*m-k*p;if(0>k||k>z)return[]}else{if(0<A||A<z)return[];k=l*m-k*p;if(0<k||k<z)return[]}if(0===k)return!f||0!==A&&A!==z?[a]:[];if(k===z)return!f||0!==A&&A!==z?[b]:[];if(0===A)return[d];if(A===z)return[e];f=k/z;return[{x:a.x+f*g,y:a.y+f*h}]}if(0!==A||l*m!==k*p)return[];h=0===g&&0===h;k=0===k&&0===l;if(h&&k)return a.x!==d.x||a.y!==d.y?[]:[a];if(h)return c(d,e,a)?[a]:[];if(k)return c(a,b,d)?[d]:[];0!==g?(a.x<b.x?(g=a,k=a.x,h=b,a=b.x):(g=b,k=b.x,h=a,a=a.x),d.x<e.x?(b=d,z=d.x,l=e,d=e.x):(b=
	e,z=e.x,l=d,d=d.x)):(a.y<b.y?(g=a,k=a.y,h=b,a=b.y):(g=b,k=b.y,h=a,a=a.y),d.y<e.y?(b=d,z=d.y,l=e,d=e.y):(b=e,z=e.y,l=d,d=d.y));return k<=z?a<z?[]:a===z?f?[]:[b]:a<=d?[b,h]:[b,l]:k>d?[]:k===d?f?[]:[g]:a<=d?[g,h]:[g,l]}function e(a,b,c,d){var e=b.x-a.x,f=b.y-a.y;b=c.x-a.x;c=c.y-a.y;var g=d.x-a.x;d=d.y-a.y;a=e*c-f*b;e=e*d-f*g;return Math.abs(a)>Number.EPSILON?(b=g*c-d*b,0<a?0<=e&&0<=b:0<=e||0<=b):0<e}var g,f,h,l,k,m={};h=a.concat();g=0;for(f=b.length;g<f;g++)Array.prototype.push.apply(h,b[g]);g=0;for(f=
	h.length;g<f;g++)k=h[g].x+":"+h[g].y,void 0!==m[k]&&console.warn("THREE.Shape: Duplicate point",k),m[k]=g;g=function(a,b){function c(a,b){var d=h.length-1,f=a-1;0>f&&(f=d);var g=a+1;g>d&&(g=0);d=e(h[a],h[f],h[g],k[b]);if(!d)return!1;d=k.length-1;f=b-1;0>f&&(f=d);g=b+1;g>d&&(g=0);return(d=e(k[b],k[f],k[g],h[a]))?!0:!1}function f(a,b){var c,e;for(c=0;c<h.length;c++)if(e=c+1,e%=h.length,e=d(a,b,h[c],h[e],!0),0<e.length)return!0;return!1}function g(a,c){var e,f,h,k;for(e=0;e<l.length;e++)for(f=b[l[e]],
	h=0;h<f.length;h++)if(k=h+1,k%=f.length,k=d(a,c,f[h],f[k],!0),0<k.length)return!0;return!1}var h=a.concat(),k,l=[],m,p,y,z,A,J=[],F,C,N,L=0;for(m=b.length;L<m;L++)l.push(L);F=0;for(var Q=2*l.length;0<l.length;){Q--;if(0>Q){console.log("Infinite Loop! Holes left:"+l.length+", Probably Hole outside Shape!");break}for(p=F;p<h.length;p++){y=h[p];m=-1;for(L=0;L<l.length;L++)if(z=l[L],A=y.x+":"+y.y+":"+z,void 0===J[A]){k=b[z];for(C=0;C<k.length;C++)if(z=k[C],c(p,C)&&!f(y,z)&&!g(y,z)){m=C;l.splice(L,1);
	F=h.slice(0,p+1);z=h.slice(p);C=k.slice(m);N=k.slice(0,m+1);h=F.concat(C).concat(N).concat(z);F=p;break}if(0<=m)break;J[A]=!0}if(0<=m)break}}return h}(a,b);var p=THREE.ShapeUtils.triangulate(g,!1);g=0;for(f=p.length;g<f;g++)for(l=p[g],h=0;3>h;h++)k=l[h].x+":"+l[h].y,k=m[k],void 0!==k&&(l[h]=k);return p.concat()},isClockWise:function(a){return 0>THREE.ShapeUtils.area(a)},b2:function(){return function(a,b,c,d){var e=1-a;return e*e*b+2*(1-a)*a*c+a*a*d}}(),b3:function(){return function(a,b,c,d,e){var g=
	1-a,f=1-a;return g*g*g*b+3*f*f*a*c+3*(1-a)*a*a*d+a*a*a*e}}()};THREE.Audio=function(a){THREE.Object3D.call(this);this.type="Audio";this.context=a.context;this.source=this.context.createBufferSource();this.source.onended=this.onEnded.bind(this);this.gain=this.context.createGain();this.gain.connect(this.context.destination);this.panner=this.context.createPanner();this.panner.connect(this.gain);this.autoplay=!1;this.startTime=0;this.playbackRate=1;this.isPlaying=!1};THREE.Audio.prototype=Object.create(THREE.Object3D.prototype);
	THREE.Audio.prototype.constructor=THREE.Audio;THREE.Audio.prototype.load=function(a){var b=this,c=new XMLHttpRequest;c.open("GET",a,!0);c.responseType="arraybuffer";c.onload=function(a){b.context.decodeAudioData(this.response,function(a){b.source.buffer=a;b.autoplay&&b.play()})};c.send();return this};
	THREE.Audio.prototype.play=function(){if(!0===this.isPlaying)console.warn("THREE.Audio: Audio is already playing.");else{var a=this.context.createBufferSource();a.buffer=this.source.buffer;a.loop=this.source.loop;a.onended=this.source.onended;a.start(0,this.startTime);a.playbackRate.value=this.playbackRate;this.isPlaying=!0;this.source=a;this.connect()}};THREE.Audio.prototype.pause=function(){this.source.stop();this.startTime=this.context.currentTime};
	THREE.Audio.prototype.stop=function(){this.source.stop();this.startTime=0};THREE.Audio.prototype.connect=function(){void 0!==this.filter?(this.source.connect(this.filter),this.filter.connect(this.panner)):this.source.connect(this.panner)};THREE.Audio.prototype.disconnect=function(){void 0!==this.filter?(this.source.disconnect(this.filter),this.filter.disconnect(this.panner)):this.source.disconnect(this.panner)};
	THREE.Audio.prototype.setFilter=function(a){!0===this.isPlaying?(this.disconnect(),this.filter=a,this.connect()):this.filter=a};THREE.Audio.prototype.getFilter=function(){return this.filter};THREE.Audio.prototype.setPlaybackRate=function(a){this.playbackRate=a;!0===this.isPlaying&&(this.source.playbackRate.value=this.playbackRate)};THREE.Audio.prototype.getPlaybackRate=function(){return this.playbackRate};THREE.Audio.prototype.onEnded=function(){this.isPlaying=!1};
	THREE.Audio.prototype.setLoop=function(a){this.source.loop=a};THREE.Audio.prototype.getLoop=function(){return this.source.loop};THREE.Audio.prototype.setRefDistance=function(a){this.panner.refDistance=a};THREE.Audio.prototype.getRefDistance=function(){return this.panner.refDistance};THREE.Audio.prototype.setRolloffFactor=function(a){this.panner.rolloffFactor=a};THREE.Audio.prototype.getRolloffFactor=function(){return this.panner.rolloffFactor};
	THREE.Audio.prototype.setVolume=function(a){this.gain.gain.value=a};THREE.Audio.prototype.getVolume=function(){return this.gain.gain.value};THREE.Audio.prototype.updateMatrixWorld=function(){var a=new THREE.Vector3;return function(b){THREE.Object3D.prototype.updateMatrixWorld.call(this,b);a.setFromMatrixPosition(this.matrixWorld);this.panner.setPosition(a.x,a.y,a.z)}}();THREE.AudioListener=function(){THREE.Object3D.call(this);this.type="AudioListener";this.context=new (window.AudioContext||window.webkitAudioContext)};
	THREE.AudioListener.prototype=Object.create(THREE.Object3D.prototype);THREE.AudioListener.prototype.constructor=THREE.AudioListener;
	THREE.AudioListener.prototype.updateMatrixWorld=function(){var a=new THREE.Vector3,b=new THREE.Quaternion,c=new THREE.Vector3,d=new THREE.Vector3;return function(e){THREE.Object3D.prototype.updateMatrixWorld.call(this,e);e=this.context.listener;var g=this.up;this.matrixWorld.decompose(a,b,c);d.set(0,0,-1).applyQuaternion(b);e.setPosition(a.x,a.y,a.z);e.setOrientation(d.x,d.y,d.z,g.x,g.y,g.z)}}();THREE.Curve=function(){};
	THREE.Curve.prototype={constructor:THREE.Curve,getPoint:function(a){console.warn("THREE.Curve: Warning, getPoint() not implemented!");return null},getPointAt:function(a){a=this.getUtoTmapping(a);return this.getPoint(a)},getPoints:function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPoint(b/a));return c},getSpacedPoints:function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPointAt(b/a));return c},getLength:function(){var a=this.getLengths();return a[a.length-1]},getLengths:function(a){a||
	(a=this.__arcLengthDivisions?this.__arcLengthDivisions:200);if(this.cacheArcLengths&&this.cacheArcLengths.length===a+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;var b=[],c,d=this.getPoint(0),e,g=0;b.push(0);for(e=1;e<=a;e++)c=this.getPoint(e/a),g+=c.distanceTo(d),b.push(g),d=c;return this.cacheArcLengths=b},updateArcLengths:function(){this.needsUpdate=!0;this.getLengths()},getUtoTmapping:function(a,b){var c=this.getLengths(),d=0,e=c.length,g;g=b?b:a*c[e-1];for(var f=0,h=e-
	1,l;f<=h;)if(d=Math.floor(f+(h-f)/2),l=c[d]-g,0>l)f=d+1;else if(0<l)h=d-1;else{h=d;break}d=h;if(c[d]===g)return d/(e-1);f=c[d];return c=(d+(g-f)/(c[d+1]-f))/(e-1)},getTangent:function(a){var b=a-1E-4;a+=1E-4;0>b&&(b=0);1<a&&(a=1);b=this.getPoint(b);return this.getPoint(a).clone().sub(b).normalize()},getTangentAt:function(a){a=this.getUtoTmapping(a);return this.getTangent(a)}};THREE.Curve.Utils=THREE.CurveUtils;
	THREE.Curve.create=function(a,b){a.prototype=Object.create(THREE.Curve.prototype);a.prototype.constructor=a;a.prototype.getPoint=b;return a};THREE.CurvePath=function(){this.curves=[];this.autoClose=!1};THREE.CurvePath.prototype=Object.create(THREE.Curve.prototype);THREE.CurvePath.prototype.constructor=THREE.CurvePath;THREE.CurvePath.prototype.add=function(a){this.curves.push(a)};
	THREE.CurvePath.prototype.closePath=function(){var a=this.curves[0].getPoint(0),b=this.curves[this.curves.length-1].getPoint(1);a.equals(b)||this.curves.push(new THREE.LineCurve(b,a))};THREE.CurvePath.prototype.getPoint=function(a){for(var b=a*this.getLength(),c=this.getCurveLengths(),d=0;d<c.length;){if(c[d]>=b)return a=this.curves[d],b=1-(c[d]-b)/a.getLength(),a.getPointAt(b);d++}return null};THREE.CurvePath.prototype.getLength=function(){var a=this.getCurveLengths();return a[a.length-1]};
	THREE.CurvePath.prototype.getCurveLengths=function(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;for(var a=[],b=0,c=0,d=this.curves.length;c<d;c++)b+=this.curves[c].getLength(),a.push(b);return this.cacheLengths=a};THREE.CurvePath.prototype.createPointsGeometry=function(a){a=this.getPoints(a,!0);return this.createGeometry(a)};THREE.CurvePath.prototype.createSpacedPointsGeometry=function(a){a=this.getSpacedPoints(a,!0);return this.createGeometry(a)};
	THREE.CurvePath.prototype.createGeometry=function(a){for(var b=new THREE.Geometry,c=0,d=a.length;c<d;c++){var e=a[c];b.vertices.push(new THREE.Vector3(e.x,e.y,e.z||0))}return b};THREE.Path=function(a){THREE.CurvePath.call(this);this.actions=[];a&&this.fromPoints(a)};THREE.Path.prototype=Object.create(THREE.CurvePath.prototype);THREE.Path.prototype.constructor=THREE.Path;THREE.Path.prototype.fromPoints=function(a){this.moveTo(a[0].x,a[0].y);for(var b=1,c=a.length;b<c;b++)this.lineTo(a[b].x,a[b].y)};
	THREE.Path.prototype.moveTo=function(a,b){this.actions.push({action:"moveTo",args:[a,b]})};THREE.Path.prototype.lineTo=function(a,b){var c=this.actions[this.actions.length-1].args,c=new THREE.LineCurve(new THREE.Vector2(c[c.length-2],c[c.length-1]),new THREE.Vector2(a,b));this.curves.push(c);this.actions.push({action:"lineTo",args:[a,b]})};
	THREE.Path.prototype.quadraticCurveTo=function(a,b,c,d){var e=this.actions[this.actions.length-1].args,e=new THREE.QuadraticBezierCurve(new THREE.Vector2(e[e.length-2],e[e.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d));this.curves.push(e);this.actions.push({action:"quadraticCurveTo",args:[a,b,c,d]})};
	THREE.Path.prototype.bezierCurveTo=function(a,b,c,d,e,g){var f=this.actions[this.actions.length-1].args,f=new THREE.CubicBezierCurve(new THREE.Vector2(f[f.length-2],f[f.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d),new THREE.Vector2(e,g));this.curves.push(f);this.actions.push({action:"bezierCurveTo",args:[a,b,c,d,e,g]})};
	THREE.Path.prototype.splineThru=function(a){var b=Array.prototype.slice.call(arguments),c=this.actions[this.actions.length-1].args,c=[new THREE.Vector2(c[c.length-2],c[c.length-1])];Array.prototype.push.apply(c,a);c=new THREE.SplineCurve(c);this.curves.push(c);this.actions.push({action:"splineThru",args:b})};THREE.Path.prototype.arc=function(a,b,c,d,e,g){var f=this.actions[this.actions.length-1].args;this.absarc(a+f[f.length-2],b+f[f.length-1],c,d,e,g)};
	THREE.Path.prototype.absarc=function(a,b,c,d,e,g){this.absellipse(a,b,c,c,d,e,g)};THREE.Path.prototype.ellipse=function(a,b,c,d,e,g,f,h){var l=this.actions[this.actions.length-1].args;this.absellipse(a+l[l.length-2],b+l[l.length-1],c,d,e,g,f,h)};THREE.Path.prototype.absellipse=function(a,b,c,d,e,g,f,h){var l=[a,b,c,d,e,g,f,h||0];a=new THREE.EllipseCurve(a,b,c,d,e,g,f,h);this.curves.push(a);a=a.getPoint(1);l.push(a.x);l.push(a.y);this.actions.push({action:"ellipse",args:l})};
	THREE.Path.prototype.getSpacedPoints=function(a,b){a||(a=40);for(var c=[],d=0;d<a;d++)c.push(this.getPoint(d/a));return c};
	THREE.Path.prototype.getPoints=function(a,b){a=a||12;for(var c=THREE.ShapeUtils.b2,d=THREE.ShapeUtils.b3,e=[],g,f,h,l,k,m,p,n,q,s,t=0,v=this.actions.length;t<v;t++){q=this.actions[t];var u=q.args;switch(q.action){case "moveTo":e.push(new THREE.Vector2(u[0],u[1]));break;case "lineTo":e.push(new THREE.Vector2(u[0],u[1]));break;case "quadraticCurveTo":g=u[2];f=u[3];k=u[0];m=u[1];0<e.length?(q=e[e.length-1],p=q.x,n=q.y):(q=this.actions[t-1].args,p=q[q.length-2],n=q[q.length-1]);for(u=1;u<=a;u++)s=u/a,
	q=c(s,p,k,g),s=c(s,n,m,f),e.push(new THREE.Vector2(q,s));break;case "bezierCurveTo":g=u[4];f=u[5];k=u[0];m=u[1];h=u[2];l=u[3];0<e.length?(q=e[e.length-1],p=q.x,n=q.y):(q=this.actions[t-1].args,p=q[q.length-2],n=q[q.length-1]);for(u=1;u<=a;u++)s=u/a,q=d(s,p,k,h,g),s=d(s,n,m,l,f),e.push(new THREE.Vector2(q,s));break;case "splineThru":q=this.actions[t-1].args;s=[new THREE.Vector2(q[q.length-2],q[q.length-1])];q=a*u[0].length;s=s.concat(u[0]);s=new THREE.SplineCurve(s);for(u=1;u<=q;u++)e.push(s.getPointAt(u/
	q));break;case "arc":g=u[0];f=u[1];m=u[2];h=u[3];q=u[4];k=!!u[5];p=q-h;n=2*a;for(u=1;u<=n;u++)s=u/n,k||(s=1-s),s=h+s*p,q=g+m*Math.cos(s),s=f+m*Math.sin(s),e.push(new THREE.Vector2(q,s));break;case "ellipse":g=u[0];f=u[1];m=u[2];l=u[3];h=u[4];q=u[5];k=!!u[6];var w=u[7];p=q-h;n=2*a;var D,x;0!==w&&(D=Math.cos(w),x=Math.sin(w));for(u=1;u<=n;u++){s=u/n;k||(s=1-s);s=h+s*p;q=g+m*Math.cos(s);s=f+l*Math.sin(s);if(0!==w){var B=q;q=(B-g)*D-(s-f)*x+g;s=(B-g)*x+(s-f)*D+f}e.push(new THREE.Vector2(q,s))}}}c=e[e.length-
	1];Math.abs(c.x-e[0].x)<Number.EPSILON&&Math.abs(c.y-e[0].y)<Number.EPSILON&&e.splice(e.length-1,1);b&&e.push(e[0]);return e};
	THREE.Path.prototype.toShapes=function(a,b){function c(a){for(var b=[],c=0,d=a.length;c<d;c++){var e=a[c],f=new THREE.Shape;f.actions=e.actions;f.curves=e.curves;b.push(f)}return b}function d(a,b){for(var c=b.length,d=!1,e=c-1,f=0;f<c;e=f++){var g=b[e],h=b[f],k=h.x-g.x,l=h.y-g.y;if(Math.abs(l)>Number.EPSILON){if(0>l&&(g=b[f],k=-k,h=b[e],l=-l),!(a.y<g.y||a.y>h.y))if(a.y===g.y){if(a.x===g.x)return!0}else{e=l*(a.x-g.x)-k*(a.y-g.y);if(0===e)return!0;0>e||(d=!d)}}else if(a.y===g.y&&(h.x<=a.x&&a.x<=g.x||
	g.x<=a.x&&a.x<=h.x))return!0}return d}var e=THREE.ShapeUtils.isClockWise,g=function(a){for(var b=[],c=new THREE.Path,d=0,e=a.length;d<e;d++){var f=a[d],g=f.args,f=f.action;"moveTo"===f&&0!==c.actions.length&&(b.push(c),c=new THREE.Path);c[f].apply(c,g)}0!==c.actions.length&&b.push(c);return b}(this.actions);if(0===g.length)return[];if(!0===b)return c(g);var f,h,l,k=[];if(1===g.length)return h=g[0],l=new THREE.Shape,l.actions=h.actions,l.curves=h.curves,k.push(l),k;var m=!e(g[0].getPoints()),m=a?!m:
	m;l=[];var p=[],n=[],q=0,s;p[q]=void 0;n[q]=[];for(var t=0,v=g.length;t<v;t++)h=g[t],s=h.getPoints(),f=e(s),(f=a?!f:f)?(!m&&p[q]&&q++,p[q]={s:new THREE.Shape,p:s},p[q].s.actions=h.actions,p[q].s.curves=h.curves,m&&q++,n[q]=[]):n[q].push({h:h,p:s[0]});if(!p[0])return c(g);if(1<p.length){t=!1;h=[];e=0;for(g=p.length;e<g;e++)l[e]=[];e=0;for(g=p.length;e<g;e++)for(f=n[e],m=0;m<f.length;m++){q=f[m];s=!0;for(v=0;v<p.length;v++)d(q.p,p[v].p)&&(e!==v&&h.push({froms:e,tos:v,hole:m}),s?(s=!1,l[v].push(q)):
	t=!0);s&&l[e].push(q)}0<h.length&&(t||(n=l))}t=0;for(e=p.length;t<e;t++)for(l=p[t].s,k.push(l),h=n[t],g=0,f=h.length;g<f;g++)l.holes.push(h[g].h);return k};THREE.Shape=function(){THREE.Path.apply(this,arguments);this.holes=[]};THREE.Shape.prototype=Object.create(THREE.Path.prototype);THREE.Shape.prototype.constructor=THREE.Shape;THREE.Shape.prototype.extrude=function(a){return new THREE.ExtrudeGeometry(this,a)};THREE.Shape.prototype.makeGeometry=function(a){return new THREE.ShapeGeometry(this,a)};
	THREE.Shape.prototype.getPointsHoles=function(a){for(var b=[],c=0,d=this.holes.length;c<d;c++)b[c]=this.holes[c].getPoints(a);return b};THREE.Shape.prototype.extractAllPoints=function(a){return{shape:this.getPoints(a),holes:this.getPointsHoles(a)}};THREE.Shape.prototype.extractPoints=function(a){return this.extractAllPoints(a)};THREE.Shape.Utils=THREE.ShapeUtils;THREE.LineCurve=function(a,b){this.v1=a;this.v2=b};THREE.LineCurve.prototype=Object.create(THREE.Curve.prototype);
	THREE.LineCurve.prototype.constructor=THREE.LineCurve;THREE.LineCurve.prototype.getPoint=function(a){var b=this.v2.clone().sub(this.v1);b.multiplyScalar(a).add(this.v1);return b};THREE.LineCurve.prototype.getPointAt=function(a){return this.getPoint(a)};THREE.LineCurve.prototype.getTangent=function(a){return this.v2.clone().sub(this.v1).normalize()};THREE.QuadraticBezierCurve=function(a,b,c){this.v0=a;this.v1=b;this.v2=c};THREE.QuadraticBezierCurve.prototype=Object.create(THREE.Curve.prototype);
	THREE.QuadraticBezierCurve.prototype.constructor=THREE.QuadraticBezierCurve;THREE.QuadraticBezierCurve.prototype.getPoint=function(a){var b=THREE.ShapeUtils.b2;return new THREE.Vector2(b(a,this.v0.x,this.v1.x,this.v2.x),b(a,this.v0.y,this.v1.y,this.v2.y))};THREE.QuadraticBezierCurve.prototype.getTangent=function(a){var b=THREE.CurveUtils.tangentQuadraticBezier;return(new THREE.Vector2(b(a,this.v0.x,this.v1.x,this.v2.x),b(a,this.v0.y,this.v1.y,this.v2.y))).normalize()};
	THREE.CubicBezierCurve=function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d};THREE.CubicBezierCurve.prototype=Object.create(THREE.Curve.prototype);THREE.CubicBezierCurve.prototype.constructor=THREE.CubicBezierCurve;THREE.CubicBezierCurve.prototype.getPoint=function(a){var b=THREE.ShapeUtils.b3;return new THREE.Vector2(b(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x),b(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y))};
	THREE.CubicBezierCurve.prototype.getTangent=function(a){var b=THREE.CurveUtils.tangentCubicBezier;return(new THREE.Vector2(b(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x),b(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y))).normalize()};THREE.SplineCurve=function(a){this.points=void 0==a?[]:a};THREE.SplineCurve.prototype=Object.create(THREE.Curve.prototype);THREE.SplineCurve.prototype.constructor=THREE.SplineCurve;
	THREE.SplineCurve.prototype.getPoint=function(a){var b=this.points;a*=b.length-1;var c=Math.floor(a);a-=c;var d=b[0===c?c:c-1],e=b[c],g=b[c>b.length-2?b.length-1:c+1],b=b[c>b.length-3?b.length-1:c+2],c=THREE.CurveUtils.interpolate;return new THREE.Vector2(c(d.x,e.x,g.x,b.x,a),c(d.y,e.y,g.y,b.y,a))};THREE.EllipseCurve=function(a,b,c,d,e,g,f,h){this.aX=a;this.aY=b;this.xRadius=c;this.yRadius=d;this.aStartAngle=e;this.aEndAngle=g;this.aClockwise=f;this.aRotation=h||0};THREE.EllipseCurve.prototype=Object.create(THREE.Curve.prototype);
	THREE.EllipseCurve.prototype.constructor=THREE.EllipseCurve;
	THREE.EllipseCurve.prototype.getPoint=function(a){var b=this.aEndAngle-this.aStartAngle;0>b&&(b+=2*Math.PI);b>2*Math.PI&&(b-=2*Math.PI);b=!0===this.aClockwise?this.aEndAngle+(1-a)*(2*Math.PI-b):this.aStartAngle+a*b;a=this.aX+this.xRadius*Math.cos(b);var c=this.aY+this.yRadius*Math.sin(b);if(0!==this.aRotation){var b=Math.cos(this.aRotation),d=Math.sin(this.aRotation),e=a;a=(e-this.aX)*b-(c-this.aY)*d+this.aX;c=(e-this.aX)*d+(c-this.aY)*b+this.aY}return new THREE.Vector2(a,c)};
	THREE.ArcCurve=function(a,b,c,d,e,g){THREE.EllipseCurve.call(this,a,b,c,c,d,e,g)};THREE.ArcCurve.prototype=Object.create(THREE.EllipseCurve.prototype);THREE.ArcCurve.prototype.constructor=THREE.ArcCurve;THREE.LineCurve3=THREE.Curve.create(function(a,b){this.v1=a;this.v2=b},function(a){var b=new THREE.Vector3;b.subVectors(this.v2,this.v1);b.multiplyScalar(a);b.add(this.v1);return b});
	THREE.QuadraticBezierCurve3=THREE.Curve.create(function(a,b,c){this.v0=a;this.v1=b;this.v2=c},function(a){var b=THREE.ShapeUtils.b2;return new THREE.Vector3(b(a,this.v0.x,this.v1.x,this.v2.x),b(a,this.v0.y,this.v1.y,this.v2.y),b(a,this.v0.z,this.v1.z,this.v2.z))});
	THREE.CubicBezierCurve3=THREE.Curve.create(function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d},function(a){var b=THREE.ShapeUtils.b3;return new THREE.Vector3(b(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x),b(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y),b(a,this.v0.z,this.v1.z,this.v2.z,this.v3.z))});
	THREE.SplineCurve3=THREE.Curve.create(function(a){console.warn("THREE.SplineCurve3 will be deprecated. Please use THREE.CatmullRomCurve3");this.points=void 0==a?[]:a},function(a){var b=this.points;a*=b.length-1;var c=Math.floor(a);a-=c;var d=b[0==c?c:c-1],e=b[c],g=b[c>b.length-2?b.length-1:c+1],b=b[c>b.length-3?b.length-1:c+2],c=THREE.CurveUtils.interpolate;return new THREE.Vector3(c(d.x,e.x,g.x,b.x,a),c(d.y,e.y,g.y,b.y,a),c(d.z,e.z,g.z,b.z,a))});
	THREE.CatmullRomCurve3=function(){function a(){}var b=new THREE.Vector3,c=new a,d=new a,e=new a;a.prototype.init=function(a,b,c,d){this.c0=a;this.c1=c;this.c2=-3*a+3*b-2*c-d;this.c3=2*a-2*b+c+d};a.prototype.initNonuniformCatmullRom=function(a,b,c,d,e,m,p){a=((b-a)/e-(c-a)/(e+m)+(c-b)/m)*m;d=((c-b)/m-(d-b)/(m+p)+(d-c)/p)*m;this.init(b,c,a,d)};a.prototype.initCatmullRom=function(a,b,c,d,e){this.init(b,c,e*(c-a),e*(d-b))};a.prototype.calc=function(a){var b=a*a;return this.c0+this.c1*a+this.c2*b+this.c3*
	b*a};return THREE.Curve.create(function(a){this.points=a||[]},function(a){var f=this.points,h,l;l=f.length;2>l&&console.log("duh, you need at least 2 points");a*=l-1;h=Math.floor(a);a-=h;0===a&&h===l-1&&(h=l-2,a=1);var k,m,p;0===h?(b.subVectors(f[0],f[1]).add(f[0]),k=b):k=f[h-1];m=f[h];p=f[h+1];h+2<l?f=f[h+2]:(b.subVectors(f[l-1],f[l-2]).add(f[l-2]),f=b);if(void 0===this.type||"centripetal"===this.type||"chordal"===this.type){var n="chordal"===this.type?.5:.25;l=Math.pow(k.distanceToSquared(m),n);
	h=Math.pow(m.distanceToSquared(p),n);n=Math.pow(p.distanceToSquared(f),n);1E-4>h&&(h=1);1E-4>l&&(l=h);1E-4>n&&(n=h);c.initNonuniformCatmullRom(k.x,m.x,p.x,f.x,l,h,n);d.initNonuniformCatmullRom(k.y,m.y,p.y,f.y,l,h,n);e.initNonuniformCatmullRom(k.z,m.z,p.z,f.z,l,h,n)}else"catmullrom"===this.type&&(l=void 0!==this.tension?this.tension:.5,c.initCatmullRom(k.x,m.x,p.x,f.x,l),d.initCatmullRom(k.y,m.y,p.y,f.y,l),e.initCatmullRom(k.z,m.z,p.z,f.z,l));return new THREE.Vector3(c.calc(a),d.calc(a),e.calc(a))})}();
	THREE.ClosedSplineCurve3=THREE.Curve.create(function(a){this.points=void 0==a?[]:a},function(a){var b=this.points;a*=b.length-0;var c=Math.floor(a);a-=c;var c=c+(0<c?0:(Math.floor(Math.abs(c)/b.length)+1)*b.length),d=b[(c-1)%b.length],e=b[c%b.length],g=b[(c+1)%b.length],b=b[(c+2)%b.length],c=THREE.CurveUtils.interpolate;return new THREE.Vector3(c(d.x,e.x,g.x,b.x,a),c(d.y,e.y,g.y,b.y,a),c(d.z,e.z,g.z,b.z,a))});
	THREE.BoxGeometry=function(a,b,c,d,e,g){function f(a,b,c,d,e,f,g,t){var v,u=h.widthSegments,w=h.heightSegments,D=e/2,x=f/2,B=h.vertices.length;if("x"===a&&"y"===b||"y"===a&&"x"===b)v="z";else if("x"===a&&"z"===b||"z"===a&&"x"===b)v="y",w=h.depthSegments;else if("z"===a&&"y"===b||"y"===a&&"z"===b)v="x",u=h.depthSegments;var y=u+1,z=w+1,A=e/u,J=f/w,F=new THREE.Vector3;F[v]=0<g?1:-1;for(e=0;e<z;e++)for(f=0;f<y;f++){var C=new THREE.Vector3;C[a]=(f*A-D)*c;C[b]=(e*J-x)*d;C[v]=g;h.vertices.push(C)}for(e=
	0;e<w;e++)for(f=0;f<u;f++)x=f+y*e,a=f+y*(e+1),b=f+1+y*(e+1),c=f+1+y*e,d=new THREE.Vector2(f/u,1-e/w),g=new THREE.Vector2(f/u,1-(e+1)/w),v=new THREE.Vector2((f+1)/u,1-(e+1)/w),D=new THREE.Vector2((f+1)/u,1-e/w),x=new THREE.Face3(x+B,a+B,c+B),x.normal.copy(F),x.vertexNormals.push(F.clone(),F.clone(),F.clone()),x.materialIndex=t,h.faces.push(x),h.faceVertexUvs[0].push([d,g,D]),x=new THREE.Face3(a+B,b+B,c+B),x.normal.copy(F),x.vertexNormals.push(F.clone(),F.clone(),F.clone()),x.materialIndex=t,h.faces.push(x),
	h.faceVertexUvs[0].push([g.clone(),v,D.clone()])}THREE.Geometry.call(this);this.type="BoxGeometry";this.parameters={width:a,height:b,depth:c,widthSegments:d,heightSegments:e,depthSegments:g};this.widthSegments=d||1;this.heightSegments=e||1;this.depthSegments=g||1;var h=this;d=a/2;e=b/2;g=c/2;f("z","y",-1,-1,c,b,d,0);f("z","y",1,-1,c,b,-d,1);f("x","z",1,1,a,c,e,2);f("x","z",1,-1,a,c,-e,3);f("x","y",1,-1,a,b,g,4);f("x","y",-1,-1,a,b,-g,5);this.mergeVertices()};THREE.BoxGeometry.prototype=Object.create(THREE.Geometry.prototype);
	THREE.BoxGeometry.prototype.constructor=THREE.BoxGeometry;THREE.BoxGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.BoxGeometry(a.width,a.height,a.depth,a.widthSegments,a.heightSegments,a.depthSegments)};THREE.CubeGeometry=THREE.BoxGeometry;THREE.CircleGeometry=function(a,b,c,d){THREE.Geometry.call(this);this.type="CircleGeometry";this.parameters={radius:a,segments:b,thetaStart:c,thetaLength:d};this.fromBufferGeometry(new THREE.CircleBufferGeometry(a,b,c,d))};
	THREE.CircleGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.CircleGeometry.prototype.constructor=THREE.CircleGeometry;THREE.CircleGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.CircleGeometry(a.radius,a.segments,a.thetaStart,a.thetaLength)};
	THREE.CircleBufferGeometry=function(a,b,c,d){THREE.BufferGeometry.call(this);this.type="CircleBufferGeometry";this.parameters={radius:a,segments:b,thetaStart:c,thetaLength:d};a=a||50;b=void 0!==b?Math.max(3,b):8;c=void 0!==c?c:0;d=void 0!==d?d:2*Math.PI;var e=b+2,g=new Float32Array(3*e),f=new Float32Array(3*e),e=new Float32Array(2*e);f[2]=1;e[0]=.5;e[1]=.5;for(var h=0,l=3,k=2;h<=b;h++,l+=3,k+=2){var m=c+h/b*d;g[l]=a*Math.cos(m);g[l+1]=a*Math.sin(m);f[l+2]=1;e[k]=(g[l]/a+1)/2;e[k+1]=(g[l+1]/a+1)/2}c=
	[];for(l=1;l<=b;l++)c.push(l,l+1,0);this.setIndex(new THREE.BufferAttribute(new Uint16Array(c),1));this.addAttribute("position",new THREE.BufferAttribute(g,3));this.addAttribute("normal",new THREE.BufferAttribute(f,3));this.addAttribute("uv",new THREE.BufferAttribute(e,2));this.boundingSphere=new THREE.Sphere(new THREE.Vector3,a)};THREE.CircleBufferGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);THREE.CircleBufferGeometry.prototype.constructor=THREE.CircleBufferGeometry;
	THREE.CircleBufferGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.CircleBufferGeometry(a.radius,a.segments,a.thetaStart,a.thetaLength)};
	THREE.CylinderGeometry=function(a,b,c,d,e,g,f,h){THREE.Geometry.call(this);this.type="CylinderGeometry";this.parameters={radiusTop:a,radiusBottom:b,height:c,radialSegments:d,heightSegments:e,openEnded:g,thetaStart:f,thetaLength:h};a=void 0!==a?a:20;b=void 0!==b?b:20;c=void 0!==c?c:100;d=d||8;e=e||1;g=void 0!==g?g:!1;f=void 0!==f?f:0;h=void 0!==h?h:2*Math.PI;var l=c/2,k,m,p=[],n=[];for(m=0;m<=e;m++){var q=[],s=[],t=m/e,v=t*(b-a)+a;for(k=0;k<=d;k++){var u=k/d,w=new THREE.Vector3;w.x=v*Math.sin(u*h+
	f);w.y=-t*c+l;w.z=v*Math.cos(u*h+f);this.vertices.push(w);q.push(this.vertices.length-1);s.push(new THREE.Vector2(u,1-t))}p.push(q);n.push(s)}c=(b-a)/c;for(k=0;k<d;k++)for(0!==a?(f=this.vertices[p[0][k]].clone(),h=this.vertices[p[0][k+1]].clone()):(f=this.vertices[p[1][k]].clone(),h=this.vertices[p[1][k+1]].clone()),f.setY(Math.sqrt(f.x*f.x+f.z*f.z)*c).normalize(),h.setY(Math.sqrt(h.x*h.x+h.z*h.z)*c).normalize(),m=0;m<e;m++){var q=p[m][k],s=p[m+1][k],t=p[m+1][k+1],v=p[m][k+1],u=f.clone(),w=f.clone(),
	D=h.clone(),x=h.clone(),B=n[m][k].clone(),y=n[m+1][k].clone(),z=n[m+1][k+1].clone(),A=n[m][k+1].clone();this.faces.push(new THREE.Face3(q,s,v,[u,w,x]));this.faceVertexUvs[0].push([B,y,A]);this.faces.push(new THREE.Face3(s,t,v,[w.clone(),D,x.clone()]));this.faceVertexUvs[0].push([y.clone(),z,A.clone()])}if(!1===g&&0<a)for(this.vertices.push(new THREE.Vector3(0,l,0)),k=0;k<d;k++)q=p[0][k],s=p[0][k+1],t=this.vertices.length-1,u=new THREE.Vector3(0,1,0),w=new THREE.Vector3(0,1,0),D=new THREE.Vector3(0,
	1,0),B=n[0][k].clone(),y=n[0][k+1].clone(),z=new THREE.Vector2(y.x,0),this.faces.push(new THREE.Face3(q,s,t,[u,w,D],void 0,1)),this.faceVertexUvs[0].push([B,y,z]);if(!1===g&&0<b)for(this.vertices.push(new THREE.Vector3(0,-l,0)),k=0;k<d;k++)q=p[e][k+1],s=p[e][k],t=this.vertices.length-1,u=new THREE.Vector3(0,-1,0),w=new THREE.Vector3(0,-1,0),D=new THREE.Vector3(0,-1,0),B=n[e][k+1].clone(),y=n[e][k].clone(),z=new THREE.Vector2(y.x,1),this.faces.push(new THREE.Face3(q,s,t,[u,w,D],void 0,2)),this.faceVertexUvs[0].push([B,
	y,z]);this.computeFaceNormals()};THREE.CylinderGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.CylinderGeometry.prototype.constructor=THREE.CylinderGeometry;THREE.CylinderGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.CylinderGeometry(a.radiusTop,a.radiusBottom,a.height,a.radialSegments,a.heightSegments,a.openEnded,a.thetaStart,a.thetaLength)};
	THREE.EdgesGeometry=function(a,b){function c(a,b){return a-b}THREE.BufferGeometry.call(this);var d=Math.cos(THREE.Math.degToRad(void 0!==b?b:1)),e=[0,0],g={},f=["a","b","c"],h;a instanceof THREE.BufferGeometry?(h=new THREE.Geometry,h.fromBufferGeometry(a)):h=a.clone();h.mergeVertices();h.computeFaceNormals();var l=h.vertices;h=h.faces;for(var k=0,m=h.length;k<m;k++)for(var p=h[k],n=0;3>n;n++){e[0]=p[f[n]];e[1]=p[f[(n+1)%3]];e.sort(c);var q=e.toString();void 0===g[q]?g[q]={vert1:e[0],vert2:e[1],face1:k,
	face2:void 0}:g[q].face2=k}e=[];for(q in g)if(f=g[q],void 0===f.face2||h[f.face1].normal.dot(h[f.face2].normal)<=d)k=l[f.vert1],e.push(k.x),e.push(k.y),e.push(k.z),k=l[f.vert2],e.push(k.x),e.push(k.y),e.push(k.z);this.addAttribute("position",new THREE.BufferAttribute(new Float32Array(e),3))};THREE.EdgesGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);THREE.EdgesGeometry.prototype.constructor=THREE.EdgesGeometry;
	THREE.ExtrudeGeometry=function(a,b){"undefined"!==typeof a&&(THREE.Geometry.call(this),this.type="ExtrudeGeometry",a=Array.isArray(a)?a:[a],this.addShapeList(a,b),this.computeFaceNormals())};THREE.ExtrudeGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ExtrudeGeometry.prototype.constructor=THREE.ExtrudeGeometry;THREE.ExtrudeGeometry.prototype.addShapeList=function(a,b){for(var c=a.length,d=0;d<c;d++)this.addShape(a[d],b)};
	THREE.ExtrudeGeometry.prototype.addShape=function(a,b){function c(a,b,c){b||console.error("THREE.ExtrudeGeometry: vec does not exist");return b.clone().multiplyScalar(c).add(a)}function d(a,b,c){var d=1,d=a.x-b.x,e=a.y-b.y,f=c.x-a.x,g=c.y-a.y,h=d*d+e*e;if(Math.abs(d*g-e*f)>Number.EPSILON){var k=Math.sqrt(h),l=Math.sqrt(f*f+g*g),h=b.x-e/k;b=b.y+d/k;f=((c.x-g/l-h)*g-(c.y+f/l-b)*f)/(d*g-e*f);c=h+d*f-a.x;a=b+e*f-a.y;d=c*c+a*a;if(2>=d)return new THREE.Vector2(c,a);d=Math.sqrt(d/2)}else a=!1,d>Number.EPSILON?
	f>Number.EPSILON&&(a=!0):d<-Number.EPSILON?f<-Number.EPSILON&&(a=!0):Math.sign(e)===Math.sign(g)&&(a=!0),a?(c=-e,a=d,d=Math.sqrt(h)):(c=d,a=e,d=Math.sqrt(h/2));return new THREE.Vector2(c/d,a/d)}function e(a,b){var c,d;for(G=a.length;0<=--G;){c=G;d=G-1;0>d&&(d=a.length-1);for(var e=0,f=q+2*m,e=0;e<f;e++){var g=T*e,h=T*(e+1),k=b+c+g,g=b+d+g,l=b+d+h,h=b+c+h,k=k+F,g=g+F,l=l+F,h=h+F;J.faces.push(new THREE.Face3(k,g,h,null,null,1));J.faces.push(new THREE.Face3(g,l,h,null,null,1));k=u.generateSideWallUV(J,
	k,g,l,h);J.faceVertexUvs[0].push([k[0],k[1],k[3]]);J.faceVertexUvs[0].push([k[1],k[2],k[3]])}}}function g(a,b,c){J.vertices.push(new THREE.Vector3(a,b,c))}function f(a,b,c){a+=F;b+=F;c+=F;J.faces.push(new THREE.Face3(a,b,c,null,null,0));a=u.generateTopUV(J,a,b,c);J.faceVertexUvs[0].push(a)}var h=void 0!==b.amount?b.amount:100,l=void 0!==b.bevelThickness?b.bevelThickness:6,k=void 0!==b.bevelSize?b.bevelSize:l-2,m=void 0!==b.bevelSegments?b.bevelSegments:3,p=void 0!==b.bevelEnabled?b.bevelEnabled:!0,
	n=void 0!==b.curveSegments?b.curveSegments:12,q=void 0!==b.steps?b.steps:1,s=b.extrudePath,t,v=!1,u=void 0!==b.UVGenerator?b.UVGenerator:THREE.ExtrudeGeometry.WorldUVGenerator,w,D,x,B;s&&(t=s.getSpacedPoints(q),v=!0,p=!1,w=void 0!==b.frames?b.frames:new THREE.TubeGeometry.FrenetFrames(s,q,!1),D=new THREE.Vector3,x=new THREE.Vector3,B=new THREE.Vector3);p||(k=l=m=0);var y,z,A,J=this,F=this.vertices.length,s=a.extractPoints(n),n=s.shape,C=s.holes;if(s=!THREE.ShapeUtils.isClockWise(n)){n=n.reverse();
	z=0;for(A=C.length;z<A;z++)y=C[z],THREE.ShapeUtils.isClockWise(y)&&(C[z]=y.reverse());s=!1}var N=THREE.ShapeUtils.triangulateShape(n,C),L=n;z=0;for(A=C.length;z<A;z++)y=C[z],n=n.concat(y);var Q,M,K,E,O,T=n.length,H,R=N.length,s=[],G=0;K=L.length;Q=K-1;for(M=G+1;G<K;G++,Q++,M++)Q===K&&(Q=0),M===K&&(M=0),s[G]=d(L[G],L[Q],L[M]);var ia=[],U,X=s.concat();z=0;for(A=C.length;z<A;z++){y=C[z];U=[];G=0;K=y.length;Q=K-1;for(M=G+1;G<K;G++,Q++,M++)Q===K&&(Q=0),M===K&&(M=0),U[G]=d(y[G],y[Q],y[M]);ia.push(U);X=
	X.concat(U)}for(Q=0;Q<m;Q++){K=Q/m;E=l*(1-K);M=k*Math.sin(K*Math.PI/2);G=0;for(K=L.length;G<K;G++)O=c(L[G],s[G],M),g(O.x,O.y,-E);z=0;for(A=C.length;z<A;z++)for(y=C[z],U=ia[z],G=0,K=y.length;G<K;G++)O=c(y[G],U[G],M),g(O.x,O.y,-E)}M=k;for(G=0;G<T;G++)O=p?c(n[G],X[G],M):n[G],v?(x.copy(w.normals[0]).multiplyScalar(O.x),D.copy(w.binormals[0]).multiplyScalar(O.y),B.copy(t[0]).add(x).add(D),g(B.x,B.y,B.z)):g(O.x,O.y,0);for(K=1;K<=q;K++)for(G=0;G<T;G++)O=p?c(n[G],X[G],M):n[G],v?(x.copy(w.normals[K]).multiplyScalar(O.x),
	D.copy(w.binormals[K]).multiplyScalar(O.y),B.copy(t[K]).add(x).add(D),g(B.x,B.y,B.z)):g(O.x,O.y,h/q*K);for(Q=m-1;0<=Q;Q--){K=Q/m;E=l*(1-K);M=k*Math.sin(K*Math.PI/2);G=0;for(K=L.length;G<K;G++)O=c(L[G],s[G],M),g(O.x,O.y,h+E);z=0;for(A=C.length;z<A;z++)for(y=C[z],U=ia[z],G=0,K=y.length;G<K;G++)O=c(y[G],U[G],M),v?g(O.x,O.y+t[q-1].y,t[q-1].x+E):g(O.x,O.y,h+E)}(function(){if(p){var a;a=0*T;for(G=0;G<R;G++)H=N[G],f(H[2]+a,H[1]+a,H[0]+a);a=q+2*m;a*=T;for(G=0;G<R;G++)H=N[G],f(H[0]+a,H[1]+a,H[2]+a)}else{for(G=
	0;G<R;G++)H=N[G],f(H[2],H[1],H[0]);for(G=0;G<R;G++)H=N[G],f(H[0]+T*q,H[1]+T*q,H[2]+T*q)}})();(function(){var a=0;e(L,a);a+=L.length;z=0;for(A=C.length;z<A;z++)y=C[z],e(y,a),a+=y.length})()};
	THREE.ExtrudeGeometry.WorldUVGenerator={generateTopUV:function(a,b,c,d){a=a.vertices;b=a[b];c=a[c];d=a[d];return[new THREE.Vector2(b.x,b.y),new THREE.Vector2(c.x,c.y),new THREE.Vector2(d.x,d.y)]},generateSideWallUV:function(a,b,c,d,e){a=a.vertices;b=a[b];c=a[c];d=a[d];e=a[e];return.01>Math.abs(b.y-c.y)?[new THREE.Vector2(b.x,1-b.z),new THREE.Vector2(c.x,1-c.z),new THREE.Vector2(d.x,1-d.z),new THREE.Vector2(e.x,1-e.z)]:[new THREE.Vector2(b.y,1-b.z),new THREE.Vector2(c.y,1-c.z),new THREE.Vector2(d.y,
	1-d.z),new THREE.Vector2(e.y,1-e.z)]}};THREE.ShapeGeometry=function(a,b){THREE.Geometry.call(this);this.type="ShapeGeometry";!1===Array.isArray(a)&&(a=[a]);this.addShapeList(a,b);this.computeFaceNormals()};THREE.ShapeGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ShapeGeometry.prototype.constructor=THREE.ShapeGeometry;THREE.ShapeGeometry.prototype.addShapeList=function(a,b){for(var c=0,d=a.length;c<d;c++)this.addShape(a[c],b);return this};
	THREE.ShapeGeometry.prototype.addShape=function(a,b){void 0===b&&(b={});var c=b.material,d=void 0===b.UVGenerator?THREE.ExtrudeGeometry.WorldUVGenerator:b.UVGenerator,e,g,f,h=this.vertices.length;e=a.extractPoints(void 0!==b.curveSegments?b.curveSegments:12);var l=e.shape,k=e.holes;if(!THREE.ShapeUtils.isClockWise(l))for(l=l.reverse(),e=0,g=k.length;e<g;e++)f=k[e],THREE.ShapeUtils.isClockWise(f)&&(k[e]=f.reverse());var m=THREE.ShapeUtils.triangulateShape(l,k);e=0;for(g=k.length;e<g;e++)f=k[e],l=l.concat(f);
	k=l.length;g=m.length;for(e=0;e<k;e++)f=l[e],this.vertices.push(new THREE.Vector3(f.x,f.y,0));for(e=0;e<g;e++)k=m[e],l=k[0]+h,f=k[1]+h,k=k[2]+h,this.faces.push(new THREE.Face3(l,f,k,null,null,c)),this.faceVertexUvs[0].push(d.generateTopUV(this,l,f,k))};
	THREE.LatheGeometry=function(a,b,c,d){THREE.Geometry.call(this);this.type="LatheGeometry";this.parameters={points:a,segments:b,phiStart:c,phiLength:d};b=b||12;c=c||0;d=d||2*Math.PI;for(var e=1/(a.length-1),g=1/b,f=0,h=b;f<=h;f++)for(var l=c+f*g*d,k=Math.cos(l),m=Math.sin(l),l=0,p=a.length;l<p;l++){var n=a[l],q=new THREE.Vector3;q.x=k*n.x-m*n.y;q.y=m*n.x+k*n.y;q.z=n.z;this.vertices.push(q)}c=a.length;f=0;for(h=b;f<h;f++)for(l=0,p=a.length-1;l<p;l++){b=m=l+c*f;d=m+c;var k=m+1+c,m=m+1,n=f*g,q=l*e,s=
	n+g,t=q+e;this.faces.push(new THREE.Face3(b,d,m));this.faceVertexUvs[0].push([new THREE.Vector2(n,q),new THREE.Vector2(s,q),new THREE.Vector2(n,t)]);this.faces.push(new THREE.Face3(d,k,m));this.faceVertexUvs[0].push([new THREE.Vector2(s,q),new THREE.Vector2(s,t),new THREE.Vector2(n,t)])}this.mergeVertices();this.computeFaceNormals();this.computeVertexNormals()};THREE.LatheGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.LatheGeometry.prototype.constructor=THREE.LatheGeometry;
	THREE.PlaneGeometry=function(a,b,c,d){THREE.Geometry.call(this);this.type="PlaneGeometry";this.parameters={width:a,height:b,widthSegments:c,heightSegments:d};this.fromBufferGeometry(new THREE.PlaneBufferGeometry(a,b,c,d))};THREE.PlaneGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.PlaneGeometry.prototype.constructor=THREE.PlaneGeometry;THREE.PlaneGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.PlaneGeometry(a.width,a.height,a.widthSegments,a.heightSegments)};
	THREE.PlaneBufferGeometry=function(a,b,c,d){THREE.BufferGeometry.call(this);this.type="PlaneBufferGeometry";this.parameters={width:a,height:b,widthSegments:c,heightSegments:d};var e=a/2,g=b/2;c=Math.floor(c)||1;d=Math.floor(d)||1;var f=c+1,h=d+1,l=a/c,k=b/d;b=new Float32Array(f*h*3);a=new Float32Array(f*h*3);for(var m=new Float32Array(f*h*2),p=0,n=0,q=0;q<h;q++)for(var s=q*k-g,t=0;t<f;t++)b[p]=t*l-e,b[p+1]=-s,a[p+2]=1,m[n]=t/c,m[n+1]=1-q/d,p+=3,n+=2;p=0;e=new (65535<b.length/3?Uint32Array:Uint16Array)(c*
	d*6);for(q=0;q<d;q++)for(t=0;t<c;t++)g=t+f*(q+1),h=t+1+f*(q+1),l=t+1+f*q,e[p]=t+f*q,e[p+1]=g,e[p+2]=l,e[p+3]=g,e[p+4]=h,e[p+5]=l,p+=6;this.setIndex(new THREE.BufferAttribute(e,1));this.addAttribute("position",new THREE.BufferAttribute(b,3));this.addAttribute("normal",new THREE.BufferAttribute(a,3));this.addAttribute("uv",new THREE.BufferAttribute(m,2))};THREE.PlaneBufferGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);THREE.PlaneBufferGeometry.prototype.constructor=THREE.PlaneBufferGeometry;
	THREE.PlaneBufferGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.PlaneBufferGeometry(a.width,a.height,a.widthSegments,a.heightSegments)};
	THREE.RingGeometry=function(a,b,c,d,e,g){THREE.Geometry.call(this);this.type="RingGeometry";this.parameters={innerRadius:a,outerRadius:b,thetaSegments:c,phiSegments:d,thetaStart:e,thetaLength:g};a=a||0;b=b||50;e=void 0!==e?e:0;g=void 0!==g?g:2*Math.PI;c=void 0!==c?Math.max(3,c):8;d=void 0!==d?Math.max(1,d):8;var f,h=[],l=a,k=(b-a)/d;for(a=0;a<d+1;a++){for(f=0;f<c+1;f++){var m=new THREE.Vector3,p=e+f/c*g;m.x=l*Math.cos(p);m.y=l*Math.sin(p);this.vertices.push(m);h.push(new THREE.Vector2((m.x/b+1)/2,
	(m.y/b+1)/2))}l+=k}b=new THREE.Vector3(0,0,1);for(a=0;a<d;a++)for(e=a*(c+1),f=0;f<c;f++)g=p=f+e,k=p+c+1,m=p+c+2,this.faces.push(new THREE.Face3(g,k,m,[b.clone(),b.clone(),b.clone()])),this.faceVertexUvs[0].push([h[g].clone(),h[k].clone(),h[m].clone()]),g=p,k=p+c+2,m=p+1,this.faces.push(new THREE.Face3(g,k,m,[b.clone(),b.clone(),b.clone()])),this.faceVertexUvs[0].push([h[g].clone(),h[k].clone(),h[m].clone()]);this.computeFaceNormals();this.boundingSphere=new THREE.Sphere(new THREE.Vector3,l)};
	THREE.RingGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.RingGeometry.prototype.constructor=THREE.RingGeometry;THREE.RingGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.RingGeometry(a.innerRadius,a.outerRadius,a.thetaSegments,a.phiSegments,a.thetaStart,a.thetaLength)};
	THREE.SphereGeometry=function(a,b,c,d,e,g,f){THREE.Geometry.call(this);this.type="SphereGeometry";this.parameters={radius:a,widthSegments:b,heightSegments:c,phiStart:d,phiLength:e,thetaStart:g,thetaLength:f};this.fromBufferGeometry(new THREE.SphereBufferGeometry(a,b,c,d,e,g,f))};THREE.SphereGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.SphereGeometry.prototype.constructor=THREE.SphereGeometry;
	THREE.SphereGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.SphereGeometry(a.radius,a.widthSegments,a.heightSegments,a.phiStart,a.phiLength,a.thetaStart,a.thetaLength)};
	THREE.SphereBufferGeometry=function(a,b,c,d,e,g,f){THREE.BufferGeometry.call(this);this.type="SphereBufferGeometry";this.parameters={radius:a,widthSegments:b,heightSegments:c,phiStart:d,phiLength:e,thetaStart:g,thetaLength:f};a=a||50;b=Math.max(3,Math.floor(b)||8);c=Math.max(2,Math.floor(c)||6);d=void 0!==d?d:0;e=void 0!==e?e:2*Math.PI;g=void 0!==g?g:0;f=void 0!==f?f:Math.PI;for(var h=g+f,l=(b+1)*(c+1),k=new THREE.BufferAttribute(new Float32Array(3*l),3),m=new THREE.BufferAttribute(new Float32Array(3*
	l),3),l=new THREE.BufferAttribute(new Float32Array(2*l),2),p=0,n=[],q=new THREE.Vector3,s=0;s<=c;s++){for(var t=[],v=s/c,u=0;u<=b;u++){var w=u/b,D=-a*Math.cos(d+w*e)*Math.sin(g+v*f),x=a*Math.cos(g+v*f),B=a*Math.sin(d+w*e)*Math.sin(g+v*f);q.set(D,x,B).normalize();k.setXYZ(p,D,x,B);m.setXYZ(p,q.x,q.y,q.z);l.setXY(p,w,1-v);t.push(p);p++}n.push(t)}d=[];for(s=0;s<c;s++)for(u=0;u<b;u++)e=n[s][u+1],f=n[s][u],p=n[s+1][u],q=n[s+1][u+1],(0!==s||0<g)&&d.push(e,f,q),(s!==c-1||h<Math.PI)&&d.push(f,p,q);this.setIndex(new (65535<
	k.count?THREE.Uint32Attribute:THREE.Uint16Attribute)(d,1));this.addAttribute("position",k);this.addAttribute("normal",m);this.addAttribute("uv",l);this.boundingSphere=new THREE.Sphere(new THREE.Vector3,a)};THREE.SphereBufferGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);THREE.SphereBufferGeometry.prototype.constructor=THREE.SphereBufferGeometry;
	THREE.SphereBufferGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.SphereBufferGeometry(a.radius,a.widthSegments,a.heightSegments,a.phiStart,a.phiLength,a.thetaStart,a.thetaLength)};
	THREE.TorusGeometry=function(a,b,c,d,e){THREE.Geometry.call(this);this.type="TorusGeometry";this.parameters={radius:a,tube:b,radialSegments:c,tubularSegments:d,arc:e};a=a||100;b=b||40;c=c||8;d=d||6;e=e||2*Math.PI;for(var g=new THREE.Vector3,f=[],h=[],l=0;l<=c;l++)for(var k=0;k<=d;k++){var m=k/d*e,p=l/c*Math.PI*2;g.x=a*Math.cos(m);g.y=a*Math.sin(m);var n=new THREE.Vector3;n.x=(a+b*Math.cos(p))*Math.cos(m);n.y=(a+b*Math.cos(p))*Math.sin(m);n.z=b*Math.sin(p);this.vertices.push(n);f.push(new THREE.Vector2(k/
	d,l/c));h.push(n.clone().sub(g).normalize())}for(l=1;l<=c;l++)for(k=1;k<=d;k++)a=(d+1)*l+k-1,b=(d+1)*(l-1)+k-1,e=(d+1)*(l-1)+k,g=(d+1)*l+k,m=new THREE.Face3(a,b,g,[h[a].clone(),h[b].clone(),h[g].clone()]),this.faces.push(m),this.faceVertexUvs[0].push([f[a].clone(),f[b].clone(),f[g].clone()]),m=new THREE.Face3(b,e,g,[h[b].clone(),h[e].clone(),h[g].clone()]),this.faces.push(m),this.faceVertexUvs[0].push([f[b].clone(),f[e].clone(),f[g].clone()]);this.computeFaceNormals()};
	THREE.TorusGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.TorusGeometry.prototype.constructor=THREE.TorusGeometry;THREE.TorusGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.TorusGeometry(a.radius,a.tube,a.radialSegments,a.tubularSegments,a.arc)};
	THREE.TorusKnotGeometry=function(a,b,c,d,e,g,f){function h(a,b,c,d,e){var f=Math.cos(a),g=Math.sin(a);a*=b/c;b=Math.cos(a);f*=d*(2+b)*.5;g=d*(2+b)*g*.5;d=e*d*Math.sin(a)*.5;return new THREE.Vector3(f,g,d)}THREE.Geometry.call(this);this.type="TorusKnotGeometry";this.parameters={radius:a,tube:b,radialSegments:c,tubularSegments:d,p:e,q:g,heightScale:f};a=a||100;b=b||40;c=c||64;d=d||8;e=e||2;g=g||3;f=f||1;for(var l=Array(c),k=new THREE.Vector3,m=new THREE.Vector3,p=new THREE.Vector3,n=0;n<c;++n){l[n]=
	Array(d);var q=n/c*2*e*Math.PI,s=h(q,g,e,a,f),q=h(q+.01,g,e,a,f);k.subVectors(q,s);m.addVectors(q,s);p.crossVectors(k,m);m.crossVectors(p,k);p.normalize();m.normalize();for(q=0;q<d;++q){var t=q/d*2*Math.PI,v=-b*Math.cos(t),t=b*Math.sin(t),u=new THREE.Vector3;u.x=s.x+v*m.x+t*p.x;u.y=s.y+v*m.y+t*p.y;u.z=s.z+v*m.z+t*p.z;l[n][q]=this.vertices.push(u)-1}}for(n=0;n<c;++n)for(q=0;q<d;++q)e=(n+1)%c,g=(q+1)%d,a=l[n][q],b=l[e][q],e=l[e][g],g=l[n][g],f=new THREE.Vector2(n/c,q/d),k=new THREE.Vector2((n+1)/c,
	q/d),m=new THREE.Vector2((n+1)/c,(q+1)/d),p=new THREE.Vector2(n/c,(q+1)/d),this.faces.push(new THREE.Face3(a,b,g)),this.faceVertexUvs[0].push([f,k,p]),this.faces.push(new THREE.Face3(b,e,g)),this.faceVertexUvs[0].push([k.clone(),m,p.clone()]);this.computeFaceNormals();this.computeVertexNormals()};THREE.TorusKnotGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.TorusKnotGeometry.prototype.constructor=THREE.TorusKnotGeometry;
	THREE.TorusKnotGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.TorusKnotGeometry(a.radius,a.tube,a.radialSegments,a.tubularSegments,a.p,a.q,a.heightScale)};
	THREE.TubeGeometry=function(a,b,c,d,e,g){THREE.Geometry.call(this);this.type="TubeGeometry";this.parameters={path:a,segments:b,radius:c,radialSegments:d,closed:e,taper:g};b=b||64;c=c||1;d=d||8;e=e||!1;g=g||THREE.TubeGeometry.NoTaper;var f=[],h,l,k=b+1,m,p,n,q,s,t=new THREE.Vector3,v,u,w;v=new THREE.TubeGeometry.FrenetFrames(a,b,e);u=v.normals;w=v.binormals;this.tangents=v.tangents;this.normals=u;this.binormals=w;for(v=0;v<k;v++)for(f[v]=[],m=v/(k-1),s=a.getPointAt(m),h=u[v],l=w[v],n=c*g(m),m=0;m<
	d;m++)p=m/d*2*Math.PI,q=-n*Math.cos(p),p=n*Math.sin(p),t.copy(s),t.x+=q*h.x+p*l.x,t.y+=q*h.y+p*l.y,t.z+=q*h.z+p*l.z,f[v][m]=this.vertices.push(new THREE.Vector3(t.x,t.y,t.z))-1;for(v=0;v<b;v++)for(m=0;m<d;m++)g=e?(v+1)%b:v+1,k=(m+1)%d,a=f[v][m],c=f[g][m],g=f[g][k],k=f[v][k],t=new THREE.Vector2(v/b,m/d),u=new THREE.Vector2((v+1)/b,m/d),w=new THREE.Vector2((v+1)/b,(m+1)/d),h=new THREE.Vector2(v/b,(m+1)/d),this.faces.push(new THREE.Face3(a,c,k)),this.faceVertexUvs[0].push([t,u,h]),this.faces.push(new THREE.Face3(c,
	g,k)),this.faceVertexUvs[0].push([u.clone(),w,h.clone()]);this.computeFaceNormals();this.computeVertexNormals()};THREE.TubeGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.TubeGeometry.prototype.constructor=THREE.TubeGeometry;THREE.TubeGeometry.prototype.clone=function(){return new this.constructor(this.parameters.path,this.parameters.segments,this.parameters.radius,this.parameters.radialSegments,this.parameters.closed,this.parameters.taper)};THREE.TubeGeometry.NoTaper=function(a){return 1};
	THREE.TubeGeometry.SinusoidalTaper=function(a){return Math.sin(Math.PI*a)};
	THREE.TubeGeometry.FrenetFrames=function(a,b,c){var d=new THREE.Vector3,e=[],g=[],f=[],h=new THREE.Vector3,l=new THREE.Matrix4;b+=1;var k,m,p;this.tangents=e;this.normals=g;this.binormals=f;for(k=0;k<b;k++)m=k/(b-1),e[k]=a.getTangentAt(m),e[k].normalize();g[0]=new THREE.Vector3;f[0]=new THREE.Vector3;a=Number.MAX_VALUE;k=Math.abs(e[0].x);m=Math.abs(e[0].y);p=Math.abs(e[0].z);k<=a&&(a=k,d.set(1,0,0));m<=a&&(a=m,d.set(0,1,0));p<=a&&d.set(0,0,1);h.crossVectors(e[0],d).normalize();g[0].crossVectors(e[0],
	h);f[0].crossVectors(e[0],g[0]);for(k=1;k<b;k++)g[k]=g[k-1].clone(),f[k]=f[k-1].clone(),h.crossVectors(e[k-1],e[k]),h.length()>Number.EPSILON&&(h.normalize(),d=Math.acos(THREE.Math.clamp(e[k-1].dot(e[k]),-1,1)),g[k].applyMatrix4(l.makeRotationAxis(h,d))),f[k].crossVectors(e[k],g[k]);if(c)for(d=Math.acos(THREE.Math.clamp(g[0].dot(g[b-1]),-1,1)),d/=b-1,0<e[0].dot(h.crossVectors(g[0],g[b-1]))&&(d=-d),k=1;k<b;k++)g[k].applyMatrix4(l.makeRotationAxis(e[k],d*k)),f[k].crossVectors(e[k],g[k])};
	THREE.PolyhedronGeometry=function(a,b,c,d){function e(a){var b=a.normalize().clone();b.index=l.vertices.push(b)-1;var c=Math.atan2(a.z,-a.x)/2/Math.PI+.5;a=Math.atan2(-a.y,Math.sqrt(a.x*a.x+a.z*a.z))/Math.PI+.5;b.uv=new THREE.Vector2(c,1-a);return b}function g(a,b,c,d){d=new THREE.Face3(a.index,b.index,c.index,[a.clone(),b.clone(),c.clone()],void 0,d);l.faces.push(d);v.copy(a).add(b).add(c).divideScalar(3);d=Math.atan2(v.z,-v.x);l.faceVertexUvs[0].push([h(a.uv,a,d),h(b.uv,b,d),h(c.uv,c,d)])}function f(a,
	b){for(var c=Math.pow(2,b),d=e(l.vertices[a.a]),f=e(l.vertices[a.b]),h=e(l.vertices[a.c]),k=[],n=a.materialIndex,m=0;m<=c;m++){k[m]=[];for(var p=e(d.clone().lerp(h,m/c)),q=e(f.clone().lerp(h,m/c)),s=c-m,t=0;t<=s;t++)k[m][t]=0===t&&m===c?p:e(p.clone().lerp(q,t/s))}for(m=0;m<c;m++)for(t=0;t<2*(c-m)-1;t++)d=Math.floor(t/2),0===t%2?g(k[m][d+1],k[m+1][d],k[m][d],n):g(k[m][d+1],k[m+1][d+1],k[m+1][d],n)}function h(a,b,c){0>c&&1===a.x&&(a=new THREE.Vector2(a.x-1,a.y));0===b.x&&0===b.z&&(a=new THREE.Vector2(c/
	2/Math.PI+.5,a.y));return a.clone()}THREE.Geometry.call(this);this.type="PolyhedronGeometry";this.parameters={vertices:a,indices:b,radius:c,detail:d};c=c||1;d=d||0;for(var l=this,k=0,m=a.length;k<m;k+=3)e(new THREE.Vector3(a[k],a[k+1],a[k+2]));a=this.vertices;for(var p=[],n=k=0,m=b.length;k<m;k+=3,n++){var q=a[b[k]],s=a[b[k+1]],t=a[b[k+2]];p[n]=new THREE.Face3(q.index,s.index,t.index,[q.clone(),s.clone(),t.clone()],void 0,n)}for(var v=new THREE.Vector3,k=0,m=p.length;k<m;k++)f(p[k],d);k=0;for(m=this.faceVertexUvs[0].length;k<
	m;k++)b=this.faceVertexUvs[0][k],d=b[0].x,a=b[1].x,p=b[2].x,n=Math.max(d,a,p),q=Math.min(d,a,p),.9<n&&.1>q&&(.2>d&&(b[0].x+=1),.2>a&&(b[1].x+=1),.2>p&&(b[2].x+=1));k=0;for(m=this.vertices.length;k<m;k++)this.vertices[k].multiplyScalar(c);this.mergeVertices();this.computeFaceNormals();this.boundingSphere=new THREE.Sphere(new THREE.Vector3,c)};THREE.PolyhedronGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.PolyhedronGeometry.prototype.constructor=THREE.PolyhedronGeometry;
	THREE.PolyhedronGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.PolyhedronGeometry(a.vertices,a.indices,a.radius,a.detail)};
	THREE.DodecahedronGeometry=function(a,b){var c=(1+Math.sqrt(5))/2,d=1/c;THREE.PolyhedronGeometry.call(this,[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-d,-c,0,-d,c,0,d,-c,0,d,c,-d,-c,0,-d,c,0,d,-c,0,d,c,0,-c,0,-d,c,0,-d,-c,0,d,c,0,d],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,
	12,14,1,14,5,1,5,9],a,b);this.type="DodecahedronGeometry";this.parameters={radius:a,detail:b}};THREE.DodecahedronGeometry.prototype=Object.create(THREE.PolyhedronGeometry.prototype);THREE.DodecahedronGeometry.prototype.constructor=THREE.DodecahedronGeometry;THREE.DodecahedronGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.DodecahedronGeometry(a.radius,a.detail)};
	THREE.IcosahedronGeometry=function(a,b){var c=(1+Math.sqrt(5))/2;THREE.PolyhedronGeometry.call(this,[-1,c,0,1,c,0,-1,-c,0,1,-c,0,0,-1,c,0,1,c,0,-1,-c,0,1,-c,c,0,-1,c,0,1,-c,0,-1,-c,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],a,b);this.type="IcosahedronGeometry";this.parameters={radius:a,detail:b}};THREE.IcosahedronGeometry.prototype=Object.create(THREE.PolyhedronGeometry.prototype);
	THREE.IcosahedronGeometry.prototype.constructor=THREE.IcosahedronGeometry;THREE.IcosahedronGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.IcosahedronGeometry(a.radius,a.detail)};THREE.OctahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],a,b);this.type="OctahedronGeometry";this.parameters={radius:a,detail:b}};THREE.OctahedronGeometry.prototype=Object.create(THREE.PolyhedronGeometry.prototype);
	THREE.OctahedronGeometry.prototype.constructor=THREE.OctahedronGeometry;THREE.OctahedronGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.OctahedronGeometry(a.radius,a.detail)};THREE.TetrahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],a,b);this.type="TetrahedronGeometry";this.parameters={radius:a,detail:b}};THREE.TetrahedronGeometry.prototype=Object.create(THREE.PolyhedronGeometry.prototype);
	THREE.TetrahedronGeometry.prototype.constructor=THREE.TetrahedronGeometry;THREE.TetrahedronGeometry.prototype.clone=function(){var a=this.parameters;return new THREE.TetrahedronGeometry(a.radius,a.detail)};
	THREE.ParametricGeometry=function(a,b,c){THREE.Geometry.call(this);this.type="ParametricGeometry";this.parameters={func:a,slices:b,stacks:c};var d=this.vertices,e=this.faces,g=this.faceVertexUvs[0],f,h,l,k,m=b+1;for(f=0;f<=c;f++)for(k=f/c,h=0;h<=b;h++)l=h/b,l=a(l,k),d.push(l);var p,n,q,s;for(f=0;f<c;f++)for(h=0;h<b;h++)a=f*m+h,d=f*m+h+1,k=(f+1)*m+h+1,l=(f+1)*m+h,p=new THREE.Vector2(h/b,f/c),n=new THREE.Vector2((h+1)/b,f/c),q=new THREE.Vector2((h+1)/b,(f+1)/c),s=new THREE.Vector2(h/b,(f+1)/c),e.push(new THREE.Face3(a,
	d,l)),g.push([p,n,s]),e.push(new THREE.Face3(d,k,l)),g.push([n.clone(),q,s.clone()]);this.computeFaceNormals();this.computeVertexNormals()};THREE.ParametricGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ParametricGeometry.prototype.constructor=THREE.ParametricGeometry;
	THREE.WireframeGeometry=function(a){function b(a,b){return a-b}THREE.BufferGeometry.call(this);var c=[0,0],d={},e=["a","b","c"];if(a instanceof THREE.Geometry){var g=a.vertices,f=a.faces,h=0,l=new Uint32Array(6*f.length);a=0;for(var k=f.length;a<k;a++)for(var m=f[a],p=0;3>p;p++){c[0]=m[e[p]];c[1]=m[e[(p+1)%3]];c.sort(b);var n=c.toString();void 0===d[n]&&(l[2*h]=c[0],l[2*h+1]=c[1],d[n]=!0,h++)}c=new Float32Array(6*h);a=0;for(k=h;a<k;a++)for(p=0;2>p;p++)d=g[l[2*a+p]],h=6*a+3*p,c[h+0]=d.x,c[h+1]=d.y,
	c[h+2]=d.z;this.addAttribute("position",new THREE.BufferAttribute(c,3))}else if(a instanceof THREE.BufferGeometry){if(null!==a.index){k=a.index.array;g=a.attributes.position;e=a.drawcalls;h=0;0===e.length&&a.addGroup(0,k.length);l=new Uint32Array(2*k.length);f=0;for(m=e.length;f<m;++f){a=e[f];p=a.start;n=a.count;a=p;for(var q=p+n;a<q;a+=3)for(p=0;3>p;p++)c[0]=k[a+p],c[1]=k[a+(p+1)%3],c.sort(b),n=c.toString(),void 0===d[n]&&(l[2*h]=c[0],l[2*h+1]=c[1],d[n]=!0,h++)}c=new Float32Array(6*h);a=0;for(k=
	h;a<k;a++)for(p=0;2>p;p++)h=6*a+3*p,d=l[2*a+p],c[h+0]=g.getX(d),c[h+1]=g.getY(d),c[h+2]=g.getZ(d)}else for(g=a.attributes.position.array,h=g.length/3,l=h/3,c=new Float32Array(6*h),a=0,k=l;a<k;a++)for(p=0;3>p;p++)h=18*a+6*p,l=9*a+3*p,c[h+0]=g[l],c[h+1]=g[l+1],c[h+2]=g[l+2],d=9*a+(p+1)%3*3,c[h+3]=g[d],c[h+4]=g[d+1],c[h+5]=g[d+2];this.addAttribute("position",new THREE.BufferAttribute(c,3))}};THREE.WireframeGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);
	THREE.WireframeGeometry.prototype.constructor=THREE.WireframeGeometry;THREE.AxisHelper=function(a){a=a||1;var b=new Float32Array([0,0,0,a,0,0,0,0,0,0,a,0,0,0,0,0,0,a]),c=new Float32Array([1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1]);a=new THREE.BufferGeometry;a.addAttribute("position",new THREE.BufferAttribute(b,3));a.addAttribute("color",new THREE.BufferAttribute(c,3));b=new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors});THREE.LineSegments.call(this,a,b)};THREE.AxisHelper.prototype=Object.create(THREE.LineSegments.prototype);
	THREE.AxisHelper.prototype.constructor=THREE.AxisHelper;
	THREE.ArrowHelper=function(){var a=new THREE.Geometry;a.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));var b=new THREE.CylinderGeometry(0,.5,1,5,1);b.translate(0,-.5,0);return function(c,d,e,g,f,h){THREE.Object3D.call(this);void 0===g&&(g=16776960);void 0===e&&(e=1);void 0===f&&(f=.2*e);void 0===h&&(h=.2*f);this.position.copy(d);f<e&&(this.line=new THREE.Line(a,new THREE.LineBasicMaterial({color:g})),this.line.matrixAutoUpdate=!1,this.add(this.line));this.cone=new THREE.Mesh(b,new THREE.MeshBasicMaterial({color:g}));
	this.cone.matrixAutoUpdate=!1;this.add(this.cone);this.setDirection(c);this.setLength(e,f,h)}}();THREE.ArrowHelper.prototype=Object.create(THREE.Object3D.prototype);THREE.ArrowHelper.prototype.constructor=THREE.ArrowHelper;THREE.ArrowHelper.prototype.setDirection=function(){var a=new THREE.Vector3,b;return function(c){.99999<c.y?this.quaternion.set(0,0,0,1):-.99999>c.y?this.quaternion.set(1,0,0,0):(a.set(c.z,0,-c.x).normalize(),b=Math.acos(c.y),this.quaternion.setFromAxisAngle(a,b))}}();
	THREE.ArrowHelper.prototype.setLength=function(a,b,c){void 0===b&&(b=.2*a);void 0===c&&(c=.2*b);b<a&&(this.line.scale.set(1,a-b,1),this.line.updateMatrix());this.cone.scale.set(c,b,c);this.cone.position.y=a;this.cone.updateMatrix()};THREE.ArrowHelper.prototype.setColor=function(a){void 0!==this.line&&this.line.material.color.set(a);this.cone.material.color.set(a)};
	THREE.BoxHelper=function(a){var b=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),c=new Float32Array(24),d=new THREE.BufferGeometry;d.setIndex(new THREE.BufferAttribute(b,1));d.addAttribute("position",new THREE.BufferAttribute(c,3));THREE.LineSegments.call(this,d,new THREE.LineBasicMaterial({color:16776960}));void 0!==a&&this.update(a)};THREE.BoxHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.BoxHelper.prototype.constructor=THREE.BoxHelper;
	THREE.BoxHelper.prototype.update=function(){var a=new THREE.Box3;return function(b){a.setFromObject(b);if(!a.empty()){b=a.min;var c=a.max,d=this.geometry.attributes.position,e=d.array;e[0]=c.x;e[1]=c.y;e[2]=c.z;e[3]=b.x;e[4]=c.y;e[5]=c.z;e[6]=b.x;e[7]=b.y;e[8]=c.z;e[9]=c.x;e[10]=b.y;e[11]=c.z;e[12]=c.x;e[13]=c.y;e[14]=b.z;e[15]=b.x;e[16]=c.y;e[17]=b.z;e[18]=b.x;e[19]=b.y;e[20]=b.z;e[21]=c.x;e[22]=b.y;e[23]=b.z;d.needsUpdate=!0;this.geometry.computeBoundingSphere()}}}();
	THREE.BoundingBoxHelper=function(a,b){var c=void 0!==b?b:8947848;this.object=a;this.box=new THREE.Box3;THREE.Mesh.call(this,new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:c,wireframe:!0}))};THREE.BoundingBoxHelper.prototype=Object.create(THREE.Mesh.prototype);THREE.BoundingBoxHelper.prototype.constructor=THREE.BoundingBoxHelper;THREE.BoundingBoxHelper.prototype.update=function(){this.box.setFromObject(this.object);this.box.size(this.scale);this.box.center(this.position)};
	THREE.CameraHelper=function(a){function b(a,b,d){c(a,d);c(b,d)}function c(a,b){d.vertices.push(new THREE.Vector3);d.colors.push(new THREE.Color(b));void 0===g[a]&&(g[a]=[]);g[a].push(d.vertices.length-1)}var d=new THREE.Geometry,e=new THREE.LineBasicMaterial({color:16777215,vertexColors:THREE.FaceColors}),g={};b("n1","n2",16755200);b("n2","n4",16755200);b("n4","n3",16755200);b("n3","n1",16755200);b("f1","f2",16755200);b("f2","f4",16755200);b("f4","f3",16755200);b("f3","f1",16755200);b("n1","f1",16755200);
	b("n2","f2",16755200);b("n3","f3",16755200);b("n4","f4",16755200);b("p","n1",16711680);b("p","n2",16711680);b("p","n3",16711680);b("p","n4",16711680);b("u1","u2",43775);b("u2","u3",43775);b("u3","u1",43775);b("c","t",16777215);b("p","c",3355443);b("cn1","cn2",3355443);b("cn3","cn4",3355443);b("cf1","cf2",3355443);b("cf3","cf4",3355443);THREE.LineSegments.call(this,d,e);this.camera=a;this.camera.updateProjectionMatrix();this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1;this.pointMap=g;this.update()};
	THREE.CameraHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.CameraHelper.prototype.constructor=THREE.CameraHelper;
	THREE.CameraHelper.prototype.update=function(){function a(a,f,h,l){d.set(f,h,l).unproject(e);a=c[a];if(void 0!==a)for(f=0,h=a.length;f<h;f++)b.vertices[a[f]].copy(d)}var b,c,d=new THREE.Vector3,e=new THREE.Camera;return function(){b=this.geometry;c=this.pointMap;e.projectionMatrix.copy(this.camera.projectionMatrix);a("c",0,0,-1);a("t",0,0,1);a("n1",-1,-1,-1);a("n2",1,-1,-1);a("n3",-1,1,-1);a("n4",1,1,-1);a("f1",-1,-1,1);a("f2",1,-1,1);a("f3",-1,1,1);a("f4",1,1,1);a("u1",.7,1.1,-1);a("u2",-.7,1.1,
	-1);a("u3",0,2,-1);a("cf1",-1,0,1);a("cf2",1,0,1);a("cf3",0,-1,1);a("cf4",0,1,1);a("cn1",-1,0,-1);a("cn2",1,0,-1);a("cn3",0,-1,-1);a("cn4",0,1,-1);b.verticesNeedUpdate=!0}}();
	THREE.DirectionalLightHelper=function(a,b){THREE.Object3D.call(this);this.light=a;this.light.updateMatrixWorld();this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1;b=b||1;var c=new THREE.Geometry;c.vertices.push(new THREE.Vector3(-b,b,0),new THREE.Vector3(b,b,0),new THREE.Vector3(b,-b,0),new THREE.Vector3(-b,-b,0),new THREE.Vector3(-b,b,0));var d=new THREE.LineBasicMaterial({fog:!1});d.color.copy(this.light.color).multiplyScalar(this.light.intensity);this.lightPlane=new THREE.Line(c,d);this.add(this.lightPlane);
	c=new THREE.Geometry;c.vertices.push(new THREE.Vector3,new THREE.Vector3);d=new THREE.LineBasicMaterial({fog:!1});d.color.copy(this.light.color).multiplyScalar(this.light.intensity);this.targetLine=new THREE.Line(c,d);this.add(this.targetLine);this.update()};THREE.DirectionalLightHelper.prototype=Object.create(THREE.Object3D.prototype);THREE.DirectionalLightHelper.prototype.constructor=THREE.DirectionalLightHelper;
	THREE.DirectionalLightHelper.prototype.dispose=function(){this.lightPlane.geometry.dispose();this.lightPlane.material.dispose();this.targetLine.geometry.dispose();this.targetLine.material.dispose()};
	THREE.DirectionalLightHelper.prototype.update=function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Vector3;return function(){a.setFromMatrixPosition(this.light.matrixWorld);b.setFromMatrixPosition(this.light.target.matrixWorld);c.subVectors(b,a);this.lightPlane.lookAt(c);this.lightPlane.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);this.targetLine.geometry.vertices[1].copy(c);this.targetLine.geometry.verticesNeedUpdate=!0;this.targetLine.material.color.copy(this.lightPlane.material.color)}}();
	THREE.EdgesHelper=function(a,b,c){b=void 0!==b?b:16777215;THREE.LineSegments.call(this,new THREE.EdgesGeometry(a.geometry,c),new THREE.LineBasicMaterial({color:b}));this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1};THREE.EdgesHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.EdgesHelper.prototype.constructor=THREE.EdgesHelper;
	THREE.FaceNormalsHelper=function(a,b,c,d){this.object=a;this.size=void 0!==b?b:1;a=void 0!==c?c:16776960;d=void 0!==d?d:1;b=0;c=this.object.geometry;c instanceof THREE.Geometry?b=c.faces.length:console.warn("THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.");c=new THREE.BufferGeometry;b=new THREE.Float32Attribute(6*b,3);c.addAttribute("position",b);THREE.LineSegments.call(this,c,new THREE.LineBasicMaterial({color:a,linewidth:d}));this.matrixAutoUpdate=
	!1;this.update()};THREE.FaceNormalsHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.FaceNormalsHelper.prototype.constructor=THREE.FaceNormalsHelper;
	THREE.FaceNormalsHelper.prototype.update=function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Matrix3;return function(){this.object.updateMatrixWorld(!0);c.getNormalMatrix(this.object.matrixWorld);for(var d=this.object.matrixWorld,e=this.geometry.attributes.position,g=this.object.geometry,f=g.vertices,g=g.faces,h=0,l=0,k=g.length;l<k;l++){var m=g[l],p=m.normal;a.copy(f[m.a]).add(f[m.b]).add(f[m.c]).divideScalar(3).applyMatrix4(d);b.copy(p).applyMatrix3(c).normalize().multiplyScalar(this.size).add(a);
	e.setXYZ(h,a.x,a.y,a.z);h+=1;e.setXYZ(h,b.x,b.y,b.z);h+=1}e.needsUpdate=!0;return this}}();
	THREE.GridHelper=function(a,b){var c=new THREE.Geometry,d=new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors});this.color1=new THREE.Color(4473924);this.color2=new THREE.Color(8947848);for(var e=-a;e<=a;e+=b){c.vertices.push(new THREE.Vector3(-a,0,e),new THREE.Vector3(a,0,e),new THREE.Vector3(e,0,-a),new THREE.Vector3(e,0,a));var g=0===e?this.color1:this.color2;c.colors.push(g,g,g,g)}THREE.LineSegments.call(this,c,d)};THREE.GridHelper.prototype=Object.create(THREE.LineSegments.prototype);
	THREE.GridHelper.prototype.constructor=THREE.GridHelper;THREE.GridHelper.prototype.setColors=function(a,b){this.color1.set(a);this.color2.set(b);this.geometry.colorsNeedUpdate=!0};
	THREE.HemisphereLightHelper=function(a,b){THREE.Object3D.call(this);this.light=a;this.light.updateMatrixWorld();this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1;this.colors=[new THREE.Color,new THREE.Color];var c=new THREE.SphereGeometry(b,4,2);c.rotateX(-Math.PI/2);for(var d=0;8>d;d++)c.faces[d].color=this.colors[4>d?0:1];d=new THREE.MeshBasicMaterial({vertexColors:THREE.FaceColors,wireframe:!0});this.lightSphere=new THREE.Mesh(c,d);this.add(this.lightSphere);this.update()};
	THREE.HemisphereLightHelper.prototype=Object.create(THREE.Object3D.prototype);THREE.HemisphereLightHelper.prototype.constructor=THREE.HemisphereLightHelper;THREE.HemisphereLightHelper.prototype.dispose=function(){this.lightSphere.geometry.dispose();this.lightSphere.material.dispose()};
	THREE.HemisphereLightHelper.prototype.update=function(){var a=new THREE.Vector3;return function(){this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity);this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity);this.lightSphere.lookAt(a.setFromMatrixPosition(this.light.matrixWorld).negate());this.lightSphere.geometry.colorsNeedUpdate=!0}}();
	THREE.PointLightHelper=function(a,b){this.light=a;this.light.updateMatrixWorld();var c=new THREE.SphereGeometry(b,4,2),d=new THREE.MeshBasicMaterial({wireframe:!0,fog:!1});d.color.copy(this.light.color).multiplyScalar(this.light.intensity);THREE.Mesh.call(this,c,d);this.matrix=this.light.matrixWorld;this.matrixAutoUpdate=!1};THREE.PointLightHelper.prototype=Object.create(THREE.Mesh.prototype);THREE.PointLightHelper.prototype.constructor=THREE.PointLightHelper;
	THREE.PointLightHelper.prototype.dispose=function(){this.geometry.dispose();this.material.dispose()};THREE.PointLightHelper.prototype.update=function(){this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)};
	THREE.SkeletonHelper=function(a){this.bones=this.getBoneList(a);for(var b=new THREE.Geometry,c=0;c<this.bones.length;c++)this.bones[c].parent instanceof THREE.Bone&&(b.vertices.push(new THREE.Vector3),b.vertices.push(new THREE.Vector3),b.colors.push(new THREE.Color(0,0,1)),b.colors.push(new THREE.Color(0,1,0)));b.dynamic=!0;c=new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors,depthTest:!1,depthWrite:!1,transparent:!0});THREE.LineSegments.call(this,b,c);this.root=a;this.matrix=a.matrixWorld;
	this.matrixAutoUpdate=!1;this.update()};THREE.SkeletonHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.SkeletonHelper.prototype.constructor=THREE.SkeletonHelper;THREE.SkeletonHelper.prototype.getBoneList=function(a){var b=[];a instanceof THREE.Bone&&b.push(a);for(var c=0;c<a.children.length;c++)b.push.apply(b,this.getBoneList(a.children[c]));return b};
	THREE.SkeletonHelper.prototype.update=function(){for(var a=this.geometry,b=(new THREE.Matrix4).getInverse(this.root.matrixWorld),c=new THREE.Matrix4,d=0,e=0;e<this.bones.length;e++){var g=this.bones[e];g.parent instanceof THREE.Bone&&(c.multiplyMatrices(b,g.matrixWorld),a.vertices[d].setFromMatrixPosition(c),c.multiplyMatrices(b,g.parent.matrixWorld),a.vertices[d+1].setFromMatrixPosition(c),d+=2)}a.verticesNeedUpdate=!0;a.computeBoundingSphere()};
	THREE.SpotLightHelper=function(a){THREE.Object3D.call(this);this.light=a;this.light.updateMatrixWorld();this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1;a=new THREE.CylinderGeometry(0,1,1,8,1,!0);a.translate(0,-.5,0);a.rotateX(-Math.PI/2);var b=new THREE.MeshBasicMaterial({wireframe:!0,fog:!1});this.cone=new THREE.Mesh(a,b);this.add(this.cone);this.update()};THREE.SpotLightHelper.prototype=Object.create(THREE.Object3D.prototype);THREE.SpotLightHelper.prototype.constructor=THREE.SpotLightHelper;
	THREE.SpotLightHelper.prototype.dispose=function(){this.cone.geometry.dispose();this.cone.material.dispose()};THREE.SpotLightHelper.prototype.update=function(){var a=new THREE.Vector3,b=new THREE.Vector3;return function(){var c=this.light.distance?this.light.distance:1E4,d=c*Math.tan(this.light.angle);this.cone.scale.set(d,d,c);a.setFromMatrixPosition(this.light.matrixWorld);b.setFromMatrixPosition(this.light.target.matrixWorld);this.cone.lookAt(b.sub(a));this.cone.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)}}();
	THREE.VertexNormalsHelper=function(a,b,c,d){this.object=a;this.size=void 0!==b?b:1;a=void 0!==c?c:16711680;d=void 0!==d?d:1;b=0;c=this.object.geometry;c instanceof THREE.Geometry?b=3*c.faces.length:c instanceof THREE.BufferGeometry&&(b=c.attributes.normal.count);c=new THREE.BufferGeometry;b=new THREE.Float32Attribute(6*b,3);c.addAttribute("position",b);THREE.LineSegments.call(this,c,new THREE.LineBasicMaterial({color:a,linewidth:d}));this.matrixAutoUpdate=!1;this.update()};
	THREE.VertexNormalsHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.VertexNormalsHelper.prototype.constructor=THREE.VertexNormalsHelper;
	THREE.VertexNormalsHelper.prototype.update=function(){var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Matrix3;return function(){var d=["a","b","c"];this.object.updateMatrixWorld(!0);c.getNormalMatrix(this.object.matrixWorld);var e=this.object.matrixWorld,g=this.geometry.attributes.position,f=this.object.geometry;if(f instanceof THREE.Geometry)for(var h=f.vertices,l=f.faces,k=f=0,m=l.length;k<m;k++)for(var p=l[k],n=0,q=p.vertexNormals.length;n<q;n++){var s=p.vertexNormals[n];a.copy(h[p[d[n]]]).applyMatrix4(e);
	b.copy(s).applyMatrix3(c).normalize().multiplyScalar(this.size).add(a);g.setXYZ(f,a.x,a.y,a.z);f+=1;g.setXYZ(f,b.x,b.y,b.z);f+=1}else if(f instanceof THREE.BufferGeometry)for(d=f.attributes.position,h=f.attributes.normal,n=f=0,q=d.count;n<q;n++)a.set(d.getX(n),d.getY(n),d.getZ(n)).applyMatrix4(e),b.set(h.getX(n),h.getY(n),h.getZ(n)),b.applyMatrix3(c).normalize().multiplyScalar(this.size).add(a),g.setXYZ(f,a.x,a.y,a.z),f+=1,g.setXYZ(f,b.x,b.y,b.z),f+=1;g.needsUpdate=!0;return this}}();
	THREE.WireframeHelper=function(a,b){var c=void 0!==b?b:16777215;THREE.LineSegments.call(this,new THREE.WireframeGeometry(a.geometry),new THREE.LineBasicMaterial({color:c}));this.matrix=a.matrixWorld;this.matrixAutoUpdate=!1};THREE.WireframeHelper.prototype=Object.create(THREE.LineSegments.prototype);THREE.WireframeHelper.prototype.constructor=THREE.WireframeHelper;THREE.ImmediateRenderObject=function(a){THREE.Object3D.call(this);this.material=a;this.render=function(a){}};
	THREE.ImmediateRenderObject.prototype=Object.create(THREE.Object3D.prototype);THREE.ImmediateRenderObject.prototype.constructor=THREE.ImmediateRenderObject;THREE.MorphBlendMesh=function(a,b){THREE.Mesh.call(this,a,b);this.animationsMap={};this.animationsList=[];var c=this.geometry.morphTargets.length;this.createAnimation("__default",0,c-1,c/1);this.setAnimationWeight("__default",1)};THREE.MorphBlendMesh.prototype=Object.create(THREE.Mesh.prototype);THREE.MorphBlendMesh.prototype.constructor=THREE.MorphBlendMesh;
	THREE.MorphBlendMesh.prototype.createAnimation=function(a,b,c,d){b={start:b,end:c,length:c-b+1,fps:d,duration:(c-b)/d,lastFrame:0,currentFrame:0,active:!1,time:0,direction:1,weight:1,directionBackwards:!1,mirroredLoop:!1};this.animationsMap[a]=b;this.animationsList.push(b)};
	THREE.MorphBlendMesh.prototype.autoCreateAnimations=function(a){for(var b=/([a-z]+)_?(\d+)/,c,d={},e=this.geometry,g=0,f=e.morphTargets.length;g<f;g++){var h=e.morphTargets[g].name.match(b);if(h&&1<h.length){var l=h[1];d[l]||(d[l]={start:Infinity,end:-Infinity});h=d[l];g<h.start&&(h.start=g);g>h.end&&(h.end=g);c||(c=l)}}for(l in d)h=d[l],this.createAnimation(l,h.start,h.end,a);this.firstAnimation=c};
	THREE.MorphBlendMesh.prototype.setAnimationDirectionForward=function(a){if(a=this.animationsMap[a])a.direction=1,a.directionBackwards=!1};THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward=function(a){if(a=this.animationsMap[a])a.direction=-1,a.directionBackwards=!0};THREE.MorphBlendMesh.prototype.setAnimationFPS=function(a,b){var c=this.animationsMap[a];c&&(c.fps=b,c.duration=(c.end-c.start)/c.fps)};
	THREE.MorphBlendMesh.prototype.setAnimationDuration=function(a,b){var c=this.animationsMap[a];c&&(c.duration=b,c.fps=(c.end-c.start)/c.duration)};THREE.MorphBlendMesh.prototype.setAnimationWeight=function(a,b){var c=this.animationsMap[a];c&&(c.weight=b)};THREE.MorphBlendMesh.prototype.setAnimationTime=function(a,b){var c=this.animationsMap[a];c&&(c.time=b)};THREE.MorphBlendMesh.prototype.getAnimationTime=function(a){var b=0;if(a=this.animationsMap[a])b=a.time;return b};
	THREE.MorphBlendMesh.prototype.getAnimationDuration=function(a){var b=-1;if(a=this.animationsMap[a])b=a.duration;return b};THREE.MorphBlendMesh.prototype.playAnimation=function(a){var b=this.animationsMap[a];b?(b.time=0,b.active=!0):console.warn("THREE.MorphBlendMesh: animation["+a+"] undefined in .playAnimation()")};THREE.MorphBlendMesh.prototype.stopAnimation=function(a){if(a=this.animationsMap[a])a.active=!1};
	THREE.MorphBlendMesh.prototype.update=function(a){for(var b=0,c=this.animationsList.length;b<c;b++){var d=this.animationsList[b];if(d.active){var e=d.duration/d.length;d.time+=d.direction*a;if(d.mirroredLoop){if(d.time>d.duration||0>d.time)d.direction*=-1,d.time>d.duration&&(d.time=d.duration,d.directionBackwards=!0),0>d.time&&(d.time=0,d.directionBackwards=!1)}else d.time%=d.duration,0>d.time&&(d.time+=d.duration);var g=d.start+THREE.Math.clamp(Math.floor(d.time/e),0,d.length-1),f=d.weight;g!==d.currentFrame&&
	(this.morphTargetInfluences[d.lastFrame]=0,this.morphTargetInfluences[d.currentFrame]=1*f,this.morphTargetInfluences[g]=0,d.lastFrame=d.currentFrame,d.currentFrame=g);e=d.time%e/e;d.directionBackwards&&(e=1-e);d.currentFrame!==d.lastFrame?(this.morphTargetInfluences[d.currentFrame]=e*f,this.morphTargetInfluences[d.lastFrame]=(1-e)*f):this.morphTargetInfluences[d.currentFrame]=f}}};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author Eberhard Graether / http://egraether.com/
	 * @author Mark Lundin   / http://mark-lundin.com
	 */

	var THREE = __webpack_require__(3);

	THREE.TrackballControls = function ( object, domElement ) {

	  var _this = this;
	  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5 };

	  this.object = object;
	  this.domElement = ( domElement !== undefined ) ? domElement : document;

	  // API

	  this.enabled = true;

	  this.screen = { left: 0, top: 0, width: 0, height: 0 };

	  this.rotateSpeed = 1.0;
	  this.zoomSpeed = 1.2;
	  this.panSpeed = 0.3;

	  this.noRotate = false;
	  this.noZoom = false;
	  this.noPan = false;
	  this.noRoll = false;

	  this.staticMoving = false;
	  this.dynamicDampingFactor = 0.2;

	  this.minDistance = 0;
	  this.maxDistance = Infinity;

	  this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	  // internals

	  this.target = new THREE.Vector3();

	  var EPS = 0.000001;

	  var lastPosition = new THREE.Vector3();

	  var _state = STATE.NONE,
	  _prevState = STATE.NONE,

	  _eye = new THREE.Vector3(),

	  _rotateStart = new THREE.Vector3(),
	  _rotateEnd = new THREE.Vector3(),

	  _zoomStart = new THREE.Vector2(),
	  _zoomEnd = new THREE.Vector2(),

	  _touchZoomDistanceStart = 0,
	  _touchZoomDistanceEnd = 0,

	  _panStart = new THREE.Vector2(),
	  _panEnd = new THREE.Vector2();

	  // for reset

	  this.target0 = this.target.clone();
	  this.position0 = this.object.position.clone();
	  this.up0 = this.object.up.clone();

	  // events

	  var changeEvent = { type: 'change' };
	  var startEvent = { type: 'start'};
	  var endEvent = { type: 'end'};


	  // methods

	  this.handleResize = function () {

	    if ( this.domElement === document ) {

	      this.screen.left = 0;
	      this.screen.top = 0;
	      this.screen.width = window.innerWidth;
	      this.screen.height = window.innerHeight;

	    } else {

	      var box = this.domElement.getBoundingClientRect();
	      // adjustments come from similar code in the jquery offset() function
	      var d = this.domElement.ownerDocument.documentElement;
	      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
	      this.screen.top = box.top + window.pageYOffset - d.clientTop;
	      this.screen.width = box.width;
	      this.screen.height = box.height;

	    }

	  };

	  this.handleEvent = function ( event ) {

	    if ( typeof this[ event.type ] == 'function' ) {

	      this[ event.type ]( event );

	    }

	  };

	  this.getMouseOnScreen = function ( pageX, pageY, vector ) {

	    return vector.set(
	      ( pageX - _this.screen.left ) / _this.screen.width,
	      ( pageY - _this.screen.top ) / _this.screen.height
	    );

	  };

	  this.getMouseProjectionOnBall = (function(){

	    var objectUp = new THREE.Vector3(),
	        mouseOnBall = new THREE.Vector3();


	    return function ( pageX, pageY, projection ) {

	      mouseOnBall.set(
	        ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
	        ( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
	        0.0
	      );

	      var length = mouseOnBall.length();

	      if ( _this.noRoll ) {

	        if ( length < Math.SQRT1_2 ) {

	          mouseOnBall.z = Math.sqrt( 1.0 - length*length );

	        } else {

	          mouseOnBall.z = .5 / length;
	          
	        }

	      } else if ( length > 1.0 ) {

	        mouseOnBall.normalize();

	      } else {

	        mouseOnBall.z = Math.sqrt( 1.0 - length * length );

	      }

	      _eye.copy( _this.object.position ).sub( _this.target );

	      projection.copy( _this.object.up ).setLength( mouseOnBall.y )
	      projection.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
	      projection.add( _eye.setLength( mouseOnBall.z ) );

	      return projection;
	    }

	  }());

	  this.rotateCamera = (function(){

	    var axis = new THREE.Vector3(),
	      quaternion = new THREE.Quaternion();


	    return function () {

	      var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

	      if ( angle ) {

	        axis.crossVectors( _rotateStart, _rotateEnd ).normalize();

	        angle *= _this.rotateSpeed;

	        quaternion.setFromAxisAngle( axis, -angle );

	        _eye.applyQuaternion( quaternion );
	        _this.object.up.applyQuaternion( quaternion );

	        _rotateEnd.applyQuaternion( quaternion );

	        if ( _this.staticMoving ) {

	          _rotateStart.copy( _rotateEnd );

	        } else {

	          quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
	          _rotateStart.applyQuaternion( quaternion );

	        }

	      }
	    }

	  }());

	  this.zoomCamera = function () {

	    if ( _state === STATE.TOUCH_ZOOM ) {

	      var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
	      _touchZoomDistanceStart = _touchZoomDistanceEnd;
	      _eye.multiplyScalar( factor );

	    } else {

	      var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

	      if ( factor !== 1.0 && factor > 0.0 ) {

	        _eye.multiplyScalar( factor );

	        if ( _this.staticMoving ) {

	          _zoomStart.copy( _zoomEnd );

	        } else {

	          _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

	        }

	      }

	    }

	  };

	  this.panCamera = (function(){

	    var mouseChange = new THREE.Vector2(),
	      objectUp = new THREE.Vector3(),
	      pan = new THREE.Vector3();

	    return function () {

	      mouseChange.copy( _panEnd ).sub( _panStart );

	      if ( mouseChange.lengthSq() ) {

	        mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

	        pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
	        pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

	        _this.object.position.add( pan );
	        _this.target.add( pan );

	        if ( _this.staticMoving ) {

	          _panStart.copy( _panEnd );

	        } else {

	          _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

	        }

	      }
	    }

	  }());

	  this.checkDistances = function () {

	    if ( !_this.noZoom || !_this.noPan ) {

	      if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

	        _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

	      }

	      if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

	        _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

	      }

	    }

	  };

	  this.update = function () {

	    _eye.subVectors( _this.object.position, _this.target );

	    if ( !_this.noRotate ) {

	      _this.rotateCamera();

	    }

	    if ( !_this.noZoom ) {

	      _this.zoomCamera();

	    }

	    if ( !_this.noPan ) {

	      _this.panCamera();

	    }

	    _this.object.position.addVectors( _this.target, _eye );

	    _this.checkDistances();

	    _this.object.lookAt( _this.target );

	    if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

	      _this.dispatchEvent( changeEvent );

	      lastPosition.copy( _this.object.position );

	    }

	  };

	  this.reset = function () {

	    _state = STATE.NONE;
	    _prevState = STATE.NONE;

	    _this.target.copy( _this.target0 );
	    _this.object.position.copy( _this.position0 );
	    _this.object.up.copy( _this.up0 );

	    _eye.subVectors( _this.object.position, _this.target );

	    _this.object.lookAt( _this.target );

	    _this.dispatchEvent( changeEvent );

	    lastPosition.copy( _this.object.position );

	  };

	  // listeners

	  function keydown( event ) {

	    if ( _this.enabled === false ) return;

	    window.removeEventListener( 'keydown', keydown );

	    _prevState = _state;

	    if ( _state !== STATE.NONE ) {

	      return;

	    } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

	      _state = STATE.ROTATE;

	    } else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

	      _state = STATE.ZOOM;

	    } else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

	      _state = STATE.PAN;

	    }

	  }

	  function keyup( event ) {

	    if ( _this.enabled === false ) return;

	    _state = _prevState;

	    window.addEventListener( 'keydown', keydown, false );

	  }

	  function mousedown( event ) {

	    if ( _this.enabled === false ) return;

	    event.preventDefault();
	    event.stopPropagation();

	    if ( _state === STATE.NONE ) {

	      _state = event.button;

	    }

	    if ( _state === STATE.ROTATE && !_this.noRotate ) {

	      _this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateStart );
	      _rotateEnd.copy(_rotateStart)

	    } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

	      _this.getMouseOnScreen( event.pageX, event.pageY, _zoomStart );
	      _zoomEnd.copy(_zoomStart);

	    } else if ( _state === STATE.PAN && !_this.noPan ) {

	      _this.getMouseOnScreen( event.pageX, event.pageY, _panStart );
	      _panEnd.copy(_panStart)

	    }

	    document.addEventListener( 'mousemove', mousemove, false );
	    document.addEventListener( 'mouseup', mouseup, false );
	    _this.dispatchEvent( startEvent );


	  }

	  function mousemove( event ) {

	    if ( _this.enabled === false ) return;

	    event.preventDefault();
	    event.stopPropagation();

	    if ( _state === STATE.ROTATE && !_this.noRotate ) {

	      _this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateEnd );

	    } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

	      _this.getMouseOnScreen( event.pageX, event.pageY, _zoomEnd );

	    } else if ( _state === STATE.PAN && !_this.noPan ) {

	      _this.getMouseOnScreen( event.pageX, event.pageY, _panEnd );

	    }

	  }

	  function mouseup( event ) {

	    if ( _this.enabled === false ) return;

	    event.preventDefault();
	    event.stopPropagation();

	    _state = STATE.NONE;

	    document.removeEventListener( 'mousemove', mousemove );
	    document.removeEventListener( 'mouseup', mouseup );
	    _this.dispatchEvent( endEvent );

	  }

	  function mousewheel( event ) {

	    if ( _this.enabled === false ) return;

	    event.preventDefault();
	    event.stopPropagation();

	    var delta = 0;

	    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

	      delta = event.wheelDelta / 40;

	    } else if ( event.detail ) { // Firefox

	      delta = - event.detail / 3;

	    }

	    _zoomStart.y += delta * 0.01;
	    _this.dispatchEvent( startEvent );
	    _this.dispatchEvent( endEvent );

	  }

	  function touchstart( event ) {

	    if ( _this.enabled === false ) return;

	    switch ( event.touches.length ) {

	      case 1:
	        _state = STATE.TOUCH_ROTATE;
	        _rotateEnd.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateStart ));
	        break;

	      case 2:
	        _state = STATE.TOUCH_ZOOM;
	        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
	        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
	        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
	        break;

	      case 3:
	        _state = STATE.TOUCH_PAN;
	        _panEnd.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panStart ));
	        break;

	      default:
	        _state = STATE.NONE;

	    }
	    _this.dispatchEvent( startEvent );


	  }

	  function touchmove( event ) {

	    if ( _this.enabled === false ) return;

	    event.preventDefault();
	    event.stopPropagation();

	    switch ( event.touches.length ) {

	      case 1:
	        _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd );
	        break;

	      case 2:
	        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
	        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
	        _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy )
	        break;

	      case 3:
	        _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd );
	        break;

	      default:
	        _state = STATE.NONE;

	    }

	  }

	  function touchend( event ) {

	    if ( _this.enabled === false ) return;

	    switch ( event.touches.length ) {

	      case 1:
	        _rotateStart.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd ));
	        break;

	      case 2:
	        _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
	        break;

	      case 3:
	        _panStart.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd ));
	        break;

	    }

	    _state = STATE.NONE;
	    _this.dispatchEvent( endEvent );

	  }

	  this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	  this.domElement.addEventListener( 'mousedown', mousedown, false );

	  this.domElement.addEventListener( 'mousewheel', mousewheel, false );
	  this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

	  this.domElement.addEventListener( 'touchstart', touchstart, false );
	  this.domElement.addEventListener( 'touchend', touchend, false );
	  this.domElement.addEventListener( 'touchmove', touchmove, false );

	  window.addEventListener( 'keydown', keydown, false );
	  window.addEventListener( 'keyup', keyup, false );

	  this.handleResize();

	  // force an update at start
	  this.update();

	};

	THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );

	module.exports = THREE.TrackballControls;



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	var THREE = __webpack_require__(3);

	THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

		this.oldClearColor = new THREE.Color();
		this.oldClearAlpha = 1;

		this.enabled = true;
		this.clear = true;
		this.needsSwap = false;

	};

	THREE.RenderPass.prototype = {

		render: function ( renderer, writeBuffer, readBuffer, delta ) {

			this.scene.overrideMaterial = this.overrideMaterial;

			if ( this.clearColor ) {

				this.oldClearColor.copy( renderer.getClearColor() );
				this.oldClearAlpha = renderer.getClearAlpha();

				renderer.setClearColor( this.clearColor, this.clearAlpha );

			}

			renderer.render( this.scene, this.camera, readBuffer, this.clear );

			if ( this.clearColor ) {

				renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

			}

			this.scene.overrideMaterial = null;

		}

	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	var THREE = __webpack_require__(3);

	THREE.ShaderPass = function ( shader, textureID ) {

		this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		this.renderToScreen = false;

		this.enabled = true;
		this.needsSwap = true;
		this.clear = false;


		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene  = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	};

	THREE.ShaderPass.prototype = {

		render: function ( renderer, writeBuffer, readBuffer, delta ) {

			if ( this.uniforms[ this.textureID ] ) {

				this.uniforms[ this.textureID ].value = readBuffer;

			}

			this.quad.material = this.material;

			if ( this.renderToScreen ) {

				renderer.render( this.scene, this.camera );

			} else {

				renderer.render( this.scene, this.camera, writeBuffer, this.clear );

			}

		}

	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	var THREE = __webpack_require__(3);

	THREE.MaskPass = function ( scene, camera ) {

		this.scene = scene;
		this.camera = camera;

		this.enabled = true;
		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;

	};

	THREE.MaskPass.prototype = {

		render: function ( renderer, writeBuffer, readBuffer, delta ) {

			var context = renderer.context;

			// don't update color or depth

			context.colorMask( false, false, false, false );
			context.depthMask( false );

			// set up stencil

			var writeValue, clearValue;

			if ( this.inverse ) {

				writeValue = 0;
				clearValue = 1;

			} else {

				writeValue = 1;
				clearValue = 0;

			}

			context.enable( context.STENCIL_TEST );
			context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
			context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
			context.clearStencil( clearValue );

			// draw into the stencil buffer

			renderer.render( this.scene, this.camera, readBuffer, this.clear );
			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

			// re-enable update of color and depth

			context.colorMask( true, true, true, true );
			context.depthMask( true );

			// only render where stencil is set to 1

			context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
			context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

		}

	};


	THREE.ClearMaskPass = function () {

		this.enabled = true;

	};

	THREE.ClearMaskPass.prototype = {

		render: function ( renderer, writeBuffer, readBuffer, delta ) {

			var context = renderer.context;

			context.disable( context.STENCIL_TEST );

		}

	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	var THREE = __webpack_require__(3);

	THREE.EffectComposer = function ( renderer, renderTarget ) {

		this.renderer = renderer;

		if ( renderTarget === undefined ) {

			var pixelRatio = renderer.getPixelRatio();

			var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
			var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
			var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

			renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.passes = [];

		if ( THREE.CopyShader === undefined )
			console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

		this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

	};

	THREE.EffectComposer.prototype = {

		swapBuffers: function() {

			var tmp = this.readBuffer;
			this.readBuffer = this.writeBuffer;
			this.writeBuffer = tmp;

		},

		addPass: function ( pass ) {

			this.passes.push( pass );

		},

		insertPass: function ( pass, index ) {

			this.passes.splice( index, 0, pass );

		},

		render: function ( delta ) {

			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

			var maskActive = false;

			var pass, i, il = this.passes.length;

			for ( i = 0; i < il; i ++ ) {

				pass = this.passes[ i ];

				if ( ! pass.enabled ) continue;

				pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

				if ( pass.needsSwap ) {

					if ( maskActive ) {

						var context = this.renderer.context;

						context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

						this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

						context.stencilFunc( context.EQUAL, 1, 0xffffffff );

					}

					this.swapBuffers();

				}

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		},

		reset: function ( renderTarget ) {

			if ( renderTarget === undefined ) {

				renderTarget = this.renderTarget1.clone();

				var pixelRatio = this.renderer.getPixelRatio();

				renderTarget.width  = Math.floor( this.renderer.context.canvas.width  / pixelRatio );
				renderTarget.height = Math.floor( this.renderer.context.canvas.height / pixelRatio );

			}

			this.renderTarget1.dispose();
			this.renderTarget1 = renderTarget;
			this.renderTarget2.dispose();
			this.renderTarget2 = renderTarget.clone();

			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

		},

		setSize: function ( width, height ) {

			this.renderTarget1.setSize( width, height );
			this.renderTarget2.setSize( width, height );

		}

	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Full-screen textured quad shader
	 */

	var THREE = __webpack_require__(3);

	THREE.CopyShader = {

		uniforms: {

			"tDiffuse": { type: "t", value: null },
			"opacity":  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",
				"gl_FragColor = opacity * texel;",

			"}"

		].join( "\n" )

	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * dat-gui JavaScript Controller Library
	 * http://code.google.com/p/dat-gui
	 *
	 * Copyright 2011 Data Arts Team, Google Creative Lab
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 */
	var dat=dat||{};dat.gui=dat.gui||{};dat.utils=dat.utils||{};dat.controllers=dat.controllers||{};dat.dom=dat.dom||{};dat.color=dat.color||{};dat.utils.css=function(){return{load:function(f,a){a=a||document;var d=a.createElement("link");d.type="text/css";d.rel="stylesheet";d.href=f;a.getElementsByTagName("head")[0].appendChild(d)},inject:function(f,a){a=a||document;var d=document.createElement("style");d.type="text/css";d.innerHTML=f;a.getElementsByTagName("head")[0].appendChild(d)}}}();
	dat.utils.common=function(){var f=Array.prototype.forEach,a=Array.prototype.slice;return{BREAK:{},extend:function(d){this.each(a.call(arguments,1),function(a){for(var c in a)this.isUndefined(a[c])||(d[c]=a[c])},this);return d},defaults:function(d){this.each(a.call(arguments,1),function(a){for(var c in a)this.isUndefined(d[c])&&(d[c]=a[c])},this);return d},compose:function(){var d=a.call(arguments);return function(){for(var e=a.call(arguments),c=d.length-1;0<=c;c--)e=[d[c].apply(this,e)];return e[0]}},
	each:function(a,e,c){if(a)if(f&&a.forEach&&a.forEach===f)a.forEach(e,c);else if(a.length===a.length+0)for(var b=0,p=a.length;b<p&&!(b in a&&e.call(c,a[b],b)===this.BREAK);b++);else for(b in a)if(e.call(c,a[b],b)===this.BREAK)break},defer:function(a){setTimeout(a,0)},toArray:function(d){return d.toArray?d.toArray():a.call(d)},isUndefined:function(a){return void 0===a},isNull:function(a){return null===a},isNaN:function(a){return a!==a},isArray:Array.isArray||function(a){return a.constructor===Array},
	isObject:function(a){return a===Object(a)},isNumber:function(a){return a===a+0},isString:function(a){return a===a+""},isBoolean:function(a){return!1===a||!0===a},isFunction:function(a){return"[object Function]"===Object.prototype.toString.call(a)}}}();
	dat.controllers.Controller=function(f){var a=function(a,e){this.initialValue=a[e];this.domElement=document.createElement("div");this.object=a;this.property=e;this.__onFinishChange=this.__onChange=void 0};f.extend(a.prototype,{onChange:function(a){this.__onChange=a;return this},onFinishChange:function(a){this.__onFinishChange=a;return this},setValue:function(a){this.object[this.property]=a;this.__onChange&&this.__onChange.call(this,a);this.updateDisplay();return this},getValue:function(){return this.object[this.property]},
	updateDisplay:function(){return this},isModified:function(){return this.initialValue!==this.getValue()}});return a}(dat.utils.common);
	dat.dom.dom=function(f){function a(b){if("0"===b||f.isUndefined(b))return 0;b=b.match(e);return f.isNull(b)?0:parseFloat(b[1])}var d={};f.each({HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},function(b,a){f.each(b,function(b){d[b]=a})});var e=/(\d+(\.\d+)?)px/,c={makeSelectable:function(b,a){void 0!==b&&void 0!==b.style&&(b.onselectstart=a?function(){return!1}:function(){},b.style.MozUserSelect=a?"auto":"none",b.style.KhtmlUserSelect=
	a?"auto":"none",b.unselectable=a?"on":"off")},makeFullscreen:function(b,a,c){f.isUndefined(a)&&(a=!0);f.isUndefined(c)&&(c=!0);b.style.position="absolute";a&&(b.style.left=0,b.style.right=0);c&&(b.style.top=0,b.style.bottom=0)},fakeEvent:function(b,a,c,e){c=c||{};var r=d[a];if(!r)throw Error("Event type "+a+" not supported.");var n=document.createEvent(r);switch(r){case "MouseEvents":n.initMouseEvent(a,c.bubbles||!1,c.cancelable||!0,window,c.clickCount||1,0,0,c.x||c.clientX||0,c.y||c.clientY||0,!1,
	!1,!1,!1,0,null);break;case "KeyboardEvents":r=n.initKeyboardEvent||n.initKeyEvent;f.defaults(c,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0});r(a,c.bubbles||!1,c.cancelable,window,c.ctrlKey,c.altKey,c.shiftKey,c.metaKey,c.keyCode,c.charCode);break;default:n.initEvent(a,c.bubbles||!1,c.cancelable||!0)}f.defaults(n,e);b.dispatchEvent(n)},bind:function(a,e,d,f){a.addEventListener?a.addEventListener(e,d,f||!1):a.attachEvent&&a.attachEvent("on"+e,d);return c},
	unbind:function(a,e,d,f){a.removeEventListener?a.removeEventListener(e,d,f||!1):a.detachEvent&&a.detachEvent("on"+e,d);return c},addClass:function(a,e){if(void 0===a.className)a.className=e;else if(a.className!==e){var d=a.className.split(/ +/);-1==d.indexOf(e)&&(d.push(e),a.className=d.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return c},removeClass:function(a,e){if(e){if(void 0!==a.className)if(a.className===e)a.removeAttribute("class");else{var d=a.className.split(/ +/),f=d.indexOf(e);-1!=
	f&&(d.splice(f,1),a.className=d.join(" "))}}else a.className=void 0;return c},hasClass:function(a,c){return(new RegExp("(?:^|\\s+)"+c+"(?:\\s+|$)")).test(a.className)||!1},getWidth:function(b){b=getComputedStyle(b);return a(b["border-left-width"])+a(b["border-right-width"])+a(b["padding-left"])+a(b["padding-right"])+a(b.width)},getHeight:function(b){b=getComputedStyle(b);return a(b["border-top-width"])+a(b["border-bottom-width"])+a(b["padding-top"])+a(b["padding-bottom"])+a(b.height)},getOffset:function(a){var c=
	{left:0,top:0};if(a.offsetParent){do c.left+=a.offsetLeft,c.top+=a.offsetTop;while(a=a.offsetParent)}return c},isActive:function(a){return a===document.activeElement&&(a.type||a.href)}};return c}(dat.utils.common);
	dat.controllers.OptionController=function(f,a,d){var e=function(c,b,f){e.superclass.call(this,c,b);var q=this;this.__select=document.createElement("select");if(d.isArray(f)){var l={};d.each(f,function(a){l[a]=a});f=l}d.each(f,function(a,b){var c=document.createElement("option");c.innerHTML=b;c.setAttribute("value",a);q.__select.appendChild(c)});this.updateDisplay();a.bind(this.__select,"change",function(){q.setValue(this.options[this.selectedIndex].value)});this.domElement.appendChild(this.__select)};
	e.superclass=f;d.extend(e.prototype,f.prototype,{setValue:function(a){a=e.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue());return a},updateDisplay:function(){this.__select.value=this.getValue();return e.superclass.prototype.updateDisplay.call(this)}});return e}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
	dat.controllers.NumberController=function(f,a){function d(a){a=a.toString();return-1<a.indexOf(".")?a.length-a.indexOf(".")-1:0}var e=function(c,b,f){e.superclass.call(this,c,b);f=f||{};this.__min=f.min;this.__max=f.max;this.__step=f.step;a.isUndefined(this.__step)?this.__impliedStep=0==this.initialValue?1:Math.pow(10,Math.floor(Math.log(this.initialValue)/Math.LN10))/10:this.__impliedStep=this.__step;this.__precision=d(this.__impliedStep)};e.superclass=f;a.extend(e.prototype,f.prototype,{setValue:function(a){void 0!==
	this.__min&&a<this.__min?a=this.__min:void 0!==this.__max&&a>this.__max&&(a=this.__max);void 0!==this.__step&&0!=a%this.__step&&(a=Math.round(a/this.__step)*this.__step);return e.superclass.prototype.setValue.call(this,a)},min:function(a){this.__min=a;return this},max:function(a){this.__max=a;return this},step:function(a){this.__impliedStep=this.__step=a;this.__precision=d(a);return this}});return e}(dat.controllers.Controller,dat.utils.common);
	dat.controllers.NumberControllerBox=function(f,a,d){var e=function(c,b,f){function q(){var a=parseFloat(n.__input.value);d.isNaN(a)||n.setValue(a)}function l(a){var b=u-a.clientY;n.setValue(n.getValue()+b*n.__impliedStep);u=a.clientY}function r(){a.unbind(window,"mousemove",l);a.unbind(window,"mouseup",r)}this.__truncationSuspended=!1;e.superclass.call(this,c,b,f);var n=this,u;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"change",q);a.bind(this.__input,
	"blur",function(){q();n.__onFinishChange&&n.__onFinishChange.call(n,n.getValue())});a.bind(this.__input,"mousedown",function(b){a.bind(window,"mousemove",l);a.bind(window,"mouseup",r);u=b.clientY});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&(n.__truncationSuspended=!0,this.blur(),n.__truncationSuspended=!1)});this.updateDisplay();this.domElement.appendChild(this.__input)};e.superclass=f;d.extend(e.prototype,f.prototype,{updateDisplay:function(){var a=this.__input,b;if(this.__truncationSuspended)b=
	this.getValue();else{b=this.getValue();var d=Math.pow(10,this.__precision);b=Math.round(b*d)/d}a.value=b;return e.superclass.prototype.updateDisplay.call(this)}});return e}(dat.controllers.NumberController,dat.dom.dom,dat.utils.common);
	dat.controllers.NumberControllerSlider=function(f,a,d,e,c){function b(a,b,c,e,d){return e+(a-b)/(c-b)*(d-e)}var p=function(c,e,d,f,u){function A(c){c.preventDefault();var e=a.getOffset(k.__background),d=a.getWidth(k.__background);k.setValue(b(c.clientX,e.left,e.left+d,k.__min,k.__max));return!1}function g(){a.unbind(window,"mousemove",A);a.unbind(window,"mouseup",g);k.__onFinishChange&&k.__onFinishChange.call(k,k.getValue())}p.superclass.call(this,c,e,{min:d,max:f,step:u});var k=this;this.__background=
	document.createElement("div");this.__foreground=document.createElement("div");a.bind(this.__background,"mousedown",function(b){a.bind(window,"mousemove",A);a.bind(window,"mouseup",g);A(b)});a.addClass(this.__background,"slider");a.addClass(this.__foreground,"slider-fg");this.updateDisplay();this.__background.appendChild(this.__foreground);this.domElement.appendChild(this.__background)};p.superclass=f;p.useDefaultStyles=function(){d.inject(c)};e.extend(p.prototype,f.prototype,{updateDisplay:function(){var a=
	(this.getValue()-this.__min)/(this.__max-this.__min);this.__foreground.style.width=100*a+"%";return p.superclass.prototype.updateDisplay.call(this)}});return p}(dat.controllers.NumberController,dat.dom.dom,dat.utils.css,dat.utils.common,"/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");
	dat.controllers.FunctionController=function(f,a,d){var e=function(c,b,d){e.superclass.call(this,c,b);var f=this;this.__button=document.createElement("div");this.__button.innerHTML=void 0===d?"Fire":d;a.bind(this.__button,"click",function(a){a.preventDefault();f.fire();return!1});a.addClass(this.__button,"button");this.domElement.appendChild(this.__button)};e.superclass=f;d.extend(e.prototype,f.prototype,{fire:function(){this.__onChange&&this.__onChange.call(this);this.getValue().call(this.object);
	this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}});return e}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
	dat.controllers.BooleanController=function(f,a,d){var e=function(c,b){e.superclass.call(this,c,b);var d=this;this.__prev=this.getValue();this.__checkbox=document.createElement("input");this.__checkbox.setAttribute("type","checkbox");a.bind(this.__checkbox,"change",function(){d.setValue(!d.__prev)},!1);this.domElement.appendChild(this.__checkbox);this.updateDisplay()};e.superclass=f;d.extend(e.prototype,f.prototype,{setValue:function(a){a=e.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&
	this.__onFinishChange.call(this,this.getValue());this.__prev=this.getValue();return a},updateDisplay:function(){!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0):this.__checkbox.checked=!1;return e.superclass.prototype.updateDisplay.call(this)}});return e}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
	dat.color.toString=function(f){return function(a){if(1==a.a||f.isUndefined(a.a)){for(a=a.hex.toString(16);6>a.length;)a="0"+a;return"#"+a}return"rgba("+Math.round(a.r)+","+Math.round(a.g)+","+Math.round(a.b)+","+a.a+")"}}(dat.utils.common);
	dat.color.interpret=function(f,a){var d,e,c=[{litmus:a.isString,conversions:{THREE_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString()+a[1].toString()+a[2].toString()+a[2].toString()+a[3].toString()+a[3].toString())}},write:f},SIX_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9]{6})$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString())}},write:f},CSS_RGB:{read:function(a){a=a.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
	return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3])}},write:f},CSS_RGBA:{read:function(a){a=a.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3]),a:parseFloat(a[4])}},write:f}}},{litmus:a.isNumber,conversions:{HEX:{read:function(a){return{space:"HEX",hex:a,conversionName:"HEX"}},write:function(a){return a.hex}}}},{litmus:a.isArray,conversions:{RGB_ARRAY:{read:function(a){return 3!=
	a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2]}},write:function(a){return[a.r,a.g,a.b]}},RGBA_ARRAY:{read:function(a){return 4!=a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2],a:a[3]}},write:function(a){return[a.r,a.g,a.b,a.a]}}}},{litmus:a.isObject,conversions:{RGBA_OBJ:{read:function(b){return a.isNumber(b.r)&&a.isNumber(b.g)&&a.isNumber(b.b)&&a.isNumber(b.a)?{space:"RGB",r:b.r,g:b.g,b:b.b,a:b.a}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b,a:a.a}}},RGB_OBJ:{read:function(b){return a.isNumber(b.r)&&
	a.isNumber(b.g)&&a.isNumber(b.b)?{space:"RGB",r:b.r,g:b.g,b:b.b}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b}}},HSVA_OBJ:{read:function(b){return a.isNumber(b.h)&&a.isNumber(b.s)&&a.isNumber(b.v)&&a.isNumber(b.a)?{space:"HSV",h:b.h,s:b.s,v:b.v,a:b.a}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v,a:a.a}}},HSV_OBJ:{read:function(b){return a.isNumber(b.h)&&a.isNumber(b.s)&&a.isNumber(b.v)?{space:"HSV",h:b.h,s:b.s,v:b.v}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v}}}}}];return function(){e=!1;
	var b=1<arguments.length?a.toArray(arguments):arguments[0];a.each(c,function(c){if(c.litmus(b))return a.each(c.conversions,function(c,f){d=c.read(b);if(!1===e&&!1!==d)return e=d,d.conversionName=f,d.conversion=c,a.BREAK}),a.BREAK});return e}}(dat.color.toString,dat.utils.common);
	dat.GUI=dat.gui.GUI=function(f,a,d,e,c,b,p,q,l,r,n,u,A,g,k){function v(a,b,h,d){if(void 0===b[h])throw Error("Object "+b+' has no property "'+h+'"');d.color?b=new n(b,h):(b=[b,h].concat(d.factoryArgs),b=e.apply(a,b));d.before instanceof c&&(d.before=d.before.__li);y(a,b);g.addClass(b.domElement,"c");h=document.createElement("span");g.addClass(h,"property-name");h.innerHTML=b.property;var f=document.createElement("div");f.appendChild(h);f.appendChild(b.domElement);d=w(a,f,d.before);g.addClass(d,m.CLASS_CONTROLLER_ROW);
	g.addClass(d,typeof b.getValue());t(a,d,b);a.__controllers.push(b);return b}function w(a,b,h){var c=document.createElement("li");b&&c.appendChild(b);h?a.__ul.insertBefore(c,params.before):a.__ul.appendChild(c);a.onResize();return c}function t(a,c,h){h.__li=c;h.__gui=a;k.extend(h,{options:function(b){if(1<arguments.length)return h.remove(),v(a,h.object,h.property,{before:h.__li.nextElementSibling,factoryArgs:[k.toArray(arguments)]});if(k.isArray(b)||k.isObject(b))return h.remove(),v(a,h.object,h.property,
	{before:h.__li.nextElementSibling,factoryArgs:[b]})},name:function(a){h.__li.firstElementChild.firstElementChild.innerHTML=a;return h},listen:function(){h.__gui.listen(h);return h},remove:function(){h.__gui.remove(h);return h}});if(h instanceof l){var d=new q(h.object,h.property,{min:h.__min,max:h.__max,step:h.__step});k.each(["updateDisplay","onChange","onFinishChange"],function(a){var K=h[a],b=d[a];h[a]=d[a]=function(){var a=Array.prototype.slice.call(arguments);K.apply(h,a);return b.apply(d,a)}});
	g.addClass(c,"has-slider");h.domElement.insertBefore(d.domElement,h.domElement.firstElementChild)}else if(h instanceof q){var e=function(b){return k.isNumber(h.__min)&&k.isNumber(h.__max)?(h.remove(),v(a,h.object,h.property,{before:h.__li.nextElementSibling,factoryArgs:[h.__min,h.__max,h.__step]})):b};h.min=k.compose(e,h.min);h.max=k.compose(e,h.max)}else h instanceof b?(g.bind(c,"click",function(){g.fakeEvent(h.__checkbox,"click")}),g.bind(h.__checkbox,"click",function(a){a.stopPropagation()})):
	h instanceof p?(g.bind(c,"click",function(){g.fakeEvent(h.__button,"click")}),g.bind(c,"mouseover",function(){g.addClass(h.__button,"hover")}),g.bind(c,"mouseout",function(){g.removeClass(h.__button,"hover")})):h instanceof n&&(g.addClass(c,"color"),h.updateDisplay=k.compose(function(a){c.style.borderLeftColor=h.__color.toString();return a},h.updateDisplay),h.updateDisplay());h.setValue=k.compose(function(b){a.getRoot().__preset_select&&h.isModified()&&E(a.getRoot(),!0);return b},h.setValue)}function y(a,
	b){var c=a.getRoot(),d=c.__rememberedObjects.indexOf(b.object);if(-1!=d){var e=c.__rememberedObjectIndecesToControllers[d];void 0===e&&(e={},c.__rememberedObjectIndecesToControllers[d]=e);e[b.property]=b;if(c.load&&c.load.remembered){c=c.load.remembered;if(c[a.preset])c=c[a.preset];else if(c.Default)c=c.Default;else return;c[d]&&void 0!==c[d][b.property]&&(d=c[d][b.property],b.initialValue=d,b.setValue(d))}}}function L(a){var b=a.__save_row=document.createElement("li");g.addClass(a.domElement,"has-save");
	a.__ul.insertBefore(b,a.__ul.firstChild);g.addClass(b,"save-row");var c=document.createElement("span");c.innerHTML="&nbsp;";g.addClass(c,"button gears");var d=document.createElement("span");d.innerHTML="Save";g.addClass(d,"button");g.addClass(d,"save");var e=document.createElement("span");e.innerHTML="New";g.addClass(e,"button");g.addClass(e,"save-as");var f=document.createElement("span");f.innerHTML="Revert";g.addClass(f,"button");g.addClass(f,"revert");var r=a.__preset_select=document.createElement("select");
	a.load&&a.load.remembered?k.each(a.load.remembered,function(b,c){F(a,c,c==a.preset)}):F(a,"Default",!1);g.bind(r,"change",function(){for(var b=0;b<a.__preset_select.length;b++)a.__preset_select[b].innerHTML=a.__preset_select[b].value;a.preset=this.value});b.appendChild(r);b.appendChild(c);b.appendChild(d);b.appendChild(e);b.appendChild(f);if(x){var n=function(){u.style.display=a.useLocalStorage?"block":"none"},b=document.getElementById("dg-save-locally"),u=document.getElementById("dg-local-explain");
	b.style.display="block";b=document.getElementById("dg-local-storage");"true"===localStorage.getItem(document.location.href+".isLocal")&&b.setAttribute("checked","checked");n();g.bind(b,"change",function(){a.useLocalStorage=!a.useLocalStorage;n()})}var m=document.getElementById("dg-new-constructor");g.bind(m,"keydown",function(a){!a.metaKey||67!==a.which&&67!=a.keyCode||B.hide()});g.bind(c,"click",function(){m.innerHTML=JSON.stringify(a.getSaveObject(),void 0,2);B.show();m.focus();m.select()});g.bind(d,
	"click",function(){a.save()});g.bind(e,"click",function(){var b=prompt("Enter a new preset name.");b&&a.saveAs(b)});g.bind(f,"click",function(){a.revert()})}function M(a){function b(f){f.preventDefault();e=f.clientX;g.addClass(a.__closeButton,m.CLASS_DRAG);g.bind(window,"mousemove",c);g.bind(window,"mouseup",d);return!1}function c(b){b.preventDefault();a.width+=e-b.clientX;a.onResize();e=b.clientX;return!1}function d(){g.removeClass(a.__closeButton,m.CLASS_DRAG);g.unbind(window,"mousemove",c);g.unbind(window,
	"mouseup",d)}a.__resize_handle=document.createElement("div");k.extend(a.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});var e;g.bind(a.__resize_handle,"mousedown",b);g.bind(a.__closeButton,"mousedown",b);a.domElement.insertBefore(a.__resize_handle,a.domElement.firstElementChild)}function G(a,b){a.domElement.style.width=b+"px";a.__save_row&&a.autoPlace&&(a.__save_row.style.width=b+"px");a.__closeButton&&(a.__closeButton.style.width=b+"px")}
	function C(a,b){var c={};k.each(a.__rememberedObjects,function(d,e){var f={};k.each(a.__rememberedObjectIndecesToControllers[e],function(a,c){f[c]=b?a.initialValue:a.getValue()});c[e]=f});return c}function F(a,b,c){var d=document.createElement("option");d.innerHTML=b;d.value=b;a.__preset_select.appendChild(d);c&&(a.__preset_select.selectedIndex=a.__preset_select.length-1)}function E(a,b){var c=a.__preset_select[a.__preset_select.selectedIndex];c.innerHTML=b?c.value+"*":c.value}function H(a){0!=a.length&&
	u(function(){H(a)});k.each(a,function(a){a.updateDisplay()})}f.inject(d);var x;try{x="localStorage"in window&&null!==window.localStorage}catch(N){x=!1}var B,I=!0,z,D=!1,J=[],m=function(a){function b(){var a=c.getRoot();a.width+=1;k.defer(function(){--a.width})}var c=this;this.domElement=document.createElement("div");this.__ul=document.createElement("ul");this.domElement.appendChild(this.__ul);g.addClass(this.domElement,"dg");this.__folders={};this.__controllers=[];this.__rememberedObjects=[];this.__rememberedObjectIndecesToControllers=
	[];this.__listening=[];a=a||{};a=k.defaults(a,{autoPlace:!0,width:m.DEFAULT_WIDTH});a=k.defaults(a,{resizable:a.autoPlace,hideable:a.autoPlace});k.isUndefined(a.load)?a.load={preset:"Default"}:a.preset&&(a.load.preset=a.preset);k.isUndefined(a.parent)&&a.hideable&&J.push(this);a.resizable=k.isUndefined(a.parent)&&a.resizable;a.autoPlace&&k.isUndefined(a.scrollable)&&(a.scrollable=!0);var d=x&&"true"===localStorage.getItem(document.location.href+".isLocal"),e;Object.defineProperties(this,{parent:{get:function(){return a.parent}},
	scrollable:{get:function(){return a.scrollable}},autoPlace:{get:function(){return a.autoPlace}},preset:{get:function(){return c.parent?c.getRoot().preset:a.load.preset},set:function(b){c.parent?c.getRoot().preset=b:a.load.preset=b;for(b=0;b<this.__preset_select.length;b++)this.__preset_select[b].value==this.preset&&(this.__preset_select.selectedIndex=b);c.revert()}},width:{get:function(){return a.width},set:function(b){a.width=b;G(c,b)}},name:{get:function(){return a.name},set:function(b){a.name=
	b;r&&(r.innerHTML=a.name)}},closed:{get:function(){return a.closed},set:function(b){a.closed=b;a.closed?g.addClass(c.__ul,m.CLASS_CLOSED):g.removeClass(c.__ul,m.CLASS_CLOSED);this.onResize();c.__closeButton&&(c.__closeButton.innerHTML=b?m.TEXT_OPEN:m.TEXT_CLOSED)}},load:{get:function(){return a.load}},useLocalStorage:{get:function(){return d},set:function(a){x&&((d=a)?g.bind(window,"unload",e):g.unbind(window,"unload",e),localStorage.setItem(document.location.href+".isLocal",a))}}});if(k.isUndefined(a.parent)){a.closed=
	!1;g.addClass(this.domElement,m.CLASS_MAIN);g.makeSelectable(this.domElement,!1);if(x&&d){c.useLocalStorage=!0;var f=localStorage.getItem(document.location.href+".gui");f&&(a.load=JSON.parse(f))}this.__closeButton=document.createElement("div");this.__closeButton.innerHTML=m.TEXT_CLOSED;g.addClass(this.__closeButton,m.CLASS_CLOSE_BUTTON);this.domElement.appendChild(this.__closeButton);g.bind(this.__closeButton,"click",function(){c.closed=!c.closed})}else{void 0===a.closed&&(a.closed=!0);var r=document.createTextNode(a.name);
	g.addClass(r,"controller-name");f=w(c,r);g.addClass(this.__ul,m.CLASS_CLOSED);g.addClass(f,"title");g.bind(f,"click",function(a){a.preventDefault();c.closed=!c.closed;return!1});a.closed||(this.closed=!1)}a.autoPlace&&(k.isUndefined(a.parent)&&(I&&(z=document.createElement("div"),g.addClass(z,"dg"),g.addClass(z,m.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(z),I=!1),z.appendChild(this.domElement),g.addClass(this.domElement,m.CLASS_AUTO_PLACE)),this.parent||G(c,a.width));g.bind(window,"resize",
	function(){c.onResize()});g.bind(this.__ul,"webkitTransitionEnd",function(){c.onResize()});g.bind(this.__ul,"transitionend",function(){c.onResize()});g.bind(this.__ul,"oTransitionEnd",function(){c.onResize()});this.onResize();a.resizable&&M(this);this.saveToLocalStorageIfPossible=e=function(){x&&"true"===localStorage.getItem(document.location.href+".isLocal")&&localStorage.setItem(document.location.href+".gui",JSON.stringify(c.getSaveObject()))};c.getRoot();a.parent||b()};m.toggleHide=function(){D=
	!D;k.each(J,function(a){a.domElement.style.zIndex=D?-999:999;a.domElement.style.opacity=D?0:1})};m.CLASS_AUTO_PLACE="a";m.CLASS_AUTO_PLACE_CONTAINER="ac";m.CLASS_MAIN="main";m.CLASS_CONTROLLER_ROW="cr";m.CLASS_TOO_TALL="taller-than-window";m.CLASS_CLOSED="closed";m.CLASS_CLOSE_BUTTON="close-button";m.CLASS_DRAG="drag";m.DEFAULT_WIDTH=245;m.TEXT_CLOSED="Close Controls";m.TEXT_OPEN="Open Controls";g.bind(window,"keydown",function(a){"text"===document.activeElement.type||72!==a.which&&72!=a.keyCode||
	m.toggleHide()},!1);k.extend(m.prototype,{add:function(a,b){return v(this,a,b,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(a,b){return v(this,a,b,{color:!0})},remove:function(a){this.__ul.removeChild(a.__li);this.__controllers.splice(this.__controllers.indexOf(a),1);var b=this;k.defer(function(){b.onResize()})},destroy:function(){this.autoPlace&&z.removeChild(this.domElement)},addFolder:function(a){if(void 0!==this.__folders[a])throw Error('You already have a folder in this GUI by the name "'+
	a+'"');var b={name:a,parent:this};b.autoPlace=this.autoPlace;this.load&&this.load.folders&&this.load.folders[a]&&(b.closed=this.load.folders[a].closed,b.load=this.load.folders[a]);b=new m(b);this.__folders[a]=b;a=w(this,b.domElement);g.addClass(a,"folder");return b},open:function(){this.closed=!1},close:function(){this.closed=!0},onResize:function(){var a=this.getRoot();if(a.scrollable){var b=g.getOffset(a.__ul).top,c=0;k.each(a.__ul.childNodes,function(b){a.autoPlace&&b===a.__save_row||(c+=g.getHeight(b))});
	window.innerHeight-b-20<c?(g.addClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height=window.innerHeight-b-20+"px"):(g.removeClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height="auto")}a.__resize_handle&&k.defer(function(){a.__resize_handle.style.height=a.__ul.offsetHeight+"px"});a.__closeButton&&(a.__closeButton.style.width=a.width+"px")},remember:function(){k.isUndefined(B)&&(B=new A,B.domElement.innerHTML=a);if(this.parent)throw Error("You can only call remember on a top level GUI.");var b=
	this;k.each(Array.prototype.slice.call(arguments),function(a){0==b.__rememberedObjects.length&&L(b);-1==b.__rememberedObjects.indexOf(a)&&b.__rememberedObjects.push(a)});this.autoPlace&&G(this,this.width)},getRoot:function(){for(var a=this;a.parent;)a=a.parent;return a},getSaveObject:function(){var a=this.load;a.closed=this.closed;0<this.__rememberedObjects.length&&(a.preset=this.preset,a.remembered||(a.remembered={}),a.remembered[this.preset]=C(this));a.folders={};k.each(this.__folders,function(b,
	c){a.folders[c]=b.getSaveObject()});return a},save:function(){this.load.remembered||(this.load.remembered={});this.load.remembered[this.preset]=C(this);E(this,!1);this.saveToLocalStorageIfPossible()},saveAs:function(a){this.load.remembered||(this.load.remembered={},this.load.remembered.Default=C(this,!0));this.load.remembered[a]=C(this);this.preset=a;F(this,a,!0);this.saveToLocalStorageIfPossible()},revert:function(a){k.each(this.__controllers,function(b){this.getRoot().load.remembered?y(a||this.getRoot(),
	b):b.setValue(b.initialValue)},this);k.each(this.__folders,function(a){a.revert(a)});a||E(this.getRoot(),!1)},listen:function(a){var b=0==this.__listening.length;this.__listening.push(a);b&&H(this.__listening)}});return m}(dat.utils.css,'<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>',
	".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n",
	dat.controllers.factory=function(f,a,d,e,c,b,p){return function(q,l,r,n){var u=q[l];if(p.isArray(r)||p.isObject(r))return new f(q,l,r);if(p.isNumber(u))return p.isNumber(r)&&p.isNumber(n)?new d(q,l,r,n):new a(q,l,{min:r,max:n});if(p.isString(u))return new e(q,l);if(p.isFunction(u))return new c(q,l,"");if(p.isBoolean(u))return new b(q,l)}}(dat.controllers.OptionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.StringController=function(f,a,d){var e=
	function(c,b){function d(){f.setValue(f.__input.value)}e.superclass.call(this,c,b);var f=this;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"keyup",d);a.bind(this.__input,"change",d);a.bind(this.__input,"blur",function(){f.__onFinishChange&&f.__onFinishChange.call(f,f.getValue())});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&this.blur()});this.updateDisplay();this.domElement.appendChild(this.__input)};e.superclass=f;d.extend(e.prototype,
	f.prototype,{updateDisplay:function(){a.isActive(this.__input)||(this.__input.value=this.getValue());return e.superclass.prototype.updateDisplay.call(this)}});return e}(dat.controllers.Controller,dat.dom.dom,dat.utils.common),dat.controllers.FunctionController,dat.controllers.BooleanController,dat.utils.common),dat.controllers.Controller,dat.controllers.BooleanController,dat.controllers.FunctionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.OptionController,
	dat.controllers.ColorController=function(f,a,d,e,c){function b(a,b,d,e){a.style.background="";c.each(l,function(c){a.style.cssText+="background: "+c+"linear-gradient("+b+", "+d+" 0%, "+e+" 100%); "})}function p(a){a.style.background="";a.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";a.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
	a.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var q=function(f,n){function u(b){v(b);a.bind(window,"mousemove",v);a.bind(window,
	"mouseup",l)}function l(){a.unbind(window,"mousemove",v);a.unbind(window,"mouseup",l)}function g(){var a=e(this.value);!1!==a?(t.__color.__state=a,t.setValue(t.__color.toOriginal())):this.value=t.__color.toString()}function k(){a.unbind(window,"mousemove",w);a.unbind(window,"mouseup",k)}function v(b){b.preventDefault();var c=a.getWidth(t.__saturation_field),d=a.getOffset(t.__saturation_field),e=(b.clientX-d.left+document.body.scrollLeft)/c;b=1-(b.clientY-d.top+document.body.scrollTop)/c;1<b?b=1:0>
	b&&(b=0);1<e?e=1:0>e&&(e=0);t.__color.v=b;t.__color.s=e;t.setValue(t.__color.toOriginal());return!1}function w(b){b.preventDefault();var c=a.getHeight(t.__hue_field),d=a.getOffset(t.__hue_field);b=1-(b.clientY-d.top+document.body.scrollTop)/c;1<b?b=1:0>b&&(b=0);t.__color.h=360*b;t.setValue(t.__color.toOriginal());return!1}q.superclass.call(this,f,n);this.__color=new d(this.getValue());this.__temp=new d(0);var t=this;this.domElement=document.createElement("div");a.makeSelectable(this.domElement,!1);
	this.__selector=document.createElement("div");this.__selector.className="selector";this.__saturation_field=document.createElement("div");this.__saturation_field.className="saturation-field";this.__field_knob=document.createElement("div");this.__field_knob.className="field-knob";this.__field_knob_border="2px solid ";this.__hue_knob=document.createElement("div");this.__hue_knob.className="hue-knob";this.__hue_field=document.createElement("div");this.__hue_field.className="hue-field";this.__input=document.createElement("input");
	this.__input.type="text";this.__input_textShadow="0 1px 1px ";a.bind(this.__input,"keydown",function(a){13===a.keyCode&&g.call(this)});a.bind(this.__input,"blur",g);a.bind(this.__selector,"mousedown",function(b){a.addClass(this,"drag").bind(window,"mouseup",function(b){a.removeClass(t.__selector,"drag")})});var y=document.createElement("div");c.extend(this.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"});c.extend(this.__field_knob.style,
	{position:"absolute",width:"12px",height:"12px",border:this.__field_knob_border+(.5>this.__color.v?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1});c.extend(this.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1});c.extend(this.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"});c.extend(y.style,{width:"100%",height:"100%",
	background:"none"});b(y,"top","rgba(0,0,0,0)","#000");c.extend(this.__hue_field.style,{width:"15px",height:"100px",display:"inline-block",border:"1px solid #555",cursor:"ns-resize"});p(this.__hue_field);c.extend(this.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:this.__input_textShadow+"rgba(0,0,0,0.7)"});a.bind(this.__saturation_field,"mousedown",u);a.bind(this.__field_knob,"mousedown",u);a.bind(this.__hue_field,"mousedown",function(b){w(b);a.bind(window,
	"mousemove",w);a.bind(window,"mouseup",k)});this.__saturation_field.appendChild(y);this.__selector.appendChild(this.__field_knob);this.__selector.appendChild(this.__saturation_field);this.__selector.appendChild(this.__hue_field);this.__hue_field.appendChild(this.__hue_knob);this.domElement.appendChild(this.__input);this.domElement.appendChild(this.__selector);this.updateDisplay()};q.superclass=f;c.extend(q.prototype,f.prototype,{updateDisplay:function(){var a=e(this.getValue());if(!1!==a){var f=!1;
	c.each(d.COMPONENTS,function(b){if(!c.isUndefined(a[b])&&!c.isUndefined(this.__color.__state[b])&&a[b]!==this.__color.__state[b])return f=!0,{}},this);f&&c.extend(this.__color.__state,a)}c.extend(this.__temp.__state,this.__color.__state);this.__temp.a=1;var l=.5>this.__color.v||.5<this.__color.s?255:0,p=255-l;c.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toString(),border:this.__field_knob_border+"rgb("+l+
	","+l+","+l+")"});this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px";this.__temp.s=1;this.__temp.v=1;b(this.__saturation_field,"left","#fff",this.__temp.toString());c.extend(this.__input.style,{backgroundColor:this.__input.value=this.__color.toString(),color:"rgb("+l+","+l+","+l+")",textShadow:this.__input_textShadow+"rgba("+p+","+p+","+p+",.7)"})}});var l=["-moz-","-o-","-webkit-","-ms-",""];return q}(dat.controllers.Controller,dat.dom.dom,dat.color.Color=function(f,a,d,e){function c(a,
	b,c){Object.defineProperty(a,b,{get:function(){if("RGB"===this.__state.space)return this.__state[b];p(this,b,c);return this.__state[b]},set:function(a){"RGB"!==this.__state.space&&(p(this,b,c),this.__state.space="RGB");this.__state[b]=a}})}function b(a,b){Object.defineProperty(a,b,{get:function(){if("HSV"===this.__state.space)return this.__state[b];q(this);return this.__state[b]},set:function(a){"HSV"!==this.__state.space&&(q(this),this.__state.space="HSV");this.__state[b]=a}})}function p(b,c,d){if("HEX"===
	b.__state.space)b.__state[c]=a.component_from_hex(b.__state.hex,d);else if("HSV"===b.__state.space)e.extend(b.__state,a.hsv_to_rgb(b.__state.h,b.__state.s,b.__state.v));else throw"Corrupted color state";}function q(b){var c=a.rgb_to_hsv(b.r,b.g,b.b);e.extend(b.__state,{s:c.s,v:c.v});e.isNaN(c.h)?e.isUndefined(b.__state.h)&&(b.__state.h=0):b.__state.h=c.h}var l=function(){this.__state=f.apply(this,arguments);if(!1===this.__state)throw"Failed to interpret color arguments";this.__state.a=this.__state.a||
	1};l.COMPONENTS="r g b h s v hex a".split(" ");e.extend(l.prototype,{toString:function(){return d(this)},toOriginal:function(){return this.__state.conversion.write(this)}});c(l.prototype,"r",2);c(l.prototype,"g",1);c(l.prototype,"b",0);b(l.prototype,"h");b(l.prototype,"s");b(l.prototype,"v");Object.defineProperty(l.prototype,"a",{get:function(){return this.__state.a},set:function(a){this.__state.a=a}});Object.defineProperty(l.prototype,"hex",{get:function(){"HEX"!==!this.__state.space&&(this.__state.hex=
	a.rgb_to_hex(this.r,this.g,this.b));return this.__state.hex},set:function(a){this.__state.space="HEX";this.__state.hex=a}});return l}(dat.color.interpret,dat.color.math=function(){var f;return{hsv_to_rgb:function(a,d,e){var c=a/60-Math.floor(a/60),b=e*(1-d),f=e*(1-c*d);d=e*(1-(1-c)*d);a=[[e,d,b],[f,e,b],[b,e,d],[b,f,e],[d,b,e],[e,b,f]][Math.floor(a/60)%6];return{r:255*a[0],g:255*a[1],b:255*a[2]}},rgb_to_hsv:function(a,d,e){var c=Math.min(a,d,e),b=Math.max(a,d,e),c=b-c;if(0==b)return{h:NaN,s:0,v:0};
	a=(a==b?(d-e)/c:d==b?2+(e-a)/c:4+(a-d)/c)/6;0>a&&(a+=1);return{h:360*a,s:c/b,v:b/255}},rgb_to_hex:function(a,d,e){a=this.hex_with_component(0,2,a);a=this.hex_with_component(a,1,d);return a=this.hex_with_component(a,0,e)},component_from_hex:function(a,d){return a>>8*d&255},hex_with_component:function(a,d,e){return e<<(f=8*d)|a&~(255<<f)}}}(),dat.color.toString,dat.utils.common),dat.color.interpret,dat.utils.common),dat.utils.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||
	window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(f,a){window.setTimeout(f,1E3/60)}}(),dat.dom.CenteredDiv=function(f,a){var d=function(){this.backgroundElement=document.createElement("div");a.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"});f.makeFullscreen(this.backgroundElement);this.backgroundElement.style.position=
	"fixed";this.domElement=document.createElement("div");a.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"});document.body.appendChild(this.backgroundElement);document.body.appendChild(this.domElement);var d=this;f.bind(this.backgroundElement,"click",function(){d.hide()})};d.prototype.show=function(){var d=this;this.backgroundElement.style.display=
	"block";this.domElement.style.display="block";this.domElement.style.opacity=0;this.domElement.style.webkitTransform="scale(1.1)";this.layout();a.defer(function(){d.backgroundElement.style.opacity=1;d.domElement.style.opacity=1;d.domElement.style.webkitTransform="scale(1)"})};d.prototype.hide=function(){var a=this,c=function(){a.domElement.style.display="none";a.backgroundElement.style.display="none";f.unbind(a.domElement,"webkitTransitionEnd",c);f.unbind(a.domElement,"transitionend",c);f.unbind(a.domElement,
	"oTransitionEnd",c)};f.bind(this.domElement,"webkitTransitionEnd",c);f.bind(this.domElement,"transitionend",c);f.bind(this.domElement,"oTransitionEnd",c);this.backgroundElement.style.opacity=0;this.domElement.style.opacity=0;this.domElement.style.webkitTransform="scale(1.1)"};d.prototype.layout=function(){this.domElement.style.left=window.innerWidth/2-f.getWidth(this.domElement)/2+"px";this.domElement.style.top=window.innerHeight/2-f.getHeight(this.domElement)/2+"px"};return d}(dat.dom.dom,dat.utils.common),
	dat.dom.dom,dat.utils.common);

	/*** EXPORTS FROM exports-loader ***/
	module.exports = dat

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * simulation.js
	 * */

	var THREE = __webpack_require__(3);
	var FboPingPong = __webpack_require__(12);

	var sim, Simulation = function(opt) {
	    sim= this;
	    sim.init.apply(this, arguments);
	};

	Simulation.prototype = {

	    init : function(opt) {
	        opt = opt || {};

	        var w = sim.width = opt.width || 128;
	        var h = sim.height = opt.height || 128;

	        sim.scene = new THREE.Scene();
	        sim.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	        sim.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	        sim.scene.add(sim.quad);

	        var fboOption = {
	            type : THREE.HalfFloatType
	            // type : THREE.FloatType
	        };

	        sim.position = new FboPingPong(w, h, fboOption);

	        var time = { type : "f", value : 0 };
	        var dt = { type : "f", value : 0 };
	        
	        sim.posm = new THREE.ShaderMaterial({
	            uniforms : {
	                positionTex : { type : "t", value : sim.position.getReadBuffer() },
	                scale : { type : "f", value : 30.0 },

	                sigma : { type : "f", value : 10.2 },
	                rho : { type : "f", value : 30.0 },
	                beta : { type : "f", value : 8.0 },

	                time : time,
	                dt : dt
	            },
	            vertexShader : opt.kernel,
	            fragmentShader : opt.position
	        });
	    },

	    simulate : function(renderer, t, dt) {
	        sim.posm.uniforms.positionTex.value = sim.position.getReadBuffer();
	        sim.posm.uniforms.time.value = t;
	        sim.posm.uniforms.dt.value = dt;
	        sim.blit(renderer, sim.posm, sim.position.getWriteBuffer());
	        sim.position.swap();
	    },

	    reset : function(renderer) {
	        sim.simulate(renderer, 0, 0);
	    },

	    blit : function(renderer, m, buffer) {
	        sim.quad.material = m;
	        renderer.render(sim.scene, sim.camera, buffer, false);
	    },

	    updateLorenzProps : function(sigma, rho, beta) {
	        sim.posm.uniforms.sigma.value = sigma;
	        sim.posm.uniforms.rho.value = rho;
	        sim.posm.uniforms.beta.value = beta;
	    },

	    get positionTexture() {
	        return sim.position.getReadBuffer();
	    }

	};

	module.exports = Simulation;



/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * fbopingpong.js
	 * */

	var THREE = __webpack_require__(3);

	function createBuffer(width, height, opt) {
	    opt = opt || {};
	    return new THREE.WebGLRenderTarget(width, height, {
	        wrapS: opt.wrapS || THREE.ClampToEdgeWrapping,
	        wrapT: opt.wrapT || THREE.ClampToEdgeWrapping,
	        minFilter: opt.minFilter || THREE.NearestFilter,
	        magFilter: opt.magFilter || THREE.NearestFilter,
	        format: opt.format || THREE.RGBAFormat,
	        type: opt.type || THREE.FloatType,
	        stencilBuffer: opt.stencilBuffer || false
	    });
	}

	var FboPingPong = function(width, height, opt) {
	    this.readBufferIndex = 0;
	    this.writeBufferIndex = 1;
	    this.buffers = [
	        createBuffer(width, height, opt),
	        createBuffer(width, height, opt)
	    ];
	};

	FboPingPong.prototype = {
	    getReadBuffer : function() {
	        return this.buffers[this.readBufferIndex];
	    },
	    getWriteBuffer : function() {
	        return this.buffers[this.writeBufferIndex];
	    },
	    swap : function() {
	        var tmp = this.buffers[this.writeBufferIndex];
	        this.buffers[this.writeBufferIndex] = this.buffers[this.readBufferIndex];
	        this.buffers[this.readBufferIndex] = tmp;
	    }
	};

	module.exports = FboPingPong;



/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Tween.js - Licensed under the MIT license
	 * https://github.com/tweenjs/tween.js
	 * ----------------------------------------------
	 *
	 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
	 * Thank you all, you're awesome!
	 */

	// Include a performance.now polyfill
	(function () {

		if ('performance' in window === false) {
			window.performance = {};
		}

		// IE 8
		Date.now = (Date.now || function () {
			return new Date().getTime();
		});

		if ('now' in window.performance === false) {
			var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
			                                                                                    : Date.now();

			window.performance.now = function () {
				return Date.now() - offset;
			};
		}

	})();

	var TWEEN = TWEEN || (function () {

		var _tweens = [];

		return {

			getAll: function () {

				return _tweens;

			},

			removeAll: function () {

				_tweens = [];

			},

			add: function (tween) {

				_tweens.push(tween);

			},

			remove: function (tween) {

				var i = _tweens.indexOf(tween);

				if (i !== -1) {
					_tweens.splice(i, 1);
				}

			},

			update: function (time) {

				if (_tweens.length === 0) {
					return false;
				}

				var i = 0;

				time = time !== undefined ? time : window.performance.now();

				while (i < _tweens.length) {

					if (_tweens[i].update(time)) {
						i++;
					} else {
						_tweens.splice(i, 1);
					}

				}

				return true;

			}
		};

	})();

	TWEEN.Tween = function (object) {

		var _object = object;
		var _valuesStart = {};
		var _valuesEnd = {};
		var _valuesStartRepeat = {};
		var _duration = 1000;
		var _repeat = 0;
		var _yoyo = false;
		var _isPlaying = false;
		var _reversed = false;
		var _delayTime = 0;
		var _startTime = null;
		var _easingFunction = TWEEN.Easing.Linear.None;
		var _interpolationFunction = TWEEN.Interpolation.Linear;
		var _chainedTweens = [];
		var _onStartCallback = null;
		var _onStartCallbackFired = false;
		var _onUpdateCallback = null;
		var _onCompleteCallback = null;
		var _onStopCallback = null;

		// Set all starting values present on the target object
		for (var field in object) {
			_valuesStart[field] = parseFloat(object[field], 10);
		}

		this.to = function (properties, duration) {

			if (duration !== undefined) {
				_duration = duration;
			}

			_valuesEnd = properties;

			return this;

		};

		this.start = function (time) {

			TWEEN.add(this);

			_isPlaying = true;

			_onStartCallbackFired = false;

			_startTime = time !== undefined ? time : window.performance.now();
			_startTime += _delayTime;

			for (var property in _valuesEnd) {

				// Check if an Array was provided as property value
				if (_valuesEnd[property] instanceof Array) {

					if (_valuesEnd[property].length === 0) {
						continue;
					}

					// Create a local copy of the Array with the start value at the front
					_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

				}

				_valuesStart[property] = _object[property];

				if ((_valuesStart[property] instanceof Array) === false) {
					_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
				}

				_valuesStartRepeat[property] = _valuesStart[property] || 0;

			}

			return this;

		};

		this.stop = function () {

			if (!_isPlaying) {
				return this;
			}

			TWEEN.remove(this);
			_isPlaying = false;

			if (_onStopCallback !== null) {
				_onStopCallback.call(_object);
			}

			this.stopChainedTweens();
			return this;

		};

		this.stopChainedTweens = function () {

			for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
				_chainedTweens[i].stop();
			}

		};

		this.delay = function (amount) {

			_delayTime = amount;
			return this;

		};

		this.repeat = function (times) {

			_repeat = times;
			return this;

		};

		this.yoyo = function (yoyo) {

			_yoyo = yoyo;
			return this;

		};


		this.easing = function (easing) {

			_easingFunction = easing;
			return this;

		};

		this.interpolation = function (interpolation) {

			_interpolationFunction = interpolation;
			return this;

		};

		this.chain = function () {

			_chainedTweens = arguments;
			return this;

		};

		this.onStart = function (callback) {

			_onStartCallback = callback;
			return this;

		};

		this.onUpdate = function (callback) {

			_onUpdateCallback = callback;
			return this;

		};

		this.onComplete = function (callback) {

			_onCompleteCallback = callback;
			return this;

		};

		this.onStop = function (callback) {

			_onStopCallback = callback;
			return this;

		};

		this.update = function (time) {

			var property;
			var elapsed;
			var value;

			if (time < _startTime) {
				return true;
			}

			if (_onStartCallbackFired === false) {

				if (_onStartCallback !== null) {
					_onStartCallback.call(_object);
				}

				_onStartCallbackFired = true;

			}

			elapsed = (time - _startTime) / _duration;
			elapsed = elapsed > 1 ? 1 : elapsed;

			value = _easingFunction(elapsed);

			for (property in _valuesEnd) {

				var start = _valuesStart[property] || 0;
				var end = _valuesEnd[property];

				if (end instanceof Array) {

					_object[property] = _interpolationFunction(end, value);

				} else {

					// Parses relative end values with start as base (e.g.: +10, -3)
					if (typeof (end) === 'string') {
						end = start + parseFloat(end, 10);
					}

					// Protect against non numeric properties.
					if (typeof (end) === 'number') {
						_object[property] = start + (end - start) * value;
					}

				}

			}

			if (_onUpdateCallback !== null) {
				_onUpdateCallback.call(_object, value);
			}

			if (elapsed === 1) {

				if (_repeat > 0) {

					if (isFinite(_repeat)) {
						_repeat--;
					}

					// Reassign starting values, restart by making startTime = now
					for (property in _valuesStartRepeat) {

						if (typeof (_valuesEnd[property]) === 'string') {
							_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
						}

						if (_yoyo) {
							var tmp = _valuesStartRepeat[property];

							_valuesStartRepeat[property] = _valuesEnd[property];
							_valuesEnd[property] = tmp;
						}

						_valuesStart[property] = _valuesStartRepeat[property];

					}

					if (_yoyo) {
						_reversed = !_reversed;
					}

					_startTime = time + _delayTime;

					return true;

				} else {

					if (_onCompleteCallback !== null) {
						_onCompleteCallback.call(_object);
					}

					for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
						// Make the chained tweens start exactly at the time they should,
						// even if the `update()` method was called way past the duration of the tween
						_chainedTweens[i].start(_startTime + _duration);
					}

					return false;

				}

			}

			return true;

		};

	};


	TWEEN.Easing = {

		Linear: {

			None: function (k) {

				return k;

			}

		},

		Quadratic: {

			In: function (k) {

				return k * k;

			},

			Out: function (k) {

				return k * (2 - k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k;
				}

				return - 0.5 * (--k * (k - 2) - 1);

			}

		},

		Cubic: {

			In: function (k) {

				return k * k * k;

			},

			Out: function (k) {

				return --k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k + 2);

			}

		},

		Quartic: {

			In: function (k) {

				return k * k * k * k;

			},

			Out: function (k) {

				return 1 - (--k * k * k * k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k;
				}

				return - 0.5 * ((k -= 2) * k * k * k - 2);

			}

		},

		Quintic: {

			In: function (k) {

				return k * k * k * k * k;

			},

			Out: function (k) {

				return --k * k * k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k * k * k + 2);

			}

		},

		Sinusoidal: {

			In: function (k) {

				return 1 - Math.cos(k * Math.PI / 2);

			},

			Out: function (k) {

				return Math.sin(k * Math.PI / 2);

			},

			InOut: function (k) {

				return 0.5 * (1 - Math.cos(Math.PI * k));

			}

		},

		Exponential: {

			In: function (k) {

				return k === 0 ? 0 : Math.pow(1024, k - 1);

			},

			Out: function (k) {

				return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

			},

			InOut: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if ((k *= 2) < 1) {
					return 0.5 * Math.pow(1024, k - 1);
				}

				return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

			}

		},

		Circular: {

			In: function (k) {

				return 1 - Math.sqrt(1 - k * k);

			},

			Out: function (k) {

				return Math.sqrt(1 - (--k * k));

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return - 0.5 * (Math.sqrt(1 - k * k) - 1);
				}

				return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

			}

		},

		Elastic: {

			In: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

			},

			Out: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

			},

			InOut: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				if ((k *= 2) < 1) {
					return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
				}

				return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

			}

		},

		Back: {

			In: function (k) {

				var s = 1.70158;

				return k * k * ((s + 1) * k - s);

			},

			Out: function (k) {

				var s = 1.70158;

				return --k * k * ((s + 1) * k + s) + 1;

			},

			InOut: function (k) {

				var s = 1.70158 * 1.525;

				if ((k *= 2) < 1) {
					return 0.5 * (k * k * ((s + 1) * k - s));
				}

				return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

			}

		},

		Bounce: {

			In: function (k) {

				return 1 - TWEEN.Easing.Bounce.Out(1 - k);

			},

			Out: function (k) {

				if (k < (1 / 2.75)) {
					return 7.5625 * k * k;
				} else if (k < (2 / 2.75)) {
					return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
				} else if (k < (2.5 / 2.75)) {
					return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
				} else {
					return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
				}

			},

			InOut: function (k) {

				if (k < 0.5) {
					return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
				}

				return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

			}

		}

	};

	TWEEN.Interpolation = {

		Linear: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.Linear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

		},

		Bezier: function (v, k) {

			var b = 0;
			var n = v.length - 1;
			var pw = Math.pow;
			var bn = TWEEN.Interpolation.Utils.Bernstein;

			for (var i = 0; i <= n; i++) {
				b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
			}

			return b;

		},

		CatmullRom: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.CatmullRom;

			if (v[0] === v[m]) {

				if (k < 0) {
					i = Math.floor(f = m * (1 + k));
				}

				return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

			} else {

				if (k < 0) {
					return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
				}

				if (k > 1) {
					return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
				}

				return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

			}

		},

		Utils: {

			Linear: function (p0, p1, t) {

				return (p1 - p0) * t + p0;

			},

			Bernstein: function (n, i) {

				var fc = TWEEN.Interpolation.Utils.Factorial;

				return fc(n) / fc(i) / fc(n - i);

			},

			Factorial: (function () {

				var a = [1];

				return function (n) {

					var s = 1;

					if (a[n]) {
						return a[n];
					}

					for (var i = n; i > 1; i--) {
						s *= i;
					}

					a[n] = s;
					return s;

				};

			})(),

			CatmullRom: function (p0, p1, p2, p3, t) {

				var v0 = (p2 - p0) * 0.5;
				var v1 = (p3 - p1) * 0.5;
				var t2 = t * t;
				var t3 = t * t2;

				return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

			}

		}

	};

	// UMD (Universal Module Definition)
	(function (root) {

		if (true) {

			// AMD
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return TWEEN;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

		} else if (typeof exports === 'object') {

			// Node.js
			module.exports = TWEEN;

		} else {

			// Global variable
			root.TWEEN = TWEEN;

		}

	})(this);


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nvarying vec2 texcoord;\n\nvoid main() {\n    texcoord = uv;\n    gl_Position = vec4(position, 1.);\n}\n\n"

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nvarying vec2 texcoord;\n\nuniform sampler2D positionTex;\n\nuniform float sigma;\nuniform float rho;\nuniform float beta;\n\nuniform float time;\nuniform float dt;\n\nuniform float scale;\n\nfloat rnd(vec2 p){\n    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\n    if(time <= 0.3) { // initialize\n        float seed = rnd(texcoord);\n        float x = rnd(texcoord);\n        float y = rnd(texcoord + seed);\n        float z = rnd(texcoord + seed * 10.);\n        gl_FragColor = vec4((vec3(x, y, z) - 0.5) * scale, 1.0);\n    } else {\n        vec3 pos = texture2D(positionTex, texcoord).xyz;\n\n        vec3 vel = vec3(\n            sigma * (pos.y - pos.x),\n            pos.x * (rho - pos.z) - pos.y,\n            pos.x * pos.y - beta * pos.z\n        ) * 0.01;\n\n        pos += vel;\n        gl_FragColor = vec4(pos, 1.0);\n    }\n\n}\n\n"

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nprecision mediump float;\nprecision mediump int;\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\n\nuniform sampler2D positionTex;\nuniform float pointSize;\nuniform float time;\n\nattribute vec3 position;\nattribute vec2 uv;\n\nvarying vec4 color;\n\nvoid main() {\n    vec3 pos = texture2D(positionTex, uv).xyz;\n\n    color = vec4(vec3(1.0), 0.35);\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n    gl_PointSize = pointSize;\n}\n\n"

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nprecision mediump float;\nprecision mediump int;\n\nuniform sampler2D particleTex;\n\nvarying vec4 color;\n\nvoid main() {\n    gl_FragColor = texture2D(particleTex, gl_PointCoord) * color;\n}\n\n"

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nvarying vec2 texcoord;\n\nvoid main() {\n    texcoord = uv;\n    gl_Position = vec4(position, 1.);\n}\n\n"

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = "#define GLSLIFY 1\nfloat blendLighten_1_0(float base, float blend) {\n\treturn max(blend,base);\n}\n\nvec3 blendLighten_1_0(vec3 base, vec3 blend) {\n\treturn vec3(blendLighten_1_0(base.r,blend.r),blendLighten_1_0(base.g,blend.g),blendLighten_1_0(base.b,blend.b));\n}\n\nvec3 blendLighten_1_0(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLighten_1_0(base, blend) * opacity + blend * (1.0 - opacity));\n}\n\n\nfloat blendDarken_2_1(float base, float blend) {\n\treturn min(blend,base);\n}\n\nvec3 blendDarken_2_1(vec3 base, vec3 blend) {\n\treturn vec3(blendDarken_2_1(base.r,blend.r),blendDarken_2_1(base.g,blend.g),blendDarken_2_1(base.b,blend.b));\n}\n\nvec3 blendDarken_2_1(vec3 base, vec3 blend, float opacity) {\n\treturn (blendDarken_2_1(base, blend) * opacity + blend * (1.0 - opacity));\n}\n\n\nfloat blendSoftLight_3_2(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight_3_2(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight_3_2(base.r,blend.r),blendSoftLight_3_2(base.g,blend.g),blendSoftLight_3_2(base.b,blend.b));\n}\n\nvec3 blendSoftLight_3_2(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight_3_2(base, blend) * opacity + blend * (1.0 - opacity));\n}\n\n\nfloat blendOverlay_4_3(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay_4_3(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay_4_3(base.r,blend.r),blendOverlay_4_3(base.g,blend.g),blendOverlay_4_3(base.b,blend.b));\n}\n\nvec3 blendOverlay_4_3(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay_4_3(base, blend) * opacity + blend * (1.0 - opacity));\n}\n\n\n\nvec4 blur5_5_4(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.3333333333333333) * direction;\n  color += texture2D(image, uv) * 0.29411764705882354;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;\n  return color; \n}\n\n\nvec4 blur9_6_5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.3846153846) * direction;\n  vec2 off2 = vec2(3.2307692308) * direction;\n  color += texture2D(image, uv) * 0.2270270270;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;\n  return color;\n}\n\n\n\nvarying vec2 texcoord;\n\nuniform sampler2D tDiffuse;\nuniform sampler2D tBg;\nuniform sampler2D tGrad;\nuniform sampler2D tNoise;\n\nuniform vec2 resolution;\nuniform float ratio;\nuniform float aspect;\n\nuniform float gamma;\nuniform float time;\n\nconst vec2 direction = vec2(0.5, 0.5);\n\nvoid main() {\n\n    vec4 front = blur5_5_4(tDiffuse, texcoord, resolution, direction);\n    vec4 grad = texture2D(tGrad, texcoord * vec2(1., 1.00));\n    vec4 bg = texture2D(tBg, (texcoord + vec2(time * 0.005, 0.0)) * vec2(ratio * aspect, 1.0));\n\n    vec4 color = vec4(1.0);\n\n    // color.rgb = blendLighten(color.rgb, bg.rgb);\n    // color.rgb = blendLighten(bg.rgb, color.rgb);\n\n    // color.rgb = blendDarken(color.rgb, bg.rgb);\n    // color.rgb = blendDarken(bg.rgb, color.rgb);\n\n    bg.rgb = blendOverlay_4_3(bg.rgb, grad.rgb);\n    color.rgb = blendSoftLight_3_2(bg.rgb, front.rgb);\n\n    // color.rgb = blendOverlay(color.rgb, bg.rgb);\n    // color.rgb = blendOverlay(bg.rgb, color.rgb);\n\n\t// color correction\n    color.rgb = pow(color.rgb, vec3(1.0 / gamma));\n\n    gl_FragColor = color;\n}\n\n\n"

/***/ }
/******/ ]);