// Supabase JS v2 – thin wrapper loaded from CDN UMD build.
// The actual <script> tag must load the UMD bundle *before* this file:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
//
// Usage anywhere in the app:
//   import / use  window._supabase  (the initialized client)

(function () {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;

  if (!url || url.includes("YOUR_PROJECT_ID") ||
      !key || key.includes("YOUR_ANON_KEY")) {
    const msg =
      "⚠️  Supabase credentials not set.\n\n" +
      "Copy  site/config.example.js  →  site/config.js\n" +
      "and fill in SUPABASE_URL and SUPABASE_ANON_KEY.";
    console.error(msg);

    // Show a visible banner on the page
    document.addEventListener("DOMContentLoaded", function () {
      var banner = document.createElement("div");
      banner.style.cssText =
        "position:fixed;top:0;left:0;right:0;background:#e53e3e;color:#fff;" +
        "padding:12px 16px;font-size:14px;z-index:9999;text-align:center;";
      banner.textContent =
        "Config missing: copy config.example.js → config.js and set SUPABASE_URL / SUPABASE_ANON_KEY";
      document.body.prepend(banner);
    });
    return;
  }

  // createClient is exposed on the global supabase object from the UMD bundle
  window._supabase = window.supabase.createClient(url, key);
})();
