import { DeliveryMethod, Product } from '../types/shop';

export const HERO_IMAGE_URL = '/src/assets/images/kitsch_xmas_hero_polish_1795621067905.jpg';

export const PAGE_BACKGROUND_IMAGE_URL =
  '/src/assets/images/kitsch_xmas_bg_wallpaper_1795621596812.jpg';

export const FESTIVE_AI_GALLERY = [
  {
    title: 'Święty Mikołaj z górą prezentów',
    caption: 'Złote kokardy, śnieżna zadymka i błyszcząca choinka w kiczowatym wydaniu AI.',
    imageUrl: '/src/assets/images/kitsch_xmas_santa_gifts_1795621068640.jpg',
  },
  {
    title: 'Lustrzane bombki i złoty łańcuch',
    caption: 'Szklane bombki, świeczki woskowe i cynamon prosto ze świątecznej pocztówki.',
    imageUrl: '/src/assets/images/kitsch_xmas_baubles_tinsel_1795621068501.jpg',
  },
  {
    title: 'Świecąca chatka z piernika',
    caption: 'Cukrowy lukier, laski cukrowe i złoty pył pod rozgwieżdżonym niebem.',
    imageUrl: '/src/assets/images/kitsch_xmas_gingerbread_cottage_1795621069302.jpg',
  },
  {
    title: 'Wigilijna uczta w złotym blasku',
    caption: 'Parujący barszcz z uszkami, pierogi, karp i opłatek w maksymalistycznej oprawie.',
    imageUrl: '/src/assets/images/kitsch_xmas_wigilia_feast_1795621597142.jpg',
  },
  {
    title: 'Sanie Mikołaja nad Zakopanem',
    caption: 'Biało-czerwone chorągiewki, góralskie chaty w Tatrach i wielka Gwiazda Betlejemska.',
    imageUrl: '/src/assets/images/kitsch_xmas_zakopane_sleigh_1795621597825.jpg',
  },
  {
    title: 'Aniołki i bałwanek na jarmarku',
    caption: 'Góralski kapelusz, zimne ognie i złote skrzydła na zaśnieżonym polskim rynku.',
    imageUrl: '/src/assets/images/kitsch_xmas_angel_market_1795621597925.jpg',
  },
] as const;

export const CATALOG_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    slug: 'karp-w-wannie',
    sku: 'PS-KAR-001',
    name: 'Karp w wannie',
    category: 'Tradycje',
    pricePln: 10,
    shortDescription: 'Klasyczny przedświąteczny lokator emaliowanej wanny z korkiem na łańcuszku.',
    description:
      'Autentyczna tradycja polskich lat dziewięćdziesiątych i współczesnych wspomnień wigilijnych. Żywy, spokojny karp pływający w chłodnej wodzie łazienkowej, zanim cała rodzina zacznie negocjować, kto wejdzie pod prysznic.',
    imageUrl: '/assets/aistudio/image_f9e9112f.png',
    stock: 15,
    variants: ['Król wanny (1,8 kg)', 'Okaz królewski (2,4 kg)'],
    specs: [
      { label: 'Środowisko', value: 'Woda z kranu, temperatura pokojowa' },
      { label: 'Termin przydatności', value: 'Do pierwszej gwiazdki' },
      { label: 'W zestawie', value: 'Korek na łańcuszku (wanna własna)' },
      { label: 'Pochodzenie', value: 'Stawy Milickie' },
    ],
  },
  {
    id: 'prod-02',
    slug: 'garnek-bigosu',
    sku: 'PS-BIG-002',
    name: 'Garnek bigosu',
    category: 'Potrawy',
    pricePln: 45,
    shortDescription: 'Stalowy gar pełen wielokrotnie odgrzewanego bigosu na święta i po świętach.',
    description:
      'Masywny garnek staropolskiego bigosu z kiszonej kapusty, suszonych grzybów leśnych, śliwki wędzonej i solidnej porcji kiełbasy. Smakuje coraz lepiej z każdym kolejnym dniem aż do Sylwestra.',
    imageUrl: '/assets/aistudio/image_e73f22cf.png',
    stock: 12,
    variants: ['Garnek 5 litrów', 'Garnek rodzinny 8 litrów'],
    specs: [
      { label: 'Pojemność', value: '5 l lub 8 l w stali nierdzewnej' },
      { label: 'Składniki', value: 'Kapusta kiszona, grzyby, śliwki, boczek' },
      { label: 'Liczba odgrzań', value: 'Minimum 4 przed wydaniem' },
      { label: 'W zestawie', value: 'Chochla do mieszania pod choinką' },
    ],
  },
  {
    id: 'prod-03',
    slug: 'wor-mandarynek',
    sku: 'PS-MAN-003',
    name: 'Wór mandarynek',
    category: 'Słodycze i owoce',
    pricePln: 22,
    shortDescription: 'Siatka pachnących, słodkich mandarynek w ilości wystarczającej na cały grudzień.',
    description:
      'Słynny świąteczny wór cytrusów, którego aromat natychmiast wypełnia cały pokój obok choinki. Skórki łatwo odchodzą, a pestek jest dokładnie tyle, żeby wywołać rodzinną rywalizację.',
    imageUrl: '/assets/aistudio/image_a13f15f0.png',
    stock: 30,
    variants: ['Siatka 3 kg', 'Wór świąteczny 5 kg'],
    specs: [
      { label: 'Waga netto', value: '3 kg lub 5 kg' },
      { label: 'Zapach', value: 'Intensywnie bożonarodzeniowy' },
      { label: 'Obieralność', value: 'Wysoka, jednym ruchem' },
      { label: 'Przechowywanie', value: 'Balkon lub parapet' },
    ],
  },
  {
    id: 'prod-04',
    slug: 'czekoladowy-mikolaj',
    sku: 'PS-MIK-004',
    name: 'Czekoladowy Mikołaj',
    category: 'Słodycze i owoce',
    pricePln: 12,
    shortDescription: 'Pusty w środku figurkowy Mikołaj w błyszczącej czerwono-złotej folii.',
    description:
      'Kultowa figurka Mikołaja w szeleszczącym sreberku z workiem pełnym zabawek i misiem na nadruku. Najpierw służy jako ozdoba pod choinką, a potem chrupie przy rozpakowywaniu prezentów.',
    imageUrl: '/assets/aistudio/image_c1e89dcb.png',
    stock: 48,
    variants: ['Figurka 90 g', 'Dwupak pod poduszkę'],
    specs: [
      { label: 'Masa netto', value: '90 g wyrobu czekoladopodobnego' },
      { label: 'Wypełnienie', value: 'Tradycyjnie puste w środku' },
      { label: 'Opakowanie', value: 'Folia aluminiowa z nadrukiem Mikołaja' },
      { label: 'Okazja', value: 'Mikołajki i paczka pod choinkę' },
    ],
  },
  {
    id: 'prod-05',
    slug: 'pierogi-babci-z-kapusta-i-grzybami',
    sku: 'PS-PIE-005',
    name: 'Pierogi babci z kapustą i grzybami',
    category: 'Potrawy',
    pricePln: 35,
    shortDescription: 'Półmisek ręcznie lepionych pierogów z rumianą cebulką prosto na Wigilię.',
    description:
      'Cienkie, miękkie ciasto skrywające hojną porcję dobrze przyprawionej kapusty kiszonej i aromatycznych prawdziwków, polane podsmażoną złocistą cebulką. Lepione ręcznie z falbanką na brzegu.',
    imageUrl: '/assets/aistudio/image_4bbb373b.png',
    stock: 20,
    variants: ['20 sztuk na półmisku', '40 sztuk (zapas na pierwszy dzień świąt)'],
    specs: [
      { label: 'Liczba sztuk', value: '20 lub 40 pierogów' },
      { label: 'Farsz', value: 'Kapusta kiszona i suszone grzyby leśne' },
      { label: 'Okrasa', value: 'Złocista cebulka smażona na maśle' },
      { label: 'Podanie', value: 'Na szklanym półmisku wigilijnym' },
    ],
  },
  {
    id: 'prod-06',
    slug: 'miska-do-salatki-jarzynowej',
    sku: 'PS-MIS-006',
    name: 'Miska do sałatki jarzynowej',
    category: 'Wyposażenie',
    pricePln: 18,
    shortDescription: 'Beżowa, pojemna miska z tworzywa do mieszania kilogramów sałatki z majonezem.',
    description:
      'Niezastąpiona miska kuchenna w klasycznym kremowym kolorze, bez której nie powstanie żadna świąteczna sałatka jarzynowa. Mieści jednocześnie osiem jajek na twardo, groszek, ogórki, marchewkę i cały słoik majonezu.',
    imageUrl: '/assets/aistudio/image_1bfdbe5c.png',
    stock: 25,
    variants: ['Pojemność 4 l (standard)', 'Pojemność 6 l (rodzinna)'],
    specs: [
      { label: 'Pojemność', value: '4 l lub 6 l' },
      { label: 'Materiał', value: 'Wytrzymałe tworzywo spożywcze' },
      { label: 'Kolor', value: 'Kremowy / klasyczny beż' },
      { label: 'Zastosowanie', value: 'Sałatka jarzynowa, faworki, sernik na zimno' },
    ],
  },
  {
    id: 'prod-07',
    slug: 'rozmowa-z-nietrzezwym-wujkiem',
    sku: 'PS-WUJ-007',
    name: 'Rozmowa z nietrzeźwym wujkiem',
    category: 'Atrakcje',
    pricePln: 5,
    shortDescription: 'Niezapomniana wymiana zdań przy stole o polityce, życiu i „za moich czasów”.',
    description:
      'Pakiet autentycznego wigilijnego doświadczenia z wujkiem w rozpiętym kołnierzyku i krawacie w groszki. W cenie seria nieoczekiwanych toastów, trzy anegdoty z wojska i pytanie o to, kiedy w końcu zmienisz pracę albo weźmiesz ślub.',
    imageUrl: '/assets/aistudio/image_ad5ef2d4.png',
    stock: 99,
    variants: ['Runda przy stole (15 min)', 'Pełny wieczór z doklejką do kolędy'],
    specs: [
      { label: 'Czas trwania', value: '15 min lub do ostatniego kieliszka' },
      { label: 'Zakres tematów', value: 'Polityka, motoryzacja, ceny mieszkań' },
      { label: 'Rekwizyt', value: 'Kryształowy kieliszek i sałatka na talerzu' },
      { label: 'Poziom trudności', value: 'Wymaga anielskiej cierpliwości' },
    ],
  },
];

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'paczkomat',
    label: 'Punkt odbioru / Automat paczkowy',
    description: 'Symulacja odbioru w wybranym automacie (1–2 dni robocze)',
    pricePln: 0,
  },
  {
    id: 'kurier',
    label: 'Kurier standardowy (Sanie Mikołaja)',
    description: 'Symulacja dostawy pod wskazany adres',
    pricePln: 15,
  },
  {
    id: 'atelier',
    label: 'Odbiór osobisty przy choince',
    description: 'Warszawa, ul. Mokotowska — bez opłat',
    pricePln: 0,
  },
];
