module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es6: true
    },
    extends: ['plugin:vue/essential', '@vue/prettier'],
    plugins: ['prettier'],
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'prettier/prettier': [
            'warn',
            {
                endOfLine: 'auto',
                tabWidth: 4
            }
        ],
        'no-unused-vars': 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
