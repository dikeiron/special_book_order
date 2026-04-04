import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 상대 경로로 빌드하여 모든 환경(GitHub, Local)에서 작동하도록 설정
  build: {
    outDir: 'dist',
  }
});
