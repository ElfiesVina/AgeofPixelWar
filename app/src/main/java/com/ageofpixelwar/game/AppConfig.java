package com.ageofpixelwar.game;

/** Konstanta aplikasi. */
final class AppConfig {
    private AppConfig() {}

    /** Domain virtual yang dilayani WebViewAssetLoader (bukan domain internet sungguhan). */
    static final String HOST = "appassets.androidplatform.net";

    /** Halaman awal: assets/www/index.html. */
    static final String START_URL = "https://" + HOST + "/assets/www/index.html";

    static final int BACKGROUND_COLOR = 0xFF0A0A0F;
}
