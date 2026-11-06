package com.ageofpixelwar.game;

import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

/** Mode imersif: sembunyikan status bar dan navigation bar (muncul sementara saat di-swipe). */
final class SystemUi {
    private SystemUi() {}

    static void enterImmersive(Window window) {
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(window, window.getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
