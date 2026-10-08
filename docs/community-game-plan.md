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

## Eerlijke evenementen

Vergelijk alleen dezelfde oefening, leerjaar, niveau, invoermethode en woordlijst. Gebruik dezelfde vraagseed en hetzelfde aantal vragen. Handgeschreven dictees krijgen geen rangschikking op snelheid; herkenningsfouten en handmatige goedkeuringen tellen niet als geverifieerde wedstrijdantwoorden. Een ranglijst op nauwkeurigheid krijgt een minimumaantal beoordeelde vragen.

Voorbeelden: een **Winkelweek**, een **Bosdictee** en een **Patroontocht**. Een event heeft een vaste begin- en eindtijd, een doel en een zichtbaar badge-ontwerp. Een groepsfeed deelt behaalde badges en gezamenlijke mijlpalen, zonder vrije chat in de eerste versie.

## Benodigde serveronderdelen

De bestaande `exercise_attempts` zijn persoonlijke oefenregistraties die de browser schrijft. Ze zijn bruikbaar voor persoonlijke voortgang, maar bewijzen geen eerlijke wedstrijdscore. Maak openbare of gedeelde ranglijsten pas wanneer de server de antwoorden en rondes beoordeelt.

| Onderdeel | Doel |
| --- | --- |
| `communities`, `community_members` | Uitnodigingen, groepslidmaatschap en rollen |
| `challenges` | Oefening, niveau, woordpakket, vraagseed en tijdvenster |
| `challenge_runs`, `challenge_answers` | Serverbeoordeelde rondes, antwoorden en duur |
| `achievements`, `user_achievements` | Badge-definities en unieke toekenningen |
| `word_sets` | Door de leraar gedeelde lijsten met leerjaar, thema en herkomst |
| `leaderboard_entries` | Gecontroleerde aggregaten per event en club |

Gebruik Supabase Edge Functions voor starten, antwoorden insturen en afronden. De server bepaalt correcte antwoorden, beoordeelt scores en kent badges toe. Vraag niet om betrouwbare scores van de browser. Beperk lezen tot clubleden, schrijven tot de eigenaar of organisator, en laat deelnemer-ID’s door de server uit de ingelogde gebruiker afleiden. Een leaderboard-view mag rijbeveiliging niet omzeilen.

## Aanbevolen volgorde

1. Persoonlijke XP, avatar en badges.
2. Privéclub met een coöperatieve weekmissie.
3. Gecontroleerde challenges met een wekelijkse ranglijst en een bord voor vooruitgang.
4. Pas daarna live wedstrijden of kampioenschappen.
