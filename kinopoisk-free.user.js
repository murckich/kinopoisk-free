// ==UserScript==
// @name         kinopoisk-free
// @namespace    http://tampermonkey.net/
// @version      7.5.9
// @description  Бесплатный просмотр фильмом и сериалов на сайте kinopoisk.ru
// @author       Murckich
// @icon         https://www.kinopoisk.ru/favicon.ico
// @match        https://www.kinopoisk.ru/*
// @match        http://www.kinopoisk.ru/*
// @match        https://kinopoisk.ru/*
// @match        http://kinopoisk.ru/*
// @include      /^https?:\/\/([^/]*\.)?habster\./
// @include      /^https?:\/\/([^/]*\.)?fbfind\./
// @include      /^https?:\/\/([^/]*\.)?brogiro\./
// @include      /^https?:\/\/([^/]*\.)?kinokino\./
// @include      /^https?:\/\/([^/]*\.)?villybizy\./
// @include      /^https?:\/\/([^/]*\.)?flcksbr\./
// @include      /^https?:\/\/([^/]*\.)?gromfaer\./
// @include      /^https?:\/\/([^/]*\.)?sspoisk\./
// @include      /^https?:\/\/([^/]*\.)?nonchik\./
// @include      /^https?:\/\/([^/]*\.)?troutcdn\./
// @include      /^https?:\/\/([^/]*\.)?kinopoisk\.(?!ru([/.]|$))/
// @downloadURL  https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js
// @updateURL    https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      habster.sbs
// @run-at       document-start
// @license      Apache-2.0
// ==/UserScript==

/*
 * Copyright 2026 Murckich
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    'use strict';

    const LOCAL_META = {
        version: '7.5.9',
        date: '20.09.2026'
    };

    const CONFIG = {
        STORAGE_KEY: 'kpRedirectSettings',
        TABS_STORAGE_KEY: 'kpTabs',
        ACTIVE_TAB_KEY: 'kpActiveTab',
        DEFAULT_DOMAIN: 'habster.sbs',
        DEFAULT_TAB_ID: 'default',
        DEFAULT_TAB_NAME: 'Главная',
        TAB_NAME_MAX: 13,
        CHANNELS: [
            { brand: ['habster'],                                              type: 'alfa',  domain: 'habster.sbs',      name: 'Альфа',  domains: ['habster.sbs'] },
            { brand: ['nonchik', 'troutcdn', 'kinopoisk.ws'],                  type: 'bravo', domain: 'www.kinopoisk.ws', name: 'Браво',  domains: ['www.kinopoisk.ws', 'kinopoisk.ws', 'nonchik.com', 'troutcdn.site'] },
            { brand: ['fbfind'],                                               type: 'gamma', domain: 'fbfind.online',    name: 'Гамма',  domains: ['fbfind.online', 'fbfind.top', 'fbfind.life', 'kinopoisk.film'] },
            { brand: ['brogiro', 'kinokino', 'villybizy'],                     type: 'gamma', domain: 'brogiro.cfd',      name: 'Дельта', domains: ['brogiro.cfd', 'kinokino.vip', 'villybizy.online'] },
            { brand: ['flcksbr'],                                              type: 'tango', domain: 'flcksbr.top',      name: 'Танго',  domains: ['flcksbr.top'] },
            { brand: ['gromfaer', 'sspoisk'],                                  type: 'gamma', domain: 'www.gromfaer.top', name: 'Чарли',  domains: ['www.gromfaer.top', 'gromfaer.top', 'sspoisk.ru', 'www.sspoisk.ru'] }
        ],
        BTN_SIZE: 52,
        SETTINGS_BTN_SIZE: 36,
        PHONE_BTN_SIZE: 48,
        PHONE_SETTINGS_BTN_SIZE: 42,
        POSITIONS: {
            'left-top':      { left: true,  vertical: 'top' },
            'left-middle':   { left: true,  vertical: 'middle' },
            'left-bottom':   { left: true,  vertical: 'bottom' },
            'right-top':     { left: false, vertical: 'top' },
            'right-middle':  { left: false, vertical: 'middle' },
            'right-bottom':  { left: false, vertical: 'bottom' }
        },
        PHONE_POSITIONS: ['left-middle', 'right-middle', 'left-bottom', 'right-bottom'],
        DESKTOP_POSITIONS: ['left-top', 'left-middle', 'right-top', 'left-bottom', 'right-middle', 'right-bottom'],
        EMBED_SELECTOR: '.styles_buttonsContainer__DCKJk',
        FALLBACK_SELECTORS: [
            '[data-test-id="ContentActions"]',
            '[data-tid="ContentActions"]',
            '[data-test-id="ContentActionsTransition"]',
            '.film-header__buttons',
            '[class*="buttonsContainer"]',
            '[class*="Buttons_container"]',
            '[class*="actionButtons"]'
        ],

        AD_HOSTS: [
            'adlook.tv',
            'vak345.com',
            'moviead55.ru',
            'deltarockme.com',
            'myroledance.com',
            'beebounder.com',
            '101partners-stat2.com',
            'yandex.ru/ads/',
            'yastatic.net/safeframe-bundles/',
            'ads.adfox.ru',
            'counter.yadro.ru',
            'mradx.net',
            'rb-adman.com',
            'admanmedia.com',
            'getshop.tv'
        ],
        AD_DOM_PREFIXES: [
            'adLookPlayer-',
            'Adlk-',
            'GIzYQ', 'GAnOn', 'PBsBx', 'scQxl', 'irpcl',
            'ad-element'
        ],
        AD_SELECTORS: [
            '.adlook-pc-wrapper',
            '.adlook-mob-wrapper',
            '.adlk-sticky',
            '.adlk-content',
            '.adlk-player-host',
            '.adlk-creativePlayer',
            '#movie_video',
            '#tgWrapper',
            '#TopAdMb',
            '.topAdPad',
            '.adDown',
            '.brand',
            '#instructionModal',
            '.cIframeCover',
            'iframe[src*="moviead55"]',
            'iframe[src*="adlook"]',
            'iframe[src*="adlk"]',
            'ins.adsbygoogle',
            '[data-mds]',
            '[id^="ad-element"]',
            '[class^="rb-adman-"]',
            '[class*=" rb-adman-"]',
            '[src*="mradx.net"]',
            '[style*="r.mradx.net"]',
            '[class*="videoplayer_ads_skip"]'
        ],

        LIGHT: {
            EMBED_MAIN_COLOR: '#1a1a1a',
            EMBED_SETTINGS_COLOR: '#1a1a1a',
            EMBED_IDLE_BG: '#f2f2f2',
            HOVER_BG: '#e5e5e5',
            HOVER_TEXT_COLOR: '#1a1a1a',
            FIXED_TOP_COLOR: '#f0f0f5',
            FIXED_TOP_IDLE_BG: 'transparent',
            FIXED_TOP_HOVER_BG: '#e5e5e5',
            FIXED_TOP_HOVER_COLOR: '#1a1a1a',
            FIXED_MID_BOTTOM_IDLE_BG: '#f2f2f2',
            FIXED_MID_BOTTOM_COLOR: '#1a1a1a'
        },
        DARK: {
            EMBED_MAIN_COLOR: '#ffffff',
            EMBED_SETTINGS_COLOR: '#ffffff',
            EMBED_IDLE_BG: '#1d1d1d',
            HOVER_BG: '#272727',
            HOVER_TEXT_COLOR: '#ffffff',
            FIXED_TOP_COLOR: '#ffffff',
            FIXED_TOP_IDLE_BG: '#000000',
            FIXED_TOP_HOVER_BG: '#ffffff',
            FIXED_TOP_HOVER_COLOR: '#000000',
            FIXED_MID_BOTTOM_IDLE_BG: '#1d1d1d',
            FIXED_MID_BOTTOM_COLOR: '#ffffff'
        },
        PANEL_BG_LIGHT: '#f5f5f5',
        PANEL_BG_DARK: '#1f1f1f',
        PANEL_TEXT_LIGHT: '#1a1a1a',
        PANEL_TEXT_DARK: '#ffffff',
        PANEL_RADIUS: '20px',
        PANEL_PADDING: '6px 8px',
        PANEL_GAP: '6px',
        PANEL_MIN_WIDTH: '160px',
        PHONE_PANEL_WIDTH: '200px',
        PANEL_FONT_SIZE: '13px',
        PHONE_PANEL_FONT_SIZE: '14px',
        EMBED_TIMEOUT: 5000,
        KP_HOME_URL: 'https://www.kinopoisk.ru',
        GITHUB_URL: 'https://github.com/murckich/kinopoisk-free',
        UPDATE_URL: 'https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js',
        VERSION_JSON_URL: 'https://raw.githubusercontent.com/murckich/kinopoisk-free/main/version.json',
        UPDATE_CACHE_KEY: 'kpUpdateCache',
        OK_CACHE_TTL: 6 * 60 * 60 * 1000,
        NEW_CACHE_TTL: 20 * 60 * 1000,
        STALE_UI_THRESHOLD: 5 * 60 * 1000,
        AUTO_CHECK_BASE_INTERVAL: 15 * 60 * 1000,
        AUTO_CHECK_JITTER: 5 * 60 * 1000,
        AUTO_CHECK_INITIAL_DELAY_MS: 6000,
        AUTO_CHECK_INITIAL_JITTER_MS: 54000,
        ERROR_BACKOFF_MS: [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000],
        BUTTONS_GAP: '6px',
        SAVED_STORAGE_KEY: 'kpSavedMovies',
        SHARE_QUERY_KEY: 'kp-import',
        SHARE_HASH_PREFIX: 'kp-import=',
        POSTER_TEMPLATE: 'https://st.kp.yandex.net/images/film_iphone/iphone360_{id}.jpg',
        QR_SERVICE_URL: 'https://api.qrserver.com/v1/create-qr-code/',
        QR_MAX_LENGTH: 2900,
        SAVED_PANEL_WIDTH: '260px',
        PHONE_DELETE_ZONE_WIDTH: '35px',
        DESKTOP_DELETE_ZONE_WIDTH: '22px',
        THEME_CACHE_TTL: 1000,
        MOVIE_DATA_CACHE_TTL: 30000,
        CHANGELOG_MAX: 1000,
        COMMIT_CARD_HEIGHT_DESKTOP: '120px',
        COMMIT_CARD_HEIGHT_PHONE: '100px',
        GETINFO_URL: 'https://habster.sbs/getinfo.php',
        FILM_PARTS_URL: 'https://habster.sbs/film_parts.php',
        PARTS_CACHE_TTL: 24 * 60 * 60 * 1000,
        SIMPLIFIED_VIEW_KEY: 'kpSimplifiedView',
        MOVIE_DETAILS_CACHE_KEY: 'kpMovieDetailsCache',
        MOVIE_DETAILS_CACHE_TTL: 7 * 24 * 60 * 60 * 1000
    };

    const isTouchDevice = (() => {
        try { return window.matchMedia('(hover: none) and (pointer: coarse)').matches; }
        catch (e) { return 'ontouchstart' in window && window.innerWidth <= 1024; }
    })();
    const screenMin = Math.min(
        (window.screen && window.screen.width) || 0,
        (window.screen && window.screen.height) || 0
    );
    const isPhone = isTouchDevice && screenMin > 0 && screenMin <= 600;

    let _darkThemeCache = { value: null, ts: 0 };
    let _movieDataCache = { id: null, data: null, ts: 0 };
    let _updateState = 'idle';
    let _updateResult = null;
    let _lastCheckTs = 0;
    let _checkInFlight = false;
    let _checkTimer = null;
    let _consecutiveErrors = 0;
    let _visibilityListenerAttached = false;
    let _onlineListenerAttached = false;

    function injectStyleWhenHeadReady(id, css) {
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;

        const host = document.head || document.documentElement;
        if (host) {
            host.appendChild(style);
        } else {
            const rootObs = new MutationObserver(() => {
                if (document.documentElement) {
                    rootObs.disconnect();
                    document.documentElement.appendChild(style);
                }
            });
            rootObs.observe(document, { childList: true, subtree: true });
        }
    }

    function injectAdCleaner() {
        if (window.__kpAdCleanerDone) return;
        window.__kpAdCleanerDone = true;

        const hostRe = new RegExp(
            CONFIG.AD_HOSTS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
            'i'
        );

        const AD_ID_RE = /^[A-Za-z]{4,8}\d{10,}$/;

        const isAdUrl = (url) => {
            if (!url) return false;
            try { return hostRe.test(String(url)); } catch (e) { return false; }
        };

        const isAdElement = (el) => {
            if (!el || el.nodeType !== 1) return false;
            const id = el.id || '';
            const cls = (typeof el.className === 'string' ? el.className : '') || '';

            for (const p of CONFIG.AD_DOM_PREFIXES) {
                if (id.startsWith(p)) return true;
            }

            if (AD_ID_RE.test(id)) {
                const style = el.getAttribute('style') || '';
                if (/position\s*:\s*(fixed|absolute)/i.test(style) ||
                    el.hasAttribute('data-mds')) {
                    return true;
                }
            }

            if (el.hasAttribute && el.hasAttribute('data-mds')) return true;

            if (cls.includes('rb-adman') ||
                cls.includes('videoplayer_ads_skip') ||
                cls.includes('adman-')) return true;

            if (el.parentElement === document.documentElement &&
                el.tagName === 'DIV' && id && !id.startsWith('kp-')) {
                const style = el.getAttribute('style') || '';
                if (/position\s*:\s*(fixed|absolute)/i.test(style)) return true;
            }

            if (el.matches) {
                for (const sel of CONFIG.AD_SELECTORS) {
                    try { if (el.matches(sel)) return true; } catch (e) {}
                }
            }
            return false;
        };

        const deepQueryAll = (selector, root = document) => {
            const out = [];
            const walk = (node) => {
                if (!node) return;
                try {
                    node.querySelectorAll?.(selector).forEach(el => out.push(el));
                } catch (e) {}
                try {
                    node.querySelectorAll?.('*').forEach(el => {
                        if (el.shadowRoot) walk(el.shadowRoot);
                    });
                } catch (e) {}
                try {
                    node.querySelectorAll?.('iframe').forEach(f => {
                        try {
                            if (f.contentDocument) walk(f.contentDocument);
                        } catch (e) {}
                    });
                } catch (e) {}
            };
            walk(root);
            return out;
        };

        const css = `
            ${CONFIG.AD_SELECTORS.join(',')}{display:none!important;visibility:hidden!important}
            [id][style*="position: fixed"][style*="pointer-events: none"]{display:none!important}
            html > div[id]:not([id^="kp-"]) {
                visibility: hidden !important;
                pointer-events: none !important;
                content-visibility: hidden !important;
            }
        `;
        injectStyleWhenHeadReady('kp-ad-clean-style', css);

        const origAppend = Node.prototype.appendChild;
        Node.prototype.appendChild = function(node) {
            try {
                if (isAdElement(node)) return node;
                if (node && node.tagName &&
                    (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'IMG') &&
                    isAdUrl(node.getAttribute && node.getAttribute('src'))) {
                    return node;
                }
            } catch (e) {}
            return origAppend.call(this, node);
        };
        const origInsert = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function(node, ref) {
            try {
                if (isAdElement(node)) return node;
                if (node && node.tagName &&
                    (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'IMG') &&
                    isAdUrl(node.getAttribute && node.getAttribute('src'))) {
                    return node;
                }
            } catch (e) {}
            return origInsert.call(this, node, ref);
        };

        const origSetAttr = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (name === 'src' && isAdUrl(value)) return;
            return origSetAttr.call(this, name, value);
        };

        const origFetch = window.fetch;
        if (origFetch) {
            window.fetch = function(input) {
                const url = typeof input === 'string' ? input : (input && input.url) || '';
                if (isAdUrl(url)) return Promise.reject(new Error('kp-ad-cleaner'));
                return origFetch.apply(this, arguments);
            };
        }

        const origXOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (isAdUrl(url)) { this._kpBlocked = true; return; }
            return origXOpen.apply(this, arguments);
        };
        const origXSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            if (this._kpBlocked) return;
            return origXSend.apply(this, arguments);
        };

        const origOpenWin = window.open;
        window.open = function(url) {
            if (isAdUrl(url)) return null;
            return origOpenWin.apply(this, arguments);
        };

        const innerHTMLDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        if (innerHTMLDesc && innerHTMLDesc.set) {
            const adTagRe = /<(script|iframe|div|ins|img)\b[^>]*(?:adlook\.tv|vak345\.com|moviead55\.ru|deltarockme\.com|myroledance\.com|beebounder\.com|101partners-stat2\.com|ads\.adfox\.ru|yandex\.ru\/ads)[^>]*>(?:<\/\1>)?/gi;
            Object.defineProperty(Element.prototype, 'innerHTML', {
                get: innerHTMLDesc.get,
                set(html) {
                    if (typeof html === 'string' && adTagRe.test(html)) {
                        adTagRe.lastIndex = 0;
                        html = html.replace(adTagRe, '');
                    }
                    return innerHTMLDesc.set.call(this, html);
                },
                configurable: true
            });
        }

        const origInsertAdj = Element.prototype.insertAdjacentHTML;
        Element.prototype.insertAdjacentHTML = function(pos, html) {
            if (typeof html === 'string') {
                const adTagRe = /<(script|iframe|div|ins|img)\b[^>]*(?:adlook\.tv|vak345\.com|moviead55\.ru|deltarockme\.com|myroledance\.com|beebounder\.com|101partners-stat2\.com|ads\.adfox\.ru|yandex\.ru\/ads)[^>]*>(?:<\/\1>)?/gi;
                if (adTagRe.test(html)) {
                    adTagRe.lastIndex = 0;
                    html = html.replace(adTagRe, '');
                }
            }
            return origInsertAdj.call(this, pos, html);
        };

        try {
            const scriptSrcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
            if (scriptSrcDesc && scriptSrcDesc.set) {
                Object.defineProperty(HTMLScriptElement.prototype, 'src', {
                    get: scriptSrcDesc.get,
                    set(v) {
                        if (isAdUrl(v)) { try { this.remove(); } catch (e) {} return; }
                        return scriptSrcDesc.set.call(this, v);
                    },
                    configurable: true
                });
            }
            const iframeSrcDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
            if (iframeSrcDesc && iframeSrcDesc.set) {
                Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
                    get: iframeSrcDesc.get,
                    set(v) {
                        if (isAdUrl(v)) { try { this.remove(); } catch (e) {} return; }
                        return iframeSrcDesc.set.call(this, v);
                    },
                    configurable: true
                });
            }
        } catch (e) {}

        try {
            const origAttachShadow = Element.prototype.attachShadow;
            Element.prototype.attachShadow = function(init) {
                const result = origAttachShadow.call(this, init);
                try {
                    if (this.tagName === 'DIV' && this.id && AD_ID_RE.test(this.id) &&
                        !this.id.startsWith('kp-')) {
                        const style = this.getAttribute('style') || '';
                        if (/position\s*:\s*(fixed|absolute)/i.test(style)) {
                            setTimeout(() => { try { this.remove(); } catch(e) {} }, 0);
                        }
                    }
                } catch (e) {}
                return result;
            };
        } catch (e) {}

        document.addEventListener('click', (e) => {
            const t = e.target;
            if (t && t.classList && t.classList.contains('cIframeCover')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true);

        const cleanNode = (node) => {
            if (!node || node.nodeType !== 1) return;
            if (isAdElement(node)) { try { node.remove(); } catch (e) {} return; }
            if (node.tagName &&
                (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') &&
                isAdUrl(node.getAttribute('src'))) {
                try { node.remove(); } catch (e) {}
                return;
            }
            if (node.querySelectorAll) {
                try {
                    node.querySelectorAll(CONFIG.AD_SELECTORS.join(','))
                        .forEach(el => el.remove());
                } catch (e) {}
                node.querySelectorAll('iframe').forEach(f => {
                    if (isAdUrl(f.getAttribute('src'))) f.remove();
                    if (f.hasAttribute('data-covered')) f.removeAttribute('data-covered');
                });
                node.querySelectorAll('div[id]').forEach(d => {
                    if (AD_ID_RE.test(d.id)) {
                        const style = d.getAttribute('style') || '';
                        if (/position\s*:\s*(fixed|absolute)/i.test(style) ||
                            d.hasAttribute('data-mds')) {
                            d.remove();
                        }
                    }
                });
            }
        };

        const obs = new MutationObserver((muts) => {
            for (const m of muts) {
                if (m.type === 'childList') {
                    m.addedNodes.forEach(cleanNode);
                } else if (m.type === 'attributes' && m.target) {
                    const t = m.target;
                    if (t.tagName &&
                        (t.tagName === 'SCRIPT' || t.tagName === 'IFRAME') &&
                        isAdUrl(t.getAttribute('src'))) {
                        t.remove();
                    }
                    if (t.tagName === 'DIV' && t.id && AD_ID_RE.test(t.id)) {
                        const style = t.getAttribute('style') || '';
                        if (/position\s*:\s*(fixed|absolute)/i.test(style)) t.remove();
                    }
                }
            }
        });

        const startObserver = () => {
            obs.observe(document.documentElement, {
                childList: true, subtree: true,
                attributes: true, attributeFilter: ['src', 'id', 'style']
            });
            try {
                deepQueryAll(CONFIG.AD_SELECTORS.join(','))
                    .forEach(el => el.remove());
                deepQueryAll('div[id]').forEach(d => {
                    if (AD_ID_RE.test(d.id)) {
                        const style = d.getAttribute('style') || '';
                        if (/position\s*:\s*(fixed|absolute)/i.test(style) ||
                            d.hasAttribute('data-mds')) d.remove();
                    }
                });
            } catch (e) {}
            document.querySelectorAll('iframe').forEach(f => {
                if (isAdUrl(f.getAttribute('src'))) f.remove();
                if (f.hasAttribute('data-covered')) f.removeAttribute('data-covered');
            });
        };

        if (document.documentElement) startObserver();
        else {
            const htmlObs = new MutationObserver(() => {
                if (document.documentElement) {
                    htmlObs.disconnect();
                    startObserver();
                }
            });
            htmlObs.observe(document, { childList: true, subtree: true });
            document.addEventListener('DOMContentLoaded', () => {
                if (document.documentElement) startObserver();
            }, { once: true });
        }

        let rafCount = 0;
        const MAX_RAF = 300;
        const rafSweep = () => {
            if (rafCount++ > MAX_RAF) return;
            try {
                deepQueryAll('html > div[id], div[id]').forEach(d => {
                    if (d.id.startsWith('kp-')) return;
                    const style = d.getAttribute('style') || '';
                    const isFixed = /position\s*:\s*(fixed|absolute)/i.test(style);
                    if ((AD_ID_RE.test(d.id) || d.hasAttribute('data-mds')) && isFixed) {
                        d.remove();
                    }
                });
            } catch (e) {}
            requestAnimationFrame(rafSweep);
        };
        requestAnimationFrame(rafSweep);

        setInterval(() => {
            try {
                document.querySelectorAll(CONFIG.AD_SELECTORS.join(','))
                    .forEach(el => el.remove());
                document.querySelectorAll('html > div[id], body > div[id], body > div > div[id]')
                    .forEach(d => {
                        if (d.id.startsWith('kp-')) return;
                        const style = d.getAttribute('style') || '';
                        const isFixed = /position\s*:\s*(fixed|absolute)/i.test(style);
                        if ((AD_ID_RE.test(d.id) || d.hasAttribute('data-mds')) && isFixed) {
                            d.remove();
                        }
                    });
            } catch (e) {}
        }, 2000);
    }

    function isDarkTheme() {
        if (isPhone) return (settings.phoneTheme || 'dark') === 'dark';

        if (matchChannelDomain(window.location.hostname)) {
            return true;
        }

        const now = Date.now();
        if (_darkThemeCache.value !== null && (now - _darkThemeCache.ts) < CONFIG.THEME_CACHE_TTL) {
            return _darkThemeCache.value;
        }

        let result;
        const darkBtn = document.querySelector('button[class*="style_buttonDark__"]');
        if (darkBtn && darkBtn.offsetParent !== null) {
            result = true;
        } else {
            const lightBtn = document.querySelector('button[class*="style_buttonLight__"]');
            if (lightBtn && lightBtn.offsetParent !== null) {
                result = false;
            } else {
                result = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        }

        _darkThemeCache = { value: result, ts: now };
        return result;
    }

    function invalidateThemeCache() {
        _darkThemeCache = { value: null, ts: 0 };
    }

    function getThemeColors() {
        return isDarkTheme() ? CONFIG.DARK : CONFIG.LIGHT;
    }

    function getPanelBackground() {
        return isDarkTheme() ? CONFIG.PANEL_BG_DARK : CONFIG.PANEL_BG_LIGHT;
    }

    function getPanelTextColor() {
        return isDarkTheme() ? CONFIG.PANEL_TEXT_DARK : CONFIG.PANEL_TEXT_LIGHT;
    }

    function getPanelFontSize() {
        return isPhone ? CONFIG.PHONE_PANEL_FONT_SIZE : CONFIG.PANEL_FONT_SIZE;
    }

    function applyThemeInPlace() {
        const colors = getThemeColors();
        const bgColor = getPanelBackground();
        const textColor = getPanelTextColor();

        const mainBtn = document.getElementById('kp-redirect-btn');
        if (mainBtn) {
            const isTop = settings.btnVertical === 'top';
            let mainIdleBg, mainColor, mainHoverBg, mainHoverColor;
            if (isTop) {
                mainIdleBg = colors.FIXED_TOP_IDLE_BG;
                mainColor = colors.FIXED_TOP_COLOR;
                mainHoverBg = colors.FIXED_TOP_HOVER_BG;
                mainHoverColor = colors.FIXED_TOP_HOVER_COLOR;
            } else {
                mainIdleBg = colors.FIXED_MID_BOTTOM_IDLE_BG;
                mainColor = colors.FIXED_MID_BOTTOM_COLOR;
                mainHoverBg = colors.HOVER_BG;
                mainHoverColor = colors.HOVER_TEXT_COLOR;
            }
            mainBtn._idleBg = mainIdleBg;
            mainBtn._baseColor = mainColor;
            mainBtn._hoverBg = mainHoverBg;
            mainBtn._hoverTextColor = mainHoverColor;
            mainBtn.style.background = mainIdleBg;
            mainBtn.style.color = mainColor;
        }

        const settingsBtn = document.getElementById('kp-settings-btn');
        const saveBtn = document.getElementById('kp-save-btn');
        [settingsBtn, saveBtn].forEach(btn => {
            if (!btn) return;
            btn._idleBg = colors.EMBED_IDLE_BG;
            btn._baseColor = colors.EMBED_SETTINGS_COLOR;
            btn._hoverBg = colors.HOVER_BG;
            btn._hoverTextColor = colors.HOVER_TEXT_COLOR;
            btn.style.background = colors.EMBED_IDLE_BG;
            btn.style.color = colors.EMBED_SETTINGS_COLOR;
        });

        const panel = document.getElementById('kp-settings-panel');
        if (panel) {
            panel.style.background = bgColor;
            panel.style.color = textColor;
            panel.querySelectorAll('.kp-icon-btn').forEach(btn => btn.style.color = textColor);
            panel.querySelectorAll('a[href="' + CONFIG.GITHUB_URL + '"]').forEach(a => a.style.color = textColor);
            const channelMenu = panel.querySelector('#kp-channel-dd-menu');
            if (channelMenu) channelMenu.style.background = bgColor;
            const posMenu = panel.querySelector('#kp-pos-dd-menu');
            if (posMenu) posMenu.style.background = bgColor;
            const updateView = panel.querySelector('#kp-update-view');
            if (updateView && updateView.style.display !== 'none') renderUpdateView(_updateState);
        }

        const savedPanel = document.getElementById('kp-saved-panel');
        if (savedPanel) {
            savedPanel.dataset.theme = isDarkTheme() ? 'dark' : 'light';
        }
    }

    function getChannelByHostname(hostname) {
        if (!hostname) return null;
        const h = String(hostname).toLowerCase();

        for (const ch of CONFIG.CHANNELS) {
            if (ch.domains && ch.domains.some(d => h === d || h.endsWith('.' + d))) {
                return ch;
            }
        }

        for (const ch of CONFIG.CHANNELS) {
            const brands = Array.isArray(ch.brand) ? ch.brand : (ch.brand ? [ch.brand] : []);
            for (const b of brands) {
                if (h === b || h.startsWith(b + '.') || h.includes('.' + b + '.')) {
                    return ch;
                }
            }
        }

        if (/(^|\.)kinopoisk\.(?!ru([/.]|$)|film([/.]|$))/.test(h)) {
            return CONFIG.CHANNELS.find(c => c.type === 'bravo') || null;
        }

        return null;
    }

    function matchChannelDomain(hostname) {
        return !!getChannelByHostname(hostname);
    }

    const host = window.location.hostname;
    const isBlockedPage = /^\/blocked\.html(\/|$)/.test(window.location.pathname);
    const isHabster = /(^|\.)habster\./.test(host);
    const isRebuildMirror = matchChannelDomain(host) && !isHabster;

    // ── Убиваем render-blocking CSS на rebuild-зеркалах ──
    // Эти файлы тормозят отрисовку страницы (белый экран 19с).
    // Удаляем <link> из DOM как можно раньше, чтобы браузер не блокировал пейнт.
    if (isRebuildMirror) {
        (function killBlockingCss() {
            const re = /\/kinobox\/kinobox\.css(\?|$)|\/modalinst\.css(\?|$)/i;

            const kill = (el) => {
                if (!el || el.nodeType !== 1) return;
                if (el.tagName !== 'LINK') return;
                const href = el.getAttribute('href') || '';
                if (!re.test(href)) return;
                // Сначала делаем non-render-blocking
                try { el.setAttribute('media', 'not all'); } catch (e) {}
                // Потом удаляем из DOM (снимает блокировку пейнта)
                try { el.remove(); } catch (e) {}
            };

            const scan = (root) => {
                if (!root || root.nodeType !== 1) return;
                if (root.tagName === 'LINK') kill(root);
                try { root.querySelectorAll && root.querySelectorAll('link').forEach(kill); } catch (e) {}
            };

            // На случай, если что-то уже успело появиться до нас
            scan(document);
            scan(document.documentElement);

            // Повторные проходы — страховка от гонки на старте.
            // Если скрипт запустился ПОЗЖЕ, чем браузер увидел <link>,
            // MutationObserver уже не поможет — но повторный scan закроет дыру.
            let _scanAttempts = 0;
            const _scanTick = () => {
                if (_scanAttempts++ > 20) return;      // ~2 секунды суммарно
                scan(document);
                requestAnimationFrame(_scanTick);
            };
            requestAnimationFrame(_scanTick);

            // Плюс финальная зачистка через DOMContentLoaded — самая надёжная точка
            document.addEventListener('DOMContentLoaded', () => {
                scan(document);
                // И ещё раз через 100мс, если что-то доехало позже
                setTimeout(() => scan(document), 100);
            }, { once: true });

            // И по полной загрузке окна — на всякий случай
            window.addEventListener('load', () => scan(document), { once: true });

            // Ловим всё новое — как только HTML-парсер добавит <link>
            try {
                new MutationObserver((muts) => {
                    for (const m of muts) {
                        if (m.type === 'childList') {
                            m.addedNodes.forEach(scan);
                        } else if (m.type === 'attributes' && m.target) {
                            kill(m.target);
                        }
                    }
                }).observe(document, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['href', 'media']
                });
            } catch (e) {}
        })();
    }

    if (matchChannelDomain(host)) {
        try { injectAdCleaner(); } catch (e) { console.warn('kp-ad-cleaner:', e); }
    }

    if (isRebuildMirror || isBlockedPage) {
        const earlyCss = 'html, body { visibility: hidden !important; background-color: #0b0d14 !important; }';

        const applyEarlyHide = () => {
            if (!document.getElementById('kp-hide-body-early')) {
                const style = document.createElement('style');
                style.id = 'kp-hide-body-early';
                style.textContent = earlyCss;
                const host = document.head || document.documentElement;
                if (host) host.insertBefore(style, host.firstChild);
            }
            if (document.documentElement) {
                document.documentElement.style.setProperty('visibility', 'hidden', 'important');
                document.documentElement.style.setProperty('background-color', '#0b0d14', 'important');
            }
            if (document.body) {
                document.body.style.setProperty('visibility', 'hidden', 'important');
                document.body.style.setProperty('background-color', '#0b0d14', 'important');
            }
        };

        applyEarlyHide();

        (function watchdog() {
            if (window.__kpBodyReady) return;
            applyEarlyHide();
            requestAnimationFrame(watchdog);
        })();
    }

    function getEarlyCleanCSS() {
        const h = window.location.hostname;
        const rules = [];

        if (/(^|\.)habster\./.test(h)) {
            rules.push('.domain-notice,.header,.tg-banner,#unreleased-notice,ins,.share-bar,.footer,.info-tabs-bar,#panel-comments,.cw,#rkn-stub,#tgMain,img[src*="tgimg.png"]');
            if (!isBlockedPage) {
                rules.push('.support-fab, #new-release-notice, #trending-block, .info-section');
            }
        }
        else if (/(^|\.)(nonchik|troutcdn)\./.test(h)) {
            rules.push('.site-header,.social,.footer,.disclaimer,.spacer-md,#movie_video,#name,.h2');
        }
        else if (/(^|\.)kinopoisk\.(ws|me|tv|online|site|xyz|net|org|web|club|space|live|pro|io|co|su|fun|art|store|shop|app|dev|cc|top|life)([/.]|$)/.test(h) &&
                 !/(^|\.)kinopoisk\.(film|ru)/.test(h)) {
            rules.push('.site-header,.social,.footer,.disclaimer,.spacer-md,#movie_video,#name,.h2');
        }
        else if (/(^|\.)(fbfind|brogiro|kinokino|villybizy|flcksbr|gromfaer|sspoisk)\./.test(h)) {
            rules.push('#tgWrapper, .brand, .topAdPad, #TopAdMb, .adDown, #instructionModal, #tgMain, img[src*="tgimg.png"]');
        }

        return rules.map(selector => selector + '{display:none!important}').join(' ');
    }

    function injectEarlyCleanCSS() {
        const css = getEarlyCleanCSS();
        if (css) injectStyleWhenHeadReady('kp-early-clean', css);
        if (isRebuildMirror) {
            const hideTgMain = () => {
                const el = document.getElementById('tgMain');
                if (el) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                }
                document.querySelectorAll('img[src*="tgimg.png"]').forEach(img => {
                    img.style.setProperty('display', 'none', 'important');
                    img.style.setProperty('visibility', 'hidden', 'important');
                });
            };
            hideTgMain();
            let tgTimer = null;
            new MutationObserver(() => {
                if (tgTimer) clearTimeout(tgTimer);
                tgTimer = setTimeout(hideTgMain, 100);
            }).observe(document.documentElement, { childList: true, subtree: true });
        }
    }
    injectEarlyCleanCSS();

    function showBody() {
        window.__kpBodyReady = true;
        if (document.documentElement) {
            document.documentElement.style.removeProperty('visibility');
            document.documentElement.style.removeProperty('background-color');
        }
        if (document.body) {
            document.body.style.removeProperty('visibility');
            document.body.style.removeProperty('background-color');
        }
        ['kp-hide-body-early', 'kp-base-bg-mirror', 'kp-base-bg', 'kp-hide-body'].forEach(
            id => document.getElementById(id)?.remove()
        );
    }

    function releaseBodyForSimpleMirrors() {
        if (isBlockedPage) return;
        if (isHabster) showBody();
        else if (!isRebuildMirror && matchChannelDomain(host)) showBody();
    }
    releaseBodyForSimpleMirrors();

    try { localStorage.removeItem('kpPartsCache'); } catch (e) {}

    const ALFA_STYLES_GAMMA_TANGO = `
        :root {
            --bg: #0b0d14; --bg-card: #131620; --bg-elev: #1a1e2e;
            --accent: #818cf8; --accent-g: rgba(99,102,241,0.18);
            --text: #e2e8f0; --muted: #94a3b8; --dim: #64748b;
            --border: #1e2235; --radius: 14px; --gold: #fbbf24;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            background: var(--bg) !important;
            color: var(--text);
            font-family: system-ui, sans-serif;
            margin: 0;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            height: auto !important;
            min-height: 100% !important;
        }
        body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0); background-size: 30px 30px; pointer-events: none; z-index: 0; }
        #kp-alfa-page { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 1.25rem; }
        .player-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; margin-bottom: 1.25rem; }
        .player-top-bar { display: flex; align-items: center; padding: 0.75rem 0.85rem 0; position: relative; z-index: 10; gap: 1rem; }
        .kp-select { position: relative; }
        .kp-select-trigger { display: flex; align-items: center; gap: 0.5rem; padding: 0.42rem 0.75rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 9px; cursor: pointer; font-size: 0.84rem; font-weight: 500; color: var(--text); user-select: none; transition: border-color 0.15s; }
        .kp-select-trigger:hover { border-color: rgba(99,102,241,0.5); }
        .kp-select.open .kp-select-trigger { border-color: var(--accent); background: rgba(99,102,241,0.07); }
        .kp-select-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 6px var(--accent); }
        .kp-select-chevron { color: var(--dim); transition: transform 0.2s; }
        .kp-select.open .kp-select-chevron { transform: rotate(180deg); }
        .kp-select-menu { position: absolute; top: calc(100% + 6px); left: 0; min-width: 190px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px; padding: 0.3rem; z-index: 100; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .kp-select.open .kp-select-menu { display: block; }
        .kp-select-item { display: flex; align-items: center; gap: 0.55rem; padding: 0.5rem 0.65rem; border-radius: 7px; cursor: pointer; font-size: 0.84rem; color: var(--muted); transition: background 0.12s, color 0.12s; }
        .kp-select-item:hover { background: var(--bg-elev); color: var(--text); }
        .kp-select-item.active { color: var(--accent); background: rgba(99,102,241,0.1); }
        .kp-select-num { width: 1.55rem; height: 1.55rem; border-radius: 6px; background: rgba(99,102,241,0.15); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.73rem; font-weight: 700; }
        .kp-select-item.active .kp-select-num { background: rgba(99,102,241,0.3); }
        .vpn-warning { font-size: 0.75rem; color: var(--dim); display: flex; align-items: center; gap: 0.3rem; padding: 0.45rem 0.75rem 0.6rem; }
        .player-wrap { position: relative; margin: 0.75rem; border-radius: 0 0 14px 14px; overflow: hidden; z-index: 1; }
        .kinobox_iframe_container, .kinobox__iframeWrapper { position: relative; padding-top: 56.25% !important; }
        .kinobox_iframe, .kinobox__iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; border-radius: 12px; background: #000; }
        .movie-info { padding: 1.5rem; }
        .movie-info-inner { display: flex; gap: 1.5rem; align-items: flex-start; }
        .movie-poster-wrap { flex-shrink: 0; width: 130px; }
        .movie-poster-img { width: 100%; border-radius: 10px; display: block; background: var(--bg-elev); }
        .movie-details { flex: 1; min-width: 0; }
        .movie-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.2rem; line-height: 1.25; }
        .movie-orig { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.9rem; }
        .movie-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .meta-tag { font-size: 0.78rem; padding: 0.22rem 0.65rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 20px; color: var(--muted); }
        .meta-tag.gold { color: var(--gold); border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.08); }
        .meta-tag.kp { color: var(--accent); border-color: rgba(99,102,241,0.3); background: var(--accent-g); }
        .movie-rows { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .movie-row { font-size: 0.85rem; }
        .movie-row-label { color: var(--dim); }
        .movie-row-val { color: var(--text); }
        .movie-desc { font-size: 0.88rem; color: var(--muted); line-height: 1.65; border-top: 1px solid var(--border); padding-top: 0.9rem; margin-top: 1rem; }
        @media (max-width: 600px) {
            .movie-info { padding: 1rem; }
            .movie-info-inner { gap: 0.85rem; }
            .movie-poster-wrap { width: 100px; }
            .movie-title { font-size: 1.1rem; }
            .movie-orig { font-size: 0.8rem; margin-bottom: 0.6rem; }
            .movie-meta { gap: 0.35rem; margin-bottom: 0.75rem; }
            .meta-tag { font-size: 0.7rem; padding: 0.18rem 0.5rem; }
            .movie-rows { gap: 0.25rem; margin-bottom: 0.5rem; }
            .movie-row { font-size: 0.78rem; }
            .movie-desc { font-size: 0.82rem; line-height: 1.55; margin-top: 0.85rem; padding-top: 0.75rem; }
        }
        .kinobox_loader, .kinobox_menu_button, .kbt_select, .kbt_button, .kinobox__loaderWrapper, .kinobox__loader { display: none !important; }
        .kp-torrent-btn { display: inline-flex; align-items: center; padding: 0.42rem 0.85rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 9px; color: var(--accent); font-size: 0.84rem; text-decoration: none; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
        .kp-torrent-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: var(--text); }

        .parts-block { display: none; padding: 1.25rem; border-top: 1px solid var(--border); }
        .parts-block.visible { display: block; }
        .parts-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.85rem; }
        .parts-strip { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.3rem; scrollbar-width: thin; }
        .parts-card { flex: 0 0 auto; width: 108px; text-decoration: none; color: var(--text); display: flex; flex-direction: column; gap: 0.4rem; }
        .parts-poster-wrap { position: relative; width: 108px; height: 156px; border-radius: 10px; overflow: hidden; background: var(--bg-elev); border: 1px solid var(--border); }
        .parts-card.current .parts-poster-wrap { border: 2px solid var(--accent); }
        .parts-poster-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .parts-badge { position: absolute; top: 6px; right: 6px; background: var(--accent); color: #fff; font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 6px; }
        .parts-year { font-size: 0.72rem; color: var(--dim); }
        .parts-name { font-size: 0.78rem; line-height: 1.3; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .parts-card.current .parts-name { color: var(--accent); font-weight: 600; }

        .view-toggle-wrap { display: contents; }
        .view-toggle {
            position: fixed;
            top: calc(58px + 0.75rem);
            right: 0.75rem;
            z-index: 550;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 0.4rem 0.65rem 0.4rem 0.85rem;
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            transition: top 0.2s;
        }
        .view-toggle-text { display: flex; flex-direction: column; gap: 0.15rem; flex: 1 1 auto; min-width: 0; }
        .view-toggle-label { font-size: 0.72rem; color: var(--muted); font-weight: 500; white-space: nowrap; }
        .view-toggle-desc { display: none; font-size: 0.68rem; color: var(--dim); font-weight: 400; line-height: 1.35; }
        body.simplified-view .view-toggle-desc { display: block; }
        .view-toggle-switch { position: relative; width: 34px; height: 19px; flex-shrink: 0; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 999px; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
        .view-toggle-switch.on { background: var(--accent); border-color: var(--accent); }
        .view-toggle-knob { position: absolute; top: 1px; left: 1px; width: 15px; height: 15px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .view-toggle-switch.on .view-toggle-knob { transform: translateX(15px); }
        @media (max-width: 560px) { .view-toggle { top: calc(58px + 0.5rem); right: 0.5rem; padding: 0.35rem 0.55rem 0.35rem 0.7rem; } .view-toggle-label { font-size: 0.66rem; } }

        body.simplified-view { overflow-y: auto !important; overflow-x: hidden !important; height: auto !important; min-height: 100vh !important; }
        body.simplified-view #kp-alfa-page {
            max-width: 100%;
            margin: 0;
            padding: 0.5rem;
            padding-bottom: 2rem;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 0.5rem;
            box-sizing: border-box;
        }
        body.simplified-view #kp-alfa-page .movie-info,
        body.simplified-view #kp-alfa-page .parts-block,
        body.simplified-view #kp-alfa-page #kp-movie-info,
        body.simplified-view #kp-alfa-page #parts-block { display: none !important; }
        body.simplified-view #kp-alfa-page .player-section { margin: 0 !important; flex-shrink: 0; }
        body.simplified-view #kp-alfa-page::after {
            content: "";
            display: block;
            width: 100%;
            height: 400px;
            flex-shrink: 0;
        }
        body.simplified-view .view-toggle-wrap { display: block; margin-bottom: 0.5rem; }
        body.simplified-view .view-toggle {
            position: static;
            top: auto;
            right: auto;
            width: 100%;
            padding: 0.85rem 1rem;
            border-radius: 14px;
            border-color: var(--accent);
            background: linear-gradient(135deg, rgba(99,102,241,0.16), rgba(124,58,237,0.1));
            box-shadow: 0 6px 20px rgba(99,102,241,0.18);
            box-sizing: border-box;
        }
        body.simplified-view .view-toggle-label { font-size: 0.9rem; color: var(--text); font-weight: 600; }
        body.simplified-view .view-toggle-switch { width: 42px; height: 24px; }
        body.simplified-view .view-toggle-knob { width: 19px; height: 19px; }
        body.simplified-view .view-toggle-switch.on .view-toggle-knob { transform: translateX(18px); }
    `;

    const BLOCKED_PAGE_STYLES = `
        :root { --bg: #0b0d14; --panel: #131620; --panel-soft: #1a1e2e; --border: #1e2235; --text: #e2e8f0; --muted: #94a3b8; --link: #818cf8; --radius: 18px; }
        body { background: var(--bg) !important; color: var(--text) !important; font-family: system-ui, sans-serif !important; overflow-y: auto !important; margin: 0 !important; visibility: visible !important; }
        body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0); background-size: 30px 30px; pointer-events: none; z-index: 0; }
        .page { position: relative; z-index: 1; height: auto !important; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.25rem !important; background: transparent !important; }
        .shell { max-width: 600px !important; width: 100% !important; background: var(--panel) !important; border-radius: var(--radius) !important; border: none !important; box-shadow: none !important; overflow: hidden !important; }
        .topbar { background: var(--panel-soft) !important; border-bottom: 1px solid var(--border) !important; padding: 0.75rem 1.5rem !important; font-weight: 600 !important; font-size: 1.1rem !important; color: #818cf8 !important; }
        .content { padding: 1.5rem !important; gap: 1rem !important; }
        h1 { font-size: 1.5rem !important; font-weight: 700 !important; margin: 0 0 0.5rem 0 !important; color: var(--text) !important; }
        .text { background: rgba(99,102,241,0.05) !important; border: 1px solid rgba(99,102,241,0.15) !important; border-radius: 12px !important; padding: 1.25rem !important; font-size: 0.9rem !important; line-height: 1.6 !important; color: var(--muted) !important; }
        .text b { color: var(--text) !important; font-weight: 600 !important; }
        footer { background: var(--panel-soft) !important; border-top: 1px solid var(--border) !important; padding: 0.75rem 1.5rem !important; display: flex !important; justify-content: center !important; }
        .footer-links { display: flex !important; align-items: center !important; gap: 1rem !important; font-size: 0.85rem !important; }
        .kp-home-btn { color: var(--link) !important; text-decoration: none !important; font-weight: 600 !important; background: none !important; border: none !important; padding: 0 !important; font: inherit !important; cursor: pointer !important; }
        .kp-home-btn:hover { text-decoration: underline !important; }
        #licntBF6C, span[style="display: none;"] { display: none !important; }
    `;

    const SETTINGS_PANEL_STYLES = `
        .kp-icon-btn { background: none; border: none; color: inherit; line-height: 1; padding: 2px 4px; cursor: pointer; opacity: 0.65; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease; transform: scale(1); transform-origin: center center; will-change: transform; backface-visibility: hidden; -webkit-font-smoothing: antialiased; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        .kp-icon-btn svg { display: block; }
        .kp-icon-btn:hover { opacity: 1; transform: scale(1.15); }
        .kp-icon-btn.kp-has-update { color: #fbbf24 !important; opacity: 1 !important; }
        #kp-settings-btn { position: relative; }
        #kp-settings-btn.kp-has-update::after { content: ''; position: absolute; top: 3px; right: 3px; width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 5px rgba(251,191,36,0.8); pointer-events: none; z-index: 2; animation: kp-dot-pulse 2.4s ease-in-out infinite; }
        @keyframes kp-dot-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: 0.7; } }
        @keyframes kp-icon-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        #kp-update-open-btn.kp-has-update svg { animation: kp-icon-pulse 1.8s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

        .kp-theme-toggle { background: none; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; outline: none; }
        .kp-theme-toggle-track { position: relative; display: inline-flex; align-items: center; justify-content: space-between; width: 44px; height: 24px; border-radius: 12px; background: rgba(127,127,127,0.25); padding: 2px; box-sizing: border-box; transition: background 0.25s ease; }
        .kp-theme-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.35); transition: transform 0.25s ease; z-index: 2; }
        .kp-theme-toggle[data-theme="light"] .kp-theme-toggle-thumb { transform: translateX(20px); }
        .kp-theme-toggle[data-theme="dark"] .kp-theme-toggle-thumb { transform: translateX(0); }
        .kp-theme-toggle-icon { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; color: rgba(127,127,127,0.85); transition: color 0.25s ease; }
        .kp-theme-toggle[data-theme="dark"] .kp-theme-icon-moon { color: #fbbf24; }
        .kp-theme-toggle[data-theme="light"] .kp-theme-icon-sun { color: #f59e0b; }

        .kp-embed-toggle { background: none; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; outline: none; }
        .kp-embed-toggle-track { position: relative; display: inline-block; width: 44px; height: 24px; border-radius: 12px; background: rgba(127,127,127,0.25); transition: background 0.25s ease; }
        .kp-embed-toggle[data-state="on"] .kp-embed-toggle-track { background: #427552; }
        .kp-embed-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.35); transition: transform 0.25s ease; }
        .kp-embed-toggle[data-state="on"] .kp-embed-toggle-thumb { transform: translateX(20px); }

        .kp-dd-channel, .kp-dd-pos { position: relative; display: inline-flex; align-items: center; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
        .kp-dd-channel-trigger, .kp-dd-pos-trigger { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(127,127,127,0.12); border: 1px solid rgba(127,127,127,0.25); border-radius: 20px; color: inherit; transition: border-color 0.15s, background 0.15s; font-size: inherit; }
        .kp-dd-channel:hover .kp-dd-channel-trigger, .kp-dd-pos:hover .kp-dd-pos-trigger { border-color: rgba(99,102,241,0.5); }
        .kp-dd-channel.open .kp-dd-channel-trigger, .kp-dd-pos.open .kp-dd-pos-trigger { border-color: #818cf8; background: rgba(99,102,241,0.1); }
        .kp-dd-channel-chev, .kp-dd-pos-chev { opacity: 0.55; transition: transform 0.2s; display: block; }
        .kp-dd-channel.open .kp-dd-channel-chev, .kp-dd-pos.open .kp-dd-pos-chev { transform: rotate(180deg); }
        .kp-dd-channel-menu, .kp-dd-pos-menu { position: absolute; top: calc(100% + 4px); right: 0; border-radius: 12px; padding: 4px; display: none; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 1px solid rgba(127,127,127,0.25); }
        .kp-dd-channel-menu { min-width: 100%; white-space: nowrap; }
        .kp-dd-pos-menu { gap: 2px; }
        .kp-dd-channel.open .kp-dd-channel-menu { display: block; }
        .kp-dd-pos.open .kp-dd-pos-menu { display: grid; }
        .kp-dd-channel-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; cursor: pointer; color: inherit; font-size: inherit; transition: background 0.12s, color 0.12s; }
        .kp-dd-channel-item:hover { background: rgba(127,127,127,0.15); }
        .kp-dd-channel-item.active { background: rgba(99,102,241,0.15); color: #818cf8; }
        .kp-dd-pos-icon { display: inline-flex; align-items: center; justify-content: center; }
        .kp-dd-pos-icon svg { display: block; }
        .kp-dd-pos-item { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; color: inherit; opacity: 0.55; transition: background 0.12s, opacity 0.12s, color 0.12s; }
        .kp-dd-pos-item:hover { background: rgba(127,127,127,0.15); opacity: 1; }
        .kp-dd-pos-item.active { background: rgba(99,102,241,0.15); color: #818cf8; opacity: 1; }
        .kp-dd-pos-item svg { display: block; }

        .kp-update-icon { display: flex; align-items: center; justify-content: center; line-height: 1; color: #818cf8; margin: 2px 0 0; transition: color 0.3s; }
        .kp-update-icon svg { display: block; }
        .kp-update-icon.ok { color: #6ee7a7; }
        .kp-update-icon.new { color: #fbbf24; }
        .kp-update-icon.err { color: #ff8888; }
        .kp-update-icon.spin { animation: kp-rotate 1.2s linear infinite; }
        @keyframes kp-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .kp-update-title { text-align: center; font-size: 14px; font-weight: 600; line-height: 1.3; margin-top: 2px; }
        .kp-update-title.ok { color: #6ee7a7; }
        .kp-update-title.new { color: #fbbf24; }
        .kp-update-title.err { color: #ff8888; }
        .kp-update-versions { text-align: center; font-size: 12px; line-height: 1.55; color: #94a3b8; font-weight: 500; margin-top: 4px; margin-bottom: 2px; }
        .kp-update-versions .line { display: block; white-space: nowrap; }
        .kp-update-versions .old { color: #94a3b8; }
        .kp-update-versions .new { color: #fbbf24; }
        .kp-update-versions .arrow { color: #818cf8; margin: 0 5px; font-size: 12px; }
        .kp-update-versions .val { color: inherit; }
        .kp-update-versions .val.ok { color: #6ee7a7; }
        .kp-commit-card { display: none; flex-direction: column; background: rgba(127,127,127,0.08); border: 1px solid rgba(127,127,127,0.18); border-radius: 12px; padding: 6px 10px; font-size: 11px; line-height: 1.4; color: inherit; overflow: hidden; }
        .kp-commit-card.visible { display: flex; }
        .kp-commit-header { font-size: 12px; font-weight: 600; color: inherit; margin-bottom: 3px; padding-bottom: 3px; border-bottom: 1px solid rgba(127,127,127,0.15); letter-spacing: 0.1px; flex-shrink: 0; }
        .kp-commit-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: rgba(127,127,127,0.3) transparent; }
        .kp-commit-scroll::-webkit-scrollbar { width: 4px; }
        .kp-commit-scroll::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.3); border-radius: 2px; }
        .kp-commit-text { color: #94a3b8; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; }
        .kp-update-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .kp-update-actions .kp-btn-primary { background: #427552; border: none; color: #fff; padding: 8px 0; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 13px; font-family: inherit; transition: opacity 0.15s; width: 100%; }
        .kp-update-actions .kp-btn-primary:hover { opacity: 0.9; }
        .kp-update-actions .kp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .kp-update-actions .kp-btn-primary.warn { background: #c47d2a; }

        .kp-saved-panel {
            --kp-bg: #f5f5f5; --kp-text: #1a1a1a; --kp-border: rgba(0,0,0,0.1);
            --kp-tab-bg: rgba(0,0,0,0.05); --kp-tab-border: rgba(0,0,0,0.1); --kp-tab-color: rgba(0,0,0,0.7);
            --kp-tab-active-bg: rgba(99,102,241,0.15); --kp-tab-active-border: #6366f1; --kp-tab-active-color: #4f46e5;
            --kp-action-bg: rgba(255,255,255,0.75); --kp-action-border: rgba(0,0,0,0.1); --kp-action-color: rgba(0,0,0,0.75);
            --kp-action-hover-bg: rgba(99,102,241,0.15); --kp-action-hover-color: #4f46e5;
            --kp-menu-bg: #ffffff; --kp-menu-border: rgba(0,0,0,0.1);
            --kp-input-bg: rgba(0,0,0,0.04); --kp-input-color: #1a1a1a; --kp-input-border: rgba(0,0,0,0.15);
            --kp-muted: #64748b; --kp-menu-item-hover: rgba(0,0,0,0.06); --kp-menu-item-color: rgba(0,0,0,0.8);
            --kp-menu-item-active-bg: rgba(99,102,241,0.12); --kp-menu-item-active-color: #4f46e5;
            position: absolute; z-index: 1000001; background: var(--kp-bg); color: var(--kp-text);
            font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; width: 260px !important;
            max-width: calc(100vw - 24px); display: none; flex-direction: column; border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15); box-sizing: border-box;
        }
        .kp-saved-panel[data-theme="dark"] {
            --kp-bg: #1f1f1f; --kp-text: #ffffff; --kp-border: rgba(127,127,127,0.15);
            --kp-tab-bg: rgba(127,127,127,0.12); --kp-tab-border: rgba(127,127,127,0.2); --kp-tab-color: rgba(255,255,255,0.75);
            --kp-tab-active-bg: rgba(99,102,241,0.2); --kp-tab-active-border: #818cf8; --kp-tab-active-color: #a5b4fc;
            --kp-action-bg: rgba(31,31,31,0.55); --kp-action-border: rgba(127,127,127,0.25); --kp-action-color: rgba(255,255,255,0.85);
            --kp-action-hover-bg: rgba(99,102,241,0.35); --kp-action-hover-color: #ffffff;
            --kp-menu-bg: #1f1f1f; --kp-menu-border: rgba(127,127,127,0.3);
            --kp-input-bg: rgba(0,0,0,0.3); --kp-input-color: #ffffff; --kp-input-border: rgba(127,127,127,0.3);
            --kp-muted: #64748b; --kp-menu-item-hover: rgba(127,127,127,0.15); --kp-menu-item-color: rgba(255,255,255,0.8);
            --kp-menu-item-active-bg: rgba(99,102,241,0.15); --kp-menu-item-active-color: #a5b4fc;
        }
        .kp-saved-header { display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 4px 10px 4px; border-bottom: 1px solid var(--kp-border); flex-shrink: 0; border-radius: 20px 20px 0 0; background: var(--kp-bg); box-sizing: border-box; }
        .kp-saved-title { font-weight: 600; font-size: 13px; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--kp-text); }
        .kp-saved-actions { display: flex; gap: 4px; align-items: center; flex-shrink: 0; position: relative; }
        .kp-saved-btn { background: #427552; border: none; color: #fff; padding: 0 8px; height: 22px; border-radius: 14px; font-size: 12px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-family: inherit; transition: opacity 0.15s; box-sizing: border-box; line-height: 1; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        @media (max-width: 500px) { .kp-saved-btn { height: 30px; font-size: 13px; } }
        .kp-saved-btn:hover { opacity: 0.9; }
        .kp-saved-btn.icon-only { padding: 0 8px; }

        .kp-tabs-bar { position: relative; display: flex; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--kp-border); flex-shrink: 0; width: 100%; box-sizing: border-box; }
        .kp-tabs-scroll { display: flex; gap: 4px; overflow-x: auto; overflow-y: hidden; width: 100%; padding: 0 10px; padding-right: 80px; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; box-sizing: border-box; }
        .kp-tabs-scroll::-webkit-scrollbar { display: none; }

        .kp-tab { position: relative; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: flex-start; height: 22px; padding: 0 10px; background: var(--kp-tab-bg); border: 1px solid var(--kp-tab-border); border-radius: 14px; font-size: 13px; font-weight: 600; line-height: 22px; color: var(--kp-tab-color); cursor: pointer; user-select: none; white-space: nowrap; transition: background 0.15s, border-color 0.15s, color 0.15s; -webkit-tap-highlight-color: transparent; max-width: 135px; overflow: hidden; box-sizing: border-box; }
        @media (max-width: 500px) { .kp-tab { height: 30px; line-height: 30px; padding: 0 10px; } }
        .kp-tab:hover { background: var(--kp-menu-item-hover); color: var(--kp-text); }
        .kp-tab.active { background: var(--kp-tab-active-bg); border-color: var(--kp-tab-active-border); color: var(--kp-tab-active-color); }
        .kp-tab > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; line-height: inherit; text-align: left; }

        .kp-tabs-actions { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px; z-index: 10; pointer-events: none; }
        .kp-tabs-actions > * { pointer-events: auto; }
        .kp-tab-action-btn { height: 22px; padding: 0 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--kp-action-bg); border: 1px solid var(--kp-action-border); border-radius: 14px; color: var(--kp-action-color); cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-sizing: border-box; }
        @media (max-width: 500px) { .kp-tab-action-btn { height: 30px; } }
        .kp-tab-action-btn:hover { background: var(--kp-action-hover-bg); color: var(--kp-action-hover-color); }
        .kp-tab-action-btn svg { display: block; }

        .kp-saved-panel.share-open .kp-tabs-actions { display: none; }
        .kp-saved-panel.share-open .kp-tabs-scroll { padding-right: 10px; }
        @media (max-width: 500px) { .kp-tabs-scroll { padding-right: 86px; } }

        .kp-sort-wrap { position: relative; }
        .kp-sort-menu { position: absolute; top: calc(100% + 6px); right: 0; min-width: 230px; background: var(--kp-menu-bg); border: 1px solid var(--kp-menu-border); border-radius: 20px; padding: 4px; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.6); display: none; color: var(--kp-text); }
        .kp-sort-menu.open { display: block; }
        .kp-sort-section { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--kp-muted); padding: 4px 8px 2px; font-weight: 600; }
        .kp-sort-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 14px; cursor: pointer; font-size: 12px; color: var(--kp-menu-item-color); transition: background 0.12s, color 0.12s; }
        .kp-sort-item:hover { background: var(--kp-menu-item-hover); color: var(--kp-text); }
        .kp-sort-item.active { background: var(--kp-menu-item-active-bg); color: var(--kp-menu-item-active-color); }
        .kp-sort-item svg { flex-shrink: 0; }
        .kp-sort-item.danger { color: #ff8888; }
        .kp-sort-item.danger:hover { background: rgba(220,38,38,0.2); color: #ffb0b0; }
        .kp-sort-item.disabled { opacity: 0.35; pointer-events: none; }
        .kp-sort-divider { height: 1px; background: var(--kp-menu-border); margin: 2px 4px; opacity: 0.6; }

        .kp-rename-row { display: flex; gap: 2px; align-items: center; padding: 2px 2px; }
        .kp-rename-input { flex: 1 1 auto; min-width: 0; padding: 6px 10px; background: var(--kp-input-bg); border: 1px solid var(--kp-input-border); border-radius: 14px; color: var(--kp-input-color); font-size: 12px; font-family: inherit; outline: none; }
        .kp-rename-input:focus { border-color: #818cf8; }

        .kp-rename-apply, .kp-rename-delete { flex-shrink: 0; width: 28px; height: 28px; background: none; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.15s, transform 0.15s; -webkit-tap-highlight-color: transparent; }
        .kp-rename-apply { color: #22c55e; }
        .kp-rename-delete { color: #ef4444; }
        .kp-rename-apply:hover, .kp-rename-delete:hover { opacity: 0.75; transform: scale(1.1); }
        .kp-rename-apply svg, .kp-rename-delete svg { display: block; width: 20px; height: 20px; }

        .kp-add-wrap { position: relative; }
        .kp-add-popup { position: absolute; top: calc(100% + 6px); right: 0; width: 220px; background: var(--kp-menu-bg); border: 1px solid var(--kp-menu-border); border-radius: 20px; padding: 6px; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.6); display: none; color: var(--kp-text); }
        .kp-add-popup.open { display: block; }
        .kp-add-input-wrap { position: relative; }
        .kp-add-input { width: 100%; padding: 8px 44px 8px 10px; background: var(--kp-input-bg); border: 1px solid var(--kp-input-border); border-radius: 14px; color: var(--kp-input-color); font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; }
        .kp-add-input:focus { border-color: #818cf8; }
        .kp-add-input::placeholder { color: var(--kp-muted); }
        .kp-add-counter { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 10px; color: var(--kp-muted); pointer-events: none; font-family: inherit; }

        .kp-saved-list { display: flex; flex-direction: column; gap: 4px; padding: 4px; overflow-y: auto; max-height: 208px; flex: 1 1 auto; min-height: 0; border-radius: 0 0 20px 20px; box-sizing: border-box; }
        .kp-saved-list::-webkit-scrollbar { display: none; }
        .kp-saved-list { scrollbar-width: none; -ms-overflow-style: none; }
        .kp-saved-list .kp-empty { color: var(--kp-muted); text-align: center; padding: 8px; font-size: 12px; }

        .kp-share-view { display: none; flex-direction: column; gap: 8px; padding: 8px 6px; border-radius: 0 0 20px 20px; box-sizing: border-box; max-height: 208px; overflow-y: auto; }
        .kp-share-view.open { display: flex; }
        .kp-share-toggle { display: flex; gap: 2px; padding: 2px; background: var(--kp-tab-bg); border-radius: 14px; }
        .kp-share-toggle button { flex: 1 1 0; padding: 6px 8px; border: none; background: transparent; color: var(--kp-tab-color); border-radius: 12px; font-size: 11px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s; -webkit-tap-highlight-color: transparent; }
        .kp-share-toggle button:hover { color: var(--kp-text); }
        .kp-share-toggle button.active { background: var(--kp-tab-active-bg); color: var(--kp-tab-active-color); font-weight: 600; }
        .kp-share-link-row { display: flex; gap: 4px; }
        .kp-share-link-input { flex: 1 1 auto; min-width: 0; padding: 6px 8px; background: var(--kp-input-bg); border: 1px solid var(--kp-input-border); border-radius: 14px; color: var(--kp-input-color); font-size: 11px; font-family: inherit; outline: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .kp-share-copy { flex-shrink: 0; width: 34px; background: #427552; border: none; border-radius: 14px; color: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.15s; }
        .kp-share-copy:hover { opacity: 0.9; }
        .kp-share-copy svg { display: block; }
        .kp-share-copy:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
        .kp-share-qr-btn { width: 100%; padding: 8px 0; background: #427552; border: none; border-radius: 14px; color: #fff; font-weight: 600; font-size: 12px; font-family: inherit; cursor: pointer; transition: opacity 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
        .kp-share-qr-btn:hover { opacity: 0.9; }
        .kp-share-qr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .kp-share-actions { display: flex; gap: 4px; }
        .kp-share-action-btn { flex: 1 1 0; padding: 8px 10px; border: none; border-radius: 14px; background: var(--kp-tab-active-bg); color: var(--kp-tab-active-color); font-weight: 600; cursor: pointer; font-size: 12px; font-family: inherit; touch-action: manipulation; -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
        .kp-share-action-btn:hover { background: var(--kp-action-hover-bg); color: var(--kp-action-hover-color); }
        .kp-share-info { font-size: 10.5px; color: var(--kp-muted); text-align: center; line-height: 1.4; }
    `;

    let settings = loadSettings();
    let currentUIUrl = null;
    let embedObserver = null;
    let embedTimeout = null;
    let isCreatingUI = false;
    let themeWaitActive = false;

    let toastElement = null;
    let toastTimer = null;

    function getToast() {
        if (!toastElement) {
            toastElement = document.createElement('div');
            toastElement.id = 'kp-toast';
            Object.assign(toastElement.style, {
                position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                background: '#2a2a2e', color: '#f0f0f5', padding: '10px 20px', borderRadius: '8px',
                border: '1px solid #4b4b52', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: '1000003', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '14px',
                transition: 'opacity 0.3s', opacity: '0', pointerEvents: 'none',
                maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', textAlign: 'center'
            });
        }
        if (!toastElement.parentNode && document.body) document.body.appendChild(toastElement);
        return toastElement;
    }

    function showToast(message) {
        if (!document.body) return;
        const toast = getToast();
        toast.textContent = message;
        toast.style.opacity = '1';
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }

    function whenReady(fn) {
        if (document.body) fn();
        else {
            const obs = new MutationObserver(() => {
                if (document.body) { obs.disconnect(); fn(); }
            });
            obs.observe(document.documentElement, { childList: true });
        }
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function compareVersions(a, b) {
        const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
        const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
            const va = pa[i] || 0, vb = pb[i] || 0;
            if (va < vb) return -1;
            if (va > vb) return 1;
        }
        return 0;
    }

    function svgIcon(name, size) {
        const s = size || 20;
        const sw = s <= 14 ? 2.4 : s <= 18 ? 2.2 : 2;
        const head = `width="${s}" height="${s}" viewBox="0 0 24 24" style="display:block" aria-hidden="true"`;
        const icons = {
            play: `<svg ${head} fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
            settings: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
            bookmark: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
            share: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
            mapPin: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            copy: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
            download: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            upload: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
            qr: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
            refresh: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
            arrowLeft: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
            arrowRight: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
            arrowLeftTop: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>`,
            arrowLeftBottom: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="7 7 7 17 17 17"/></svg>`,
            arrowRightTop: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
            arrowRightBottom: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="7 17 17 17 17 7"/></svg>`,
            check: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
            arrowUp: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
            alert: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            x: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            sun: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
            moon: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
            chevronDown: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
            trash: `<svg ${head} fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
            plus: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
            filter: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="11" y2="18"/></svg>`,
            sortDateDesc: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
            sortDateAsc: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
            sortNameAsc: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h12M3 12h8M3 18h4"/><path d="M19 12v6l2-2"/><path d="M19 18l-2-2"/></svg>`,
            sortNameDesc: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h4M3 12h8M3 18h12"/><path d="M19 12v6l2-2"/><path d="M19 18l-2-2"/></svg>`,
            sortRating: `<svg ${head} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>`
        };
        return icons[name] || '';
    }

    function posToIconName(key) {
        const map = {
            'left-top': 'arrowLeftTop',
            'left-middle': 'arrowLeft',
            'left-bottom': 'arrowLeftBottom',
            'right-top': 'arrowRightTop',
            'right-middle': 'arrowRight',
            'right-bottom': 'arrowRightBottom'
        };
        return map[key] || 'arrowLeft';
    }

    function iconSizeFor(btnSize) {
        if (btnSize >= 52) return 24;
        if (btnSize >= 48) return 22;
        if (btnSize >= 42) return 20;
        if (btnSize >= 36) return 18;
        return 16;
    }

    function loadTabs() {
        try {
            const raw = localStorage.getItem(CONFIG.TABS_STORAGE_KEY);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length > 0) {
                    return arr.map(t => ({
                        id: String(t.id || ('t' + Date.now() + Math.random())),
                        name: String(t.name || CONFIG.DEFAULT_TAB_NAME).slice(0, CONFIG.TAB_NAME_MAX),
                        sort: String(t.sort || 'date-desc')
                    }));
                }
            }
        } catch (e) {}
        return [{ id: CONFIG.DEFAULT_TAB_ID, name: CONFIG.DEFAULT_TAB_NAME, sort: 'date-desc' }];
    }

    function saveTabs() {
        try { localStorage.setItem(CONFIG.TABS_STORAGE_KEY, JSON.stringify(tabs)); } catch (e) {}
    }

    function loadActiveTabId() {
        try {
            const raw = localStorage.getItem(CONFIG.ACTIVE_TAB_KEY);
            if (raw && tabs.some(t => t.id === raw)) return raw;
        } catch (e) {}
        return tabs[0].id;
    }

    function saveActiveTabId() {
        try { localStorage.setItem(CONFIG.ACTIVE_TAB_KEY, activeTabId); } catch (e) {}
    }

    function getActiveTab() {
        return tabs.find(t => t.id === activeTabId) || tabs[0];
    }

    function migrateOldBookmarks() {
        try {
            const movies = JSON.parse(localStorage.getItem(CONFIG.SAVED_STORAGE_KEY) || '[]');
            if (!Array.isArray(movies) || movies.length === 0) return;
            let changed = false;
            movies.forEach(m => {
                if (!m.tabId) { m.tabId = tabs[0].id; changed = true; }
            });
            if (changed) localStorage.setItem(CONFIG.SAVED_STORAGE_KEY, JSON.stringify(movies));
        } catch (e) {}
    }

    let tabs = loadTabs();
    let activeTabId = loadActiveTabId();
    migrateOldBookmarks();

    function saveUpdateCache(result, state) {
        try {
            localStorage.setItem(CONFIG.UPDATE_CACHE_KEY, JSON.stringify({ ts: Date.now(), state, result, localVersion: LOCAL_META.version }));
        } catch (e) {}
    }

    function loadUpdateCache() {
        try {
            const raw = localStorage.getItem(CONFIG.UPDATE_CACHE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.localVersion !== LOCAL_META.version) return null;
            const ttl = data.state === 'new' ? CONFIG.NEW_CACHE_TTL : CONFIG.OK_CACHE_TTL;
            if (Date.now() - data.ts > ttl) return null;
            return data;
        } catch (e) { return null; }
    }

    function gmFetch(url, options = {}) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (fn, arg) => { if (settled) return; settled = true; fn(arg); };
            const req = {
                method: options.method || 'GET',
                url,
                headers: options.headers || {},
                responseType: options.responseType || 'text',
                timeout: options.timeout || 20000,
                onload: (res) => finish(resolve, { ok: res.status >= 200 && res.status < 300, status: res.status, statusText: res.statusText, responseText: res.responseText, response: res.response, headers: res.responseHeaders || '' }),
                onerror: () => finish(reject, new Error('Network error')),
                ontimeout: () => finish(reject, new Error('Timeout'))
            };
            GM_xmlhttpRequest(req);
        });
    }

    async function fetchUpdateInfo() {
        const url = CONFIG.VERSION_JSON_URL + '?t=' + Date.now();
        const res = await gmFetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let data;
        try { data = JSON.parse(res.responseText || ''); }
        catch (e) { throw new Error('Некорректный version.json'); }
        if (!data || !data.version) throw new Error('В version.json нет поля version');
        return {
            remoteVersion: String(data.version).trim(),
            remoteDate: String(data.date || '').trim() || '—',
            changelog: String(data.changelog || '').trim().slice(0, CONFIG.CHANGELOG_MAX),
            url: String(data.url || CONFIG.UPDATE_URL).trim()
        };
    }

    function applyUpdateIndicator(hasUpdate) {
        const settingsBtn = document.getElementById('kp-settings-btn');
        const updateIcon = document.getElementById('kp-update-open-btn');
        if (settingsBtn) settingsBtn.classList.toggle('kp-has-update', !!hasUpdate);
        if (updateIcon) updateIcon.classList.toggle('kp-has-update', !!hasUpdate);
    }

    document.addEventListener('click', function(e) {
        const settingsPanel = document.getElementById('kp-settings-panel');
        const savedPanel = document.getElementById('kp-saved-panel');
        const settingsBtn = document.getElementById('kp-settings-btn');
        const saveBtn = document.getElementById('kp-save-btn');

        if (settingsPanel && settingsPanel.style.display === 'flex') {
            if (!settingsBtn?.contains(e.target) && !settingsPanel.contains(e.target)) {
                settingsPanel.style.display = 'none';
                showSettingsView();
            }
        }
        if (savedPanel && savedPanel.style.display === 'flex') {
            if (!saveBtn?.contains(e.target) && !savedPanel.contains(e.target)) {
                savedPanel.style.display = 'none';
                if (savedPanel._resetShareView) savedPanel._resetShareView();
            }
        }

        const openSelect = document.querySelector('.kp-select.open');
        if (openSelect && !openSelect.contains(e.target)) openSelect.classList.remove('open');
        const openPosDd = document.querySelector('.kp-dd-pos.open');
        if (openPosDd && !openPosDd.contains(e.target)) openPosDd.classList.remove('open');
        const openChDd = document.querySelector('.kp-dd-channel.open');
        if (openChDd && !openChDd.contains(e.target)) openChDd.classList.remove('open');

        const sortMenu = document.getElementById('kp-sort-menu');
        const sortBtn = document.getElementById('kp-sort-btn-el');
        if (sortMenu && sortMenu.classList.contains('open') && !sortMenu.contains(e.target) && !sortBtn?.contains(e.target)) {
            sortMenu.classList.remove('open');
        }
        const addPopup = document.getElementById('kp-add-popup');
        const addBtn = document.getElementById('kp-add-btn-el');
        if (addPopup && addPopup.classList.contains('open') && !addPopup.contains(e.target) && !addBtn?.contains(e.target)) {
            addPopup.classList.remove('open');
        }
    }, true);

    function loadSettings() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                let targetDomain = parsed.targetDomain || CONFIG.DEFAULT_DOMAIN;
                let btnPosition = parsed.btnPosition || 'left';
                let btnVertical = parsed.btnVertical || 'middle';
                let embedMode = 'embedMode' in parsed ? parsed.embedMode : true;
                let phoneTheme = parsed.phoneTheme || 'dark';
                if (isPhone) {
                    embedMode = false;
                    if (btnVertical === 'top') btnVertical = 'middle';
                }
                return { targetDomain, btnPosition, btnVertical, embedMode, phoneTheme };
            }
        } catch (e) {}
        return { targetDomain: CONFIG.DEFAULT_DOMAIN, btnPosition: 'left', btnVertical: 'middle', embedMode: !isPhone, phoneTheme: 'dark' };
    }

    function saveSettings() {
        try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
    }

    function isFilmOrSeriesPage(url = window.location.href) {
        return /\/film\/\d+/.test(url) || /\/series\/\d+/.test(url) || /\/tv\/\d+/.test(url) || /\/episode\/\d+/.test(url);
    }

    function getChannelName(domain) {
        const ch = CONFIG.CHANNELS.find(c => c.domains.some(d => domain.includes(d)));
        return ch ? ch.name : domain;
    }

    function isMirrorDomain() { return matchChannelDomain(host); }

    function applyBlockedStyles() {
        if (!document.getElementById('shell')) return;
        injectStyleWhenHeadReady('kp-blocked-style', BLOCKED_PAGE_STYLES);
        const shell = document.getElementById('shell');
        const textDiv = shell.querySelector('.text');
        if (textDiv) {
            textDiv.innerHTML = `<b>Выбранный Вами фильм или сериал удален по решению правообладателя.</b><br><br>Вы можете выбрать другой фильм, сериал или канал в настройках.<br><br>Приносим извинения за неудобства, надеемся на Ваше понимание.<br><br>С уважением, Кинопоиск [Free].`;
        }
        const footerLinks = shell.querySelector('.footer-links');
        if (footerLinks) {
            footerLinks.querySelectorAll('a').forEach(a => a.remove());
            if (!footerLinks.querySelector('.kp-home-btn')) {
                const homeBtn = document.createElement('button');
                homeBtn.className = 'kp-home-btn';
                homeBtn.textContent = '← На главную';
                homeBtn.addEventListener('click', () => { window.location.href = CONFIG.KP_HOME_URL; });
                footerLinks.appendChild(homeBtn);
            }
        }
        showBody();
    }

    function initBlockedPageObserver() {
        if (!isBlockedPage) return;
        const observer = new MutationObserver((mutations, obs) => {
            if (document.getElementById('shell')) { obs.disconnect(); applyBlockedStyles(); }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        if (document.getElementById('shell')) { observer.disconnect(); applyBlockedStyles(); }
    }
    initBlockedPageObserver();

    function getMirrorTypeForRebuild() {
        const ch = getChannelByHostname(host);
        if (ch && ch.type) {
            return ch.type === 'alfa' ? 'gamma' : ch.type;
        }
        if (/(^|\.)flcksbr\./.test(host)) return 'tango';
        if (/(^|\.)(nonchik|troutcdn)\./.test(host)) return 'bravo';
        if (/(^|\.)kinopoisk\.(ws|me|tv|online|site|xyz|net|org|web|club|space|live|pro|io|co|su|fun|art|store|shop|app|dev|cc|top|life)([/.]|$)/.test(host) &&
            !/(^|\.)kinopoisk\.(film|ru)/.test(host)) return 'bravo';
        return 'gamma';
    }

    function getMovieInfo() {
        const docTitle = (document.querySelector('title')?.textContent || document.title || '').trim();
        let m = docTitle.match(/^(.+?)\s*\((\d{4})\)/);
        if (m && m[1].trim() && m[1].trim() !== 'KinoSave') {
            return { name: m[1].trim(), year: m[2] };
        }

        const domTitle = document.querySelector('.movie-title, #movie-details h1, #name');
        const domYear =
            document.querySelector('.movie-orig')?.textContent?.match(/\b(\d{4})\b/)?.[1] ||
            document.querySelector('.movie-meta .meta-tag')?.textContent?.match(/\b(\d{4})\b/)?.[1] ||
            document.querySelector('#name')?.textContent?.match(/\((\d{4})\)/)?.[1];
        if (domTitle && domTitle.textContent.trim()) {
            return {
                name: domTitle.textContent.trim(),
                year: domYear || ''
            };
        }

        const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        if (og) {
            m = og.match(/^(.+?)\s*\((\d{4})\)/);
            if (m) return { name: m[1].trim(), year: m[2] };
            return { name: og.trim(), year: '' };
        }

        const h1 = document.querySelector('h1');
        if (h1 && h1.textContent.trim()) {
            return { name: h1.textContent.trim(), year: '' };
        }

        return null;
    }

    function waitForMovieInfo(maxWait = 4000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const tick = () => {
                const info = getMovieInfo();
                if (info && info.name && info.name !== 'KinoSave') return resolve(info);
                if (Date.now() - start > maxWait) return resolve(getMovieInfo());
                setTimeout(tick, 200);
            };
            tick();
        });
    }

    async function loadMovieDetails(kpId) {
        if (!kpId || kpId === '0') return null;
        const cacheKey = CONFIG.MOVIE_DETAILS_CACHE_KEY;
        const now = Date.now();

        try {
            const raw = localStorage.getItem(cacheKey);
            if (raw) {
                const cache = JSON.parse(raw);
                const entry = cache[kpId];
                if (entry && (now - entry.ts) < CONFIG.MOVIE_DETAILS_CACHE_TTL) {
                    return entry.data;
                }
            }
        } catch (e) {}

        try {
            const url = CONFIG.GETINFO_URL + '?kp_id=' + encodeURIComponent(kpId);
            const res = await gmFetch(url, { timeout: 8000 });
            if (!res.ok) return null;
            const data = JSON.parse(res.responseText || '{}');
            if (!data || data.error || !data.kinopoiskId) return null;

            try {
                const raw = localStorage.getItem(cacheKey);
                const cache = raw ? JSON.parse(raw) : {};
                cache[kpId] = { ts: now, data };
                for (const k in cache) {
                    if (now - cache[k].ts > 30 * 24 * 60 * 60 * 1000) delete cache[k];
                }
                localStorage.setItem(cacheKey, JSON.stringify(cache));
            } catch (e) {}

            return data;
        } catch (e) {
            return null;
        }
    }

    async function loadAndRenderParts(kpId) {
        if (!kpId || kpId === '0') return;
        const strip = document.getElementById('parts-strip');
        const block = document.getElementById('parts-block');
        if (!strip || !block) return;

        const cacheKey = 'kpParts_' + kpId;
        const now = Date.now();
        let parts = null;
        let fromCache = false;

        try {
            const raw = localStorage.getItem(cacheKey);
            if (raw) {
                const entry = JSON.parse(raw);
                if (entry && (now - entry.ts) < CONFIG.PARTS_CACHE_TTL) {
                    parts = entry.parts;
                    fromCache = true;
                }
            }
        } catch (e) {}

        if (!parts) {
            try {
                const url = CONFIG.FILM_PARTS_URL + '?kp_id=' + encodeURIComponent(kpId);
                const res = await gmFetch(url, { timeout: 8000 });
                if (!res.ok) return;
                const text = res.responseText || '';
                try {
                    const data = JSON.parse(text);
                    if (Array.isArray(data)) parts = data;
                    else if (data && Array.isArray(data.parts)) parts = data.parts;
                } catch (e) {}
                if (!parts && text && /parts-card/.test(text)) {
                    strip.innerHTML = text;
                    block.classList.add('visible');
                    return;
                }
            } catch (e) {
                return;
            }
        }

        if (parts && parts.length) {
            strip.innerHTML = parts.map(p => {
                const id = encodeURIComponent(p.kp_id || p.id || '');
                const poster = `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${id}.jpg`;
                const cur = p.current ? ' current' : '';
                const year = p.year ? `<div class="parts-year">${escapeHtml(String(p.year))}</div>` : '';
                const badge = p.current ? '<span class="parts-badge">Вы здесь</span>' : '';
                return `<a class="parts-card${cur}" href="/film/${id}/">
                    <div class="parts-poster-wrap">
                        <img src="${poster}" alt="" loading="lazy">
                        ${badge}
                    </div>
                    ${year}
                    <div class="parts-name">${escapeHtml(p.name || '')}</div>
                </a>`;
            }).join('');
            block.classList.add('visible');
        }

        if (parts && parts.length && !fromCache) {
            setTimeout(() => {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({ ts: now, parts }));
                } catch (e) {}
            }, 0);
        }
    }

    function initViewToggle() {
        const toggle = document.getElementById('viewToggle');
        const sw = document.getElementById('viewToggleSwitch');
        if (!toggle || !sw) return;
        let simplified = false;
        try { simplified = localStorage.getItem(CONFIG.SIMPLIFIED_VIEW_KEY) === '1'; } catch (e) {}
        function apply() {
            document.body.classList.toggle('simplified-view', simplified);
            sw.classList.toggle('on', !simplified);
        }
        apply();
        sw.addEventListener('click', () => {
            simplified = !simplified;
            try { localStorage.setItem(CONFIG.SIMPLIFIED_VIEW_KEY, simplified ? '1' : '0'); } catch (e) {}
            apply();
        });
    }

    function preapplySimplifiedClass() {
        try {
            const simplified = localStorage.getItem(CONFIG.SIMPLIFIED_VIEW_KEY) === '1';
            document.body.classList.toggle('simplified-view', simplified);
        } catch (e) {}
    }

    function renderMovieInfoBlock(movie, details, posterSrc) {
        const name = (details && (details.nameRu || details.nameOriginal)) || (movie && movie.name) || '';
        const original = (details && details.nameOriginal) || '';
        const year = (details && details.year) || (movie && movie.year) || '';
        const rating = details && details.ratingKinopoisk;
        const ratingImdb = details && details.ratingImdb;
        const votes = details && details.ratingKinopoiskVoteCount;
        const filmLength = details && details.filmLength;
        const slogan = details && details.slogan;
        const countries = ((details && details.countries) || []).map(c => c.country).filter(Boolean);
        const genres = ((details && details.genres) || []).map(g => g.genre).filter(Boolean);
        const description = (details && details.description) || '';
        const displayPoster = (details && details.posterUrl) || posterSrc || '';

        let metaTags = '';
        if (rating)     metaTags += `<span class="meta-tag kp">★ ${parseFloat(rating).toFixed(1)} КП</span>`;
        if (ratingImdb) metaTags += `<span class="meta-tag kp">★ ${parseFloat(ratingImdb).toFixed(1)} IMDb</span>`;
        if (year)       metaTags += `<span class="meta-tag">${escapeHtml(String(year))}</span>`;
        genres.slice(0, 3).forEach(g => {
            metaTags += `<span class="meta-tag">${escapeHtml(g)}</span>`;
        });

        let rows = '';
        if (countries.length) {
            rows += `<div class="movie-row"><span class="movie-row-label">Страна: </span><span class="movie-row-val">${escapeHtml(countries.join(', '))}</span></div>`;
        }
        if (filmLength) {
            rows += `<div class="movie-row"><span class="movie-row-label">Длительность: </span><span class="movie-row-val">${escapeHtml(String(filmLength))} мин.</span></div>`;
        }
        if (slogan) {
            rows += `<div class="movie-row"><span class="movie-row-label">Слоган: </span><span class="movie-row-val">${escapeHtml(slogan)}</span></div>`;
        }
        if (votes) {
            rows += `<div class="movie-row"><span class="movie-row-label">Голоса КП: </span><span class="movie-row-val">${escapeHtml(String(votes))}</span></div>`;
        }

        const origLine = (original && original !== name)
            ? `<div class="movie-orig">${escapeHtml(original)}</div>`
            : '';

        const descLine = description ? `<div class="movie-desc">${description}</div>` : '';

        return `
            <div class="movie-info-inner">
                <div class="movie-poster-wrap">
                    <img class="movie-poster-img" id="kp-movie-poster" src="${escapeHtml(displayPoster)}" alt="">
                </div>
                <div class="movie-details" id="kp-movie-details">
                    <h1 class="movie-title">${escapeHtml(name)}</h1>
                    ${origLine}
                    <div class="movie-meta">${metaTags}</div>
                    <div class="movie-rows">${rows}</div>
                </div>
            </div>
            ${descLine}
        `;
    }

    function addStylesIfNeeded() {
        if (!document.getElementById('kp-alfa-style')) injectStyleWhenHeadReady('kp-alfa-style', ALFA_STYLES_GAMMA_TANGO);
    }

    function getKinoboxElements(type) {
        const isTango = type === 'tango';
        let iframeContainer, menuItems, activeClass;
        if (isTango) {
            iframeContainer = document.querySelector('.kinobox__iframeWrapper');
            menuItems = [...document.querySelectorAll('.kinobox__menuItem')];
            activeClass = 'kinobox__menuItem--active';
        } else {
            iframeContainer = document.querySelector('.kinobox_iframe_container');
            menuItems = [...document.querySelectorAll('.kinobox_menu li')];
            activeClass = 'kinobox_menu_active';
            if (!iframeContainer || menuItems.length === 0) {
                iframeContainer = document.querySelector('.kinobox__iframeWrapper');
                menuItems = [...document.querySelectorAll('.kinobox__menuItem')];
                activeClass = 'kinobox__menuItem--active';
            }
        }
        return { iframeContainer, menuItems, activeClass };
    }

    function buildKinoboxPage(iframeContainer, menuItems, kpId, movie, activeClass) {
        if (!iframeContainer || menuItems.length === 0) { showBody(); return; }
        const container = document.createElement('div');
        container.id = 'kp-alfa-page';
        const posterSrc = `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${kpId}.jpg`;

        container.innerHTML = `
            <div class="movie-info" id="kp-movie-info">
                ${renderMovieInfoBlock(movie, null, posterSrc)}
            </div>
            <div class="parts-block" id="parts-block">
                <div class="parts-title">Другие части</div>
                <div class="parts-strip" id="parts-strip"></div>
            </div>
            <div class="view-toggle-wrap">
                <div class="view-toggle" id="viewToggle">
                    <span class="view-toggle-text">
                        <span class="view-toggle-label">Расширенная версия сайта</span>
                        <span class="view-toggle-desc">Полная информация о фильме и другие функции сервиса</span>
                    </span>
                    <span class="view-toggle-switch on" id="viewToggleSwitch"><span class="view-toggle-knob"></span></span>
                </div>
            </div>
            <div class="player-section">
                <div class="player-top-bar">
                    <div class="kp-select" id="kp-select">
                        <div class="kp-select-trigger" id="kp-select-trigger">
                            <span class="kp-select-dot"></span>
                            <span id="kp-select-label">Плеер</span>
                            <svg class="kp-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="kp-select-menu" id="kp-select-menu"></div>
                    </div>
                </div>
                <div class="vpn-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>Плеер можно выбрать другой, нажмите на список</div>
                <div class="player-wrap" id="kp-player-wrap"></div>
                <div class="vpn-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>VPN может мешать воспроизведению</div>
            </div>`;

        const playerWrap = container.querySelector('#kp-player-wrap');
        iframeContainer.style.position = 'relative';
        iframeContainer.style.paddingTop = '56.25%';
        playerWrap.appendChild(iframeContainer);

        const selectMenu = container.querySelector('#kp-select-menu');
        const selectLabel = container.querySelector('#kp-select-label');
        const selectEl = container.querySelector('#kp-select');
        let activeIndex = -1;
        menuItems.forEach((origItem, idx) => {
            const item = document.createElement('div');
            item.className = 'kp-select-item';
            const isActive = origItem.classList.contains(activeClass);
            if (isActive) {
                item.classList.add('active');
                activeIndex = idx;
                selectLabel.textContent = origItem.textContent.replace(/^\d+\s*::\s*/, '').trim();
            }
            item.innerHTML = `<span class="kp-select-num">${idx+1}</span><span>${origItem.textContent.replace(/^\d+\s*::\s*/, '').trim()}</span>`;
            item.addEventListener('click', () => {
                origItem.click();
                selectLabel.textContent = origItem.textContent.replace(/^\d+\s*::\s*/, '').trim();
                selectEl.classList.remove('open');
                selectMenu.querySelectorAll('.kp-select-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });
            selectMenu.appendChild(item);
        });
        if (activeIndex === -1 && menuItems.length > 0) {
            menuItems[0].click();
            selectLabel.textContent = menuItems[0].textContent.replace(/^\d+\s*::\s*/, '').trim();
            selectMenu.querySelector('.kp-select-item').classList.add('active');
        }
        const selectTrigger = container.querySelector('#kp-select-trigger');
        selectTrigger.addEventListener('click', (e) => { e.stopPropagation(); selectEl.classList.toggle('open'); });

        document.body.innerHTML = '';
        preapplySimplifiedClass();
        document.body.appendChild(container);
        addStylesIfNeeded();
        showBody();

        initViewToggle();
        if (kpId && kpId !== '0') loadAndRenderParts(kpId);

        let _currentMovie = movie || {};
        let _currentDetails = null;
        const _refreshInfo = () => {
            const info = container.querySelector('#kp-movie-info');
            if (info) info.innerHTML = renderMovieInfoBlock(_currentMovie, _currentDetails, posterSrc);
        };

        if (!movie || !movie.year || !movie.name) {
            waitForMovieInfo().then(full => {
                if (full && full.name) {
                    _currentMovie = { name: full.name, year: full.year || (movie && movie.year) || '' };
                    _refreshInfo();
                }
            });
        }
        if (kpId && kpId !== '0') {
            loadMovieDetails(kpId).then(details => {
                if (details) {
                    _currentDetails = details;
                    _refreshInfo();
                }
            });
        }
    }

    function rebuildMirror() {
        const type = getMirrorTypeForRebuild();
        if (type === 'bravo') { rebuildBravo(); return; }
        const { iframeContainer, menuItems, activeClass } = getKinoboxElements(type);
        const kpId = document.querySelector('.kinobox[data-kinopoisk]')?.getAttribute('data-kinopoisk') || '0';
        const movie = getMovieInfo();
        buildKinoboxPage(iframeContainer, menuItems, kpId, movie, activeClass);
    }

    function rebuildBravo() {
        const iframe = document.querySelector('#film iframe');
        const posterImg = document.querySelector('#film img');
        const torrentBtn = document.getElementById('ltorr');
        if (!iframe) { showBody(); return; }

        const kpId = (document.querySelector('script[data-kinopoisk]')?.getAttribute('data-kinopoisk'))
            || (window.USER_NOTE_ID ? String(window.USER_NOTE_ID) : '')
            || extractKpId()
            || '0';
        const posterSrc = (posterImg && posterImg.src)
            || `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${kpId}.jpg`;
        const movie = getMovieInfo();

        const container = document.createElement('div');
        container.id = 'kp-alfa-page';

        container.innerHTML = `
            <div class="movie-info" id="kp-movie-info">
                ${renderMovieInfoBlock(movie, null, posterSrc)}
            </div>
            <div class="parts-block" id="parts-block">
                <div class="parts-title">Другие части</div>
                <div class="parts-strip" id="parts-strip"></div>
            </div>
            <div class="view-toggle-wrap">
                <div class="view-toggle" id="viewToggle">
                    <span class="view-toggle-text">
                        <span class="view-toggle-label">Расширенная версия сайта</span>
                        <span class="view-toggle-desc">Полная информация о фильме и другие функции сервиса</span>
                    </span>
                    <span class="view-toggle-switch on" id="viewToggleSwitch"><span class="view-toggle-knob"></span></span>
                </div>
            </div>
            <div class="player-section">
                <div class="player-top-bar"></div>
                <div class="vpn-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>Плеер можно выбрать другой, нажмите на список</div>
                <div class="player-wrap" id="kp-player-wrap"></div>
                <div class="vpn-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>VPN может мешать воспроизведению</div>
            </div>`;

        const playerWrap = container.querySelector('#kp-player-wrap');
        playerWrap.style.paddingTop = '56.25%';
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:12px;background:#000;';
        playerWrap.appendChild(iframe);

        const playerTopBar = container.querySelector('.player-top-bar');
        if (torrentBtn) {
            torrentBtn.classList.add('kp-torrent-btn');
            torrentBtn.style.display = '';
            playerTopBar.appendChild(torrentBtn);
        }

        document.body.innerHTML = '';
        preapplySimplifiedClass();
        document.body.appendChild(container);
        addStylesIfNeeded();
        showBody();

        initViewToggle();
        if (kpId && kpId !== '0') loadAndRenderParts(kpId);

        let _currentMovie = movie || {};
        let _currentDetails = null;
        const _refreshInfo = () => {
            const info = container.querySelector('#kp-movie-info');
            if (info) info.innerHTML = renderMovieInfoBlock(_currentMovie, _currentDetails, posterSrc);
        };

        if (!movie || !movie.year || !movie.name) {
            waitForMovieInfo().then(full => {
                if (full && full.name) {
                    _currentMovie = { name: full.name, year: full.year || (movie && movie.year) || '' };
                    _refreshInfo();
                }
            });
        }
        if (kpId && kpId !== '0') {
            loadMovieDetails(kpId).then(details => {
                if (details) {
                    _currentDetails = details;
                    _refreshInfo();
                }
            });
        }
    }

    function waitForRebuild() {
        const type = getMirrorTypeForRebuild();
        if (type === 'bravo') {
            if (!/\/\d+/.test(window.location.pathname)) { showBody(); return; }
            function isTorrentReady() {
                const btn = document.getElementById('ltorr');
                if (!btn) return false;
                const href = btn.getAttribute('href');
                return href && href.includes('torrent');
            }
            let iframeReady = false;
            let torrentReady = isTorrentReady();
            const observer = new MutationObserver((mutations, obs) => {
                if (!iframeReady && document.querySelector('#film iframe')) iframeReady = true;
                if (!torrentReady && isTorrentReady()) torrentReady = true;
                if (iframeReady && torrentReady) { obs.disconnect(); rebuildBravo(); }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
            if (document.querySelector('#film iframe')) iframeReady = true;
            if (iframeReady && torrentReady) { observer.disconnect(); rebuildBravo(); return; }
            setTimeout(() => {
                if (!document.querySelector('#kp-alfa-page')) { observer.disconnect(); rebuildBravo(); }
            }, 5000);
            return;
        }
        let attempts = 0;
        const maxAttempts = 60;
        const interval = setInterval(() => {
            const { iframeContainer, menuItems } = getKinoboxElements(type);
            if (iframeContainer && menuItems.length > 0) { clearInterval(interval); rebuildMirror(); }
            else if (++attempts >= maxAttempts) { clearInterval(interval); startPersistentObserver(type); }
        }, 200);
    }

    function startPersistentObserver(type) {
        let observer;
        let fallbackTimer = null;
        const check = () => {
            const { iframeContainer, menuItems } = getKinoboxElements(type);
            if (iframeContainer && menuItems.length > 0) {
                if (observer) observer.disconnect();
                if (fallbackTimer) clearTimeout(fallbackTimer);
                rebuildMirror();
            }
        };
        observer = new MutationObserver(check);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        fallbackTimer = setTimeout(() => { observer.disconnect(); showBody(); }, 10000);
        check();
    }

    function removeOldUI() {
        document.getElementById('kp-btn-container')?.remove();
        document.getElementById('kp-settings-panel')?.remove();
        document.getElementById('kp-saved-panel')?.remove();
        document.querySelectorAll('.kp-redirect-embed-group').forEach(el => el.remove());
        stopEmbedTimers();
    }

    function stopEmbedTimers() {
        if (embedObserver) { embedObserver.disconnect(); embedObserver = null; }
        if (embedTimeout) { clearTimeout(embedTimeout); embedTimeout = null; }
    }

    function findEmbedTarget() {
        for (const sel of [CONFIG.EMBED_SELECTOR, ...CONFIG.FALLBACK_SELECTORS]) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        return null;
    }

    function isContainerReady(container) { return container && container.children.length > 0; }

    function waitForHydration(target, callback) {
        if (isContainerReady(target)) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (isContainerReady(target)) callback();
                    else observeContainer(target, callback);
                });
            });
            return;
        }
        observeContainer(target, callback);
    }

    function observeContainer(target, callback) {
        if (embedObserver) embedObserver.disconnect();
        embedObserver = new MutationObserver(() => {
            if (isContainerReady(target)) {
                embedObserver.disconnect();
                embedObserver = null;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (isContainerReady(target)) callback();
                        else observeContainer(target, callback);
                    });
                });
            }
        });
        embedObserver.observe(target, { childList: true, subtree: true });
    }

    function startEmbedMode() {
        stopEmbedTimers();
        const target = findEmbedTarget();
        if (!target) {
            const bodyObserver = new MutationObserver(() => {
                const t = findEmbedTarget();
                if (t) { bodyObserver.disconnect(); startEmbedMode(); }
            });
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            embedTimeout = setTimeout(() => {
                bodyObserver.disconnect();
                if (!document.querySelector('.kp-redirect-embed-group') && settings.embedMode) {
                    settings.embedMode = false;
                    saveSettings();
                    stopEmbedTimers();
                    removeOldUI();
                    createUI();
                    showToast('Контейнер не найден. Кнопка в фиксированном положении.');
                }
            }, CONFIG.EMBED_TIMEOUT);
            return;
        }
        waitForHydration(target, () => {
            if (!document.querySelector('.kp-redirect-embed-group') && settings.embedMode) {
                buildEmbeddedUI(target);
                startGlobalRestoreObserver();
            }
        });
    }

    function startGlobalRestoreObserver() {
        if (embedObserver) embedObserver.disconnect();
        let debounceTimer = null;
        embedObserver = new MutationObserver(() => {
            if (!isFilmOrSeriesPage() || !settings.embedMode) return;
            if (debounceTimer) return;
            debounceTimer = setTimeout(() => {
                debounceTimer = null;
                if (document.querySelector('.kp-redirect-embed-group')) return;
                const target = findEmbedTarget();
                if (target && isContainerReady(target)) buildEmbeddedUI(target);
            }, 100);
        });
        embedObserver.observe(document.body, { childList: true, subtree: true });
    }

    function createUI() {
        if (isCreatingUI) return;
        isCreatingUI = true;
        try {
            if (currentUIUrl === window.location.href && document.querySelector('.kp-redirect-embed-group, #kp-btn-container')) return;
            currentUIUrl = window.location.href;
            removeOldUI();
            if (!isFilmOrSeriesPage()) return;
            if (!isPhone && settings.embedMode) startEmbedMode();
            else buildFixedUI();
        } finally { isCreatingUI = false; }
    }

    function positionEmbedPanel(panel) {
        panel.style.top = '100%';
        panel.style.bottom = 'auto';
        panel.style.left = '0';
        panel.style.right = 'auto';
        panel.style.marginTop = CONFIG.BUTTONS_GAP;
        panel.style.marginLeft = '0';
        panel.style.marginRight = '0';
        panel.style.marginBottom = '0';
        requestAnimationFrame(() => {
            const rect = panel.getBoundingClientRect();
            if (rect.right > window.innerWidth - 8) {
                panel.style.left = 'auto';
                panel.style.right = '0';
            } else {
                panel.style.left = '0';
                panel.style.right = 'auto';
            }
        });
    }

    function positionFixedPanel(panel) {
        panel.style.top = '0';
        panel.style.bottom = 'auto';
        panel.style.left = 'auto';
        panel.style.right = 'auto';
        panel.style.margin = '0';
        const horiz = settings.btnPosition;
        let openLeft = (horiz === 'right');
        if (openLeft) {
            panel.style.right = '100%';
            panel.style.marginRight = CONFIG.BUTTONS_GAP;
        } else {
            panel.style.left = '100%';
            panel.style.marginLeft = CONFIG.BUTTONS_GAP;
        }
        requestAnimationFrame(() => {
            const rect = panel.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            if (rect.right > vw - 8 && !openLeft) {
                panel.style.left = 'auto';
                panel.style.right = '100%';
                panel.style.marginLeft = '0';
                panel.style.marginRight = CONFIG.BUTTONS_GAP;
            }
            if (rect.left < 8 && openLeft) {
                panel.style.right = 'auto';
                panel.style.left = '100%';
                panel.style.marginRight = '0';
                panel.style.marginLeft = CONFIG.BUTTONS_GAP;
            }
            if (rect.bottom > vh - 8) {
                panel.style.top = 'auto';
                panel.style.bottom = '0';
            }
            const rect2 = panel.getBoundingClientRect();
            if (rect2.right > vw - 8) panel.style.maxWidth = 'calc(100vw - 24px)';
        });
    }

    function redirectToChannel() {
        const newUrl = window.location.href.replace(/\/\/[^\/]*kinopoisk\.ru/, `//${settings.targetDomain}`);
        if (newUrl === window.location.href) showToast(`Вы уже на ${settings.targetDomain}`);
        else window.location.href = newUrl;
    }

    function attachHoverBehaviour(group, buttons) {
        group.addEventListener('mouseenter', () => {
            buttons.forEach(b => { b.style.opacity = '1'; b.style.pointerEvents = 'auto'; b.style.transform = 'scale(1)'; });
        });
        group.addEventListener('mouseleave', () => {
            buttons.forEach(b => { b.style.opacity = '0'; b.style.pointerEvents = 'none'; b.style.transform = 'scale(0.5)'; });
        });
    }

    function attachPanelHandlers(settingsBtn, settingsPanel, saveBtn, savedPanel, positionFn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPanel.style.display === 'flex') settingsPanel.style.display = 'none';
            else {
                if (savedPanel.style.display === 'flex') savedPanel.style.display = 'none';
                settingsPanel.style.display = 'flex';
                showSettingsView();
                positionFn(settingsPanel);
            }
        });
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (savedPanel.style.display === 'flex') {
                savedPanel.style.display = 'none';
                if (savedPanel._resetShareView) savedPanel._resetShareView();
            } else {
                if (settingsPanel.style.display === 'flex') settingsPanel.style.display = 'none';
                renderSavedMovies();
                savedPanel.style.display = 'flex';
                positionFn(savedPanel);
            }
        });
    }

    function buildEmbeddedUI(target) {
        target.querySelectorAll('.kp-redirect-embed-group').forEach(el => el.remove());
        const group = document.createElement('div');
        group.className = 'kp-redirect-embed-group';
        group.style.cssText = `display: inline-flex; align-items: center; gap: ${CONFIG.BUTTONS_GAP}; user-select: none;`;
        const colors = getThemeColors();
        const mainBtn = createButton(svgIcon('play', iconSizeFor(CONFIG.BTN_SIZE)), null, CONFIG.BTN_SIZE,
            colors.EMBED_MAIN_COLOR, colors.EMBED_IDLE_BG, colors.HOVER_BG, colors.HOVER_TEXT_COLOR);
        mainBtn.title = `${getChannelName(settings.targetDomain)} канал`;
        mainBtn.addEventListener('click', redirectToChannel);
        const settingsWrapper = document.createElement('div');
        settingsWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const settingsBtn = createButton(svgIcon('settings', iconSizeFor(CONFIG.SETTINGS_BTN_SIZE)), 'kp-settings-btn', CONFIG.SETTINGS_BTN_SIZE,
            colors.EMBED_SETTINGS_COLOR, colors.EMBED_IDLE_BG, colors.HOVER_BG, colors.HOVER_TEXT_COLOR);
        settingsBtn.title = 'Настройки';
        const settingsPanel = createSettingsPanel();
        settingsPanel.style.position = 'absolute';
        settingsPanel.style.top = '100%';
        settingsPanel.style.left = '0';
        settingsPanel.style.marginTop = CONFIG.BUTTONS_GAP;
        settingsWrapper.appendChild(settingsBtn);
        settingsWrapper.appendChild(settingsPanel);
        const savedWrapper = document.createElement('div');
        savedWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const saveBtn = createButton(svgIcon('bookmark', iconSizeFor(CONFIG.SETTINGS_BTN_SIZE)), 'kp-save-btn', CONFIG.SETTINGS_BTN_SIZE,
            colors.EMBED_SETTINGS_COLOR, colors.EMBED_IDLE_BG, colors.HOVER_BG, colors.HOVER_TEXT_COLOR);
        saveBtn.title = 'Закладки';
        const savedPanel = createSavedPanel();
        savedPanel.style.position = 'absolute';
        savedPanel.style.top = '100%';
        savedPanel.style.left = '0';
        savedPanel.style.marginTop = CONFIG.BUTTONS_GAP;
        savedWrapper.appendChild(saveBtn);
        savedWrapper.appendChild(savedPanel);
        if (isTouchDevice) {
            settingsBtn.style.opacity = '1'; settingsBtn.style.pointerEvents = 'auto'; settingsBtn.style.transform = 'scale(1)';
            saveBtn.style.opacity = '1'; saveBtn.style.pointerEvents = 'auto'; saveBtn.style.transform = 'scale(1)';
        } else {
            settingsBtn.style.opacity = '0'; settingsBtn.style.pointerEvents = 'none'; settingsBtn.style.transform = 'scale(0.5)';
            settingsBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            saveBtn.style.opacity = '0'; saveBtn.style.pointerEvents = 'none'; saveBtn.style.transform = 'scale(0.5)';
            saveBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            attachHoverBehaviour(group, [settingsBtn, saveBtn]);
        }
        attachPanelHandlers(settingsBtn, settingsPanel, saveBtn, savedPanel, positionEmbedPanel);
        group.appendChild(mainBtn);
        group.appendChild(settingsWrapper);
        group.appendChild(savedWrapper);
        target.appendChild(group);
        applyUpdateIndicator(_updateState === 'new');
    }

    function buildFixedUI() {
        const container = document.createElement('div');
        container.id = 'kp-btn-container';
        container.style.cssText = `position: fixed; z-index: 999999; display: flex; flex-direction: column; align-items: center; gap: 6px; user-select: none;`;
        applyFixedPosition(container);
        const isTop = settings.btnVertical === 'top';
        const colors = getThemeColors();
        let mainIdleBg, mainColor, mainHoverBg, mainHoverColor;
        if (isTop) {
            mainIdleBg = colors.FIXED_TOP_IDLE_BG; mainColor = colors.FIXED_TOP_COLOR;
            mainHoverBg = colors.FIXED_TOP_HOVER_BG; mainHoverColor = colors.FIXED_TOP_HOVER_COLOR;
        } else {
            mainIdleBg = colors.FIXED_MID_BOTTOM_IDLE_BG; mainColor = colors.FIXED_MID_BOTTOM_COLOR;
            mainHoverBg = colors.HOVER_BG; mainHoverColor = colors.HOVER_TEXT_COLOR;
        }
        const mainSize = isPhone ? CONFIG.PHONE_BTN_SIZE : CONFIG.BTN_SIZE;
        const settingsSize = isPhone ? CONFIG.PHONE_SETTINGS_BTN_SIZE : CONFIG.SETTINGS_BTN_SIZE;
        const mainBtn = createButton(svgIcon('play', iconSizeFor(mainSize)), 'kp-redirect-btn', mainSize,
            mainColor, mainIdleBg, mainHoverBg, mainHoverColor);
        mainBtn.title = `${getChannelName(settings.targetDomain)} канал`;
        mainBtn.addEventListener('click', redirectToChannel);
        const secondaryIdleBg = colors.EMBED_IDLE_BG;
        const secondaryColor = colors.EMBED_SETTINGS_COLOR;
        const secondaryHoverBg = colors.HOVER_BG;
        const secondaryHoverColor = colors.HOVER_TEXT_COLOR;
        const settingsWrapper = document.createElement('div');
        settingsWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const settingsBtn = createButton(svgIcon('settings', iconSizeFor(settingsSize)), 'kp-settings-btn', settingsSize,
            secondaryColor, secondaryIdleBg, secondaryHoverBg, secondaryHoverColor);
        settingsBtn.title = 'Настройки';
        const settingsPanel = createSettingsPanel();
        settingsPanel.style.position = 'absolute';
        settingsPanel.style.top = '0';
        const savedWrapper = document.createElement('div');
        savedWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const saveBtn = createButton(svgIcon('bookmark', iconSizeFor(settingsSize)), 'kp-save-btn', settingsSize,
            secondaryColor, secondaryIdleBg, secondaryHoverBg, secondaryHoverColor);
        saveBtn.title = 'Закладки';
        const savedPanel = createSavedPanel();
        savedPanel.style.position = 'absolute';
        savedPanel.style.top = '0';
        if (isTouchDevice) {
            settingsBtn.style.opacity = '1'; settingsBtn.style.pointerEvents = 'auto'; settingsBtn.style.transform = 'scale(1)';
            saveBtn.style.opacity = '1'; saveBtn.style.pointerEvents = 'auto'; saveBtn.style.transform = 'scale(1)';
        } else {
            settingsBtn.style.opacity = '0'; settingsBtn.style.pointerEvents = 'none'; settingsBtn.style.transform = 'scale(0.5)';
            settingsBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            saveBtn.style.opacity = '0'; saveBtn.style.pointerEvents = 'none'; saveBtn.style.transform = 'scale(0.5)';
            saveBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            attachHoverBehaviour(container, [settingsBtn, saveBtn]);
        }
        settingsWrapper.appendChild(settingsBtn);
        settingsWrapper.appendChild(settingsPanel);
        savedWrapper.appendChild(saveBtn);
        savedWrapper.appendChild(savedPanel);
        attachPanelHandlers(settingsBtn, settingsPanel, saveBtn, savedPanel, positionFixedPanel);
        container.appendChild(mainBtn);
        container.appendChild(settingsWrapper);
        container.appendChild(savedWrapper);
        document.body.appendChild(container);
        applyUpdateIndicator(_updateState === 'new');
    }

    function applyFixedPosition(container) {
        let posKey = `${settings.btnPosition}-${settings.btnVertical}`;
        if (isPhone && settings.btnVertical === 'top') posKey = `${settings.btnPosition}-middle`;
        const pos = CONFIG.POSITIONS[posKey] || CONFIG.POSITIONS['left-middle'];
        container.style.left = pos.left ? '12px' : 'auto';
        container.style.right = pos.left ? 'auto' : '12px';
        if (pos.vertical === 'top') {
            container.style.top = '12px'; container.style.bottom = 'auto'; container.style.transform = 'none';
        } else if (pos.vertical === 'bottom') {
            container.style.top = 'auto'; container.style.bottom = '12px'; container.style.transform = 'none';
        } else {
            container.style.top = '50%'; container.style.bottom = 'auto'; container.style.transform = 'translateY(-50%)';
        }
    }

    function createButton(content, id, size, color, idleBg, hoverBg, hoverTextColor) {
        const btn = document.createElement('div');
        if (id) btn.id = id;
        const isSvg = typeof content === 'string' && content.trim().startsWith('<svg');
        if (isSvg) btn.innerHTML = content;
        else btn.textContent = content;
        btn._baseColor = color;
        btn._idleBg = idleBg;
        btn._hoverBg = hoverBg;
        btn._hoverTextColor = hoverTextColor;
        Object.assign(btn.style, {
            width: `${size}px`, height: `${size}px`, borderRadius: '50%',
            background: idleBg, border: 'none', boxShadow: 'none',
            color: color, fontSize: `${size * 0.45}px`,
            lineHeight: isSvg ? '0' : `${size}px`,
            textAlign: 'center', cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s, color 0.2s',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            willChange: 'transform',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.background = btn._hoverBg;
            btn.style.color = btn._hoverTextColor;
            btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = btn._idleBg;
            btn.style.color = btn._baseColor;
            btn.style.transform = 'scale(1)';
        });
        return btn;
    }

    function setPanelUpdateWidth(panel, wide) {
        if (!panel) return;
        const baseMin = isPhone ? CONFIG.PHONE_PANEL_WIDTH : CONFIG.PANEL_MIN_WIDTH;
        panel.style.width = wide ? CONFIG.SAVED_PANEL_WIDTH : 'auto';
        panel.style.minWidth = wide ? CONFIG.SAVED_PANEL_WIDTH : baseMin;
    }

    function showSettingsView() {
        const panel = document.getElementById('kp-settings-panel');
        if (!panel) return;
        const s = panel.querySelector('#kp-settings-view');
        const u = panel.querySelector('#kp-update-view');
        if (s) s.style.display = 'flex';
        if (u) u.style.display = 'none';
        setPanelUpdateWidth(panel, false);
    }

    function showUpdateView() {
        const panel = document.getElementById('kp-settings-panel');
        if (!panel) return;
        if ((_updateState === 'ok' || _updateState === 'error') && _lastCheckTs && (Date.now() - _lastCheckTs) > CONFIG.STALE_UI_THRESHOLD) {
            _updateState = 'idle'; _updateResult = null;
        }
        const s = panel.querySelector('#kp-settings-view');
        const u = panel.querySelector('#kp-update-view');
        if (s) s.style.display = 'none';
        if (u) u.style.display = 'flex';
        setPanelUpdateWidth(panel, true);
        renderUpdateView(_updateState);
    }

    function renderUpdateView(state) {
        const panel = document.getElementById('kp-settings-panel');
        if (!panel) return;
        const icon = panel.querySelector('#kp-update-icon');
        const title = panel.querySelector('#kp-update-title');
        const versions = panel.querySelector('#kp-update-versions');
        const commitCard = panel.querySelector('#kp-update-commit');
        const commitText = panel.querySelector('#kp-commit-text');
        const actions = panel.querySelector('#kp-update-actions');
        if (!icon || !title || !versions || !actions) return;
        icon.className = 'kp-update-icon';
        icon.innerHTML = svgIcon('refresh', 22);
        title.className = 'kp-update-title';
        if (commitCard) commitCard.classList.remove('visible');
        const currentVerLine = `<span class="line"><span class="val ${state === 'ok' ? 'ok' : ''}">${escapeHtml(LOCAL_META.version)}</span></span>`;
        const currentDateLine = `<span class="line"><span class="val">${escapeHtml(LOCAL_META.date)}</span></span>`;
        if (state === 'loading') {
            void icon.offsetWidth;
            icon.classList.add('spin');
            title.textContent = 'Проверяю…';
            versions.innerHTML = currentVerLine + currentDateLine;
            actions.innerHTML = `<button class="kp-btn-primary" disabled>Проверка…</button>`;
            return;
        }
        if (state === 'idle') {
            title.textContent = 'Проверить обновление?';
            versions.innerHTML = currentVerLine + currentDateLine;
            actions.innerHTML = `<button id="kp-update-check-btn" class="kp-btn-primary">Проверить обновление</button>`;
            return;
        }
        if (state === 'ok') {
            icon.classList.add('ok'); icon.innerHTML = svgIcon('check', 22);
            title.classList.add('ok'); title.textContent = 'Всё актуально';
            versions.innerHTML = currentVerLine + currentDateLine;
            actions.innerHTML = `<button id="kp-update-check-btn" class="kp-btn-primary">Проверить ещё раз</button>`;
            return;
        }
        if (state === 'new') {
            const r = _updateResult || {};
            icon.classList.add('new'); icon.innerHTML = svgIcon('arrowUp', 22);
            title.classList.add('new'); title.textContent = 'Доступна новая версия';
            versions.innerHTML = `
                <span class="line"><span class="old">${escapeHtml(LOCAL_META.version)}</span><span class="arrow">→</span><span class="new">${escapeHtml(r.remoteVersion || '?')}</span></span>
                <span class="line"><span class="old">${escapeHtml(LOCAL_META.date)}</span><span class="arrow">→</span><span class="new">${escapeHtml(r.remoteDate || '—')}</span></span>`;
            if (commitCard && commitText) {
                commitText.textContent = r.changelog || 'Описание недоступно';
                commitCard.classList.add('visible');
            }
            actions.innerHTML = `<button id="kp-update-install-btn" class="kp-btn-primary warn">Обновить сейчас</button>`;
            return;
        }
        if (state === 'error') {
            icon.classList.add('err'); icon.innerHTML = svgIcon('alert', 22);
            title.classList.add('err'); title.textContent = 'Не удалось проверить';
            versions.innerHTML = currentVerLine + currentDateLine;
            actions.innerHTML = `<button id="kp-update-check-btn" class="kp-btn-primary">Повторить</button>`;
            return;
        }
    }

    async function performCheck({ silent }) {
        if (_checkInFlight) return;
        _checkInFlight = true;
        if (!silent) { _updateState = 'loading'; renderUpdateView('loading'); }
        try {
            const info = await fetchUpdateInfo();
            _updateResult = info; _lastCheckTs = Date.now(); _consecutiveErrors = 0;
            const cmp = compareVersions(LOCAL_META.version, info.remoteVersion);
            _updateState = cmp < 0 ? 'new' : 'ok';
            saveUpdateCache(_updateResult, _updateState);
            applyUpdateIndicator(_updateState === 'new');
            if (!silent) renderUpdateView(_updateState);
            else {
                const panel = document.getElementById('kp-settings-panel');
                if (panel && panel.style.display === 'flex') {
                    const updateView = panel.querySelector('#kp-update-view');
                    if (updateView && updateView.style.display !== 'none') renderUpdateView(_updateState);
                }
            }
        } catch (err) {
            console.error('Update check failed:', err);
            _consecutiveErrors++;
            if (!silent) {
                _updateResult = null; _lastCheckTs = Date.now(); _updateState = 'error';
                renderUpdateView('error');
                saveUpdateCache(null, 'error');
            }
        } finally { _checkInFlight = false; }
    }

    function checkForUpdates() { return performCheck({ silent: false }); }
    function silentCheckForUpdates() { return performCheck({ silent: true }); }

    function getNextCheckDelay() {
        if (_consecutiveErrors > 0) {
            const idx = Math.min(_consecutiveErrors - 1, CONFIG.ERROR_BACKOFF_MS.length - 1);
            return CONFIG.ERROR_BACKOFF_MS[idx];
        }
        return CONFIG.AUTO_CHECK_BASE_INTERVAL + Math.floor(Math.random() * CONFIG.AUTO_CHECK_JITTER);
    }

    function scheduleNextCheck() {
        if (_checkTimer) clearTimeout(_checkTimer);
        const delay = getNextCheckDelay();
        _checkTimer = setTimeout(() => { _checkTimer = null; runScheduledCheck(); }, delay);
    }

    function runScheduledCheck() {
        if (document.visibilityState === 'hidden') return;
        if (typeof navigator.onLine === 'boolean' && !navigator.onLine) { scheduleNextCheck(); return; }
        silentCheckForUpdates().finally(() => scheduleNextCheck());
    }

    function setupUpdateListeners() {
        if (!_visibilityListenerAttached) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && !_checkTimer && !_checkInFlight) scheduleNextCheck();
            });
            _visibilityListenerAttached = true;
        }
        if (!_onlineListenerAttached) {
            window.addEventListener('online', () => {
                if (!_checkTimer && !_checkInFlight && _consecutiveErrors > 0) scheduleNextCheck();
            });
            _onlineListenerAttached = true;
        }
    }

    function bootstrapUpdateCheck() {
        setupUpdateListeners();
        const cached = loadUpdateCache();
        if (cached) {
            _updateState = cached.state;
            _updateResult = cached.result;
            _lastCheckTs = cached.ts;
            applyUpdateIndicator(cached.state === 'new');
            scheduleNextCheck();
        } else {
            const delay = CONFIG.AUTO_CHECK_INITIAL_DELAY_MS + Math.floor(Math.random() * CONFIG.AUTO_CHECK_INITIAL_JITTER_MS);
            _checkTimer = setTimeout(() => { _checkTimer = null; runScheduledCheck(); }, delay);
        }
    }

    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'kp-settings-panel';
        if (!document.getElementById('kp-settings-panel-style')) injectStyleWhenHeadReady('kp-settings-panel-style', SETTINGS_PANEL_STYLES);
        const bgColor = getPanelBackground();
        const textColor = getPanelTextColor();
        const baseMinWidth = isPhone ? CONFIG.PHONE_PANEL_WIDTH : CONFIG.PANEL_MIN_WIDTH;
        Object.assign(panel.style, {
            zIndex: '1000001', background: bgColor, borderRadius: CONFIG.PANEL_RADIUS,
            color: textColor, fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: getPanelFontSize(),
            minWidth: baseMinWidth, maxWidth: 'calc(100vw - 24px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'none', flexDirection: 'column', gap: CONFIG.PANEL_GAP,
            padding: CONFIG.PANEL_PADDING, boxSizing: 'border-box'
        });

        const channelItemsHTML = CONFIG.CHANNELS.map(ch => {
            const isActive = ch.domain === settings.targetDomain;
            return `<div class="kp-dd-channel-item ${isActive ? 'active' : ''}" data-value="${ch.domain}">${escapeHtml(ch.name)}</div>`;
        }).join('');
        const currentChannelName = getChannelName(settings.targetDomain);

        const positionsKeys = isPhone ? CONFIG.PHONE_POSITIONS : CONFIG.DESKTOP_POSITIONS;
        let currentPosKey = `${settings.btnPosition}-${settings.btnVertical}`;
        if (!CONFIG.POSITIONS[currentPosKey]) currentPosKey = 'left-middle';
        if (isPhone && !CONFIG.PHONE_POSITIONS.includes(currentPosKey)) currentPosKey = 'left-middle';

        const positionItemsHTML = positionsKeys.map(key => {
            const isActive = key === currentPosKey;
            return `<div class="kp-dd-pos-item ${isActive ? 'active' : ''}" data-pos="${key}" title="${key}">${svgIcon(posToIconName(key), 18)}</div>`;
        }).join('');
        const posMenuCols = isPhone ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

        const embedToggleHTML = isPhone ? '' : `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Встроить</span>
                <button id="kp-embed-toggle" class="kp-embed-toggle" type="button" data-state="${settings.embedMode ? 'on' : 'off'}" aria-label="Переключить встраивание">
                    <span class="kp-embed-toggle-track"><span class="kp-embed-toggle-thumb"></span></span>
                </button>
            </div>`;

        const positionBlockDisplay = (isPhone || !settings.embedMode) ? 'flex' : 'none';
        const commitCardHeight = isPhone ? CONFIG.COMMIT_CARD_HEIGHT_PHONE : CONFIG.COMMIT_CARD_HEIGHT_DESKTOP;
        const updateIconSizeNum = isPhone ? 20 : 15;

        const themeToggleHTML = isPhone ? `
            <button id="kp-theme-toggle" class="kp-theme-toggle" type="button" data-theme="${settings.phoneTheme || 'dark'}" aria-label="Переключить тему">
                <span class="kp-theme-toggle-track">
                    <span class="kp-theme-toggle-icon kp-theme-icon-sun">${svgIcon('sun', 12)}</span>
                    <span class="kp-theme-toggle-icon kp-theme-icon-moon">${svgIcon('moon', 12)}</span>
                    <span class="kp-theme-toggle-thumb"></span>
                </span>
            </button>` : '';

        panel.innerHTML = `
            <div id="kp-settings-view" style="display:flex; flex-direction:column; gap:${CONFIG.PANEL_GAP};">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(127,127,127,0.18); padding-bottom: 4px; gap: 8px;">
                    <button id="kp-update-open-btn" class="kp-icon-btn" title="Обновление" style="color:${textColor};">${svgIcon('refresh', updateIconSizeNum)}</button>
                    ${themeToggleHTML}
                    <a id="kp-github-link" href="${CONFIG.GITHUB_URL}" target="_blank" rel="noopener" style="color:${textColor}; text-decoration:none; font-size:${isPhone ? '13px' : '12px'}; opacity:0.65; transition:opacity 0.15s; touch-action:manipulation; -webkit-tap-highlight-color:transparent;">GitHub</a>
                </div>
                <div style="display: flex; flex-direction: column; gap: ${CONFIG.PANEL_GAP};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Канал</span>
                        <div class="kp-dd-channel" id="kp-channel-dd" data-value="${settings.targetDomain}">
                            <div class="kp-dd-channel-trigger"><span id="kp-channel-dd-label">${escapeHtml(currentChannelName)}</span><span class="kp-dd-channel-chev">${svgIcon('chevronDown', 12)}</span></div>
                            <div class="kp-dd-channel-menu" id="kp-channel-dd-menu" style="background:${bgColor};">${channelItemsHTML}</div>
                        </div>
                    </div>
                    ${embedToggleHTML}
                    <div id="kp-position-block" style="display: ${positionBlockDisplay}; flex-direction: column; gap: ${CONFIG.PANEL_GAP};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Позиция</span>
                            <div class="kp-dd-pos" id="kp-pos-dd" data-value="${currentPosKey}">
                                <div class="kp-dd-pos-trigger"><span class="kp-dd-pos-icon" id="kp-pos-dd-icon">${svgIcon(posToIconName(currentPosKey), 18)}</span><span class="kp-dd-pos-chev">${svgIcon('chevronDown', 12)}</span></div>
                                <div class="kp-dd-pos-menu" id="kp-pos-dd-menu" style="background:${bgColor}; grid-template-columns: ${posMenuCols};">${positionItemsHTML}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="kp-update-view" style="display:none; flex-direction:column; gap:${CONFIG.PANEL_GAP};">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(127,127,127,0.18); padding-bottom: 4px; gap: 8px;">
                    <button id="kp-update-back-btn" class="kp-icon-btn" title="Назад" style="color:${textColor};">${svgIcon('arrowLeft', 17)}</button>
                    <span style="font-weight: 600; font-size: 13px; opacity: 0.65; text-align:center; flex:1;">Обновление</span>
                    <a href="${CONFIG.GITHUB_URL}" target="_blank" rel="noopener" style="color:${textColor}; text-decoration:none; font-size:${isPhone ? '13px' : '12px'}; opacity:0.65;">GitHub</a>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; padding:4px 2px 4px;">
                    <div class="kp-update-icon" id="kp-update-icon">${svgIcon('refresh', 22)}</div>
                    <div class="kp-update-title" id="kp-update-title">Проверить обновление?</div>
                    <div class="kp-update-versions" id="kp-update-versions"></div>
                    <div class="kp-commit-card" id="kp-update-commit" style="height:${commitCardHeight};">
                        <div class="kp-commit-header">Кинопоиск [Free]</div>
                        <div class="kp-commit-scroll"><div class="kp-commit-text" id="kp-commit-text"></div></div>
                    </div>
                    <div class="kp-update-actions" id="kp-update-actions"></div>
                </div>
            </div>`;

        const embedToggle = panel.querySelector('#kp-embed-toggle');
        const positionBlock = panel.querySelector('#kp-position-block');
        if (embedToggle) {
            embedToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const next = embedToggle.dataset.state === 'on' ? 'off' : 'on';
                embedToggle.dataset.state = next;
                if (positionBlock) positionBlock.style.display = next === 'on' ? 'none' : 'flex';
                settings.embedMode = (next === 'on');
                saveSettings();
                panel.style.display = 'none';
                currentUIUrl = null;
                createUI();
                showToast(next === 'on' ? 'Встроенный режим' : 'Фиксированный режим');
            });
        }

        const githubLink = panel.querySelector('#kp-github-link');
        if (githubLink) {
            githubLink.addEventListener('mouseenter', () => githubLink.style.opacity = '1');
            githubLink.addEventListener('mouseleave', () => githubLink.style.opacity = '0.65');
        }

        panel.querySelector('#kp-update-open-btn')?.addEventListener('click', (e) => { e.stopPropagation(); showUpdateView(); });
        panel.querySelector('#kp-update-back-btn')?.addEventListener('click', (e) => { e.stopPropagation(); showSettingsView(); });

        const channelDd = panel.querySelector('#kp-channel-dd');
        if (channelDd) {
            const channelLabel = channelDd.querySelector('#kp-channel-dd-label');
            const channelMenu = channelDd.querySelector('#kp-channel-dd-menu');
            channelDd.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.closest('.kp-dd-channel-item')) return;
                channelDd.classList.toggle('open');
            });
            channelMenu.querySelectorAll('.kp-dd-channel-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    channelDd.dataset.value = item.dataset.value;
                    channelLabel.textContent = item.textContent;
                    channelMenu.querySelectorAll('.kp-dd-channel-item').forEach(x => x.classList.remove('active'));
                    item.classList.add('active');
                    channelDd.classList.remove('open');
                    settings.targetDomain = item.dataset.value;
                    saveSettings();
                    showToast(`Канал: ${item.textContent}`);
                });
            });
        }

        const posDd = panel.querySelector('#kp-pos-dd');
        if (posDd) {
            const posDdIcon = posDd.querySelector('#kp-pos-dd-icon');
            const posDdMenu = posDd.querySelector('#kp-pos-dd-menu');
            posDd.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.closest('.kp-dd-pos-item')) return;
                posDd.classList.toggle('open');
            });
            posDdMenu.querySelectorAll('.kp-dd-pos-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = item.dataset.pos;
                    posDd.dataset.value = key;
                    posDdIcon.innerHTML = svgIcon(posToIconName(key), 18);
                    posDdMenu.querySelectorAll('.kp-dd-pos-item').forEach(x => x.classList.remove('active'));
                    item.classList.add('active');
                    posDd.classList.remove('open');
                    const pos = CONFIG.POSITIONS[key] || CONFIG.POSITIONS['left-middle'];
                    settings.btnPosition = pos.left ? 'left' : 'right';
                    settings.btnVertical = pos.vertical;
                    settings.embedMode = false;
                    if (embedToggle) embedToggle.dataset.state = 'off';
                    if (positionBlock) positionBlock.style.display = 'flex';
                    saveSettings();
                    panel.style.display = 'none';
                    currentUIUrl = null;
                    createUI();
                    showToast(`Позиция: ${key}`);
                });
            });
        }

        const themeToggle = panel.querySelector('#kp-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const next = (settings.phoneTheme === 'light') ? 'dark' : 'light';
                settings.phoneTheme = next;
                themeToggle.dataset.theme = next;
                saveSettings();
                invalidateThemeCache();
                applyThemeInPlace();
                showToast(next === 'light' ? 'Светлая тема' : 'Тёмная тема');
            });
        }

        panel.querySelector('#kp-update-actions')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            e.stopPropagation();
            if (btn.id === 'kp-update-check-btn') checkForUpdates();
            else if (btn.id === 'kp-update-install-btn') {
                const url = (_updateResult && _updateResult.url) || CONFIG.UPDATE_URL;
                window.open(url, '_blank', 'noopener');
            }
        });

        document.body.appendChild(panel);
        renderUpdateView(_updateState);
        applyUpdateIndicator(_updateState === 'new');
        return panel;
    }

    function parseMetaText(text) {
        const result = { year: '', genres: '' };
        if (!text) return result;
        let cleaned = text.trim().replace(/^с\s+/i, '');
        const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return result;
        const yearMatch = parts[0].match(/\d{4}/);
        if (yearMatch) result.year = yearMatch[0];
        const genreList = [];
        for (let i = 1; i < parts.length; i++) {
            const p = parts[i];
            if (/^\d+\s*(сезон|серия|серий|сезона|сезонов|мин|мин\.|ч|час|часа|часов)/i.test(p)) continue;
            genreList.push(p);
        }
        result.genres = genreList.join(', ');
        return result;
    }

    function extractKpId() {
        const m = window.location.href.match(/\/(film|series|tv)\/(\d+)/);
        return m ? m[2] : null;
    }

    function heuristicFindTitle() {
        const h1s = document.querySelectorAll('h1');
        let best = '';
        for (const h of h1s) {
            const txt = (h.textContent || '').trim();
            if (txt.length >= 2 && txt.length <= 150 && txt.length > best.length) best = txt;
        }
        return best;
    }

    function heuristicFindMeta() {
        const result = { year: '', genres: '' };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let count = 0, node;
        while ((node = walker.nextNode()) && count < 500) {
            count++;
            const text = (node.textContent || '').trim();
            if (text.length < 8 || text.length > 200) continue;
            const m = text.match(/^с?\s*(\d{4})\s*,/);
            if (m) {
                const parsed = parseMetaText(text);
                if (parsed.year) return parsed;
            }
        }
        return result;
    }

    function computeMovieData(kpId) {
        let title = '';
        const titleTextEl = document.querySelector('[data-tid="ecbdef09"]');
        if (titleTextEl) {
            const txt = (titleTextEl.textContent || '').trim();
            if (txt) title = txt;
        }
        if (!title) {
            const titleImg = document.querySelector('h1[class*="style_title__"] img[alt]') || document.querySelector('h1[class*="styles_movieTitleRoot"] img[alt]');
            if (titleImg) {
                const alt = (titleImg.getAttribute('alt') || '').trim();
                if (alt) title = alt;
            }
        }
        if (!title) {
            const el = document.querySelector('[data-tid="FilmTitle"]') || document.querySelector('h1[itemprop="name"] span');
            if (el) {
                const txt = (el.textContent || '').trim();
                if (txt) title = txt;
            }
        }
        if (!title) { const h = heuristicFindTitle(); if (h) title = h; }
        if (!title) title = document.title.split(' — ')[0] || 'Без названия';
        let year = '', genres = '';
        const metaEl = document.querySelector('[data-tid="70553ae9"]');
        if (metaEl) {
            const firstDiv = metaEl.querySelector('div');
            if (firstDiv) {
                const text = (firstDiv.textContent || '').trim();
                const parsed = parseMetaText(text);
                year = parsed.year;
                genres = parsed.genres;
            }
        }
        if (!year) {
            const yearLink = document.querySelector('[data-test-id="year"] a') || document.querySelector('a[href*="/year/"]');
            if (yearLink) year = (yearLink.textContent || '').trim();
            else {
                const m = document.title.match(/\((\d{4})\)/);
                if (m) year = m[1];
            }
        }
        if (!year) {
            const h = heuristicFindMeta();
            if (h.year) { year = h.year; genres = h.genres; }
        }
        if (!genres) {
            const genreLinks = document.querySelectorAll('[data-test-id="genres"] a[href*="/lists/movies/genre--"]');
            genres = Array.from(genreLinks).map(a => a.textContent.trim()).join(', ');
        }
        let posterUrl = '';
        const posterImg = document.querySelector('img[data-tid="d813cf42"]') || document.querySelector('.film-poster img') || document.querySelector('[data-tid="FilmPoster"] img');
        if (posterImg && posterImg.src) posterUrl = posterImg.src;
        else {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) posterUrl = ogImage.getAttribute('content');
        }
        if (!posterUrl && kpId) posterUrl = CONFIG.POSTER_TEMPLATE.replace('{id}', kpId);
        let rating = '';
        const ratingCandidates = document.querySelectorAll('[data-tid="939058a8"]');
        for (const el of ratingCandidates) {
            const text = el.textContent || '';
            const match = text.match(/([\d.]+)/);
            if (match) { rating = match[1]; break; }
        }
        if (!rating) {
            const ratingSelectors = ['.film-rating-value span', '[data-tid="kp-movie-rating.rating-value"] span', '.styles_rating__value', 'span[itemprop="ratingValue"]', 'meta[itemprop="ratingValue"]'];
            for (const sel of ratingSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const text = el.textContent || el.getAttribute('content') || '';
                    const match = text.match(/([\d.]+)/);
                    if (match) { rating = match[1]; break; }
                }
            }
        }
        return { id: kpId, title, year, posterUrl, rating, genres, addedAt: Date.now() };
    }

    function getCurrentMovieData() {
        const kpId = extractKpId();
        if (!kpId) return null;
        const now = Date.now();
        if (_movieDataCache.id === kpId && _movieDataCache.data && (now - _movieDataCache.ts) < CONFIG.MOVIE_DATA_CACHE_TTL) return _movieDataCache.data;
        const data = computeMovieData(kpId);
        if (data && data.title && data.title !== 'Без названия' && data.year) _movieDataCache = { id: kpId, data, ts: now };
        return data;
    }

    function getSavedMovies() {
        try { return JSON.parse(localStorage.getItem(CONFIG.SAVED_STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function setSavedMovies(arr) {
        try { localStorage.setItem(CONFIG.SAVED_STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
    }

    function saveMovie(movie) {
        const movies = getSavedMovies();
        const existing = movies.find(m => m.id === movie.id);
        if (existing) {
            if (existing.tabId !== activeTabId && tabs.some(t => t.id === existing.tabId)) {
                activeTabId = existing.tabId;
                saveActiveTabId();
                return 'switched';
            }
            return 'exists';
        }
        movies.push({ ...movie, tabId: activeTabId });
        setSavedMovies(movies);
        return 'saved';
    }

    function removeMovie(id, tabId) {
        const movies = getSavedMovies().filter(m => !(m.id === id && m.tabId === (tabId || activeTabId)));
        setSavedMovies(movies);
    }

    function applyImportedTabs(incomingTabs) {
        let totalAdded = 0;
        let tabsCreated = 0;
        const allExisting = getSavedMovies();
        const allExistingIds = new Set(allExisting.map(m => String(m.id)));

        incomingTabs.forEach(incoming => {
            const movies = incoming.movies || [];
            if (movies.length === 0) return;

            const incomingName = String(incoming.name || CONFIG.DEFAULT_TAB_NAME).slice(0, CONFIG.TAB_NAME_MAX);
            let targetTab = tabs.find(t => t.name.toLowerCase() === incomingName.toLowerCase());
            if (!targetTab) {
                targetTab = { id: 't' + Date.now() + Math.random(), name: incomingName, sort: 'date-desc' };
                tabs.push(targetTab);
                tabsCreated++;
            }

            movies.forEach((item, idx) => {
                let id, title, year, posterUrl, rating, genres;
                if (Array.isArray(item)) {
                    id = String(item[0] || '');
                    title = item[1] || '';
                    year = item[2] || '';
                    posterUrl = ''; rating = ''; genres = '';
                } else if (item && typeof item === 'object') {
                    id = String(item.id || '');
                    title = item.title || '';
                    year = item.year || '';
                    posterUrl = item.posterUrl || '';
                    rating = item.rating || '';
                    genres = item.genres || '';
                } else return;

                if (!id || allExistingIds.has(id)) return;
                allExisting.push({
                    id, title, year,
                    posterUrl: posterUrl || CONFIG.POSTER_TEMPLATE.replace('{id}', id),
                    rating, genres,
                    tabId: targetTab.id,
                    addedAt: Date.now() + idx
                });
                allExistingIds.add(id);
                totalAdded++;
            });
        });

        setSavedMovies(allExisting);
        saveTabs();
        return { totalAdded, tabsCreated };
    }

    function createSavedPanel() {
        if (document.getElementById('kp-saved-panel')) return document.getElementById('kp-saved-panel');
        if (!document.getElementById('kp-saved-panel-style')) injectStyleWhenHeadReady('kp-saved-panel-style', SETTINGS_PANEL_STYLES);

        const panel = document.createElement('div');
        panel.id = 'kp-saved-panel';
        panel.className = 'kp-saved-panel';
        panel.dataset.theme = isDarkTheme() ? 'dark' : 'light';
        panel.style.fontSize = getPanelFontSize();

        panel.innerHTML = `
            <div class="kp-saved-header">
                <div class="kp-saved-title">
                    <span style="opacity:0.65;">Закладки</span><span id="kp-saved-count"></span>
                </div>
                <div class="kp-saved-actions">
                    <button class="kp-saved-btn icon-only" id="kp-share-btn-el" title="Поделиться">
                        ${svgIcon('share', isPhone ? 16 : 13)}
                    </button>
                    <button class="kp-saved-btn" id="kp-save-current-btn" title="Сохранить текущий фильм в активную вкладку">
                        <span style="color:#ef4444;display:inline-flex;align-items:center;">${svgIcon('mapPin', isPhone ? 14 : 12)}</span><span>Сохранить</span>
                    </button>
                </div>
            </div>

            <div class="kp-tabs-bar">
                <div class="kp-tabs-scroll" id="kp-tabs-scroll"></div>
                <div class="kp-tabs-actions">
                    <div class="kp-sort-wrap">
                        <button class="kp-tab-action-btn" id="kp-sort-btn-el" title="Фильтр и управление вкладкой">
                            ${svgIcon('filter', isPhone ? 16 : 13)}
                        </button>
                        <div class="kp-sort-menu" id="kp-sort-menu">
                            <div class="kp-rename-row">
                                <button class="kp-rename-delete" id="kp-delete-tab-btn" title="Удалить вкладку">
                                    ${svgIcon('trash', 20)}
                                </button>
                                <input type="text" class="kp-rename-input" id="kp-rename-input" placeholder="Название" maxlength="${CONFIG.TAB_NAME_MAX}">
                                <button class="kp-rename-apply" id="kp-rename-confirm" title="Применить">
                                    ${svgIcon('check', 20)}
                                </button>
                            </div>
                            <div class="kp-sort-divider"></div>
                            <div class="kp-sort-section">Сортировка</div>
                            <div class="kp-sort-item active" data-sort="date-desc">${svgIcon('sortDateDesc', 12)}<span>Сначала новые</span></div>
                            <div class="kp-sort-item" data-sort="date-asc">${svgIcon('sortDateAsc', 12)}<span>Сначала старые</span></div>
                            <div class="kp-sort-item" data-sort="name-asc">${svgIcon('sortNameAsc', 12)}<span>По алфавиту А–Я</span></div>
                            <div class="kp-sort-item" data-sort="name-desc">${svgIcon('sortNameDesc', 12)}<span>По алфавиту Я–А</span></div>
                            <div class="kp-sort-item" data-sort="rating-desc">${svgIcon('sortRating', 12)}<span>По рейтингу КП</span></div>
                        </div>
                    </div>
                    <div class="kp-add-wrap">
                        <button class="kp-tab-action-btn" id="kp-add-btn-el" title="Добавить вкладку">
                            ${svgIcon('plus', isPhone ? 16 : 13)}
                        </button>
                        <div class="kp-add-popup" id="kp-add-popup">
                            <div class="kp-add-input-wrap">
                                <input type="text" class="kp-add-input" id="kp-add-input" placeholder="Название + Enter" maxlength="${CONFIG.TAB_NAME_MAX}">
                                <span class="kp-add-counter" id="kp-add-counter">0/${CONFIG.TAB_NAME_MAX}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="kp-saved-list" id="kp-saved-list"></div>

            <div class="kp-share-view" id="kp-share-view">
                <div class="kp-share-toggle" id="kp-share-toggle">
                    <button class="active" data-mode="current">Текущая вкладка</button>
                    <button data-mode="all">Все вкладки</button>
                </div>
                <button class="kp-share-qr-btn" id="kp-share-qr-btn">
                    ${svgIcon('qr', 14)}<span>Показать QR-код</span>
                </button>
                <div class="kp-share-link-row">
                    <input type="text" class="kp-share-link-input" id="kp-share-link-input" readonly value="">
                    <button class="kp-share-copy" id="kp-share-copy" title="Копировать">${svgIcon('copy', 14)}</button>
                </div>
                <div class="kp-share-actions">
                    <button class="kp-share-action-btn" id="kp-share-export">${svgIcon('upload', 13)}<span>Экспорт</span></button>
                    <button class="kp-share-action-btn" id="kp-share-import">${svgIcon('download', 13)}<span>Импорт</span></button>
                </div>
                <div class="kp-share-info" id="kp-share-info"></div>
            </div>
        `;

        document.body.appendChild(panel);

        const tabsScroll = panel.querySelector('#kp-tabs-scroll');
        const savedList = panel.querySelector('#kp-saved-list');
        const shareView = panel.querySelector('#kp-share-view');

        function renderTabs() {
            tabsScroll.innerHTML = '';
            tabs.forEach(tab => {
                const el = document.createElement('div');
                el.className = 'kp-tab' + (tab.id === activeTabId ? ' active' : '');
                el.dataset.id = tab.id;
                el.title = tab.name;
                const span = document.createElement('span');
                span.textContent = tab.name;
                el.appendChild(span);
                el.addEventListener('click', () => {
                    activeTabId = tab.id;
                    saveActiveTabId();
                    renderTabs();
                    renderSavedMovies();
                    updateRenameField();
                    if (shareView.classList.contains('open')) updateShareContent();
                });
                tabsScroll.appendChild(el);
            });
            const activeEl = tabsScroll.querySelector('.kp-tab.active');
            if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }

        tabsScroll.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                tabsScroll.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        const sortBtn = panel.querySelector('#kp-sort-btn-el');
        const sortMenu = panel.querySelector('#kp-sort-menu');
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.querySelector('#kp-add-popup').classList.remove('open');
            sortMenu.classList.toggle('open');
            if (sortMenu.classList.contains('open')) updateRenameField();
        });

        sortMenu.querySelectorAll('.kp-sort-item[data-sort]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const tab = getActiveTab();
                tab.sort = item.dataset.sort;
                saveTabs();
                sortMenu.querySelectorAll('.kp-sort-item[data-sort]').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                renderSavedMovies();
            });
        });

        panel.querySelector('#kp-rename-confirm').addEventListener('click', (e) => {
            e.stopPropagation();
            const val = panel.querySelector('#kp-rename-input').value.trim().slice(0, CONFIG.TAB_NAME_MAX);
            if (!val) return;
            const tab = getActiveTab();
            tab.name = val;
            saveTabs();
            renderTabs();
            sortMenu.classList.remove('open');
            showToast('Вкладка переименована');
        });

        panel.querySelector('#kp-delete-tab-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (tabs.length <= 1) {
                showToast('Нельзя удалить последнюю вкладку');
                return;
            }
            const idx = tabs.findIndex(t => t.id === activeTabId);
            if (idx === -1) return;
            const removed = tabs.splice(idx, 1)[0];
            const movies = getSavedMovies().filter(m => m.tabId !== removed.id);
            setSavedMovies(movies);
            activeTabId = tabs[Math.max(0, idx - 1)].id;
            saveTabs();
            saveActiveTabId();
            sortMenu.classList.remove('open');
            renderTabs();
            renderSavedMovies();
            updateRenameField();
            showToast(`Вкладка «${removed.name}» удалена`);
        });

        const addBtn = panel.querySelector('#kp-add-btn-el');
        const addPopup = panel.querySelector('#kp-add-popup');
        const addInput = panel.querySelector('#kp-add-input');
        const addCounter = panel.querySelector('#kp-add-counter');

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.remove('open');
            addPopup.classList.toggle('open');
            if (addPopup.classList.contains('open')) {
                addInput.value = '';
                addCounter.textContent = `0/${CONFIG.TAB_NAME_MAX}`;
                setTimeout(() => addInput.focus(), 50);
            }
        });

        addInput.addEventListener('input', () => {
            addCounter.textContent = `${addInput.value.length}/${CONFIG.TAB_NAME_MAX}`;
        });

        function createTab() {
            const name = addInput.value.trim().slice(0, CONFIG.TAB_NAME_MAX);
            if (!name) return;
            if (tabs.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                showToast('Вкладка с таким названием уже есть');
                return;
            }
            const id = 't' + Date.now();
            tabs.push({ id, name, sort: 'date-desc' });
            activeTabId = id;
            saveTabs();
            saveActiveTabId();
            addPopup.classList.remove('open');
            renderTabs();
            renderSavedMovies();
            updateRenameField();
            showToast(`Вкладка «${name}» создана`);
        }

        addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') createTab(); });

        const shareBtn = panel.querySelector('#kp-share-btn-el');
        const shareToggle = panel.querySelector('#kp-share-toggle');
        const shareQrBtn = panel.querySelector('#kp-share-qr-btn');
        const shareLink = panel.querySelector('#kp-share-link-input');
        const shareInfo = panel.querySelector('#kp-share-info');
        const shareCopy = panel.querySelector('#kp-share-copy');

        let shareMode = 'current';

        function resetShareView() {
            shareView.classList.remove('open');
            savedList.style.display = 'flex';
            panel.classList.remove('share-open');
            shareMode = 'current';
            shareToggle.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            const curBtn = shareToggle.querySelector('button[data-mode="current"]');
            if (curBtn) curBtn.classList.add('active');
        }

        function buildShareLinkForMode(mode) {
            const payload = { v: 1 };
            if (mode === 'all') {
                payload.tabs = tabs.map(t => {
                    const movies = getSavedMovies().filter(m => m.tabId === t.id);
                    return {
                        name: t.name,
                        movies: movies.map(m => [String(m.id), m.title || '', m.year || ''])
                    };
                }).filter(t => t.movies.length > 0);
            } else {
                const t = getActiveTab();
                const movies = getSavedMovies().filter(m => m.tabId === t.id);
                if (movies.length === 0) {
                    payload.tabs = [];
                } else {
                    payload.tabs = [{
                        name: t.name,
                        movies: movies.map(m => [String(m.id), m.title || '', m.year || ''])
                    }];
                }
            }
            const json = JSON.stringify(payload);
            const encoded = encodeToUrl(json);
            const baseUrl = location.origin + location.pathname;
            const sep = location.search ? '&' : '?';
            return baseUrl + sep + CONFIG.SHARE_QUERY_KEY + '=' + encoded;
        }

        function updateShareContent() {
            const activeMovies = getSavedMovies().filter(m => m.tabId === activeTabId);
            const allMovies = getSavedMovies();
            const totalMovies = shareMode === 'all' ? allMovies.length : activeMovies.length;
            const isEmpty = shareMode === 'current' ? activeMovies.length === 0 : allMovies.length === 0;

            if (isEmpty) {
                shareLink.value = '';
                shareCopy.disabled = true;
                shareQrBtn.disabled = true;
                shareQrBtn.title = 'Нечего делиться';
                if (shareMode === 'current') {
                    shareInfo.textContent = 'Текущая вкладка пуста — нечего делиться';
                } else {
                    shareInfo.textContent = 'Нет закладок для экспорта';
                }
                return;
            }

            const link = buildShareLinkForMode(shareMode);
            shareLink.value = link;
            shareCopy.disabled = false;
            shareQrBtn.title = 'Показать QR-код';

            if (shareMode === 'all') {
                const nonEmptyTabs = tabs.filter(t => getSavedMovies().some(m => m.tabId === t.id));
                shareInfo.textContent = `Все вкладки • ${nonEmptyTabs.length} шт • ${totalMovies} закладок • ${link.length} симв.`;
            } else {
                shareInfo.textContent = `Вкладка «${getActiveTab().name}» • ${totalMovies} закладок • ${link.length} симв.`;
            }

            if (link.length > CONFIG.QR_MAX_LENGTH) {
                shareQrBtn.disabled = true;
                shareQrBtn.title = 'Слишком много данных для QR-кода';
            } else {
                shareQrBtn.disabled = false;
            }
        }

        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.remove('open');
            addPopup.classList.remove('open');
            const isOpen = shareView.classList.contains('open');
            if (isOpen) {
                resetShareView();
            } else {
                shareView.classList.add('open');
                savedList.style.display = 'none';
                panel.classList.add('share-open');
                updateShareContent();
            }
        });

        shareToggle.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                shareMode = btn.dataset.mode;
                shareToggle.querySelectorAll('button').forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                updateShareContent();
            });
        });

        shareQrBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (shareQrBtn.disabled) return;
            const link = shareLink.value;
            if (!link) return;
            const qrUrl = CONFIG.QR_SERVICE_URL + '?size=300x300&margin=10&data=' + encodeURIComponent(link);
            window.open(qrUrl, '_blank', 'noopener');
        });

        shareCopy.addEventListener('click', (e) => {
            e.stopPropagation();
            if (shareCopy.disabled) return;
            const doCopy = () => showToast('Ссылка скопирована');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareLink.value).then(doCopy).catch(() => {
                    shareLink.select();
                    try { document.execCommand('copy'); doCopy(); } catch (err) {}
                });
            } else {
                shareLink.select();
                try { document.execCommand('copy'); doCopy(); } catch (err) {}
            }
        });

        panel.querySelector('#kp-share-export').addEventListener('click', (e) => {
            e.stopPropagation();
            exportToFile();
        });
        panel.querySelector('#kp-share-import').addEventListener('click', (e) => {
            e.stopPropagation();
            importFromFile().then(() => {
                updateShareContent();
                if (panel._renderTabs) panel._renderTabs();
                renderSavedMovies();
            });
        });

        panel.querySelector('#kp-save-current-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const movie = getCurrentMovieData();
            if (!movie) return;
            const result = saveMovie(movie);
            if (result === 'switched') {
                if (panel._renderTabs) panel._renderTabs();
                renderSavedMovies();
                showToast('Фильм уже в другой вкладке — переключились');
            } else if (result === 'saved') {
                renderSavedMovies();
                showToast('Добавлено в закладки');
            } else {
                showToast('Уже в закладках');
            }
        });

        function updateRenameField() {
            const tab = getActiveTab();
            panel.querySelector('#kp-rename-input').value = tab.name;
            sortMenu.querySelectorAll('.kp-sort-item[data-sort]').forEach(el => {
                el.classList.toggle('active', el.dataset.sort === tab.sort);
            });
            const delBtn = panel.querySelector('#kp-delete-tab-btn');
            if (delBtn) {
                if (tabs.length <= 1) {
                    delBtn.style.opacity = '0.4';
                    delBtn.style.cursor = 'not-allowed';
                    delBtn.title = 'Нельзя удалить последнюю';
                } else {
                    delBtn.style.opacity = '';
                    delBtn.style.cursor = '';
                    delBtn.title = 'Удалить вкладку';
                }
            }
        }

        function renderSavedMovies() {
            const tab = getActiveTab();
            let items = getSavedMovies().filter(m => m.tabId === tab.id);

            const sort = tab.sort;
            items = items.slice().sort((a, b) => {
                switch (sort) {
                    case 'date-desc':   return (b.addedAt || 0) - (a.addedAt || 0);
                    case 'date-asc':    return (a.addedAt || 0) - (b.addedAt || 0);
                    case 'name-asc':    return (a.title || '').localeCompare(b.title || '', 'ru');
                    case 'name-desc':   return (b.title || '').localeCompare(a.title || '', 'ru');
                    case 'rating-desc': return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
                    default: return 0;
                }
            });

            const countSpan = panel.querySelector('#kp-saved-count');
            if (countSpan) countSpan.textContent = items.length > 0 ? `: ${items.length}` : '';

            savedList.innerHTML = '';

            if (items.length === 0) {
                savedList.innerHTML = '<div class="kp-empty">В этой вкладке пока пусто</div>';
                return;
            }

            const cardHeight = 64;
            const deleteZoneWidth = isPhone ? CONFIG.PHONE_DELETE_ZONE_WIDTH : CONFIG.DESKTOP_DELETE_ZONE_WIDTH;

            const fragment = document.createDocumentFragment();
            items.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'kp-card';
                const poster = movie.posterUrl || (movie.id ? CONFIG.POSTER_TEMPLATE.replace('{id}', movie.id) : '');
                card.style.cssText = `
                    position: relative; height: ${cardHeight}px; flex-shrink: 0; border-radius: 20px;
                    background-image: url('${poster}'); background-size: cover; background-position: center;
                    background-color: #1a1e2e;
                    overflow: hidden; box-shadow: 0 0 0 1px rgba(0,0,0,0.1); cursor: pointer; transition: box-shadow 0.2s;
                    will-change: transform; backface-visibility: hidden;
                    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
                `;
                card.addEventListener('mouseenter', () => card.style.boxShadow = '0 0 0 1px #818cf8');
                card.addEventListener('mouseleave', () => card.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.1)');
                card.addEventListener('click', () => { window.location.href = `https://www.kinopoisk.ru/film/${movie.id}/`; });

                const overlay = document.createElement('div');
                overlay.style.cssText = `position: absolute; inset: -1px; background: linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%); border-radius: 20px; z-index: 1;`;
                card.appendChild(overlay);

                const info = document.createElement('div');
                info.style.cssText = `position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 6px 10px; padding-right: calc(${deleteZoneWidth} + 10px); color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); box-sizing: border-box;`;
                const displayTitle = escapeHtml(movie.title || ('ID ' + movie.id));
                const displayYear = escapeHtml(movie.year || '');
                const displayRating = escapeHtml(movie.rating || '');
                const displayGenres = movie.genres ? escapeHtml(movie.genres.split(', ').slice(0, 4).join(', ')) : '';
                info.innerHTML = `
                    <div style="font-weight:600; font-size:12px; line-height:1.3; word-wrap:break-word; overflow-wrap:break-word;">${displayTitle}</div>
                    <div style="font-size:10px; color:#ddd; margin-top:1px;">${displayYear}${displayRating ? ' • КП ' + displayRating : ''}</div>
                    ${displayGenres ? `<div style="font-size:9px; color:#aaa; margin-top:1px; line-height:1.3; word-wrap:break-word; overflow-wrap:break-word;">${displayGenres}</div>` : ''}
                `;
                card.appendChild(info);

                const deleteZone = document.createElement('div');
                deleteZone.setAttribute('title', 'Удалить из закладок');
                deleteZone.style.cssText = `
                    position: absolute; top: 0; right: 0; bottom: 0; width: ${deleteZoneWidth};
                    background: rgba(220, 38, 38, 0.35); border-radius: 0 20px 20px 0;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 4; cursor: pointer; color: #fff;
                    transition: background 0.15s; touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent; user-select: none;
                `;
                deleteZone.innerHTML = svgIcon('x', isPhone ? 16 : 12);
                deleteZone.addEventListener('mouseenter', () => { deleteZone.style.background = 'rgba(220, 38, 38, 0.55)'; });
                deleteZone.addEventListener('mouseleave', () => { deleteZone.style.background = 'rgba(220, 38, 38, 0.35)'; });
                deleteZone.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeMovie(movie.id, tab.id);
                    renderSavedMovies();
                });
                deleteZone.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    deleteZone.style.background = 'rgba(220, 38, 38, 0.7)';
                }, { passive: true });
                deleteZone.addEventListener('touchend', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeMovie(movie.id, tab.id);
                    renderSavedMovies();
                });
                card.appendChild(deleteZone);
                fragment.appendChild(card);
            });
            savedList.appendChild(fragment);
        }

        panel._renderTabs = renderTabs;
        panel._renderSavedMovies = renderSavedMovies;
        panel._updateRenameField = updateRenameField;
        panel._resetShareView = resetShareView;

        renderTabs();
        renderSavedMovies();
        updateRenameField();

        return panel;
    }

    function renderSavedMovies() {
        const panel = document.getElementById('kp-saved-panel');
        if (panel && panel._renderSavedMovies) panel._renderSavedMovies();
    }

    function encodeToUrl(str) {
        const utf8 = new TextEncoder().encode(str);
        let bin = '';
        utf8.forEach(b => bin += String.fromCharCode(b));
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function decodeFromUrl(encoded) {
        const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
        const bin = atob(padded);
        const bytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)));
        return new TextDecoder().decode(bytes);
    }

    function importFromUrl() {
        let encoded = null;
        try {
            const urlParams = new URLSearchParams(location.search);
            encoded = urlParams.get(CONFIG.SHARE_QUERY_KEY);
        } catch (e) {}
        if (!encoded) {
            const hash = location.hash;
            const prefix = '#' + CONFIG.SHARE_HASH_PREFIX;
            if (hash.startsWith(prefix)) encoded = hash.slice(prefix.length);
        }
        if (!encoded) return;

        try {
            const json = decodeFromUrl(encoded);
            const payload = JSON.parse(json);

            let incomingTabs = [];
            if (payload && typeof payload === 'object' && Array.isArray(payload.tabs)) {
                incomingTabs = payload.tabs.map(t => ({
                    name: String(t.name || CONFIG.DEFAULT_TAB_NAME).slice(0, CONFIG.TAB_NAME_MAX),
                    movies: Array.isArray(t.movies) ? t.movies : []
                }));
            } else if (Array.isArray(payload)) {
                incomingTabs = [{ name: CONFIG.DEFAULT_TAB_NAME, movies: payload }];
            } else {
                return;
            }

            const { totalAdded, tabsCreated } = applyImportedTabs(incomingTabs);

            if (totalAdded > 0) {
                showToast(`Импортировано ${totalAdded} закладок${tabsCreated > 0 ? `, создано вкладок: ${tabsCreated}` : ''}`);
                const panel = document.getElementById('kp-saved-panel');
                if (panel && panel._renderTabs) {
                    panel._renderTabs();
                    panel._renderSavedMovies();
                }
            } else {
                showToast('Новых закладок не найдено');
            }

            history.replaceState(null, '', location.pathname);
        } catch (e) {
            console.error('Import error:', e);
            showToast('Не удалось импортировать закладки');
        }
    }

    function enrichBookmarkFromPage() {
        const isKP = host === 'www.kinopoisk.ru' || host === 'kinopoisk.ru';
        if (!isKP) return;
        const id = extractKpId();
        if (!id) return;
        const movies = getSavedMovies();
        const idx = movies.findIndex(m => String(m.id) === id);
        if (idx === -1) return;
        let attempts = 0;
        const maxAttempts = 30;
        const tryEnrich = () => {
            const fresh = getCurrentMovieData();
            if (!fresh || !fresh.title || fresh.title === 'Без названия') {
                if (++attempts < maxAttempts) setTimeout(tryEnrich, 500);
                return;
            }
            const existing = movies[idx];
            const enriched = {
                ...existing,
                title: existing.title || fresh.title,
                year: existing.year || fresh.year,
                posterUrl: existing.posterUrl || fresh.posterUrl,
                rating: existing.rating || fresh.rating,
                genres: existing.genres || fresh.genres
            };
            if (JSON.stringify(enriched) !== JSON.stringify(existing)) {
                movies[idx] = enriched;
                setSavedMovies(movies);
                const panel = document.getElementById('kp-saved-panel');
                if (panel && panel.style.display === 'flex' && panel._renderSavedMovies) panel._renderSavedMovies();
            }
        };
        setTimeout(tryEnrich, 1500);
    }

    function exportToFile() {
        const movies = getSavedMovies();
        if (movies.length === 0) {
            showToast('Нет закладок для экспорта');
            return;
        }
        const payload = {
            version: 1,
            exportedAt: Date.now(),
            tabs: tabs
                .map(t => ({
                    name: t.name,
                    sort: t.sort,
                    movies: movies
                        .filter(m => m.tabId === t.id)
                        .map(m => ({
                            id: String(m.id),
                            title: m.title || '',
                            year: m.year || '',
                            posterUrl: m.posterUrl || '',
                            rating: m.rating || '',
                            genres: m.genres || '',
                            addedAt: m.addedAt || 0
                        }))
                }))
                .filter(t => t.movies.length > 0)
        };
        const data = JSON.stringify(payload, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kinopoisk-free-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Файл сохранён');
    }

    function importFromFile() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (!file) { input.remove(); resolve(); return; }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        let incomingTabs = [];

                        if (data && typeof data === 'object' && Array.isArray(data.tabs)) {
                            incomingTabs = data.tabs.map(t => ({
                                name: String(t.name || CONFIG.DEFAULT_TAB_NAME).slice(0, CONFIG.TAB_NAME_MAX),
                                movies: Array.isArray(t.movies) ? t.movies : []
                            }));
                        } else if (Array.isArray(data)) {
                            const nameToMovies = new Map();
                            data.forEach(m => {
                                if (!m || typeof m !== 'object') return;
                                const existingTab = tabs.find(t => t.id === m.tabId);
                                const name = existingTab ? existingTab.name : CONFIG.DEFAULT_TAB_NAME;
                                if (!nameToMovies.has(name)) nameToMovies.set(name, []);
                                nameToMovies.get(name).push(m);
                            });
                            incomingTabs = Array.from(nameToMovies.entries()).map(([name, movies]) => ({ name, movies }));
                        } else {
                            throw new Error('bad format');
                        }

                        const { totalAdded, tabsCreated } = applyImportedTabs(incomingTabs);

                        if (totalAdded > 0) {
                            showToast(`Импортировано ${totalAdded} закладок${tabsCreated > 0 ? `, создано вкладок: ${tabsCreated}` : ''}`);
                            const panel = document.getElementById('kp-saved-panel');
                            if (panel && panel._renderTabs) {
                                panel._renderTabs();
                                panel._renderSavedMovies();
                            }
                        } else {
                            showToast('Новых закладок не найдено');
                        }
                    } catch (err) {
                        showToast('Не удалось прочитать файл');
                    }
                    input.remove();
                    resolve();
                };
                reader.readAsText(file);
            });

            input.click();
        });
    }

    function startKinopoiskUI() { waitForThemeAndCreateUI(); }

    function waitForThemeAndCreateUI() {
        if (themeWaitActive) return;
        themeWaitActive = true;
        const startTime = Date.now();
        const maxWait = 3000;
        function check() {
            const btn = document.querySelector('button[class*="style_buttonLight__"], button[class*="style_buttonDark__"]');
            if (btn && btn.offsetParent !== null) { themeWaitActive = false; createUI(); }
            else if (Date.now() - startTime > maxWait) { themeWaitActive = false; createUI(); }
            else requestAnimationFrame(check);
        }
        check();
    }

    let lastUrl = window.location.href;
    function checkUrlChange() {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            currentUIUrl = null;
            invalidateThemeCache();
            _movieDataCache = { id: null, data: null, ts: 0 };
            window.__kpBodyReady = false;
            if (isRebuildMirror && !isBlockedPage) waitForRebuild();
            else if (isMirrorDomain() && !isBlockedPage) { if (isHabster) showBody(); }
            else if (!isBlockedPage) { themeWaitActive = false; waitForThemeAndCreateUI(); }
        }
    }

    if (!isBlockedPage && !isMirrorDomain()) {
        whenReady(() => { importFromUrl(); enrichBookmarkFromPage(); });
    }

    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function(...args) { origPushState.apply(this, args); checkUrlChange(); };
    history.replaceState = function(...args) { origReplaceState.apply(this, args); checkUrlChange(); };
    window.addEventListener('popstate', checkUrlChange);

    let _titleObserver = null;
    let _observedTitleEl = null;
    let _lastDocTitle = document.title;
    function ensureTitleObserver() {
        const t = document.querySelector('title');
        if (!t) return;
        if (t === _observedTitleEl && _titleObserver) return;
        if (_titleObserver) _titleObserver.disconnect();
        _observedTitleEl = t;
        _titleObserver = new MutationObserver(() => {
            if (document.title !== _lastDocTitle) {
                _lastDocTitle = document.title;
                checkUrlChange();
            }
        });
        _titleObserver.observe(t, { childList: true, characterData: true, subtree: true });
    }
    ensureTitleObserver();

    (function patchCheckUrlChange() {
        const original = checkUrlChange;
        checkUrlChange = function() {
            original.apply(this, arguments);
            ensureTitleObserver();
        };
    })();

    if (!isBlockedPage) {
        if (isRebuildMirror) waitForRebuild();
        else if (isMirrorDomain()) { if (isHabster) showBody(); }
        else startKinopoiskUI();
    }

    if (!isBlockedPage) bootstrapUpdateCheck();
})();
