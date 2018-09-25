<?php
/**
 * @file
 * eandu_features.features.taxonomy.inc
 */

/**
 * Implements hook_taxonomy_default_vocabularies().
 */
function eandu_features_taxonomy_default_vocabularies() {
  return array(
    'group' => array(
      'name' => 'Group',
      'machine_name' => 'group',
      'description' => 'Research group',
      'hierarchy' => '0',
      'module' => 'taxonomy',
      'weight' => '0',
    ),
    'vocabulary_15' => array(
      'name' => 'Tag',
      'machine_name' => 'vocabulary_15',
      'description' => 'Globally used vocabulary to group content by tag',
      'hierarchy' => '0',
      'module' => 'taxonomy',
      'weight' => '0',
    ),
    'vocabulary_19' => array(
      'name' => 'Theme',
      'machine_name' => 'vocabulary_19',
      'description' => '',
      'hierarchy' => '1',
      'module' => 'taxonomy',
      'weight' => '-1',
    ),
    'vocabulary_20' => array(
      'name' => 'Micro-sites',
      'machine_name' => 'vocabulary_20',
      'description' => '',
      'hierarchy' => '1',
      'module' => 'taxonomy',
      'weight' => '9',
    ),
    'vocabulary_4' => array(
      'name' => 'General',
      'machine_name' => 'vocabulary_4',
      'description' => '',
      'hierarchy' => '0',
      'module' => 'taxonomy',
      'weight' => '2',
    ),
  );
}
