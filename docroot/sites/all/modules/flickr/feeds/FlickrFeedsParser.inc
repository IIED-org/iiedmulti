<?php
/**
 * @file
 * Flickr feeds parser class.
 */

/**
 * Class definition for Flickr Parser.
 */
class FlickrFeedsParser extends FeedsParser {

  public function parse(FeedsSource $source, FeedsFetcherResult $fetcher_result) {
    $flickr_feed = $fetcher_result->getRaw();
    $result = new FeedsParserResult();

    $json = json_decode($flickr_feed);

    $items = array();
    foreach ($json->items as $entry) {
      $items[] = array(
        'title' => (isset($entry->title) ? $entry->title : ''),
        'link' => (isset($entry->link) ? $entry->link : ''),
        'media' => (isset($entry->media->m) ? $entry->media->m : ''),
        'date_taken' => (isset($entry->date_taken) ? $entry->date_taken : ''),
        'description' => (isset($entry->description) ? $entry->description : ''),
        'published' => (isset($entry->published) ? $entry->published : ''),
        'author' => (isset($entry->author) ? $entry->author : ''),
        'author_id' => (isset($entry->author_id) ? $entry->author_id : ''),
        'tags' => (isset($entry->tags) ? $entry->tags : ''),
      );
    }
    $result->items = $items;
    return $result;
  }

  public function getMappingSources() {
    return parent::getMappingSources() + array(
      'title' => array(
        'name' => t('Title'),
        'description' => t('Flickr photo title.'),
      ),
      'link' => array(
        'name' => t('Link'),
        'description' => t('Link to the Flickr photo page.'),
      ),      
      'media' => array(
        'name' => t('Media'),
        'description' => t('Link to the photo (or video "thumb") itself.'),
      ),      
      'date_taken' => array(
        'name' => t('Date taken'),
        'description' => t('ISO 8601 format (e.g. 2011-12-06T14:24:28-08:00).'),
      ),      
      'description' => array(
        'name' => t('Description'),
        'description' => t('Flickr photo description.'),
      ),      
      'published' => array(
        'name' => t('Published'),
        'description' => t('ISO 8601 format (e.g. 2011-12-06T14:24:28-08:00).'),
      ),      
      'author' => array(
        'name' => t('Author'),
        'description' => t('Email (username).'),
      ),      
      'author_id' => array(
        'name' => t('Author ID'),
        'description' => t('E.g. 98518260@N02'),
      ),      
      'tags' => array(
        'name' => t('Tags'),
        'description' => t('Space separated list of terms.'),
      ),      
    );
  } 
}
