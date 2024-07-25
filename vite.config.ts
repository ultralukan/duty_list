import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths';
import babel from 'vite-plugin-babel';
import postcss from '@vituum/vite-plugin-postcss'
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const path = mode === 'production' ? env.VITE_PATH : '/'
  return defineConfig({
    plugins: [
      react(),
      viteTsconfigPaths(),
      babel({
        babelConfig: {
          babelrc: false,
          configFile: false,
          plugins: [
            "@babel/plugin-transform-nullish-coalescing-operator"
          ]
        }
      }),
    ],
    base: path,
    server: {
      port: parseInt(env.VITE_PORT),
      host: true,
    },
  });
}
