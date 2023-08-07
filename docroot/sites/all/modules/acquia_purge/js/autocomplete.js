(function ($, Drupal) {

  /**
   * Retains core autcomplete behavior.
   */
  Drupal.ACDB.prototype.core_search = Drupal.ACDB.prototype.search;

  /**
   * Strips file extensions from search
   */
  Drupal.ACDB.prototype.search = function (searchString) {

    var extensions = Drupal.settings.acquia_purge.join("|");
    var extensionsRegex = new RegExp("^(.+)\.(" + extensions + ")$");
    searchString = searchString.replace(extensionsRegex, "$1_$2");
    this.core_search(searchString);
  };

})(jQuery, Drupal);
