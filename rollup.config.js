
export default [
    {
        input: './src/index.js',
        treeshake: false,
        external: p => /^three/.test( p ),

        watch: {
            include: './src/**'
        },

        output: {

            name: 'Photons',
            extend: true,
            format: 'umd',
            file: './build/index.umd.cjs',
            sourcemap: true,

            globals: p => /^three/.test( p ) ? 'THREE' : null,

        },

    },
    {
        input: './src/index.js',
        treeshake: false,
        external: p => /^three/.test( p ),
        watch: {
            include: './src/**'
        },

        output: {

            format: 'esm',
            file: './build/index.module.js',
            sourcemap: true,

        },

    }
];