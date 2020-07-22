import { User, State } from '../models/user'
import { TelegrafContext } from 'telegraf/typings/context'
import { Markup } from 'telegraf'

export const sendMessage = async (ctx: TelegrafContext, user: User) => {
    let found = false
    for (let i = 0; i < user.blockedBy.length; i++) {
        if (user.blockedBy[i].id == user.messagingTo) {
            found = true
            break
        }
    }
    if (found) {
        ctx.reply('شما نمی‌توانید به این کاربر پیام بدهید')
    } else {
        const messageingTo = await User.findOne(user.messagingTo || -1)
        if (!messageingTo) {
            ctx.reply('Not allowed')
        } else {
            ctx.telegram.sendMessage(
                messageingTo.telegram_id,
                'پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text,
                {
                    reply_markup: Markup.inlineKeyboard([
                        [
                            Markup.callbackButton('Block', `${'block-' + String(user.id)}`),
                            Markup.callbackButton('Reply', `${'reply-' + String(user.id) + '-' + String(ctx.message?.message_id)}`)
                        ]
                    ])
                }
            ).then(() => {
                user.state = State.IDLE
                user.messagingTo = null
                user.save().then((user) => {
                    ctx.reply('پیام شما ارسال شد')
                }).catch((error) => {
                    console.error(error)
                    ctx.reply('خطایی رخ داده است')
                })
            }).catch((error) => {
                console.error(error)
                ctx.reply('خطایی رخ داده است')
            })
        }
    }
}

export const reply = async (ctx: TelegrafContext, user: User, to: number, message_id: number) => {
    let contact = await User.findOne(to)
    if (!contact) {
        console.error('!contact')
        ctx.reply('خطایی رخ داده است')
    } else {
        let found = false
        for (let i = 0; i < user.blockedBy.length; i++) {
            if (user.blockedBy[i].id == contact.id) {
                found = true
                break
            }
        }
        if (found) {
            ctx.reply('شما نمی‌توانید به این کاربر پیام بدهید')
        } else {
            user.state = State.REPLY
            user.messagingTo = to
            user.replyingTo = message_id
            user.save().then(() => {
                ctx.reply(`درحال پاسخ به '${contact!.name}': پاسخ خود را بنویسید`)
            }).catch((error) => {
                console.error(error)
                ctx.reply('خطایی رخ داده است')
            })
        }
    }
}

export const replyStep2 = async (ctx: TelegrafContext, user: User) => {
    const messageingTo = await User.findOne(user.messagingTo || -1)
    if (!messageingTo) {
        ctx.reply('Not allowed')
    } else {
        ctx.telegram.sendMessage(
            messageingTo.telegram_id,
            'پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text,
            {
                reply_to_message_id: user.replyingTo || -1,
                reply_markup: Markup.inlineKeyboard([
                    [
                        Markup.callbackButton('Block', `${'block-' + String(user.id)}`),
                        Markup.callbackButton('Reply', `${'reply-' + String(user.id) + '-' + String(ctx.message?.message_id)}`)
                    ]
                ])
            }
        ).then(() => {
            user.state = State.IDLE
            user.replyingTo = null
            user.messagingTo = null
            user.save().then(() => {
                ctx.reply('پیام شما ارسال شد')
            }).catch((error) => {
                console.error(error)
                ctx.reply('خطایی رخ داده است')
            })
        }).catch((error) => {
            console.error(error)
            ctx.reply('خطایی رخ داده است')
        })
    }
}