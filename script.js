$(function (){
    let city,
        optionList=$('#state'),
        cityError=false;
    const url =`https://api.foursquare.com/v2/venues/explore?limit=10&radius=250&`,
          urlBase='https://foursquare.com/explore?',
          STATES =["AL","AK","AS","AZ","AR","CA","CO","CT","DE","DC","FM","FL","GA","GU","HI","ID","IL","IN","IA","KS","KY","LA","ME","MH","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","MP","OH","OK","OR","PW","PA","PR","RI","SC","SD","TN","TX","UT","VT","VI","VA","WA","WV","WI","WY"];
    
    const catagories = {
          food: '4d4b7105d754a06374d81259',
          events: '4d4b7105d754a06373d81259',
          nightlife: '4d4b7105d754a06376d81259',
          hotel: '4bf58dd8d48988d1fa931735'
    };
    const params = {
          client_id: 'ICN4P521ZQGK1CJTRJYRQ2GIMDWJQFUDI1I5DIYA5ZVY2RRN',
          client_secret: '02VFV3EWLTABRMEE0U2K2T3SLLDOJIDXCOBGLINZ0H3TMJVL',
          v: '20190430'
    };
    
    //append state options to select
    STATES.forEach(option => optionList.append(new Option(option,option)));
    
    function formatParams(params) {
        return Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
    };
    
    function watchForm() {
        $('form').submit(function(e) {
            e.preventDefault();
            city=$('#city').val().replace(/\s/g,'')+","+$('#state').val();
            $('#city').val("");
            searchUrl();
            hideHomePage();
            displayButtons();
            searchWeather();
            searchAgain();
            changeActiveSearch();
        });
    };
    
    function hideHomePage() {
        $('.homePage').addClass('hidden');
    };
    function displayButtons() {
        $('.results').removeClass('hidden');
    };
    
    function searchAgain() {
        $('#searchAgain').on('click', e => {
            $('.homePage').removeClass('hidden');
            $('.results').addClass('hidden');
            $('.displayWeather').empty();
            $('.displayResults').empty();
            cityError=false;
            });
        };
    
    function displayWeather(response) {
        if(!cityError){
            let location = response['location']['name']+" "+response['location']['region'];
            let tempF = response['current']['temp_f'];
            let tempC = response['current']['temp_c'];
            let condition = response['current']['condition']['text'];
            let conditionIconUrl = response['current']['condition']['icon'];
            $('.displayWeather').append(
                `<h2><strong>Current Weather for ${location}</strong></h2>
                <img src="https:${conditionIconUrl}">
                <p>Description: ${condition}</p>
                <p>${tempF} Degrees Farenheit</p>`
            )
        }           
    };
    
    function searchWeather() {
        const url=`https://api.apixu.com/v1/current.json?key=b3ddd0b9be884a1b969140151190604&q=${city}`
        fetch(url) 
            .then(response => {
             return response.json();
            })
            .then(response => {
                displayWeather(response);
             })
            .catch(function(error) {
             displayError(error.message);
            });
    };
    
    function searchUrl() {
        params['near']=city;
        params.categoryId=catagories[document.getElementsByClassName('active')[0].id];
        fetch(url + formatParams(params)) 
            .then(response => {
                if(response.ok) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(response => {
                displayVenues(response)
            })
            .catch(function(error) {
                displayError(error.message);
            });
    };
    
    function displayError(error) {
        cityError=true;
        $('.displayResults').append(
            `<p>${error} Please try a different City</p>`
            );
    }
    
    function displayVenues(response) {
        if(response.response.groups[0].items.length===0) {
            $('.displayResults').append(
            `<p>Sorry no ${document.getElementsByClassName('active')[0].id} listed at this time.</p>`
            );
        }
        response.response.groups[0].items.forEach(index => {
            let address = index.venue.location.formattedAddress[1]
            $('.displayResults').append(
                `<li>
                <div class='img'>
                    <img src='${index.venue.categories[0].icon.prefix}64${index.venue.categories[0].icon.suffix}'>
                </div>
                <div class='location'>
                    <p class='venueName'><a href='${venueLink(index.venue.name, address)}' target="_blank">${index.venue.name}</a></p>
                    <p>${index.venue.location.formattedAddress[0]} ${index.venue.location.formattedAddress[1]}</p>
                    </li>
                </div>
                <hr>`
            );
        });  
    };
    
    function changeActiveSearch() {
        $('body').on('click', '.venues', function(e) {
            e.preventDefault();
            let current=$('.active');
            if(!$(this).hasClass('active')){
                current.toggleClass('active');
                $(this).toggleClass('active');
                 $('.displayResults').empty();
                searchUrl(city);
            }  
        });
    };
    
    function venueLink(name, location) {
        let yelpUrl = {
            q: name,
            near: location
        };
        return urlBase+formatParams(yelpUrl); 
    }
    
    watchForm();
});