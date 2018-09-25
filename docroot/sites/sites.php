<?php

/**
 * @file
 * Configuration file for Drupal's multi-site directory aliasing feature.
 *
 * This file allows you to define a set of aliases that map hostnames, ports, and
 * pathnames to configuration directories in the sites directory. These aliases
 * are loaded prior to scanning for directories, and they are exempt from the
 * normal discovery rules. See default.settings.php to view how Drupal discovers
 * the configuration directory when no alias is found.
 *
 * Aliases are useful on development servers, where the domain name may not be
 * the same as the domain of the live server. Since Drupal stores file paths in
 * the database (files, system table, etc.) this will ensure the paths are
 * correct when the site is deployed to a live server.
 *
 * To use this file, copy and rename it such that its path plus filename is
 * 'sites/sites.php'. If you don't need to use multi-site directory aliasing,
 * then you can safely ignore this file, and Drupal will ignore it too.
 *
 * Aliases are defined in an associative array named $sites. The array is
 * written in the format: '<port>.<domain>.<path>' => 'directory'. As an
 * example, to map http://www.drupal.org:8080/mysite/test to the configuration
 * directory sites/example.com, the array should be defined as:
 * @code
 * $sites = array(
 *   '8080.www.drupal.org.mysite.test' => 'example.com',
 * );
 * @endcode
 * The URL, http://www.drupal.org:8080/mysite/test/, could be a symbolic link or
 * an Apache Alias directive that points to the Drupal root containing
 * index.php. An alias could also be created for a subdomain. See the
 * @link http://drupal.org/documentation/install online Drupal installation guide @endlink
 * for more information on setting up domains, subdomains, and subdirectories.
 *
 * The following examples look for a site configuration in sites/example.com:
 * @code
 * URL: http://dev.drupal.org
 * $sites['dev.drupal.org'] = 'example.com';
 *
 * URL: http://localhost/example
 * $sites['localhost.example'] = 'example.com';
 *
 * URL: http://localhost:8080/example
 * $sites['8080.localhost.example'] = 'example.com';
 *
 * URL: http://www.drupal.org:8080/mysite/test/
 * $sites['8080.www.drupal.org.mysite.test'] = 'example.com';
 * @endcode
 *
 * @see default.settings.php
 * @see conf_path()
 * @see http://drupal.org/documentation/install/multi-site
 */

$sites['biocultural.iied.org'] = 'biocultural';
$sites['bch-dev.ac.iied.org'] = 'biocultural';
$sites['bch-stage.ac.iied.org'] = 'biocultural';
$sites['bch.ac.iied.org'] = 'biocultural';

$sites['shapingsustainablemarkets.iied.org'] = 'ssm';
$sites['ssm.ac.iied.org'] = 'ssm';
$sites['ssm-dev.ac.iied.org'] = 'ssm';
$sites['ssm-stage.ac.iied.org'] = 'ssm';

$sites['communitiesforwildlife.iied.org'] = 'cfw';
$sites['cfw.ac.iied.org'] = 'cfw';
$sites['cfw-dev.ac.iied.org'] = 'cfw';
$sites['cfw-stage.ac.iied.org'] = 'cfw';

<<<<<<< HEAD
$sites['urbandensity.org'] = 'urbden';
$sites['urbden.ac.iied.org'] = 'urbden';
$sites['urbden-dev.ac.iied.org'] = 'urbden';
$sites['urbden-stage.ac.iied.org'] = 'urbden';
=======
$sites['sentinel.iied.org'] = 'sentinel';
$sites['sentinel.ac.iied.org'] = 'sentinel';
$sites['sentinel-dev.ac.iied.org'] = 'sentinel';
$sites['sentinel-stage.ac.iied.org'] = 'sentinel';
>>>>>>> 853c4edea94daa5b95431cb0b7f6ba531298b7c8
