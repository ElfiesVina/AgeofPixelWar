"use strict";
/* Info aplikasi (dipakai Home dan Credits). */
var APP_VERSION = "0.2.0";
function exitApp() {
  // Di APK: jembatan Java menutup activity. Di browser: window.close() hanya jalan bila tab dibuka lewat skrip.
  if (window.AndroidBridge && window.AndroidBridge.exitApp) window.AndroidBridge.exitApp();
  else window.close();
}
