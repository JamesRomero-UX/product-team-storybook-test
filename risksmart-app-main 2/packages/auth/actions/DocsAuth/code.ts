import jwt from 'jsonwebtoken';

interface PostLoginAPI {
  redirect: {
    sendUserTo: (
      url: string,
      options?: { query?: Record<string, string> }
    ) => void;
  };
}

interface PostLoginEvent {
  user: { name: string; email: string };
  client: { name: string };
  secrets: Record<string, string>;
}

exports.onExecutePostLogin = async (
  event: PostLoginEvent,
  api: PostLoginAPI
) => {
  const JWT_EXPIRATION = '1d';

  if (
    ['Protected Public Docs', 'Protected Private Docs'].includes(
      event.client.name
    )
  ) {
    const user = {
      name: event.user.name,
      email: event.user.email,
    };

    if (event.client.name === 'Protected Private Docs') {
      const token = jwt.sign(
        user,
        event.secrets.ARCHBEE_PROTECTED_PRIVATE_JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      const ARCHBEE_URL = 'https://internal-docs.risksmart.com';

      api.redirect.sendUserTo(ARCHBEE_URL, {
        query: { jwt: token },
      });
    }

    if (event.client.name === 'Protected Public Docs') {
      const token = jwt.sign(
        user,
        event.secrets.ARCHBEE_PROTECTED_PUBLIC_JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      const ARCHBEE_URL = 'https://docs.risksmart.com';

      api.redirect.sendUserTo(ARCHBEE_URL, {
        query: { jwt: token },
      });
    }
  }
};
