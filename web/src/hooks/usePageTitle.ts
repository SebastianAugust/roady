import { useEffect } from 'react';
import { APP_NAME } from '../constants';

/** Sets the tab title to "<title> · <APP_NAME>" while the page is shown. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);
}
