export default {
  async fetch(request, env) {
    /* @type {KVNamespace} */
    this.urls = env.URLS

    return await this.handleRequest(request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  },

  /**
   * Many more examples available at:
   *   https://developers.cloudflare.com/workers/examples
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async handleRequest(request) {
    let { pathname } = new URL(request.url)

    pathname = pathname.substring(1) || '@'

    const data = await this.urls.getWithMetadata(pathname)
    if (data.value) {
      if (!data.metadata) {
        data.metadata = { hits: 0 }
      }
      data.metadata.hits = Number(data.metadata.hits) + 1
      await this.urls.put(pathname, data.value, {
        metadata: data.metadata
      })
      return new Response(null, {
        status: 301,
        headers: {
          'Cache-Control': 'private, max-age=90',
          'Location': data.value,
          'Referrer-Policy': 'no-referrer'
        }
      })
    }

    return new Response(null, {
      status: 404
    })
  }
}
