<?php
/**
 * @file
 * eandu_features.context.inc
 */

/**
 * Implements hook_context_default_contexts().
 */
function eandu_features_context_default_contexts() {
  $export = array();

  $context = new stdClass();
  $context->disabled = FALSE; /* Edit this to true to make a default context disabled initially */
  $context->api_version = 3;
  $context->name = 'environment_and_urbanization_feature';
  $context->description = 'Provides context for e and u feature (landing) page';
  $context->tag = 'Feature';
  $context->conditions = array(
    'path' => array(
      'values' => array(
        'node/3399' => 'node/3399',
      ),
    ),
  );
  $context->reactions = array(
    'block' => array(
      'blocks' => array(
        'block-232' => array(
          'module' => 'block',
          'delta' => 232,
          'region' => 'sidebar_second',
          'weight' => '-10',
        ),
        'block-236' => array(
          'module' => 'block',
          'delta' => 236,
          'region' => 'header_second',
          'weight' => '-10',
        ),
        'views-eandu_landing_page-block' => array(
          'module' => 'views',
          'delta' => 'eandu_landing_page-block',
          'region' => 'postscript_first',
          'weight' => '-10',
        ),
        'views-latest_blogs_blocks-block_3' => array(
          'module' => 'views',
          'delta' => 'latest_blogs_blocks-block_3',
          'region' => 'postscript_second',
          'weight' => '-10',
        ),
        'block-234' => array(
          'module' => 'block',
          'delta' => 234,
          'region' => 'postscript_third',
          'weight' => '-8',
        ),
      ),
    ),
    'delta' => array(
      'delta_template' => 'clone_of_3_col_feature',
    ),
  );
  $context->condition_mode = 0;

  // Translatables
  // Included for use with string extractors like potx.
  t('Feature');
  t('Provides context for e and u feature (landing) page');
  $export['environment_and_urbanization_feature'] = $context;

  $context = new stdClass();
  $context->disabled = FALSE; /* Edit this to true to make a default context disabled initially */
  $context->api_version = 3;
  $context->name = 'environment_and_urbanization_sub_page';
  $context->description = 'Provides context for e and u feature (sub) page';
  $context->tag = 'Feature';
  $context->conditions = array(
    'path' => array(
      'values' => array(
        'node/3400' => 'node/3400',
        'node/3408' => 'node/3408',
        'node/3409' => 'node/3409',
        'node/3410' => 'node/3410',
        'node/3393' => 'node/3393',
        'node/3394' => 'node/3394',
        'node/3392' => 'node/3392',
        'node/3395' => 'node/3395',
        'node/3411' => 'node/3411',
        'eandu/blogs' => 'eandu/blogs',
        'eandu/urbanpublicationsdatabase' => 'eandu/urbanpublicationsdatabase',
      ),
    ),
  );
  $context->reactions = array(
    'block' => array(
      'blocks' => array(
        'block-232' => array(
          'module' => 'block',
          'delta' => 232,
          'region' => 'sidebar_second',
          'weight' => '-10',
        ),
        'block-234' => array(
          'module' => 'block',
          'delta' => 234,
          'region' => 'sidebar_second',
          'weight' => '-8',
        ),
        'block-236' => array(
          'module' => 'block',
          'delta' => 236,
          'region' => 'header_second',
          'weight' => '-10',
        ),
      ),
    ),
    'delta' => array(
      'delta_template' => 'clone_of_3_col_feature',
    ),
  );
  $context->condition_mode = 0;

  // Translatables
  // Included for use with string extractors like potx.
  t('Feature');
  t('Provides context for e and u feature (sub) page');
  $export['environment_and_urbanization_sub_page'] = $context;

  return $export;
}
