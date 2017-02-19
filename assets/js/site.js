$(document).ready(function() {
  // fix main menu to page on passing
  $('.main.menu').visibility({
    type: 'fixed'
  });
  $('.overlay').visibility({
    type: 'fixed',
    offset: 80
  });

  // lazy load images
  $('.image').visibility({
    type: 'image',
    transition: 'vertical flip in',
    duration: 500
  });

  // fix menu when passed
  $('.header').visibility({
    once: false,
    onBottomPassed: function() {
      $('.fixed.menu').transition('fade in');
    },
    onBottomPassedReverse: function() {
      $('.fixed.menu').transition('fade out');
    }
  });

  // create sidebar and attach to menu open
  $('.ui.sidebar').sidebar('attach events', '.toc.item');

  // fix sticky elements when passed
  $('.ui.sticky').sticky();

  $('.ui.accordion').accordion();

  $('.ui.embed').embed();

  $('.ui.tabular.menu .item').tab();
});
