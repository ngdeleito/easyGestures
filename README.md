easyGestures N is a Firefox extension that provides a fully customizable pie menu for browsing the Web from where your cursor is currently located.

It is a fork of the easyGestures extension created by Ons Besbes, who maintained it until Firefox 4. This extension worked fine with subsequent versions of Firefox, although it required changing the maxVersion value in its install manifest. However, with Firefox 14 easyGestures started behaving erratically and generating "TypeError: can't access dead object" errors.

easyGestures N is an (ongoing) attempt to bring easyGestures back to a usable and more maintainable state. This includes pruning those features that IMO fall outside the core concept of the extension. Help is very much welcome, especially for updating and maintaining both the visual appearance and the currently deprecated locales.

The deprecated locales are: cz-CZ, de-DE, hu-HU, it-IT, ja-JP, ko-KR, pl-PL, pt-BR, sk-SK, tr-TR, zh-CN and zh-TW. They can be found under the [extension/chrome/locale](https://github.com/ngdeleito/easyGestures/tree/development/extension/chrome/locale) folder.

To install the latest development version:

  - Uninstall any version of easyGestures prior to version 4.3.2
  - Click on the button labeled "Download ZIP"
  - Once the file downloaded, unzip it
  - Zip the content of the "easyGestures-development/extension" folder (and not the folder itself!)
  - Give to the resulting zip file the "xpi" extension
  - Drop the renamed zipped file into either Firefox Developer Edition or Firefox Nightly (make sure that the "xpinstall.signatures.required" preference in about:config is "false")
