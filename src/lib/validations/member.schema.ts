import { z } from 'zod'

export const InviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']).default('member'),
})

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
})

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>
