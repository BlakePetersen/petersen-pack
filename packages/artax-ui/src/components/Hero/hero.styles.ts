import { styled } from '@stitches/react'

export const _Hero = styled('div', {
  display: 'flex',
  flexDirection: `column`,
  alignItems: 'center',
  justifyContent: 'center',
  width: `100vw`,
})

export const _Lead = styled('div', {
  display: 'flex',
  flexDirection: `column`,
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '1rem',
})

export const _Copy = styled('div', {
  fontSize: '.8rem',
  margin: `0`,
})

export const _H1 = styled('h1', {
  fontSize: '1.5rem',
  margin: `0`,
})

export const _H2 = styled('h2', {
  fontSize: '1rem',
  margin: `0`,
})
