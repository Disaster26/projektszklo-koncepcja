# Buduje index.html z src.html: znak Wylinki (oficjalny fragment), tafle pierwszego ekranu, karty usług, pas realizacji.
# Treści i zdjęcia z projektszklo.pl (sprawdzone 21.11.2026). Wybór zdjęć: Odrobimy_kampania/klienci/ProjektSzklo/_src/sel.json
import html as H, json
SEL = json.load(open(r'C:\Users\Admin\Downloads\Odrobimy_kampania\klienci\ProjektSzklo\_src\sel.json', encoding='utf-8'))
META = SEL['meta']
s = open('src.html', encoding='utf-8').read()
s = s.replace('{{BADGE_STYLE}}', open('badge_style.part', encoding='utf-8').read().replace('<style>', '').replace('</style>', '').strip())
s = s.replace('{{BADGE_LINK}}', open('badge_link.part', encoding='utf-8').read().strip())

def sl(n): return META[n][0]
def poziome(n): w, h = META[n][1]; return w > h

USL = [
    ('kabiny', 'Kabiny prysznicowe', 'Szkło przezroczyste, optiwhite, satynowe, piaskowane albo z grafiką. Na życzenie powłoka hydrofobowa.', 'Kabina prysznicowa ze szkła hartowanego'),
    ('walkin', 'Ścianki walk-in', 'Hartowane szkło 8 mm, wymiary od 60 do 300 cm, montaż przy płytkach, bez progu.', 'Szklana ścianka prysznicowa walk-in'),
    ('parawany', 'Parawany nawannowe', 'Szkło hartowane na wymiar wanny. Prysznic w wannie bez zalewania podłogi.', 'Szklany parawan nawannowy'),
    ('drzwi', 'Drzwi i zabudowy loftowe', 'Przesuwne lub uchylne. Szynę montujemy do nadproża, sufitu albo ściany.', 'Szklane drzwi loftowe w czarnej ramie'),
    ('zabudowy', 'Zabudowy całoszklane', 'Ścianki działowe, sale konferencyjne, łazienka w sypialni. Opcjonalnie folia, która po włączeniu daje efekt mlecznej szyby.', 'Zabudowa całoszklana'),
    ('lustra', 'Lustra na wymiar', 'Srebrne, brązowe, grafitowe i optiwhite. Szlif C-kant albo faza 5-30 mm, do 300 cm.', 'Lustro na wymiar'),
    ('balustrady', 'Balustrady szklane', 'Hartowane 10 i 12 mm lub laminowane 2 x 6 i 2 x 8 mm. Samonośne albo z wypełnieniem.', 'Szklana balustrada'),
    ('grafika', 'Szkło z grafiką', 'Dowolna grafika na szkle optiwhite lub float 4-6 mm, do 300 cm długości.', 'Szkło z nadrukiem grafiki'),
    ('kuchnia', 'Panele szklane do kuchni', 'Szkło lakierowane Lacobel w dowolnym kolorze albo panel z nadrukiem, 4-6 mm, do 300 cm.', 'Szklany panel w kuchni nad blatem'),
    ('akwaria', 'Akwaria na zamówienie', 'Szkło float lub optiwhite, dowolne wymiary i kształt, także w zabudowie.', 'Akwarium ze szkła na zamówienie'),
]

def karta(k, tyt, opis, alt):
    ims = SEL['cards'][k]; n = len(ims); zd = []
    for i, im in enumerate(ims):
        a = alt + ('' if i == 0 else f', zdjęcie {i+1}')
        src = 'src' if i == 0 else 'data-src'
        zd.append(f'<button class="zd" type="button" data-lb="img/{sl(im)}-l.webp" aria-label="Powiększ: {H.escape(tyt)}, zdjęcie {i+1} z {n}">'
                  f'<img {src}="img/{sl(im)}-c.webp" width="600" height="800" loading="lazy" decoding="async" alt="{H.escape(a)}"></button>')
    kropki = ''.join(f'<i{" class=on" if i == 0 else ""}></i>' for i in range(n))
    return (f'<article class="usl" id="u-{k}">\n<div class="gal" data-grupa><div class="gt">{"".join(zd)}</div>'
            f'<span class="gs"><button type="button" class="gp" aria-label="Poprzednie zdjęcie"></button><button type="button" class="gn" aria-label="Następne zdjęcie"></button></span>'
            f'<div class="kr" aria-hidden="true">{kropki}</div></div>\n'
            f'<div class="ut"><h3>{H.escape(tyt)}</h3><p>{H.escape(opis)}</p>'
            f'<a class="uw" href="#wycena" data-rodzaj="{H.escape(tyt)}">Zapytaj o wycenę</a></div>\n</article>')

s = s.replace('{{USLUGI}}', '\n'.join(karta(*u) for u in USL))

KAT = {'lazienki': 'Kabina, ścianka walk-in lub parawan', 'drzwi': 'Drzwi lub zabudowa szklana', 'lustra': 'Lustro na wymiar',
       'balustrady': 'Balustrada szklana', 'grafika': 'Szkło z grafiką'}
pas = []
for k, ims in SEL['strip'].items():
    for im in ims:
        pas.append(f'<button class="rk" type="button" data-k="{k}" data-lb="img/{sl(im)}-l.webp" aria-label="Powiększ zdjęcie: {KAT[k]}">'
                   f'<img src="img/{sl(im)}-c.webp" width="600" height="800" loading="lazy" decoding="async" alt="{KAT[k]}, realizacja Projekt Szkło w Warszawie"></button>')
# przeplot kategorii w widoku "Wszystkie" - zamiast blokami
import itertools
grupy = {}
for p in pas: grupy.setdefault(p.split('data-k="')[1].split('"')[0], []).append(p)
mix = [x for t in itertools.zip_longest(*grupy.values()) for x in t if x]
s = s.replace('{{PAS}}', '\n'.join(mix))
s = s.replace('{{ILE}}', str(len(mix)))

HALT = ['Szklane drzwi loftowe w czarnej ramie', 'Lustro z podświetleniem LED w łazience', 'Szklana balustrada schodów',
        'Panel szklany z grafiką drzewa w łazience', 'Ścianka walk-in w łazience']
tafle = []
for i, im in enumerate(SEL['hero']):
    lp = 'fetchpriority="high"' if i == 2 else 'loading="eager"'
    obr = '<svg class="obr" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0.5,0.5 99.5,4 99.5,99.5 0.5,96" vector-effect="non-scaling-stroke"/></svg>'
    tafle.append(f'<figure class="tafla t{i+1}">{obr}<img src="img/{sl(im)}-h.webp" '
                 f'width="500" height="1000" {lp} decoding="async" alt="{HALT[i]}"></figure>')
s = s.replace('{{TAFLE}}', '\n'.join(tafle))
s = s.replace('{{HERO_PRELOAD}}', f'img/{sl(SEL["hero"][2])}')
assert '{{' not in s, s[s.index('{{'):s.index('{{')+40]
open('index.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
