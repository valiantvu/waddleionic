var categories = {};

categories.dictionary = {
  "Burger Joint": {
		prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-',
	  suffix: '-1.svg'
	},
	"BBQ Joint": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bbq-',
	  suffix: '-1.svg'
	},
	"National Park": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Nature Preserve": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Other Great Outdoors": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Park": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Trail": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Tree": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	  suffix: '-1.svg'
	},
	"Japanese Restaurant": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/japanese-',
	  suffix: '-1.svg'
	},
	"Ramen / Noodle House": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	  suffix: '-1.svg'
	},
	"Soup Place": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	  suffix: '-1.svg'
	},
	"Vietnamese Restaurant": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	  suffix: '-1.svg'
	},
	"Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Beach Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Brewery": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Pub": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Sports Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Beer Garden": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	  suffix: '-1.svg'
	},
	"Champagne Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Cocktail Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Gay Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Hotel Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Lounge": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Speakeasy": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Nightclub": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/nightclub-',
	  suffix: '-1.svg'
	},
	"Other Nightlife": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Whisky Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/whisky-',
	  suffix: '-1.svg'
	},
	"Sake Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Karaoke Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	  suffix: '-2.svg'
	},
	"Wine Bar": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	  suffix: '-1.svg'
	},
  "Winery": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	 suffix: '-1.svg'
	},
	"Wine Shop": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	 suffix: '-1.svg'
	},
	"Café": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	  suffix: '-1.svg'
	},
	"Coffee Shop": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	  suffix: '-1.svg'
	},
	"Tea Room": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	  suffix: '-1.svg'
	},
	"Food Truck": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/foodtruck-',
	  suffix: '-1.svg'
	},
	"Bagel Shop": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bagel-',
	  suffix: '-1.svg'
	},
	"Bakery": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bakery-',
	  suffix: '-1.svg'
	},
	"Art Gallery": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	  suffix: '-1.svg'
	},
	"Art Museum": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	  suffix: '-1.svg'
	},
	"Public Art": {
	  prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	  suffix: '-1.svg'
	},
	"Beach": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Nudist Beach": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Surf Spot": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Dive Spot": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Fishing Spot": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Lake": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Pool": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	"Train Station": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	"Platform": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	"Train": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	"Subway": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	"Tram": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	"Korean Restaurant": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/koreanrestaurant-',
	 suffix: '-1.svg'
	},
	"City": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"County": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Municipality": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Country": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Neighborhood": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"State": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Town": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Village": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	"Airport": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	"Airport Gate": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	"Airport Lounge": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	"Airport Terminal": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	"Plane": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	"Government Building": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"Capitol Building": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"City Hall": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"Monument / Landmark": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"Museum": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"History Museum": {
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	"American Restaurant": {
	 prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/americanrestaurant-",
	 suffix: '-1.svg'
  },
  "New American Restaurant": {
	 prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/newamericanrestaurant-",
	 suffix: '-1.svg'
  },
  "Bakery": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/bakery-",
   suffix: "-1.svg"
  },
  "Asian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  "Sandwich Place": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sandwich-",
   suffix: "-1.svg"
  },
  "Deli / Bodega": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sandwich-",
   suffix: "-1.svg"
  },
  "Seafood Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/seafood-",
   suffix: "-1.svg"
  },
  "Steakhouse": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  "Argentinian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  "Peruvian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  "Brazilian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  "Vegetarian / Vegan Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/vegetarian-",
   suffix: "-1.svg"
  },
  "Sushi Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sushi-",
   suffix: "-1.svg"
  },
  "Thai Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  "Malaysian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  "Cambodian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  "Pizza Place": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/pizza-",
   suffix: "-1.svg"
  },
  "Mexican Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  "Burrito Place": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  "Taco Place": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  "College Library": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  "Library": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  "Bookstore": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  "Used Bookstore": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  "College Bookstore": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  "Italian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/italianrestaurant-",
   suffix: "-1.svg"
  },
  "Indian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  "South Indian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  "Pakistani Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  "Sri Lankan Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  "North Indian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  "Ice Cream Shop": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/icecream-",
   suffix: "-1.svg"
  },
  "Frozen Yogurt": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/icecream-",
   suffix: "-1.svg"
  },
  "Dessert Shop": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  "Pie Shop": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  "Donut Shop": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  "Cupcake Shop": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  "Hotel": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  "Resort": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  "Motel": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  "Hostel": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  "Bed & Breakfast": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  "Greek Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "Halal Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "Middle Eastern Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "Persian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "Mediterranean Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "Moroccan Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  "German Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  "Polish Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  "Russian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  "Eastern European Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  "Romanian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  "Diner": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/diner-",
   suffix: "-1.svg"
  },
  "Chinese Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  "Cantonese Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/chineserestaurant-",
   suffix: "-1.svg"
  },
  "Dim Sum Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/chineserestaurant-",
   suffix: "-1.svg"
  },
  "Szechuan Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  "College & University": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/university-",
   suffix: "-2.svg"
  },
  "High School": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/university-",
   suffix: "-2.svg"
  },
   "Gym": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  "Climbing Gym": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  "Boxing Gym": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  "Gym / Fitness Center": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  "French Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/frenchrestaurant-",
   suffix: "-2.svg"
  },
  "Fried Chicken Joint": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/southernsoulfood-",
   suffix: "-2.svg"
  },
  "Southern / Soul Food Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/southernsoulfood-",
   suffix: "-1.svg"
  },
  "Hawaiian Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hawaiian-",
   suffix: "-1.svg"
  },
  "Restaurant": {
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/restaurant-",
   suffix: "-1.svg"
  }
};

categories.list = [
	{name: "Burger Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-',
	 suffix: '-1.svg'
	},
	{name: "BBQ Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bbq-',
	 suffix: '-1.svg'
	},
	{name: "National Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Nature Preserve",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Other Great Outdoors",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Trail",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Tree",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-',
	 suffix: '-1.svg'
	},
	{name: "Japanese Restaurant",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/japanese-',
	 suffix: '-1.svg'
	},
	{name: "Ramen / Noodle House",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	 suffix: '-1.svg'
	},
	{name: "Soup Place",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	 suffix: '-1.svg'
	},
	{name: "Vietnamese Restaurant",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-',
	 suffix: '-1.svg'
	},
	{name: "Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
		{name: "Beach Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
	{name: "Brewery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
	{name: "Pub",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
	{name: "Sports Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
	{name: "Beer Garden",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-',
	 suffix: '-1.svg'
	},
	{name: "Champagne Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Cocktail Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Gay Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Hotel Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Lounge",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Speakeasy",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Nightclub",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Other Nightlife",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Whisky Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Sake Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Karaoke Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-',
	 suffix: '-1.svg'
	},
	{name: "Wine Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	 suffix: '-1.svg'
	},
	{name: "Winery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	 suffix: '-1.svg'
	},
	{name: "Wine Shop",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/winery-',
	 suffix: '-1.svg'
	},
	{name: "Café",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	 suffix: '-1.svg'
	},
	{name: "Coffee Shop",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	 suffix: '-1.svg'
	},
	{name: "Tea Room",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-',
	 suffix: '-1.svg'
	},
	{name: "Food Truck",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/foodtruck-',
	 suffix: '-1.svg'
	},
	{name: "Bagel Shop",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bagel-',
	 suffix: '-1.svg'
	},
	{name: "Bakery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bakery-',
	 suffix: '-1.svg'
	},
	{name: "Art Gallery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	 suffix: '-1.svg'
	},
	{name: "Art Museum",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	 suffix: '-1.svg'
	},
	{name: "Public Art",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-',
	 suffix: '-1.svg'
	},
	{name: "Beach",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Nudist Beach",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Surf Spot",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Dive Spot",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Fishing Spot",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Lake",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Pool",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/surfspot-',
	 suffix: '-1.svg'
	},
	{name: "Train Station",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	{name: "Platform",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	{name: "Train",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	{name: "Subway",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	{name: "Tram",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/trainstation-',
	 suffix: '-1.svg'
	},
	{name: "Korean Restaurant",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/koreanrestaurant-',
	 suffix: '-1.svg'
	},
	{name: "City",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "County",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Municipality",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Country",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Neighborhood",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "State",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Town",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Village",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/city-',
	 suffix: '-1.svg'
	},
	{name: "Airport",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	{name: "Airport Gate",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	{name: "Airport Lounge",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	{name: "Airport Terminal",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	{name: "Plane",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/airport-',
	 suffix: '-1.svg'
	},
	{name: "Government Building",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "Capitol Building",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "City Hall",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "Monument / Landmark",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "Museum",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "History Museum",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/officialbuilding-',
	 suffix: '-1.svg'
	},
	{name: "American Restaurant",
	 prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/americanrestaurant-",
	 suffix: '-1.svg'
  },
  {name: "New American Restaurant",
	 prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/newamericanrestaurant-",
	 suffix: '-1.svg'
  },
  {name: "Bakery",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/bakery-",
   suffix: "-1.svg"
  },
  {name: "Asian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  {name: "Sandwich Place",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sandwich-",
   suffix: "-1.svg"
  },
  {name: "Deli / Bodega",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sandwich-",
   suffix: "-1.svg"
  },
  {name: "Seafood Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/seafood-",
   suffix: "-1.svg"
  },
  {name: "Steakhouse",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  {name: "Argentinian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  {name: "Peruvian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  {name: "Brazilian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/steakhouse-",
   suffix: "-1.svg"
  },
  {name: "Vegetarian / Vegan Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/vegetarian-",
   suffix: "-1.svg"
  },
  {name: "Sushi Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/sushi-",
   suffix: "-1.svg"
  },
  {name: "Thai Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  {name: "Malaysian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  {name: "Cambodian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/thai-",
   suffix: "-1.svg"
  },
  {name: "Pizza Place",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/pizza-",
   suffix: "-1.svg"
  },
  {name: "Mexican Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  {name: "Burrito Place",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  {name: "Taco Place",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/mexican-",
   suffix: "-1.svg"
  },
  {name: "College Library",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  {name: "Library",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  {name: "Bookstore",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  {name: "Used Bookstore",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  {name: "College Bookstore",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/library-",
   suffix: "-1.svg"
  },
  {name: "Italian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/italianrestaurant-",
   suffix: "-1.svg"
  },
  {name: "Indian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  {name: "South Indian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  {name: "Pakistani Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  {name: "Sri Lankan Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  {name: "North Indian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/indianfood-",
   suffix: "-1.svg"
  },
  {name: "Ice Cream Shop",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/icecream-",
   suffix: "-1.svg"
  },
  {name: "Frozen Yogurt",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/icecream-",
   suffix: "-1.svg"
  },
  {name: "Dessert Shop",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  {name: "Pie Shop",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  {name: "Donut Shop",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  {name: "Cupcake Shop",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/dessert-",
   suffix: "-1.svg"
  },
  {name: "Hotel",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  {name: "Resort",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  {name: "Motel",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  {name: "Hostel",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  {name: "Bed & Breakfast",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hotel-",
   suffix: "-1.svg"
  },
  {name: "Greek Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "Halal Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "Middle Eastern Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "Persian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "Mediterranean Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "Moroccan Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/greek-",
   suffix: "-1.svg"
  },
  {name: "German Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  {name: "Polish Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  {name: "Russian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  {name: "Eastern European Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  {name: "Romanian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/germanfood-",
   suffix: "-1.svg"
  },
  {name: "Diner",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/diner-",
   suffix: "-1.svg"
  },
  {name: "Chinese Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  {name: "Cantonese Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/chineserestaurant-",
   suffix: "-1.svg"
  },
  {name: "Dim Sum Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/chineserestaurant-",
   suffix: "-1.svg"
  },
  {name: "Szechuan Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/asianrestaurant-",
   suffix: "-1.svg"
  },
  {name: "College & University",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/university-",
   suffix: "-2.svg"
  },
  {name: "High School",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/university-",
   suffix: "-2.svg"
  },
    {name: "Gym",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  {name: "Climbing Gym",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  {name: "Boxing Gym",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  {name: "Gym / Fitness Center",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/gym-",
   suffix: "-1.svg"
  },
  {name: "French Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/frenchrestaurant-",
   suffix: "-2.svg"
  },
  {name: "Fried Chicken Joint",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/southernsoulfood-",
   suffix: "-2.svg"
  },
  {name: "Southern / Soul Food Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/southernsoulfood-",
   suffix: "-1.svg"
  },
  {name: "Hawaiian Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/hawaiian-",
   suffix: "-1.svg"
  },
  {name: "Restaurant",
   prefix: "https://s3-us-west-2.amazonaws.com/waddle/Badges/restaurant-",
   suffix: "-1.svg"
  }
];



module.exports = categories