import { getL, postL, type Lang } from '../utils/i18n.util'

type LanguageOptionT = {
	code: Lang
	label: string
	flag: string
}

const languages: LanguageOptionT[] = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
]

export const LanguageSwitcher = () => {
	const currentLang = getL() as Lang

	const handleLanguageChange = (lang: Lang) => {
		if (lang !== currentLang) {
			postL(lang)
			window.location.reload()
		}
	}

	return (
		<div className="flex space-x-2">
			{languages.map((language) => (
				<button
					key={language.code}
					onClick={() => handleLanguageChange(language.code)}
					className={`flex cursor-pointer items-center rounded px-2 py-1 ${
						currentLang === language.code
							? 'bg-blue-500 text-white'
							: 'bg-gray-200 hover:bg-gray-300'
					}`}
					aria-label={`Switch to ${language.label}`}
				>
					<span className="mr-1">{language.flag}</span>
					<span>{language.code.toUpperCase()}</span>
				</button>
			))}
		</div>
	)
}
