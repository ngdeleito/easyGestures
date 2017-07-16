easyGestures N is a Firefox extension that provides a highly customizable pie menu for browsing the Web from where the mouse pointer is located.

It is a fork of version 4.3.2 of the easyGestures extension created by Ons Besbes, who maintained it until Firefox 4.

Current development efforts focus on migrating easyGestures N to a WebExtension so that it remains compatible with future versions of Firefox. Help is very much welcome, especially for updating and maintaining both the visual appearance and the formerly supported locales.

The formerly supported locales are: cz-CZ, de-DE, hu-HU, it-IT, ja-JP, ko-KR, pl-PL, pt-BR, sk-SK, tr-TR, zh-CN and zh-TW. Their corresponding strings can be found under the [v4.13 extension/chrome/locale folder](https://github.com/ngdeleito/easyGestures/tree/v4.13/extension/chrome/locale).

To install the latest development version:

  - Make sure to run version 5.2 or greater (or uninstall any previous version)
  - Click on the button labeled "Clone or download", and then click on "Download ZIP"
  - Once the file downloaded, unzip it
  - Zip the content of the "easyGestures-development/extension" folder (and not the folder itself!)
  - Give to the resulting zip file the "xpi" extension
  - Drop the renamed zipped file into either Firefox Developer Edition or Firefox Nightly (make sure that the "xpinstall.signatures.required" preference in about:config is "false")
