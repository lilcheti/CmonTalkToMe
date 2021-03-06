import { Entity, BaseEntity, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm'

export enum State {
    IDLE = 'idle',
    MESSAGING = 'messaging',
    SET_NAME = 'set-name',
    REPLY = 'reply',
    UNBLOCKING = 'unblocking',
    RANDOM = 'random',
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    telegram_id: string

    @Column('text', { default: null })
    uid: string | null

    @Column({ default: 'ناشناس' })
    name: string

    @Column('text', { default: State.IDLE })
    state: State

    //chatId
    @Column('int', { nullable: true })
    messagingTo: string | null

    //messageId
    @Column('int', { nullable: true })
    replyingTo: number | null

    @ManyToMany(type => User, user => user.blocked)
    @JoinTable()
    blockedBy: User[]

    @ManyToMany(type => User, user => user.blockedBy)
    blocked: User[]
}