/*
** this is data for specific resturant it contain
**name
**lacation(lat & lng)
**ID for this place in foursquare api
**boolean displayed and chosen
*/
var ResturantData = [{
        title: 'Desoky & Soda',
        location: {
            lat: 30.793701,
            lng: 31.003353
        },
        display: true,
        chosen: false,
        ID: '57111bea498e470c129642ae'
    },
    {
        title: "Granny's",
        location: {
            lat: 30.799657,
            lng: 31.001253
        },
        display: true,
        chosen: false,
        ID: '550b2413498e6032e051e102'
    },
    {
        title: 'Pizza Hut',
        location: {
            lat: 30.793056,
            lng: 30.998303
        },
        display: true,
        chosen: false,
        ID: '4dc90f6e52b1b9daeb56a2ae'
    },
    {
        title: 'Stereo',
        location: {
            lat: 30.793420,
            lng: 31.002894
        },
        display: true,
        chosen: false,
        ID: '525c0c17498ed89f77e05d32'
    },
    {
        title: 'Ketchup',
        location: {
            lat: 30.799285,
            lng: 30.998882
        },
        display: true,
        chosen: false,
        ID: '4eee6aa402d514a36b21852e'
    },
    {
        title: 'FRISKY Café & Restaurant',
        location: {
            lat: 30.796269,
            lng: 31.001881
        },
        display: true,
        chosen: false,
        ID: '50afe851e4b0d4508b413b3a'
    },
    {
        title: "McDonald's",
        location: {
            lat: 30.790451,
            lng: 30.998937
        },
        display: true,
        chosen: false,
        ID: '56853e81498ed412f59e1912'
    },
    {
          title: "ADAM'S Café & Restaurant",
          location: {
              lat: 30.793262,
              lng: 31.001589
          },
          display: true,
          chosen: false,
          ID: '4fdf7a8ce4b0598b21d3617f'
      }
];

let map, infoWindow;

/*
** this is intial function for this map
*/
function initMap() {
    map = new google.maps.Map(
        document.getElementById('map'), {
            center: {
              lat: 30.793701,
              lng: 31.003353
            },
            zoom: 15,
            mapTypeControl: false
        }
    );
    infowindow = new google.maps.InfoWindow();

    ko.applyBindings(new ViewModel());
}

function mapError() {
    document.getElementById('map-error').innerHTML = "Error in Map!";
}


var ViewModel = function() {
    let self = this;
    let ClientId='F3USRAVQXAO1XIXG1B5YDOQUAMB3MGFMQGPV2WH4KZJ2KYP2';
    let ClientSecret='VVN4OXGYORA1C4D1PYQG4EYEZB5BQPQMWRZKN2L1GQM3LQAZ';
    self.ErrorShow = ko.observable('');
    self.ResturantArrayMap = [];

    for (let i = 0; i < ResturantData.length; i++) {
        let place = new google.maps.Marker({
            position: {
                lat: ResturantData[i].location.lat,
                lng: ResturantData[i].location.lng
            },
            map: map,
            title: ResturantData[i].title,
            display: ko.observable(ResturantData[i].display),
            chosen: ko.observable(ResturantData[i].chosen),
            ID: ResturantData[i].ID,
            animation: google.maps.Animation.DROP
        });

        self.ResturantArrayMap.push(place);
    }

    /*
     **this function for making animation for the marker (bounce) and stop anfter 500ms
    */
    self.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 500);
    };

    /*
     **this function for add infomation that come from API (foursquare) to marker
    */
    self.AddApiIformation = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.ID + '?client_id='+ ClientId +'&client_secret='+ ClientSecret +'&v=20180008',
            Type: "json",
            success: function(data) {

                /*
                 **to display number of likes and rating for resturant
                */
                let result = data.response.venue;

                /*
                 **store likes and rationg in the marker
                */
                marker.likes = result.hasOwnProperty('likes') ? result.likes.summary : '';
                marker.rating = result.hasOwnProperty('rating') ? result.rating : '';
            },

            /*
             ** show error if there are an error in recieving data form json
            */
            error: function(e) {
                self.ErrorShow("check foursquare there are an error try again after that");
            }
        });
    };

    /*
     ** this function for put the information fom api to markers
    */
    let PutMarkerInformation = function(marker) {

        self.AddApiIformation(marker);    //add API for all marker

        /*
         ** this function for add click listener to the marker
        */
        marker.addListener('click', function() {
            self.setchosen(marker);
        });
    };

    /*
     ** making loop in ResturantArrayMap then add api information
    */
    for (let i = 0; i < self.ResturantArrayMap.length; i++) {
        PutMarkerInformation(self.ResturantArrayMap[i]);
    }

    self.searchText = ko.observable('');    //for making search input

    self.filterList = function() {

        let CurrentText = self.searchText();    //store the current text
        infowindow.close();

        /*
         ** list for the user search it
        */
        if (CurrentText.length === 0) {
            self.setAlldisplay(true);
        }
        else {
            for (let i = 0; i < self.ResturantArrayMap.length; i++) {
                /*
                 ** check if the search text is found in the ResturantArrayMap
                */
                if (self.ResturantArrayMap[i].title.toLowerCase().indexOf(CurrentText.toLowerCase()) > -1) {
                    self.ResturantArrayMap[i].display(true);
                    self.ResturantArrayMap[i].setVisible(true);
                } else {
                    self.ResturantArrayMap[i].display(false);
                    self.ResturantArrayMap[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    /*
     ** display all the marker
    */
    self.setAlldisplay = function(marker) {
        for (let i = 0; i < self.ResturantArrayMap.length; i++) {
            self.ResturantArrayMap[i].display(marker);
            self.ResturantArrayMap[i].setVisible(marker);
        }
    };
    /*
     ** this function to make all the markers unchoseing
    */
    self.setAllUnchosen = function() {
        for (let i = 0; i < self.ResturantArrayMap.length; i++) {
            self.ResturantArrayMap[i].chosen(false);
        }
    };

    self.currentLocation = self.ResturantArrayMap[0];


    /*
     ** this function for making all the markers chosen and display the likes and ratings
    */
    self.setchosen = function(location) {
        self.setAllUnchosen();
        location.chosen(true);

        self.currentLocation = location;

        /*
         ** this function for showing likes and if not then no likes to display
        */
        Likes = function() {
            if (self.currentLocation.likes === '' || self.currentLocation.likes === undefined) {
                return "Likes not available for this resturant";
            } else {
                return "Resturant has " + self.currentLocation.likes;
            }
        };

        /*
         ** this function for showing rating and if not then no rating to display
        */
        Rating = function() {
            if (self.currentLocation.rating === '' || self.currentLocation.rating === undefined) {
                return "Ratings not  available for this resturant";
            } else {
                return "resturant is rated " + self.currentLocation.rating;
            }
        };

        let InfoWindow = "<h5>" + self.currentLocation.title + "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        self.Bounce(location);
    };
};
