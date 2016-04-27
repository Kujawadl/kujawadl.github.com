---
layout: splash
title: "Contact"
permalink: /contact

header:
  overlay_image: https://images.unsplash.com/photo-1429051883746-afd9d56fbdaf?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=a40432a29a1c55fc0b2ec7f1f2271877
  caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
---

<script type="text/javascript" src="{{basepath}}/assets/js/jquery-2.2.3.min.js"></script>
<script type="text/javascript">
  var submitted=false;

  $('document').ready(function() {
    $('#gform').on('submit', function(e) {
      $('#gform *').fadeOut(1000);
      setTimeout(function() {
        $('#gform').prepend('<div style="width:100%; max-width:600px; text-align:center;">Thanks for reaching out!<br/>I\'ll get back to you as soon as I can!</div>');
      }, 1000);
    });
  });
</script>

<style>
#gform {
  max-width: 610px;
  margin: 0 auto;
}

.prompt {
  display: inline-block;
  width: 100px;
  padding: 1em 0 1em 0;
}

.input {
  display: inline-block;
  width: 100%;
  max-width: 500px;
}

.buttonrow {
  max-width: 600px;
  text-align: center;
  padding: 1em 0;
}
</style>

<form name="gform" id="gform" enctype="text/plain" action="https://docs.google.com/forms/d/1mo5qkiRpcCYfFbbcjDnQYqwnFSj_AI1eWBqDlKa_-aw/formResponse" target="hidden_iframe" onsubmit="submitted=true;">
  <span class="prompt">Name:&nbsp;</span>
    <input type="text" class="input" name="entry.304859895" id="entry.304859895" required><br/>
  <span class="prompt">Email:&nbsp;</span>
    <input type="email" class="input" name="entry.2064915051" id="entry.2064915051" required><br/>
  <span class="prompt">Subject:&nbsp;</span>
    <input type="text" class="input" name="entry.1946085487" id="entry.1946085487" required><br/>
  <span class="prompt">Message:&nbsp;</span>
    <span class="input"><textarea name="entry.1823473257" id="entry.1823473257" required></textarea></span><br/>
  <div class="buttonrow"><input type="submit" value="Submit" form="gform"></div>
</form>

<iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(submitted) {}"></iframe>
