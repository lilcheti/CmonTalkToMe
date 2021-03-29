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
            // let message = 'نام    \\-    کد' + '\n'
            // for (let i = 0; i < user.blocked.length; i++) {
            //     if (user.blocked[i].uid) {
            //         // New method to use uuid
            //         message += '```' + user.blocked[i].uid?.replace(/-/g, '\\-') + '```' + ' \\- ' + user.blocked[i].name + '\n'
            //     } else {
            //         //TODO: Old deprecated id based method
            //         message += '```' + user.blocked[i].id + '```' + ' \\- ' + user.blocked[i].name + '\n'
            //     }
            // }
            // ctx.reply('کسانی که بلاک کردی اینا هستن:\n\n' +
            //     message,
            //     { parse_mode: 'MarkdownV2' }
            // )
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
            // let message = 'نام    \\-    کد' + '\n'
            // user.state = State.UNBLOCKING
            user.save().then((user) => {
                // for (let i = 0; i < user.blocked.length; i++) {
                //     if (user.blocked[i].uid) {
                //         // New method to use uuid
                //         message += '```' + user.blocked[i].uid?.replace(/-/g, '\\-') + '```' + ' \\- ' + user.blocked[i].name + '\n'
                //     } else {
                //         //TODO:  Old deprecated id based method
                //         message += '```' + user.blocked[i].id + '```' + ' \\- ' + user.blocked[i].name + '\n'
                //     }
                // }
                // ctx.reply('کد فردی که می‌خوای رفع بلاک بشه رو وارد کن:\n\n' +
                //     message,
                //     { parse_mode: 'MarkdownV2' }
                // )
                ctx.reply('همه کاربرانی که بلاک کرده بودید رفع بلاک شدند و می‌توانند به شما پیام دهند')
            })
        } else {
            ctx.reply('شما هیچکس را بلاک نکرده‌اید')
        }
    }
}

// export const unblockStep2 = async (ctx: TelegrafContext, user: User) => {
//     // New method to use uuid
//     let contact = await User.findOne({ uid: ctx.message?.text?.trim() })
//     if (!contact) {
//         //TODO:  Old deprecated id based method
//         contact = await User.findOne(Number(ctx.message?.text?.trim()))
//     }
//     if (!contact) {
//         ctx.reply('شما این کاربر را بلاک نکرده‌اید یا کد نامعتبر می‌باشد')
//     } else {
//         let blocked = []
//         for (let i = 0; i < user.blocked.length; i++) {
//             if (user.blocked[i].telegram_id != contact.telegram_id) {
//                 blocked.push(user)
//             }
//         }
//         if (blocked.length == user.blocked.length) {
//             ctx.reply('شما این کاربر را بلاک نکرده‌اید')
//         } else {
//             user.blocked = blocked
//             user.state = State.IDLE
//             user.save().then(() => {
//                 ctx.reply(`'${contact!.name}' رفع بلاک شد`)
//             }).catch((error) => {
//                 handleErrors(ctx, error)
//             })
//         }
//     }
// }

export const mylink = async (ctx: TelegrafContext) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) })
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        ctx.reply(`https://t.me/whisper2me_bot?start=${user.id}`)
    }
}
