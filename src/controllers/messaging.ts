import { User, State } from '../models/user'
import { TelegrafContext } from 'telegraf/typings/context'
import { Markup } from 'telegraf'
import { handleErrors } from '../util'
import { In, Not } from 'typeorm'

export const sendMessage = async (ctx: TelegrafContext, user: User, random: boolean) => {
    let userIsBlocked = false
    if (!random) {
        for (let i = 0; i < user.blockedBy.length; i++) {
            if (user.blockedBy[i].uid == user.messagingTo) {
                userIsBlocked = true
                break
            }
        }
    }
    if (userIsBlocked) {
        ctx.reply('شما نمی‌توانید به این کاربر پیام بدهید')
    } else {
        let messageingTo = undefined
        if (!random) {
            // New method to use uuid
            messageingTo = await User.findOne({ uid: user.messagingTo || '' })
            if (!messageingTo) {
                //TODO:  Old deprecated id based method
                messageingTo = await User.findOne({ id: Number(user.messagingTo) })
            }
        } else {
            let users = await User.find({ uid: Not(In(user.blockedBy.map(u => u.uid))) })
            messageingTo = users[Math.floor(Math.random() * users.length)]
        }
        if (!messageingTo) {
            ctx.reply('Not allowed')
        } else {
            generalSendMessage(
                ctx,
                user.replyingTo,
                user.uid || '',
                user.name,
                messageingTo.telegram_id,
                messageingTo.id == user.id,
                random
                // )    
                // ctx.telegram.sendMessage(
                //     messageingTo.telegram_id,
                //     'پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text,
                //     {
                //         reply_markup: Markup.inlineKeyboard([
                //             [
                //                 Markup.callbackButton('Block', `${'block-' + String(user.id)}`),
                //                 Markup.callbackButton('Reply', `${'reply-' + String(user.id) + '-' + String(ctx.message?.message_id)}`)
                //             ]
                //         ])
                //     }
            ).then(() => {
                user.state = State.IDLE
                user.messagingTo = null
                user.save().then((user) => {
                    ctx.reply('پیام شما ارسال شد')
                }).catch((error) => {
                    handleErrors(ctx, error)
                })
            }).catch((error) => {
                if (error == 'typeNotSupported') {
                    ctx.reply('این نوع پیام پشتیبانی نمی‌شود لطفا برای اضافه کردن آن اینجا گزارش کنید\nhttps://gitlab.com/molaeiali/whisper2me-bot')
                } else {
                    handleErrors(ctx, error)
                }
            })
        }
    }
}

export const reply = async (ctx: TelegrafContext, user: User, to: string, message_id: number) => {
    // New method to use uuid
    let contact = await User.findOne({ uid: to })
    if (!contact) {
        //TODO:  Old deprecated id based method
        contact = await User.findOne(Number(to))
    }
    if (!contact) {
        handleErrors(ctx, '!contact')
    } else {
        let userIsBlocked = false
        for (let i = 0; i < user.blockedBy.length; i++) {
            if (user.blockedBy[i].id == contact.id) {
                userIsBlocked = true
                break
            }
        }
        if (userIsBlocked) {
            ctx.reply('شما نمی‌توانید به این کاربر پیام بدهید')
        } else {
            user.state = State.REPLY
            user.messagingTo = to
            user.replyingTo = message_id
            user.save().then(() => {
                ctx.reply('درحال پاسخ به 👆: پاسخ خود را بنویسید', { reply_to_message_id: ctx.update?.callback_query?.message?.message_id })
            }).catch((error) => {
                handleErrors(ctx, error)
            })
        }
    }
}

export const replyStep2 = async (ctx: TelegrafContext, user: User) => {
    // New method to use uuid
    let messageingTo = await User.findOne({ uid: user.messagingTo || '' })
    if (!messageingTo) {
        //TODO:  Old deprecated id based method
        messageingTo = await User.findOne({ id: Number(user.messagingTo) })
    }
    if (!messageingTo) {
        ctx.reply('Not allowed')
    } else {
        generalSendMessage(
            ctx,
            user.replyingTo,
            user.uid || '',
            user.name || 'ناشناس',
            messageingTo.telegram_id,
            messageingTo.id == user.id,
            false
            // )
            // ctx.telegram.sendMessage(
            //     messageingTo.telegram_id,
            //     'پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text,
            //     {
            //         reply_to_message_id: user.replyingTo || -1,
            //         reply_markup: Markup.inlineKeyboard([
            //             [
            //                 Markup.callbackButton('Block', `${'block-' + String(user.id)}`),
            //                 Markup.callbackButton('Reply', `${'reply-' + String(user.id) + '-' + String(ctx.message?.message_id)}`)
            //             ]
            //         ])
            //     }
        ).then(() => {
            user.state = State.IDLE
            user.replyingTo = null
            user.messagingTo = null
            user.save().then(() => {
                ctx.reply('پیام شما ارسال شد')
            }).catch((error) => {
                handleErrors(ctx, error)
            })
        }).catch((error) => {
            if (error == 'typeNotSupported') {
                ctx.reply('این نوع پیام پشتیبانی نمی‌شود لطفا برای اضافه کردن آن اینجا گزارش کkید\nhttps://gitlab.com/molaeiali/whisper2me-bot')
            } else if (error.code && error.code == 400 && error.description && error.description == 'Bad Request: reply message not found') {
                user.replyingTo = null
                replyStep2(ctx, user)
            } else {
                handleErrors(ctx, error)
            }
        })
    }
}

const generalSendMessage = (ctx: TelegrafContext, replyingTo: number | null, id: string, name: string, chatId: string, selfMessage: boolean, random: boolean) => {
    const newMessageText = random ? 'پیام تصادفی جدید' : 'پیام جدید'
    const extra = {
        caption: `${selfMessage ? '' : newMessageText}${(!selfMessage && ctx.message?.caption) ? ': ' + ctx.message?.caption : ''}`,
        reply_to_message_id: replyingTo || undefined,
        reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton('Block', `${'block-' + String(id)}`),
                Markup.callbackButton('Reply', `${'reply-' + String(id) + '-' + String(ctx.message?.message_id)}`)
            ]
        ])
    }
    const extraWithOutCaption = {
        reply_to_message_id: replyingTo || undefined,
        reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton('Block', `${'block-' + String(id)}`),
                Markup.callbackButton('Reply', `${'reply-' + String(id) + '-' + String(ctx.message?.message_id)}`)
            ]
        ])
    }
    if (ctx.message?.document) {
        return ctx.telegram.sendDocument(chatId, ctx.message?.document.file_id, extra)
    } else if (ctx.message?.video) {
        return ctx.telegram.sendVideo(chatId, ctx.message?.video.file_id, extra)
    } else if (ctx.message?.photo) {
        return ctx.telegram.sendPhoto(chatId, ctx.message?.photo[0].file_id, extra)
    } else if (ctx.message?.voice) {
        return ctx.telegram.sendVoice(chatId, ctx.message?.voice.file_id, extra)
    } else if (ctx.message?.sticker) {
        ctx.telegram.sendMessage(chatId, newMessageText).then(() => {

        }).catch((error) => {
            console.error(error)
        })
        return ctx.telegram.sendSticker(chatId, ctx.message?.sticker!.file_id!, extraWithOutCaption)
    } else if (ctx.message?.audio) {
        return ctx.telegram.sendAudio(chatId, ctx.message?.audio.file_id, extra)
    } else if (ctx.message?.animation) {
        return ctx.telegram.sendAnimation(chatId, ctx.message?.animation.file_id, extra)
    } else if (ctx.message?.text) {
        return ctx.telegram.sendMessage(chatId, `${selfMessage ? '' : newMessageText + ': '}${ctx.message?.text}`, extraWithOutCaption)
    } else {
        return Promise.reject('typeNotSupported')
    }
}
