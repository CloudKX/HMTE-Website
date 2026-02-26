export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = await response.json();
    const token = data.access_token;

    const html = `
      <!DOCTYPE html><html><body><script>
        function receiveMessage(e) {
          window.opener.postMessage('authorization:github:success:{"token":"${token}","provider":"github"}', e.origin);
          window.removeEventListener("message", receiveMessage);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script></body></html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Authentication Failed');
  }
}