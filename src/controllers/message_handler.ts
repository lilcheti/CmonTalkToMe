import { TelegrafContext } from 'telegraf/typings/context'
import { User, State } from '../models/user'
import { setNameStep2 } from './user'
import { sendMessage, replyStep2 } from './messaging'
import { v4 } from 'uuid'
import { handleErrors } from '../util'

export const message_handler = async (ctx: TelegrafContext) => {
    const user = await User.findOne({ telegram_id: String(ctx.from?.id) }, { relations: ['blocked', 'blockedBy'] })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        //TODO:  give user a uid if it has not
        if (!user.uid) {
            user.uid = v4()
            user.save().then((user) => {
                switcher(ctx, user)
            }).catch((error) => {
                handleErrors(ctx, error)
            })
        } else {
            switcher(ctx, user)
        }
    }
}

const switcher = async (ctx: TelegrafContext, user: User) => {
    switch (user.state) {
        case State.SET_NAME: {
            await setNameStep2(ctx, user)
            break
        }
        case State.MESSAGING: {
            await sendMessage(ctx, user, false)
            break
        }
        case State.RANDOM: {
            await sendMessage(ctx, user, true)
            break
        }
        case State.REPLY: {
            await replyStep2(ctx, user)
            break
        }
    }
}