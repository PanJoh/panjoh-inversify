import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
    plugins: [swc.vite()],
    test: {
        server: {
            deps: {
                inline: ['inversify'],
            },
        },
        exclude: ["dist"]
    },
});