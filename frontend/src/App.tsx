import React, { useEffect } from 'react';
import { translations } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import '@aws-amplify/ui-react/styles.css';
import AuthAmplify from './components/AuthAmplify';
import AuthCustom from './components/AuthCustom';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';
import './i18n';
import LocalConfigHelp from './pages/LocalConfigHelp';
import { validateSocialProvider } from './utils/SocialProviderUtils';
import AppContent from './layouts/AppContent';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './pages/ErrorFallback';

const customProviderEnabled =
  import.meta.env.VITE_APP_CUSTOM_PROVIDER_ENABLED === 'true';
const socialProviderFromEnv = import.meta.env.VITE_APP_SOCIAL_PROVIDERS?.split(
  ','
).filter(validateSocialProvider);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // set header title
    document.title = t('app.name')
  }, [t]);

  const authEnv = {
    userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
    domain: import.meta.env.VITE_APP_COGNITO_DOMAIN,
    redirectSignIn: import.meta.env.VITE_APP_REDIRECT_SIGNIN_URL,
    redirectSignOut: import.meta.env.VITE_APP_REDIRECT_SIGNOUT_URL,
  } as const;

  const hasAuthConfig = Boolean(authEnv.userPoolId && authEnv.userPoolClientId);

  if (hasAuthConfig) {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: authEnv.userPoolId,
          userPoolClientId: authEnv.userPoolClientId,
          loginWith: {
            oauth: {
              domain: authEnv.domain,
              scopes: ['openid', 'email'],
              redirectSignIn: [authEnv.redirectSignIn],
              redirectSignOut: [authEnv.redirectSignOut],
              responseType: 'code',
            },
          },
        },
      },
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn('Amplify Auth not configured. Missing VITE_APP_USER_POOL_ID and/or VITE_APP_USER_POOL_CLIENT_ID. Showing LocalConfigHelp.');
  }

  I18n.putVocabularies(translations);
  I18n.setLanguage(i18n.language);

  if (!hasAuthConfig) {
    return (
      <ErrorBoundary fallback={<ErrorFallback />}>
        <LocalConfigHelp />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {customProviderEnabled ? (
        <AuthCustom>
          <AppContent />
        </AuthCustom>
      ) : (
        <Authenticator.Provider>
          <AuthAmplify socialProviders={socialProviderFromEnv}>
            <AppContent />
          </AuthAmplify>
        </Authenticator.Provider>
      )}
    </ErrorBoundary>
  );
};

export default App;
