var submitted=false;

$('document').ready(function() {
  $('#gform').on('submit', function(e) {
    $('#gform *').fadeOut(1000);
    setTimeout(function() {
      $('#gform').prepend('<div style="width:100%; max-width:600px; text-align:center;">Thanks for reaching out!<br/>I\'ll get back to you as soon as I can!</div>');
    }, 1000);
  });
});
