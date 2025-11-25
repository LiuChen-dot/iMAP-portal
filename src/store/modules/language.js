import { defineStore } from 'pinia'
export const useLanguageStore = defineStore('language', {
    state: () => ({
        i18n: localStorage.getItem('i18n') || 'zh',
    }),
    actions: {
        setLanguage(lang) {
            this.i18n = lang || 'zh';
        }
    },
});