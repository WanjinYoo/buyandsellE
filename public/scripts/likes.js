$(document).ready(function() {
  console.log("Likes Document Ready")

  const resourceId = $('#resource-id').val();

  $('#heart').one('click', function() {
    event.preventDefault();
    console.log("The heart button has been clicked!");
    $('#heart').css("color", "red");
    const truthValue = {
      value: "TRUE"
    };

    $.ajax(`/resources/${resourceId}/likes/new`, {method: 'POST'})
    .then(function(response) {
      console.log('Like successfully added: ', response)
    })
  })
});
