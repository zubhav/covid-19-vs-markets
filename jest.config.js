process.TZ = 'UTC'

module.exports = {
    verbose: true,
    moduleFileExtensions: ['js', 'svelte'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(test).[jt]s?(x)'],
    transform: {
        '^.+\\.js?$': 'babel-jest',
        '^.+\\.svelte$': 'svelte-jester',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
}
