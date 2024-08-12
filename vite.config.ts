import pluginBasicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

const pathResolve = (dir) => resolve(__dirname, '.', dir)
// https://vitejs.dev/config/
export default defineConfig((mode) => {
  console.log(process.env.NODE_ENV)
  console.log('>>>>>>>>>>>>>>>>>>>mode', mode)
  // 加载环境变量
  const env = loadEnv(mode.mode, process.cwd())
  console.log('>>>>>>>>>>>>>>>>>>>env', env)
  return {
    build: {
      sourcemap: true,
    },
    plugins: [
      vue(),
      pluginBasicSsl(),
      // element plus 自动引入
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: pathResolve('components.d.ts')
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 448,
      https: false
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
