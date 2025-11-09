/**
 * Vercel Serverless Function for GitHub OAuth Callback
 * Redirects back to the CMS admin after authentication
 */

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  // Redirect back to the admin with the code
  // The CMS will handle the token exchange via the /api/auth endpoint
  const adminUrl = `${req.headers.origin || 'https://' + req.headers.host}/admin/`;
  const redirectUrl = `${adminUrl}#/auth?code=${code}`;

  res.writeHead(302, { Location: redirectUrl });
  res.end();
};
