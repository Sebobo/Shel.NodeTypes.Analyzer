import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    entryPoints: ['Resources/Private/JavaScript/src/index.tsx'],
    outfile: 'Resources/Public/Assets/main.bundle.js',
    bundle: true,
    minify: !isWatch,
    sourcemap: true,
};

if (isWatch) {
    (await esbuild.context(options)).watch().then(() => console.log('Rebuilt ⚡️'));
} else {
    esbuild.build(options).then(() => console.log('Done ⚡️'));
}
