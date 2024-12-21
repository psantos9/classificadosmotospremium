export default {
  async fetch(request, env, ctx): Promise<Response> {
    return new Response('hi there!')
  }
} satisfies ExportedHandler<Env>
