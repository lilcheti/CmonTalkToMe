import { TelegrafContext } from 'telegraf/typings/context'
import { User } from '../models/user'
import { reply } from './messaging'
import { block } from './user'

export const callback_handler = async (ctx: TelegrafContext) => {
    const user = await User.findOne({ telegram_id: String(ctx.from?.id) }, { relations: ['blocked', 'blockedBy'] })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        const data = ctx.update.callback_query!.data
        if (data?.substr(0, 5) == 'reply') {
            const x = data.substr(6, data.length - 1).split('-')
            reply(ctx, user, x[0], x[1])
        } else if (data?.substr(0, 5) == 'block') {
            block(ctx, user, data.substr(6, data.length - 1))
        }
    }
}