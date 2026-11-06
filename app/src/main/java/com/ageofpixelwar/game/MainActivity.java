package com.ageofpixelwar.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.webkit.WebViewAssetLoader;

/** Satu-satunya layar: WebView layar penuh yang memuat game dari assets/www. */
public class MainActivity extends Activity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        webView.setBackgroundColor(AppConfig.BACKGROUND_COLOR);
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.setLongClickable(false);
        webView.setOnLongClickListener(v -> true);   // cegah menu salin/pilih teks saat tekan lama
        webView.setHapticFeedbackEnabled(false);
        setContentView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);        // aset dilayani lewat AssetLoader, bukan file://
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);                 // UI game berbasis px; abaikan skala font sistem
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(AppConfig.HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        webView.setWebViewClient(new GameWebViewClient(assetLoader));
        webView.setWebChromeClient(new GameWebChromeClient());

        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void exitApp() { runOnUiThread(MainActivity.this::finish); }
        }, "AndroidBridge");

        webView.loadUrl(AppConfig.START_URL);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) SystemUi.enterImmersive(getWindow());
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        webView.onPause();   // menghentikan timer/rAF saat aplikasi di latar belakang
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            ((ViewGroup) webView.getParent()).removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
