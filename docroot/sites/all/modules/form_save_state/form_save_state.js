(function ($) {

  Drupal.behaviors.formSaveState = {
    attach: function (context, settings) {
      if (Drupal.settings.form_save_state.form_id) {
        jQuery('#' + Drupal.settings.form_save_state.form_id).sisyphus({
          timeout: Drupal.settings.form_save_state.time,

          // Don't save the hidden form info fields
          excludeFields: $('input[name=form_build_id], input[name=form_token], input[name=form_id], input[name=changed]'),

          // Triggered when data is saved locally by Sisyphus
          onSave: function() {
            if (Drupal.settings.form_save_state.notify == 1) {
              jQuery.jnotify(Drupal.settings.form_save_state_notifications.saved, 500);
            }
          },

          // Triggered before data is saved locally by Sisyphus
          // If CKEditor is in use, update instances before saving
          onBeforeSave: function () {
            if (typeof CKEDITOR != 'undefined') {
              for (var edid in CKEDITOR.instances) {
                CKEDITOR.instances[edid].updateElement();
              }
            }
          },

          // Triggered before data is saved locally by Sisyphus, based on change
          // to a text field
          // If CKEditor is in use, update the instance before saving
          onBeforeTextSave: function () {
            if (typeof CKEDITOR != 'undefined') {
              var ed = CKEDITOR.instances[jQuery(this).attr("name")];
              if (ed) {
                ed.updateElement();
              }
            }
          },

          // Triggered when data is loaded locally by Sisyphus
          onRestore: function() {
            if (Drupal.settings.form_save_state.notify == 1) {
              jQuery.jnotify(Drupal.settings.form_save_state_notifications.restored, 500);
            }

            // If CKEditor is in use, update the values in the editor(s) on the
            // page
            if (typeof CKEDITOR != 'undefined') {
              for (var edid in CKEDITOR.instances) {
                var instance = CKEDITOR.instances[edid];
                var value = instance.element.getValue();
                instance.setData(value);
              }
            }
          },

          // Triggered when local data is deleted by Sisyphus
          onRelease: function() {
            if (Drupal.settings.form_save_state.notify == 1) {
              jQuery.jnotify(Drupal.settings.form_save_state_notifications.removed, 'warning', 500);
            }
          }

        });
      }
    }
  };

})(jQuery);
