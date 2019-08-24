export const APPCONSTANT = {
    COOKIENAME: {
        HAS_LOGIN: 'hasLogin', // 这个是有时间限制的cookie，同时，关闭浏览器，也需要清除这个cookie
        TIME_OUT_HOUR: 24,
        LANGUAGE: 'lang',
        SUPPORTED_LANGUAGES: 'supporttedLang',
        LOGIN_EMAIL: 'loginEmail',
        CURRENT_PAGE: 'currentPage'
    },
    NOTLOGIN_URLS: ['register', 'forgot-password', 'coming-soon', 'login', 'reset-password'],
    MULTI_LANGUAGE: true,
    DEFAULT_LANGUAGE: {key: 'en-us', label: 'English', flag: 'us'},
    NAV_NAME: 'curent_user_menu',
    LOGIN_PAGE_URL: 'login',
    DASHBOARD_URL: 'dashboard',
    SELECTIVERSCOPE: {     // ques:选择器item范围在前端参数化是否合理? todo 这里总感觉怪怪的,留个remark
        RADIO: [0, 3],
        SINGLESELECT: [4, 10],
        AUTOCOMPLETE: [11, 10000]
    }
};
