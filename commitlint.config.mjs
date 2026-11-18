export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['feat', 'chore', 'fix', 'refactor']],
        'scope-empty': [2, 'never']
    }
}