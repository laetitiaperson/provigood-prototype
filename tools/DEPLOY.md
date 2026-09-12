# Mettre le site en ligne sur provigood.com

Hébergement : **Gandi**. Le dépôt reste sur GitHub pour l'historique, mais la
mise en ligne se fait par téléversement de fichiers, pas par `git push`.

**Adresse retenue : `https://provigood.com`, sans `www`** (décidé le
2026-09-11). C'est la valeur par défaut des deux scripts, rien à préciser.

---

## 1. Fabriquer le dossier à téléverser

```bash
cd ~/Documents/Claude/Projects/provigood-prototype
./tools/build-dist.sh
```

Cela produit `dist/` — environ 133 fichiers, 13 Mo — avec les URLs absolues
déjà pointées sur `provigood.com`.

**Ne jamais téléverser le dépôt entier.** Il contient `drafts/`, soit seize
pages françaises inachevées qui deviendraient publiques, plus `tools/` et
`docs/`. Le script les exclut et le confirme à chaque exécution :

```
✓ aucune URL GitHub
✓ drafts/ absent
✓ tools/ absent
```

Pour inspecter le résultat avant envoi, tel que le servira Gandi :

```bash
python3 -m http.server 8767 --directory dist
# puis http://localhost:8767/
```

## 2. Téléverser

En SFTP, déposer le **contenu** de `dist/` — et non le dossier lui-même — dans
la racine web de l'hébergement. C'est le dossier dont le contenu devient le
site public ; chez Gandi il s'appelle en général `htdocs`. Les fichiers placés
ailleurs ne sont pas servis.

À la fin, `index.html` doit se trouver directement à la racine web, et non
dans un sous-dossier `dist`.

## 3. Régler les deux redirections

**`www.provigood.com` vers `provigood.com`**, en 301. Sans cela, les deux
adresses servent le même contenu et Google y voit deux sites affichant la
même chose — du contenu dupliqué, à l'échelle du site entier.

**HTTP vers HTTPS.** Activer le certificat TLS (Let's Encrypt, gratuit)
dans l'espace Gandi, pour `provigood.com` et `www.provigood.com`. La
redirection elle-même est déjà dans le `.htaccess` : elle ne s'applique qu'à
`provigood.com`, donc une adresse de test Gandi sans certificat reste
accessible. Si après activation le navigateur signale « trop de
redirections », c'est que Gandi ne transmet pas l'en-tête
`X-Forwarded-Proto` : retirer le deuxième bloc `RewriteCond` / `RewriteRule`
du `.htaccess` et activer plutôt l'option de redirection HTTPS de Gandi.

**`www` vers `provigood.com`** : chez Gandi, `www` doit être un second site
de l'hébergement, avec sa propre racine web. Trois étapes :

1. DNS : `www` en CNAME vers `provigood.com.`
2. Hébergement → Sites → Créer un site : `www.provigood.com`, puis générer
   son certificat TLS gratuit.
3. Téléverser `tools/www-vhost/.htaccess` dans
   `vhosts/www.provigood.com/htdocs/.htaccess` : il redirige tout en 301
   vers `https://provigood.com`, en conservant le chemin.

**La racine `provigood.com/` vers `/en/`** : déjà réglée en 301 dans le
`.htaccess`, rien à faire.

## 4. Couper GitHub Pages

Une fois `provigood.com` en ligne : `Settings → Pages → Unpublish site`.

Sinon `laetitiaperson.github.io/provigood-prototype` continue de servir une
copie complète du site, en concurrence avec le vrai domaine. Le dépôt reste le
dépôt, seule la publication est désactivée.

## 5. Vérifier

```bash
D=https://provigood.com
curl -s -o /dev/null -w "%{http_code}\n" $D/en/          # 200
curl -s -o /dev/null -w "%{http_code}\n" $D/vn/          # 200
curl -s -o /dev/null -w "%{http_code}\n" $D/drafts/      # 404 attendu
curl -s $D/sitemap.xml | grep -c '<loc>'                 # 15
curl -s $D/robots.txt | grep -i sitemap                  # pointe sur $D
curl -s $D/en/ | grep -o 'rel="canonical" href="[^"]*"'  # pointe sur $D
curl -s -o /dev/null -w "%{http_code}\n" https://www.provigood.com  # 301
```

Redirection de la racine, page 404 et en-têtes de sécurité, réglés dans le
`.htaccess` :

```bash
curl -sI $D/ | grep -iE '^(HTTP|location)'                        # 301 vers /en/
curl -sI http://provigood.com/en/ | grep -iE '^(HTTP|location)'   # 301 vers https://provigood.com/en/
curl -sI https://www.provigood.com/ | grep -iE '^(HTTP|location)' # 301 vers https://provigood.com/
curl -s -o /dev/null -H 'Accept-Encoding: gzip' -w '%{size_download} octets\n' $D/styles.css  # compressé : bien moins que le fichier
curl -sI -H 'Accept-Encoding: gzip' $D/en/ | grep -i content-encoding  # gzip (ou br)
curl -s -o /dev/null -w "%{http_code}\n" $D/en/nexiste-pas.html   # 404
curl -s $D/en/nexiste-pas.html | grep -c 'Page not found'         # 1 : la page 404 du site
curl -sI $D/en/ | grep -ciE '^(strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|content-security)'  # 6
```

Si une vidéo ou un formulaire cesse de fonctionner, la console du navigateur
affiche un message « Content Security Policy » qui nomme l'adresse bloquée :
c'est elle qu'il faut ajouter à la ligne `Content-Security-Policy` du
`.htaccess`.

Toutes les URLs du sitemap doivent répondre 200 :

```bash
curl -s $D/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' \
  | while read u; do printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

**Formulaires.** Contact et Testimonial envoient les messages à
sales@provigood.com par `send-form.php`, un petit script PHP exécuté par
l'hébergement Gandi. Aucun service extérieur, aucun compte, aucune clé.

```bash
curl -s -X POST $D/send-form.php -H 'Content-Type: application/json' -d '{}'
# attendu : {"success":false}  (requête vide refusée, rien n'est envoyé)
# si la réponse commence par <?php, l'hébergement n'exécute pas le PHP
```

Puis envoyer un vrai message depuis `$D/en/contact.html` et vérifier qu'il
arrive dans sales@provigood.com — regarder les spams la première fois.
Tant que le site tourne ailleurs que sur Gandi (préversion GitHub, test en
local), les formulaires ouvrent la messagerie du visiteur à la place.

## 6. Prévenir les moteurs à chaque mise à jour (IndexNow)

La clé IndexNow est le fichier `a41c0ceddc140a51bb7e6251e1623b3a.txt` à la racine du dépôt ; il est
copié dans `dist/` et doit rester accessible à
`https://provigood.com/a41c0ceddc140a51bb7e6251e1623b3a.txt`. Les moteurs le lisent pour vérifier que
la demande vient bien du site.

Après chaque téléversement :

```bash
python3 tools/indexnow.py                       # toutes les URLs du sitemap
python3 tools/indexnow.py https://provigood.com/en/faq.html   # ou seulement celles qui changent
```

Réponse attendue : `200 OK` ou `202 Accepted`. Un `403` signifie que le
fichier clé n'est pas en ligne.

## 6. Après la mise en ligne

- Déclarer le site dans la Google Search Console et y soumettre le sitemap.

---

## Pour chaque mise à jour ultérieure

```bash
./tools/build-dist.sh     # puis téléverser le contenu de dist/
```

Le dépôt garde ses URLs GitHub ; seul `dist/` est réécrit pour le domaine.
`dist/` n'est pas versionné : c'est un produit de construction.
