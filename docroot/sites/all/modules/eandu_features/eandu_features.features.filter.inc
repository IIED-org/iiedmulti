<?php
/**
 * @file
 * eandu_features.features.filter.inc
 */

/**
 * Implements hook_filter_default_formats().
 */
function eandu_features_filter_default_formats() {
  $formats = array();

  // Exported format: Advanced HTML
  $formats['advanced_html'] = array(
    'format' => 'advanced_html',
    'name' => 'Advanced HTML',
    'cache' => '1',
    'status' => '1',
    'weight' => '-8',
    'filters' => array(
      'filter_url' => array(
        'weight' => '0',
        'status' => '1',
        'settings' => array(
          'filter_url_length' => '72',
        ),
      ),
      'filter_flickr' => array(
        'weight' => '0',
        'status' => '1',
        'settings' => array(),
      ),
      'filter_image_caption' => array(
        'weight' => '0',
        'status' => '1',
        'settings' => array(
          'classes' => 'image-left image-right standalone-image',
        ),
      ),
      'media_filter' => array(
        'weight' => '2',
        'status' => '1',
        'settings' => array(),
      ),
      'filter_htmlcorrector' => array(
        'weight' => '10',
        'status' => '1',
        'settings' => array(),
      ),
    ),
  );

  return $formats;
}
