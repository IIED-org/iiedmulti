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
$databases['default']['default']['host'] = 'ssm';
$conf['file_temporary_path'] = '/tmp';