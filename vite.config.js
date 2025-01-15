import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import removeConsole from 'vite-plugin-remove-console'

const modifyManifest = (isProd) => {
  const manifestCopy = structuredClone(manifest)
  if (!isProd) {
    manifestCopy.content_security_policy.extension_pages =
      "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; img-src 'self' chrome://favicon/; connect-src 'self' https://generativelanguage.googleapis.com/ ws://localhost:5173 http://localhost:5173"
  }
  return manifestCopy
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      crx({ manifest: modifyManifest(isProd) }),
      removeConsole({ // 注意：根据插件的版本和选项，可能需要调整
        target: 'console'
      }),
    ],
    server: {
      port: 5173,
      strictPort: true, // 如果端口被占用，不要尝试下一个可用端口
      hmr: {
        port: 5173,
        protocol: 'ws',
        host: 'localhost'
      }
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: {
          index: 'index.html',
        },
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      minify: 'esbuild',
      // esbuild: {
      //   pure: ['console.*', 'debugger'],
      // },
    },
  }
})
