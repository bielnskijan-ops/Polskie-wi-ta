-- ============================================================================
-- Polskie Święta — Dane katalogu dla tabeli public.products w Supabase
-- Bezpiecznie dezaktywuje poprzednie produkty testowe (nie łamiąc FK w order_items)
-- i zapisuje 7 aktualnych produktów z dopasowanymi zdjęciami.
-- ============================================================================

update public.products
   set is_active = false
 where sku not in (
   'PS-KAR-001',
   'PS-BIG-002',
   'PS-MAN-003',
   'PS-MIK-004',
   'PS-PIE-005',
   'PS-MIS-006',
   'PS-WUJ-007'
 );

insert into public.products (
  slug,
  sku,
  name,
  category,
  price_pln,
  short_description,
  description,
  image_url,
  stock,
  variants,
  specs,
  is_active
)
values
  (
    'karp-w-wannie',
    'PS-KAR-001',
    'Karp w wannie',
    'Tradycje',
    10.00,
    'Klasyczny przedświąteczny lokator emaliowanej wanny z korkiem na łańcuszku.',
    'Autentyczna tradycja polskich lat dziewięćdziesiątych i współczesnych wspomnień wigilijnych. Żywy, spokojny karp pływający w chłodnej wodzie łazienkowej, zanim cała rodzina zacznie negocjować, kto wejdzie pod prysznic.',
    '/assets/aistudio/image_f9e9112f.png',
    15,
    '["Król wanny (1,8 kg)", "Okaz królewski (2,4 kg)"]'::jsonb,
    '[
      {"label": "Środowisko", "value": "Woda z kranu, temperatura pokojowa"},
      {"label": "Termin przydatności", "value": "Do pierwszej gwiazdki"},
      {"label": "W zestawie", "value": "Korek na łańcuszku (wanna własna)"},
      {"label": "Pochodzenie", "value": "Stawy Milickie"}
    ]'::jsonb,
    true
  ),
  (
    'garnek-bigosu',
    'PS-BIG-002',
    'Garnek bigosu',
    'Potrawy',
    45.00,
    'Stalowy gar pełen wielokrotnie odgrzewanego bigosu na święta i po świętach.',
    'Masywny garnek staropolskiego bigosu z kiszonej kapusty, suszonych grzybów leśnych, śliwki wędzonej i solidnej porcji kiełbasy. Smakuje coraz lepiej z każdym kolejnym dniem aż do Sylwestra.',
    '/assets/aistudio/image_e73f22cf.png',
    12,
    '["Garnek 5 litrów", "Garnek rodzinny 8 litrów"]'::jsonb,
    '[
      {"label": "Pojemność", "value": "5 l lub 8 l w stali nierdzewnej"},
      {"label": "Składniki", "value": "Kapusta kiszona, grzyby, śliwki, boczek"},
      {"label": "Liczba odgrzań", "value": "Minimum 4 przed wydaniem"},
      {"label": "W zestawie", "value": "Chochla do mieszania pod choinką"}
    ]'::jsonb,
    true
  ),
  (
    'wor-mandarynek',
    'PS-MAN-003',
    'Wór mandarynek',
    'Słodycze i owoce',
    22.00,
    'Siatka pachnących, słodkich mandarynek w ilości wystarczającej na cały grudzień.',
    'Słynny świąteczny wór cytrusów, którego aromat natychmiast wypełnia cały pokój obok choinki. Skórki łatwo odchodzą, a pestek jest dokładnie tyle, żeby wywołać rodzinną rywalizację.',
    '/assets/aistudio/image_a13f15f0.png',
    30,
    '["Siatka 3 kg", "Wór świąteczny 5 kg"]'::jsonb,
    '[
      {"label": "Waga netto", "value": "3 kg lub 5 kg"},
      {"label": "Zapach", "value": "Intensywnie bożonarodzeniowy"},
      {"label": "Obieralność", "value": "Wysoka, jednym ruchem"},
      {"label": "Przechowywanie", "value": "Balkon lub parapet"}
    ]'::jsonb,
    true
  ),
  (
    'czekoladowy-mikolaj',
    'PS-MIK-004',
    'Czekoladowy Mikołaj',
    'Słodycze i owoce',
    12.00,
    'Pusty w środku figurkowy Mikołaj w błyszczącej czerwono-złotej folii.',
    'Kultowa figurka Mikołaja w szeleszczącym sreberku z workiem pełnym zabawek i misiem na nadruku. Najpierw służy jako ozdoba pod choinką, a potem chrupie przy rozpakowywaniu prezentów.',
    '/assets/aistudio/image_c1e89dcb.png',
    48,
    '["Figurka 90 g", "Dwupak pod poduszkę"]'::jsonb,
    '[
      {"label": "Masa netto", "value": "90 g wyrobu czekoladopodobnego"},
      {"label": "Wypełnienie", "value": "Tradycyjnie puste w środku"},
      {"label": "Opakowanie", "value": "Folia aluminiowa z nadrukiem Mikołaja"},
      {"label": "Okazja", "value": "Mikołajki i paczka pod choinkę"}
    ]'::jsonb,
    true
  ),
  (
    'pierogi-babci-z-kapusta-i-grzybami',
    'PS-PIE-005',
    'Pierogi babci z kapustą i grzybami',
    'Potrawy',
    35.00,
    'Półmisek ręcznie lepionych pierogów z rumianą cebulką prosto na Wigilię.',
    'Cienkie, miękkie ciasto skrywające hojną porcję dobrze przyprawionej kapusty kiszonej i aromatycznych prawdziwków, polane podsmażoną złocistą cebulką. Lepione ręcznie z falbanką na brzegu.',
    '/assets/aistudio/image_4bbb373b.png',
    20,
    '["20 sztuk na półmisku", "40 sztuk (zapas na pierwszy dzień świąt)"]'::jsonb,
    '[
      {"label": "Liczba sztuk", "value": "20 lub 40 pierogów"},
      {"label": "Farsz", "value": "Kapusta kiszona i suszone grzyby leśne"},
      {"label": "Okrasa", "value": "Złocista cebulka smażona na maśle"},
      {"label": "Podanie", "value": "Na szklanym półmisku wigilijnym"}
    ]'::jsonb,
    true
  ),
  (
    'miska-do-salatki-jarzynowej',
    'PS-MIS-006',
    'Miska do sałatki jarzynowej',
    'Wyposażenie',
    18.00,
    'Beżowa, pojemna miska z tworzywa do mieszania kilogramów sałatki z majonezem.',
    'Niezastąpiona miska kuchenna w klasycznym kremowym kolorze, bez której nie powstanie żadna świąteczna sałatka jarzynowa. Mieści jednocześnie osiem jajek na twardo, groszek, ogórki, marchewkę i cały słoik majonezu.',
    '/assets/aistudio/image_1bfdbe5c.png',
    25,
    '["Pojemność 4 l (standard)", "Pojemność 6 l (rodzinna)"]'::jsonb,
    '[
      {"label": "Pojemność", "value": "4 l lub 6 l"},
      {"label": "Materiał", "value": "Wytrzymałe tworzywo spożywcze"},
      {"label": "Kolor", "value": "Kremowy / klasyczny beż"},
      {"label": "Zastosowanie", "value": "Sałatka jarzynowa, faworki, sernik na zimno"}
    ]'::jsonb,
    true
  ),
  (
    'rozmowa-z-nietrzezwym-wujkiem',
    'PS-WUJ-007',
    'Rozmowa z nietrzeźwym wujkiem',
    'Atrakcje',
    5.00,
    'Niezapomniana wymiana zdań przy stole o polityce, życiu i „za moich czasów”.',
    'Pakiet autentycznego wigilijnego doświadczenia z wujkiem w rozpiętym kołnierzyku i krawacie w groszki. W cenie seria nieoczekiwanych toastów, trzy anegdoty z wojska i pytanie o to, kiedy w końcu zmienisz pracę albo weźmiesz ślub.',
    '/assets/aistudio/image_ad5ef2d4.png',
    99,
    '["Runda przy stole (15 min)", "Pełny wieczór z doklejką do kolędy"]'::jsonb,
    '[
      {"label": "Czas trwania", "value": "15 min lub do ostatniego kieliszka"},
      {"label": "Zakres tematów", "value": "Polityka, motoryzacja, ceny mieszkań"},
      {"label": "Rekwizyt", "value": "Kryształowy kieliszek i sałatka na talerzu"},
      {"label": "Poziom trudności", "value": "Wymaga anielskiej cierpliwości"}
    ]'::jsonb,
    true
  )
on conflict (sku) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  price_pln = excluded.price_pln,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  stock = excluded.stock,
  variants = excluded.variants,
  specs = excluded.specs,
  is_active = excluded.is_active;
