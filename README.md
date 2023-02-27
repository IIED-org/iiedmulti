IIED multisite code repository. Contains .lando.yml and .acquia-cli.yml for running on a lcoal Lando/Docker setup and connecting to Acquia cloud for synchronising databases. The sites are:

biocultural.iied.org (biocultural) <-- Biocultural Heritage site
ssm.ac.iied.org (ssm) <-- Legacy site containing SSM content
urbandensity.org (urbden) <-- Alternative Routes to Urban Density

Clone this repo and copy the `iied.local.settings` files found in each relevant subdirectory under `docroot/sites/` (biocultural, ssm, urbden) to `settings.local.php` in the same directory. Run `lando start` in the repository root to intiate the container.

`lando [acli] pull` deosn't work for multisite databases so you will need to download a copy of the database you want to work on from the Acquia Cloud web interface to the local repo root and import it using the following command:

`lando db-import --host [biocultural|ssm|urbden] <database.sql>`

For example:

`lando db-import --host biocultural prod-biocultural-iiedmultidb258069-2022-03-21.sql`

Local drush commands can be run either from the relevant docroot/sites/ subdirectory or using the `-l` flag e.g.

`lando drush -l https://biocultural.lndo.site status`

Remote (server) drush commands can be run via ssh (see Acquia docs for details).