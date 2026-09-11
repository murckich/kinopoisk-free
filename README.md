<p align="center">
  <img src="images/icon-kp-bw-inv.svg" alt="Кинопоиск иконка" width="200">
</p>

<h1 align="center">Кинопоиск [Free]</h1>

<p align="center">
  <a href="https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js">
    <img src="https://img.shields.io/badge/Кинопоиск_[Free]-Download-brightgreen" alt="Скачать скрипт">
  </a>
  <a href="https://www.tampermonkey.net/">
    <img src="https://img.shields.io/badge/Tampermonkey-Supported-brightgreen" alt="Tampermonkey Supported">
  </a>
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

<p align="center">
  <b>Бесплатный просмотр фильмов и сериалов на сайте Кинопоиск.</b>
</p>

<p align="center">
  Это расширение для <a href="https://www.tampermonkey.net/">Tampermonkey</a> открывает доступ к просмотру контента на Kinopoisk.ru без ограничений и подписок.
</p>

---

## 📖 Содержание

- [✨ Возможности](#-возможности)
- [📱 Поддержка устройств](#-поддержка-устройств)
- [🌐 Поддержка браузеров](#-поддержка-браузеров)
- [🔄 Синхронизация закладок](#-синхронизация-закладок)
- [🎬 Демонстрация работы](#-демонстрация-работы)
- [🖼 Скриншоты](#-скриншоты)
- [🔄 Обновление](#-обновление)
- [🛠 Установка](#-установка)
- [⚙️ Быстрая настройка Tampermonkey](#️-быстрая-настройка-tampermonkey)
- [📜 Лицензия](#-лицензия)
- [🙏 Благодарности](#-благодарности)

---

## ✨ Возможности

-   **🚀 Прямой доступ к просмотру**: Добавляет кнопку «Смотреть» на страницы фильмов и сериалов, где её нет, даже при наличии подписки Яндекс Плюс.
-   **🎮 Выбор плеера**: Позволяет выбирать между несколькими зеркалами и встроенными плеерами для наилучшего качества видео.
-   **⚙️ Гибкая настройка**: Вы можете настроить предпочитаемый канал (зеркало), включить или выключить встроенный режим кнопок, а также изменить их положение на экране.
-   **📑 Закладки**: Сохраняйте понравившиеся фильмы и сериалы, чтобы быстро возвращаться к ним позже. Данные содержат название, год, рейтинг КП и жанры.
-   **🔄 Автоматическое обновление**: Расширение автоматически проверяет наличие обновлений на GitHub и уведомляет вас о новых версиях.
-   **🎨 Современный интерфейс**: Полностью переработанный и стильный интерфейс для просмотра на зеркалах, повторяющий дизайн Кинопоиска.
-   **📱 Полная поддержка мобильных устройств**: Корректная работа на смартфонах и планшетах с оптимизированным интерфейсом.
-   **🔗 Экспорт и импорт закладок**: Переносите закладки между устройствами через ссылку, QR-код или файл.
-   **🌓 Автоматическая тема**: Тёмная тема на смартфонах и автоматическое определение темы на ПК и планшетах.

---

## 📱 Поддержка устройств

Расширение **автоматически определяет** тип вашего устройства и подстраивает интерфейс.

**💻 Компьютеры и ноутбуки**
- Весь функционал: встраивание кнопок, 6 позиций, все настройки.
- Автоматическая тема (светлая/тёмная).
- Второстепенные кнопки скрыты до наведения курсора.

**📱 Смартфоны**
- Всегда **тёмная тема**.
- Кнопки **всегда видны**, увеличены для удобства нажатия.
- Удобное удаление закладок (красная зона справа).

**📟 Планшеты**
- Работают **как ПК** — весь функционал.
- Кнопки **всегда видны**.
- Автоматическая тема.

---

## 🌐 Поддержка браузеров

> На **ПК** расширение работает в Chrome, Edge, Opera, Яндекс.Браузере и Firefox.  
> Ниже — браузеры для **смартфонов и планшетов**.

| Платформа | Браузер | Поддержка |
|-----------|---------|-----------|
| **Android** | ⭐ **Firefox** | ✅ Полная (рекомендуется) |
| Android | Edge | ✅ Полная |
| Android | Lemur Browser | ✅ Полная |
| Android | Quetta Browser | ✅ Полная |
| Android | Kiwi Browser | ⚠️ Ограничена (устарел) |
| **iOS / iPadOS** | Safari + Userscripts | ✅ Полная |
| iOS / iPadOS | Teak Browser | ✅ Полная |
| iOS / iPadOS | Gear Browser | ✅ Полная |

### ⭐ Почему Firefox?

- **Firefox для Android** — единственный браузер, где Tampermonkey ставится напрямую из официального магазина дополнений.
- Не требует режима разработчика, ручной установки `.crx`-файлов или возни с правами.
- Стабильная работа userscript «из коробки».

> 💡 **Для Android**: скачайте Firefox из Google Play → установите Tampermonkey → добавьте скрипт.  
> 💡 **Для iOS**: установите приложение **Userscripts** (бесплатно в App Store) и включите его как расширение в Safari.

---

## 🔄 Синхронизация закладок

Расширение позволяет **переносить закладки между устройствами** без использования сторонних сервисов и регистрации. Три способа:

### 🔗 Через ссылку
1. Откройте панель закладок (кнопка **📑**).
2. Нажмите **🔗** — содержимое панели переключится в режим «Поделиться» (QR-код, поле со ссылкой, кнопки экспорта/импорта).
3. Нажмите **📋** — ссылка скопируется в буфер обмена.
4. Отправьте ссылку себе любым способом (Telegram, email, заметки).
5. Откройте ссылку на втором устройстве — закладки добавятся автоматически.

### 📱 Через QR-код
1. В режиме «Поделиться» (кнопка **🔗**) нажмите **📱 Показать QR-код**.
2. Отсканируйте QR-код телефоном.
3. Откройте появившуюся ссылку — закладки импортируются.

### 💾 Через файл
1. В режиме «Поделиться» (кнопка **🔗**) нажмите **💾 Экспорт** — сохранится JSON-файл.
2. Перенесите файл на другое устройство (Telegram, облако, флешка).
3. Нажмите **📥 Импорт** и выберите файл.

> ⚠️ **Важно**: чтобы импорт сработал, на втором устройстве **тоже должно быть установлено расширение** Кинопоиск [Free].

---

## 🎬 Демонстрация работы

*Посмотрите, как работает расширение:*

![Демонстрация работы расширения Кинопоиск [Free]](https://raw.githubusercontent.com/murckich/kinopoisk-free/main/images/kinopoisk-free.gif)

**Что показано на GIF:**
- 🎯 Автоматическое появление кнопки «Смотреть»
- 🎮 Выбор плеера и канала
- ▶️ Запуск воспроизведения
- ⚙️ Открытие панели настроек
- 📑 Сохранение фильма в закладки

---

## 🖼 Скриншоты

<img width="629" height="310" alt="{A03E589F-6171-48CF-8D25-DDCBBAF4A7F3}" src="https://github.com/user-attachments/assets/558658dd-b30e-4a68-99c5-2610ea44d271" />
<img width="529" height="259" alt="{C095222D-88FE-4A2A-A131-3197C346F5FF}" src="https://github.com/user-attachments/assets/150ff721-a8a5-4d42-a9f3-802473e1aa10" />

---

## 🔄 Обновление

Расширение настроено на автоматическое обновление. Как только мы выложим новую версию в этот репозиторий, Tampermonkey автоматически предложит Вам загрузить ее.

---

## 🛠 Установка

Для работы расширения необходимо установить Tampermonkey для вашего браузера.

### 1. Установите Tampermonkey

Скачайте и установите расширение для вашего браузера с официального сайта:

[![Установить Tampermonkey](https://img.shields.io/badge/Установить-Tampermonkey-2b5797?style=for-the-badge&logo=tampermonkey)](https://www.tampermonkey.net/index.php?locale=ru)

### 2. Установите расширение

Нажмите на кнопку ниже, чтобы установить последнюю стабильную версию расширения. Tampermonkey автоматически предложит вам установить его.

[![Установить](https://img.shields.io/badge/Установить-Кинопоиск_[Free]-4CAF50?style=for-the-badge&logo=github)](https://raw.githubusercontent.com/murckich/kinopoisk-free/main/kinopoisk-free.user.js)

Либо отсканируйте QR код на вашем устройстве.

<img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/7b73773b-4754-44bc-bc6d-e1b10489ada4" />

> **Альтернативный способ:** Вы также можете скачать файл `kinopoisk-free.user.js` из этого репозитория и установить его вручную через панель Tampermonkey.

---

## ⚙️ Быстрая настройка [Tampermonkey](https://www.tampermonkey.net/index.php?locale=ru)

### 1. Включите режим разработчика
В вашем браузере откройте страницу расширений и активируйте переключатель «Режим разработчика»:  
<img width="169" height="22" alt="{DF7B2EF3-4C2E-4806-83D2-CD0966837C6F}" src="https://github.com/user-attachments/assets/ce9c0b0a-a86f-437f-82b2-3d5021a75f11" />  

[![Chrome](https://img.shields.io/badge/Chrome-Настройки-4285F4?logo=googlechrome&logoColor=white)](chrome://extensions)  
[![Opera](https://img.shields.io/badge/Opera-Настройки-FF1B2D?logo=opera&logoColor=white)](opera://extensions)  
[![Яндекс](https://img.shields.io/badge/Яндекс-Настройки-FC3F1D?logo=yandex&logoColor=white)](browser://extensions)  
[![Edge](https://img.shields.io/badge/Edge-Настройки-0078D7?logo=microsoftedge&logoColor=white)](edge://extensions)  
[![Firefox](https://img.shields.io/badge/Firefox-Настройки-FF7139?logo=firefox&logoColor=white)](about:addons)  

> Нажмите на кнопку вашего браузера — страница откроется автоматически.

### 2. Разрешите [Tampermonkey](https://www.tampermonkey.net/index.php?locale=ru) доступ к файлам
На той же странице расширений нажмите **«Сведения»** или **«Подробнее»** под Tampermonkey и включите:

- **«Разрешить доступ к URL-адресам файлов»** или **«Разрешить пользовательские скрипты»** 
- Доступ к сайтам → **На всех сайтах**

Готово! Возвращайтесь на [Кинопоиск](https://www.kinopoisk.ru/) — кнопка «Смотреть» уже ждёт.

---

## 📜 Лицензия

Этот проект распространяется под лицензией **Apache License 2.0**. Подробнее см. в файле [LICENSE](https://github.com/murckich/kinopoisk-free/blob/main/LICENSE).

Copyright 2026 Murckich

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## 🙏 Благодарности

Спасибо всем, кто пользуется и поддерживает проект! Ваши отзывы и предложения помогают делать его лучше.
Если вам понравился скрипт, не забудьте поставить ⭐ звезду на GitHub, чтобы поддержать разработку!
[![GitHub stars](https://img.shields.io/github/stars/murckich/kinopoisk-free?style=social)](https://github.com/murckich/kinopoisk-free/stargazers)
