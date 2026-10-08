# Voorstel: van oefenen naar een leerclub

Dit is een ontwerpvoorstel; er zijn nog geen openbare ranglijsten of community-tabellen aangemaakt.

## Eerste versie

Een **Leerclub** op de homepage met vier onderdelen:

| Onderdeel | Concrete spelervaring | Zichtbaar voor de groep |
| --- | --- | --- |
| Weekmissie | Bijvoorbeeld 20 rekenvragen en 10 woorden van één gekozen thema | Voortgangsbalk en afgerond-insigne |
| Persoonlijke expeditie | Voltooi één ronde in drie verschillende apps | Avatar en vrijgespeelde mijlpaal |
| Samenwerkingsdoel | De klas rondt samen 300 oefenvragen af | Gezamenlijke kaart of bouwproject groeit |
| Weekranglijst | Beste ronde én meeste vooruitgang, per leerjaar en niveau | Alleen gekozen bijnaam, avatar en score |

Start met privéclubs op uitnodiging en vrijwillige deelname aan de ranglijst. Ouders melden aan; de leerling verschijnt met een bijnaam. E-mailadressen blijven privé. Leerlingen kunnen oefenen zonder deel te nemen aan vergelijking met anderen.

## XP en prestaties

- Geef XP voor een afgeronde vraag, met een bonus voor goed in één keer. Een herstelde fout verdient ook voortgang.
- Beloon drie oefendagen in een week, meerdere vakken en verbeterde nauwkeurigheid; maak dagelijks oefenen geen verplichting.
- Voorbeelden van badges: **Eerste ronde**, **Geldmeester**, **Patroonspeurder**, **Woordverkenner**, **Doorzetter** en **Drie vakken ontdekt**.
- Beperk de XP die herhaald spelen van dezelfde vraag oplevert. Geef per event maximaal één of een beperkt aantal beoordeelde rondes.
- Toon het persoonlijke beste resultaat en een avatar als belangrijkste voortgang. Een nieuwe week biedt een nieuwe kans op de ranglijst.

### Voorstel voor de eerste spelregels

Dit zijn ontwerpkeuzes die met ouders en leerlingen kunnen worden aangepast, geen bewezen optimale leerprikkels.

| Beloning | Voorstel |
| --- | --- |
| Oefen-XP | 5 XP voor een opgeloste vraag, plus 3 XP voor goed in één keer |
| Weekmissie | 30 bonus-XP voor bijvoorbeeld één rekenronde en één dicteeronde |
| Dubbele registratie | Eén beloning per vraag-ID; opnieuw versturen levert geen extra XP op |
| Herhaald oefenen | Oefenen blijft mogelijk; maximaal 20 beloonden vragen per app en niveau per dag |
| Vrijspelen | XP opent cosmetische avataropties en plekken op een ontdekkingskaart |

Oefen-XP is geen wedstrijdscore. Een leerling die na een fout verder oefent kan XP verdienen zonder een extra punt op de nauwkeurigheidsranglijst te krijgen. De limiet gaat alleen over beloningen, niet over het mogen oefenen.

| Badge | Eerste criterium |
| --- | --- |
| Eerste ronde | Eén ronde afronden |
| Woordverkenner | Twee verschillende dicteethema's oefenen |
| Geldmeester | Minimaal 8/10 op een ronde met euro's en centen |
| Doorzetter | Vijf vragen na een fout alsnog oplossen |
| Drie vakken ontdekt | Een taal-, reken- en logicaronde afronden |
| Samen sterk | De club bereikt het afgesproken weekdoel |

Geef elke badge eenmaal per versie van het criterium. Metingen voor retries moeten eerst per app worden gecontroleerd: de huidige spellen registreren die niet allemaal op dezelfde manier.

## Eerlijke evenementen

Vergelijk alleen dezelfde oefening, leerjaar, niveau, invoermethode en woordlijst. Gebruik dezelfde vraagseed en hetzelfde aantal vragen. Handgeschreven dictees krijgen geen rangschikking op snelheid; herkenningsfouten en handmatige goedkeuringen tellen niet als geverifieerde wedstrijdantwoorden. Een ranglijst op nauwkeurigheid krijgt een minimumaantal beoordeelde vragen.

Voorbeelden: een **Winkelweek**, een **Bosdictee** en een **Patroontocht**. Een event heeft een vaste begin- en eindtijd, een doel en een zichtbaar badge-ontwerp. Een groepsfeed deelt behaalde badges en gezamenlijke mijlpalen, zonder vrije chat in de eerste versie.

### Zo ziet een week eruit

Op de homepage verschijnt een **Leerclub**-kaart met **Jouw missie**, **Ons weekdoel**, **Badges** en **Ranglijst**. Een voorstel voor een eventvenster is maandag 08:00 tot zondag 18:00 in de tijdzone Europe/Brussels; dit is een ontwerpvoorbeeld, er is niets ingepland.

- **Winkelweek:** oefen met geld op je niveau en draag tien afgeronde vragen bij aan het clubdoel.
- **Bosdictee:** de organisator kiest leerjaar, thema en één gedeelde woordenlijst; iedereen oefent dezelfde leerstof.
- **Patroontocht:** rond een passende patroonronde af en open een nieuw vak op de gezamenlijke kaart.

Voor de eerste competitieve versie: maximaal twee serverbeoordeelde rondes per event. Het beste eerste-poging-resultaat telt. Gelijke resultaten krijgen dezelfde plaats, zonder snelheidsvoordeel. Een apart **Jouw vooruitgang**-bord vergelijkt alleen resultaten op hetzelfde niveau en dezelfde meetbasis. Kleine of onvergelijkbare steekproeven leveren geen rangplaats op.

De clubfeed toont alleen vrijwillig gedeelde badges en gezamenlijke mijlpalen. Het resultaatenscherm laat de leerling zien wat verdiend is en welk haalbaar doel hierna volgt. Ouders beheren deelname en zichtbaarheid; badges blijven ook bruikbaar zonder club.

## Benodigde serveronderdelen

De bestaande `exercise_attempts` zijn persoonlijke oefenregistraties die de browser schrijft. Ze zijn bruikbaar voor persoonlijke voortgang, maar bewijzen geen eerlijke wedstrijdscore. Maak openbare of gedeelde ranglijsten pas wanneer de server de antwoorden en rondes beoordeelt.

| Onderdeel | Doel |
| --- | --- |
| `communities`, `community_members` | Uitnodigingen, groepslidmaatschap en rollen |
| `learners` (als een ouder meerdere kinderen toevoegt) | Een eigen bijnaam en voortgang per leerling onder het ouderaccount |
| `challenges` | Oefening, niveau, woordpakket, vraagseed en tijdvenster |
| `challenge_runs`, `challenge_answers` | Serverbeoordeelde rondes, antwoorden en duur |
| `achievements`, `user_achievements` | Badge-definities en unieke toekenningen |
| `word_sets` | Door de leraar gedeelde lijsten met leerjaar, thema en herkomst |
| `leaderboard_entries` | Gecontroleerde aggregaten per event en club |

Gebruik Supabase Edge Functions voor starten, antwoorden insturen en afronden. De server bepaalt correcte antwoorden, beoordeelt scores en kent badges toe. Vraag niet om betrouwbare scores van de browser. Beperk lezen tot clubleden, schrijven tot de eigenaar of organisator, en laat deelnemer-ID’s door de server uit de ingelogde gebruiker afleiden. Een leaderboard-view mag rijbeveiliging niet omzeilen.

Antwoordsleutels horen in een niet-blootgesteld schema. Zet rijbeveiliging en passende grants op de bereikbare tabellen. De browser mag geen wedstrijdscores, badge-toekenningen of clubrollen zelf schrijven. Gebruik unieke constraints voor badge-toekenningen en idempotente antwoordregistratie, en indexeer clublidmaatschappen en eventresultaten op de kolommen die de toegang en ranglijsten bepalen. Een gedeelde view gebruikt `security_invoker = true` of wordt alleen via gecontroleerde serverlogica ontsloten.

Technische referenties:

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/functions/auth

## Aanbevolen volgorde

1. Persoonlijke XP, avatar en badges.
2. Privéclub met een coöperatieve weekmissie.
3. Gecontroleerde challenges met een wekelijkse ranglijst en een bord voor vooruitgang.
4. Pas daarna live wedstrijden of kampioenschappen.
