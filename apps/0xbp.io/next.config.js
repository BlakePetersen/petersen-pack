/** @type {import("next").NextConfig} */

const withPlugins = require('next-compose-plugins')
const path = require('path')
const withTM = require('next-transpile-modules')(['artax-ui'])

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: [
      'gateway.pinata.cloud',
      'degentoonz-app-gfcxi.ondigitalocean.app',
      'degentoonz.fra1.cdn.digitaloceanspaces.com',
      '1sc60ixn9c.execute-api.us-east-1.amazonaws.com',
      'nervous.mypinata.cloud',
      'api.passage.xyz',
      'images.mirror-media.xyz',
      'thugslady.site',
      'fanggang.s3.us-east-2.amazonaws.com',
      'y.at',
      'ipfs.io',
      'lh3.googleusercontent.com',
      'mint.sacredskullsnft.io',
      'toonsquad-public-prereveal.s3.amazonaws.com',
      'mint.womenfromvenus.io',
      'gateway.ipfs.io',
      'res.cloudinary.com',
      'eth-mainnet.alchemyapi.io',
      'safe-nft-metadata-provider-3-5mgae.ondigitalocean.app',
    ],
  },
}

module.exports = withPlugins([withTM], nextConfig)
