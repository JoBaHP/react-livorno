import images from "./images";

const wines = [
  {
    title: "Coca Cola",
    price: "125din",
    tags: " Staklo | Bezalkoholno",
  },
  {
    title: "Kisela Voda",
    price: "125din",
    tags: "Staklo | Bezalkoholno",
  },
  {
    title: "Gusti Sokovi",
    price: "145din",
    tags: "Staklo | Bezalkoholno",
  },
  {
    title: "Espresso",
    price: "120din",
    tags: "Kafa | Bezalkoholno",
  },
  {
    title: "Staropramen",
    price: "165",
    tags: "0.33l | alkoholno",
  },
];

const cocktails = [
  {
    title: "Kaprićoza",
    price: "350din",
    tags: "Pica | 20cm",
  },
  {
    title: "Burger",
    price: "490din",
    tags: "Burger | pomfrit ",
  },
  {
    title: "Wrap",
    price: "440din",
    tags: "Wrap | Piletina | Prilozi",
  },
  {
    title: "Livorno Doručak",
    price: "390din",
    tags: "Jaja | Kobaja | Šunka | Pomfrit",
  },
  {
    title: "Pljeskavica",
    price: "230din",
    tags: "Roštilj | Prilozi",
  },
];

const awards = [
  {
    imgUrl: images.award02,
    title: "Ukusnu Hrana",
    subtitle: "Uvek samo najbolje iz naše kuhinje.",
  },
  {
    imgUrl: images.award01,
    title: "Ljubazno osoblje",
    subtitle: "Postaraće se da se ispuni sve vaše zahteve.",
  },
  {
    imgUrl: images.award05,
    title: "Prijatan Ambijent",
    subtitle: "Mesto gde ćete poželiti opet da dođete.",
  },
  {
    imgUrl: images.award03,
    title: "Izvanrednu Kafu",
    subtitle: "Koristimo samo premium kafu za vaša čula.",
  },
];
const obj = { wines, cocktails, awards };
export default obj;
