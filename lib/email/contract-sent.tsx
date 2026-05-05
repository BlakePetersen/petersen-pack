// ABOUTME: Email template for contract sent notification
// ABOUTME: Rendered with React Email

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface ContractSentEmailProps {
  clientName: string
  contractUrl: string
  depositAmount: number
  shootDate: string
}

export default function ContractSentEmail({
  clientName,
  contractUrl,
  depositAmount,
  shootDate,
}: ContractSentEmailProps) {
  const formattedDeposit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(depositAmount / 100)

  return (
    <Html>
      <Head />
      <Preview>Your photography contract from Ashley Petersen is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Photography Contract</Heading>
          <Text style={text}>Hi {clientName},</Text>
          <Text style={text}>
            Your photography contract is ready for review and signature. Please
            review the terms and sign at your earliest convenience.
          </Text>
          <Text style={text}>
            <strong>Shoot Date:</strong>{' '}
            {new Date(shootDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={text}>
            <strong>Deposit Due:</strong> {formattedDeposit}
          </Text>
          <Link href={contractUrl} style={button}>
            Review & Sign Contract
          </Link>
          <Text style={footer}>
            Questions? Reply to this email or contact Ashley directly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 32px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  margin: '32px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
}
