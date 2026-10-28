/* Projekt-Reiniger Pro — Wortlisten für die gefühlten Metadaten (Stufe 3).
 *
 * Reine Daten, kein DOM, kein Netz. Gehört zum Kern (reiniger-kern.js importiert
 * diese Datei) und wandert mit ihm byte-1:1 in die Familienakte.
 *
 * Grundsatz: lieber eine Stadt zu wenig als hundert falsche Funde im Code. Wörter,
 * die auch etwas anderes heißen („Essen“, „Halle“, „Siegen“, „Zug“), stehen in
 * STAEDTE_MEHRDEUTIG und zählen nur mit Zusammenhang (in/aus/nach …, PLZ davor).
 * Die Listen sind nicht vollständig — was fehlt, wird nicht gefunden.
 */

const w = (s) => s.trim().split(/\s*\|\s*/);

/* Städte, deren Name kaum etwas anderes heißt (D ab etwa 40 000 Einwohnern, dazu A, CH, L, Südtirol). */
export const STAEDTE_SICHER = w(`
Berlin|Hamburg|München|Köln|Frankfurt|Stuttgart|Düsseldorf|Leipzig|Dortmund|Bremen|Dresden|Hannover|Nürnberg|
Duisburg|Bochum|Wuppertal|Bielefeld|Bonn|Münster|Mannheim|Karlsruhe|Augsburg|Wiesbaden|Mönchengladbach|Gelsenkirchen|
Aachen|Braunschweig|Kiel|Chemnitz|Magdeburg|Freiburg|Krefeld|Mainz|Lübeck|Erfurt|Oberhausen|Rostock|Kassel|Potsdam|
Saarbrücken|Ludwigshafen|Oldenburg|Leverkusen|Osnabrück|Solingen|Heidelberg|Darmstadt|Herne|Neuss|Regensburg|Paderborn|
Ingolstadt|Offenbach|Würzburg|Fürth|Heilbronn|Ulm|Pforzheim|Wolfsburg|Göttingen|Bottrop|Reutlingen|Koblenz|Bremerhaven|
Recklinghausen|Bergisch Gladbach|Jena|Remscheid|Salzgitter|Moers|Siegburg|Hildesheim|Cottbus|Kaiserslautern|Gütersloh|
Schwerin|Witten|Iserlohn|Zwickau|Düren|Esslingen|Ratingen|Tübingen|Flensburg|Lünen|Villingen-Schwenningen|Konstanz|
Marl|Velbert|Minden|Neumünster|Dessau|Norderstedt|Delmenhorst|Viersen|Bamberg|Marburg|Rheine|Lüneburg|Wilhelmshaven|
Gladbeck|Troisdorf|Bayreuth|Dorsten|Detmold|Arnsberg|Castrop-Rauxel|Landshut|Brandenburg an der Havel|Bocholt|Aschaffenburg|
Celle|Kempten|Fulda|Aalen|Lippstadt|Dinslaken|Herford|Rüsselsheim|Kerpen|Sindelfingen|Weimar|Plauen|Neuwied|Dormagen|
Rosenheim|Grevenbroich|Bergheim|Friedrichshafen|Schwäbisch Gmünd|Garbsen|Wesel|Hürth|Offenburg|Stralsund|Greifswald|
Langenfeld|Unna|Euskirchen|Göppingen|Frankfurt (Oder)|Hameln|Stolberg|Görlitz|Sankt Augustin|Meerbusch|Waiblingen|
Baden-Baden|Pulheim|Hattingen|Eschweiler|Bad Homburg|Nordhorn|Ludwigsburg|Gießen|Wetzlar|Speyer|Elmshorn|Passau|
Freising|Erlangen|Trier|Hanau|Bad Salzuflen|Kleve|Ahlen|Menden|Emden|Wolfenbüttel|Peine|Cuxhaven|Neubrandenburg|Halberstadt|
Wismar|Stendal|Eisenach|Gotha|Suhl|Nordhausen|Bautzen|Freiberg|Pirna|Meißen|Dessau-Roßlau|Wittenberg|Lutherstadt Wittenberg|
Sylt|Westerland|Rügen|Usedom|Borkum|Norderney|Helgoland|Fehmarn|Garmisch-Partenkirchen|Berchtesgaden|Oberstdorf|
Wien|Graz|Linz|Salzburg|Innsbruck|Klagenfurt|Villach|Wels|Sankt Pölten|St. Pölten|Dornbirn|Wiener Neustadt|Steyr|
Feldkirch|Bregenz|Leoben|Krems|Traun|Amstetten|Kapfenberg|Lustenau|
Zürich|Genf|Basel|Lausanne|Bern|Winterthur|Luzern|St. Gallen|Lugano|Biel|Bienne|Thun|Köniz|La Chaux-de-Fonds|Schaffhausen|
Freiburg im Üechtland|Fribourg|Chur|Neuenburg|Neuchâtel|Vernier|Uster|Sitten|Sion|Emmen|Rapperswil|Davos|Zermatt|
Luxemburg|Esch-sur-Alzette|Bozen|Meran|Brixen|Vaduz
`);

/* Städte, deren Name auch ein Wort ist — nur mit Zusammenhang ein Ort. */
export const STAEDTE_MEHRDEUTIG = w(`
Essen|Halle|Hamm|Hagen|Siegen|Mülheim|Gera|Bergen|Zug|Baden|Hof|Lahr|Weil|Wesel|Zell|Kehl|Brühl|Werne|Worms|Goch|
Rheda|Ahaus|Emmen|Olten|Aarau|Wil|Horn|Steinfurt|Haltern|Bünde|Brakel|Laer|Zeitz|Eisenberg|Neustadt|Frankenthal|Landau|
Schwedt|Senden|Lohne|Selb|Velden|Ems
`);

/* Stadtteile großer Städte, die für sich schon einen Ort verraten. */
export const STADTTEILE = w(`
Altona|Eimsbüttel|Wandsbek|Harburg|Bergedorf|Blankenese|Barmbek|Winterhude|Eppendorf|Ottensen|St. Pauli|Wilhelmsburg|
Kreuzberg|Friedrichshain|Prenzlauer Berg|Neukölln|Charlottenburg|Schöneberg|Spandau|Pankow|Lichtenberg|Steglitz|Zehlendorf|
Wedding|Moabit|Köpenick|Marzahn|Hellersdorf|Reinickendorf|Tempelhof|
Schwabing|Haidhausen|Sendling|Bogenhausen|Pasing|Giesing|Maxvorstadt|Neuhausen|Nymphenburg|Trudering|
Ehrenfeld|Nippes|Deutz|Sülz|Lindenthal|Porz|Kalk|Bilk|Oberkassel|Benrath|Gohlis|Connewitz|Plagwitz|Neustadt-Süd|
Bad Cannstatt|Sachsenhausen|Bockenheim|Bornheim|Höchst|Ottakring|Favoriten|Floridsdorf|Döbling|Hietzing|Oerlikon|Altstetten
`);

/* Hochschulen: Kürzel, die für sich stehen (Großschreibung genau so). */
export const HOCHSCHUL_KUERZEL = w(`
RWTH|LMU|TUM|KIT|DHBW|HTWK|HTW|HAW|UdK|HHU|JGU|WWU|TUHH|HSU|HCU|BTU|ETH Zürich|ETH Zurich|EPFL|
WU Wien|TU Wien|TU Graz|JKU|HSG|ZHAW|FHNW|BFH|HSLU|OST|FHWS|THWS|HdM|PH Heidelberg|PH Freiburg|PH Ludwigsburg|
TU Berlin|TU Dresden|TU Darmstadt|TU Braunschweig|TU Dortmund|TU Chemnitz|TU Ilmenau|TU Kaiserslautern|TU Clausthal|
TU Bergakademie Freiberg|FU Berlin|HU Berlin|Charité|Leuphana|Bauhaus-Universität
`).filter((k) => k !== "OST" && k !== "KIT");   /* „OST“ und „KIT“ nur mit Zusammenhang (siehe Kern) */

/* Wörter, nach denen ein Hochschulname folgt. */
export const HOCHSCHUL_WORT = w(`
Universität|Universitaet|Uni|Hochschule|Fachhochschule|Technische Universität|Technische Hochschule|
Pädagogische Hochschule|Duale Hochschule|Kunsthochschule|Musikhochschule|Akademie|Berufsakademie|
University of|Universiteit|Université|Università|Universidad|College|Institute of Technology|
FH|TU|TH|HS|PH|Gymnasium|Gesamtschule|Realschule|Grundschule|Berufsschule|Berufskolleg|Oberschule|Kita|Kindergarten
`);

/* Firmenformen (Rechtsformen). Nach ihnen steht davor meist der Name der Firma. */
export const FIRMENFORMEN = w(`
GmbH & Co. KGaA|GmbH & Co. KG|GmbH & Co KG|UG (haftungsbeschränkt)|UG & Co. KG|AG & Co. KG|gGmbH|GmbH|mbH|AG|KGaA|KG|OHG|oHG|
GbR|PartG mbB|PartG|e.K.|e. K.|e.Kfm.|e.Kfr.|e.V.|e. V.|eG|UG|SE & Co. KG|
Ltd.|Ltd|LLC|L.L.C.|Inc.|Corp.|Corporation|PLC|plc|LLP|S.A.|S.à r.l.|SARL|S.r.l.|SRL|S.p.A.|B.V.|N.V.|
Sp. z o.o.|s.r.o.|ApS|A/S|Pty Ltd
`);

/* Firmen, die jeder kennt und die nichts über eine Person verraten (Lizenzen, Bibliotheken). */
export const FIRMEN_BEKANNT = new Set(w(`
Google|Google LLC|Microsoft|Microsoft Corporation|Apple|Apple Inc|Facebook|Facebook Inc|Meta|Meta Platforms|Amazon|
Amazon.com|Amazon Web Services|GitHub|GitHub Inc|Mozilla|Mozilla Foundation|Mozilla Corporation|OpenJS Foundation|
Node.js Foundation|Vercel|Vercel Inc|Netlify|Cloudflare|Twitter|X Corp|Oracle|Oracle Corporation|IBM|Intel|Intel Corporation|
Adobe|Adobe Inc|Adobe Systems|Adobe Systems Incorporated|JetBrains|JetBrains s.r.o.|Red Hat|Red Hat Inc|Canonical|Canonical Ltd|
Docker|Docker Inc|Atlassian|Stripe|Stripe Inc|PayPal|Shopify|Shopify Inc|Twilio|Salesforce|SAP|SAP SE|Siemens|Siemens AG|
Deutsche Telekom|Deutsche Telekom AG|Deutsche Bank|Deutsche Bank AG|Deutsche Post|Deutsche Post AG|Deutsche Bahn|Deutsche Bahn AG|
Volkswagen|Volkswagen AG|BMW|BMW AG|Mercedes-Benz|Mercedes-Benz AG|Allianz|Allianz SE|Bosch|Robert Bosch|Robert Bosch GmbH|
Anthropic|Anthropic PBC|OpenAI|Yandex|Alibaba|Tencent|Samsung|Sony|Nvidia|NVIDIA Corporation|Python Software Foundation|
Free Software Foundation|Free Software Foundation Inc|Apache Software Foundation|Eclipse Foundation|Linux Foundation|
The Linux Foundation|Sun Microsystems|Sun Microsystems Inc|Unicode|Unicode Inc|Fabrice Bellard|Mozilla Public License
`).map((s) => s.toLowerCase()));

/* Endungen deutscher Straßennamen (nur die eindeutigen — „-feld 3“ oder „-zeile 3“ wäre in Code meist keine Adresse). */
export const STRASSEN_ENDUNG = w(`
straße|strasse|str.|weg|gasse|allee|platz|damm|ufer|chaussee|steig|stieg|pfad|kamp|twiete|deich|promenade|landstraße|redder
`);

/* Kfz-Unterscheidungszeichen (D), die häufigsten. Ein Kennzeichen zählt nur mit einem davon. */
export const KFZ_KENNUNG = new Set(w(`
B|HH|M|K|F|S|D|DO|E|HB|DD|H|N|DU|BO|W|BI|BN|MS|MA|KA|A|WI|MG|GE|AC|BS|KI|C|MD|FR|KR|HL|EF|OB|HRO|KS|P|SB|LU|OL|LEV|OS|SG|
HD|DA|HER|NE|R|PB|IN|OF|WÜ|FÜ|HN|UL|PF|WOB|GÖ|BOT|RT|KO|HAM|HA|SI|MH|RE|GL|J|RS|SZ|MO|HI|CB|KL|GT|SN|EN|GER|MK|Z|DN|ES|
TÜ|FL|UN|KN|WES|PI|WF|LG|HG|BB|LB|TS|RO|FS|PA|ER|TR|HU|GI|WZ|SP|KH|LA|DEG|RV|BC|FN|GP|AA|HDH|RA|KÜN|SHA|TUT|VS|LÖ|EM|OG|
BAD|CW|PF|SÜW|DÜW|NW|KL|MZ|WO|AZ|BIN|NR|AK|EMS|WW|LM|HG|MTK|GG|FB|VB|HEF|KB|WAF|ST|COE|BOR|KLE|RD|SE|PI|OD|IZ|NMS|PLÖ|
OH|SL|NF|HEI|STD|CUX|OHZ|VER|ROW|WL|LG|UE|CE|GF|PE|SZ|NI|DH|OL|BRA|FRI|WTM|LER|AUR|EL|VEC|CLP|DH|NOH|HX|LIP|MI|PB|SO|
HSK|OE|SU|AW|EU|DN|BM|NE|VIE|KLE|WES|RE|COC|MYK|EMS|AK|NR|LL|STA|FFB|DAH|ED|EBE|TÖL|MB|RO|BGL|TS|AÖ|PAN|DGF|LA|KEH|
PAF|ND|EI|ROH|DON|DLG|NU|GZ|MN|OA|KE|LI|OAL|WM|GAP|LL|ERH|FO|BA|CO|KC|KU|HO|BT|WUN|TIR|NEW|AS|AM|SAD|CHA|REG|FRG|PA|
LDS|LOS|MOL|OHV|OPR|OSL|PM|PR|TF|UM|BAR|EE|SPN|HVL|LRO|VG|MSE|NWM|LUP|SK|BK|JL|HZ|MSH|SLK|SAW|ABI|BLK|WB|SDL|HAL|
L|LL|DL|MEI|FG|ERZ|V|PIR|BZ|GR|NOL|TO|MTL|ZI|EA|GTH|IK|WE|AP|SHK|SLF|SOK|SON|HBN|SM|NDH|KYF|UH|EIC|G|ABG|GRZ|SHL
`));

/* Vornamen (häufig in D/A/CH). Wörter mit zweiter Bedeutung fehlen absichtlich (August, Mark, Frank, Will, Rose …). */
export const VORNAMEN = new Set(w(`
Emma|Mia|Hannah|Hanna|Sofia|Sophia|Emilia|Lina|Marie|Lea|Leah|Lena|Clara|Klara|Ella|Luisa|Louisa|Leni|Mila|Ida|Frieda|
Lia|Anna|Lara|Johanna|Mathilda|Matilda|Charlotte|Amelie|Paula|Greta|Lotta|Nele|Pia|Laura|Sarah|Sara|Julia|Lisa|Katharina|
Sabine|Andrea|Petra|Claudia|Susanne|Nicole|Stefanie|Stephanie|Martina|Birgit|Monika|Ursula|Renate|Gabriele|Karin|Heike|
Anja|Silke|Melanie|Sandra|Kerstin|Tanja|Christina|Christine|Simone|Daniela|Yvonne|Jessica|Jennifer|Vanessa|Franziska|
Jana|Janina|Annika|Carina|Kathrin|Katrin|Jasmin|Nadine|Svenja|Bettina|Ingrid|Helga|Gisela|Elke|Erika|Hildegard|Inge|
Marlene|Emily|Isabella|Antonia|Theresa|Teresa|Magdalena|Elisa|Elena|Helena|Maja|Maya|Romy|Zoe|Ronja|Alina|Selina|
Noah|Leon|Paul|Ben|Finn|Fynn|Elias|Henry|Luis|Louis|Felix|Lukas|Lucas|Jonas|Emil|Theo|Anton|Liam|Matteo|Leo|Jakob|
Jacob|Moritz|Oskar|Oscar|Karl|Carl|Julian|Maximilian|Max|Niklas|Nico|Tim|Tom|Jan|Philipp|Alexander|David|Samuel|
Mats|Linus|Hannes|Johannes|Benjamin|Fabian|Florian|Tobias|Sebastian|Daniel|Michael|Thomas|Andreas|Stefan|Stephan|
Christian|Markus|Marcus|Martin|Peter|Wolfgang|Klaus|Jürgen|Dieter|Uwe|Bernd|Ralf|Rolf|Jörg|Torsten|Thorsten|Holger|
Matthias|Oliver|Dirk|Sven|Björn|Kai|Lars|Nils|Ole|Malte|Jannik|Yannick|Marvin|Kevin|Dennis|Patrick|Marco|Mario|Sascha|
Manuel|Dominik|Marcel|Pascal|Robin|Simon|Timo|Heinz|Horst|Helmut|Günter|Günther|Gerhard|Werner|Manfred|Hans|Joachim|
Rainer|Reinhard|Harald|Hartmut|Ulrich|Volker|Norbert|Detlef|Achim|Lothar|Konrad|Ludwig|Friedrich|Wilhelm|Heinrich|
Mohammed|Muhammad|Ahmed|Ali|Mehmet|Mustafa|Yusuf|Emre|Deniz|Elif|Ayşe|Fatma|Zeynep|Merve|Leyla|Aylin|
Olga|Natalia|Natalie|Tatjana|Svetlana|Irina|Dmitri|Sergej|Igor|Piotr|Katarzyna|Agnieszka|Tomasz|Jovana|Milan|Luka|
Giulia|Francesca|Marco|Lorenzo|Giovanni|Alessandro|Sofía|Lucía|Carlos|Javier|Pablo|Diego|João|Pedro|Ana|Inês|
Oliver|Harry|Jack|George|Charlie|Thomas|James|William|Olivia|Amelia|Isla|Ava|Ethan|Mason|Logan|Lucy|Chloe|Emily
`));

/* Vornamen, die auch Abkürzung oder Wort sind („Jan“ = Januar, „Max“ = Höchstwert): nur mit Nachnamen. */
export const VORNAMEN_NUR_PAAR = new Set(w(`Jan|Max|Leo|Kai|Ali|Ana|Ava|Ole|Ida|Can|Isla|Tom|Tim|Ben|Jack|Charlie|Harry|George|James|Mats|Ella`));

/* Wörter, die nach einem Vornamen KEIN Nachname sind (Oberflächen-Wörter). */
export const KEIN_NACHNAME = new Set(w(`
Width|Height|Length|Size|Value|Count|Age|Mean|Min|Max|Zoom|Speed|Depth|Score|Items|Lines|Level|Mode|Button|Name|Text|Label|Icon|Box|Item|List|Menu|Bar|Page|View|Card|Grid|
Breite|Höhe|Länge|Größe|Wert|Anzahl|Stufe|Knopf|Seite|Ansicht|Karte|Liste|Feld|Zeile|Spalte|Datei|Ordner|Version
`));
