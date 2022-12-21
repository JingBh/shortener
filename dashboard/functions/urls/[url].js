/**
 * @param {EventContext} context
 * @return {Promise<Response>}
 */
export async function onRequest(context) {
  const store = context.env['URLS']
  const { request } = context
  const { searchParams } = new URL(request.url)
  const pathname = context.params['url']

  if (request.method === 'GET') {
    const data = await store.getWithMetadata(pathname)
    if (data) {
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

  } else if (request.method === 'PUT' || request.method === 'PATCH') {
    const { metadata } = await store.getWithMetadata(pathname)
    const url = (await request.text()).trim()
    const expiry = Number(searchParams.get('expiry')) || undefined
    if (url) {
      await store.put(pathname, url, {
        expiration: expiry,
        metadata: metadata || {
          created: Math.round(new Date().getTime() / 1000),
          hits: 0
        }
      })
      return new Response(null, {
        status: 201
      })
    }

    return new Response(null, {
      status: 400
    })

  } else if (request.method === 'DELETE') {
    await store.delete(pathname)
    return new Response(null, {
      status: 204
    })
  }

  return new Response(null, {
    status: 404
  })
}
