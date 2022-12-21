import { toByteArray } from 'base64-js'
import cookie from 'cookie'

/**
 * @param {EventContext} context
 * @return {Promise<Response>}
 */
export async function onRequest(context) {
  const { request, next } = context
  let { pathname } = new URL(request.url)
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1)
  }
  if (pathname.substring(pathname.length - 1) === '/') {
    pathname = pathname.substring(0, pathname.length - 1)
  }

  if (pathname !== 'callback') {
    const authed = await getUid(context)
    if (authed === null) {
      if (pathname !== 'login') {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/login'
          }
        })
      }
    } else if (authed === false) {
      return new Response(null, { status: 403 })
    }
  }

  return await next();
}

/**
 * Read and verify uid from cookies.
 * @param {EventContext} context
 * @returns {Promise<boolean | null>} uid existence and validity
 */
const getUid = async ({ request, env }) => {
  const cookies = cookie.parse(request.headers.get('Cookie') || '')

  const uid = cookies['__uid']
  const sig = cookies['__sig']

  if (uid && sig) {
    const encoder = new TextEncoder()
    const algo = { name: 'HMAC', hash: 'SHA-256' }
    const rawKey = encoder.encode(env['HASH_SECRET'])
    const key = await crypto.subtle.importKey('raw', rawKey, algo, false, ['verify'])
    const rawSig = toByteArray(sig).buffer
    const rawUid = encoder.encode(uid)
    const valid = await crypto.subtle.verify(algo, key, rawSig, rawUid)

    if (valid) {
      return env['GITHUB_ALLOWED_USERS']
        .split(',')
        .map(value => value.trim())
        .indexOf(uid) !== -1
    }
  }

  return null
}
