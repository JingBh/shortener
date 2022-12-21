import { fromByteArray } from 'base64-js'
import cookie from 'cookie'

const ghTokenUrl = 'https://github.com/login/oauth/access_token'

/**
 * @param {EventContext} context
 * @return {Promise<Response>}
 */
export async function onRequest(context) {
  const { request, env } = context
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const tokenResponse = await fetch(ghTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla'
      },
      body: JSON.stringify({
        client_id: env['GITHUB_CLIENT_ID'],
        client_secret: env['GITHUB_CLIENT_SECRET'],
        code: searchParams.get('code')
      })
    })
    const tokenResponseJson = await tokenResponse.json()

    const ghUserUrl = 'https://api.github.com/user'
    const token = `Bearer ${tokenResponseJson.access_token}`
    const idResponse = await fetch(ghUserUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': token,
        'User-Agent': 'Mozilla'
      }
    })
    if (idResponse.ok) {
      const { id } = await idResponse.json()
      const headers = new Headers()
      headers.set('Location', '/')

      await new Promise((resolve, reject) => {
        setUidCookies(id, context).then((contents) => {
          contents.forEach((content) => {
            headers.append('Set-Cookie', content)
          })
          resolve()
        }).catch(reject)
      })

      return new Response(null, {
        status: 302,
        headers
      })
    }
  }

  return new Response(null, {
    status: 400
  })
}

/**
 * Generate a signature for the uid and set cookies.
 * @param {string} uid
 * @param {EventContext} context
 * @returns {Promise<string[]>} the headers to send
 */
const setUidCookies = async (uid, { env }) => {
  uid = uid.toString()
  const encoder = new TextEncoder()
  const algo = { name: 'HMAC', hash: 'SHA-256' }
  const rawKey = encoder.encode(env['HASH_SECRET'])
  const key = await crypto.subtle.importKey('raw', rawKey, algo, false, ['sign'])
  const rawUid = encoder.encode(uid)
  const rawSig = await crypto.subtle.sign(algo, key, rawUid)
  const sig = fromByteArray(new Uint8Array(rawSig))

  const cookieExpiry = new Date()
  cookieExpiry.setFullYear(cookieExpiry.getFullYear() + 1)
  const options = {
    secure: true,
    httpOnly: true,
    expires: cookieExpiry,  // 1 year
  }
  return [
    cookie.serialize('__uid', uid, options),
    cookie.serialize('__sig', sig, options)
  ]
}
