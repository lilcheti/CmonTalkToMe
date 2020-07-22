import { User, State } from '../models/user'
import Axios from 'axios'
import { TelegrafContext } from 'telegraf/typings/context'

export const sendMessage = async (ctx: TelegrafContext, user: User) => {
    let found = false
    for (let i = 0; i < user.blockedBy.length; i++) {
        if (user.blockedBy[i].telegram_id == user.messagingTo) {
            found = true
            break
        }
    }
    if (found) {
        ctx.reply('شما نمی‌توانید به این کاربر پیام بدهید')
    } else {
        let url = 'https://api.telegram.org/bot'
        url += `${process.env.BOT_TOKEN}/sendMessage?`
        url += `chat_id=${user.messagingTo}&`
        url += `text=${encodeURI('پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text)}&`
        url += `reply_markup=${escape(`{"inline_keyboard":[[{"text":"Block","callback_data":"${'block-' + String(user.telegram_id)}"},{"text":"Reply","callback_data":"${'reply-' + String(user.telegram_id) + '-' + String(ctx.message?.message_id)}"}]]}`)}`
        let result = await Axios.get(url)
        if (result.data.ok) {
            user.state = State.IDLE
            user.messagingTo = null
            user.save().then((user) => {
                ctx.reply('پیام شما ارسال شد')
            }).catch((error) => {
                console.log(error)
                ctx.reply('خطایی رخ داده است')
            })
        }
    }
}

export const reply = async (ctx: TelegrafContext, user: User, to: string, message_id: string) => {
    let contact = await User.findOne({ telegram_id: to })
    if (!contact) {
        console.log('!contact')
        ctx.reply('خطایی رخ داده است')
    } else {
        let found = false
        for (let i = 0; i < user.blockedBy.length; i++) {
            if (user.blockedBy[i].telegram_id == contact.telegram_id) {
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
                console.log(error)
                ctx.reply('خطایی رخ داده است')
            })
        }
    }
}

export const replyStep2 = async (ctx: TelegrafContext, user: User) => {
    let url = 'https://api.telegram.org/bot'
    url += `${process.env.BOT_TOKEN}/sendMessage?`
    url += `chat_id=${user.messagingTo}&`
    url += `reply_to_message_id=${user.replyingTo}&`
    url += `text=${encodeURI('پیام از سمت \'' + user.name + '\'\n' + ctx.message?.text)}&`
    url += `reply_markup=${escape(`{"inline_keyboard":[[{"text":"Block","callback_data":"${'block-' + String(user.telegram_id)}"}, {"text":"Reply","callback_data":"${'reply-' + String(user.telegram_id) + '-' + String(ctx.message?.message_id)}"}]]}`)}`
    let result = await Axios.get(url)
    if (result.data.ok) {
        user.state = State.IDLE
        user.replyingTo = null
        user.messagingTo = null
        user.save().then(() => {
            ctx.reply('پیام شما ارسال شد')
        }).catch((error) => {
            console.log(error)
            ctx.reply('خطایی رخ داده است')
        })
    }
}