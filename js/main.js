
// variables

const apiKey =  "922d8b3605104b1097852751231608"
const baseUrl ="https://api.weatherapi.com/v1/forecast.json";
let currentLocation = "cairo"
let cardsContainer = document.querySelector(".forecast-cards");
let locationEle = document.querySelector("p.location");
let allBars = document.querySelectorAll(".clock");
let cityImagePlace = document.querySelector(".city-items");
let recentCities = JSON.parse(localStorage.getItem("cities")) || [];

// functions
async function getWeather(location){

const resp =  await fetch(`${baseUrl}?key=${apiKey}&q=${location}&days=3`);

if(resp.status != 200 && searchInput.value != "" ){
    
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "this country or city is invalid",
        });
    
      
searchInput.value = "";
    return
}
const data = await resp.json()

displayWeather(data);
searchInput.value= "";


}

function displayWeather(data){
    locationEle.innerHTML = `<span class="city-name">${data.location.name}</span> ${data.location.country}`;
let days = data.forecast.forecastday;
const now = new Date();
let cartonaCardHtml = "";
for( let [index,day] of days.entries()){
    
    const exactDate = new Date(day.date)
    cartonaCardHtml += `
<div class="col-md-4 col-lg-4 col-sm-12 card ${index == 0 ? " active" : ""}" data-index=${index}>

  <div class="card-header">
    <div class="day">${exactDate.toLocaleDateString("en-us", {
      weekday: "long",
    })}</div>
    <div class="time">${now.getHours()}:${now.getMinutes()} ${
      now.getHours() > 11 ? "PM" : "AM"
    }</div>
  </div>

  <div class="card-body">
    <img src="./images/conditions/${day.day.condition.text}.svg"/>
    <div class="degree">${day.hour[now.getHours()].temp_c}C°</div>
  </div>

  <div class="card-data">
    <ul class="left-column">
      <li>Real Feel: <span class="real-feel">${
        day.hour[now.getHours()].feelslike_c
      }C°</span></li>
      <li>Wind:<span class="wind">${
        day.hour[now.getHours()].wind_mph
      }MPH</span></li>
      <li>Pressure: <span class="pressure">${
        day.hour[now.getHours()].pressure_mb
      }MB</span></li>
      <li>Humidity: <span class="humidity">${
        day.hour[now.getHours()].humidity
      }%</span></li>
    </ul>
    <ul class="right-column">
      <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
      <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
    </ul>
  </div>
</div>`;

}
cardsContainer.innerHTML = cartonaCardHtml;

let allCards = document.querySelectorAll('.card')
for(let card of allCards){
    card.addEventListener("click" , function(e){
            let activeCard = document.querySelector(".card.active");

        if(!card.classList.contains("active")){

            activeCard.classList.remove('active')
            card.classList.add("active")
        }
        getPosibilityRain(days[e.currentTarget.dataset.index])
    })
}

let exist = recentCities.find(function(currentCity){
    return currentCity.city == data.location.name
})
if (exist) return

  recentCities.push({
    city: data.location.name,
    country: data.location.country,
  });
localStorage.setItem("cities", JSON.stringify(recentCities));
displayImg(data.location.name, data.location.country);
}



function getPosibilityRain(weatherInfo){
    for (let element of allBars) {
        
        let clock = element.dataset.clock;
        
        let height = weatherInfo.hour[clock].chance_of_rain;
        element.querySelector(".percent").style.height = `${height}%`;
    }
}




async function getCityImage(city){
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=N7IjYrNj6cl-SFz4GbUuagluOsRvGmINIujSA_-z-zY&per_page=5&orientation=landscape`
    );
    const data = await res.json()
    return data.results
}



async function displayImg(city , country){
   let imgArr = await getCityImage(city);
   const random = Math.trunc(Math.random() * imgArr.length);
   let imgSrc = imgArr[random].urls.regular;
    let imageContent = `
    <div class="item">
        <div class="city-image">
            <img src=${imgSrc} alt="Image for ${city} city" />
        </div>
        <div class="city-name"> <span class="city-name">${city}</span>,${country} </div>
    
    </div>
    
    
    `;

    cityImagePlace.innerHTML += imageContent;
   
}

let searchInput = document.getElementById("searchBox");

searchInput.addEventListener("blur" , function(){
    getWeather(searchInput.value);
})
document.addEventListener("keyup" , function(e){
    
    if (e.key == "Enter" && searchInput.value != "") {
      getWeather(searchInput.value);
    }
})

function success(position){
     currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
    getWeather(currentLocation);
}
window.addEventListener("load",function(){
navigator.geolocation.getCurrentPosition(success);

for(let i =0 ; i < recentCities.length; i++){

    displayImg(recentCities[i].city , recentCities[i].country);

}
})