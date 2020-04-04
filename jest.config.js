module.exports = {
    verbose: true,
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(test).[jt]s?(x)'],
    transform: {
        '^.+\\.js?$': 'babel-jest',
    },
}
