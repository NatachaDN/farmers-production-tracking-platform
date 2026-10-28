import { apiClient } from '../../../shared/services/apiClient';

/**
 * Google sign-in (OAuth 2.0 authorization-code flow with PKCE).
 * The browser only ever sees the authorization code; the backend exchanges it using the client secret.
 */
const STATE_KEY = 'acrea_google_state';
const VERIFIER_KEY = 'acrea_google_verifier';

export const GOOGLE_CALLBACK_PATH = '/auth/google/callback';

function base64Url(bytes) {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function challengeFor(verifier) {
  if (!window.crypto?.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

export function googleRedirectUri() {
  return `${window.location.origin}${GOOGLE_CALLBACK_PATH}`;
}

let pendingCompletion = null;

export const googleAuth = {
  getConfig() {
    return apiClient.get('/auth/google/config');
  },

  async start(clientId) {
    const state = randomString(16);
    const verifier = randomString(48);
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: googleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    const challenge = await challengeFor(verifier);
    if (challenge) {
      params.set('code_challenge', challenge);
      params.set('code_challenge_method', 'S256');
    }
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  },

  isCallback() {
    return window.location.pathname === GOOGLE_CALLBACK_PATH;
  },

  /**
   * Reads the callback URL once, removes the code from the address bar and exchanges it.
   * Calling it again (React StrictMode runs effects twice in dev) returns the same promise,
   * because an authorization code can only be used once.
   */
  complete() {
    if (!pendingCompletion) {
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');
      const state = query.get('state');
      const googleError = query.get('error');
      const expectedState = sessionStorage.getItem(STATE_KEY);
      const verifier = sessionStorage.getItem(VERIFIER_KEY);
      sessionStorage.removeItem(STATE_KEY);
      sessionStorage.removeItem(VERIFIER_KEY);
      window.history.replaceState({}, '', '/');

      pendingCompletion = (async () => {
        if (googleError) {
          throw new Error(googleError === 'access_denied'
            ? 'Google sign-in was cancelled.'
            : 'Google could not complete the sign-in. Please try again.');
        }
        if (!code || !state || !expectedState || state !== expectedState) {
          throw new Error('The Google sign-in session expired or was not recognised. Please try again.');
        }
        return apiClient.post('/auth/google', {
          code,
          redirectUri: googleRedirectUri(),
          codeVerifier: verifier || undefined,
        });
      })();
    }
    return pendingCompletion;
  },
};
