const clicker = document.getElementById("clicker")
const sound = document.getElementById("clickSound")
const soundSource = document.getElementById("soundSource")

let currentDesign = "lion"


// 디자인 선택
function setDesign(name, event){

currentDesign = name
clicker.src = `/static/clicker/images/${name}_default.png`

// 선택 스타일
document.querySelectorAll(".design-select button")
.forEach(btn => btn.classList.remove("selected"))

event.target.classList.add("selected")

}



// 소리 선택
function setSound(name, event){

soundSource.src = `/static/clicker/sounds/${name}.mp3`
sound.load()

// 선택 스타일
document.querySelectorAll(".sound-select button")
.forEach(btn => btn.classList.remove("selected"))

event.target.classList.add("selected")

}



// 클릭 이벤트
clicker.addEventListener("click", () => {

fetch("/click/",{
method:"POST",
headers:{
"Content-Type":"application/json",
"X-CSRFToken":getCookie("csrftoken")
}
})
.then(res => res.json())
.then(data => {
document.getElementById("count").innerText = data.count
})


// 이미지 변경
clicker.src = `/static/clicker/images/${currentDesign}_click.png`

// 소리
sound.currentTime = 0
sound.play()

// 진동
if (navigator.vibrate) {
navigator.vibrate(30)
}

// 원래 이미지
setTimeout(()=>{
clicker.src = `/static/clicker/images/${currentDesign}_default.png`
},150)

})



// csrf
function getCookie(name) {
let cookieValue = null;
if (document.cookie && document.cookie !== '') {
const cookies = document.cookie.split(';');
for (let i = 0; i < cookies.length; i++) {
const cookie = cookies[i].trim();
if (cookie.substring(0, name.length + 1) === (name + '=')) {
cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
break;
}
}
}
return cookieValue;
}