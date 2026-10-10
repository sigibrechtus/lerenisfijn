/* Original, bilingual learning content, grouped by difficulty. No claim of an official curriculum. */
(function(root){'use strict';
const words={
 "nl": [
  [
   [
    "maan",
    "De ronde lamp aan de nachtelijke hemel.",
    "moon"
   ],
   [
    "kat",
    "Een dier dat miauw zegt.",
    "cat"
   ],
   [
    "boom",
    "Heeft een stam, takken en bladeren.",
    "tree"
   ],
   [
    "zon",
    "Geeft overdag licht en warmte.",
    "book"
   ],
   [
    "vos",
    "Een dier met een oranje vacht en een grote staart.",
    "book"
   ],
   [
    "uil",
    "Een vogel die oehoe roept.",
    "book"
   ],
   [
    "oog",
    "Hiermee kun je kijken.",
    "book"
   ],
   [
    "vis",
    "Een dier dat onder water zwemt.",
    "book"
   ],
   [
    "bed",
    "Hierin slaap je.",
    "book"
   ],
   [
    "tas",
    "Hierin draag je je spullen.",
    "book"
   ],
   [
    "pen",
    "Hiermee schrijf je met inkt.",
    "book"
   ],
   [
    "bal",
    "Een rond voorwerp om mee te spelen.",
    "book"
   ],
   [
    "jas",
    "Die trek je aan als het buiten koud is.",
    "book"
   ],
   [
    "dak",
    "Het bovenste deel van een huis.",
    "book"
   ],
   [
    "weg",
    "Hierover rijden auto’s.",
    "book"
   ]
  ],
  [
   [
    "ster",
    "Een klein lichtpunt aan de hemel.",
    "star"
   ],
   [
    "spook",
    "Pip is een vriendelijk …",
    "ghost"
   ],
   [
    "pompoen",
    "Een grote oranje vrucht.",
    "pumpkin"
   ],
   [
    "regen",
    "Druppels die uit de wolken vallen.",
    "book"
   ],
   [
    "schaduw",
    "Een donkere vorm achter iets in het licht.",
    "book"
   ],
   [
    "bezem",
    "Hiermee veeg je de vloer.",
    "book"
   ],
   [
    "heks",
    "Een figuur die toverspreuken kan maken.",
    "book"
   ],
   [
    "draak",
    "Een fantasiedier dat vuur kan spuwen.",
    "book"
   ],
   [
    "vleugel",
    "Hiermee kan een vogel vliegen.",
    "book"
   ],
   [
    "kaars",
    "Een lichtje met een lont.",
    "book"
   ],
   [
    "spin",
    "Dit dier maakt een web.",
    "book"
   ],
   [
    "web",
    "Het dradennet van een spin.",
    "book"
   ],
   [
    "blad",
    "Groeit aan een tak van een boom.",
    "book"
   ],
   [
    "water",
    "Een vloeistof die je kunt drinken.",
    "book"
   ],
   [
    "steen",
    "Een hard stukje rots.",
    "book"
   ]
  ],
  [
   [
    "sleutel",
    "Hiermee open je een slot.",
    "key"
   ],
   [
    "kasteel",
    "Een groot gebouw met torens.",
    "castle"
   ],
   [
    "lantaarn",
    "Een lamp die je kunt dragen.",
    "lantern"
   ],
   [
    "toverdrank",
    "Een magisch mengsel uit een ketel.",
    "book"
   ],
   [
    "herfstbos",
    "Een bos met vallende bladeren in oktober.",
    "book"
   ],
   [
    "maanlicht",
    "Het zachte licht van de maan.",
    "book"
   ],
   [
    "vuurvlieg",
    "Een klein insect met een lichtje.",
    "book"
   ],
   [
    "raadsel",
    "Een vraag waarvoor je goed moet nadenken.",
    "book"
   ],
   [
    "spiegel",
    "Hierin zie je jezelf.",
    "book"
   ],
   [
    "sterren",
    "Veel kleine lichtpunten aan de hemel.",
    "book"
   ],
   [
    "tuinier",
    "Iemand die planten verzorgt.",
    "book"
   ],
   [
    "konijn",
    "Een dier met lange oren.",
    "book"
   ],
   [
    "schatkist",
    "Een kist met kostbare spullen.",
    "book"
   ],
   [
    "nachtuil",
    "Een uil die in het donker actief is.",
    "book"
   ],
   [
    "bosgeest",
    "Een vriendelijke geest die in het bos woont.",
    "book"
   ]
  ]
 ],
 "fr": [
  [
   [
    "lune",
    "Le disque lumineux dans le ciel nocturne.",
    "moon"
   ],
   [
    "chat",
    "Un animal qui dit miaou.",
    "cat"
   ],
   [
    "arbre",
    "Il a un tronc, des branches et des feuilles.",
    "tree"
   ],
   [
    "ciel",
    "L’espace que tu vois au-dessus de ta tête.",
    "book"
   ],
   [
    "nuit",
    "Le moment où le ciel devient sombre.",
    "book"
   ],
   [
    "vent",
    "L’air qui souffle et fait bouger les feuilles.",
    "book"
   ],
   [
    "eau",
    "Un liquide que tu peux boire.",
    "book"
   ],
   [
    "feu",
    "Il brûle et donne de la chaleur.",
    "book"
   ],
   [
    "lit",
    "Tu dors dedans.",
    "book"
   ],
   [
    "sac",
    "Tu y ranges tes affaires.",
    "book"
   ],
   [
    "clé",
    "Elle ouvre une serrure.",
    "key"
   ],
   [
    "nez",
    "Tu sens les odeurs avec lui.",
    "book"
   ],
   [
    "mer",
    "Une grande étendue d’eau salée.",
    "book"
   ],
   [
    "loup",
    "Un animal qui hurle et vit en meute.",
    "book"
   ],
   [
    "rose",
    "Une fleur qui peut avoir des épines.",
    "book"
   ]
  ],
  [
   [
    "étoile",
    "Un petit point lumineux dans le ciel.",
    "star"
   ],
   [
    "fantôme",
    "Pip est un gentil …",
    "ghost"
   ],
   [
    "citrouille",
    "Un gros fruit orange.",
    "pumpkin"
   ],
   [
    "sorcière",
    "Un personnage qui prépare des sorts.",
    "book"
   ],
   [
    "balai",
    "Il sert à nettoyer le sol.",
    "book"
   ],
   [
    "forêt",
    "Un lieu avec beaucoup d’arbres.",
    "book"
   ],
   [
    "hibou",
    "Un oiseau qui hulule.",
    "book"
   ],
   [
    "renard",
    "Un animal roux avec une grande queue.",
    "book"
   ],
   [
    "dragon",
    "Un animal imaginaire qui peut cracher du feu.",
    "book"
   ],
   [
    "bougie",
    "Une petite lumière avec une mèche.",
    "book"
   ],
   [
    "fleur",
    "Elle pousse et peut avoir des pétales.",
    "book"
   ],
   [
    "nuage",
    "Il flotte dans le ciel et peut apporter la pluie.",
    "book"
   ],
   [
    "pluie",
    "Des gouttes qui tombent des nuages.",
    "book"
   ],
   [
    "jardin",
    "Un endroit où l’on cultive des plantes.",
    "book"
   ],
   [
    "miroir",
    "Tu peux y voir ton reflet.",
    "book"
   ]
  ],
  [
   [
    "château",
    "Un grand bâtiment avec des tours.",
    "castle"
   ],
   [
    "lanterne",
    "Une lampe que tu peux porter.",
    "lantern"
   ],
   [
    "potion",
    "Un mélange magique préparé dans un chaudron.",
    "book"
   ],
   [
    "grimoire",
    "Un livre de formules magiques.",
    "book"
   ],
   [
    "chaudron",
    "Une grande marmite pour préparer une potion.",
    "book"
   ],
   [
    "luciole",
    "Un petit insecte qui produit de la lumière.",
    "book"
   ],
   [
    "mystère",
    "Quelque chose de difficile à expliquer.",
    "book"
   ],
   [
    "chemin",
    "Un passage pour marcher vers un endroit.",
    "book"
   ],
   [
    "cristal",
    "Une pierre brillante avec des faces.",
    "book"
   ],
   [
    "automne",
    "La saison pendant laquelle les feuilles tombent.",
    "book"
   ],
   [
    "serrure",
    "La clé tourne dedans pour ouvrir une porte.",
    "book"
   ],
   [
    "trésor",
    "Des objets précieux cachés.",
    "book"
   ],
   [
    "feuille",
    "Elle pousse sur une branche.",
    "book"
   ],
   [
    "papillon",
    "Un insecte avec deux grandes ailes colorées.",
    "book"
   ],
   [
    "araignée",
    "Un animal à huit pattes qui tisse une toile.",
    "book"
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
