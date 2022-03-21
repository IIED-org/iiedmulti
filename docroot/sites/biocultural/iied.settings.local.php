<?php
// Lando settings
$databases['default'] = array (
  'default' => array (
    'driver' => 'mysql',
    'database' => 'database',
    'username' => 'mysql',
    'password' => 'mysql',
    'prefix' => '',
    'port' => 3306,
  )
);

$databases['default']['default']['host'] = 'biocultural_db';