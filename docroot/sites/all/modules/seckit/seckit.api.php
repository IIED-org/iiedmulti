<?php

/**
 * @file
 * Hooks provided by Security Kit.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Alter the Security Kit settings.
 *
 * Note that if multiple 'ALLOW-FROM' values are configured for X-Frame-Options
 * then seckit implements hook_boot() and, when that runs, modules implementing
 * hook_seckit_options_alter() may not be loaded.  This may affect pages which
 * are returned from the Drupal page cache, for example.  If this issue affects
 * you, a simple workaround is to implement hook_boot() in the same module that
 * implements hook_seckit_options_alter() to ensure that the alter hook will be
 * available at hook_boot() time.  Note that hook_boot() and hook_exit() do not
 * run for cached pages unless variable_get('page_cache_invoke_hooks', TRUE).
 *
 * @param array $options
 *   Array of runtime options.
 *
 * @see _seckit_get_options()
 * @see seckit_boot()
 * @see _drupal_bootstrap_page_cache()
 */
function hook_seckit_options_alter(array &$options) {
  // Set the X-Frame-Options HTTP header value to SAMEORIGIN.
  $options['seckit_clickjacking']['x_frame'] = SECKIT_X_FRAME_SAMEORIGIN;
  // Add a new CSP directive "foo-src example.com".
  $options['seckit_xss']['csp']['foo-src'] = 'example.com';
}

/**
 * @} End of "addtogroup hooks".
 */
