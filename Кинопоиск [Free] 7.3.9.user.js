// ==UserScript==
// @name         Кинопоиск [Free]
// @namespace    http://tampermonkey.net/
// @version      7.3.9
// @description  Бесплатный просмотр фильмом и сериалов на сайте Кинопоиск
// @author       Nyanta
// @icon         https://www.kinopoisk.ru/favicon.ico
// @match        https://www.kinopoisk.ru/*
// @match        http://www.kinopoisk.ru/*
// @match        https://kinopoisk.ru/*
// @match        http://kinopoisk.ru/*
// @match        https://habster.sbs/*
// @match        https://kinopoisk.ws/*
// @match        https://kinopoisk.film/*
// @match        https://kinokino.vip/*
// @match        https://flcksbr.top/*
// @match        https://sspoisk.ru/*
// @match        https://nonchik.com/*
// @match        https://*.nonchik.com/*
// @match        https://fbfind.life/*
// @match        https://*.fbfind.life/*
// @match        https://fbfind.top/*
// @match        https://*.fbfind.top/*
// @match        https://villybizy.online/*
// @match        https://*.villybizy.online/*
// @downloadURL  https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js
// @updateURL    https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js
// @grant        none
// @run-at       document-start
// @license      Apache-2.0
// ==/UserScript==

/*
 * Copyright 2026 Nyanta
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

    // ═══════════════════════════════════════════════════════════════
    // КОНФИГУРАЦИЯ – изменяйте здесь внешний вид и поведение
    // ═══════════════════════════════════════════════════════════════
    const CONFIG = {
        STORAGE_KEY: 'kpRedirectSettings',   // ключ localStorage для настроек
        DEFAULT_DOMAIN: 'habster.sbs',       // канал по умолчанию
        CHANNELS: [                          // список каналов-зеркал
            { domain: 'habster.sbs',    name: 'Альфа' },
            { domain: 'kinopoisk.ws',   name: 'Браво' },
            { domain: 'kinopoisk.film', name: 'Гамма' },
            { domain: 'kinokino.vip',   name: 'Дельта' },
            { domain: 'flcksbr.top',    name: 'Танго' },
            { domain: 'sspoisk.ru',     name: 'Чарли' }
        ],
        BTN_SIZE: 52,                // диаметр основной кнопки ▶ (px)
        SETTINGS_BTN_SIZE: 36,       // диаметр кнопок ⚙️ и 📑 (px)
        POSITIONS: {                 // варианты позиций фиксированных кнопок
            'left-top':      { left: true,  vertical: 'top',    arrow: '🢄' },
            'left-middle':   { left: true,  vertical: 'middle', arrow: '🢀' },
            'left-bottom':   { left: true,  vertical: 'bottom', arrow: '🢇' },
            'right-top':     { left: false, vertical: 'top',    arrow: '🢅' },
            'right-middle':  { left: false, vertical: 'middle', arrow: '🢂' },
            'right-bottom':  { left: false, vertical: 'bottom', arrow: '🢆' }
        },
        EMBED_SELECTOR: '.styles_buttonsContainer__DCKJk', // контейнер для встроенных кнопок
        FALLBACK_SELECTORS: [
            '.film-header__buttons',
            '[class*="buttonsContainer"]',
            '[class*="Buttons_container"]'
        ],
        HOVER_BG: '#e5e5e5',           // фон кнопок при наведении
        HOVER_TEXT_COLOR: '#1a1a1a',   // цвет текста/иконок при наведении
        EMBED_IDLE_BG: '#f2f2f2',      // фон кнопок в покое (встроенный режим)
        EMBED_MAIN_COLOR: '#1a1a1a',   // цвет иконки ▶ (встроенный)
        EMBED_SETTINGS_COLOR: '#1a1a1a', // цвет иконок ⚙️/📑 (встроенный)
        FIXED_TOP_COLOR: '#f0f0f5',    // цвет иконки ▶ для позиций сверху
        FIXED_TOP_IDLE_BG: 'transparent',
        FIXED_MID_BOTTOM_IDLE_BG: '#f2f2f2',
        FIXED_MID_BOTTOM_COLOR: '#1a1a1a',
        FIXED_SETTINGS_COLOR_TOP: '#f0f0f5',
        FIXED_SETTINGS_COLOR_MID_BOT: '#1a1a1a',
        // Параметры панели настроек
        PANEL_BG: 'rgba(245, 245, 245, 0.28)',
        PANEL_BLUR: '24px',
        PANEL_RADIUS: '20px',
        PANEL_PADDING: '6px 8px',
        PANEL_TEXT_COLOR: '#1a1a1a',
        PANEL_BORDER: '1px solid rgba(255, 255, 255, 0.3)',
        PANEL_GAP: '6px',
        PANEL_OFFSET_X: 8,
        PANEL_MIN_WIDTH: '160px',
        PANEL_FONT_SIZE: '13px',
        EMBED_TIMEOUT: 5000,         // через сколько мс переключиться на fixed-режим, если контейнер не найден
        KP_HOME_URL: 'https://www.kinopoisk.ru',
        BUTTONS_GAP: '6px',          // расстояние между кнопками и до панелей
        SAVED_STORAGE_KEY: 'kpSavedMovies'  // ключ localStorage для закладок
    };

    // ═══════════════════════════════════════════════════════════════
    // ОПРЕДЕЛЕНИЯ ТИПА СТРАНИЦЫ
    // ═══════════════════════════════════════════════════════════════
    const host = window.location.hostname;
    const isRebuildMirror = host.match(/(fbfind\.(life|top)|villybizy\.online|flcksbr\.top|nonchik\.com)/) ||
                            CONFIG.CHANNELS.some(c => host.includes(c.domain));
    const isBlockedPage = window.location.pathname === '/blocked.html';

    // ---------- Самый ранний фон ДЛЯ ВСЕХ ЗЕРКАЛ (уменьшение мерцания) ----------
    if (isRebuildMirror) {
        const style = document.createElement('style');
        style.id = 'kp-base-bg-mirror';
        style.textContent = 'html, body { background: #0b0d14 !important; }';
        if (document.head) {
            document.head.appendChild(style);
        } else {
            const headObserver = new MutationObserver(() => {
                if (document.head) {
                    headObserver.disconnect();
                    document.head.appendChild(style);
                }
            });
            headObserver.observe(document.documentElement, { childList: true });
        }
    }

    // ---------- Самый ранний фон для blocked-страниц ----------
    if (isBlockedPage) {
        const style = document.createElement('style');
        style.id = 'kp-base-bg';
        style.textContent = 'html, body { background: #0b0d14 !important; }';
        if (document.head) {
            document.head.appendChild(style);
        } else {
            const headObserver = new MutationObserver(() => {
                if (document.head) {
                    headObserver.disconnect();
                    document.head.appendChild(style);
                }
            });
            headObserver.observe(document.documentElement, { childList: true });
        }
    }

    // ---------- Мгновенное глобальное скрытие ----------
    if (isRebuildMirror || isBlockedPage) {
        document.documentElement.style.visibility = 'hidden';
        document.documentElement.style.background = '#0b0d14';
    }

    // ---------- Ранняя очистка + надёжная блокировка tgMain ----------
    function injectEarlyCleanCSS() {
        const host = window.location.hostname;
        let css = '';

        if (host.match(/(fbfind\.(life|top)|villybizy\.online|flcksbr\.top)/)) {
            css = `#tgWrapper, .brand, .topAdPad, #TopAdMb, .adDown, #instructionModal, #tgMain, img[src*="tgimg.png"]{display:none!important}`;
        } else if (host.match(/nonchik\.com/)) {
            css = `.site-header,.social,.footer,.disclaimer,.spacer-md,#movie_video,#name,.h2{display:none!important}`;
        } else if (CONFIG.CHANNELS.some(c => host.includes(c.domain))) {
            css = `.header,.tg-banner,#unreleased-notice,ins,.share-bar,.footer,.info-tabs-bar,#panel-comments,.cw,#rkn-stub,#tgMain,img[src*="tgimg.png"]{display:none!important}`;
        }

        if (css) {
            const addStyle = () => {
                if (document.getElementById('kp-early-clean')) return;
                const style = document.createElement('style');
                style.id = 'kp-early-clean';
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
            };
            if (document.head) {
                addStyle();
            } else {
                const observer = new MutationObserver(() => {
                    if (document.head) {
                        observer.disconnect();
                        addStyle();
                    }
                });
                observer.observe(document.documentElement, { childList: true });
            }
        }

        // Дополнительный MutationObserver для мгновенного скрытия tgMain
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
            new MutationObserver(() => hideTgMain())
                .observe(document.documentElement, { childList: true, subtree: true });
        }
    }

    injectEarlyCleanCSS();

    function showBody() {
        document.documentElement.style.visibility = '';
        const baseBg = document.getElementById('kp-base-bg-mirror');
        if (baseBg) baseBg.remove();
        const baseBgBlocked = document.getElementById('kp-base-bg');
        if (baseBgBlocked) baseBgBlocked.remove();
        const hs = document.getElementById('kp-hide-body');
        if (hs) hs.remove();
    }

    function releaseBodyForSimpleMirrors() {
        if (isBlockedPage) return;
        const host = window.location.hostname;
        if (!host.match(/(fbfind|nonchik|villybizy|flcksbr)/) && CONFIG.CHANNELS.some(c => host.includes(c.domain))) {
            window.addEventListener('load', () => {
                setTimeout(showBody, 50);
            });
            setTimeout(showBody, 2000);
        }
    }
    releaseBodyForSimpleMirrors();

    // ---------- Стили для Gamma/Delta/Charlie/Tango ----------
    const ALFA_STYLES_GAMMA_TANGO = `
        :root {
            --bg: #0b0d14;
            --bg-card: #131620;
            --bg-elev: #1a1e2e;
            --accent: #818cf8;
            --accent-g: rgba(99,102,241,0.18);
            --text: #e2e8f0;
            --muted: #94a3b8;
            --dim: #64748b;
            --border: #1e2235;
            --radius: 14px;
            --gold: #fbbf24;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            background: var(--bg) !important;
            color: var(--text);
            font-family: system-ui, sans-serif;
            overflow-y: auto;
            margin: 0;
        }
        body::before {
            content: '';
            position: fixed; inset: 0;
            background-image: radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0);
            background-size: 30px 30px;
            pointer-events: none; z-index: 0;
        }
        #kp-alfa-page {
            position: relative; z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.25rem;
        }
        .player-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 18px;
            margin-bottom: 1.25rem;
        }
        .player-top-bar {
            display: flex; align-items: center;
            padding: 0.75rem 0.85rem 0;
            position: relative; z-index: 10;
            gap: 1rem;
        }
        .kp-select { position: relative; }
        .kp-select-trigger {
            display: flex; align-items: center; gap: 0.5rem;
            padding: 0.42rem 0.75rem;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: 9px;
            cursor: pointer; font-size: 0.84rem; font-weight: 500;
            color: var(--text); user-select: none;
            transition: border-color 0.15s;
        }
        .kp-select-trigger:hover { border-color: rgba(99,102,241,0.5); }
        .kp-select.open .kp-select-trigger {
            border-color: var(--accent);
            background: rgba(99,102,241,0.07);
        }
        .kp-select-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: var(--accent); box-shadow: 0 0 6px var(--accent);
        }
        .kp-select-chevron {
            color: var(--dim); transition: transform 0.2s;
        }
        .kp-select.open .kp-select-chevron { transform: rotate(180deg); }
        .kp-select-menu {
            position: absolute; top: calc(100% + 6px); left: 0;
            min-width: 190px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 11px; padding: 0.3rem;
            z-index: 100; display: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .kp-select.open .kp-select-menu { display: block; }
        .kp-select-item {
            display: flex; align-items: center; gap: 0.55rem;
            padding: 0.5rem 0.65rem;
            border-radius: 7px; cursor: pointer;
            font-size: 0.84rem; color: var(--muted);
            transition: background 0.12s, color 0.12s;
        }
        .kp-select-item:hover { background: var(--bg-elev); color: var(--text); }
        .kp-select-item.active { color: var(--accent); background: rgba(99,102,241,0.1); }
        .kp-select-num {
            width: 1.55rem; height: 1.55rem; border-radius: 6px;
            background: rgba(99,102,241,0.15); color: var(--accent);
            display: flex; align-items: center; justify-content: center;
            font-size: 0.73rem; font-weight: 700;
        }
        .kp-select-item.active .kp-select-num { background: rgba(99,102,241,0.3); }

        .vpn-warning {
            font-size: 0.75rem; color: var(--dim);
            display: flex; align-items: center; gap: 0.3rem;
            padding: 0.45rem 0.75rem 0.6rem;
        }
        .player-wrap {
            position: relative;
            margin: 0.75rem;
            border-radius: 0 0 14px 14px;
            overflow: hidden;
            z-index: 1;
        }
        .kinobox_iframe_container, .kinobox__iframeWrapper {
            position: relative;
            padding-top: 56.25% !important;
        }
        .kinobox_iframe, .kinobox__iframe {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            border: none; border-radius: 12px;
            background: #000;
        }

        .movie-info {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        .movie-info-inner { display: flex; gap: 1.5rem; }
        @media (max-width: 600px) { .movie-info-inner { flex-direction: column; } }
        .movie-poster-wrap { flex-shrink: 0; width: 130px; }
        .movie-poster-img { width: 100%; border-radius: 10px; display: block; background: var(--bg-elev); }
        .movie-details { flex: 1; min-width: 0; }
        .movie-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.2rem; line-height: 1.25; }
        .movie-orig { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.9rem; }
        .movie-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .meta-tag {
            font-size: 0.78rem; padding: 0.22rem 0.65rem;
            background: var(--bg-elev); border: 1px solid var(--border);
            border-radius: 20px; color: var(--muted);
        }
        .meta-tag.gold { color: var(--gold); border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.08); }
        .meta-tag.kp   { color: var(--accent); border-color: rgba(99,102,241,0.3); background: var(--accent-g); }
        .movie-rows { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .movie-row  { font-size: 0.85rem; }
        .movie-row-label { color: var(--dim); }
        .movie-row-val   { color: var(--text); }
        .movie-desc {
            font-size: 0.88rem; color: var(--muted);
            line-height: 1.65; border-top: 1px solid var(--border);
            padding-top: 0.9rem; margin-top: 0.5rem;
        }
        .kinobox_loader, .kinobox_menu_button, .kbt_select, .kbt_button,
        .kinobox__loaderWrapper, .kinobox__loader { display: none !important; }
    `;

    const BRAVO_STYLES = `
        :root {
            --bg: #0b0d14;
            --bg-card: #131620;
            --bg-elev: #1a1e2e;
            --accent: #818cf8;
            --accent-g: rgba(99,102,241,0.18);
            --text: #e2e8f0;
            --muted: #94a3b8;
            --dim: #64748b;
            --border: #1e2235;
            --radius: 14px;
            --gold: #fbbf24;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            background: var(--bg) !important;
            color: var(--text);
            font-family: system-ui, sans-serif;
            overflow-y: auto;
            margin: 0;
        }
        body::before {
            content: '';
            position: fixed; inset: 0;
            background-image: radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0);
            background-size: 30px 30px;
            pointer-events: none; z-index: 0;
        }
        #kp-alfa-page {
            position: relative; z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.25rem;
        }
        .player-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 18px;
            margin-bottom: 1.25rem;
        }
        .player-top-bar {
            display: flex; align-items: center;
            padding: 0.75rem 0.85rem 0;
            position: relative; z-index: 10;
            gap: 1rem;
        }
        .kp-torrent-btn {
            display: inline-flex; align-items: center;
            padding: 0.42rem 0.85rem;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: 9px;
            color: var(--accent);
            font-size: 0.84rem;
            text-decoration: none;
            transition: background 0.15s, border-color 0.15s;
            white-space: nowrap;
        }
        .kp-torrent-btn:hover {
            background: rgba(99,102,241,0.1);
            border-color: rgba(99,102,241,0.3);
            color: var(--text);
        }

        .vpn-warning {
            font-size: 0.75rem; color: var(--dim);
            display: flex; align-items: center; gap: 0.3rem;
            padding: 0.45rem 0.75rem 0.6rem;
        }
        .player-wrap {
            position: relative;
            padding-top: 56.25%;
            margin: 0.75rem;
            border-radius: 0 0 14px 14px;
            overflow: hidden;
            z-index: 1;
        }
        #film iframe {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            border: none; border-radius: 12px;
            background: #000;
        }

        .movie-info {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        .movie-info-inner { display: flex; gap: 1.5rem; }
        @media (max-width: 600px) { .movie-info-inner { flex-direction: column; } }
        .movie-poster-wrap { flex-shrink: 0; width: 130px; }
        .movie-poster-img { width: 100%; border-radius: 10px; display: block; background: var(--bg-elev); }
        .movie-details { flex: 1; min-width: 0; }
        .movie-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.2rem; line-height: 1.25; }
        .movie-orig { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.9rem; }
        .movie-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .meta-tag {
            font-size: 0.78rem; padding: 0.22rem 0.65rem;
            background: var(--bg-elev); border: 1px solid var(--border);
            border-radius: 20px; color: var(--muted);
        }
        .meta-tag.gold { color: var(--gold); border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.08); }
        .meta-tag.kp   { color: var(--accent); border-color: rgba(99,102,241,0.3); background: var(--accent-g); }
        .movie-rows { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .movie-row  { font-size: 0.85rem; }
        .movie-row-label { color: var(--dim); }
        .movie-row-val   { color: var(--text); }
        .movie-desc {
            font-size: 0.88rem; color: var(--muted);
            line-height: 1.65; border-top: 1px solid var(--border);
            padding-top: 0.9rem; margin-top: 0.5rem;
        }
    `;

    const BLOCKED_PAGE_STYLES = `
        :root {
            --bg: #0b0d14;
            --panel: #131620;
            --panel-soft: #1a1e2e;
            --border: #1e2235;
            --text: #e2e8f0;
            --muted: #94a3b8;
            --link: #818cf8;
            --radius: 18px;
        }
        body {
            background: var(--bg) !important;
            color: var(--text) !important;
            font-family: system-ui, sans-serif !important;
            overflow-y: auto !important;
            margin: 0 !important;
            visibility: visible !important;
        }
        body::before {
            content: '';
            position: fixed; inset: 0;
            background-image: radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0);
            background-size: 30px 30px;
            pointer-events: none; z-index: 0;
        }
        .page {
            position: relative; z-index: 1;
            height: auto !important;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.25rem !important;
            background: transparent !important;
        }
        .shell {
            max-width: 600px !important;
            width: 100% !important;
            background: var(--panel) !important;
            border-radius: var(--radius) !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
        }
        .topbar {
            background: var(--panel-soft) !important;
            border-bottom: 1px solid var(--border) !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            font-size: 1.1rem !important;
            color: #818cf8 !important;
        }
        .content {
            padding: 1.5rem !important;
            gap: 1rem !important;
        }
        h1 {
            font-size: 1.5rem !important;
            font-weight: 700 !important;
            margin: 0 0 0.5rem 0 !important;
            color: var(--text) !important;
        }
        .text {
            background: rgba(99,102,241,0.05) !important;
            border: 1px solid rgba(99,102,241,0.15) !important;
            border-radius: 12px !important;
            padding: 1.25rem !important;
            font-size: 0.9rem !important;
            line-height: 1.6 !important;
            color: var(--muted) !important;
        }
        .text b {
            color: var(--text) !important;
            font-weight: 600 !important;
        }
        footer {
            background: var(--panel-soft) !important;
            border-top: 1px solid var(--border) !important;
            padding: 0.75rem 1.5rem !important;
            display: flex !important;
            justify-content: center !important;
        }
        .footer-links {
            display: flex !important;
            align-items: center !important;
            gap: 1rem !important;
            font-size: 0.85rem !important;
        }
        .kp-home-btn {
            color: var(--link) !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
            font: inherit !important;
            cursor: pointer !important;
        }
        .kp-home-btn:hover {
            text-decoration: underline !important;
        }
        #licntBF6C, span[style="display: none;"] { display: none !important; }
    `;

    // ---------- Настройки ----------
    let settings = loadSettings();
    let currentUIUrl = null;
    let embedObserver = null;
    let embedTimeout = null;
    let embedRestoreTimeout = null;

    function loadSettings() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    targetDomain: parsed.targetDomain || CONFIG.DEFAULT_DOMAIN,
                    btnPosition: parsed.btnPosition || 'left',
                    btnVertical: parsed.btnVertical || 'middle',
                    embedMode: 'embedMode' in parsed ? parsed.embedMode : true
                };
            }
        } catch (e) {}
        return {
            targetDomain: CONFIG.DEFAULT_DOMAIN,
            btnPosition: 'left',
            btnVertical: 'middle',
            embedMode: true
        };
    }

    function saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {}
    }

    function isFilmOrSeriesPage(url = window.location.href) {
        return /\/film\/\d+/.test(url) ||
               /\/series\/\d+/.test(url) ||
               /\/tv\/\d+/.test(url) ||
               /\/episode\/\d+/.test(url);
    }

    function getChannelName(domain) {
        const ch = CONFIG.CHANNELS.find(c => c.domain === domain);
        return ch ? ch.name : domain;
    }

    function isMirrorDomain() {
        const host = window.location.hostname;
        return CONFIG.CHANNELS.some(c => host.includes(c.domain));
    }

    function isNonchikDomain() {
        return window.location.hostname.match(/nonchik\.com/);
    }

    function isFbfindDomain() {
        const host = window.location.hostname;
        return host.match(/(fbfind\.(life|top)|villybizy\.online|flcksbr\.top)/);
    }

    function showToast(message) {
        const old = document.getElementById('kp-toast');
        if (old) old.remove();
        const toast = document.createElement('div');
        toast.id = 'kp-toast';
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: '#2a2a2e', color: '#f0f0f5', padding: '10px 20px', borderRadius: '8px',
            border: '1px solid #4b4b52', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: '1000001', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '14px',
            transition: 'opacity 0.3s'
        });
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    function cleanPage() { }

    // ---------- Обработчик страницы «Контент удалён» ----------
    function applyBlockedStyles() {
        if (!document.getElementById('shell')) return;
        const style = document.createElement('style');
        style.id = 'kp-blocked-style';
        style.textContent = BLOCKED_PAGE_STYLES;
        document.head.appendChild(style);

        const shell = document.getElementById('shell');
        const textDiv = shell.querySelector('.text');
        if (textDiv) {
            textDiv.innerHTML = `
                <b>Выбранный Вами фильм или сериал удален по решению правообладателя.</b>
                <br><br>
                Вы можете выбрать другой фильм, сериал или канал в настройках.
                <br><br>
                Приносим извинения за неудобства, надеемся на Ваше понимание.
                <br><br>
                С уважением, Кинопоиск [Free].
            `;
        }
        const footerLinks = shell.querySelector('.footer-links');
        if (footerLinks) {
            footerLinks.querySelectorAll('a').forEach(a => a.remove());
            if (!footerLinks.querySelector('.kp-home-btn')) {
                const homeBtn = document.createElement('button');
                homeBtn.className = 'kp-home-btn';
                homeBtn.textContent = '← На главную';
                homeBtn.addEventListener('click', () => {
                    window.location.href = CONFIG.KP_HOME_URL;
                });
                footerLinks.appendChild(homeBtn);
            }
        }
        showBody();
    }

    function initBlockedPageObserver() {
        if (!isBlockedPage) return;
        const observer = new MutationObserver((mutations, obs) => {
            if (document.getElementById('shell')) {
                obs.disconnect();
                applyBlockedStyles();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        if (document.getElementById('shell')) {
            observer.disconnect();
            applyBlockedStyles();
        }
    }
    initBlockedPageObserver();

    // ---------- Функции перестройки зеркал ----------
    function getMirrorTypeForRebuild() {
        const host = window.location.hostname;
        if (host.includes('flcksbr.top')) return 'tango';
        if (host.includes('nonchik.com')) return 'bravo';
        return 'gamma';
    }

    function getMovieInfo() {
        const titleEl = document.querySelector('title');
        const docTitle = titleEl ? titleEl.textContent : document.title;
        const match = docTitle.match(/^(.+?)\s*\((\d{4})\)/);
        return match ? { name: match[1].trim(), year: match[2] } : null;
    }

    function addStylesIfNeeded(type) {
        const styleId = type === 'bravo' ? 'kp-bravo-style' : 'kp-alfa-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = type === 'bravo' ? BRAVO_STYLES : ALFA_STYLES_GAMMA_TANGO;
            document.head.appendChild(style);
        }
    }

    function rebuildMirror() {
        const type = getMirrorTypeForRebuild();
        if (type === 'gamma') {
            const iframeContainer = document.querySelector('.kinobox_iframe_container');
            const menuItems = [...document.querySelectorAll('.kinobox_menu li')];
            if (!iframeContainer || menuItems.length === 0) { showBody(); return; }
            const kpId = document.querySelector('.kinobox[data-kinopoisk]')?.getAttribute('data-kinopoisk') || '0';
            const movie = getMovieInfo();
            const container = document.createElement('div');
            container.id = 'kp-alfa-page';
            container.innerHTML = `
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
                    <div class="vpn-warning">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Плеер можно выбрать другой, нажмите на список
                    </div>
                    <div class="player-wrap" id="kp-player-wrap"></div>
                    <div class="vpn-warning">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        VPN может мешать воспроизведению
                    </div>
                </div>
                <div class="movie-info">
                    <div class="movie-info-inner">
                        <div class="movie-poster-wrap"><img class="movie-poster-img" id="kp-movie-poster" src="" alt=""></div>
                        <div class="movie-details" id="kp-movie-details">
                            <h1 class="movie-title"></h1><div class="movie-orig"></div><div class="movie-meta"></div><div class="movie-rows"></div><div class="movie-desc"></div>
                        </div>
                    </div>
                </div>
            `;
            const posterImg = container.querySelector('#kp-movie-poster');
            posterImg.src = `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${kpId}.jpg`;
            posterImg.onerror = () => { posterImg.src = 'data:image/svg+xml,...'; };
            if (movie) {
                container.querySelector('.movie-title').textContent = movie.name;
                container.querySelector('.movie-orig').textContent = movie.year;
            }
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
                const isActive = origItem.classList.contains('kinobox_menu_active') || origItem.classList.contains('kinobox__menuItem--active');
                if (isActive) { item.classList.add('active'); activeIndex = idx; selectLabel.textContent = origItem.textContent.replace(/^\d+\s*::\s*/, '').trim(); }
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
                menuItems[0].click(); selectLabel.textContent = menuItems[0].textContent.replace(/^\d+\s*::\s*/, '').trim();
                selectMenu.querySelector('.kp-select-item').classList.add('active');
            }
            const selectTrigger = container.querySelector('#kp-select-trigger');
            selectTrigger.addEventListener('click', (e) => { e.stopPropagation(); selectEl.classList.toggle('open'); });
            document.addEventListener('click', () => selectEl.classList.remove('open'));
            document.body.innerHTML = '';
            document.body.appendChild(container);
            addStylesIfNeeded('gamma');
        } else if (type === 'tango') {
            const iframeContainer = document.querySelector('.kinobox__iframeWrapper');
            const menuItems = [...document.querySelectorAll('.kinobox__menuItem')];
            if (!iframeContainer || menuItems.length === 0) { showBody(); return; }
            const kpId = document.querySelector('.kinobox[data-kinopoisk]')?.getAttribute('data-kinopoisk') || '0';
            const movie = getMovieInfo();
            const container = document.createElement('div');
            container.id = 'kp-alfa-page';
            container.innerHTML = `
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
                    <div class="vpn-warning">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Плеер можно выбрать другой, нажмите на список
                    </div>
                    <div class="player-wrap" id="kp-player-wrap"></div>
                    <div class="vpn-warning">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        VPN может мешать воспроизведению
                    </div>
                </div>
                <div class="movie-info">
                    <div class="movie-info-inner">
                        <div class="movie-poster-wrap"><img class="movie-poster-img" id="kp-movie-poster" src="" alt=""></div>
                        <div class="movie-details" id="kp-movie-details">
                            <h1 class="movie-title"></h1><div class="movie-orig"></div><div class="movie-meta"></div><div class="movie-rows"></div><div class="movie-desc"></div>
                        </div>
                    </div>
                </div>
            `;
            const posterImg = container.querySelector('#kp-movie-poster');
            posterImg.src = `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${kpId}.jpg`;
            if (movie) {
                container.querySelector('.movie-title').textContent = movie.name;
                container.querySelector('.movie-orig').textContent = movie.year;
            }
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
                const isActive = origItem.classList.contains('kinobox__menuItem--active');
                if (isActive) { item.classList.add('active'); activeIndex = idx; selectLabel.textContent = origItem.textContent.replace(/^\d+\s*::\s*/, '').trim(); }
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
                menuItems[0].click(); selectLabel.textContent = menuItems[0].textContent.replace(/^\d+\s*::\s*/, '').trim();
                selectMenu.querySelector('.kp-select-item').classList.add('active');
            }
            const selectTrigger = container.querySelector('#kp-select-trigger');
            selectTrigger.addEventListener('click', (e) => { e.stopPropagation(); selectEl.classList.toggle('open'); });
            document.addEventListener('click', () => selectEl.classList.remove('open'));
            document.body.innerHTML = '';
            document.body.appendChild(container);
            addStylesIfNeeded('tango');
        } else if (type === 'bravo') {
            rebuildBravo();
            return;
        }
        showBody();
    }

    function rebuildBravo() {
        const iframe = document.querySelector('#film iframe');
        const posterImg = document.querySelector('#film img');
        const torrentBtn = document.getElementById('ltorr');

        if (!iframe) {
            showBody();
            return;
        }

        const container = document.createElement('div');
        container.id = 'kp-alfa-page';
        container.innerHTML = `
            <div class="player-section">
                <div class="player-top-bar"></div>
                <div class="vpn-warning">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Плеер можно выбрать другой, нажмите на список
                </div>
                <div class="player-wrap" id="kp-player-wrap"></div>
                <div class="vpn-warning">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    VPN может мешать воспроизведению
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-info-inner">
                    <div class="movie-poster-wrap">
                        <img class="movie-poster-img" id="kp-movie-poster" src="" alt="">
                    </div>
                    <div class="movie-details" id="kp-movie-details">
                        <h1 class="movie-title"></h1>
                        <div class="movie-orig"></div>
                        <div class="movie-meta"></div>
                        <div class="movie-rows"></div>
                        <div class="movie-desc"></div>
                    </div>
                </div>
            </div>
        `;

        const newPoster = container.querySelector('#kp-movie-poster');
        if (posterImg && posterImg.src) {
            newPoster.src = posterImg.src;
        } else {
            const kpId = document.querySelector('script[data-kinopoisk]')?.getAttribute('data-kinopoisk') || '0';
            newPoster.src = `https://kinopoiskapiunofficial.tech/images/posters/kp_small/${kpId}.jpg`;
        }
        newPoster.onerror = () => { newPoster.src = 'data:image/svg+xml,...'; };

        const playerWrap = container.querySelector('#kp-player-wrap');
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:12px;background:#000;';
        playerWrap.appendChild(iframe);

        const playerTopBar = container.querySelector('.player-top-bar');
        if (torrentBtn) {
            torrentBtn.classList.add('kp-torrent-btn');
            torrentBtn.style.display = '';
            playerTopBar.appendChild(torrentBtn);
        }

        // ── Заполнение названия и года на Браво ──
        const movie = getMovieInfo();
        if (movie) {
            const titleEl = container.querySelector('.movie-title');
            const origEl = container.querySelector('.movie-orig');
            if (titleEl) titleEl.textContent = movie.name;
            if (origEl) origEl.textContent = movie.year || '';
        }

        document.body.innerHTML = '';
        document.body.appendChild(container);
        addStylesIfNeeded('bravo');
        showBody();
    }

    function waitForRebuild() {
        const type = getMirrorTypeForRebuild();
        if (type === 'bravo') {
            if (!/^\/\d+$/.test(window.location.pathname)) {
                showBody();
                return;
            }
            function isTorrentReady() {
                const btn = document.getElementById('ltorr');
                if (!btn) return false;
                const href = btn.getAttribute('href');
                return href && href.includes('torrent');
            }
            let iframeReady = false;
            let torrentReady = isTorrentReady();
            const observer = new MutationObserver((mutations, obs) => {
                if (!iframeReady && document.querySelector('#film iframe')) {
                    iframeReady = true;
                }
                if (!torrentReady && isTorrentReady()) {
                    torrentReady = true;
                }
                if (iframeReady && torrentReady) {
                    obs.disconnect();
                    rebuildBravo();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
            if (document.querySelector('#film iframe')) iframeReady = true;
            if (iframeReady && torrentReady) {
                observer.disconnect();
                rebuildBravo();
                return;
            }
            setTimeout(() => {
                if (!document.querySelector('#kp-alfa-page')) {
                    observer.disconnect();
                    rebuildBravo();
                }
            }, 5000);
            return;
        }

        let attempts = 0;
        const maxAttempts = 30;
        const interval = setInterval(() => {
            let iframeContainer, menuItems;
            if (type === 'gamma') {
                iframeContainer = document.querySelector('.kinobox_iframe_container');
                menuItems = document.querySelectorAll('.kinobox_menu li');
            } else {
                iframeContainer = document.querySelector('.kinobox__iframeWrapper');
                menuItems = document.querySelectorAll('.kinobox__menuItem');
            }
            if (iframeContainer && menuItems.length > 0) {
                clearInterval(interval);
                rebuildMirror();
            } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                showBody();
            }
        }, 200);
    }

    // ---------- UI Кинопоиска ----------
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
        if (embedRestoreTimeout) { clearTimeout(embedRestoreTimeout); embedRestoreTimeout = null; }
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
        embedObserver = new MutationObserver(() => {
            if (!isFilmOrSeriesPage() || !settings.embedMode) return;
            const target = findEmbedTarget();
            if (target && isContainerReady(target) && !document.querySelector('.kp-redirect-embed-group')) {
                if (embedRestoreTimeout) clearTimeout(embedRestoreTimeout);
                embedRestoreTimeout = setTimeout(() => {
                    if (findEmbedTarget() && isContainerReady(findEmbedTarget()) && !document.querySelector('.kp-redirect-embed-group') && settings.embedMode) {
                        buildEmbeddedUI(target);
                    }
                }, 50);
            }
        });
        embedObserver.observe(document.body, { childList: true, subtree: true });
    }

    function createUI() {
        if (currentUIUrl === window.location.href && document.querySelector('.kp-redirect-embed-group, #kp-btn-container')) return;
        currentUIUrl = window.location.href;
        removeOldUI();
        if (!isFilmOrSeriesPage()) return;
        if (settings.embedMode) {
            startEmbedMode();
        } else {
            buildFixedUI();
        }
    }

    // ========== ВСТРОЕННЫЙ РЕЖИМ (embed) ==========
    function buildEmbeddedUI(target) {
        target.querySelectorAll('.kp-redirect-embed-group').forEach(el => el.remove());

        const group = document.createElement('div');
        group.className = 'kp-redirect-embed-group';
        group.style.cssText = `display: inline-flex; align-items: center; gap: ${CONFIG.BUTTONS_GAP}; user-select: none;`;

        const mainBtn = createButton('▶', null, CONFIG.BTN_SIZE, CONFIG.EMBED_MAIN_COLOR, CONFIG.EMBED_IDLE_BG, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        mainBtn.title = `${getChannelName(settings.targetDomain)} канал`;
        mainBtn.addEventListener('click', () => {
            const newUrl = window.location.href.replace(/\/\/[^\/]*kinopoisk\.ru/, `//${settings.targetDomain}`);
            if (newUrl === window.location.href) showToast(`Вы уже на ${settings.targetDomain}`);
            else window.location.href = newUrl;
        });

        // Settings wrapper + btn
        const settingsWrapper = document.createElement('div');
        settingsWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const settingsBtn = createButton('⚙️', 'kp-settings-btn', CONFIG.SETTINGS_BTN_SIZE, CONFIG.EMBED_SETTINGS_COLOR, CONFIG.EMBED_IDLE_BG, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        settingsBtn.title = 'Настройки';
        settingsBtn.style.opacity = '0';
        settingsBtn.style.pointerEvents = 'none';
        settingsBtn.style.transform = 'scale(0.5)';
        settingsBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        const settingsPanel = createSettingsPanel();
        settingsPanel.style.position = 'absolute';
        settingsPanel.style.top = '100%';
        settingsPanel.style.left = '0';
        settingsPanel.style.marginTop = CONFIG.BUTTONS_GAP;
        settingsWrapper.appendChild(settingsBtn);
        settingsWrapper.appendChild(settingsPanel);

        // Saved wrapper + btn
        const savedWrapper = document.createElement('div');
        savedWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const saveBtn = createButton('📑', 'kp-save-btn', CONFIG.SETTINGS_BTN_SIZE, CONFIG.EMBED_SETTINGS_COLOR, CONFIG.EMBED_IDLE_BG, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        saveBtn.title = 'Сохраненные';
        saveBtn.style.opacity = '0';
        saveBtn.style.pointerEvents = 'none';
        saveBtn.style.transform = 'scale(0.5)';
        saveBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        const savedPanel = createSavedPanel();
        savedPanel.style.position = 'absolute';
        savedPanel.style.top = '100%';
        savedPanel.style.left = '0';
        savedPanel.style.marginTop = CONFIG.BUTTONS_GAP;
        savedWrapper.appendChild(saveBtn);
        savedWrapper.appendChild(savedPanel);

        // Hover effects
        group.addEventListener('mouseenter', () => {
            settingsBtn.style.opacity = '1'; settingsBtn.style.pointerEvents = 'auto'; settingsBtn.style.transform = 'scale(1)';
            saveBtn.style.opacity = '1'; saveBtn.style.pointerEvents = 'auto'; saveBtn.style.transform = 'scale(1)';
        });
        group.addEventListener('mouseleave', () => {
            settingsBtn.style.opacity = '0'; settingsBtn.style.pointerEvents = 'none'; settingsBtn.style.transform = 'scale(0.5)';
            saveBtn.style.opacity = '0'; saveBtn.style.pointerEvents = 'none'; saveBtn.style.transform = 'scale(0.5)';
        });

        // Click handlers with mutual closing
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPanel.style.display === 'flex') {
                settingsPanel.style.display = 'none';
                if (settingsPanel._outsideHandler) { document.removeEventListener('click', settingsPanel._outsideHandler); settingsPanel._outsideHandler = null; }
            } else {
                if (savedPanel.style.display === 'flex') {
                    savedPanel.style.display = 'none';
                    if (savedPanel._outsideHandler) { document.removeEventListener('click', savedPanel._outsideHandler); savedPanel._outsideHandler = null; }
                }
                settingsPanel.style.display = 'flex';
                const panelRect = settingsPanel.getBoundingClientRect();
                if (panelRect.right > window.innerWidth - 8) {
                    settingsPanel.style.left = 'auto'; settingsPanel.style.right = '0';
                } else {
                    settingsPanel.style.left = '0'; settingsPanel.style.right = 'auto';
                }
                const outsideHandler = (ev) => {
                    if (settingsBtn.contains(ev.target) || settingsPanel.contains(ev.target)) return;
                    settingsPanel.style.display = 'none';
                    document.removeEventListener('click', outsideHandler);
                    settingsPanel._outsideHandler = null;
                };
                document.addEventListener('click', outsideHandler);
                settingsPanel._outsideHandler = outsideHandler;
            }
        });

        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (savedPanel.style.display === 'flex') {
                savedPanel.style.display = 'none';
                if (savedPanel._outsideHandler) { document.removeEventListener('click', savedPanel._outsideHandler); savedPanel._outsideHandler = null; }
            } else {
                if (settingsPanel.style.display === 'flex') {
                    settingsPanel.style.display = 'none';
                    if (settingsPanel._outsideHandler) { document.removeEventListener('click', settingsPanel._outsideHandler); settingsPanel._outsideHandler = null; }
                }
                renderSavedMovies(savedPanel);
                savedPanel.style.display = 'flex';
                const panelRect = savedPanel.getBoundingClientRect();
                if (panelRect.right > window.innerWidth - 8) {
                    savedPanel.style.left = 'auto'; savedPanel.style.right = '0';
                } else {
                    savedPanel.style.left = '0'; savedPanel.style.right = 'auto';
                }
                const outsideHandler = (ev) => {
                    if (saveBtn.contains(ev.target) || savedPanel.contains(ev.target)) return;
                    savedPanel.style.display = 'none';
                    document.removeEventListener('click', outsideHandler);
                    savedPanel._outsideHandler = null;
                };
                document.addEventListener('click', outsideHandler);
                savedPanel._outsideHandler = outsideHandler;
            }
        });

        group.appendChild(mainBtn);
        group.appendChild(settingsWrapper);
        group.appendChild(savedWrapper);
        target.appendChild(group);
    }

    // ========== ФИКСИРОВАННЫЙ РЕЖИМ (fixed) ==========
    function buildFixedUI() {
        const container = document.createElement('div');
        container.id = 'kp-btn-container';
        container.style.cssText = `position: fixed; z-index: 999999; display: flex; flex-direction: column; align-items: center; gap: 6px; user-select: none;`;
        applyFixedPosition(container);

        const isTop = settings.btnVertical === 'top';
        const mainColor = isTop ? CONFIG.FIXED_TOP_COLOR : CONFIG.FIXED_MID_BOTTOM_COLOR;
        const mainIdleBg = isTop ? CONFIG.FIXED_TOP_IDLE_BG : CONFIG.FIXED_MID_BOTTOM_IDLE_BG;
        const mainBtn = createButton('▶', 'kp-redirect-btn', CONFIG.BTN_SIZE, mainColor, mainIdleBg, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        mainBtn.title = `${getChannelName(settings.targetDomain)} канал`;
        mainBtn.addEventListener('click', () => {
            const newUrl = window.location.href.replace(/\/\/[^\/]*kinopoisk\.ru/, `//${settings.targetDomain}`);
            if (newUrl === window.location.href) showToast(`Вы уже на ${settings.targetDomain}`);
            else window.location.href = newUrl;
        });

        // Settings
        const settingsWrapper = document.createElement('div');
        settingsWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const settingsColor = isTop ? CONFIG.FIXED_SETTINGS_COLOR_TOP : CONFIG.FIXED_SETTINGS_COLOR_MID_BOT;
        const settingsIdleBg = isTop ? CONFIG.FIXED_TOP_IDLE_BG : CONFIG.FIXED_MID_BOTTOM_IDLE_BG;
        const settingsBtn = createButton('⚙️', 'kp-settings-btn', CONFIG.SETTINGS_BTN_SIZE, settingsColor, settingsIdleBg, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        settingsBtn.title = 'Настройки';
        settingsBtn.style.opacity = '0';
        settingsBtn.style.pointerEvents = 'none';
        settingsBtn.style.transform = 'scale(0.5)';
        settingsBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        const settingsPanel = createSettingsPanel();
        settingsPanel.style.position = 'absolute';
        settingsPanel.style.top = 'auto';
        settingsPanel.style.bottom = 'auto';
        settingsPanel.style.left = 'auto';
        settingsPanel.style.right = 'auto';
        settingsPanel.style.margin = '0';
        settingsWrapper.appendChild(settingsBtn);
        settingsWrapper.appendChild(settingsPanel);

        // Saved
        const savedWrapper = document.createElement('div');
        savedWrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center;';
        const saveBtn = createButton('📑', 'kp-save-btn', CONFIG.SETTINGS_BTN_SIZE, settingsColor, settingsIdleBg, CONFIG.HOVER_BG, CONFIG.HOVER_TEXT_COLOR);
        saveBtn.title = 'Сохраненные';
        saveBtn.style.opacity = '0';
        saveBtn.style.pointerEvents = 'none';
        saveBtn.style.transform = 'scale(0.5)';
        saveBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        const savedPanel = createSavedPanel();
        savedPanel.style.position = 'absolute';
        savedPanel.style.top = 'auto';
        savedPanel.style.bottom = 'auto';
        savedPanel.style.left = 'auto';
        savedPanel.style.right = 'auto';
        savedPanel.style.margin = '0';
        savedWrapper.appendChild(saveBtn);
        savedWrapper.appendChild(savedPanel);

        container.addEventListener('mouseenter', () => {
            settingsBtn.style.opacity = '1'; settingsBtn.style.pointerEvents = 'auto'; settingsBtn.style.transform = 'scale(1)';
            saveBtn.style.opacity = '1'; saveBtn.style.pointerEvents = 'auto'; saveBtn.style.transform = 'scale(1)';
        });
        container.addEventListener('mouseleave', () => {
            settingsBtn.style.opacity = '0'; settingsBtn.style.pointerEvents = 'none'; settingsBtn.style.transform = 'scale(0.5)';
            saveBtn.style.opacity = '0'; saveBtn.style.pointerEvents = 'none'; saveBtn.style.transform = 'scale(0.5)';
        });

        // Позиционирование для fixed
        function positionFixedPanel(panel, anchorBtn) {
            const vert = settings.btnVertical;
            const horiz = settings.btnPosition;
            panel.style.top = 'auto'; panel.style.bottom = 'auto'; panel.style.left = 'auto'; panel.style.right = 'auto'; panel.style.margin = '0';
            if (vert === 'bottom') {
                panel.style.bottom = '0';
                if (horiz === 'left') { panel.style.left = '100%'; panel.style.marginLeft = CONFIG.BUTTONS_GAP; }
                else { panel.style.right = '100%'; panel.style.marginRight = CONFIG.BUTTONS_GAP; }
            } else {
                panel.style.top = '100%';
                panel.style.marginTop = CONFIG.BUTTONS_GAP;
                if (horiz === 'left') { panel.style.left = '0'; }
                else { panel.style.right = '0'; }
            }
            const rect = panel.getBoundingClientRect();
            const vw = window.innerWidth, vh = window.innerHeight;
            if (rect.right > vw - 8) { panel.style.left = 'auto'; panel.style.right = '0'; }
            if (rect.left < 8) { panel.style.left = '0'; panel.style.right = 'auto'; }
            if (vert !== 'bottom' && rect.bottom > vh) {
                panel.style.top = 'auto'; panel.style.bottom = '100%';
                panel.style.marginTop = '0'; panel.style.marginBottom = CONFIG.BUTTONS_GAP;
            }
            if (vert === 'bottom' && rect.top < 0) {
                panel.style.bottom = 'auto'; panel.style.top = '0';
            }
        }

        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPanel.style.display === 'flex') {
                settingsPanel.style.display = 'none';
                if (settingsPanel._outsideHandler) { document.removeEventListener('click', settingsPanel._outsideHandler); settingsPanel._outsideHandler = null; }
            } else {
                if (savedPanel.style.display === 'flex') {
                    savedPanel.style.display = 'none';
                    if (savedPanel._outsideHandler) { document.removeEventListener('click', savedPanel._outsideHandler); savedPanel._outsideHandler = null; }
                }
                settingsPanel.style.display = 'flex';
                positionFixedPanel(settingsPanel, settingsBtn);
                const outsideHandler = (ev) => {
                    if (settingsBtn.contains(ev.target) || settingsPanel.contains(ev.target)) return;
                    settingsPanel.style.display = 'none';
                    document.removeEventListener('click', outsideHandler);
                    settingsPanel._outsideHandler = null;
                };
                document.addEventListener('click', outsideHandler);
                settingsPanel._outsideHandler = outsideHandler;
            }
        });

        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (savedPanel.style.display === 'flex') {
                savedPanel.style.display = 'none';
                if (savedPanel._outsideHandler) { document.removeEventListener('click', savedPanel._outsideHandler); savedPanel._outsideHandler = null; }
            } else {
                if (settingsPanel.style.display === 'flex') {
                    settingsPanel.style.display = 'none';
                    if (settingsPanel._outsideHandler) { document.removeEventListener('click', settingsPanel._outsideHandler); settingsPanel._outsideHandler = null; }
                }
                renderSavedMovies(savedPanel);
                savedPanel.style.display = 'flex';
                positionFixedPanel(savedPanel, saveBtn);
                const outsideHandler = (ev) => {
                    if (saveBtn.contains(ev.target) || savedPanel.contains(ev.target)) return;
                    savedPanel.style.display = 'none';
                    document.removeEventListener('click', outsideHandler);
                    savedPanel._outsideHandler = null;
                };
                document.addEventListener('click', outsideHandler);
                savedPanel._outsideHandler = outsideHandler;
            }
        });

        container.appendChild(mainBtn);
        container.appendChild(settingsWrapper);
        container.appendChild(savedWrapper);
        document.body.appendChild(container);
    }

    function applyFixedPosition(container) {
        const posKey = `${settings.btnPosition}-${settings.btnVertical}`;
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

    // ========== Общие элементы ==========
    function createButton(text, id, size, color, idleBg, hoverBg, hoverTextColor) {
        const btn = document.createElement('div');
        if (id) btn.id = id;
        btn.textContent = text;
        btn._baseColor = color;
        btn._idleBg = idleBg;
        btn._hoverBg = hoverBg;
        btn._hoverTextColor = hoverTextColor;
        Object.assign(btn.style, {
            width: `${size}px`, height: `${size}px`, borderRadius: '50%',
            background: idleBg, border: 'none', boxShadow: 'none',
            color: color, fontSize: `${size * 0.45}px`, lineHeight: `${size}px`,
            textAlign: 'center', cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s, color 0.2s',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            willChange: 'transform'
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

    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'kp-settings-panel';
        Object.assign(panel.style, {
            zIndex: '1000001',
            background: CONFIG.PANEL_BG,
            backdropFilter: `blur(${CONFIG.PANEL_BLUR})`,
            WebkitBackdropFilter: `blur(${CONFIG.PANEL_BLUR})`,
            border: CONFIG.PANEL_BORDER,
            borderRadius: CONFIG.PANEL_RADIUS,
            padding: CONFIG.PANEL_PADDING,
            color: CONFIG.PANEL_TEXT_COLOR,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: CONFIG.PANEL_FONT_SIZE,
            minWidth: CONFIG.PANEL_MIN_WIDTH,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'none',
            flexDirection: 'column',
            gap: CONFIG.PANEL_GAP
        });
        const channelOptions = CONFIG.CHANNELS.map(ch =>
            `<option value="${ch.domain}" ${settings.targetDomain === ch.domain ? 'selected' : ''}>${ch.name}</option>`
        ).join('');
        const embedChecked = settings.embedMode ? 'checked' : '';
        const positionOptions = Object.keys(CONFIG.POSITIONS).map(key => {
            const pos = CONFIG.POSITIONS[key];
            const sel = settings.btnPosition === (pos.left ? 'left' : 'right') && settings.btnVertical === pos.vertical ? 'selected' : '';
            return `<option value="${key}" ${sel}>${pos.arrow}</option>`;
        }).join('');
        const elementBorderRadius = CONFIG.PANEL_RADIUS;
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 4px; margin-bottom: 0;">
                <span style="font-weight: 600; font-size: 15px;">Настройки</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: ${CONFIG.PANEL_GAP};">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Канал</span>
                    <select id="kp-domain-select" style="
                        background:#fff; border:1px solid #ccc; border-radius:${elementBorderRadius};
                        padding:3px 6px; color:#1a1a1a; font-size:${CONFIG.PANEL_FONT_SIZE}; width:auto; min-width:fit-content;">
                        ${channelOptions}
                    </select>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Встроить</span>
                    <input type="checkbox" id="kp-embed-mode" ${embedChecked} style="width:18px; height:18px;">
                </label>
                <div id="kp-position-block" style="display: ${settings.embedMode ? 'none' : 'flex'}; flex-direction: column;">
                    <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
                        <span>Позиция</span>
                        <select id="kp-position-select" style="
                            background:#fff; border:1px solid #ccc; border-radius:${elementBorderRadius};
                            padding:3px 6px; color:#1a1a1a; font-size:${CONFIG.PANEL_FONT_SIZE};">
                            ${positionOptions}
                        </select>
                    </label>
                </div>
            </div>
            <button id="kp-save-settings" style="
                background:#427552; border:none; color:#fff; padding:6px 0;
                border-radius:${elementBorderRadius}; font-weight:600; cursor:pointer; transition:0.2s;
                font-size:${CONFIG.PANEL_FONT_SIZE}; margin-top:2px;">
                Сохранить
            </button>
        `;
        const embedCheckbox = panel.querySelector('#kp-embed-mode');
        const positionBlock = panel.querySelector('#kp-position-block');
        embedCheckbox.addEventListener('change', () => { positionBlock.style.display = embedCheckbox.checked ? 'none' : 'flex'; });
        panel.querySelector('#kp-save-settings').addEventListener('click', () => {
            settings.targetDomain = panel.querySelector('#kp-domain-select').value;
            settings.embedMode = embedCheckbox.checked;
            if (!settings.embedMode) {
                const posKey = panel.querySelector('#kp-position-select').value;
                const pos = CONFIG.POSITIONS[posKey];
                settings.btnPosition = pos.left ? 'left' : 'right';
                settings.btnVertical = pos.vertical;
            }
            saveSettings();
            panel.style.display = 'none';
            if (panel._outsideHandler) { document.removeEventListener('click', panel._outsideHandler); panel._outsideHandler = null; }
            showToast('Настройки сохранены');
            currentUIUrl = null;
            createUI();
        });
        document.body.appendChild(panel);
        return panel;
    }

    // ========== ФУНКЦИИ ЗАКЛАДОК ==========
    window.getCurrentMovieData = function() {
        const url = window.location.href;
        const idMatch = url.match(/\/(film|series|tv)\/(\d+)/);
        const kpId = idMatch ? idMatch[2] : null;
        if (!kpId) return null;

        let title = document.title.split(' — ')[0] || 'Без названия';
        const titleEl = document.querySelector('[data-tid="FilmTitle"]') || document.querySelector('h1[itemprop="name"] span');
        if (titleEl) title = titleEl.textContent.trim();

        let year = '';
        const yearLink = document.querySelector('[data-test-id="year"] a') || document.querySelector('a[href*="/year/"]');
        if (yearLink) { year = yearLink.textContent.trim(); } else { const m = document.title.match(/\((\d{4})\)/); if (m) year = m[1]; }

        let posterUrl = '';
        const posterImg = document.querySelector('img[data-tid="d813cf42"]') || document.querySelector('.film-poster img') || document.querySelector('[data-tid="FilmPoster"] img');
        if (posterImg?.src) { posterUrl = posterImg.src; } else {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) posterUrl = ogImage.getAttribute('content');
        }

        let rating = '';
        const ratingSelectors = ['.film-rating-value span[data-tid="939058a8"]', '.film-rating-value span', '[data-tid="kp-movie-rating.rating-value"] span', '.styles_rating__value', 'span[itemprop="ratingValue"]', 'meta[itemprop="ratingValue"]'];
        for (const sel of ratingSelectors) {
            const el = document.querySelector(sel);
            if (el) { const text = el.textContent || el.getAttribute('content') || ''; const match = text.match(/([\d.]+)/); if (match) { rating = match[1]; break; } }
        }

        let genres = '';
        const genreLinks = document.querySelectorAll('[data-test-id="genres"] a[href*="/lists/movies/genre--"]');
        genres = Array.from(genreLinks).map(a => a.textContent.trim()).join(', ');

        return { id: kpId, title, year, posterUrl, rating, genres, addedAt: Date.now() };
    };

    function getSavedMovies() { try { return JSON.parse(localStorage.getItem(CONFIG.SAVED_STORAGE_KEY) || '[]'); } catch(e) { return []; } }
    function saveMovie(movie) { const movies = getSavedMovies(); if (!movies.some(m => m.id === movie.id)) { movies.push(movie); localStorage.setItem(CONFIG.SAVED_STORAGE_KEY, JSON.stringify(movies)); return true; } return false; }
    function removeMovie(id) { const movies = getSavedMovies().filter(m => m.id !== id); localStorage.setItem(CONFIG.SAVED_STORAGE_KEY, JSON.stringify(movies)); }

    let realHeaderHeightSaved = 0;
    function createSavedPanel() {
        if (document.getElementById('kp-saved-panel')) return document.getElementById('kp-saved-panel');
        const panel = document.createElement('div');
        panel.id = 'kp-saved-panel';
        Object.assign(panel.style, {
            zIndex: '1000001',
            background: '#f5f5f5',
            borderRadius: '20px',
            color: '#1a1a1a',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '13px',
            width: '260px',
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        });
        const hideScrollStyle = document.createElement('style');
        hideScrollStyle.textContent = '#kp-saved-panel *::-webkit-scrollbar { display: none; }';
        document.head.appendChild(hideScrollStyle);

        const header = document.createElement('div');
        header.style.cssText = 'flex-shrink: 0; background: #f5f5f5; padding: 6px 10px 4px; border-bottom: 1px solid rgba(0,0,0,0.1);';
        header.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:600; font-size:15px;">Сохраненные</span>
                <button id="kp-save-current-btn" style="
                    background:#427552; border:none; color:#fff; padding:3px 10px;
                    border-radius:20px; font-size:12px; cursor:pointer; font-weight:600;">
                    📍Сохранить
                </button>
            </div>
        `;
        panel.appendChild(header);

        const list = document.createElement('div');
        list.id = 'kp-saved-list';
        list.style.cssText = 'flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding: 4px 6px;';
        list.style.setProperty('scrollbar-width', 'none', 'important');
        list.style.setProperty('-ms-overflow-style', 'none', 'important');
        panel.appendChild(list);

        document.body.appendChild(panel);

        const prevDisplay = panel.style.display;
        const prevVisibility = panel.style.visibility;
        panel.style.display = 'flex';
        panel.style.visibility = 'hidden';
        panel.style.height = 'auto';
        realHeaderHeightSaved = header.getBoundingClientRect().height;
        panel.style.display = prevDisplay;
        panel.style.visibility = prevVisibility;
        panel.style.height = '';

        panel.querySelector('#kp-save-current-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const movie = getCurrentMovieData();
            if (movie) {
                saveMovie(movie);
                renderSavedMovies(panel);
            }
        });

        return panel;
    }

    function measureAndSetHeight(panel, list, count) {
        if (count === 0) {
            panel.style.height = realHeaderHeightSaved + 'px';
            return;
        }
        const prevDisplay = panel.style.display;
        const prevOpacity = panel.style.opacity;
        const prevOverflow = panel.style.overflow;
        const prevListOverflow = list.style.overflowY;

        panel.style.display = 'flex';
        panel.style.opacity = '0';
        panel.style.height = 'auto';
        panel.style.overflow = 'hidden';
        list.style.overflowY = 'visible';
        panel.offsetHeight;

        const listHeight = list.scrollHeight;
        if (count <= 3) {
            panel.style.height = realHeaderHeightSaved + listHeight + 'px';
        } else {
            panel.style.height = '245px';
        }

        panel.style.display = prevDisplay;
        panel.style.opacity = prevOpacity || '1';
        panel.style.overflow = prevOverflow || 'hidden';
        list.style.overflowY = prevListOverflow || 'auto';
    }

    function renderSavedMovies(panel) {
        const list = panel.querySelector('#kp-saved-list');
        const movies = getSavedMovies();
        list.innerHTML = '';

        if (movies.length === 0) {
            list.innerHTML = '<div style="color:#888; text-align:center; padding:8px;">Пока ничего не сохранено</div>';
            panel.style.height = realHeaderHeightSaved + 'px';
            return;
        }

        movies.sort((a, b) => b.addedAt - a.addedAt);
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.style.cssText = `
                position: relative; height: 64px; flex-shrink: 0; border-radius: 10px;
                background-image: url('${movie.posterUrl || ''}'); background-size: cover; background-position: center;
                overflow: hidden; border: 1px solid rgba(0,0,0,0.1); cursor: pointer; transition: border-color 0.2s;
                will-change: transform; backface-visibility: hidden;
            `;
            card.addEventListener('mouseenter', () => card.style.borderColor = '#818cf8');
            card.addEventListener('mouseleave', () => card.style.borderColor = 'rgba(0,0,0,0.1)');
            card.addEventListener('click', () => { window.location.href = `https://www.kinopoisk.ru/film/${movie.id}/`; });

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%); border-radius: 10px; z-index: 1;';
            card.appendChild(overlay);

            const info = document.createElement('div');
            info.style.cssText = 'position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 6px 10px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); box-sizing: border-box;';
            const displayGenres = movie.genres ? movie.genres.split(', ').slice(0, 4).join(', ') : '';
            info.innerHTML = `
                <div style="font-weight:600; font-size:12px; line-height:1.3; word-wrap:break-word; overflow-wrap:break-word;">${movie.title}</div>
                <div style="font-size:10px; color:#ddd; margin-top:1px;">${movie.year || ''} ${movie.rating ? '• КП ' + movie.rating : ''}</div>
                ${displayGenres ? `<div style="font-size:9px; color:#aaa; margin-top:1px; line-height:1.3; word-wrap:break-word; overflow-wrap:break-word;">${displayGenres}</div>` : ''}
            `;
            card.appendChild(info);

            const delBtn = document.createElement('div');
            delBtn.textContent = '✕';
            delBtn.style.cssText = 'position: absolute; top: 2px; right: 4px; z-index: 3; cursor: pointer; font-size: 13px; color: #ff4444; opacity: 0.9; text-shadow: 0 1px 3px rgba(0,0,0,0.5); padding: 2px;';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeMovie(movie.id);
                renderSavedMovies(panel);
            });
            card.appendChild(delBtn);
            list.appendChild(card);
        });
        measureAndSetHeight(panel, list, movies.length);
    }

    function startKinopoiskUI() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(createUI, 200));
        } else {
            setTimeout(createUI, 200);
        }
    }

    let lastUrl = window.location.href;
    function checkUrlChange() {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            currentUIUrl = null;
            if (isFbfindDomain() || isNonchikDomain()) {
                waitForRebuild();
            } else if (isMirrorDomain() && !isBlockedPage) {
                cleanPage();
            } else if (!isBlockedPage) {
                createUI();
            }
        }
    }

    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function(...args) { origPushState.apply(this, args); checkUrlChange(); };
    history.replaceState = function(...args) { origReplaceState.apply(this, args); checkUrlChange(); };
    window.addEventListener('popstate', checkUrlChange);

    const titleObserver = new MutationObserver(checkUrlChange);
    const titleElement = document.querySelector('title');
    if (titleElement) titleObserver.observe(titleElement, { childList: true });

    if (!isBlockedPage) {
        if (isFbfindDomain() || isNonchikDomain()) {
            waitForRebuild();
        } else if (isMirrorDomain()) {
            cleanPage();
        } else {
            startKinopoiskUI();
        }
    }
})();
