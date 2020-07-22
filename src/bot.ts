import * as dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { createConnection } from 'typeorm'
import { TelegrafContext } from 'telegraf/typings/context'
import { start } from './controllers/start'
import { message_handler } from './controllers/message_handler'
import { setName, unblock } from './controllers/user'
import { callback_handler } from './controllers/callback_handler'

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
            { command: 'set_name', description: 'برای تغییر نام خودت' },
            { command: 'unblock', description: 'برای رفع بلاک' },
        ]
    )

    bot.command('/my_link', (ctx: TelegrafContext) => {
        ctx.reply(`https://t.me/whisper2me_bot?start=${ctx.from?.id}`)
    })

    bot.command('/set_name', setName)

    bot.command('/unblock', unblock)

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