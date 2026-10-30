// TODO: Remove this workaround when https://github.com/vercel/next.js/issues/97757 is fixed.
const MAX_TUNNEL_RESPONSE_LISTENERS = 15;
const LOCALIZED_TUNNEL_PATH = /^\/(?:default|fi|sv|en)\/monitoring\/?$/;

/** temp workaround */
export const configureSentryTunnelListenerLimit = async () => {
  const diagnosticsChannel = await import("node:diagnostics_channel");
  diagnosticsChannel
    .channel("http.server.request.start")
    .subscribe((message) => {
      const { request, response } = message as {
        request: { url?: string };
        response: {
          getMaxListeners(): number;
          setMaxListeners(limit: number): void;
        };
      };
      const pathname = request.url?.split("?", 1)[0];
      if (
        pathname === "/monitoring" ||
        LOCALIZED_TUNNEL_PATH.test(pathname ?? "")
      ) {
        const currentLimit = response.getMaxListeners();
        if (
          currentLimit !== 0 &&
          currentLimit < MAX_TUNNEL_RESPONSE_LISTENERS
        ) {
          response.setMaxListeners(MAX_TUNNEL_RESPONSE_LISTENERS);
        }
      }
    });
};
