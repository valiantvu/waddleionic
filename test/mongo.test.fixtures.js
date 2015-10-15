var fixtures = {};

fixtures.users = [
	{
		facebookID: '1376881809284443',
		name: 'Dorothy Amhhgiajeahb Bowersstein',
		firstName: 'Dorothy',
		lastName: 'Bowersstein',
		email: 'jqhpyje_bowersstein_1420934246@tfbnw.net',
		// fbToken: 'CAAMxNSdb8MMBADCvUUEKYO2ZCbyIAMZCmMarNhZAuXcnuZBkBK23HWYmTDp5sOylwnxxouogNACJOvWZC7ZCr4TdIO0U9dIcEca2LF1jt2JQvtNzLp7MHJkne9DQ9M3JvY1beejgViD0WrQQBYnQKSYVZCie6QjeKzSGocbZBTZB86ZBn19YWyg7fNZAFKwEZB9AgJkceI7Pos2sIgZDZD',
		fbToken: "CAAMxNSdb8MMBAGx3rqzaK62s25uwVrHn021nun3UEa993CSLYFgTiOZBcrGiJWNy7vGkKPEyxuMv3kZCauU7Rzojwcsio1bgkSi2bJ2XfeAPy72thaANKWcRolI5IR20ZBTQZA3J73Wb8Jr3PADElCQFVg6BYBjcFHvd6cR6s8HtDWagINw3cYNqiq8Qgkg5Lwu30kUTmAZDZD",
		coverPhoto: 'https://s-media-cache-ak0.pinimg.com/736x/c2/06/66/c20666fb99564cbe6c64c0ad83f79cd5.jpg',
		createdAt: 1444669695545,
		updatedAt: new Date().getTime(),
		lastLogin: new Date().getTime(),
		ratedPlaces: [],
		checkins: [
			{
				checkinID: '123kjdfbsokb11e3',
				factualID: '0c9fc4bc-6d4c-48c7-bc33-991db4eb68b5',
				rating: 5, 
				caption: 'My bears are so thirsty, I luv it!! <3',
				photo: 'http://img.lum.dolimg.com/v1/images/image_7ab7525c.jpeg',
				photoHeight: 354,
				photoWidth: 629,
				points: 9,
				createdAt: new Date().getTime(),
				updatedAt: new Date().getTime(),
				likes: [1376275232679666, 1376275232679666],
				comments: []
			},
			{
				checkinID: '120938ajsbd29873',
				factualID: '28f65ee3-3988-4550-835c-896b76233e43',
				rating: 4, 
				caption: 'got so sloshed, I raged lyk a tornado up in hurrr mwahaaaha <3<3 xoxo betches',
				photo: 'https://www.ok.gov/oid/images/tornado.jpg',
				photoHeight: 599,
				photoWidth: 800,
				points: 9,
				createdAt: new Date().getTime(),
				updatedAt: new Date().getTime(),
				likes: [1376275232679666, 1376275232679666],
				comments: []
			}
		],
		folders: [],
		feed: [],
		notifications: []
	},
	{
		facebookID: '1376275232679666',
		firstName: 'Sharon',
		lastName: 'Laverdetescu',
		email: 'fykdell_laverdetescu_1421360378@tfbnw.net',
		fbToken: 'CAAMxNSdb8MMBALXe7OOGm8KpMS2HvziJzi0BdRW0dwLpM1hPQ18QVwafR7xVVrmA9caj8fvi0Q4itzLxLKX7pFBZBFN2E9fHPhQledIdeZCst2GewGLXE8tEoDDS4kD2WU62p0WDjdB1jySZCJ5B1DYQhp4b8TnQ7hHv3I2obTEOg9mll5PlZCZBXgZCQT0LYgtxvfZCHAA4wZDZD',
		fbProfilePicture: 'http://www.dazzlingwallpapers.com/wp-content/uploads/2014/11/cool-girls-facebook-profile-pictures-with-camra.jpg',
		coverPhoto: 'http://www.themescompany.com/wp-content/uploads/2014/05/independent-girl-facebook-cover.jpg',
		createdAt: 1444669695545,
		updatedAt: new Date().getTime(),
		lastLogin: new Date().getTime(),
		friends: [1376881809284443],
		ratedPlaces: [],
		checkins: [
		{
				checkinID: '1239080912jsakd20918123',
				factualID: '0c9fc4bc-6d4c-48c7-bc33-991db4eb68b5',
				rating: 5, 
				caption: 'My bears are so thirsty, I luv it!! <3',
				photo: 'http://img.lum.dolimg.com/v1/images/image_7ab7525c.jpeg',
				photoHeight: 354,
				photoWidth: 629,
				points: 9,
				createdAt: new Date().getTime(),
				updatedAt: new Date().getTime(),
				likes: [1376275232679666, 1376275232679666],
				comments: []
			},
			{
				checkinID: 'sadn129392138dasih12390',
				factualID: '28f65ee3-3988-4550-835c-896b76233e43',
				rating: 4, 
				caption: 'got so sloshed, I raged lyk a tornado up in hurrr mwahaaaha <3<3 xoxo betches',
				photo: 'https://www.ok.gov/oid/images/tornado.jpg',
				photoHeight: 599,
				photoWidth: 800,
				points: 9,
				createdAt: new Date().getTime(),
				updatedAt: new Date().getTime(),
				likes: [1376275232679666, 1376275232679666],
				comments: []
			}
		],
		folders: [],
		feed: [],
		notifications: []
	}
];

fixtures.places = [
	{
		factualID: '28f65ee3-3988-4550-835c-896b76233e43',
		name: 'Toronado', 
		address: '547 Haight St',
		city: 'San Francisco',
		stateProvince: 'CA',
		country: 'us',
		postCode: '94117',
		neighborhood: 'Lower Haight',
		telephone: '(415) 863-2276',
		website: 'http://www.toronado.com',
		latitude: 37.771942,
		longitude: -122.431112,
		hours: {"monday":[["00:00","2:00"],["11:30","23:59"]],"tuesday":[["00:00","2:00"],["11:30","23:59"]],"wednesday":[["00:00","2:00"],["11:30","23:59"]],"thursday":[["00:00","2:00"],["11:30","23:59"]],"friday":[["00:00","2:00"],["11:30","23:59"]],"saturday":[["00:00","2:00"],["11:30","23:59"]],"sunday":[["00:00","2:00"],["11:30","23:59"]]},
		categoryLabels: [['Social', 'Bars'], ['Social', 'Food and Dining', 'Restaurants']],
		restaurantAttributes: {
			cuisine: {
				'Spanish': true, 
				'Tapas': true, 
				'Pub Food': true, 
				'American': true, 
				'Barbecue': true
			},
			factualRating: 4,
			price: 2, 
			open24Hours: false,
			takesReservations: true,
			cashOnly: false,
			goodForKids: true,
			goodForGroups: true, 
			outdoorSeatingAvailable: false,
			wifiAvailable: true,
			wheelchairAccessible: true,
			servesBreakfast: true,
			servesLunch: true,
			servesDinner: true,
			offersCatering: true,
			offersDelivery: true,
			offersTakeout: true, 
			servesOrPermitsAlcohol: true,
			byob: true,
			fullBar: true,
			healthyOptions: true,
			organicOptions: true,
			vegetarianOptions: true
		}
	},
	{
		factualID: '0c9fc4bc-6d4c-48c7-bc33-991db4eb68b5',
		name: 'Thirsty Bear Brewing Co.', 
		address: '661 Howard St',
		city: 'San Francisco',
		stateProvince: 'CA',
		country: 'us',
		postCode: '94105',
		neighborhood: ['Financial District', 'South Of Market', 'Union Square'],
		telephone: '(415) 974-0905',
		website: 'http://www.thirstybear.com',
		latitude: 37.785479,
		longitude: -122.399362,
		hours: {"monday":[["11:30","22:00"]],"tuesday":[["11:30","22:00"]],"wednesday":[["11:30","22:00"]],"thursday":[["11:30","22:00"]],"friday":[["11:30","23:00"]],"saturday":[["12:00","23:00"]],"sunday":[["17:00","22:00"]]},
		categoryLabels: [['Social', 'Food and Dining', 'Restaurants', 'International'], ['Social', 'Food and Dining', 'Restaurants', 'American'], ['Social', 'Bars']],
		restaurantAttributes: {
			cuisine: {
				'Spanish': true, 
				'Tapas': true, 
				'Pub Food': true, 
				'European': true, 
				'Organic': true
			},
			factualRating: 4,
			price: 2, 
			open24Hours: false,
			takesReservations: true,
			cashOnly: false,
			goodForKids: true,
			goodForGroups: true, 
			outdoorSeatingAvailable: false,
			wifiAvailable: true,
			wheelchairAccessible: true,
			servesBreakfast: true,
			servesLunch: true,
			servesDinner: true,
			offersCatering: true,
			offersDelivery: true,
			offersTakeout: true, 
			servesOrPermitsAlcohol: true,
			byob: true,
			fullBar: true,
			healthyOptions: true,
			organicOptions: true,
			vegetarianOptions: true
		}
	}
];

module.exports = fixtures;