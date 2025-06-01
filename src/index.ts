import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

// Замените на ваш токен бота
const TELEGRAM_BOT_TOKEN = '7535886611:AAE1m7tIVUhtuXus6RgMpMuDc6MveDBxVxA';
const API_BASE_URL = 'YOUR_API_BASE_URL'; // Например: 'https://api.example.com'

// Инициализация бота
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
Привет! Я бот для управления вашими учетными данными и бронированиями.
Доступные команды:
/get-credentials - получить ваши логин и пароль
/get-booked - получить список ваших бронирований
    `;
    bot.sendMessage(chatId, welcomeMessage);
});

// Обработчик команды /get-credentials
bot.onText(/\/get-credentials/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_BASE_URL}/get-credentials`, {
            headers: {
                'XUI-Telegram-Token': chatId.toString()
            }
        });

        const { login, password } = response.data;
        const message = `
Ваши учетные данные:
Логин: ${login}
Пароль: ${password}
        `;
        
        bot.sendMessage(chatId, message);
    } catch (error) {
        console.error('Error fetching credentials:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при получении ваших учетных данных. Пожалуйста, попробуйте позже.');
    }
});

// Обработчик команды /get-booked
bot.onText(/\/get-booked/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_BASE_URL}/get-booked`, {
            headers: {
                'XUI-Telegram-Token': chatId.toString()
            }
        });

        const bookings = response.data;
        
        if (bookings.length === 0) {
            bot.sendMessage(chatId, 'У вас нет активных бронирований.');
            return;
        }

        let message = 'Ваши бронирования:\n\n';
        
        bookings.forEach((booking: any, index: number) => {
            message += `🏠 ${booking.name}\n`;
            message += `📅 Дата: ${booking.date}\n`;
            message += `🆔 ID: ${booking.id}\n`;
            
            if (index < bookings.length - 1) {
                message += '\n────────────\n\n';
            }
        });

        // Отправляем текстовое сообщение
        await bot.sendMessage(chatId, message);
        
        // Отправляем фотографии отдельными сообщениями
        for (const booking of bookings) {
            if (booking.photo_url) {
                try {
                    await bot.sendPhoto(chatId, booking.photo_url);
                } catch (photoError) {
                    console.error('Error sending photo:', photoError);
                    await bot.sendMessage(chatId, `Не удалось загрузить фото для ${booking.name}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching bookings:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка ваших бронирований. Пожалуйста, попробуйте позже.');
    }
});

console.log('Бот запущен и ожидает сообщений...');