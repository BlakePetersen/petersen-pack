'use client'

import { _Card } from './styles'
import { Types } from './types'

import { Children, ReactElement } from 'react'

const Card: Types = ({ children }): ReactElement => {
  return <_Card>{Children.map(children, (child: ReactElement) => child)}</_Card>
}

export default Card
