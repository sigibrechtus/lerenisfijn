/* Original, bilingual learning content, grouped by difficulty. No claim of an official curriculum. */
(function(root){'use strict';
const words={
 "nl": [
  [
   [
    "maan",
    "De ronde lamp aan de nachtelijke hemel.",
    "maan"
   ],
   [
    "kat",
    "Een dier dat miauw zegt.",
    "kat"
   ],
   [
    "boom",
    "Heeft een stam, takken en bladeren.",
    "boom"
   ],
   [
    "zon",
    "Geeft overdag licht en warmte.",
    "zon"
   ],
   [
    "vos",
    "Een dier met een oranje vacht en een grote staart.",
    "vos"
   ],
   [
    "uil",
    "Een vogel die oehoe roept.",
    "uil"
   ],
   [
    "oog",
    "Hiermee kun je kijken.",
    "oog"
   ],
   [
    "vis",
    "Een dier dat onder water zwemt.",
    "vis"
   ],
   [
    "bed",
    "Hierin slaap je.",
    "bed"
   ],
   [
    "tas",
    "Hierin draag je je spullen.",
    "tas"
   ],
   [
    "pen",
    "Hiermee schrijf je met inkt.",
    "pen"
   ],
   [
    "bal",
    "Een rond voorwerp om mee te spelen.",
    "bal"
   ],
   [
    "jas",
    "Die trek je aan als het buiten koud is.",
    "jas"
   ],
   [
    "dak",
    "Het bovenste deel van een huis.",
    "dak"
   ],
   [
    "weg",
    "Hierover rijden auto’s.",
    "weg"
   ]
  ],
  [
   [
    "ster",
    "Een klein lichtpunt aan de hemel.",
    "ster"
   ],
   [
    "spook",
    "Pip is een vriendelijk …",
    "spook"
   ],
   [
    "pompoen",
    "Een grote oranje vrucht.",
    "pompoen"
   ],
   [
    "regen",
    "Druppels die uit de wolken vallen.",
    "regen"
   ],
   [
    "schaduw",
    "Een donkere vorm achter iets in het licht.",
    "schaduw"
   ],
   [
    "bezem",
    "Hiermee veeg je de vloer.",
    "bezem"
   ],
   [
    "heks",
    "Een figuur die toverspreuken kan maken.",
    "heks"
   ],
   [
    "draak",
    "Een fantasiedier dat vuur kan spuwen.",
    "draak"
   ],
   [
    "vleugel",
    "Hiermee kan een vogel vliegen.",
    "vleugel"
   ],
   [
    "kaars",
    "Een lichtje met een lont.",
    "kaars"
   ],
   [
    "spin",
    "Dit dier maakt een web.",
    "spin"
   ],
   [
    "web",
    "Het dradennet van een spin.",
    "web"
   ],
   [
    "blad",
    "Groeit aan een tak van een boom.",
    "blad"
   ],
   [
    "water",
    "Een vloeistof die je kunt drinken.",
    "water"
   ],
   [
    "steen",
    "Een hard stukje rots.",
    "steen"
   ]
  ],
  [
   [
    "sleutel",
    "Hiermee open je een slot.",
    "sleutel"
   ],
   [
    "kasteel",
    "Een groot gebouw met torens.",
    "kasteel"
   ],
   [
    "lantaarn",
    "Een lamp die je kunt dragen.",
    "lantaarn"
   ],
   [
    "toverdrank",
    "Een magisch mengsel uit een ketel.",
    "toverdrank"
   ],
   [
    "herfstbos",
    "Een bos met vallende bladeren in oktober.",
    "herfstbos"
   ],
   [
    "maanlicht",
    "Het zachte licht van de maan.",
    "maanlicht"
   ],
   [
    "vuurvlieg",
    "Een klein insect met een lichtje.",
    "vuurvlieg"
   ],
   [
    "raadsel",
    "Een vraag waarvoor je goed moet nadenken.",
    "raadsel"
   ],
   [
    "spiegel",
    "Hierin zie je jezelf.",
    "spiegel"
   ],
   [
    "sterren",
    "Veel kleine lichtpunten aan de hemel.",
    "sterren"
   ],
   [
    "tuinier",
    "Iemand die planten verzorgt.",
    "tuinier"
   ],
   [
    "konijn",
    "Een dier met lange oren.",
    "konijn"
   ],
   [
    "schatkist",
    "Een kist met kostbare spullen.",
    "schatkist"
   ],
   [
    "nachtuil",
    "Een uil die in het donker actief is.",
    "nachtuil"
   ],
   [
    "bosgeest",
    "Een vriendelijke geest die in het bos woont.",
    "bosgeest"
   ]
  ]
 ],
 "fr": [
  [
   [
    "lune",
    "Le disque lumineux dans le ciel nocturne.",
    "lune"
   ],
   [
    "chat",
    "Un animal qui dit miaou.",
    "chat"
   ],
   [
    "arbre",
    "Il a un tronc, des branches et des feuilles.",
    "arbre"
   ],
   [
    "ciel",
    "L’espace que tu vois au-dessus de ta tête.",
    "ciel"
   ],
   [
    "nuit",
    "Le moment où le ciel devient sombre.",
    "nuit"
   ],
   [
    "vent",
    "L’air qui souffle et fait bouger les feuilles.",
    "vent"
   ],
   [
    "eau",
    "Un liquide que tu peux boire.",
    "eau"
   ],
   [
    "feu",
    "Il brûle et donne de la chaleur.",
    "feu"
   ],
   [
    "lit",
    "Tu dors dedans.",
    "lit"
   ],
   [
    "sac",
    "Tu y ranges tes affaires.",
    "sac"
   ],
   [
    "clé",
    "Elle ouvre une serrure.",
    "clé"
   ],
   [
    "nez",
    "Tu sens les odeurs avec lui.",
    "nez"
   ],
   [
    "mer",
    "Une grande étendue d’eau salée.",
    "mer"
   ],
   [
    "loup",
    "Un animal qui hurle et vit en meute.",
    "loup"
   ],
   [
    "rose",
    "Une fleur qui peut avoir des épines.",
    "rose"
   ]
  ],
  [
   [
    "étoile",
    "Un petit point lumineux dans le ciel.",
    "étoile"
   ],
   [
    "fantôme",
    "Pip est un gentil …",
    "fantôme"
   ],
   [
    "citrouille",
    "Un gros fruit orange.",
    "citrouille"
   ],
   [
    "sorcière",
    "Un personnage qui prépare des sorts.",
    "sorcière"
   ],
   [
    "balai",
    "Il sert à nettoyer le sol.",
    "balai"
   ],
   [
    "forêt",
    "Un lieu avec beaucoup d’arbres.",
    "forêt"
   ],
   [
    "hibou",
    "Un oiseau qui hulule.",
    "hibou"
   ],
   [
    "renard",
    "Un animal roux avec une grande queue.",
    "renard"
   ],
   [
    "dragon",
    "Un animal imaginaire qui peut cracher du feu.",
    "dragon"
   ],
   [
    "bougie",
    "Une petite lumière avec une mèche.",
    "bougie"
   ],
   [
    "fleur",
    "Elle pousse et peut avoir des pétales.",
    "fleur"
   ],
   [
    "nuage",
    "Il flotte dans le ciel et peut apporter la pluie.",
    "nuage"
   ],
   [
    "pluie",
    "Des gouttes qui tombent des nuages.",
    "pluie"
   ],
   [
    "jardin",
    "Un endroit où l’on cultive des plantes.",
    "jardin"
   ],
   [
    "miroir",
    "Tu peux y voir ton reflet.",
    "miroir"
   ]
  ],
  [
   [
    "château",
    "Un grand bâtiment avec des tours.",
    "château"
   ],
   [
    "lanterne",
    "Une lampe que tu peux porter.",
    "lanterne"
   ],
   [
    "potion",
    "Un mélange magique préparé dans un chaudron.",
    "potion"
   ],
   [
    "grimoire",
    "Un livre de formules magiques.",
    "grimoire"
   ],
   [
    "chaudron",
    "Une grande marmite pour préparer une potion.",
    "chaudron"
   ],
   [
    "luciole",
    "Un petit insecte qui produit de la lumière.",
    "luciole"
   ],
   [
    "mystère",
    "Quelque chose de difficile à expliquer.",
    "mystère"
   ],
   [
    "chemin",
    "Un passage pour marcher vers un endroit.",
    "chemin"
   ],
   [
    "cristal",
    "Une pierre brillante avec des faces.",
    "cristal"
   ],
   [
    "automne",
    "La saison pendant laquelle les feuilles tombent.",
    "automne"
   ],
   [
    "serrure",
    "La clé tourne dedans pour ouvrir une porte.",
    "serrure"
   ],
   [
    "trésor",
    "Des objets précieux cachés.",
    "trésor"
   ],
   [
    "feuille",
    "Elle pousse sur une branche.",
    "feuille"
   ],
   [
    "papillon",
    "Un insecte avec deux grandes ailes colorées.",
    "papillon"
   ],
   [
    "araignée",
    "Un animal à huit pattes qui tisse une toile.",
    "araignée"
   ]
  ]
 ]
};
const riddles={
 "nl": [
  [
   "Ik heb wijzers, maar ik prik niet.",
   "klok",
   "clock"
  ],
  [
   "Ik verlicht de nacht en verander van vorm.",
   "maan",
   "moon"
  ],
  [
   "Ik heb bladzijden, maar ben geen boom.",
   "boek",
   "book"
  ],
  [
   "Ik draai in een slot en open de deur.",
   "sleutel",
   "key"
  ],
  [
   "Je draagt mij mee om een donker pad te verlichten.",
   "lantaarn",
   "lantern"
  ],
  [
   "Ik ben een grote oranje vrucht met een harde schil.",
   "pompoen",
   "pumpkin"
  ],
  [
   "Ik heb acht poten en maak een web.",
   "spin",
   "spider"
  ],
  [
   "Ik heb een steel en veeg stof van de vloer.",
   "bezem",
   "broom"
  ],
  [
   "Ik val als druppels uit de wolken.",
   "regen",
   "rain"
  ],
  [
   "Je ziet mij niet, maar ik laat bladeren bewegen.",
   "wind",
   "wind"
  ],
  [
   "Ik heb wortels, een stam en takken.",
   "boom",
   "tree"
  ],
  [
   "Ik ben een klein lichtpunt aan de nachtelijke hemel.",
   "ster",
   "star"
  ],
  [
   "Ik geef overdag licht en warmte.",
   "zon",
   "sun"
  ],
  [
   "Ik heb een oranje vacht en een grote pluimstaart.",
   "vos",
   "fox"
  ],
  [
   "Ik ben een vogel en roep oehoe.",
   "uil",
   "owl"
  ]
 ],
 "fr": [
  [
   "J’ai des aiguilles, mais je ne pique pas.",
   "horloge",
   "clock"
  ],
  [
   "J’éclaire la nuit et je change de forme.",
   "lune",
   "moon"
  ],
  [
   "J’ai des pages, mais je ne suis pas un arbre.",
   "livre",
   "book"
  ],
  [
   "Je tourne dans une serrure pour ouvrir la porte.",
   "clé",
   "key"
  ],
  [
   "Tu me portes pour éclairer un chemin sombre.",
   "lanterne",
   "lantern"
  ],
  [
   "Je suis un gros fruit orange avec une peau dure.",
   "citrouille",
   "pumpkin"
  ],
  [
   "J’ai huit pattes et je tisse une toile.",
   "araignée",
   "spider"
  ],
  [
   "J’ai un manche et je balaie la poussière.",
   "balai",
   "broom"
  ],
  [
   "Je tombe des nuages sous forme de gouttes.",
   "pluie",
   "rain"
  ],
  [
   "Tu ne me vois pas, mais je fais bouger les feuilles.",
   "vent",
   "wind"
  ],
  [
   "J’ai des racines, un tronc et des branches.",
   "arbre",
   "tree"
  ],
  [
   "Je suis un petit point lumineux dans le ciel nocturne.",
   "étoile",
   "star"
  ],
  [
   "Je donne de la lumière et de la chaleur le jour.",
   "soleil",
   "sun"
  ],
  [
   "Je suis roux et j’ai une grande queue touffue.",
   "renard",
   "fox"
  ],
  [
   "Je suis un oiseau qui hulule.",
   "hibou",
   "owl"
  ]
 ]
};
const api={words,riddles};root.MoonLearningContent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
