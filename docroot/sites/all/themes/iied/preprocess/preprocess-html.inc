<?php
/** 
 * Implements hook_process_html().
 * created cb 2012-01-24 15:48
**/

function iied_alpha_preprocess_html(&$vars) {
  // custom functionality here
  	$num =  date('d') % 4;
	$vars['stylesdir'] = '/sites/all/themes/iied/colours/';
	$vars['colourdir'] = $vars['stylesdir'] . 'set_' . $num . '/' ;
}