export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === '/' || pathname === '') {
        // Returnează lista de imagini ca JSON, cu header CORS
        const list = await env.R2_BUCKET.list();
        const baseUrl = url.origin;

        const urls = list.objects.map(obj => `${baseUrl}/${encodeURIComponent(obj.key)}`);

        return new Response(JSON.stringify(urls), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"   // *** Aici este CORS ***
          }
        });
      } else {
        // Servește imaginea cerută
        const key = pathname.slice(1);

        const object = await env.R2_BUCKET.get(key);
        if (!object) {
          return new Response("Not Found", { status: 404 });
        }

        return new Response(object.body, {
          headers: {
            "Content-Type": object.httpMetadata.contentType || "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"   // *** Aici este CORS pentru imagini ***
          }
        });
      }
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }
};
