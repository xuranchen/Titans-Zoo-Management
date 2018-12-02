function loadRegistration(){
  console.log('swapping to registration page')
  location.href = "./register.html";
};

function verify_login(){

}

function buttonClick(theButton){
  document.getElementById('clicked_button').value = theButton.name;
  return true;
}

function loadExhibitResults(){
  console.log('swapping to exhibit Results')
  location.href = "./exhibit-results.html";
};

function sortVisitors(theButton) {
  var column = theButton.name;
  var order = theButton.value;
  if (order == "DESC") {
    theButton.value = "ASC";
  } else {
    theButton.value = "DESC";
  }
  var url= '/sort_visitors?column=' + column + '&order=' + order;
  $.get(url, function(data, status){
    res = data;
    console.log(data);
    // add visitors to table
    $("#visitors").find("tr:gt(0)").remove();
    var table = $("#visitors thead");
    data.forEach((d) => {
        table.after("<tr><td>" + d.Username + "</td><td>" + d.Email + "</td></tr>");
    });
  });
}

function sortStaff(theButton) {
  var column = theButton.name;
  var order = theButton.value;
  if (order == "DESC") {
    theButton.value = "ASC";
  } else {
    theButton.value = "DESC";
  }
  var url= '/sort_staff?column=' + column + '&order=' + order;
  $.get(url, function(data, status){
    res = data;
    console.log(data);
    $("#staff").find("tr:gt(0)").remove();
    var table = $("#staff thead");
    data.forEach((d) => {
        table.after("<tr><td>" + d.Username + "</td><td>" + d.Email + "</td></tr>");
    });
  });
}

function sortExhibits(theButton) {
  var column = theButton.name;
  var order = theButton.value;

  if (order == "DESC") {
    theButton.value = "ASC";
  } else {
    theButton.value = "DESC";
  }
  var url= '/sort_exhibits?column=' + column + '&order=' + order;
  $.get(url, function(data, status){
    res = data;
    console.log(data);
    // add visitors to table
    $("#exhibitResults tr:not(:first)").remove();
    var table = $("#exhibitResults thead");
    data.forEach((d) => {
      var waterFeature;
      if (d.Water_Feature == 1) {
        waterFeature = "Yes";
      } else {
        waterFeature = "No";
      }
        table.after("<tr><td>" + d.Name + "</td><td>" + d.Size  + "</td><td>" + d.NumAnimals + "</td><td>" + waterFeature + "</td></tr>");
    });
  });
}

function sortShows(theButton) {
  var column = theButton.name;
  var order = theButton.value;

  if (order == "DESC") {
    theButton.value = "ASC";
  } else {
    theButton.value = "DESC";
  }
  var url= '/sort_all_shows?column=' + column + '&order=' + order;
  $.get(url, function(data, status){
    res = data;
    console.log(data);
    // add visitors to table
    $("#shows tr:not(:first)").remove();
    var table = $("#shows thead");
    data.forEach((d) => {
        table.after("<tr><td>" + d.Name + "</td><td>" + d.DateTime + "</td><td>" + d.Exhibit + "</td></tr>");
    });
  });
}

function sortAnimals(theButton) {
  var column = theButton.name;
  var order = theButton.value;

  if (order == "DESC") {
    theButton.value = "ASC";
  } else {
    theButton.value = "DESC";
  }
  var url= '/sort_animals?column=' + column + '&order=' + order;
  $.get(url, function(data, status){
    res = data;
    console.log(data);
    // add visitors to table
    $("#animalList tr:not(:first)").remove();
    var table = $("#animalList thead");
    data.forEach((d) => {
        console.log("d:", d);
        table.after("<tr><td>" + d.Name + "</td><td>" + d.Species + "</td><td>" + d.Exhibit + "</td><td>" + d.Age + "</td><td>" + types[d.Genus] + "</td></tr>");
    });
  });
}
