import { NextPage } from 'next'

export type PageTypes = NextPage<{
  children: React.ReactNode
  description: string
  title: string
}>
