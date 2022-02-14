import { TelegrafContext } from 'telegraf/typings/context'
import { Markup, Extra } from 'telegraf'

export const faq = (ctx: TelegrafContext) => {
    ctx.replyWithMarkdown(
        '❓ *قابلیت دیدن خوانده‌شدن پیام*\n' +
        ' -  برای انجام این کار نیاز میشه که پیام رو تا وقتی که شخص مورد نظر نخونده روی سرور ذخیره کنم، برای همین اصلا این فیچر رو قرار ندادم\n' +
        '\n' +
        '❓ *چرا جلوی لینک‌ها عدد قرار داره و قابل حدس هستن؟*\n' +
        ' -  من مشکلی توی این مساله نمی‌بینم، شما ممکنه عدد جلوی یه لینک رو عوض کنید و به یکی که نمی‌شناسیدش پیام بدید، که  خب براتون آرزوی موفقیت دارم، هر دو طرف هم رو نمیشناسید\! اگر هم کسی اینطوری مزاحمتون شد می‌تونید بلاکش کنید\n' +
        '\n' +
        '❓ *چرا نمیتونم زمان آنبلاک کردن انتخاب کنم و باید همه رو آنبلاک کنم؟*\n' +
        ' -  مساله اینه که یکی که نمیشناسید رو بلاک کردید، چطوری میخواید تشخیص بدید کی بوده که حالا انتخابش کنید که آنبلاکش کنید؟ یا من چطوری بهتون نشونش بدم که انتخابش کنید؟\n' +
        '\n' +
        '❓ *چرا می‌تونم به خودم مسیج بدم؟*\n' +
        ' -  من روزهای اول متوجه این مساله شدم، ولی به این نتیجه رسیدم که حذفش نکنم، چون که کاربرد منفی نداره، اما میتونه مفید باشه و کار یه ربات بی‌نام رو براتون انجام بده\! در واقع میتونید چیزی بفرستید به ربات بعد فورواردش کنید جای دیگه بدون اینکه اسمتون بالاش نوشته بشه یا مشخص باشه شما نوشتیدش\n' +
        '\n' +
        '❓ *هزینه‌های ربات از کجا تامین میشه؟*\n' +
        ' -  در حال حاضر فقط از طریق کمک مالی و هزینه شخصی\! میتونید از اینجا کمک کنید برای هزینه سرور اگر مایل بودید\n' +
        '💸 [حمایت مالی](https://gitlab.com/molaeiali/CumonTalktoMeBot-bot#حمایت-مالی)\n' +
        '\n' +
        '❓ *ربات مشکل داره، چطوری می‌تونم گزارش کنم؟*\n' +
        ' -  از طریق لینک زیر میتونی مشکلات رو گزارش کنی:\n' +
        '🚫 [گزارش مشکل](https://gitlab.com/molaeiali/CumonTalktoMeBot-bot/-/issues)'
    )
}
