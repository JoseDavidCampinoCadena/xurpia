import Cookies from 'js-cookie';

interface CookieOptions {
  expires?: number;
  path?: string;
  secure?: boolean;
}

const DEFAULT_OPTIONS: CookieOptions = {
  expires: 7,
  path: '/',
  secure: process.env.NODE_ENV === 'production'
};

export const setCookie = (name: string, value: string, options: CookieOptions = DEFAULT_OPTIONS): void => {
  Cookies.set(name, value, options);
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string, options: Pick<CookieOptions, 'path'> = DEFAULT_OPTIONS): void => {
  Cookies.remove(name, options);
};