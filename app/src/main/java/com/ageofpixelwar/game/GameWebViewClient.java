package com.ageofpixelwar.game;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/** Melayani aset lokal dan memblokir semua navigasi keluar dari domain aplikasi. */
final class GameWebViewClient extends WebViewClient {

    private final WebViewAssetLoader assetLoader;

    GameWebViewClient(WebViewAssetLoader assetLoader) {
        this.assetLoader = assetLoader;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        return assetLoader.shouldInterceptRequest(request.getUrl());
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        // true = tangani sendiri (blokir) bila bukan domain aplikasi.
        return !AppConfig.HOST.equals(request.getUrl().getHost());
    }
}
