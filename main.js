const search_form = document.getElementById("search-form");
const searched_city = document.getElementById("search");
const base_url = "https://api.openweathermap.org/data/2.5/forecast";

function updateData(data) {
    const temperature_p = document.querySelector(
        "#temperature > span:first-of-type"
    );
    const location_span = document.querySelector("#location>span");
    const date_p = document.getElementById("date");
    const weather_icon_img = document.getElementById("weather-icon");
    const date = new Date(data.city.sunrise * 1000);

    temperature_p.textContent = Math.floor(data.list[0].main.temp).toString();
    location_span.textContent = data.city.name;
    weather_icon_img.setAttribute(
        "src",
        `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`
    );
    weather_icon_img.setAttribute(
        "alt",
        `${data.list[0].weather[0].description}`
    );
    date_p.textContent = date.toLocaleDateString("fr-FR", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    const d = new Date()

    const today_tiles = data.list.filter(el => el.dt <= Date.now());
    const tomorrow_tiles = data.list.filter(el => new Date(el.dt_txt).getDate() >= date.getDate());

    generate_tiles(today_tiles, 'today-tile');
    generate_tiles(tomorrow_tiles, 'tomorrow-tile');
}

function fetch_weather_with_position(pos) {
    const coords = pos.coords;

    fetch(
        `${base_url}?lang&daily&units=metric&lon=${coords.longitude}&lat=${
            coords.latitude
        }&appid=${import.meta.env.VITE_API_KEY}`
    )
        .then((res) => {
            if (res.ok) return res.json();
        })
        .then((data) => {
            updateData(data);
        });
}

function fetch_weather_with_city(city) {
    fetch(
        `${base_url}?lang&daily&units=metric&q=${city}&appid=${
            import.meta.env.VITE_API_KEY
        }`
    )
        .then((res) => {
            if (res.ok) return res.json();
        })
        .then((data) => {
            updateData(data);
        })
        .catch((err) => {
            alert(city + " : Cette ville n'existe pas");
            console.err(err.message);
        });

    searched_city.value = "";
}

function generate_tiles(data, id) {
    const hours_list_ul = document.querySelector(`ul[id="${id}"]`);
    const template_li = document.querySelector(`[id="${id}-hourly"]`);

    for (let hour of data) {
        let clone = document.importNode(template_li.content, true);
        let spans = clone.querySelectorAll("li span");
        clone
            .querySelector("li img")
            .setAttribute(
                "src",
                `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`
            );
        spans[0].textContent = new Date(hour.dt_txt).toLocaleDateString()
        // toLocaleTimeString("en-US", {
        //             hour12: true,
        //             hour: "numeric",
        //         });
        spans[1].textContent = hour.main.temp;

        hours_list_ul.appendChild(clone);
    }
}

function error(err) {
    console.error(err);
    fetch_weather_with_city("Bordeaux");
}

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(fetch_weather_with_position, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
} else {
    fetch_weather_with_city("Bordeaux");
}

search_form.addEventListener("submit", (e) => {
    e.preventDefault();

    fetch_weather_with_city(searched_city.value.trim());
});
