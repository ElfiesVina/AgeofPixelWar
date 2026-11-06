// Konfigurasi tingkat root: hanya mendeklarasikan plugin (versi di gradle/libs.versions.toml).
plugins {
    alias(libs.plugins.android.application) apply false
}
