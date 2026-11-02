import { mockApi, setMockToken } from './mock';
import { realApi, setAuthToken as setRealToken } from './real';

// Mock is the default; set VITE_USE_MOCK=false to talk to the real API.
const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const api = useMock ? mockApi : realApi;
/** Token sent by the real client; the mock reads it to know who is signed in. */
export const setAuthToken = (t: string | undefined) => {
  setRealToken(t);
  setMockToken(t);
};
export { ApiError } from './types';
export type { ApiClient } from './types';
