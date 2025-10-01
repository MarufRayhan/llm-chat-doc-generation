export type TChat = Omit<PrismaChat, 'messages'> & {
  messages: Array<Message>
}
