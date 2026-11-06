package com.ageofpixelwar.game;

import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;

/** Meneruskan console.log/error JavaScript ke Logcat (tag "AgeOfPixelWarJS"). */
final class GameWebChromeClient extends WebChromeClient {

    private static final String TAG = "AgeOfPixelWarJS";

    @Override
    public boolean onConsoleMessage(ConsoleMessage m) {
        String msg = m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")";
        switch (m.messageLevel()) {
            case ERROR:   Log.e(TAG, msg); break;
            case WARNING: Log.w(TAG, msg); break;
            default:      Log.d(TAG, msg); break;
        }
        return true;
    }
}
