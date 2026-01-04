import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { languages } from '../i18n'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('language')
    if (saved && languages[saved]) return saved
    const browser = navigator.language.split('-')[0]
    return languages[browser] ? browser : 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = languages[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
