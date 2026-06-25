import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	{
		files: ['src/**/*.{ts,tsx}'],
	},
	{
		plugins: {
			'react-hooks': reactHooks,
		},
	},
	{
		ignores: [
			'android',
			'babel.config.js',
			'build',
			'dist',
			'ios',
			'metro.config.js',
			'node_modules',
		],
	},
	{
		rules: {
			...reactHooks.configs.recommended.rules,
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
)
