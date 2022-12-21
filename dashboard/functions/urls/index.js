/**
 * @param {EventContext} context
 * @return {Promise<Response>}
 */
export async function onRequest(context) {
  const store = context.env['URLS']
  const { request } = context
  const { searchParams } = new URL(request.url)

  if (request.method === 'GET') {
    const limit = Number(searchParams.get('limit') || 20)
    const cursor = searchParams.get('cursor') || undefined

    const data = await store.list({limit, cursor})
    for (const entry of data.keys) {
      entry.value = await store.get(entry.name)
    }
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
