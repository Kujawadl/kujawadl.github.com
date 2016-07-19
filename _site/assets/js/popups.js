$(document).ready(function(){
  $(".popup").click(function(event) {
    $(event.target).find(".popuptext").toggleClass("show");
  });
});
