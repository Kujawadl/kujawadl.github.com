/*
* Greedy Navigation
*
* http://codepen.io/lukejacksonn/pen/PwmwWV
*
*/

var $nav = $('#site-nav');
var $btn = $('#site-nav button');
var $vlinks = $('#site-nav .visible-links');
var $hlinks = $('#site-nav .hidden-links');

var breaks = [];

function updateNav() {

  var availableSpace = $btn.hasClass('hidden') ? $nav.width() : $nav.width() - $btn.width() - 30;

  // Hide all on mobile
  if(availableSpace < 400) {

    while ($vlinks.children().length > 1) {
      // Record the width of the list
      breaks.push($vlinks.width());

      // Move item to the hidden list
      $vlinks.children().last().prependTo($hlinks);

      // Show the dropdown btn
      if($btn.hasClass('hidden')) {
        $btn.removeClass('hidden');
      }
    }

  // The visible list is overflowing the nav
  } else if($vlinks.width() > availableSpace) {

    // Record the width of the list
    breaks.push($vlinks.width());

    // Move item to the hidden list
    $vlinks.children().last().prependTo($hlinks);

    // Show the dropdown btn
    if($btn.hasClass('hidden')) {
      $btn.removeClass('hidden');
    }

    // Recur if the visible list is still overflowing the nav
    if($vlinks.width() > availableSpace) {
      updateNav();
    }

  // The visible list is not overflowing
  } else {

    // There is space for another item in the nav
    if(availableSpace > breaks[breaks.length-1]) {

      // Move the item to the visible list
      $hlinks.children().first().appendTo($vlinks);
      breaks.pop();
    }

    // Hide the dropdown btn if hidden list is empty
    if(breaks.length < 1) {
      $btn.addClass('hidden');
      $hlinks.addClass('hidden');
    }

    // Recur if there is still space for another item in the nav
    if(breaks.length > 0 && availableSpace > breaks[breaks.length-1]) {
      updateNav();
    }
  }

  // Keep counter updated
  $btn.attr("count", breaks.length);
}

// Window listeners

$(window).resize(function() {
  updateNav();
});

$btn.on('click', function() {
  $hlinks.toggleClass('hidden');
  $(this).toggleClass('close');
});

updateNav();
