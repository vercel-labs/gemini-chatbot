/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: 'https://vercel.com/templates/next.js/gemini-ai-chatbot',
        permanent: false
      }
    ]
  }
}
