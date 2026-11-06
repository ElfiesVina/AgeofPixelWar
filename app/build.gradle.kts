import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
}

// Tanda tangan release dibaca dari keystore.properties (opsional, tidak di-commit).
val keystoreProps = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "com.ageofpixelwar.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ageofpixelwar.game"
        minSdk = 26          // ikon adaptif tanpa PNG fallback
        targetSdk = 36       // wajib untuk rilis Google Play sejak 31 Agu 2026
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        if (keystoreProps.containsKey("storeFile")) {
            create("release") {
                storeFile = file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfigs.findByName("release")?.let { signingConfig = it }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core)     // WindowInsetsControllerCompat (mode imersif)
    implementation(libs.androidx.webkit)   // WebViewAssetLoader (melayani aset lewat https lokal)
}
