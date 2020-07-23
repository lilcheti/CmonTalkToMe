import { User, State } from '../models/user'
import { TC } from '../telegraf'

const greeting =
    'به Whisper2Me خوش اومدی\n' +
    'برای گرفتن لینک خودت /my_link رو بفرست\n' +
    'برای تغییر نام خودت /set_name رو بفرست\n' +
    'برای  رفع بلاک /unblock رو بفرست\n'


export const start = async (ctx: TC) => {
    let user = await User.findOne({ telegram_id: String(ctx.from?.id) })
    if (!user) {
        user = new User()
        user.telegram_id = String(ctx.from?.id)
        user.save().then((user) => {
            payload(ctx, user)
        }).catch((error) => {
            console.error(error)
            ctx.reply('خطایی رخ داده است')
        })
    } else {
        payload(ctx, user)
    }
}

export const payload = async (ctx: TC, user: User) => {
    if (!user) {
        ctx.reply('Not allowed')
    } else {
        let contact: User | undefined = undefined
        if (ctx.startPayload) {
            contact = await User.findOne(String(ctx.startPayload))
        }
        if (!contact) {
            ctx.reply(greeting)
        } else {
            user.state = State.MESSAGING
            user.messagingTo = contact.id
            user.save().then(() => {
                ctx.reply(greeting + '\n\n' + `شما از طریق لینک '${contact!.name}' وارد شده‌اید، پیامت به '${contact!.name}' رو بنویس`)
            }).catch((error) => {
                console.error(error)
                ctx.reply('خطایی رخ داده است')
            })
        }
    }
}