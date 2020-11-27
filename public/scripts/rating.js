$(document).ready(function() {
  console.log("Rating Document Ready")

  const resourceId = $('#resource-id').val();

  $('star1').one('click', function(event) {
    event.preventDefault();
    $('star2').css("color", "red");
    const rating = {
      rating: 1
    }
    $.ajax(`/resources/${resourceId}/ratings/new`, { method: 'POST', data: rating})
    .then(function(response) {
      console.log('Rating 1 successfully added', response)
    })
  })

  $('star2').on('click', function(event) {
    event.preventDefault();
    $('star2').css("color", "red");
    const rating = {
      rating: 2
    }
    $.ajax(`/resources/${resourceID}/ratings/new`, { method: 'POST', data: rating})
    .then(function(response) {
      console.log('Rating 2 successfully added', response)
    })
  })

  $('star3').on('click', function(event) {
    event.preventDefault();
    const rating = {
      rating: 3
    }
    $.ajax(`/resources/${resourceID}/ratings/new`, { method: 'POST', data: rating})
    .then(function(response) {
      console.log('Rating 3 successfully added', response)
    })
  })

  $('star4').on('click', function(event) {
    event.preventDefault();
    const rating = {
      rating: 4
    }
    $.ajax(`/resources/${resourceID}/ratings/new`, { method: 'POST', data: rating})
    .then(function(response) {
      console.log('Rating 4 successfully added', response)
    })
  })

  $('star5').on('click', function(event) {
    event.preventDefault();
    const rating = {
      rating: 5
    }
    $.ajax(`/resources/${resourceID}/ratings/new`, { method: 'POST', data: rating})
    .then(function(response) {
      console.log('Rating 5 successfully added', response)
    })
  })
});
