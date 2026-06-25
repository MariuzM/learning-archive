import i18next, * as i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, useTranslation } from 'react-i18next'

import en from '../locales/en.locale.json'
import lt from '../locales/lt.locale.json'

const ld = new LanguageDetector()
const LANGS = ['en', 'lt'] as const
export type Lang = (typeof LANGS)[number]

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: { en: typeof en }
	}
}

export default i18n
	.use(initReactI18next)
	.use(ld)
	.init({
		resources: { en: { translation: en }, lt: { translation: lt } },
	})

export const t = (key: string): string => i18n.t(key)
export const useT = () => useTranslation().t as (key: string) => string
export const getL = () => i18next.language || window.localStorage.i18nextLng
export const postL = (lang: Lang) => i18n.changeLanguage(lang)
const LOC = { en: 'en-GB', lt: 'lt-LT' }
export const getLocale = () => LOC[getL() as Lang]

export const formatNumber = (value: number) => {
	const locale = getLocale()
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value || 0)
}
