import { Entity, BaseEntity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm'

export enum State {
    IDLE = 'idle',
    MESSAGING = 'messaging',
    SET_NAME = 'set-name',
    REPLY = 'reply',
    UNBLOCKING = 'unblocking'
}

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    telegram_id: string

    @Column({ default: 'ناشناس' })
    name: string

    @Column('text', { default: State.IDLE })
    state: State

    //chatId
    @Column('text', { nullable: true })
    messagingTo: string | null

    //messageId
    @Column('text', { nullable: true })
    replyingTo: string | null

    @ManyToMany(type => User, user => user.blocked)
    @JoinTable()
    blockedBy: User[]

    @ManyToMany(type => User, user => user.blockedBy)
    blocked: User[]
}