Overview
--------
This module provides a way to autosave data entered in any Drupal form without actually submitting the form, which helps if the user is writing an article or a comment and the browser crashed or the power went down, or even if the window was closed accidently.

It works using the [jQuery Sisyphus plugin](http://sisyphus-js.herokuapp.com/), which is a lightweight jQuery plugin that uses Local Storage to save form fields every specific time span that is configurable from the module settings page.

Installation Instructions
-------------------------
1. Install the other modules that this one depends upon. Follow these contrib module installation instructions if you're new to this kind of thing: https://drupal.org/documentation/install/modules-themes/modules-7
    * jQuery Update: https://drupal.org/project/jquery_update
    * Libraries API: https://drupal.org/project/libraries
2. Download the Javascript libraries.
    * First, make sure that the sites/all/libraries directory exists.
    * Download the two JS libraries to the sites/all/libraries directory:
        * Sisyphus: https://github.com/compujohnny/sisyphus/archive/master.zip
        * jStorage: https://github.com/compujohnny/jStorage/archive/master.zip
    * Extract both zip files.
    * Rename both directories to remove -master. The directories should be called sisyphus and jStorage.
3. Enable the Save Form State module from the Modules list, at admin/modules
4. Configure jQuery Update to use version 1.7 or above. The configuration can be found at admin/config/development/jquery_update.
5. Configure the Save Form State module options at admin/config/content/form_save_state.
6. Navigate to the forms you choose in the previous step and enjoy the safety of your data.

Using CKEditor
--------------
Sisyphus does not work with CKEditor out of the box, but there is a fork available that does support CKEditor. Install this module normally following the instructions above, but instead of getting the Sisyphus library from compujohnny/sisyphus on github in step 2 above, download this version: https://github.com/TommiGustafsson/sisyphus/archive/master.zip

If you have already installed this module and want to add CKEditor support, simply download that fork of Sisyphus and replace the existing sites/all/libraries/sisyphus directory with that version.
