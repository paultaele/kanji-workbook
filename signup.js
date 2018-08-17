function generateUsername() {
  // set helper values
  var count1 = colors.length;
  var count2 = pokemons.length;
  var index;

  // get element 1
  index = randomDigit(count1);
  var element1 = colors[index].toLowerCase();

  // get element 2
  index = randomDigit(count2);
  var element2 = pokemons[index].toLowerCase();

  // create username and add to form
  var output = "" + element1 + "-" + element2;
  document.getElementById("username_input").value = output;
}

function generatePassword() {
  // get element
  var count = fruits.length;
  var index = randomDigit(count);
  var element = fruits[index].toLowerCase();

  // get number
  var number = "" + randomDigit(10) + randomDigit(10) + randomDigit(10) + randomDigit(10) + randomDigit(10);

  // create password and add to form
  var output = "" + element + number;
  document.getElementById("password_input").value = output;
}

function randomDigit(num) {
  return (Math.floor(Math.random() * num) + 1) - 1;
}

var colors = [
  "kuroi",
  "shiroi",
  "akai",
  "kiiro",
  "aoiro",
  "midori",
  "chairo",
  "momoiro",
  "daidaiiro",
  "haiiro",
  "murasaki"
];

var pokemons = [
  "Bulbasaur",
  "Ivysaur",
  "Venusaur",
  "Charmander",
  "Charmeleon",
  "Charizard",
  "Squirtle",
  "Wartortle",
  "Blastoise",
  "Caterpie",
  "Metapod",
  "Butterfree",
  "Weedle",
  "Kakuna",
  "Beedrill",
  "Pidgey",
  "Pidgeotto",
  "Pidgeot",
  "Rattata",
  "Raticate",
  "Spearow",
  "Fearow",
  "Ekans",
  "Arbok",
  "Pikachu",
  "Raichu",
  "Sandshrew",
  "Sandslash",
  "Nidorina",
  "Nidoqueen",
  "Nidorino",
  "Nidoking",
  "Clefairy",
  "Clefable",
  "Vulpix",
  "Ninetales",
  "Jigglypuff",
  "Wigglytuff",
  "Zubat",
  "Golbat",
  "Oddish",
  "Gloom",
  "Vileplume",
  "Paras",
  "Parasect",
  "Venonat",
  "Venomoth",
  "Diglett",
  "Dugtrio",
  "Meowth",
  "Persian",
  "Psyduck",
  "Golduck",
  "Mankey",
  "Primeape",
  "Growlithe",
  "Arcanine",
  "Poliwag",
  "Poliwhirl",
  "Poliwrath",
  "Abra",
  "Kadabra",
  "Alakazam",
  "Machop",
  "Machoke",
  "Machamp",
  "Bellsprout",
  "Weepinbell",
  "Victreebel",
  "Tentacool",
  "Tentacruel",
  "Geodude",
  "Graveler",
  "Golem",
  "Ponyta",
  "Rapidash",
  "Slowpoke",
  "Slowbro",
  "Magnemite",
  "Magneton",
  "Farfetchd",
  "Doduo",
  "Dodrio",
  "Seel",
  "Dewgong",
  "Grimer",
  "Muk",
  "Shellder",
  "Cloyster",
  "Gastly",
  "Haunter",
  "Gengar",
  "Onix",
  "Drowzee",
  "Hypno",
  "Krabby",
  "Kingler",
  "Voltorb",
  "Electrode",
  "Exeggcute",
  "Exeggutor",
  "Cubone",
  "Marowak",
  "Hitmonlee",
  "Hitmonchan",
  "Lickitung",
  "Koffing",
  "Weezing",
  "Rhyhorn",
  "Rhydon",
  "Chansey",
  "Tangela",
  "Kangaskhan",
  "Horsea",
  "Seadra",
  "Goldeen",
  "Seaking",
  "Staryu",
  "Starmie",
  "MrMime",
  "Scyther",
  "Jynx",
  "Electabuzz",
  "Magmar",
  "Pinsir",
  "Tauros",
  "Magikarp",
  "Gyarados",
  "Lapras",
  "Ditto",
  "Eevee",
  "Vaporeon",
  "Jolteon",
  "Flareon",
  "Porygon",
  "Omanyte",
  "Omastar",
  "Kabuto",
  "Kabutops",
  "Aerodactyl",
  "Snorlax",
  "Articuno",
  "Zapdos",
  "Moltres",
  "Dratini",
  "Dragonair",
  "Dragonite",
  "Mewtwo",
  "Mew"
];

var fruits = [
  "ringo",
  "nashi",
  "orangi",
  "remon",
  "lemon",
  "tomato",
  "waninashi",
  "abogato",
  "suika",
  "meron",
  "kyuuri",
  "ichigo",
  "burakkuberii",
  "buruuberii",
  "sakuranbo",
  "mangoo",
  "papaia",
  "banana",
  "jyagaimo",
  "imo",
  "satsumaimo",
  "chingensai",
  "hourensou",
  "komatsuna",
  "kuushinsai",
  "tamanegi",
  "piiman",
  "kinoko",
  "nasubi",
  "tougarashi",
  "cyabetsu",
];
