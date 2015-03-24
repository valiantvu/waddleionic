var fixtures = {};

fixtures.testPlace = {
  'name': 'name',
  'lat': 0,
  'lng': 1,
  'checkinTime': 'null',
  'likes': 'null',
  'photos': 'null',
  'caption': 'null',
  'foursquareID': 'null',
  'country': 'null',
  'category': 'null'
};

fixtures.testUser = {
  facebookID: "000000000",
  name: "Testy McTest"
};

fixtures.testUser2 = {
    id: "000000001",
    name: "Testina McTest"
};

fixtures.testUser3 = {
    id: "000000002",
    name: "Motestin Moproblems"
};

fixtures.testUserFootprints = [
    {
        id: "1",
        lat: 33.652759, 
        lng: -117.840664,
        name: "Testina's Hizzhouse",
        category: "Nightclub",
        country: "United States",
        city: "San Francisco",
        province: "California",
        photoSmall: "null",
        photoLarge: 'null',
        foursquareID: '4239239421234',
        checkinID: '123kjdfbsokb11e3',
        checkinTime: '2015-02-17T15:19:02.546Z',
        caption: 'testina is in the hizzhouse!! bump up the funk!',
        likes: 0,
        source: 'waddletest',
        pointValue: 9
    },
    {
        id: "2",
        lat: 33.747968,
        lng:  -118.037386,
        name: "The Chill Grill",
        category: "BBQ Joint",
        country: "United States",
        city: "Los Angeles",
        province: "California",
        photoSmall: "null",
        photoLarge: 'null',
        foursquareID: '4239239kjasnd434',
        checkinID: '123k12912jdfbso1e3',
        checkinTime: '2015-02-17T15:19:02.546Z',
        caption: 'they grilled while i chilled.',
        likes: 0,
        source: 'waddletest',
        pointValue: 9
    },
    {
        id: "3",
        lat: 37.784000, 
        lng: -122.409107,
        name: "Hack Reactor",
        category: "School",
        country: "United States",
        city: "San Francisco",
        province: "California",
        photoSmall: "null",
        photoLarge: 'null',
        foursquareID: '423sbkahs9239434',
        checkinID: '123kjd23823fbso1e3',
        checkinTime: '2015-02-17T15:12:16.562Z',
        caption: 'i learned so much here!',
        likes: 0,
        source: 'waddletest',
        pointValue: 9
    }
];

fixtures.testFriendFootprints = [
    [
        {
            id: "11",
            lat: 33.652759, 
            lng: -117.840664,
            name: "Hobbit House",
            category: "Nightclub",
            country: "United States",
            city: "San Francisco",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '72349239421234',
            checkinID: '12123kjdfbsokb11e3',
            checkinTime: '2014-02-17T15:19:02.546Z',
            caption: 'testina is in the hizzhouse!! bump up the funk!',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        },
        {
            id: "21",
            lat: 33.747968,
            lng:  -118.037386,
            name: "The Chill Scythe",
            category: "BBQ Joint",
            country: "United States",
            city: "Los Angeles",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '8232349239kjasnd434',
            checkinID: '128k2312912jdfbso1e3',
            checkinTime: '2017-02-17T15:19:02.546Z',
            caption: 'they grilled while i chilled.',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        },
        {
            id: "13",
            lat: 37.784000, 
            lng: -122.409107,
            name: "50 Shades of Death",
            category: "School",
            country: "United States",
            city: "San Francisco",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '92123sbkahs9239434',
            checkinID: '129k123jd23823fbso1e3',
            checkinTime: '2019-02-17T15:12:16.562Z',
            caption: 'i learned so much here!',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        }
    ],
    [
        {
            id: "10",
            lat: 33.652759, 
            lng: -117.840664,
            name: "Hobbit House",
            category: "Nightclub",
            country: "United States",
            city: "San Francisco",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '1212339239421234',
            checkinID: '116kj1231dfbsokb11e3',
            checkinTime: '2014-02-17T15:19:02.546Z',
            caption: 'testina is in the hizzhouse!! bump up the funk!',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        },
        {
            id: "12",
            lat: 33.747968,
            lng:  -118.037386,
            name: "The Chill Scythe",
            category: "BBQ Joint",
            country: "United States",
            city: "Los Angeles",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '5212339239kjasnd434',
            checkinID: '21228k12912jdfbso1e3',
            checkinTime: '2017-02-17T15:19:02.546Z',
            caption: 'they grilled while i chilled.',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        },
        {
            id: "31",
            lat: 37.784000, 
            lng: -122.409107,
            name: "50 Shades of Death",
            category: "School",
            country: "United States",
            city: "San Francisco",
            province: "California",
            photoSmall: "null",
            photoLarge: 'null',
            foursquareID: '923s45bkahs9239434',
            checkinID: '229kj333d23823fbso1e3',
            checkinTime: '2019-02-17T15:12:16.562Z',
            caption: 'i learned so much here!',
            likes: 0,
            source: 'waddletest',
            pointValue: 9
        }
    ]
];

fixtures.IGdata = {
    "data": [{
        "location": {
            "id": "833",
            "latitude": 37.77956816727314,
            "longitude": -122.41387367248539,
            "name": "Civic Center BART"
        },
        "comments": {
            "count": 16,
            "data": ['...']
        },
        "caption": null,
        "link": "http://instagr.am/p/BXsFz/",
        "likes": {
            "count": 190,
            "data": [{
                "username": "shayne",
                "full_name": "Shayne Sweeney",
                "id": "20",
                "profile_picture": "..."
            }, {}]
        },
        "created_time": "1296748524",
        "images": {
            "low_resolution": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/02/03/efc502667a554329b52d9a6bab35b24a_6.jpg",
                "width": 306,
                "height": 306
            },
            "thumbnail": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/02/03/efc502667a554329b52d9a6bab35b24a_5.jpg",
                "width": 150,
                "height": 150
            },
            "standard_resolution": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/02/03/efc502667a554329b52d9a6bab35b24a_7.jpg",
                "width": 612,
                "height": 612
            }
        },
        "type": "image",
        "users_in_photo": [],
        "filter": "Earlybird",
        "tags": [],
        "id": "22987123",
        "user": {
            "username": "kevin",
            "full_name": "Kevin S",
            "profile_picture": "http://distillery.s3.amazonaws.com/profiles/profile_3_75sq_1295574122.jpg",
            "id": "3"
        }
    }]
}


module.exports = fixtures;