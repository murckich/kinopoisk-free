<p align="center">
  <img src="images/icon-kp-bw-inv.svg" alt="Кинопоиск [Free]" width="180">
</p>

<h1 align="center">Кинопоиск [Free]</h1>

<p align="center">
  <b>Бесплатный просмотр фильмов и сериалов на Кинопоиске.</b><br>
  Userscript для Tampermonkey — открывает доступ к контенту без подписки Яндекс Плюс.
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js">
    <img src="https://img.shields.io/badge/Установить-Кинопоиск_[Free]-4CAF50?style=for-the-badge&logo=github" alt="Установить">
  </a>
</p>

<p align="center">
  <a href="https://github.com/murckich/kinopoisk-free/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/murckich/kinopoisk-free" alt="License">
  </a>
  <a href="https://greasyfork.org/ru/scripts/589614-kinopoisk-free">
    <img src="https://img.shields.io/greasyfork/dt/589614?style=social&logo=greasyfork&logoColor=black&label=Installs" alt="GreasyFork">
  </a>
  <a href="https://github.com/murckich/kinopoisk-free/stargazers">
    <img src="https://img.shields.io/github/stars/murckich/kinopoisk-free?style=social" alt="GitHub stars">
  </a>
</p>

---

## 📖 О скрипте

**Кинопоиск [Free]** — пользовательский скрипт для менеджера [Tampermonkey](https://www.tampermonkey.net/), который добавляет кнопку просмотра на страницы фильмов и сериалов Кинопоиска, даже если контент недоступен по подписке. Работает через несколько зеркал-каналов, поддерживает выбор плеера, закладки, синхронизацию между устройствами и автообновление.

---

## ✨ Возможности

| | |
|---|---|
| 🚀 **Просмотр без подписки** | Кнопка «Смотреть» появляется на страницах фильмов и сериалов. |
| 🎮 **Выбор канала и плеера** | 6 зеркал (Альфа, Браво, Гамма, Дельта, Танго, Чарли) и встроенный выбор плеера. |
| ⚙️ **Гибкая настройка** | Встроенный или фиксированный режим кнопок, положение на экране, выбор канала. |
| 📑 **Закладки** | Сохранение фильмов с постером, названием, годом, рейтингом КП и жанрами. |
| 🔗 **Синхронизация** | Перенос закладок между устройствами через ссылку, QR-код или файл. |
| 🔄 **Автообновление** | Тихая проверка новых версий раз в 6 часов и уведомление в панели. |
| 🌓 **Авто-тема** | Тёмная тема на смартфонах, автоматическое определение темы на ПК. |
| 📱 **Мобильная версия** | Оптимизированный интерфейс для смартфонов и планшетов. |
| 🎨 **Свой дизайн зеркал** | Переработанный интерфейс в стиле Кинопоиска. |

---

## 🛠 Установка

### 1. Установите Tampermonkey

[![Tampermonkey](https://img.shields.io/badge/Установить-Tampermonkey-2b5797?style=for-the-badge&logo=tampermonkey)](https://www.tampermonkey.net/index.php?locale=ru)

### 2. Установите скрипт

Нажмите на кнопку — Tampermonkey сам предложит установить скрипт:

[![Установить](https://img.shields.io/badge/Установить-Кинопоиск_[Free]-4CAF50?style=for-the-badge&logo=github)](https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js)

Или отсканируйте QR-код:

<p align="center">
  <img width="320" height="320" alt="QR-код для установки" src="https://github.com/user-attachments/assets/7b73773b-4754-44bc-bc6d-e1b10489ada4" />
</p>

### 3. Настройте Tampermonkey

В браузере откройте страницу расширений и:

1. Включите **«Режим разработчика»**.<img width="169" height="22" alt="Режим разработчика" src="https://github.com/user-attachments/assets/ce9c0b0a-a86f-437f-82b2-3d5021a75f11" />
2. Нажмите **«Сведения»** под Tampermonkey и включите:
   - **«Разрешить доступ к URL-адресам файлов»** (Chrome) или **«Разрешить пользовательские скрипты»** (Firefox).
   - Доступ к сайтам → **«На всех сайтах»**.

Готово. Откройте [kinopoisk.ru](https://www.kinopoisk.ru/) — кнопка уже ждёт.

---

## 🎬 Демонстрация

<p align="center">
  <img src="https://raw.githubusercontent.com/murckich/kinopoisk-free/main/images/kinopoisk-free.gif" alt="Демонстрация работы" width="720">
</p>

---

## 🖼 Скриншоты

<p align="center">
  <img width="600" alt="Скриншот 1" src="https://github.com/user-attachments/assets/558658dd-b30e-4a68-99c5-2610ea44d271" />
  <img width="500" alt="Скриншот 2" src="https://github.com/user-attachments/assets/150ff721-a8a5-4d42-a9f3-802473e1aa10" />
</p>

---

## 📱 Поддержка устройств

Скрипт **автоматически определяет** тип устройства и подстраивает интерфейс.

| Устройство | Тема | Кнопки | Удаление закладок |
|---|---|---|---|
| 💻 ПК / ноутбук | Авто | Скрыты до наведения | Узкая зона |
| 📱 Смартфон | Всегда тёмная | Всегда видны, увеличены | Широкая красная зона |
| 📟 Планшет | Авто | Всегда видны | Как на ПК |

---

## 🌐 Поддержка браузеров

**ПК:** Chrome, Edge, Opera, Яндекс.Браузер, Firefox.

**Мобильные:**

| Платформа | Браузер | Статус |
|---|---|---|
| Android | ⭐ Firefox | ✅ Рекомендуется |
| Android | Edge | ✅ |
| Android | Lemur Browser | ✅ |
| Android | Quetta Browser | ✅ |
| Android | Kiwi Browser | ⚠️ Устарел |
| iOS / iPadOS | Safari + Userscripts | ✅ |
| iOS / iPadOS | Teak Browser | ✅ |
| iOS / iPadOS | Gear Browser | ✅ |

> **Android:** Firefox и Edge — единственные браузеры, где Tampermonkey ставится напрямую из Play Store без режима разработчика.

> **iOS:** установите бесплатное приложение **Userscripts** и включите его как расширение в Safari.

---

## 🔄 Автоматическое обновление

Скрипт сам проверяет новые версии на GitHub — **раз в 6 часов**, в фоне, не мешая просмотру.

Когда выходит новая версия, вы увидите:

- **🟡 Жёлтую точку** в углу кнопки **⚙️**.
- **🟡 Жёлтую иконку ↻** в панели настроек.

Нажмите **↻ → «Проверить обновление»** или **«Обновить сейчас»**, чтобы посмотреть описание изменений и установить новую версию. Настройки и закладки сохраняются.

---

## 🔗 Синхронизация закладок

Перенос закладок между устройствами без регистрации и сторонних сервисов. Откройте панель закладок (**📑**) и нажмите **🔗**.

| Способ | Как |
|---|---|
| 🔗 Ссылка | Нажмите **📋** — ссылка скопируется. Откройте её на другом устройстве. |
| 📱 QR-код | Нажмите **📱 Показать QR-код**, отсканируйте телефоном. |
| 💾 Файл | **💾 Экспорт** — сохранит JSON. На другом устройстве **📥 Импорт**. |

> ⚠️ На втором устройстве тоже должен быть установлен Кинопоиск [Free].

---

## 📜 Лицензия

[Apache License 2.0](https://github.com/murckich/kinopoisk-free/blob/main/LICENSE) © 2026 Murckich

---

## 🙏 Поддержка

Если скрипт оказался полезен — поставьте ⭐ на GitHub.

[![GitHub stars](https://img.shields.io/github/stars/murckich/kinopoisk-free?style=social)](https://github.com/murckich/kinopoisk-free/stargazers)
