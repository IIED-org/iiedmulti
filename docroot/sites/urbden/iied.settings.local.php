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

$databases['default']['default']['host'] = 'urbden_db';
$conf['file_temporary_path'] = '/tmp';