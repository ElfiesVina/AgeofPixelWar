# Game berjalan sepenuhnya di WebView (JavaScript), tidak ada refleksi Java.
# Tidak ada aturan khusus yang dibutuhkan. Tambahkan -keep di sini bila nanti memakai JavascriptInterface.
-keepattributes SourceFile,LineNumberTable

# Jembatan JavaScript (tombol EXIT) harus tetap ada di build release (R8 akan menghapusnya tanpa aturan ini).
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
