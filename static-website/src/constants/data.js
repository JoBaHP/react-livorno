import images from "./images";

const wines = [
  {
    title: "Coca Cola",
    price: "125din",
    tags: " Staklo | Bezalkoholno",
    translationKeys: ["wine_title", "foods.title"]
  },
  {
    title: "Kisela Voda",
    price: "125din",
    tags: "Staklo | Bezalkoholno",
    translationKeys: ["wine_title", "foods.title"]
  },
  {
    title: "Gusti Sokovi",
    price: "145din",
    tags: "Staklo | Bezalkoholno",
    translationKeys: ["wine_title", "foods.title"]
  },
  {
    title: "Espresso",
    price: "120din",
    tags: "Kafa | Bezalkoholno",
    translationKeys: ["wine_title", "foods.title"]
  },
  {
    title: "Staropramen",
    price: "165",
    tags: "0.33l | alkoholno",
    translationKeys: ["wine_title", "foods.title"]
  },
];

const cocktails = [
  {
    title: "Kaprićoza",
    price: "350din",
    tags: "Pica | 20cm",
    translationKeys: ["cocktail_title", "foods.title"]
  },
  {
    title: "Burger",
    price: "490din",
    tags: "Burger | pomfrit ",
    translationKeys: ["cocktail_title", "foods.title"]
  },
  {
    title: "Wrap",
    price: "440din",
    tags: "Wrap | Piletina | Prilozi",
    translationKeys: ["cocktail_title", "foods.title"]
  },
  {
    title: "Livorno Doručak",
    price: "390din",
    tags: "Jaja | Kobaja | Šunka | Pomfrit",
    translationKeys: ["cocktail_title", "foods.title"]
  },
  {
    title: "Pljeskavica",
    price: "230din",
    tags: "Roštilj | Prilozi",
    translationKeys: ["cocktail_title", "foods.title"]
  },
];

const awards = [
  {
    imgUrl: images.award02,
    translationKeys: ["awards_card.taste", "awards_card.taste_description"],
  },
  {
    imgUrl: images.award01,
    translationKeys: ["awards_card.service", "awards_card.service_description"],
  },
  {
    imgUrl: images.award05,
    translationKeys: ["awards_card.atmosphere", "awards_card.atmosphere_description"],
  },
  {
    imgUrl: images.award03,
    translationKeys: ["awards_card.coffee", "awards_card.coffee_description"],
  },
];
const obj = { wines, cocktails, awards };
export default obj;
