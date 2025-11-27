import '../styles/global-styles.scss'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Frame from '@/components/Frame'

const wagmiConfig = getDefaultConfig({
  appName: '0xbp.io Wallet Visualizer',
  projectId: 'e5273f5b902bd128300842ed18422716',
  chains: [mainnet, polygon, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`)
  }
})

const queryClient = new QueryClient()

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider>
            <Frame>
              <Component {...pageProps} />
            </Frame>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyApp
