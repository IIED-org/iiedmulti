Note that this sub-module does not depend (yet) on the main Flickr module. It has a dependency on the Feeds and Date module.

Below is an example how to set up a Flickr feed.

Besides this module enable the sub-module Feeds UI (feeds_ui, part of Feeds) and its dependencies.

Create at 'admin/structure/types/add' a content type 'Flickr user feed' (Machine name: flickr_user_feed). You can delete the unused 'Body' field.

Create a content type 'Flickr user feed item' (Machine name: flickr_user_feed_item) with the following extra fields:
- Link (field_link) - Field type: Text field
- Media (field_media) - Field type: Text field
- Date taken (field_date_taken) - Field type: Date (ISO format) - Widget: Text
  field - DATE TAKEN FIELD SETTINGS: Date attributes to collect: select all -
  Time zone handling: UTC
- Author (field_author) - Field type: Text field
- Author ID (field_author_id) - Field type: Text field
- Tags (field_terms) - Field type: Text field
Leave the default added 'Title' and 'Body' field untouched.

Create at 'admin/structure/feeds/import' a new 'Feeds importer' copy-pasting the contents of the file 'example_user_importer.txt' that is in the same folder as this README.txt.

Create a feed at 'node/add/flickr-user-feed'. A title like 'Uploads from lolandese1' will do but is not relevant.
Use a feed URL like:
https://api.flickr.com/services/feeds/photos_public.gne/?id=98518260@N02&media=b&format=json&nojsoncallback=1

After saving you should get a status message like 'Created 13 nodes'. Go to 'admin/content' to check.
