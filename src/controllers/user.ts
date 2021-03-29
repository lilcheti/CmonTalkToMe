import { User, State } from '../models/user'
import { TelegrafContext } from 'telegraf/typings/context'
import { handleErrors } from '../util'

export const setName = async (ctx: TelegrafContext) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        user.state = State.SET_NAME
        user.save().then(() => {
            ctx.reply('نام مورد نظر را وارد کنید')
        }).catch((error) => {
            handleErrors(ctx, error)
        })
    }
}

export const randomMessage = async (ctx: TelegrafContext) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        user.state = State.RANDOM
        user.save().then(() => {
            ctx.reply('پیامت رو بنویس!')
        }).catch((error) => {
            handleErrors(ctx, error)
        })
    }
}

export const setNameStep2 = async (ctx: TelegrafContext, user: User) => {
    user.name = ctx.message!.text || 'ناشناس'
    user.state = State.IDLE
    user.save().then((user) => {
        ctx.reply(`نام شما ثبت شد: ${user.name}`)
    }).catch((error) => {
        handleErrors(ctx, error)
    })
}

export const block = async (ctx: TelegrafContext, user: User, toBlock: string) => {
    // New method to use uuid
    let contact = await User.findOne({ uid: toBlock }, { relations: ['blocked'] })
    if (!contact) {
        //TODO:  Old deprecated id based method
        contact = await User.findOne(Number(toBlock), { relations: ['blocked'] })
    }
    if (!contact) {
        ctx.reply('Not allowed')
    } else {
        user.blocked.push(contact)
        user.save().then((user) => {
            ctx.reply('کاربر مورد نظر بلاک شد و دیگر نمی‌تواند به شما پیام دهد')
        }).catch((error) => {
            handleErrors(ctx, error)
        })
    }
}

export const unblock = async (ctx: TelegrafContext) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) }, { relations: ['blocked'] })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        if (user.blocked.length > 0) {
            user.blocked = []
            user.save().then((user) => {
                ctx.reply('همه کاربرانی که بلاک کرده بودید رفع بلاک شدند و می‌توانند به شما پیام دهند')
            })
        } else {
            ctx.reply('شما هیچکس را بلاک نکرده‌اید')
        }
    }
}

export const mylink = async (ctx: TelegrafContext) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        ctx.reply(`https://t.me/whisper2me_bot?start=${user.id}`)
    }
}
