import { TelegrafContext } from 'telegraf/typings/context'

export const handleErrors = (ctx: TelegrafContext, error: any) => {
    if (error && error.code && error.code == 403 && error.description && error.description == 'Forbidden: bot was blocked by the user') {
        ctx.reply('مخاطب شما ربات را بلاک کرده است، امکان پاسخ به او وجود ندارد')
    } else {
        console.error(error)
        ctx.reply('خطایی رخ داده است')
    }
}