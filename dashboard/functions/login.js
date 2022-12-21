const ghAuthorizeUrl = 'https://github.com/login/oauth/authorize'

/**
 * @param {EventContext} context
 * @return {Promise<Response>}
 */
export async function onRequest({ env }) {
  const ghClientId = env['GITHUB_CLIENT_ID']

  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': 'no-cache',
      'Location': `${ghAuthorizeUrl}?client_id=${ghClientId}&allow_signup=false`
    }
  })
}
