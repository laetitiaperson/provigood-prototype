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

**HTTP vers HTTPS.** Activer le certificat TLS (Let's Encrypt chez Gandi) et
forcer la redirection.

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

## 6. Après la mise en ligne

- Déclarer le site dans la Google Search Console et y soumettre le sitemap.

---

## Pour chaque mise à jour ultérieure

```bash
./tools/build-dist.sh     # puis téléverser le contenu de dist/
```

Le dépôt garde ses URLs GitHub ; seul `dist/` est réécrit pour le domaine.
`dist/` n'est pas versionné : c'est un produit de construction.
