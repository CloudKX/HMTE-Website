export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `https://${req.headers.host}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
  res.redirect(githubAuthUrl);
}