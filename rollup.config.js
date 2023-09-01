
export default [
    {
        input: './src/index.js',
        treeshake: false,
        external: p => /^three/.test( p ),

        watch: {
            include: ['./src/**/*.js', './server/**/*.*']
        },

        output: {

            name: 'Photons',
            extend: true,
            format: 'umd',
            file: './build/photons.umd.cjs',
            sourcemap: true,

            globals: p => /^three/.test( p ) ? 'THREE' : null,

        },

    },
    {
        input: './src/index.js',
        treeshake: false,
        external: p => /^three/.test( p ),
        watch: {
            include: ['./src/**/*.js', './server/**/*.*']
        },

        output: {

            format: 'esm',
            file: './build/photons.module.js',
           // dir: './build/',
            inlineDynamicImports: true,
            sourcemap: true,

        },

    }
];