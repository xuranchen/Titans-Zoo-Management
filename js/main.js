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

