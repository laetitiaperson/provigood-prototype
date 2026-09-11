# Passer le site sur provigood.com

Le site est écrit avec des URLs absolues (`canonical`, `hreflang`, `og:url`,
`og:image`, les `@id` du JSON-LD, le sitemap et les liens de la page 404).
Sur GitHub Pages il vit sous `/provigood-prototype/` ; sur le vrai domaine il
sera à la racine. Passer de l'un à l'autre, c'est réécrire l'hôte **et**
retirer ce préfixe de chemin, dans environ 190 endroits.

`tools/set-domain.py` s'en charge. Il est idempotent et réversible : un
aller-retour rend des fichiers identiques au bit près.

---

## 1. Réécrire les URLs

```bash
cd ~/Documents/Claude/Projects/provigood-prototype

# voir les bases actuellement en place
python3 tools/set-domain.py

# simuler (n'écrit rien)
python3 tools/set-domain.py https://provigood.com

# appliquer
python3 tools/set-domain.py https://provigood.com --write
```

Choisir **une seule** forme et s'y tenir : `https://provigood.com` ou
`https://www.provigood.com`. Les deux servant le même contenu, mélanger les
deux crée exactement le problème de doublons qu'on vient d'éliminer.

## 2. Déclarer le domaine à GitHub Pages

Dans le dépôt, `Settings → Pages → Custom domain`, saisir le domaine. GitHub
crée alors un fichier `CNAME` à la racine — ne pas le supprimer, il est relu à
chaque déploiement.

Côté DNS, chez le registrar du domaine :

- **domaine nu** (`provigood.com`) : quatre enregistrements `A` vers les IP de
  GitHub Pages
- **sous-domaine** (`www.provigood.com`) : un `CNAME` vers
  `laetitiaperson.github.io`

Prendre les IP dans la documentation GitHub au moment de la manipulation
plutôt que dans un mémo : elles changent rarement, mais se tromper rend le
site injoignable.

Une fois le certificat émis (quelques minutes à 24 h), cocher **Enforce
HTTPS**.

## 3. Vérifier

```bash
D=https://provigood.com
curl -s -o /dev/null -w "%{http_code}\n" $D/en/          # 200
curl -s $D/sitemap.xml | grep -c '<loc>'                 # 15
curl -s $D/robots.txt | grep -i sitemap                  # pointe sur $D
curl -s $D/en/ | grep -o 'rel="canonical" href="[^"]*"'  # pointe sur $D
curl -s -o /dev/null -w "%{http_code}\n" $D/vn/          # 200
```

Toutes les URLs du sitemap doivent répondre 200 :

```bash
curl -s $D/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' \
  | while read u; do printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

## 4. Après la mise en ligne

- Déclarer le site dans la Google Search Console et y soumettre le sitemap.
- Le bandeau cookies enregistre le choix du visiteur mais ne l'applique pas :
  les iframes YouTube se chargent même après un refus. À corriger avant
  d'exposer le site à des visiteurs européens.
- Les images pèsent environ 12 Mo, sans conversion AVIF/WebP généralisée.
  C'est le principal levier de performance restant, surtout depuis le Vietnam.

## Revenir en arrière

```bash
python3 tools/set-domain.py https://laetitiaperson.github.io/provigood-prototype --write
```
