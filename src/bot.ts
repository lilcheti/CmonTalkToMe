import * as dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { createConnection } from 'typeorm'
import { start } from './controllers/start'
import { message_handler } from './controllers/message_handler'
import { setName, unblock, mylink } from './controllers/user'
import { callback_handler } from './controllers/callback_handler'
import { faq } from './controllers/general'

const dotenvResult = dotenv.config()
if (dotenvResult.error) {
    throw dotenvResult.error
}

const initDb = async () => {
    await createConnection().then(connection => {
        console.log('Connected successfully to the Database')
    }).catch(error => {
        console.error(error)
    })
}

const initBot = () => {
    const bot = new Telegraf(process.env.BOT_TOKEN || '')

    bot.start(start)

    bot.telegram.setMyCommands(
        [
            { command: 'my_link', description: 'برای گرفتن لینک خودت' },
            { command: 'set_name', description: 'برای تغییر نام خودت (ناشناس به صورت پیشفرض)' },
            { command: 'unblock', description: 'برای رفع بلاک همه کاربران' },
            { command: 'faq', description: 'سوالات متداول' },
        ]
    )

    bot.command('/my_link', mylink)

    bot.command('/set_name', setName)

    bot.command('/unblock', unblock)

    bot.command('/faq', faq)

    bot.on('callback_query', callback_handler)
    bot.on('message', message_handler)

    bot.launch().then(() => {
        console.log('Bot started!')
    }).catch((error) => {
        console.error(error)
    })
}

const init = async () => {
    await initDb()
    initBot()
}

init()